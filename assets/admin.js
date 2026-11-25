// Panel de Administración
const U = () => DB.get('unidades');
const label = id => { const u = U().find(x => x.id === id); return u ? `${u.torre} · ${u.apto}` : id; };

function resumen() {
  const pqr = DB.get('pqr'), abiertas = pqr.filter(p => p.estado === 'Radicada' || p.estado === 'En proceso');
  const cartera = U().reduce((s, u) => s + u.saldo, 0), mora = U().filter(u => u.saldo > 0).length;
  const paq = DB.get('paquetes').filter(p => !p.entregado).length;
  const res = DB.get('reservas').filter(r => r.estado === 'Pendiente').length;
  const recaudo = Math.round((1 - mora / U().length) * 100);
  return pageHead('Resumen general', 'Estado del conjunto al ' + fmt.date(fmt.today()), `<a class="btn btn-primary" href="#comunicados">${ico('plus')}Nuevo comunicado</a>`) +
  `<div class="kpis">
    ${kpi('PQR abiertas', abiertas.length, `${pqr.length} radicadas en total`, 'inbox')}
    ${kpi('Cartera vencida', fmt.cop(cartera), `${mora} unidades con saldo`, 'wallet')}
    ${kpi('Paquetes en portería', paq, 'Pendientes por entregar', 'box')}
    ${kpi('Reservas por aprobar', res, 'Zonas comunes', 'calendar')}
  </div>
  <div class="grid-2">
    ${card('PQR recientes', table([
      { h: 'Radicado', cls: 'id', v: p => '#' + p.id }, { h: 'Unidad', v: p => label(p.unidad) },
      { h: 'Asunto', v: p => esc(p.asunto) }, { h: 'Estado', v: p => tag(p.estado) }], pqr.slice(0, 5)), '<a class="link" href="#pqr">Ver todas</a>')}
    ${card('Recaudo del mes', `<div class="card-b">
      <div class="stat-row"><span class="muted">Unidades al día</span><b>${U().length - mora} de ${U().length}</b></div>
      <div style="margin:10px 0 18px"><div class="bar"><i style="width:${recaudo}%"></i></div><span class="muted" style="font-size:12px">${recaudo}% de recaudo</span></div>
      <div class="stat-row"><span class="muted">Cuota de administración</span><b>${fmt.cop(245000)}</b></div>
      <div class="stat-row"><span class="muted">Saldo por recaudar</span><b>${fmt.cop(cartera)}</b></div>
      <div class="stat-row"><span class="muted">Último pago recibido</span><b>05 nov 2026</b></div></div>`)}
  </div>
  <div class="grid-2e">
    ${card('Actividad de portería hoy', `<ul class="list">${DB.get('visitas').slice(0, 4).map(v => `<li><span class="ic">${ico('user')}</span><div><b>${esc(v.nombre)}</b><span>Visita a ${label(v.unidad)}</span></div><div class="r"><span class="muted">${fmt.dt(v.ingreso)}</span><br>${tag(v.salida ? 'Salió' : 'Dentro')}</div></li>`).join('')}</ul>`, '<a class="link" href="#registros">Ver registros</a>')}
    ${card('Comunicados publicados', `<ul class="list">${DB.get('comunicados').slice(0, 4).map(c => `<li><span class="ic">${ico('news')}</span><div><b>${esc(c.titulo)}</b><span>${fmt.date(c.fecha)} · ${c.destino}</span></div></li>`).join('')}</ul>`, '<a class="link" href="#comunicados">Gestionar</a>')}
  </div>`;
}

