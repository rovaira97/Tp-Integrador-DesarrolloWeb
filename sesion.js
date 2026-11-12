function obtenerToken() {
  return sessionStorage.getItem("accessToken");
}

function estaLogueado() {
  return obtenerToken() !== null;
}

function cerrarSesion() {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("usuario");
  window.location.href = "login.html";
}

function renderizarNavegacion() {
  const logueado = estaLogueado();
  const paginaActual =
    window.location.pathname.split("/").pop() || "index.html";

  const enlacesPublicos = [
    { href: "index.html", texto: "Inicio" },
    { href: "institucional.html", texto: "Institucional" },
    { href: "contacto.html", texto: "Contacto" },
  ];

  const enlacesPrivados = [
    { href: "panelAdmin.html", texto: "Panel" },
    { href: "mascotas.html", texto: "Mascotas" },
    { href: "veterinarios.html", texto: "Veterinarios" },
    { href: "turnos.html", texto: "Turnos" },
    { href: "historia-clinica.html", texto: "Historia Clínica" },
  ];

  const enlaces = logueado
    ? [...enlacesPublicos, ...enlacesPrivados]
    : enlacesPublicos;

  const navList = document.querySelector("#navbarNav .navbar-nav");
  if (navList) {
    navList.classList.add("align-items-lg-center");
    const itemsHTML = enlaces
      .map((item) => {
        const activo =
          paginaActual === item.href
            ? 'aria-current="page" class="nav-link active fw-semibold text-primary"'
            : 'class="nav-link"';
        return `<li class="nav-item"><a ${activo} href="${item.href}">${item.texto}</a></li>`;
      })
      .join("");

    const botonSesionHTML = logueado
      ? `<li class="nav-item ms-lg-3 mt-2 mt-lg-0">
           <button type="button" class="btn btn-outline-secondary btn-sm" onclick="cerrarSesion()">Cerrar sesión</button>
         </li>`
      : `<li class="nav-item ms-lg-3 mt-2 mt-lg-0">
           <a class="btn btn-primary btn-sm text-white" href="login.html">Iniciar sesión</a>
         </li>`;

    navList.innerHTML = itemsHTML + botonSesionHTML;
  }

  const footerNav = document.querySelector(".footer-nav");
  if (footerNav) {
    footerNav.innerHTML = enlaces
      .map((item) => `<li><a href="${item.href}">${item.texto}</a></li>`)
      .join("");
  }
}

document.addEventListener("DOMContentLoaded", renderizarNavegacion);
