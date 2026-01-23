// cache.js - Shared caching utilities for the application
import { supabase } from "../Config/supabaseClient.js";

// Global cache storage
let globalCache = {
  products: null,
  categories: null,
  userId: null,
  productsTimestamp: null,
  categoriesTimestamp: null,
};

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Cached user ID to avoid repeated auth calls
let cachedUserId = null;
let userIdPromise = null;

/**
 * Get the effective user ID with caching to avoid redundant auth calls
 * Uses a promise cache to prevent concurrent calls from making multiple requests
 */
export async function getEffectiveUserId(userId) {
  // If a userId is explicitly provided, use it
  if (userId) {
    cachedUserId = userId;
    return userId;
  }

  // If we have a cached userId, return it
  if (cachedUserId) {
    return cachedUserId;
  }

  // If there's already a pending request, wait for it
  if (userIdPromise) {
    return userIdPromise;
  }

  // Create a new promise for the user ID fetch
  userIdPromise = (async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      cachedUserId = data?.user?.id || null;
      return cachedUserId;
    } finally {
      userIdPromise = null;
    }
  })();

  return userIdPromise;
}

/**
 * Clear the cached user ID (call on logout)
 */
export function clearUserIdCache() {
  cachedUserId = null;
  userIdPromise = null;
}

/**
 * Check if cache is valid for a given type
 */
function isCacheValid(type, userId) {
  if (!globalCache[type] || globalCache.userId !== userId) {
    return false;
  }

  const timestamp = globalCache[`${type}Timestamp`];
  if (!timestamp) return false;

  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Get products from cache or fetch from database
 * Returns { products, categoriesMap } with only needed fields for display
 */
export async function getProducts(userId, forceReload = false) {
  const effectiveUserId = await getEffectiveUserId(userId);

  if (!forceReload && isCacheValid("products", effectiveUserId)) {
    return {
      products: globalCache.products,
      categoriesMap: globalCache.categoriesMap || new Map(),
      fromCache: true,
    };
  }

  // Fetch products with only necessary fields
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, description, price, stock, category_id, created_at")
    .eq("user_id", effectiveUserId)
    .order("id", { ascending: true });

  if (productsError) throw productsError;

  // Get unique category IDs
  const categoryIds = [
    ...new Set(products?.map((p) => p.category_id).filter(Boolean) || []),
  ];

  // Load categories if there are products with categories
  let categoriesMap = new Map();
  if (categoryIds.length > 0) {
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", effectiveUserId)
      .in("id", categoryIds);

    if (!categoriesError && categories) {
      categories.forEach((cat) => {
        categoriesMap.set(cat.id, cat.name);
      });
    }
  }

  // Update cache
  globalCache.products = products || [];
  globalCache.categoriesMap = categoriesMap;
  globalCache.userId = effectiveUserId;
  globalCache.productsTimestamp = Date.now();

  return {
    products: globalCache.products,
    categoriesMap,
    fromCache: false,
  };
}

/**
 * Get categories from cache or fetch from database
 */
export async function getCategories(userId, forceReload = false) {
  const effectiveUserId = await getEffectiveUserId(userId);

  if (!forceReload && isCacheValid("categories", effectiveUserId)) {
    return {
      categories: globalCache.categories,
      fromCache: true,
    };
  }

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, created_at")
    .eq("user_id", effectiveUserId)
    .order("name", { ascending: true });

  if (error) throw error;

  // Update cache
  globalCache.categories = categories || [];
  globalCache.userId = effectiveUserId;
  globalCache.categoriesTimestamp = Date.now();

  return {
    categories: globalCache.categories,
    fromCache: false,
  };
}

/**
 * Get dashboard stats computed from cached products
 * This avoids a separate database query for stats
 */
export async function getDashboardStats(userId) {
  const effectiveUserId = await getEffectiveUserId(userId);

  // Get products (uses cache if available)
  const { products } = await getProducts(effectiveUserId);

  // Get categories count
  const { categories } = await getCategories(effectiveUserId);

  // Calculate statistics in-memory
  const totalProducts = products?.length || 0;
  const availableProducts =
    products?.filter((p) => Number(p.stock) > 0).length || 0;
  const lowStockProducts =
    products?.filter((p) => {
      const stock = Number(p.stock) || 0;
      return stock > 0 && stock <= 5;
    }).length || 0;

  const totalValue =
    products?.reduce((sum, p) => {
      const price = Number(p.price) || 0;
      const stock = Number(p.stock) || 0;
      return sum + price * stock;
    }, 0) || 0;

  const totalCategories = categories?.length || 0;

  // Low stock items (top 5)
  const lowStockItems =
    products
      ?.filter((p) => {
        const stock = Number(p.stock) || 0;
        return stock > 0 && stock <= 5;
      })
      .sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0))
      .slice(0, 5) || [];

  // Recent products (last 5)
  const recentProducts =
    products
      ?.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      })
      .slice(0, 5) || [];

  return {
    totalProducts,
    availableProducts,
    lowStockProducts,
    totalValue,
    totalCategories,
    lowStockItems,
    recentProducts,
  };
}

/**
 * Invalidate products cache (call after CRUD operations)
 */
export function invalidateProductsCache() {
  globalCache.products = null;
  globalCache.categoriesMap = null;
  globalCache.productsTimestamp = null;
}

/**
 * Invalidate categories cache (call after CRUD operations)
 */
export function invalidateCategoriesCache() {
  globalCache.categories = null;
  globalCache.categoriesTimestamp = null;
}

/**
 * Invalidate all caches (call on logout or user change)
 */
export function invalidateAllCaches() {
  globalCache = {
    products: null,
    categories: null,
    userId: null,
    productsTimestamp: null,
    categoriesTimestamp: null,
  };
  clearUserIdCache();
}

/**
 * Update a single product in the cache (optimistic update)
 */
export function updateProductInCache(productId, updates) {
  if (!globalCache.products) return;

  const index = globalCache.products.findIndex(
    (p) => p.id === parseInt(productId, 10)
  );
  if (index !== -1) {
    globalCache.products[index] = {
      ...globalCache.products[index],
      ...updates,
    };
  }
}

/**
 * Remove a product from the cache
 */
export function removeProductFromCache(productId) {
  if (!globalCache.products) return;

  const index = globalCache.products.findIndex(
    (p) => p.id === parseInt(productId, 10)
  );
  if (index !== -1) {
    globalCache.products.splice(index, 1);
  }
}

/**
 * Add a product to the cache
 */
export function addProductToCache(product) {
  if (!globalCache.products) {
    globalCache.products = [];
  }
  globalCache.products.push(product);
}
