import { supabase } from "../Config/supabaseClient.js";

let productsUIInitialized = false;
let isLoadingProducts = false;
let productsCache = null; // Cache of loaded products
let productsCacheUserId = null; // User ID of the cache

function showAlert(type, message) {
  const isSuccess = type === "success";
  const alertEl = document.getElementById(isSuccess ? "successAlert" : "errorAlert");
  const msgEl = document.getElementById(isSuccess ? "successMessage" : "errorMessage");

  if (!alertEl || !msgEl) return;

  msgEl.textContent = message;
  alertEl.classList.add("show");
  alertEl.classList.remove("fade");

  window.setTimeout(() => {
    alertEl.classList.remove("show");
    alertEl.classList.add("fade");
  }, 3500);
}

async function getEffectiveUserId(userId) {
  if (userId) return userId;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user?.id || null;
}

function getBootstrapModalInstance(modalEl) {
  // Bootstrap 5 expone `bootstrap` global cuando usas el bundle
  const b = window.bootstrap;
  if (!b || !b.Modal) return null;
  return b.Modal.getInstance(modalEl) || new b.Modal(modalEl);
}

export async function loadProducts(userId, forceReload = false) {
  // Prevent multiple simultaneous calls
  if (isLoadingProducts) {
    console.log("Products are already loading, ignoring duplicate call");
    return;
  }

  try {
    const effectiveUserId = await getEffectiveUserId(userId);

    if (!effectiveUserId) {
      throw new Error("Could not determine authenticated user.");
    }

    // If there's valid cache and reload is not forced, use cache
    if (!forceReload && productsCache && productsCacheUserId === effectiveUserId) {
      const searchTerm = document.getElementById("searchInput")?.value || "";
      renderProducts(productsCache.products, productsCache.categoriesMap, searchTerm);
      return;
    }

    isLoadingProducts = true;

    // Load products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", effectiveUserId)
      .order("id", { ascending: true });

    if (productsError) throw productsError;

    const tbody = document.getElementById("productsTableBody");
    const emptyState = document.getElementById("emptyState");

    if (!tbody || !emptyState) {
      // If products DOM doesn't exist yet, do nothing
      return;
    }

    // Clear tbody completely before adding new elements
    tbody.innerHTML = "";

    if (!products || products.length === 0) {
      emptyState.style.display = "block";
      return;
    } else {
      emptyState.style.display = "none";
    }

    // Get unique category IDs
    const categoryIds = [...new Set(products.map(p => p.category_id).filter(Boolean))];
    
    // Load categories if there are products with categories
    let categoriesMap = new Map();
    if (categoryIds.length > 0) {
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .eq("user_id", effectiveUserId)
        .in("id", categoryIds);

      if (!categoriesError && categories) {
        categories.forEach(cat => {
          categoriesMap.set(cat.id, cat.name);
        });
      }
    }

    // Save to cache
    productsCache = {
      products,
      categoriesMap,
    };
    productsCacheUserId = effectiveUserId;

    // Render products (with search if there's an active term)
    const searchTerm = document.getElementById("searchInput")?.value || "";
    renderProducts(products, categoriesMap, searchTerm);

  } catch (err) {
    console.error("Error loading products:", err);
  } finally {
    isLoadingProducts = false;
  }
}

