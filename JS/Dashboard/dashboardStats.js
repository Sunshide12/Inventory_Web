import { getDashboardStats, getEffectiveUserId } from "../Utils/cache.js";

export async function loadDashboardStats(userId) {
  try {
    const effectiveUserId = await getEffectiveUserId(userId);

    if (!effectiveUserId) {
      throw new Error("No se pudo determinar el usuario autenticado.");
    }

    // Use centralized cache - computes stats from cached products/categories
    const stats = await getDashboardStats(effectiveUserId);

    // Actualizar estadísticas en el DOM
    updateStatsCards({
      totalProducts: stats.totalProducts,
      availableProducts: stats.availableProducts,
      lowStockProducts: stats.lowStockProducts,
      totalValue: stats.totalValue,
      totalCategories: stats.totalCategories,
    });

    // Mostrar productos con stock bajo
    renderLowStockProducts(stats.lowStockItems);

    // Mostrar productos recientes
    renderRecentProducts(stats.recentProducts);

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

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-3">
        <i class="bi bi-check-circle-fill text-success"></i>
        <p class="mb-0 mt-2">Todos los productos tienen stock suficiente</p>
      </div>
    `;
    return;
  }

  // Use DocumentFragment for batched DOM updates
  const fragment = document.createDocumentFragment();

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
    fragment.appendChild(item);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}

function renderRecentProducts(products) {
  const container = document.getElementById("recentProductsList");
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-3">
        <i class="bi bi-inbox"></i>
        <p class="mb-0 mt-2">No hay productos aún</p>
      </div>
    `;
    return;
  }

  // Use DocumentFragment for batched DOM updates
  const fragment = document.createDocumentFragment();

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

    const stock = Number(product.stock) || 0;

    item.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>${product.name}</strong>
          <small class="d-block text-muted">Agregado: ${createdAt}</small>
        </div>
        <span class="badge ${stock > 0 ? 'bg-success' : 'bg-secondary'}">
          ${stock > 0 ? 'Disponible' : 'Agotado'}
        </span>
      </div>
    `;
    fragment.appendChild(item);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}
