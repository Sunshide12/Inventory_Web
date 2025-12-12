// auth.js
import { supabase } from "../Config/supabaseClient.js";

// Exportar la función para que pueda ser usada desde otros módulos
export async function registroUsuario(username, password, email, phone) {
  try {
    // await espera a que la promesa de fetch se resuelva
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

    return { success: true};
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return { success: false, error: error.message || "Error desconocido" };
  }
}

// Función para iniciar sesión con verificación de correo
export async function iniciarSesion(email, password) {
  try {
    console.log("Iniciando sesión para:", email);
    
    // Intentar iniciar sesión
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Error al iniciar sesión:", error);
      return { success: false, error: error.message };
    }

    // Verificar si el correo está confirmado
    if (data.user && !data.user.email_confirmed_at) {
      // Cerrar sesión si el correo no está confirmado
      await supabase.auth.signOut();
      return { 
        success: false, 
        error: "Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada y spam." 
      };
    }

    console.log("Sesión iniciada exitosamente:", data.user);
    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { success: false, error: error.message || "Error desconocido" };
  }
}
