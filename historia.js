const CLAVE_HISTORIAS = "historiasClinicas";
const CLAVE_MASCOTAS = "mascotas";

const form = document.getElementById("form-historia");
const selMascota = document.getElementById("selMascota");
const tabla = document.getElementById("listado-historias");
const mensaje = document.getElementById("mensaje");
const total = document.getElementById("total");

const modalEl = document.getElementById("modalHistorial");
const modalTitulo = document.getElementById("modalTitulo");
const modalCuerpo = document.getElementById("modalCuerpo");
const modalHistorial = new bootstrap.Modal(modalEl);

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
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "'");
}

const etiquetaMascota = (m) => `${m.nombreMascota} (${m.nombreDuenio})`;

function cargarSelects() {
  const mascotas = leer(CLAVE_MASCOTAS);

  selMascota.innerHTML = mascotas.length
    ? mascotas
        .map((m) => `<option value="${m.idMascota}">${escaparHTML(etiquetaMascota(m))}</option>`)
        .join("")
    : `<option value="">No hay mascotas cargadas</option>`;
}

function mostrarMensaje(texto, tipo = "success") {
  mensaje.innerHTML = `<div class="alert alert-${tipo} mb-0">${texto}</div>`;
  setTimeout(() => (mensaje.innerHTML = ""), 3500);
}

function render() {
  const historias = leer(CLAVE_HISTORIAS);
  const mascotas = leer(CLAVE_MASCOTAS);

  if (total) total.textContent = historias.length;

  if (historias.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-muted py-4">No hay historias clínicas registradas.</td>
      </tr>`;
    return;
  }

  historias.sort((a, b) => b.fechaConsulta.localeCompare(a.fechaConsulta));

  tabla.innerHTML = historias
    .map((h) => {
      const m = mascotas.find((x) => x.idMascota === h.idMascota);

      return `
        <tr>
          <td>${escaparHTML(h.fechaRegistro)}</td>
          <td>${escaparHTML(h.fechaConsulta)}</td>
          <td>${m ? escaparHTML(etiquetaMascota(m)) : "(mascota eliminada)"}</td>
          <td>${escaparHTML(h.peso)} kg</td>
          <td>${escaparHTML(h.temperatura)} °C</td>
          <td>${escaparHTML(h.diagnostico)}</td>
          <td>${escaparHTML(h.tratamiento)}</td>
          <td>${escaparHTML(h.proximoControl)}</td>
          <td class="text-end">
            <div class="d-flex justify-content-end gap-2">
              <button class="btn btn-sm btn-outline-primary" onclick="verHistorialCompleto('${h.idMascota}')">
                Historial
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarHistoria('${h.idHistoria}')">
                Eliminar
              </button>
            </div>
          </td>
        </tr>`;
    })
    .join("");
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!selMascota.value) {
    mostrarMensaje("Cargá al menos una mascota antes de registrar una historia clínica.", "warning");
    return;
  }

  const fechaConsulta = document.getElementById("fechaConsulta").value;
  const peso = parseFloat(document.getElementById("peso").value);
  const temperatura = parseFloat(document.getElementById("temperatura").value);
  const diagnostico = document.getElementById("diagnostico").value.trim();
  const tratamiento = document.getElementById("tratamiento").value.trim();
  const proximoControl = document.getElementById("proximoControl").value;

  if (!fechaConsulta || isNaN(peso) || isNaN(temperatura) || !diagnostico || !tratamiento || !proximoControl) {
    mostrarMensaje("Completá todos los campos correctamente.", "warning");
    return;
  }

  const fechaRegistro = new Date().toISOString().slice(0, 10);

  const historias = leer(CLAVE_HISTORIAS);
  historias.push({
    idHistoria: crypto.randomUUID(),
    idMascota: selMascota.value,
    fechaRegistro,
    fechaConsulta,
    peso,
    temperatura,
    diagnostico,
    tratamiento,
    proximoControl,
  });

  guardar(CLAVE_HISTORIAS, historias);

  form.reset();
  cargarSelects();
  render();
  mostrarMensaje("Historia clínica registrada correctamente.");
});

window.verHistorialCompleto = function (idMascota) {
  const mascotas = leer(CLAVE_MASCOTAS);
  const historias = leer(CLAVE_HISTORIAS);

  const m = mascotas.find((x) => x.idMascota === idMascota);
  const historialMascota = historias
    .filter((h) => h.idMascota === idMascota)
    .sort((a, b) => b.fechaConsulta.localeCompare(a.fechaConsulta));

  modalTitulo.textContent = m
    ? `Historial Completo: ${etiquetaMascota(m)}`
    : "Historial Completo (Mascota eliminada)";

  if (historialMascota.length === 0) {
    modalCuerpo.innerHTML = `<p class="text-muted mb-0">No hay registros para esta mascota.</p>`;
  } else {
    modalCuerpo.innerHTML = `
      <div class="list-group">
        ${historialMascota
          .map(
            (h) => `
          <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <strong class="text-primary">Consulta: ${escaparHTML(h.fechaConsulta)}</strong>
              <span class="badge bg-secondary">Próx. control: ${escaparHTML(h.proximoControl)}</span>
            </div>
            <p class="mb-1"><strong>Diagnóstico:</strong> ${escaparHTML(h.diagnostico)}</p>
            <p class="mb-1"><strong>Tratamiento:</strong> ${escaparHTML(h.tratamiento)}</p>
            <small class="text-muted">
              Peso: ${escaparHTML(h.peso)} kg | Temp: ${escaparHTML(h.temperatura)} °C | Registrado el: ${escaparHTML(h.fechaRegistro)}
            </small>
          </div>`
          )
          .join("")}
      </div>`;
  }

  modalHistorial.show();
};

window.eliminarHistoria = function (id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este registro clínico?")) return;
  guardar(
    CLAVE_HISTORIAS,
    leer(CLAVE_HISTORIAS).filter((h) => h.idHistoria !== id)
  );
  render();
};

cargarSelects();
render();