function pqrView() {
  const f = sessionStorage.getItem('pqrTorre') || '';
  const rows = DB.get('pqr').filter(p => !f || p.unidad.startsWith(f));
  return {
    html: pageHead('PQRSF', 'Peticiones, quejas, reclamos, sugerencias y felicitaciones · seguimiento según ISO 10002 y Ley 1755 de 2015', `
      <select id="ft"><option value="">Todas las torres</option>${['T1', 'T2', 'T3'].map(t => `<option ${f === t ? 'selected' : ''} value="${t}">Torre ${t[1]}</option>`).join('')}</select>
      <button class="btn btn-primary" id="nueva">${ico('plus')}Radicar PQR</button>`) +
      card(`Historial (${rows.length})`, table([
        { h: 'Radicado', cls: 'id', v: p => '#' + p.id }, { h: 'Unidad', v: p => label(p.unidad) }, { h: 'Tipo', v: p => esc(p.tipo) },
        { h: 'Asunto', v: p => esc(p.asunto) }, { h: 'Radicada', v: p => fmt.date(p.fecha) },
        { h: 'Plazo (15 días háb.)', v: p => { if (p.estado === 'Cerrada' || p.estado === 'Rechazada') return '—'; const d = diasHabiles(p.fecha, 15); return d < fmt.today() ? tag('Vencido') : fmt.date(d); } },
        { h: 'Estado', v: p => tag(p.estado) },
        { h: '', v: p => `<select data-st="${p.id}" style="height:30px;font-size:12px;width:130px">${['Radicada', 'En proceso', 'Cerrada', 'Rechazada'].map(s => `<option ${s === p.estado ? 'selected' : ''}>${s}</option>`).join('')}</select>` }], rows)),
    bind(v) {
      v.querySelector('#ft').onchange = e => { sessionStorage.setItem('pqrTorre', e.target.value); App.refresh(); };
      v.querySelectorAll('[data-st]').forEach(s => s.onchange = () => { DB.update('pqr', s.dataset.st, { estado: s.value }); UI.toast(`PQR #${s.dataset.st} actualizada a "${s.value}"`); App.refresh(); });
      v.querySelector('#nueva').onclick = () => UI.modal('Radicar PQR', pqrForm(), d => {
        const n = Math.max(...DB.get('pqr').map(p => +p.id.split('-')[1])) + 1;
        DB.add('pqr', { id: 'PQR-' + String(n).padStart(3, '0'), ...d, fecha: fmt.today(), estado: 'Radicada' });
        UI.toast('PQR radicada correctamente'); App.refresh();
      }, 'Radicar');
    },
  };
}
const pqrForm = (unidad) => `<div class="form-grid">
  ${unidad ? `<input type="hidden" name="unidad" value="${unidad}">` : `<div class="field"><label>Torre / Apartamento</label><select name="unidad">${unidadOptions()}</select></div>`}
  <div class="field ${unidad ? 'full' : ''}"><label>Tipo de solicitud</label><select name="tipo">${['Mantenimiento de zonas comunes', 'Convivencia / Ruido', 'Seguridad', 'Facturación', 'Infraestructura'].map(t => `<option>${t}</option>`).join('')}</select></div>
  <div class="field full"><label>Asunto</label><input class="input" name="asunto" required placeholder="Ej. Filtración en parqueadero"></div>
  <div class="field full"><label>Descripción</label><textarea name="desc" placeholder="Describa la situación con el mayor detalle posible"></textarea></div></div>`;

function residentes() {
  return {
    html: pageHead('Propietarios e inquilinos', 'Directorio de unidades y sus residentes', `<button class="btn btn-ghost">${ico('download')}Exportar</button><button class="btn btn-primary" id="add">${ico('plus')}Registrar residente</button>`) +
      card(`Unidades (${U().length})`, table([
        { h: 'Unidad', cls: 'id', v: u => `${u.torre} · ${u.apto}` }, { h: 'Propietario', v: u => esc(u.propietario) },
        { h: 'Inquilino', v: u => u.inquilino ? esc(u.inquilino) : '<span class="muted">Habitada por propietario</span>' },
        { h: 'Teléfono', v: u => u.tel }, { h: 'Cartera', v: u => tag(u.saldo ? 'En mora' : 'Al día') }], U())),
    bind(v) {
      v.querySelector('#add').onclick = () => UI.modal('Registrar inquilino', `<div class="field"><label>Unidad</label><select name="u">${unidadOptions()}</select></div>
        <div class="field"><label>Nombre completo</label><input class="input" name="n" required></div>
        <div class="field"><label>Correo</label><input class="input" type="email" name="c" placeholder="Se enviará la invitación de acceso"></div>`,
        d => { DB.update('unidades', d.u, { inquilino: d.n }); UI.toast('Residente registrado e invitación enviada'); App.refresh(); });
    },
  };
}

