/**
 * ============================================
 * DASHBOARD - AUTHENTICATION VERIFICATION
 * ============================================
 * Verifies if user is authenticated before showing the dashboard
 */

import { supabase } from "../Config/supabaseClient.js";
import { obtenerSesion, cerrarSesion } from "../Auth/auth.js";
import { initProductsUI, loadProducts } from "./productos.js";
import { initCategoriesUI, loadCategories } from "./categorias.js";
import { loadDashboardStats } from "./dashboardStats.js";

let currentUser = null;
let currentSection = null;

function setActiveNav(section) {
  document.querySelectorAll(".sidebar-nav .nav-item").forEach((a) => {
    const isActive = a.getAttribute("data-section") === section;
    a.classList.toggle("active", isActive);
  });
}

function setPageTitle(section) {
  const pageTitle = document.querySelector(".page-title");
  if (!pageTitle) return;

  const map = {
    dashboard: "Dashboard",
    products: "Products",
    categories: "Categories",
    reports: "Reports",
    settings: "Settings",
  };
  pageTitle.textContent = map[section] || "Dashboard";
}

export async function showSection(section) {
  // If section is already active, do nothing (avoids unnecessary reloads)
  if (currentSection === section) {
    return;
  }

  // First hide all sections and clear visible content
  document.querySelectorAll(".js-section").forEach((el) => {
    const isTarget = el.getAttribute("data-section") === section;
    el.style.display = isTarget ? "" : "none";

    // Clear table content before switching (avoids flash of old content)
    if (!isTarget) {
      const tbody = el.querySelector("tbody");
      if (tbody) tbody.innerHTML = "";
    }
  });

  setActiveNav(section);
  setPageTitle(section);
  currentSection = section;

  // Dynamic loading by section (uses cache if available)
  if (section === "dashboard") {
    await loadDashboardStats(currentUser?.id);
  } else if (section === "products") {
    initProductsUI({ userId: currentUser?.id });
    await loadProducts(currentUser?.id);
  } else if (section === "categories") {
    initCategoriesUI({ userId: currentUser?.id });
    await loadCategories(currentUser?.id);
  }
}

// Expose showSection globally for quick action buttons
window.dashboard = { showSection };

export function initNavigation() {
  document
    .querySelectorAll(".sidebar-nav .nav-item[data-section]")
    .forEach((a) => {
      a.addEventListener("click", async (e) => {
        e.preventDefault();
        const section = a.getAttribute("data-section");
        if (!section) return;
        await showSection(section);
      });
    });

  // Initialize logout button
  const logoutBtn = document.querySelector(".logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await handleLogout();
    });
  }

  // Show dashboard by default
  showSection("dashboard");
}

/**
 * Verifies if Supabase client is created and if user is authenticated
 */
export async function checkAuth() {
  try {
    // Verify if Supabase client is created
    if (!supabase) {
      console.error("Error: Supabase client not initialized");
      redirectToLogin();
      return;
    }

    // Verify session
    const sessionResult = await obtenerSesion();

    if (!sessionResult.success || !sessionResult.session) {
      console.log("No active session");
      redirectToLogin();
      return;
    }

    // Get user from session (avoids redundant getUser call)
    const user = sessionResult.session.user;
    currentUser = user;

    if (!user) {
      // If no user, redirect to login
      redirectToLogin();
      return;
    }

    // User authenticated successfully
    console.log("User authenticated:", user);
    loadUserInfo(user);
    initNavigation();
  } catch (error) {
    console.error("Error in checkAuth:", error);
    redirectToLogin();
  }
}


// Handles logout process

export async function handleLogout() {
  try {
    const result = await cerrarSesion();
    
    if (result.success) {
      // Clear any local state
      currentUser = null;
      currentSection = null;
      
      // Redirect to login page
      redirectToLogin();
    } else {
      console.error("Error al cerrar sesión:", result.error);
      // Even if there's an error, try to redirect anyway
      redirectToLogin();
    }
  } catch (error) {
    console.error("Error en handleLogout:", error);
    // Even if there's an error, try to redirect anyway
    redirectToLogin();
  }
}

/**
 * Redirects user to login page
 */
export async function redirectToLogin() {
  window.location.href = "../../Views/Auth/login.html";
}

/**
 * Loads user information in the dashboard
 * @param {Object} user - Supabase user object
 */
export async function loadUserInfo(user) {
  // Update username in header
  const userNameElement = document.querySelector(".user-name");
  if (userNameElement) {
    // Try to get user name from metadata or email
    const displayName =
      user.user_metadata?.username ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";
    userNameElement.textContent = displayName;
  }

  // Update email if available
  const userEmailElement = document.querySelector(".user-role");
  if (userEmailElement && user.email) {
    userEmailElement.textContent = user.email;
  }
}

// Execute verification when loading dashboard
checkAuth();
