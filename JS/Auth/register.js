import { registroUsuario } from "./auth.js";

const form = document.getElementById("registerForm");
const username = document.getElementById("username");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const terms = document.getElementById("acceptTerms");

// -------------------------------------
// VALIDACIONES EN TIEMPO REAL
// -------------------------------------

// Username
username.addEventListener("input", () => {
  const valid = /^[A-Za-z0-9_]{4,}$/.test(username.value.trim());
  toggleValidation(username, valid);
});

// Email
email.addEventListener("input", () => {
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  toggleValidation(email, valid);
});

// Phone
phone.addEventListener("input", () => {
  const valid = phone.value.trim().length >= 10;
  toggleValidation(phone, valid);
});

// Password
password.addEventListener("input", () => {
  const pass = password.value;
  const valid =
    pass.length >= 8 &&
    /[A-Z]/.test(pass) &&
    /[a-z]/.test(pass) &&
    /[0-9]/.test(pass);

  toggleValidation(password, valid);

  showPasswordStrength(pass);
});

// Confirm Password
confirmPassword.addEventListener("input", () => {
  const valid = confirmPassword.value === password.value;
  toggleValidation(confirmPassword, valid);
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

// Barra de fuerza de contraseña
function showPasswordStrength(pass) {
  const bar = document.getElementById("passwordStrengthFill");
  const text = document.getElementById("passwordStrengthText");
  const box = document.getElementById("passwordStrength");

  if (!pass) {
    box.style.display = "none";
    return;
  }

  box.style.display = "block";

  let strength = 0;
  if (pass.length >= 8) strength++;
  if (/[A-Z]/.test(pass)) strength++;
  if (/[a-z]/.test(pass)) strength++;
  if (/[0-9]/.test(pass)) strength++;

  const percent = (strength / 4) * 100;

  bar.style.width = percent + "%";

  if (percent < 40) {
    bar.style.background = "red";
    text.textContent = "Contraseña débil";
  } else if (percent < 75) {
    bar.style.background = "orange";
    text.textContent = "Contraseña media";
  } else {
    bar.style.background = "green";
    text.textContent = "Contraseña fuerte";
  }
}

// -------------------------------------
// SUBMIT DEL FORMULARIO
// -------------------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validaciones finales
  const validUsername = /^[A-Za-z0-9_]{4,}$/.test(username.value.trim());
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  const validPhone = phone.value.trim().length >= 10;
  const validPass =
    password.value.length >= 8 &&
    /[A-Z]/.test(password.value) &&
    /[a-z]/.test(password.value) &&
    /[0-9]/.test(password.value);
  const validConfirm = password.value === confirmPassword.value;

  toggleValidation(username, validUsername);
  toggleValidation(email, validEmail);
  toggleValidation(phone, validPhone);
  toggleValidation(password, validPass);
  toggleValidation(confirmPassword, validConfirm);

  if (!terms.checked) {
    terms.classList.add("is-invalid");
  } else {
    terms.classList.remove("is-invalid");
  }

  if (
    !validUsername ||
    !validEmail ||
    !validPhone ||
    !validPass ||
    !validConfirm ||
    !terms.checked
  ) {
    console.warn("❌ Formulario inválido.");
    return;
  }

  // Submit válido → Registrar usuario
  const result = await registroUsuario(
    username.value.trim(),
    password.value,
    email.value.trim(),
    phone.value.trim()
  );

  if (result.success) {
    showSuccess("Cuenta Registrada exitosamente. Por favor verifica tu correo electrónico para poder iniciar sesión.");

    // Esperar 2.5 segundos y luego redirigir al login
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2500);
  } else {
    showError(result.error);
  }
});

// -------------------------------------
// ALERTAS BONITAS
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
