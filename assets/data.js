// Datos de demostración. Se guardan en localStorage para que lo que registra
// un rol (p. ej. Portería recibe un paquete) aparezca en el otro (Propietario).
// En la fase 2 este archivo se reemplaza por llamadas a la API REST.
const SEED = {
  unidades: [
    { id: 'T1-101', torre: 'Torre 1', apto: '101', propietario: 'Laura Méndez', inquilino: null, saldo: 0, tel: '310 555 0101' },
    { id: 'T1-102', torre: 'Torre 1', apto: '102', propietario: 'Carlos Rincón', inquilino: 'Andrea Pardo', saldo: 245000, tel: '311 555 0102',
      matricula: '051-2034871', catastral: '25754010200000102', coeficiente: 1.54, area: 62.4, parqueadero: 'P-118 (cubierto)', deposito: 'D-12', estrato: 3, uso: 'Arrendado' },
    { id: 'T2-201', torre: 'Torre 2', apto: '201', propietario: 'Martha Gómez', inquilino: null, saldo: 0, tel: '312 555 0201' },
    { id: 'T2-204', torre: 'Torre 2', apto: '204', propietario: 'Jorge Salazar', inquilino: 'Diego Torres', saldo: 490000, tel: '313 555 0204' },
    { id: 'T3-301', torre: 'Torre 3', apto: '301', propietario: 'Paola Ruiz', inquilino: null, saldo: 0, tel: '314 555 0301' },
    { id: 'T3-302', torre: 'Torre 3', apto: '302', propietario: 'Hernán Castro', inquilino: 'Sofía Vargas', saldo: 122500, tel: '315 555 0302' },
  ],
  pqr: [
    { id: 'PQR-110', unidad: 'T1-102', tipo: 'Mantenimiento de zonas comunes', asunto: 'Luminaria dañada en sótano', fecha: '2026-11-21', estado: 'En proceso' },
    { id: 'PQR-109', unidad: 'T2-204', tipo: 'Convivencia / Ruido', asunto: 'Ruido después de las 10 p. m.', fecha: '2026-11-19', estado: 'Radicada' },
    { id: 'PQR-104', unidad: 'T3-302', tipo: 'Facturación', asunto: 'Revisión de cobro de octubre', fecha: '2026-11-10', estado: 'Cerrada' },
    { id: 'PQR-098', unidad: 'T2-201', tipo: 'Seguridad', asunto: 'Puerta peatonal no cierra', fecha: '2026-11-02', estado: 'Rechazada' },
  ],
  visitas: [
    { id: 1, nombre: 'Juan Pérez', doc: '1.023.456.789', unidad: 'T1-101', placa: 'KLM-245', ingreso: '2026-11-24 08:15', salida: '2026-11-24 09:40', autorizada: true },
    { id: 2, nombre: 'Servientrega', doc: 'Mensajería', unidad: 'T3-302', placa: '', ingreso: '2026-11-24 10:05', salida: '2026-11-24 10:12', autorizada: true },
    { id: 3, nombre: 'María Rojas', doc: '52.789.123', unidad: 'T1-102', placa: '', ingreso: '2026-11-24 14:30', salida: null, autorizada: true },
  ],
  autorizaciones: [
    { id: 1, unidad: 'T1-102', nombre: 'María Rojas', fecha: '2026-11-24', nota: 'Visita familiar', estado: 'Usada' },
    { id: 2, unidad: 'T1-102', nombre: 'Técnico Claro', fecha: '2026-11-26', nota: 'Instalación de internet', estado: 'Vigente' },
  ],
  paquetes: [
    { id: 1, unidad: 'T1-102', empresa: 'Mercado Libre', desc: 'Caja mediana', recibido: '2026-11-24 11:20', entregado: null },
    { id: 2, unidad: 'T3-302', empresa: 'Servientrega', desc: 'Sobre', recibido: '2026-11-24 10:05', entregado: null },
    { id: 3, unidad: 'T1-101', empresa: 'Amazon', desc: 'Caja pequeña', recibido: '2026-11-23 16:45', entregado: '2026-11-23 19:02' },
  ],
  minuta: [
    { id: 1, hora: '2026-11-24 06:00', turno: 'Diurno', texto: 'Recibo turno sin novedad. Cámaras y citófono operando.', autor: 'Portería' },
    { id: 2, hora: '2026-11-24 12:40', turno: 'Diurno', texto: 'Se reporta luminaria apagada en sótano T1. Se informa a administración.', autor: 'Portería' },
  ],
  comunicados: [
    { id: 1, titulo: 'Asamblea general ordinaria', fecha: '2026-11-20', cuerpo: 'Se convoca a la asamblea el sábado 6 de diciembre a las 9:00 a. m. en el salón social.', destino: 'Todos' },
    { id: 2, titulo: 'Mantenimiento de tanques de agua', fecha: '2026-11-18', cuerpo: 'El jueves 27 de noviembre habrá suspensión del servicio entre 8:00 a. m. y 2:00 p. m.', destino: 'Todos' },
    { id: 3, titulo: 'Horario de mudanzas en diciembre', fecha: '2026-11-15', cuerpo: 'Las mudanzas se permiten de lunes a sábado de 8:00 a. m. a 5:00 p. m., con reserva previa.', destino: 'Todos' },
  ],
  reservas: [
    { id: 1, unidad: 'T2-201', zona: 'Salón social', fecha: '2026-11-29', hora: '14:00 – 20:00', estado: 'Aprobada' },
    { id: 2, unidad: 'T1-102', zona: 'BBQ', fecha: '2026-12-07', hora: '12:00 – 17:00', estado: 'Pendiente' },
  ],
  hogar: [
    { id: 1, unidad: 'T1-102', nombre: 'Andrea Pardo', parentesco: 'Arrendataria (titular)', doc: 'CC 1.014.223.876', tel: '316 555 7788', emergencia: false },
    { id: 2, unidad: 'T1-102', nombre: 'Tomás Pardo', parentesco: 'Hijo (menor de edad)', doc: 'TI ••••4521', tel: '', emergencia: false },
    { id: 3, unidad: 'T1-102', nombre: 'Rosa Vásquez', parentesco: 'Contacto de emergencia', doc: '', tel: '320 555 4410', emergencia: true },
  ],
  vehiculos: [
    { id: 1, unidad: 'T1-102', tipo: 'Automóvil', placa: 'JXQ-482', marca: 'Mazda 2', color: 'Gris', parqueadero: 'P-118' },
    { id: 2, unidad: 'T1-102', tipo: 'Motocicleta', placa: 'ABC-12F', marca: 'Yamaha NMAX', color: 'Negro', parqueadero: 'M-07' },
  ],
  mascotas: [
    { id: 1, unidad: 'T1-102', nombre: 'Luna', especie: 'Perro', raza: 'Criollo', vacunas: '2027-03-15', potencialmentePeligroso: false },
  ],
  asambleas: [
    { id: 1, titulo: 'Asamblea general ordinaria 2026', fecha: '2026-12-06T09:00', lugar: 'Salón social y transmisión virtual', tipo: 'Ordinaria', estado: 'Convocada',
      orden: ['Verificación del quórum', 'Lectura y aprobación del orden del día', 'Informe de administración y consejo', 'Estados financieros 2025', 'Presupuesto y cuota 2027', 'Elección de consejo y comité de convivencia', 'Proposiciones y varios'],
      votaciones: [
        { id: 'v1', pregunta: '¿Aprueba los estados financieros a 31 de diciembre de 2025?', opciones: ['Sí', 'No', 'Abstención'], voto: null },
        { id: 'v2', pregunta: '¿Aprueba el presupuesto 2027 con un incremento del 5,2 %?', opciones: ['Sí', 'No', 'Abstención'], voto: null },
      ] },
    { id: 2, titulo: 'Asamblea extraordinaria – impermeabilización de cubiertas', fecha: '2026-06-14T09:00', lugar: 'Salón social', tipo: 'Extraordinaria', estado: 'Realizada', orden: [], votaciones: [], acta: 'Acta N.º 14 de 2026' },
  ],
  poderes: [],
  solicitudes: [
    { id: 1, unidad: 'T1-102', tipo: 'Cambio de arrendatario', fecha: '2026-03-01', detalle: 'Ingreso de Andrea Pardo como arrendataria', estado: 'Aprobada' },
  ],
  documentos: [
    { id: 1, nombre: 'Reglamento de propiedad horizontal', cat: 'Normativo', fecha: '2019-05-10', tam: '2,4 MB' },
    { id: 2, nombre: 'Manual de convivencia (versión 3)', cat: 'Normativo', fecha: '2025-09-01', tam: '1,1 MB' },
    { id: 3, nombre: 'Acta N.º 14 – Asamblea extraordinaria', cat: 'Actas', fecha: '2026-06-14', tam: '640 KB' },
    { id: 4, nombre: 'Estados financieros a 31-12-2025', cat: 'Financiero', fecha: '2026-03-20', tam: '890 KB' },
    { id: 5, nombre: 'Presupuesto aprobado 2026', cat: 'Financiero', fecha: '2026-03-28', tam: '310 KB' },
    { id: 6, nombre: 'Póliza de áreas comunes 2026-2027', cat: 'Seguros', fecha: '2026-04-01', tam: '1,8 MB' },
    { id: 7, nombre: 'Política de tratamiento de datos personales', cat: 'Normativo', fecha: '2026-01-15', tam: '220 KB' },
  ],
  sanciones: [],
  bitacora: [
    { ts: '2026-11-24T08:02:11-05:00', usuario: 'Luis Herrera', rol: 'Portería', accion: 'Inicio de sesión', detalle: 'Portería principal' },
    { ts: '2026-11-24T07:45:03-05:00', usuario: 'Diana Moreno', rol: 'Administración', accion: 'Inicio de sesión', detalle: '' },
  ],
  pagos: [
    { id: 1, unidad: 'T1-102', concepto: 'Administración octubre', valor: 245000, fecha: '2026-10-05', estado: 'Pagado' },
    { id: 3, unidad: 'T1-102', concepto: 'Administración septiembre', valor: 245000, fecha: '2026-09-05', estado: 'Pagado' },
    { id: 2, unidad: 'T1-102', concepto: 'Administración noviembre', valor: 245000, fecha: '2026-11-05', estado: 'Pendiente' },
  ],
};

