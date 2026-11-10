
let veterinarios = JSON.parse(localStorage.getItem('veterinarios')) || [];

const listadoVeterinarios = document.getElementById('listado-veterinarios');
const totalVeterinarios = document.getElementById('total-veterinarios');
const formulario = document.getElementById('form-veterinario');


function render() {
    
    listadoVeterinarios.innerHTML = '';

    if (veterinarios.length === 0) {
        listadoVeterinarios.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-3">No hay veterinarios registrados.</td>
            </tr>
        `;
        totalVeterinarios.textContent = 0;
        return;
    }

    veterinarios.forEach((vet) => {
        
        const valorMoneda = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(vet.valorConsulta);

        listadoVeterinarios.innerHTML += `
            <tr>
                <td>${vet.idVeterinario}</td>
                <td>${vet.matricula}</td>
                <td>${vet.nombre}</td>
                <td>${vet.especializacion}</td>
                <td>${valorMoneda}</td>
            </tr>
        `;
    });

    totalVeterinarios.textContent = veterinarios.length;
}


formulario.addEventListener('submit', function(e) {
    e.preventDefault();

    const matricula = document.getElementById('matricula').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const especializacion = document.getElementById('especializacion').value.trim();
    const valorConsulta = document.getElementById('valorConsulta').value.trim();

    if (matricula === '' || nombre === '' || especializacion === '' || valorConsulta === '') {
        alert('Todos los campos son obligatorios.');
        return;
    }

    if (parseFloat(valorConsulta) <= 0) {
        alert('El valor de consulta debe ser mayor a cero.');
        return;
    }

    const nuevoId = veterinarios.length > 0 
        ? veterinarios[veterinarios.length - 1].idVeterinario + 1 
        : 1;

    const nuevoVeterinario = {
        idVeterinario: nuevoId,
        matricula: matricula,
        nombre: nombre,
        especializacion: especializacion,
        valorConsulta: parseFloat(valorConsulta)
    };

    veterinarios.push(nuevoVeterinario);
    localStorage.setItem('veterinarios', JSON.stringify(veterinarios));

    render();
    formulario.reset();
});

render();