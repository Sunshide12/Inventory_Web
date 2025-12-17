// auth.js
// await espera a que la promesa de fetch se resuelva
import { supabase } from "../Config/supabaseClient.js";

// Función para registrar un usuario
export async function registroUsuario(username, password, email, phone) {
  try {
    console.log("Registro de usuario", username, password, email, phone);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      user_metadata: {
        username: username,
        phone: phone,
      },
    });

    if (error) {
      console.error("Error al registrar usuario:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return { success: false, error: error.message || "Error desconocido" };
  }
}

// Función para iniciar sesión con verificación de correo
export async function iniciarSesion(email, password) {
  try {
    console.log("🔐 Intentando iniciar sesión para:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    // Log detallado de la respuesta
    console.log("📥 Respuesta de Supabase:");
    console.log("  - Error:", error);
    console.log("  - Data:", data);
    console.log("  - User:", data?.user);
    console.log("  - Session:", data?.session);
    
    if (error) {
      console.error("❌ Error al iniciar sesión:", error);
      return { success: false, error: error.message };
    }
    
    if (data.user && !data.user.email_confirmed_at) {
      console.warn("⚠️ Usuario no ha confirmado su correo");
      await supabase.auth.signOut();
      return {
        success: false,
        error:
          "Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada y spam.",
      };
    }
    
    // Verificar que tenemos sesión
    if (!data.session) {
      console.error("❌ No se recibió sesión en la respuesta");
      console.log("📋 Data completo:", JSON.stringify(data, null, 2));
      return { 
        success: false, 
        error: "No se pudo crear la sesión. Por favor intenta nuevamente." 
      };
    }
    
    console.log("✅ Sesión creada exitosamente");
    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error("❌ Excepción al iniciar sesión:", error);
    console.error("Stack trace:", error.stack);
    return { success: false, error: error.message || "No se qué pasó manito pero no se pudo iniciar sesión" };
  }
}

// Obtener la sesion actual del usuario
export async function obtenerSesion() {
  try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
          console.error("Error al obtener la sesión:", error);
          return { success: false, error: error.message };
      }
      return { success: true, session: data.session, user: data.user };
    } catch (error) {
      console.error("Error al obtener la sesión:", error);
      return { success: false, error: error.message, user: null, session: null };
    }
}
console.log("Supabase client cargado correctamente");
