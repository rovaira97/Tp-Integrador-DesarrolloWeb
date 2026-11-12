const CLAVE_TURNOS = "turnos";
const CLAVE_MASCOTAS = "mascotas";
const CLAVE_VETERINARIOS = "veterinarios";

const form = document.getElementById("form-turno");
const selMascota = document.getElementById("selMascota");
const selVeterinario = document.getElementById("selVeterinario");
const filtroVeterinario = document.getElementById("filtroVeterinario");
const filtroFecha = document.getElementById("filtroFecha");
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
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

function escaparHTML(texto) {
  return String(texto)
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

  const valorFiltroActual = filtroVeterinario.value;
  filtroVeterinario.innerHTML =
    `<option value="">Todos los veterinarios</option>` +
    vets
      .map(
        (v) =>
          `<option value="${idVet(v)}">${escaparHTML(etiquetaVet(v))}</option>`,
      )
      .join("");
  filtroVeterinario.value = valorFiltroActual;
}

function mostrarMensaje(texto, tipo = "success") {
  mensaje.innerHTML = `<div class="alert alert-${tipo} mb-0">${texto}</div>`;
  setTimeout(() => (mensaje.innerHTML = ""), 3500);
}

function render() {
  let turnos = leer(CLAVE_TURNOS);
  const mascotas = leer(CLAVE_MASCOTAS);
  const vets = leer(CLAVE_VETERINARIOS);

  const vetSeleccionado = filtroVeterinario.value;
  const fechaSeleccionada = filtroFecha.value;

  if (vetSeleccionado) {
    turnos = turnos.filter((t) => String(t.idVeterinario) === vetSeleccionado);
  }
  if (fechaSeleccionada) {
    turnos = turnos.filter((t) => t.fecha === fechaSeleccionada);
  }

  total.textContent = turnos.length;

  if (turnos.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">No hay turnos que coincidan con los criterios.</td>
      </tr>`;
    return;
  }

  turnos.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  tabla.innerHTML = turnos
    .map((t) => {
      const m = mascotas.find((x) => x.idMascota === t.idMascota);
      const v = vets.find((x) => idVet(x) === String(t.idVeterinario));
      return `
        <tr>
          <td>${escaparHTML(t.fecha)}</td>
          <td>${escaparHTML(t.hora)}</td>
          <td>${m ? escaparHTML(etiquetaMascota(m)) : "(mascota eliminada)"}</td>
          <td>${v ? escaparHTML(etiquetaVet(v)) : "(veterinario eliminado)"}</td>
          <td>${escaparHTML(t.motivo)}</td>
          <td class="text-end text-nowrap">
            <button class="btn btn-sm btn-outline-primary me-1" onclick="verComprobante('${t.idTurno}')">Comprobante</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarTurno('${t.idTurno}')">Eliminar</button>
          </td>
        </tr>`;
    })
    .join("");
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!selMascota.value || !selVeterinario.value) {
    mostrarMensaje(
      "Cargá al menos una mascota y un veterinario antes de crear un turno.",
      "warning",
    );
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

  const ocupado = turnos.some(
    (t) =>
      String(t.idVeterinario) === selVeterinario.value &&
      t.fecha === fecha &&
      t.hora === hora,
  );
  if (ocupado) {
    mostrarMensaje(
      "Ese veterinario ya tiene un turno en esa fecha y hora.",
      "danger",
    );
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

filtroVeterinario.addEventListener("change", render);
filtroFecha.addEventListener("change", render);
btnLimpiarFiltros.addEventListener("click", () => {
  filtroVeterinario.value = "";
  filtroFecha.value = "";
  render();
});

window.verComprobante = function (idTurno) {
  const turno = leer(CLAVE_TURNOS).find((t) => t.idTurno === idTurno);
  if (!turno) return;

  const m = leer(CLAVE_MASCOTAS).find((x) => x.idMascota === turno.idMascota);
  const v = leer(CLAVE_VETERINARIOS).find(
    (x) => idVet(x) === String(turno.idVeterinario),
  );

  const formatoMoneda = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  });

  document.getElementById("comp-codigo").textContent = turno.idTurno
    .slice(0, 8)
    .toUpperCase();
  document.getElementById("comp-fecha").textContent = turno.fecha;
  document.getElementById("comp-hora").textContent = turno.hora + " hs";
  document.getElementById("comp-mascota").textContent = m
    ? m.nombreMascota
    : "No registrada";
  document.getElementById("comp-duenio").textContent = m
    ? m.nombreDuenio
    : "No registrado";
  document.getElementById("comp-vet").textContent = v
    ? `${etiquetaVet(v)} (${v.especializacion || "Clínica"})`
    : "No registrado";
  document.getElementById("comp-valor").textContent =
    v && v.valorConsulta ? formatoMoneda.format(v.valorConsulta) : "-";
  document.getElementById("comp-motivo").textContent = turno.motivo;

  const modal = new bootstrap.Modal(
    document.getElementById("modalComprobante"),
  );
  modal.show();
};

window.eliminarTurno = function (id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este turno?")) return;
  guardar(
    CLAVE_TURNOS,
    leer(CLAVE_TURNOS).filter((t) => t.idTurno !== id),
  );
  render();
};

cargarSelects();
render();