function cartera() {
  return {
    html: pageHead('Cartera y saldos', 'Estado de cuenta por unidad') +
      `<div class="kpis">${kpi('Saldo total', fmt.cop(U().reduce((s, u) => s + u.saldo, 0)), 'Por recaudar', 'wallet')}
        ${kpi('Unidades en mora', U().filter(u => u.saldo).length, 'Requieren seguimiento', 'bell')}
        ${kpi('Cuota mensual', fmt.cop(245000), 'Administración ordinaria', 'receipt')}
        ${kpi('Pagos PSE este mes', 4, '<b>+2</b> frente a octubre', 'card')}</div>` +
      card('Detalle por unidad', table([
        { h: 'Unidad', cls: 'id', v: u => `${u.torre} · ${u.apto}` }, { h: 'Responsable', v: u => esc(u.inquilino || u.propietario) },
        { h: 'Saldo', v: u => `<b>${fmt.cop(u.saldo)}</b>` }, { h: 'Estado', v: u => tag(u.saldo ? 'En mora' : 'Al día') },
        { h: '', v: u => u.saldo ? `<button class="btn btn-ghost btn-sm" data-pay="${u.id}">Registrar pago</button>` : '' }], U())),
    bind(v) {
      v.querySelectorAll('[data-pay]').forEach(b => b.onclick = () => {
        const u = U().find(x => x.id === b.dataset.pay);
        DB.add('pagos', { unidad: u.id, concepto: 'Abono a cartera', valor: u.saldo, fecha: fmt.today(), estado: 'Pagado' });
        DB.update('unidades', u.id, { saldo: 0 }); UI.toast(`Pago registrado para ${label(u.id)}`); App.refresh();
      });
    },
  };
}

function comunicados() {
  return {
    html: pageHead('Comunicados', 'Avisos oficiales visibles para propietarios e inquilinos', `<button class="btn btn-primary" id="n">${ico('plus')}Nuevo comunicado</button>`) +
      card('Publicados', `<ul class="list">${DB.get('comunicados').map(c => `<li><span class="ic">${ico('news')}</span><div><b>${esc(c.titulo)}</b><span>${esc(c.cuerpo)}</span></div><div class="r"><span class="muted">${fmt.date(c.fecha)}</span><br>${tag(c.destino === 'Todos' ? 'Vigente' : c.destino)}</div></li>`).join('')}</ul>`),
    bind(v) {
      v.querySelector('#n').onclick = () => UI.modal('Nuevo comunicado', `<div class="field"><label>Título</label><input class="input" name="titulo" required></div>
        <div class="field"><label>Mensaje</label><textarea name="cuerpo" required></textarea></div>
        <div class="field"><label>Dirigido a</label><select name="destino"><option>Todos</option><option>Propietarios</option><option>Inquilinos</option></select></div>`,
        d => { DB.add('comunicados', { ...d, fecha: fmt.today() }); UI.toast('Comunicado publicado'); App.refresh(); }, 'Publicar');
    },
  };
}

function reservas() {
  return {
    html: pageHead('Reservas de zonas comunes', 'Salón social, BBQ y demás espacios') +
      card('Solicitudes', table([
        { h: 'Zona', cls: 'id', v: r => esc(r.zona) }, { h: 'Unidad', v: r => label(r.unidad) }, { h: 'Fecha', v: r => fmt.date(r.fecha) },
        { h: 'Horario', v: r => r.hora }, { h: 'Estado', v: r => tag(r.estado) },
        { h: '', v: r => r.estado === 'Pendiente' ? `<button class="btn btn-accent btn-sm" data-ok="${r.id}">Aprobar</button>` : '' }], DB.get('reservas'))),
    bind(v) { v.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => { DB.update('reservas', b.dataset.ok, { estado: 'Aprobada' }); UI.toast('Reserva aprobada y notificada'); App.refresh(); }); },
  };
}

