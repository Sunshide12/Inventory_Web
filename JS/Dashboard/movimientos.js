import { supabase } from "../Config/supabaseClient.js";
import { getEffectiveUserId } from "../Utils/cache.js";

let movementsUIInitialized = false;
let isLoadingMovements = false;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseJsonMaybe(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

function formatValue(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

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

function setStatus(text) {
  const el = document.getElementById("movementsStatus");
  if (el) el.textContent = text || "";
}

function setEmptyStateVisible(visible) {
  const empty = document.getElementById("movementsEmptyState");
  if (empty) empty.style.display = visible ? "block" : "none";
}

function getSelectedFilterType() {
  const day = document.getElementById("movementsFilterDay");
  const month = document.getElementById("movementsFilterMonth");
  const year = document.getElementById("movementsFilterYear");

  if (month?.checked) return "month";
  if (year?.checked) return "year";
  return "day";
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function setDefaultFilterValues() {
  const dayInput = document.getElementById("movementsDayInput");
  const monthInput = document.getElementById("movementsMonthInput");
  const yearInput = document.getElementById("movementsYearInput");

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad2(now.getMonth() + 1);
  const dd = pad2(now.getDate());

  if (dayInput && !dayInput.value) dayInput.value = `${yyyy}-${mm}-${dd}`;
  if (monthInput && !monthInput.value) monthInput.value = `${yyyy}-${mm}`;
  if (yearInput && !yearInput.value) yearInput.value = String(yyyy);
}

function toggleFilterInputs(type) {
  const dayInput = document.getElementById("movementsDayInput");
  const monthInput = document.getElementById("movementsMonthInput");
  const yearInput = document.getElementById("movementsYearInput");

  if (!dayInput || !monthInput || !yearInput) return;

  dayInput.classList.toggle("d-none", type !== "day");
  monthInput.classList.toggle("d-none", type !== "month");
  yearInput.classList.toggle("d-none", type !== "year");
}

function getDateRangeFromUI() {
  const type = getSelectedFilterType();
  const dayInput = document.getElementById("movementsDayInput");
  const monthInput = document.getElementById("movementsMonthInput");
  const yearInput = document.getElementById("movementsYearInput");

  let start;
  let end;

  if (type === "day") {
    const v = dayInput?.value;
    if (!v) return null;
    const [y, m, d] = v.split("-").map((x) => Number(x));
    start = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 1);
  } else if (type === "month") {
    const v = monthInput?.value;
    if (!v) return null;
    const [y, m] = v.split("-").map((x) => Number(x));
    start = new Date(y, (m || 1) - 1, 1, 0, 0, 0, 0);
    end = new Date(y, (m || 1), 1, 0, 0, 0, 0);
  } else {
    const y = Number(yearInput?.value);
    if (!y || Number.isNaN(y)) return null;
    start = new Date(y, 0, 1, 0, 0, 0, 0);
    end = new Date(y + 1, 0, 1, 0, 0, 0, 0);
  }

  return { type, start, end };
}

function formatEntidad(tableName) {
  if (tableName === "products") return "Producto";
  if (tableName === "categories") return "Categoría";
  return tableName || "-";
}

function formatFecha(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  return d.toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderActionBadge(action) {
  const a = (action || "").toUpperCase();
  if (a === "INSERT") return `<span class="badge bg-success">INSERT</span>`;
  if (a === "UPDATE") return `<span class="badge bg-primary">UPDATE</span>`;
  if (a === "DELETE") return `<span class="badge bg-danger">DELETE</span>`;
  return `<span class="badge bg-secondary">${a || "-"}</span>`;
}

function buildDetalle(log) {
  const action = (log?.action || "").toUpperCase();

  if (action === "UPDATE" && log?.changed_fields && typeof log.changed_fields === "object") {
    const keys = Object.keys(log.changed_fields);
    if (!keys.length) return "Actualizado";

    const shown = keys.slice(0, 3).map((k) => {
      const pair = log.changed_fields[k];
      const oldV = pair?.old;
      const newV = pair?.new;
      const oldS = escapeHtml(formatValue(oldV));
      const newS = escapeHtml(formatValue(newV));
      return `<span class="me-2"><strong>${escapeHtml(k)}</strong>: ${oldS} → ${newS}</span>`;
    });

    const more = keys.length > 3 ? ` <span class="text-muted">(+${keys.length - 3} más)</span>` : "";
    return `${shown.join("")}${more}`;
  }

  if (action === "INSERT") return "Creado";
  if (action === "DELETE") return "Eliminado";
  return "-";
}

function getNombreFromLog(log) {
  const newData = parseJsonMaybe(log?.new_data);
  const oldData = parseJsonMaybe(log?.old_data);

  const name = newData?.name ?? oldData?.name ?? "";
  return name ? String(name) : "-";
}

function renderMovements(logs) {
  const tbody = document.getElementById("movementsTableBody");
  if (!tbody) return;

  if (!logs || logs.length === 0) {
    tbody.innerHTML = "";
    setEmptyStateVisible(true);
    return;
  }

  setEmptyStateVisible(false);

  // Use DocumentFragment for batched DOM updates
  const fragment = document.createDocumentFragment();

  logs.forEach((log) => {
    const tr = document.createElement("tr");
    const nombre = escapeHtml(getNombreFromLog(log));
    tr.innerHTML = `
      <td>${formatFecha(log.created_at)}</td>
      <td>${formatEntidad(log.table_name)}</td>
      <td>${renderActionBadge(log.action)}</td>
      <td><strong>${nombre}</strong></td>
      <td>${log.record_id ?? "-"}</td>
      <td class="movement-detail">${buildDetalle(log)}</td>
    `;
    fragment.appendChild(tr);
  });

  // Single DOM update
  tbody.innerHTML = "";
  tbody.appendChild(fragment);
}

export async function loadMovements(userId, { forceReload = false } = {}) {
  if (isLoadingMovements) return;

  try {
    isLoadingMovements = true;
    setStatus("Cargando movimientos...");

    const effectiveUserId = await getEffectiveUserId(userId);
    if (!effectiveUserId) throw new Error("No se pudo determinar el usuario autenticado.");

    const range = getDateRangeFromUI();
    if (!range) {
      setStatus("Selecciona un filtro válido (día, mes o año).");
      renderMovements([]);
      return;
    }

    const { start, end, type } = range;

    const startISO = start.toISOString();
    const endISO = end.toISOString();

    const { data, error } = await supabase
      .from("inventory_audit_log")
      .select("id, created_at, table_name, action, record_id, changed_fields, old_data, new_data")
      .eq("user_id", effectiveUserId)
      .gte("created_at", startISO)
      .lt("created_at", endISO)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    renderMovements(data || []);
    const label =
      type === "day" ? "día" : type === "month" ? "mes" : "año";
    setStatus(`Mostrando ${data?.length || 0} movimientos (filtro por ${label}).`);
  } catch (err) {
    console.error("Error al cargar movimientos:", err);
    renderMovements([]);
    setStatus("No se pudieron cargar los movimientos.");

    const msg = err?.message || "No se pudieron cargar los movimientos.";
    // Error común cuando aún no se ejecutó el SQL en Supabase:
    // relation "inventory_audit_log" does not exist
    showAlert("error", msg);
  } finally {
    isLoadingMovements = false;
  }
}

export function initMovementsUI({ userId } = {}) {
  if (movementsUIInitialized) return;
  movementsUIInitialized = true;

  setDefaultFilterValues();
  toggleFilterInputs(getSelectedFilterType());

  const dayRadio = document.getElementById("movementsFilterDay");
  const monthRadio = document.getElementById("movementsFilterMonth");
  const yearRadio = document.getElementById("movementsFilterYear");

  const dayInput = document.getElementById("movementsDayInput");
  const monthInput = document.getElementById("movementsMonthInput");
  const yearInput = document.getElementById("movementsYearInput");
  const refreshBtn = document.getElementById("movementsRefreshBtn");

  const onTypeChange = async () => {
    const type = getSelectedFilterType();
    toggleFilterInputs(type);
    await loadMovements(userId);
  };

  dayRadio?.addEventListener("change", onTypeChange);
  monthRadio?.addEventListener("change", onTypeChange);
  yearRadio?.addEventListener("change", onTypeChange);

  dayInput?.addEventListener("change", async () => loadMovements(userId));
  monthInput?.addEventListener("change", async () => loadMovements(userId));
  yearInput?.addEventListener("change", async () => loadMovements(userId));

  refreshBtn?.addEventListener("click", async () => loadMovements(userId, { forceReload: true }));
}

