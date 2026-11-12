const CLAVE_HISTORIAS = "historiasClinicas";
const CLAVE_MASCOTAS = "mascotas";
const CLAVE_VETERINARIOS = "veterinarios";

let historias = leer(CLAVE_HISTORIAS);

const form = document.getElementById("form-historia");
const idHistoriaInput = document.getElementById("idHistoria");
const selMascota = document.getElementById("selMascota");
const selVeterinario = document.getElementById("selVeterinario");
const filtroMascota = document.getElementById("filtroMascota");
const tabla = document.getElementById("listado-historias");
const total = document.getElementById("total");
const mensaje = document.getElementById("mensaje");
const tituloFormulario = document.getElementById("tituloFormulario");
const botonGuardar = document.getElementById("botonGuardarHistoria");
const botonCancelar = document.getElementById("botonCancelar");
const fichaMascotaCard = document.getElementById("ficha-mascota");
const fichaMascotaContenido = document.getElementById(
  "ficha-mascota-contenido",
);
const btnExportar = document.getElementById("btnExportar");

function leer(clave) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardar(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}

function escaparHTML(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const etiquetaMascota = (m) => `${m.nombreMascota} (${m.nombreDuenio})`;
const idVet = (v) => String(v.idVeterinario ?? v.id);
const etiquetaVet = (v) => [v.nombre, v.apellido].filter(Boolean).join(" ");

function cargarSelects() {
  const mascotas = leer(CLAVE_MASCOTAS);
  const vets = leer(CLAVE_VETERINARIOS);

  selMascota.innerHTML = mascotas.length
    ? mascotas
        .map(
          (m) =>
            `<option value="${m.idMascota}">${escaparHTML(etiquetaMascota(m))}</option>`,
        )
        .join("")
    : `<option value="">No hay mascotas cargadas</option>`;

  selVeterinario.innerHTML = vets.length
    ? vets
        .map(
          (v) =>
            `<option value="${idVet(v)}">${escaparHTML(etiquetaVet(v))}</option>`,
        )
        .join("")
    : `<option value="">No hay veterinarios cargados</option>`;

  const filtroActual = filtroMascota.value;
  filtroMascota.innerHTML =
    `<option value="">Todas las mascotas (Historial general)</option>` +
    mascotas
      .map(
        (m) =>
          `<option value="${m.idMascota}">${escaparHTML(etiquetaMascota(m))}</option>`,
      )
      .join("");
  filtroMascota.value = filtroActual;
}

function mostrarMensaje(texto, tipo = "success") {
  mensaje.innerHTML = `<div class="alert alert-${tipo} mb-0">${texto}</div>`;
  setTimeout(() => (mensaje.innerHTML = ""), 3500);
}

function renderizarFichaMascota(idMascotaSeleccionada, mascotas, registros) {
  if (!idMascotaSeleccionada) {
    fichaMascotaCard.classList.add("d-none");
    return;
  }

  const m = mascotas.find((x) => x.idMascota === idMascotaSeleccionada);
  if (!m) {
    fichaMascotaCard.classList.add("d-none");
    return;
  }

  fichaMascotaCard.classList.remove("d-none");
  fichaMascotaContenido.innerHTML = `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
      <div>
        <h4 class="h5 fw-bold mb-1 text-dark">Ficha Clínica: ${escaparHTML(m.nombreMascota)}</h4>
        <p class="mb-0 small text-secondary">
          <strong>Dueño:</strong> ${escaparHTML(m.nombreDuenio)} ·
          <strong>Color:</strong> ${escaparHTML(m.color)} ·
          <strong>Edad:</strong> ${escaparHTML(m.edad)} años ·
          <strong>Peso inicial:</strong> ${escaparHTML(m.peso)} kg
        </p>
      </div>
      <span class="badge text-bg-primary">${registros.length} consulta(s)</span>
    </div>
  `;
}

function obtenerRegistrosFiltrados() {
  const idMascotaFiltro = filtroMascota.value;
  let lista = [...historias];

  if (idMascotaFiltro) {
    lista = lista.filter((h) => h.idMascota === idMascotaFiltro);
  }

  lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
  return lista;
}

function render() {
  const mascotas = leer(CLAVE_MASCOTAS);
  const vets = leer(CLAVE_VETERINARIOS);
  const filtradas = obtenerRegistrosFiltrados();

  total.textContent = filtradas.length;
  renderizarFichaMascota(filtroMascota.value, mascotas, filtradas);

  if (filtradas.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">No hay registros clínicos cargados.</td>
      </tr>`;
    return;
  }

  tabla.innerHTML = filtradas
    .map((h) => {
      const m = mascotas.find((x) => x.idMascota === h.idMascota);
      const v = vets.find((x) => idVet(x) === String(h.idVeterinario));
      return `
        <tr>
          <td class="text-nowrap">${escaparHTML(h.fecha)}</td>
          <td>${m ? escaparHTML(etiquetaMascota(m)) : "(mascota eliminada)"}</td>
          <td>${v ? escaparHTML(etiquetaVet(v)) : "(veterinario eliminado)"}</td>
          <td>
            <div class="fw-semibold text-dark">${escaparHTML(h.diagnostico)}</div>
            <div class="small text-muted">${escaparHTML(h.tratamiento)}</div>
          </td>
          <td class="small text-nowrap">
            <div>Peso: <strong>${escaparHTML(h.peso)} kg</strong></div>
            <div>Temp: <strong>${escaparHTML(h.temperatura)} °C</strong></div>
          </td>
          <td class="text-nowrap">${h.proximoControl ? escaparHTML(h.proximoControl) : "-"}</td>
          <td class="text-end text-nowrap">
            <button class="btn btn-sm btn-warning me-1" onclick="cargarParaEditar('${h.idHistoria}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarHistoria('${h.idHistoria}')">Eliminar</button>
          </td>
        </tr>`;
    })
    .join("");
}

function salirModoEdicion() {
  form.reset();
  idHistoriaInput.value = "";
  tituloFormulario.textContent = "Nueva Consulta Clínica";
  botonGuardar.textContent = "Guardar Registro";
  botonCancelar.classList.add("d-none");
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!selMascota.value || !selVeterinario.value) {
    mostrarMensaje(
      "Debés tener al menos una mascota y un veterinario registrados.",
      "warning",
    );
    return;
  }

  const idExistente = idHistoriaInput.value;
  const registro = {
    idHistoria: idExistente || crypto.randomUUID(),
    idMascota: selMascota.value,
    idVeterinario: selVeterinario.value,
    fecha: document.getElementById("fecha").value,
    diagnostico: document.getElementById("diagnostico").value.trim(),
    tratamiento: document.getElementById("tratamiento").value.trim(),
    peso: parseFloat(document.getElementById("peso").value),
    temperatura: parseFloat(document.getElementById("temperatura").value),
    proximoControl: document.getElementById("proximoControl").value || "",
  };

  if (
    !registro.fecha ||
    !registro.diagnostico ||
    !registro.tratamiento ||
    !Number.isFinite(registro.peso) ||
    registro.peso <= 0 ||
    !Number.isFinite(registro.temperatura) ||
    registro.temperatura <= 0
  ) {
    mostrarMensaje(
      "Revisá que todos los campos obligatorios sean válidos.",
      "warning",
    );
    return;
  }

  if (idExistente) {
    historias = historias.map((h) =>
      h.idHistoria === idExistente ? registro : h,
    );
    mostrarMensaje("Registro clínico actualizado.");
  } else {
    historias.push(registro);
    mostrarMensaje("Consulta clínica registrada correctamente.");
  }

  guardar(CLAVE_HISTORIAS, historias);
  salirModoEdicion();
  render();
});

botonCancelar.addEventListener("click", salirModoEdicion);
filtroMascota.addEventListener("change", render);

window.cargarParaEditar = function (id) {
  const h = historias.find((item) => item.idHistoria === id);
  if (!h) return;

  idHistoriaInput.value = h.idHistoria;
  selMascota.value = h.idMascota;
  selVeterinario.value = h.idVeterinario;
  document.getElementById("fecha").value = h.fecha;
  document.getElementById("diagnostico").value = h.diagnostico;
  document.getElementById("tratamiento").value = h.tratamiento;
  document.getElementById("peso").value = h.peso;
  document.getElementById("temperatura").value = h.temperatura;
  document.getElementById("proximoControl").value = h.proximoControl || "";

  tituloFormulario.textContent = "Editar Consulta Clínica";
  botonGuardar.textContent = "Actualizar Registro";
  botonCancelar.classList.remove("d-none");

  form.scrollIntoView({ behavior: "smooth", block: "center" });
};

window.eliminarHistoria = function (id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este registro clínico?"))
    return;

  historias = historias.filter((h) => h.idHistoria !== id);
  guardar(CLAVE_HISTORIAS, historias);
  render();

  if (idHistoriaInput.value === id) {
    salirModoEdicion();
  }
};

btnExportar.addEventListener("click", () => {
  const filtradas = obtenerRegistrosFiltrados();
  if (filtradas.length === 0) {
    mostrarMensaje("No hay registros para exportar.", "warning");
    return;
  }

  const mascotas = leer(CLAVE_MASCOTAS);
  const vets = leer(CLAVE_VETERINARIOS);

  const encabezados = [
    "Fecha",
    "Mascota",
    "Dueño",
    "Veterinario",
    "Diagnóstico",
    "Tratamiento",
    "Peso (kg)",
    "Temperatura (°C)",
    "Próximo Control",
  ];

  const escaparCSV = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;

  const filas = filtradas.map((h) => {
    const m = mascotas.find((x) => x.idMascota === h.idMascota);
    const v = vets.find((x) => idVet(x) === String(h.idVeterinario));
    return [
      h.fecha,
      m ? m.nombreMascota : "Eliminada",
      m ? m.nombreDuenio : "-",
      v ? etiquetaVet(v) : "Eliminado",
      h.diagnostico,
      h.tratamiento,
      h.peso,
      h.temperatura,
      h.proximoControl || "-",
    ]
      .map(escaparCSV)
      .join(";");
  });

  const contenidoCSV = "\uFEFF" + [encabezados.join(";"), ...filas].join("\n");
  const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `historia-clinica-la-mary-${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
});

cargarSelects();
render();