function solicitudesAdm() {
  const l = DB.get('solicitudes');
  return {
    html: pageHead('Solicitudes de residentes', 'Mudanzas, obras, materiales, cambios de arrendatario y datos personales') +
      card(`Bandeja (${l.filter(x => x.estado === 'En revisión').length} por revisar)`, table([
        { h: 'Unidad', cls: 'id', v: x => label(x.unidad) }, { h: 'Trámite', v: x => esc(x.tipo) }, { h: 'Detalle', v: x => esc(x.detalle) }, { h: 'Radicada', v: x => fmt.date(x.fecha) },
        { h: 'Estado', v: x => tag(x.estado === 'En revisión' ? 'Pendiente' : x.estado) },
        { h: '', v: x => x.estado === 'En revisión' ? `<button class="btn btn-accent btn-sm" data-ok="${x.id}">Aprobar</button> <button class="btn btn-ghost btn-sm" data-no="${x.id}">Rechazar</button>` : '' }], l)),
    bind(v) {
      v.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => { DB.update('solicitudes', b.dataset.ok, { estado: 'Aprobada' }); UI.toast('Solicitud aprobada y notificada'); App.refresh(); });
      v.querySelectorAll('[data-no]').forEach(b => b.onclick = () => { DB.update('solicitudes', b.dataset.no, { estado: 'Rechazada' }); UI.toast('Solicitud rechazada'); App.refresh(); });
    },
  };
}

function asambleasAdm() {
  const a = DB.get('asambleas').find(x => x.estado === 'Convocada'), U_ = U();
  const poderes = DB.get('poderes').filter(p => p.asamblea === a?.id);
  const coefTotal = 100, registrados = poderes.reduce((s, p) => s + (U_.find(x => x.id === p.unidad)?.coeficiente || 0), 0);
  return pageHead('Asambleas', 'Convocatoria, poderes recibidos y resultados ponderados por coeficiente') + (a ? `<div class="kpis">
      ${kpi('Próxima asamblea', fmt.date(a.fecha.slice(0, 10)), esc(a.tipo), 'calendar')}${kpi('Poderes recibidos', poderes.length, 'Firmados en el portal', 'file')}
      ${kpi('Quórum por poderes', registrados.toLocaleString('es-CO') + ' %', 'Se requiere más del 50 % de coeficientes', 'users')}${kpi('Puntos del orden del día', a.orden.length, '', 'clipboard')}</div>
    ${card('Poderes', table([{ h: 'Unidad', cls: 'id', v: p => label(p.unidad) }, { h: 'Apoderado', v: p => esc(p.apoderado) }, { h: 'Cédula', v: p => esc(p.doc) }, { h: 'Firmado', v: p => fmt.dt(p.ts) }], poderes, 'Aún no se han otorgado poderes desde el portal.'))}` : '');
}

function auditoria() {
  return pageHead('Bitácora de auditoría', 'Registro inalterable de accesos y cambios (ISO/IEC 27001, control A.8.15)', `<button class="btn btn-ghost">${ico('download')}Exportar CSV</button>`) +
    card('Eventos recientes', table([{ h: 'Fecha y hora (ISO 8601)', cls: 'id', v: b => `<span style="font-family:ui-monospace,monospace;font-size:12px">${b.ts}</span>` }, { h: 'Usuario', v: b => esc(b.usuario) }, { h: 'Rol', v: b => esc(b.rol) }, { h: 'Acción', v: b => esc(b.accion) }, { h: 'Detalle', v: b => esc(b.detalle) }], DB.get('bitacora').slice(0, 50)));
}

