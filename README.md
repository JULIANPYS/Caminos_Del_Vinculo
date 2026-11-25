# Caminos del Vínculo · Portal web (Fase 1: frontend)

Sitio público y portal por roles del Conjunto Residencial Caminos del Vínculo (Soacha).
HTML, CSS y JavaScript puro: no necesita instalar nada.

## Cómo abrirlo
Doble clic en `index.html` (o `login.html`). En el login elija el perfil y presione **Ingresar**
(en esta demostración cualquier contraseña funciona).

| Archivo | Vista |
|---|---|
| `index.html` | Sitio público: normas, zonas comunes, comunicados, PSE |
| `login.html` | Ingreso por rol (Propietario, Inquilino, Portería, Administración) |
| `admin.html` | Resumen, PQR, residentes, cartera, comunicados, reservas, registros de portería |
| `porteria.html` | Turno actual, visitantes y vehículos, correspondencia, minuta digital, citofonía |
| `propietario.html` (ampliado) | Ficha del inmueble (matrícula, coeficiente, parqueadero, depósito), personas del hogar, vehículos, mascotas, estado de cuenta con cálculo por coeficiente, paz y salvo y recibos imprimibles, asambleas con poderes y votación, solicitudes (mudanza, obra, materiales, arrendatario), PQRSF con plazos, documentos, privacidad |
| `inquilino.html` | Portal con acceso diferenciado: sin cartera, datos jurídicos ni asambleas |
| `politica-datos.html` | Política de tratamiento de datos personales (Ley 1581 de 2012) |

## Datos de demostración
`assets/data.js` guarda los datos en el navegador (localStorage), así que los roles se hablan entre sí:
si Portería recibe un paquete para Torre 1 · 102, el Propietario/Inquilino lo ve; si el residente
autoriza una visita, Portería la ve. Para volver a los datos iniciales, en la consola del navegador:
`DB.reset(); location.reload()`.

## Estructura
- `assets/styles.css` – sistema visual (azul petróleo #16324a, verde salvia #2f6f5e, tipografía Inter)
- `assets/icons.js` – iconos lineales (estilo Lucide) en lugar de emojis
- `assets/app.js` – estructura común de los paneles (menú, rutas, tablas, modales)
- `assets/admin.js`, `porteria.js`, `residente.js` – lógica de cada rol

## Normas ISO
Ver `CUMPLIMIENTO-ISO.md`: qué norma se aplica, cómo y en qué fase, más ideas adicionales para el cliente.

## Fase 2 (pendiente)
Backend con base de datos relacional y API REST, autenticación real con contraseñas cifradas,
envío de notificaciones por correo, pasarela PSE real y los módulos marcados como
"incluido en la siguiente fase" (encuestas, sanciones, recibos, usuarios y permisos, notificaciones).
`data.js` se reemplaza por llamadas a la API sin cambiar las pantallas.
