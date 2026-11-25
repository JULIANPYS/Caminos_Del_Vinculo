# Caminos del Vínculo · Alineación con normas ISO y legislación colombiana

**Alcance importante:** una norma ISO se *certifica* sobre una organización y sus procesos, no sobre una página web.
Lo que este proyecto garantiza es que el **software está diseñado y construido conforme a los requisitos
de esas normas**, de modo que la copropiedad (o el desarrollador) pueda demostrarlo en una auditoría.
Conviene redactarlo así en la propuesta: *"desarrollado conforme a los lineamientos de ISO/IEC 27001, 25010…"*,
y no *"certificado ISO"*.

## 1. Normas aplicadas

| Norma | Qué exige | Cómo se aplica en el portal | Estado |
|---|---|---|---|
| **ISO/IEC 27001:2022** (seguridad de la información) | Control de acceso, registro de eventos, protección de datos | Roles con mínimo privilegio (el inquilino no ve cartera ni asambleas); cierre de sesión a los 15 min de inactividad; **bitácora de auditoría** de accesos y cambios (Admin › Bitácora); no se guardan datos bancarios (PSE) | Fase 1 ✔ (interfaz) · Fase 2: hash de contraseñas (bcrypt/Argon2), bloqueo tras 5 intentos, HTTPS/TLS, copias de seguridad, cabeceras de seguridad |
| **ISO/IEC 27701:2019** (privacidad) + **Ley 1581 de 2012** | Consentimiento, derechos del titular | Autorización en el login; política de datos publicada; panel «Privacidad y datos» con autorizaciones, **descarga de mis datos**, rectificación/supresión; datos de menores enmascarados | Fase 1 ✔ |
| **ISO 10002:2018** (gestión de quejas) + **Ley 1755 de 2015** | Radicado, plazos, seguimiento | PQRSF con número de radicado, clasificación (petición, queja, reclamo, sugerencia, felicitación), **fecha límite a 15 días hábiles** y alerta de vencidas para administración | Fase 1 ✔ |
| **ISO 9001:2015** (calidad) §7.5 información documentada | Control y trazabilidad de documentos | Documentos con código y versión (p. ej. CDV-POL-001); paz y salvo y recibos con **código de verificación** y sello de tiempo; biblioteca de reglamento, actas, financieros y pólizas | Fase 1 ✔ |
| **ISO/IEC 25010:2023** (calidad de producto de software) | Adecuación funcional, usabilidad, fiabilidad, seguridad, mantenibilidad, portabilidad | Código modular por rol (`admin.js`, `porteria.js`, `residente.js`), diseño responsive, sin dependencias externas, README y estructura documentada | Fase 1 ✔ · Fase 2: pruebas automatizadas y plan de pruebas QA |
| **ISO/IEC 40500:2012** (= WCAG 2.0 AA, accesibilidad) | Contraste, teclado, etiquetas, lectores de pantalla | Contraste AA en la paleta; enlace «Saltar al contenido»; foco visible; etiquetas asociadas a cada campo; diálogos con `aria-modal` y cierre con Esc; menú con `aria-current`; respeta «reducir movimiento» | Fase 1 ✔ |
| **ISO 8601** (fechas y horas) | Formato inequívoco | Todo se guarda como `2026-11-24T17:40:00-05:00`; se muestra en formato colombiano | Fase 1 ✔ |
| **ISO 4217** (monedas) | Código de moneda | Valores identificados como **COP** | Fase 1 ✔ |
| **ISO/IEC 12207** (ciclo de vida del software) | Proceso de desarrollo definido | Entregas por fases (Fase 1 interfaz, Fase 2 backend, Fase 3 despliegue y capacitación) con aceptación del cliente en cada una | Proceso |

## 2. Normas colombianas propias de un conjunto residencial

- **Ley 675 de 2001 (propiedad horizontal):** coeficiente de copropiedad, cuota calculada como presupuesto × coeficiente (art. 29), intereses de mora (art. 30), asambleas con quórum y poderes, reglamento y actas disponibles.
- **Ley 1801 de 2016 (Código de Policía):** censo de mascotas y aviso de perros potencialmente peligrosos.
- **Ley 1755 de 2015:** plazos de respuesta a peticiones.
- **Ley 1581 de 2012 y Decreto 1074 de 2015:** protección de datos personales.

## 3. Ideas adicionales sugeridas (para ofrecer al cliente)

1. **Código QR para visitantes:** el residente autoriza y el invitado recibe un QR que portería escanea.
2. **Notificaciones por WhatsApp** de paquetes y visitas (API oficial de WhatsApp Business).
3. **Asamblea virtual en vivo** con quórum en tiempo real y votación ponderada (muy pedida desde 2020).
4. **Mantenimiento preventivo:** calendario de ascensores, tanques, bombas y extintores con alertas y bitácora del proveedor.
5. **Facturación electrónica** de cuotas (DIAN) y conciliación automática de pagos PSE.
6. **Encuestas rápidas** a la comunidad y tablero de indicadores para el consejo (recaudo, PQRSF atendidas a tiempo).
7. **Objetos perdidos y clasificados** entre vecinos (servicios, ventas).
8. **Botón de emergencia / pánico** que alerta a portería con la unidad.
9. **Control de parqueadero de visitantes** con hora de ingreso y cobro por tiempo excedido.
10. **App instalable (PWA)** en el celular, sin pasar por tiendas de aplicaciones.
