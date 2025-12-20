import { supabase } from "../Config/supabaseClient.js";

let categoriesUIInitialized = false;
let isLoadingCategories = false;
let categoriesCache = null; // Cache de categorías cargadas
let categoriesCacheUserId = null; // ID del usuario del cache

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
  const b = window.bootstrap;
  if (!b || !b.Modal) return null;
  return b.Modal.getInstance(modalEl) || new b.Modal(modalEl);
}

export async function loadCategories(userId, forceReload = false) {
  // Prevenir múltiples llamadas simultáneas
  if (isLoadingCategories) {
    console.log("Ya se está cargando categorías, ignorando llamada duplicada");
    return;
  }

  try {
    const effectiveUserId = await getEffectiveUserId(userId);

    if (!effectiveUserId) {
      throw new Error("No se pudo determinar el usuario autenticado.");
    }

    // Si hay cache válido y no se fuerza recarga, usar cache
    if (!forceReload && categoriesCache && categoriesCacheUserId === effectiveUserId) {
      renderCategories(categoriesCache);
      return;
    }

    isLoadingCategories = true;

    // Cargar categorías
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", effectiveUserId)
      .order("name", { ascending: true });

    if (error) throw error;

    const tbody = document.getElementById("categoriesTableBody");
    const emptyState = document.getElementById("categoriesEmptyState");

    if (!tbody || !emptyState) {
      // Si aún no existe el DOM de categorías, no hacemos nada
      return;
    }

    // Guardar en cache
    categoriesCache = categories;
    categoriesCacheUserId = effectiveUserId;

    // Renderizar categorías
    renderCategories(categories);

  } catch (err) {
    console.error("Error al cargar categorías:", err);
  } finally {
    isLoadingCategories = false;
  }
}

function renderCategories(categories) {
  const tbody = document.getElementById("categoriesTableBody");
  const emptyState = document.getElementById("categoriesEmptyState");

  if (!tbody || !emptyState) {
    return;
  }

  // Limpiar completamente el tbody antes de agregar nuevos elementos
  tbody.innerHTML = "";

  if (!categories || categories.length === 0) {
    emptyState.style.display = "block";
    return;
  } else {
    emptyState.style.display = "none";
  }

  // Renderizar categorías
  categories.forEach((category) => {
    const tr = document.createElement("tr");

    // Formatear fecha de creación
    const createdAt = category.created_at
      ? new Date(category.created_at).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

    tr.innerHTML = `
      <td>${category.id}</td>
      <td>${category.name}</td>
      <td>${createdAt}</td>
      <td>
        <button class="btn btn-sm btn-warning btn-edit-category" data-id="${category.id}" data-name="${category.name}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-delete-category" data-id="${category.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Función para invalidar el cache (llamar después de crear/editar/eliminar)
export function invalidateCategoriesCache() {
  categoriesCache = null;
  categoriesCacheUserId = null;
}

export function initCategoriesUI({ userId } = {}) {
  if (categoriesUIInitialized) return;
  categoriesUIInitialized = true;

  const form = document.getElementById("categoryForm");
  const modalEl = document.getElementById("categoryModal");

  if (!form || !modalEl) return;

  const nameEl = document.getElementById("categoryName");
  const modalTitle = document.getElementById("categoryModalLabel");

  // Cargar categorías cuando se abre el modal (para refrescar si se agregó una nueva)
  modalEl.addEventListener("show.bs.modal", async () => {
    const hiddenId = document.getElementById("categoryId");
    if (hiddenId && hiddenId.value) {
      // Modo edición
      modalTitle.innerHTML = '<i class="bi bi-pencil-circle me-2"></i>Editar Categoría';
    } else {
      // Modo creación
      modalTitle.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Agregar Categoría';
    }
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    form.reset();
    form.classList.remove("was-validated");
    const hiddenId = document.getElementById("categoryId");
    if (hiddenId) hiddenId.value = "";
  });

  // Event listeners para botones de editar
  document.addEventListener("click", async (e) => {
    if (e.target.closest(".btn-edit-category")) {
      const btn = e.target.closest(".btn-edit-category");
      const categoryId = btn.getAttribute("data-id");
      const categoryName = btn.getAttribute("data-name");

      const hiddenId = document.getElementById("categoryId");
      if (hiddenId) hiddenId.value = categoryId;
      if (nameEl) nameEl.value = categoryName;

      const modal = getBootstrapModalInstance(modalEl);
      if (modal) modal.show();
    }

    if (e.target.closest(".btn-delete-category")) {
      const btn = e.target.closest(".btn-delete-category");
      const categoryId = btn.getAttribute("data-id");

      if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
        try {
          const effectiveUserId = await getEffectiveUserId(userId);
          if (!effectiveUserId) throw new Error("No se pudo determinar el usuario autenticado.");

          const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", categoryId)
            .eq("user_id", effectiveUserId);

          if (error) throw error;

          showAlert("success", "Categoría eliminada correctamente.");
          await loadCategories(effectiveUserId);
        } catch (err) {
          console.error("Error al eliminar categoría:", err);
          showAlert("error", err?.message || "No se pudo eliminar la categoría.");
        }
      }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    form.classList.add("was-validated");
    if (!form.checkValidity()) return;

    try {
      const effectiveUserId = await getEffectiveUserId(userId);
      if (!effectiveUserId) throw new Error("No se pudo determinar el usuario autenticado.");

      const name = (nameEl?.value || "").trim();
      const hiddenId = document.getElementById("categoryId");
      const categoryId = hiddenId?.value;

      if (!name) throw new Error("El nombre de la categoría es obligatorio.");

      if (categoryId) {
        // Modo edición
        const { error } = await supabase
          .from("categories")
          .update({ name })
          .eq("id", categoryId)
          .eq("user_id", effectiveUserId);

        if (error) throw error;
        showAlert("success", "Categoría actualizada correctamente.");
      } else {
        // Modo creación
        const payload = {
          user_id: effectiveUserId,
          name,
        };

        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
        showAlert("success", "Categoría agregada correctamente.");
      }

      // Cerrar modal
      const modal = getBootstrapModalInstance(modalEl);
      if (modal) modal.hide();

      // Invalidar cache y recargar tabla
      invalidateCategoriesCache();
      await loadCategories(effectiveUserId, true);
    } catch (err) {
      console.error("Error al guardar categoría:", err);
      showAlert("error", err?.message || "No se pudo guardar la categoría.");
    }
  });
}
