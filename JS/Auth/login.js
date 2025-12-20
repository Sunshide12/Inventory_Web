import { iniciarSesion } from "./auth.js";

console.log("Login.js cargado correctamente");

const form = document.getElementById("loginForm");
const email = document.getElementById("loginEmail");
const password = document.getElementById("loginPassword");
const rememberMe = document.getElementById("rememberMe");

// -------------------------------------
// VALIDACIONES EN TIEMPO REAL
// -------------------------------------

// Email
email.addEventListener("input", () => {
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  toggleValidation(email, valid);
});

// Password
password.addEventListener("input", () => {
  const valid = password.value.length >= 6;
  toggleValidation(password, valid);
});

// Función para activar/desactivar estilos Bootstrap
function toggleValidation(input, valid) {
  if (valid) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  } else {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
  }
}

// -------------------------------------
// SUBMIT DEL FORMULARIO
// -------------------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validaciones finales
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  const validPassword = password.value.length >= 6;

  toggleValidation(email, validEmail);
  toggleValidation(password, validPassword);

  if (!validEmail || !validPassword) {
    console.warn("❌ Formulario inválido.");
    return;
  }

  // Mostrar spinner de carga
  const submitBtn = document.getElementById("loginSubmitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnSpinner = submitBtn.querySelector(".btn-spinner");
  btnText.classList.add("d-none");
  btnSpinner.classList.remove("d-none");
  submitBtn.disabled = true;

  try {
    // Intentar iniciar sesión
    const result = await iniciarSesion(email.value.trim(), password.value);

    // if (result.success) {
    //   // Guardar preferencia de "Recordarme" si está marcado
    //   if (rememberMe.checked) {
    //     localStorage.setItem("rememberMe", "true");
    //     localStorage.setItem("userEmail", email.value.trim());
    //   } else {
    //     localStorage.removeItem("rememberMe");
    //     localStorage.removeItem("userEmail");
    //   }

      // Mostrar información en consola ANTES de redirigir

      // console.warn("⚠️ Datos de la sesión", result.session);
      // console.warn("⚠️ Datos del usuario", result.user);

      if (result.success) {
        showSuccess("¡Inicio de sesión exitoso! Redirigiendo...");

        
        // Redirigir al dashboard después de 2 segundos (dar tiempo a ver los logs)
        setTimeout(() => {
          window.location.href = "../../Views/Dashboard/dashboard.html";
        }, 2000);
      } else {
        // Mostrar error
        showError(result.error || "Error al iniciar sesión");
        
        // Restaurar botón
        btnText.classList.remove("d-none");
        btnSpinner.classList.add("d-none");
        submitBtn.disabled = false;
      }
    } catch (error) {
      // Mostrar error
      showError(error.message || "Error al iniciar sesión");

      // Restaurar botón
      btnText.classList.remove("d-none");
      btnSpinner.classList.add("d-none");
      submitBtn.disabled = false;
    }

});

// -------------------------------------
// ALERTAS
// -------------------------------------
function showSuccess(msg) {
  const alert = document.getElementById("successAlert");
  document.getElementById("successMessage").textContent = msg;
  alert.style.display = "block";
  alert.classList.add("show");
}

function showError(msg) {
  const alert = document.getElementById("errorAlert");
  document.getElementById("errorMessage").textContent = msg;
  alert.style.display = "block";
  alert.classList.add("show");
}

// -------------------------------------
// CARGAR EMAIL GUARDADO SI "RECORDARME" ESTÁ ACTIVO
// -------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const rememberMeValue = localStorage.getItem("rememberMe");
  const savedEmail = localStorage.getItem("userEmail");

  if (rememberMeValue === "true" && savedEmail) {
    email.value = savedEmail;
    rememberMe.checked = true;
  }
});