const DB = {
  key: 'cdv-demo-v2',
  load() {
    try { return JSON.parse(localStorage.getItem(this.key)) || structuredClone(SEED); }
    catch { return structuredClone(SEED); }
  },
  data: null,
  get(col) { if (!this.data) this.data = this.load(); return this.data[col]; },
  save() { localStorage.setItem(this.key, JSON.stringify(this.data)); },
  // Bitácora de auditoría (ISO/IEC 27001 A.8.15): toda creación o cambio queda registrada.
  log(accion, detalle = '') {
    const who = (typeof App !== 'undefined' && App.cfg) ? { usuario: App.cfg.user, rol: App.cfg.roleLabel } : { usuario: 'Sistema', rol: '—' };
    this.get('bitacora').unshift({ ts: fmt.iso(), ...who, accion, detalle }); this.save();
  },
  add(col, item) { const l = this.get(col); item.id = item.id ?? (Math.max(0, ...l.map(x => +x.id || 0)) + 1); l.unshift(item); this.save(); if (col !== 'bitacora') this.log('Creación', `${col} #${item.id}`); return item; },
  update(col, id, patch) { const it = this.get(col).find(x => x.id == id); Object.assign(it, patch); this.save(); this.log('Modificación', `${col} #${id}: ${Object.keys(patch).join(', ')}`); return it; },
  reset() { localStorage.removeItem(this.key); this.data = null; },
};

const fmt = {
  cop: v => '$ ' + Number(v).toLocaleString('es-CO'),   // moneda ISO 4217: COP
  // Fechas almacenadas en ISO 8601 con zona horaria de Colombia (UTC-05:00)
  iso: () => { const d = new Date(Date.now() - 5 * 3600e3); return d.toISOString().slice(0, 19) + '-05:00'; },
  date: s => new Date(s.length === 10 ? s + 'T12:00' : s.replace(' ', 'T')).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
  dt: s => new Date(s.length > 19 ? s : s.replace(' ', 'T')).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
  now: () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; },
  today: () => fmt.now().slice(0, 10),
};

// Suma días hábiles (lunes a viernes) para calcular el plazo de respuesta de una PQR:
// 15 días hábiles según la Ley 1755 de 2015, con seguimiento según ISO 10002.
function diasHabiles(desde, n) {
  const d = new Date(desde + 'T12:00'); let c = 0;
  while (c < n) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) c++; }
  return d.toISOString().slice(0, 10);
}