function renderProducts(products, categoriesMap, searchTerm = "") {
  const tbody = document.getElementById("productsTableBody");
  const emptyState = document.getElementById("emptyState");

  if (!tbody || !emptyState) {
    return;
  }

  // Clear tbody completely before adding new elements
  tbody.innerHTML = "";

  // Filter products according to search term
  let filteredProducts = products;
  if (searchTerm && searchTerm.trim() !== "") {
    const searchLower = searchTerm.toLowerCase().trim();
    filteredProducts = products.filter((product) => {
      const categoryName = product.category_id 
        ? (categoriesMap.get(product.category_id) || "Categoría no encontrada")
        : "Sin categoría";
      
      // Search in: ID, name, category, description
      return (
        String(product.id).includes(searchLower) ||
        product.name?.toLowerCase().includes(searchLower) ||
        categoryName.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    });
  }

  if (!filteredProducts || filteredProducts.length === 0) {
    emptyState.style.display = "block";
    // Update empty state message if there's an active search
    if (searchTerm && searchTerm.trim() !== "") {
      const emptyStateTitle = emptyState.querySelector("h3");
      const emptyStateText = emptyState.querySelector("p");
      if (emptyStateTitle) emptyStateTitle.textContent = "No products found";
      if (emptyStateText) emptyStateText.textContent = `No products match "${searchTerm}"`;
    } else {
      const emptyStateTitle = emptyState.querySelector("h3");
      const emptyStateText = emptyState.querySelector("p");
      if (emptyStateTitle) emptyStateTitle.textContent = "No products currently";
      if (emptyStateText) emptyStateText.textContent = "Start by adding your first product to inventory";
    }
    return;
  } else {
    emptyState.style.display = "none";
  }

  // Render filtered products with category names
  filteredProducts.forEach((product) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-product-id", product.id);
    
    // Get category name from map
    const categoryName = product.category_id 
      ? (categoriesMap.get(product.category_id) || "Category not found")
      : "No category";

    tr.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${categoryName}</td>
      <td class="stock-cell" data-product-id="${product.id}" data-current-stock="${product.stock}">
        <div class="d-flex align-items-center gap-2">
          <span class="stock-display">${product.stock}</span>
          <button class="btn btn-sm btn-warning btn-edit-stock" data-id="${product.id}" title="Editar stock">
            <i class="bi bi-pencil"></i>
          </button>
        </div>
        <div class="stock-edit-container d-none mt-2">
          <div class="d-flex align-items-center gap-2">
            <input type="number" class="stock-input form-control form-control-sm" min="0" value="${product.stock}" style="width: 100px;">
            <button class="btn btn-sm btn-success btn-save-stock" data-id="${product.id}">
              <i class="bi bi-check"></i>
            </button>
            <button class="btn btn-sm btn-secondary btn-cancel-stock" data-id="${product.id}">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
      </td>
      <td>$${product.price.toFixed(2)}</td>
      <td class="status-cell">${product.stock > 0 ? "Disponible" : "Agotado"}</td>
      <td>
        <button class="btn btn-sm btn-warning btn-edit" data-id="${product.id}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-delete" data-id="${product.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Function to invalidate cache (call after create/edit/delete)
export function invalidateProductsCache() {
  productsCache = null;
  productsCacheUserId = null;
}

async function loadCategories(userId) {
  try {
    const effectiveUserId = await getEffectiveUserId(userId);
    if (!effectiveUserId) return [];

    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", effectiveUserId)
      .order("name", { ascending: true });

    if (error) throw error;
    return categories || [];
  } catch (err) {
    console.error("Error loading categories:", err);
    return [];
  }
}

async function populateCategorySelect(userId) {
  const categoryEl = document.getElementById("productCategory");
  if (!categoryEl) return;

  // Clear existing options (except the first one)
  while (categoryEl.children.length > 1) {
    categoryEl.removeChild(categoryEl.lastChild);
  }

  const categories = await loadCategories(userId);

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categoryEl.appendChild(option);
  });
}

export function initProductsUI({ userId } = {}) {
  if (productsUIInitialized) return;
  productsUIInitialized = true;

  const form = document.getElementById("productForm");
  const modalEl = document.getElementById("productModal");

  if (!form || !modalEl) return;

  const nameEl = document.getElementById("productName");
  const categoryEl = document.getElementById("productCategory");
  const stockEl = document.getElementById("productStock");
  const priceEl = document.getElementById("productPrice");
  const descriptionEl = document.getElementById("productDescription");

  // Initialize search
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value;
      
      // Debounce: wait 300ms after user stops typing
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        // If there's cache, filter from cache
        if (productsCache && productsCacheUserId) {
          renderProducts(productsCache.products, productsCache.categoriesMap, searchTerm);
        } else {
          // If no cache, reload products
          loadProducts(userId, false);
        }
      }, 300);
    });

    // Also search on Enter key press
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const searchTerm = e.target.value;
        if (productsCache && productsCacheUserId) {
          renderProducts(productsCache.products, productsCache.categoriesMap, searchTerm);
        } else {
          loadProducts(userId, false);
        }
      }
    });
  }

  // Load categories when modal opens (always updated)
  modalEl.addEventListener("show.bs.modal", async () => {
    await populateCategorySelect(userId);
  });

  // Also listen when category modal closes to update the select
  const categoryModal = document.getElementById("categoryModal");
  if (categoryModal) {
    categoryModal.addEventListener("hidden.bs.modal", async () => {
      // If products modal is open, update the select
      // This ensures that if a category was created/edited, it appears in the select
      if (modalEl.classList.contains("show")) {
        await populateCategorySelect(userId);
      }
    });
  }

  // Event listeners for stock editing
  document.addEventListener("click", async (e) => {
    // Handle edit stock button click
    if (e.target.closest(".btn-edit-stock")) {
      const btn = e.target.closest(".btn-edit-stock");
      const productId = btn.getAttribute("data-id");
      const row = btn.closest("tr");
      const stockCell = row.querySelector(".stock-cell");
      const editContainer = stockCell.querySelector(".stock-edit-container");
      const stockInput = editContainer.querySelector(".stock-input");
      
      // Show edit container and hide display
      stockCell.querySelector(".d-flex").classList.add("d-none");
      editContainer.classList.remove("d-none");
      stockInput.focus();
      stockInput.select();
      return;
    }

    // Handle cancel stock edit button
    if (e.target.closest(".btn-cancel-stock")) {
      const btn = e.target.closest(".btn-cancel-stock");
      const row = btn.closest("tr");
      const stockCell = row.querySelector(".stock-cell");
      const editContainer = stockCell.querySelector(".stock-edit-container");
      const stockInput = editContainer.querySelector(".stock-input");
      const currentStock = parseInt(stockCell.getAttribute("data-current-stock"), 10);
      
      // Reset input value and hide edit container
      stockInput.value = currentStock;
      stockCell.querySelector(".d-flex").classList.remove("d-none");
      editContainer.classList.add("d-none");
      return;
    }

    // Handle save stock button
    if (e.target.closest(".btn-save-stock")) {
      const btn = e.target.closest(".btn-save-stock");
      const productId = btn.getAttribute("data-id");
      const row = btn.closest("tr");
      const stockCell = row.querySelector(".stock-cell");
      const editContainer = stockCell.querySelector(".stock-edit-container");
      const stockInput = editContainer.querySelector(".stock-input");
      const stockDisplay = stockCell.querySelector(".stock-display");
      const currentStock = parseInt(stockCell.getAttribute("data-current-stock"), 10);
      const newStock = parseInt(stockInput.value, 10);

      // Validate stock
      if (isNaN(newStock) || newStock < 0) {
        showAlert("error", "Stock inválido. Debe ser un número mayor o igual a 0.");
        stockInput.focus();
        return;
      }

      // If stock hasn't changed, just hide edit container
      if (newStock === currentStock) {
        stockCell.querySelector(".d-flex").classList.remove("d-none");
        editContainer.classList.add("d-none");
        return;
      }

      // Update stock in database
      try {
        const effectiveUserId = await getEffectiveUserId(userId);
        if (!effectiveUserId) throw new Error("No se pudo determinar el usuario autenticado.");

        const { error } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", productId)
          .eq("user_id", effectiveUserId);

        if (error) throw error;

        // Update display
        stockDisplay.textContent = newStock;
        stockCell.setAttribute("data-current-stock", newStock);
        stockCell.querySelector(".d-flex").classList.remove("d-none");
        editContainer.classList.add("d-none");

        // Update status column
        const statusCell = row.querySelector(".status-cell");
        if (statusCell) {
          statusCell.textContent = newStock > 0 ? "Disponible" : "Agotado";
        }
        
        // Update cache if it exists
        if (productsCache && productsCache.products) {
          const cachedProduct = productsCache.products.find(p => p.id === parseInt(productId, 10));
          if (cachedProduct) {
            cachedProduct.stock = newStock;
          }
        }

        showAlert("success", "Stock actualizado correctamente.");
        
        // Invalidate cache to ensure consistency
        invalidateProductsCache();
      } catch (err) {
        console.error("Error updating stock:", err);
        stockInput.value = currentStock;
        showAlert("error", err?.message || "No se pudo actualizar el stock.");
      }
      return;
    }
  });

  // Handle Enter key in stock input
  document.addEventListener("keydown", async (e) => {
    if (e.target.classList.contains("stock-input") && e.key === "Enter") {
      const stockInput = e.target;
      const row = stockInput.closest("tr");
      const saveBtn = row.querySelector(".btn-save-stock");
      if (saveBtn) {
        saveBtn.click();
      }
    }
    if (e.target.classList.contains("stock-input") && e.key === "Escape") {
      const stockInput = e.target;
      const row = stockInput.closest("tr");
      const cancelBtn = row.querySelector(".btn-cancel-stock");
      if (cancelBtn) {
        cancelBtn.click();
      }
    }
  });

  // Event listeners for edit and delete buttons
  document.addEventListener("click", async (e) => {
    if (e.target.closest(".btn-edit")) {
      const btn = e.target.closest(".btn-edit");
      const productId = btn.getAttribute("data-id");

      // Load product data for editing
      try {
        const effectiveUserId = await getEffectiveUserId(userId);
        if (!effectiveUserId) throw new Error("Could not determine authenticated user.");

        const { data: product, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .eq("user_id", effectiveUserId)
          .single();

        if (error) throw error;

        // Fill form with product data
        const hiddenId = document.getElementById("productId");
        if (hiddenId) hiddenId.value = product.id;
        if (nameEl) nameEl.value = product.name || "";
        if (stockEl) stockEl.value = product.stock || 0;
        if (priceEl) priceEl.value = product.price || 0;
        if (descriptionEl) descriptionEl.value = product.description || "";

        // Load categories and select the product's category
        await populateCategorySelect(userId);
        if (categoryEl && product.category_id) {
          categoryEl.value = product.category_id;
        }

        // Update modal title
        const modalTitle = document.getElementById("productModalLabel");
        if (modalTitle) {
          modalTitle.innerHTML = '<i class="bi bi-pencil-circle me-2"></i>Edit Product';
        }

        const modal = getBootstrapModalInstance(modalEl);
        if (modal) modal.show();
      } catch (err) {
        console.error("Error loading product:", err);
        showAlert("error", err?.message || "Could not load product.");
      }
    }

    if (e.target.closest(".btn-delete")) {
      const btn = e.target.closest(".btn-delete");
      const productId = btn.getAttribute("data-id");

      if (confirm("Are you sure you want to delete this product?")) {
        try {
          const effectiveUserId = await getEffectiveUserId(userId);
          if (!effectiveUserId) throw new Error("Could not determine authenticated user.");

          const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", productId)
            .eq("user_id", effectiveUserId);

          if (error) throw error;

          showAlert("success", "Product deleted successfully.");
          invalidateProductsCache();
          await loadProducts(effectiveUserId, true);
        } catch (err) {
          console.error("Error deleting product:", err);
          showAlert("error", err?.message || "Could not delete product.");
        }
      }
    }
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    form.reset();
    form.classList.remove("was-validated");
    const hiddenId = document.getElementById("productId");
    if (hiddenId) hiddenId.value = "";

    // Restore modal title
    const modalTitle = document.getElementById("productModalLabel");
    if (modalTitle) {
      modalTitle.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Add Product';
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    form.classList.add("was-validated");
    if (!form.checkValidity()) return;

    try {
      const effectiveUserId = await getEffectiveUserId(userId);
        if (!effectiveUserId) throw new Error("Could not determine authenticated user.");

      const name = (nameEl?.value || "").trim();
      const categoryId = categoryEl?.value ? Number.parseInt(categoryEl.value, 10) : null;
      const stock = Number.parseInt(stockEl?.value ?? "0", 10);
      const price = Number.parseFloat(priceEl?.value ?? "0");
      const description = (descriptionEl?.value || "").trim();

      if (!name) throw new Error("Product name is required.");
      if (Number.isNaN(stock) || stock < 0) throw new Error("Invalid stock.");
      if (Number.isNaN(price) || price < 0) throw new Error("Invalid price.");

      const hiddenId = document.getElementById("productId");
      const productId = hiddenId?.value;

      if (productId) {
        // Edit mode
        const { error } = await supabase
          .from("products")
          .update({
            name,
            category_id: categoryId || null,
            stock,
            price,
            description: description || null,
          })
          .eq("id", productId)
          .eq("user_id", effectiveUserId);

        if (error) throw error;
        showAlert("success", "Product updated successfully.");
      } else {
        // Create mode
        const payload = {
          user_id: effectiveUserId,
          name,
          category_id: categoryId || null,
          stock,
          price,
          description: description || null,
        };

        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        showAlert("success", "Product added successfully.");
      }

      // Close modal
      const modal = getBootstrapModalInstance(modalEl);
      if (modal) modal.hide();

      // Invalidate cache and reload table
      invalidateProductsCache();
      await loadProducts(effectiveUserId, true);
    } catch (err) {
      console.error("Error adding product:", err);
      showAlert("error", err?.message || "Could not add product.");
    }
  });
}