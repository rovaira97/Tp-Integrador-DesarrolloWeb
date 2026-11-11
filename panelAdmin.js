if (!estaLogueado()) {
    window.location.href = 'login.html'
}

const mascotas = JSON.parse(localStorage.getItem('mascotas')) || [];

document.getElementById('nombre-usuario').textContent = sessionStorage.getItem('usuario');
document.getElementById('total-mascotas').textContent = mascotas.length + ' registradas';