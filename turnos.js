const CLAVE_TURNOS = "turnos";
const CLAVE_MASCOTAS = "mascotas";
const CLAVE_VETERINARIOS = "veterinarios";

const form = document.getElementById("form-turno");
const selMascota = document.getElementById("selMascota");
const selVeterinario = document.getElementById("selVeterinario");
const tabla = document.getElementById("listado-turnos");
const mensaje = document.getElementById("mensaje");
const total = document.getElementById("total");

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

// Evita que el texto ingresado se interprete como HTML
function escaparHTML(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Mascotas: usan idMascota, nombreMascota, nombreDuenio
const etiquetaMascota = (m) => `${m.nombreMascota} (${m.nombreDuenio})`;

// Veterinarios: ajustar si en veterinarios.js se llaman distinto
const idVet = (v) => String(v.idVeterinario ?? v.id);
const etiquetaVet = (v) => [v.nombre, v.apellido].filter(Boolean).join(" ");

function cargarSelects() {
  const mascotas = leer(CLAVE_MASCOTAS);
  const vets = leer(CLAVE_VETERINARIOS);

  selMascota.innerHTML = mascotas.length
    ? mascotas
        .map((m) => `<option value="${m.idMascota}">${escaparHTML(etiquetaMascota(m))}</option>`)
        .join("")
    : `<option value="">No hay mascotas cargadas</option>`;

  selVeterinario.innerHTML = vets.length
    ? vets
        .map((v) => `<option value="${idVet(v)}">${escaparHTML(etiquetaVet(v))}</option>`)
        .join("")
    : `<option value="">No hay veterinarios cargados</option>`;
}

function mostrarMensaje(texto, tipo = "success") {
  mensaje.innerHTML = `<div class="alert alert-${tipo} mb-0">${texto}</div>`;
  setTimeout(() => (mensaje.innerHTML = ""), 3500);
}

function render() {
  const turnos = leer(CLAVE_TURNOS);
  const mascotas = leer(CLAVE_MASCOTAS);
  const vets = leer(CLAVE_VETERINARIOS);

  total.textContent = turnos.length;

  if (turnos.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">No hay turnos registrados.</td>
      </tr>`;
    return;
  }

  // Ordena por fecha y hora
  turnos.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  tabla.innerHTML = turnos
    .map((t) => {
      const m = mascotas.find((x) => x.idMascota === t.idMascota);
      const v = vets.find((x) => idVet(x) === t.idVeterinario);
      return `
        <tr>
          <td>${escaparHTML(t.fecha)}</td>
          <td>${escaparHTML(t.hora)}</td>
          <td>${m ? escaparHTML(etiquetaMascota(m)) : "(mascota eliminada)"}</td>
          <td>${v ? escaparHTML(etiquetaVet(v)) : "(veterinario eliminado)"}</td>
          <td>${escaparHTML(t.motivo)}</td>
          <td>
            <div class="acciones">
              <button class="btn btn-accion btn-eliminar" onclick="eliminarTurno('${t.idTurno}')">Eliminar</button>
            </div>
          </td>
        </tr>`;
    })
    .join("");
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!selMascota.value || !selVeterinario.value) {
    mostrarMensaje("Cargá al menos una mascota y un veterinario antes de crear un turno.", "warning");
    return;
  }

  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const motivo = document.getElementById("motivo").value.trim();

  if (!fecha || !hora || motivo === "") {
    mostrarMensaje("Completá todos los campos.", "warning");
    return;
  }

  const turnos = leer(CLAVE_TURNOS);

  // Un veterinario no puede tener dos turnos a la misma fecha y hora
  const ocupado = turnos.some(
    (t) => t.idVeterinario === selVeterinario.value && t.fecha === fecha && t.hora === hora,
  );
  if (ocupado) {
    mostrarMensaje("Ese veterinario ya tiene un turno en esa fecha y hora.", "danger");
    return;
  }

  turnos.push({
    idTurno: crypto.randomUUID(),
    idMascota: selMascota.value,
    idVeterinario: selVeterinario.value,
    fecha,
    hora,
    motivo,
  });
  guardar(CLAVE_TURNOS, turnos);

  form.reset();
  cargarSelects();
  render();
  mostrarMensaje("Turno registrado correctamente.");
});

window.eliminarTurno = function (id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este turno?")) return;
  guardar(CLAVE_TURNOS, leer(CLAVE_TURNOS).filter((t) => t.idTurno !== id));
  render();
};

cargarSelects();
render();
