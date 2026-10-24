let mascotas = cargarDesdeLocalStorage();

const listadoMascotas = document.getElementById("listado-mascotas");
const total = document.getElementById("total");
const formulario = document.getElementById("form-mascota");
const idMascotaInput = document.getElementById("idMascota");
const botonAgregarMascota = document.getElementById("botonAgregarMascota");
const botonCancelar = document.getElementById("botonCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");

function cargarDesdeLocalStorage() {
  try {
    const datos = JSON.parse(localStorage.getItem("mascotas"));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardarEnLocalStorage() {
  localStorage.setItem("mascotas", JSON.stringify(mascotas));
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

function render() {
  total.textContent = mascotas.length;

  if (mascotas.length === 0) {
    listadoMascotas.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">No hay mascotas registradas.</td>
            </tr>
        `;
    return;
  }

  listadoMascotas.innerHTML = mascotas
    .map(
      (mascota) => `
        <tr>
            <td>${escaparHTML(mascota.nombreDuenio)}</td>
            <td>${escaparHTML(mascota.nombreMascota)}</td>
            <td>${escaparHTML(mascota.color)}</td>
            <td>${escaparHTML(mascota.edad)} años</td>
            <td>${escaparHTML(mascota.peso)} kg</td>
            <td>
                <div class="acciones">
                    <button class="btn btn-accion btn-editar" onclick="cargarParaEditar('${mascota.idMascota}')">Editar</button>
                    <button class="btn btn-accion btn-eliminar" onclick="eliminarMascota('${mascota.idMascota}')">Eliminar</button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("");
}

function leerFormulario(id) {
  const datos = new FormData(formulario);
  return {
    idMascota: id,
    nombreDuenio: datos.get("nombreDuenio").trim(),
    nombreMascota: datos.get("nombreMascota").trim(),
    color: datos.get("color").trim(),
    edad: Number(datos.get("edad")),
    peso: parseFloat(datos.get("peso")),
  };
}

function esValida(mascota) {
  return (
    mascota.nombreDuenio !== "" &&
    mascota.nombreMascota !== "" &&
    mascota.color !== "" &&
    Number.isInteger(mascota.edad) &&
    mascota.edad >= 0 &&
    Number.isFinite(mascota.peso) &&
    mascota.peso > 0
  );
}

function salirModoEdicion() {
  formulario.reset();
  idMascotaInput.value = "";
  botonAgregarMascota.textContent = "Agregar Mascota";
  tituloFormulario.textContent = "Nueva Mascota";
  botonCancelar.classList.add("d-none");
}

render();

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const idExistente = idMascotaInput.value;
  const mascota = leerFormulario(idExistente || crypto.randomUUID());

  if (!esValida(mascota)) {
    alert(
      "Revisá los datos: los textos no pueden estar vacíos, la edad debe ser un número entero y el peso mayor a 0.",
    );
    return;
  }

  if (idExistente) {
    mascotas = mascotas.map((m) => (m.idMascota === idExistente ? mascota : m));
  } else {
    mascotas.push(mascota);
  }

  guardarEnLocalStorage();
  render();
  salirModoEdicion();
});

botonCancelar.addEventListener("click", salirModoEdicion);

window.cargarParaEditar = function (id) {
  const mascotaAEditar = mascotas.find((m) => m.idMascota === id);
  if (!mascotaAEditar) return;

  idMascotaInput.value = mascotaAEditar.idMascota;
  document.getElementById("nombreDuenio").value = mascotaAEditar.nombreDuenio;
  document.getElementById("nombreMascota").value = mascotaAEditar.nombreMascota;
  document.getElementById("color").value = mascotaAEditar.color;
  document.getElementById("edad").value = mascotaAEditar.edad;
  document.getElementById("peso").value = mascotaAEditar.peso;

  botonAgregarMascota.textContent = "Modificar Mascota";
  tituloFormulario.textContent = "Editar Mascota";
  botonCancelar.classList.remove("d-none");

  // En pantallas chicas el formulario queda debajo de la tabla
  formulario.scrollIntoView({ behavior: "smooth", block: "center" });
  document.getElementById("nombreDuenio").focus({ preventScroll: true });
};

window.eliminarMascota = function (id) {
  if (!confirm("¿Estás seguro de que deseas eliminar esta mascota?")) return;

  mascotas = mascotas.filter((m) => m.idMascota !== id);
  guardarEnLocalStorage();
  render();

  // Si justo se estaba editando la mascota borrada, se limpia el formulario
  if (idMascotaInput.value === id) {
    salirModoEdicion();
  }
};
