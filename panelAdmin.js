if (!estaLogueado()) {
  window.location.href = "login.html";
}

function leerCantidad(clave) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave));
    return Array.isArray(datos) ? datos.length : 0;
  } catch {
    return 0;
  }
}

document.getElementById("nombre-usuario").textContent =
  sessionStorage.getItem("usuario") || "Administrador";

document.getElementById("total-mascotas").textContent =
  leerCantidad("mascotas") + " registradas";
document.getElementById("total-veterinarios").textContent =
  leerCantidad("veterinarios") + " registrados";
document.getElementById("total-turnos").textContent =
  leerCantidad("turnos") + " agendados";
document.getElementById("total-historias").textContent =
  leerCantidad("historiasClinicas") + " registros";
