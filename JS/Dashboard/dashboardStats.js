import { supabase } from "../Config/supabaseClient.js";

async function getEffectiveUserId(userId) {
  if (userId) return userId;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user?.id || null;
}

export async function loadDashboardStats(userId) {
  try {
    const effectiveUserId = await getEffectiveUserId(userId);

    if (!effectiveUserId) {
      throw new Error("No se pudo determinar el usuario autenticado.");
    }

    // Cargar productos
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", effectiveUserId);

    if (productsError) throw productsError;

    // Cargar categorías
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", effectiveUserId);

    if (categoriesError) {
      console.warn("Error al cargar categorías para estadísticas:", categoriesError);
      // No lanzar error, solo continuar sin categorías
    }

    // Calcular estadísticas
    const totalProducts = products?.length || 0;
    const availableProducts = products?.filter(p => Number(p.stock) > 0).length || 0;
    const lowStockProducts = products?.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length || 0;
    
    // Calcular valor total: suma de (precio × stock) para cada producto
    // Asegurar que price y stock sean números
    const totalValue = products?.reduce((sum, p) => {
      const price = Number(p.price) || 0;
      const stock = Number(p.stock) || 0;
      const productValue = price * stock;
      return sum + productValue;
    }, 0) || 0;
    
    const totalCategories = categories?.length || 0;

    // Productos con stock bajo (para mostrar en alertas)
    const lowStockItems = products
      ?.filter(p => {
        const stock = Number(p.stock) || 0;
        return stock > 0 && stock <= 5;
      })
      .sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0))
      .slice(0, 5) || [];

    // Productos recientes (últimos 5)
    const recentProducts = products
      ?.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      })
      .slice(0, 5) || [];

    // Actualizar estadísticas en el DOM
    updateStatsCards({
      totalProducts,
      availableProducts,
      lowStockProducts,
      totalValue,
      totalCategories,
    });

    // Mostrar productos con stock bajo
    renderLowStockProducts(lowStockItems);

    // Mostrar productos recientes
    renderRecentProducts(recentProducts);

  } catch (err) {
    console.error("Error al cargar estadísticas del dashboard:", err);
  }
}

function updateStatsCards(stats) {
  const totalProductsEl = document.getElementById("totalProducts");
  const availableProductsEl = document.getElementById("availableProducts");
  const lowStockProductsEl = document.getElementById("lowStockProducts");
  const totalValueEl = document.getElementById("totalValue");
  const totalCategoriesEl = document.getElementById("totalCategories");

  if (totalProductsEl) {
    totalProductsEl.textContent = stats.totalProducts;
  }

  if (availableProductsEl) {
    availableProductsEl.textContent = stats.availableProducts;
  }

  if (lowStockProductsEl) {
    lowStockProductsEl.textContent = stats.lowStockProducts;
  }

  if (totalValueEl) {
    totalValueEl.textContent = `$${stats.totalValue.toFixed(2)}`;
  }

  if (totalCategoriesEl) {
    totalCategoriesEl.textContent = stats.totalCategories;
  }
}

function renderLowStockProducts(products) {
  const container = document.getElementById("lowStockProductsList");
  if (!container) return;

  container.innerHTML = "";

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-3">
        <i class="bi bi-check-circle-fill text-success"></i>
        <p class="mb-0 mt-2">Todos los productos tienen stock suficiente</p>
      </div>
    `;
    return;
  }

  products.forEach((product) => {
    const item = document.createElement("div");
    item.className = "alert-item";
    item.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>${product.name}</strong>
          <small class="d-block text-muted">Stock: ${Number(product.stock) || 0} unidades</small>
        </div>
        <span class="badge bg-warning">Stock Bajo</span>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderRecentProducts(products) {
  const container = document.getElementById("recentProductsList");
  if (!container) return;

  container.innerHTML = "";

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-3">
        <i class="bi bi-inbox"></i>
        <p class="mb-0 mt-2">No hay productos aún</p>
      </div>
    `;
    return;
  }

  products.forEach((product) => {
    const item = document.createElement("div");
    item.className = "recent-item";
    
    const createdAt = product.created_at
      ? new Date(product.created_at).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

    item.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>${product.name}</strong>
          <small class="d-block text-muted">Agregado: ${createdAt}</small>
        </div>
        <span class="badge ${(Number(product.stock) || 0) > 0 ? 'bg-success' : 'bg-secondary'}">
          ${(Number(product.stock) || 0) > 0 ? 'Disponible' : 'Agotado'}
        </span>
      </div>
    `;
    container.appendChild(item);
  });
}
