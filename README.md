# TP Final Integrador - Introducción al Desarrollo Web

Facultad de Ciencias de la Administración (UNER) — Tecnicatura Universitaria en Desarrollo Web

## Integrantes

- Vaira Rocío
- Pulleiro Laura
- Farias Gabriela
- Duarte Dylan

## Descripción

Sitio web de la clínica veterinaria **"La Mary"**, desarrollado con HTML5, CSS3, JavaScript (ES6+) y Bootstrap 5, utilizando Vite como servidor de desarrollo[cite: 3, 9].

### Páginas del sitio

**Vistas públicas:**

- **Inicio:** Portada institucional, servicios y catálogo de profesionales.
- **Institucional:** Historia de la clínica, metodología de trabajo y equipo veterinario.
- **Contacto:** Datos de atención, mapa de ubicación y formulario de consulta[cite: 2].
- **Iniciar Sesión:** Autenticación de usuarios administradores[cite: 5].

**Vistas privadas (requieren sesión iniciada):**

- **Panel de Administración:** Resumen general con contadores dinámicos y acceso a todos los módulos de gestión[cite: 11, 13].
- **Mascotas:** Administración de pacientes registrados[cite: 7].
- **Veterinarios:** Administración del equipo profesional[cite: 17].
- **Turnos:** Agenda de consultas, filtros y emisión de comprobantes[cite: 15].
- **Historia Clínica:** Registro de evoluciones médicas, ficha por mascota y exportación de datos.

## Funcionalidades implementadas

- **Autenticación y Control de Acceso:** Inicio de sesión conectado mediante `fetch` (`POST`) a la API de DummyJSON (`https://dummyjson.com/auth/login`). El token de sesión se persiste en `sessionStorage` para proteger las rutas privadas y renderizar dinámicamente la barra de navegación y el pie de página según el estado de sesión (`sesion.js`).
- **Persistencia en LocalStorage:** Cada entidad se almacena bajo su propia clave (`mascotas`, `veterinarios`, `turnos`, `historiasClinicas`) con identificadores únicos generados mediante `crypto.randomUUID()` y sanitización de entradas para prevenir XSS (`escaparHTML`).
- **Gestión de Mascotas y Veterinarios:** Operaciones CRUD completas (alta, listado, edición y baja con confirmación), validación de datos y control de matrícula única en veterinarios[cite: 18].
- **Gestión de Turnos:** Vinculación relacional entre mascotas y veterinarios, validación de disponibilidad horaria por profesional, filtrado combinado por veterinario y fecha, y generación de comprobante imprimible.
- **Historia Clínica:** Registro de consultas con peso, temperatura corporal, diagnóstico, tratamiento y próximo control; vista filtrada con ficha clínica completa por paciente y exportación de registros a formato CSV compatible con Excel.
