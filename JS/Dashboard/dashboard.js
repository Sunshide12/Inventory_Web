/**
 * ============================================
 * DASHBOARD - VERIFICACIÓN DE AUTENTICACIÓN
 * ============================================
 * Verifica si el usuario está autenticado antes de mostrar el dashboard
 */

import { supabase } from "../Config/supabaseClient.js";

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

        // Verificar si hay un usuario autenticado
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.error("Error al verificar autenticación:", error);
            redirectToLogin();
            return;
        }

        if (!user) {
            // Si no hay usuario, redirigir al login
            redirectToLogin();
            return;
        }

        // Usuario autenticado correctamente
        console.log("Usuario autenticado:", user);
        
        // Aquí puedes cargar información adicional del usuario si es necesario
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
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        // Intentar obtener el nombre del usuario desde metadata o email
        const displayName = user.user_metadata?.full_name || 
                          user.user_metadata?.name || 
                          user.email?.split('@')[0] || 
                          'Usuario';
        userNameElement.textContent = displayName;
    }

    // Actualizar el email si está disponible
    const userEmailElement = document.querySelector('.user-role');
    if (userEmailElement && user.email) {
        userEmailElement.textContent = user.email;
    }
}

// Ejecutar verificación al cargar el dashboard
checkAuth();
