/**
 * ============================================
 * DASHBOARD - VERIFICACIÓN DE AUTENTICACIÓN
 * ============================================
 * Verifica si el usuario está autenticado antes de mostrar el dashboard
 */

import { supabase } from "../Config/supabaseClient.js";
import { obtenerSesion } from "../Auth/auth.js";

/**
 * Verifica si el cliente de Supabase está creado y si el usuario está autenticado
 */
async function checkAuth() {
  try {
    // Verificar si el cliente de Supabase está creado
    if (!supabase) {
      console.error("Error: Cliente de Supabase no inicializado");
      redirectToLogin();
      return;
    }

    // Verificar sesión
    const sesionResult = await obtenerSesion();

    if (!sesionResult.success || !sesionResult.session) {
      console.log("No hay sesión activa");
      redirectToLogin();
      return;
    }

    // Obtener usuario desde la sesión (evita llamada redundante a getUser)
    const user = sesionResult.session.user;

    if (!user) {
      // Si no hay usuario, redirigir al login
      redirectToLogin();
      return;
    }

    // Usuario autenticado correctamente
    console.log("Usuario autenticado:", user);
    loadUserInfo(user);
  } catch (error) {
    console.error("Error en checkAuth:", error);
    redirectToLogin();
  }
}

/**
 * Redirige al usuario a la página de login
 */
function redirectToLogin() {
  window.location.href = "../../Views/Auth/login.html";
}

/**
 * Carga la información del usuario en el dashboard
 * @param {Object} user - Objeto del usuario de Supabase
 */
function loadUserInfo(user) {
  // Actualizar el nombre de usuario en el header
  const userNameElement = document.querySelector(".user-name");
  if (userNameElement) {
    // Intentar obtener el nombre del usuario desde metadata o email
    const displayName =
      user.user_metadata?.username ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Usuario";
    userNameElement.textContent = displayName;
  }

  // Actualizar el email si está disponible
  const userEmailElement = document.querySelector(".user-role");
  if (userEmailElement && user.email) {
    userEmailElement.textContent = user.email;
  }
}

// Ejecutar verificación al cargar el dashboard
checkAuth();