function registros() {
  return pageHead('Registros de portería', 'Consulta de visitantes y correspondencia (solo lectura)') +
    `<div class="grid-2e">${card('Visitantes', table([
      { h: 'Nombre', cls: 'id', v: x => esc(x.nombre) }, { h: 'Unidad', v: x => label(x.unidad) }, { h: 'Ingreso', v: x => fmt.dt(x.ingreso) }, { h: 'Estado', v: x => tag(x.salida ? 'Salió' : 'Dentro') }], DB.get('visitas')))}
    ${card('Correspondencia', table([
      { h: 'Empresa', cls: 'id', v: x => esc(x.empresa) }, { h: 'Unidad', v: x => label(x.unidad) }, { h: 'Recibido', v: x => fmt.dt(x.recibido) }, { h: 'Estado', v: x => tag(x.entregado ? 'Entregado' : 'Por entregar') }], DB.get('paquetes')))}</div>
    ${card('Minuta digital', `<ul class="list">${DB.get('minuta').map(m => `<li><span class="ic">${ico('clipboard')}</span><div><b>${m.turno} · ${fmt.dt(m.hora)}</b><span>${esc(m.texto)}</span></div></li>`).join('')}</ul>`)}`;
}

App.start({
  roleLabel: 'Administración', user: 'Diana Moreno', userSub: 'Administradora', bellTarget: 'pqr',
  nav: [
    { group: 'General', items: [
      { id: 'resumen', label: 'Resumen', icon: 'home', render: resumen },
      { id: 'comunicados', label: 'Comunicados', icon: 'news', render: comunicados },
      { id: 'notificaciones', label: 'Notificaciones', icon: 'bell', desc: 'Envío de alertas por correo y en el portal' },
    ]},
    { group: 'Comunidad', items: [
      { id: 'residentes', label: 'Propietarios e inquilinos', icon: 'users', render: residentes },
      { id: 'mascotas', label: 'Censo de mascotas', icon: 'paw', desc: 'Registro de mascotas por unidad y vacunación' },
      { id: 'asambleas', label: 'Asambleas y poderes', icon: 'users', render: asambleasAdm },
      { id: 'encuestas', label: 'Encuestas', icon: 'chart', desc: 'Consultas y votaciones a la comunidad' },
    ]},
    { group: 'Operación', items: [
      { id: 'pqr', label: 'PQRSF', icon: 'inbox', render: pqrView, badge: () => DB.get('pqr').filter(p => p.estado === 'Radicada').length },
      { id: 'reservas', label: 'Reservas y alquiler', icon: 'calendar', render: reservas, badge: () => DB.get('reservas').filter(r => r.estado === 'Pendiente').length },
      { id: 'solicitudes', label: 'Solicitudes', icon: 'truck', render: solicitudesAdm, badge: () => DB.get('solicitudes').filter(x => x.estado === 'En revisión').length },
      { id: 'registros', label: 'Registros de portería', icon: 'book', render: registros },
    ]},
    { group: 'Finanzas', items: [
      { id: 'cartera', label: 'Cartera y saldos', icon: 'wallet', render: cartera },
      { id: 'recibos', label: 'Pagos y recibos', icon: 'receipt', desc: 'Generación de recibos y conciliación PSE' },
      { id: 'sanciones', label: 'Sanciones', icon: 'scale', desc: 'Multas según el manual de convivencia' },
    ]},
    { group: 'Sistema', items: [
      { id: 'documentos', label: 'Documentos', icon: 'download', desc: 'Actas, reglamento y formatos descargables' },
      { id: 'perfiles', label: 'Usuarios y permisos', icon: 'shield', desc: 'Gestión de cuentas y roles' },
      { id: 'auditoria', label: 'Bitácora de auditoría', icon: 'eye', render: auditoria },
    ]},
  ],
});

if (!sessionStorage.getItem('cdv-login-admin')) { sessionStorage.setItem('cdv-login-admin', '1'); DB.log('Inicio de sesión', 'Panel de administración'); }
