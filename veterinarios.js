let veterinarios = cargarDesdeLocalStorage();

const listadoVeterinarios = document.getElementById("listado-veterinarios");
const totalVeterinarios = document.getElementById("total-veterinarios");
const formulario = document.getElementById("form-veterinario");
const idVeterinarioInput = document.getElementById("idVeterinario");
const botonGuardar = document.getElementById("botonGuardarVeterinario");
const botonCancelar = document.getElementById("botonCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

function cargarDesdeLocalStorage() {
  try {
    const datos = JSON.parse(localStorage.getItem("veterinarios"));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardarEnLocalStorage() {
  localStorage.setItem("veterinarios", JSON.stringify(veterinarios));
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
  totalVeterinarios.textContent = veterinarios.length;

  if (veterinarios.length === 0) {
    listadoVeterinarios.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-3">No hay veterinarios registrados.</td>
            </tr>
        `;
    return;
  }

  listadoVeterinarios.innerHTML = veterinarios
    .map(
      (vet) => `
        <tr>
            <td>${escaparHTML(vet.matricula)}</td>
            <td>${escaparHTML(vet.nombre)}</td>
            <td>${escaparHTML(vet.especializacion)}</td>
            <td>${formatoMoneda.format(vet.valorConsulta)}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-warning me-1" onclick="cargarParaEditar('${vet.idVeterinario}')">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="eliminarVeterinario('${vet.idVeterinario}')">Eliminar</button>
            </td>
        </tr>
    `,
    )
    .join("");
}

function leerFormulario(id) {
  const datos = new FormData(formulario);
  return {
    idVeterinario: id,
    matricula: Number(datos.get("matricula").trim()),
    nombre: datos.get("nombre").trim(),
    especializacion: datos.get("especializacion").trim(),
    valorConsulta: parseFloat(datos.get("valorConsulta")),
  };
}

function esValido(vet) {
  return (
    Number.isInteger(vet.matricula) &&
    vet.matricula > 0 &&
    vet.nombre !== "" &&
    vet.especializacion !== "" &&
    Number.isFinite(vet.valorConsulta) &&
    vet.valorConsulta > 0
  );
}

function matriculaRepetida(vet) {
  return veterinarios.some(
    (v) =>
      Number(v.matricula) === vet.matricula &&
      String(v.idVeterinario) !== String(vet.idVeterinario),
  );
}

function salirModoEdicion() {
  formulario.reset();
  idVeterinarioInput.value = "";
  botonGuardar.textContent = "Agregar Veterinario";
  tituloFormulario.textContent = "Nuevo Veterinario";
  botonCancelar.classList.add("d-none");
}

render();

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const idExistente = idVeterinarioInput.value;
  const vet = leerFormulario(idExistente || crypto.randomUUID());

  if (!esValido(vet)) {
    alert(
      "Revisá los datos: la matrícula debe ser un número entero, los textos no pueden estar vacíos y el valor de consulta debe ser mayor a 0.",
    );
    return;
  }

  if (matriculaRepetida(vet)) {
    alert("Ya existe un veterinario con esa matrícula.");
    return;
  }

  if (idExistente) {
    veterinarios = veterinarios.map((v) =>
      String(v.idVeterinario) === String(idExistente) ? vet : v,
    );
  } else {
    veterinarios.push(vet);
  }

  guardarEnLocalStorage();
  render();
  salirModoEdicion();
});

botonCancelar.addEventListener("click", salirModoEdicion);

window.cargarParaEditar = function (id) {
  const vet = veterinarios.find((v) => String(v.idVeterinario) === String(id));
  if (!vet) return;

  idVeterinarioInput.value = vet.idVeterinario;
  document.getElementById("matricula").value = vet.matricula;
  document.getElementById("nombre").value = vet.nombre;
  document.getElementById("especializacion").value = vet.especializacion;
  document.getElementById("valorConsulta").value = vet.valorConsulta;

  botonGuardar.textContent = "Modificar Veterinario";
  tituloFormulario.textContent = "Editar Veterinario";
  botonCancelar.classList.remove("d-none");

  // En pantallas chicas el formulario queda debajo de la tabla
  formulario.scrollIntoView({ behavior: "smooth", block: "center" });
  document.getElementById("matricula").focus({ preventScroll: true });
};

window.eliminarVeterinario = function (id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este veterinario?"))
    return;

  veterinarios = veterinarios.filter(
    (v) => String(v.idVeterinario) !== String(id),
  );
  guardarEnLocalStorage();
  render();

  // Si justo se estaba editando el veterinario borrado, se limpia el formulario
  if (String(idVeterinarioInput.value) === String(id)) {
    salirModoEdicion();
  }
};
