// Panel de Portería
const label = id => { const u = DB.get('unidades').find(x => x.id === id); return u ? `${u.torre} · ${u.apto}` : id; };
const dentro = () => DB.get('visitas').filter(v => !v.salida);
const porEntregar = () => DB.get('paquetes').filter(p => !p.entregado);
const autHoy = () => DB.get('autorizaciones').filter(a => a.estado === 'Vigente');

function turno() {
  return {
    html: pageHead('Turno actual', 'Portería principal · ' + fmt.date(fmt.today()), `<button class="btn btn-ghost" id="nov">${ico('clipboard')}Anotar novedad</button><button class="btn btn-primary" id="vis">${ico('plus')}Registrar ingreso</button>`) +
    `<div class="kpis">${kpi('Visitantes dentro', dentro().length, 'En este momento', 'users')}
      ${kpi('Paquetes por entregar', porEntregar().length, 'En portería', 'box')}
      ${kpi('Visitas autorizadas', autHoy().length, 'Pre-registradas por residentes', 'key')}
      ${kpi('Novedades del turno', DB.get('minuta').length, 'Minuta digital', 'clipboard')}</div>
    <div class="grid-2">
      ${card('Visitantes dentro del conjunto', table([
        { h: 'Nombre', cls: 'id', v: x => esc(x.nombre) }, { h: 'Destino', v: x => label(x.unidad) }, { h: 'Placa', v: x => x.placa || '—' },
        { h: 'Ingreso', v: x => fmt.dt(x.ingreso) }, { h: '', v: x => `<button class="btn btn-ghost btn-sm" data-out="${x.id}">Marcar salida</button>` }], dentro(), 'No hay visitantes dentro del conjunto.'))}
      ${card('Visitas autorizadas', `<ul class="list">${autHoy().map(a => `<li><span class="ic">${ico('key')}</span><div><b>${esc(a.nombre)}</b><span>${label(a.unidad)} · ${esc(a.nota)}</span></div><div class="r">${tag('Vigente')}<br><span class="muted">${fmt.date(a.fecha)}</span></div></li>`).join('') || '<li class="muted">Sin autorizaciones vigentes</li>'}</ul>`)}
    </div>`,
    bind(v) {
      v.querySelector('#vis').onclick = ingreso; v.querySelector('#nov').onclick = novedad;
      v.querySelectorAll('[data-out]').forEach(b => b.onclick = () => { DB.update('visitas', b.dataset.out, { salida: fmt.now() }); UI.toast('Salida registrada'); App.refresh(); });
    },
  };
}
function ingreso() {
  UI.modal('Registrar ingreso de visitante', `<div class="form-grid">
    <div class="field"><label>Nombre completo</label><input class="input" name="nombre" required></div>
    <div class="field"><label>Documento</label><input class="input" name="doc" required></div>
    <div class="field"><label>Unidad de destino</label><select name="unidad">${unidadOptions()}</select></div>
    <div class="field"><label>Placa del vehículo (opcional)</label><input class="input" name="placa" placeholder="ABC-123"></div></div>
    <div class="notice"><span>${ico('phone')}</span>Si el visitante no está pre-autorizado, confirme por citófono con el residente antes de permitir el ingreso.</div>`,
    d => {
      const a = autHoy().find(a => a.unidad === d.unidad && a.nombre.toLowerCase() === d.nombre.toLowerCase());
      if (a) DB.update('autorizaciones', a.id, { estado: 'Usada' });
      DB.add('visitas', { ...d, placa: d.placa.toUpperCase(), ingreso: fmt.now(), salida: null, autorizada: !!a });
      UI.toast(a ? 'Ingreso registrado (visita pre-autorizada)' : 'Ingreso registrado'); App.refresh();
    }, 'Registrar ingreso');
}
function novedad() {
  UI.modal('Anotar novedad en la minuta', `<div class="field"><label>Turno</label><select name="turno"><option>Diurno</option><option>Nocturno</option></select></div>
    <div class="field"><label>Novedad</label><textarea name="texto" required></textarea></div>`,
    d => { DB.add('minuta', { ...d, hora: fmt.now(), autor: 'Portería' }); UI.toast('Novedad registrada en la minuta'); App.refresh(); });
}

function visitantes() {
  return {
    html: pageHead('Visitantes y vehículos', 'Historial de ingresos y salidas', `<button class="btn btn-primary" id="vis">${ico('plus')}Registrar ingreso</button>`) +
      card('Historial', table([
        { h: 'Nombre', cls: 'id', v: x => esc(x.nombre) }, { h: 'Documento', v: x => esc(x.doc) }, { h: 'Destino', v: x => label(x.unidad) },
        { h: 'Placa', v: x => x.placa || '—' }, { h: 'Ingreso', v: x => fmt.dt(x.ingreso) }, { h: 'Salida', v: x => x.salida ? fmt.dt(x.salida) : '—' },
        { h: 'Estado', v: x => tag(x.salida ? 'Salió' : 'Dentro') }], DB.get('visitas'))),
    bind(v) { v.querySelector('#vis').onclick = ingreso; },
  };
}

function correspondencia() {
  return {
    html: pageHead('Correspondencia', 'Recepción y entrega de paquetes', `<button class="btn btn-primary" id="rec">${ico('plus')}Recibir paquete</button>`) +
      card('Paquetes', table([
        { h: 'Empresa', cls: 'id', v: x => esc(x.empresa) }, { h: 'Descripción', v: x => esc(x.desc) }, { h: 'Unidad', v: x => label(x.unidad) },
        { h: 'Recibido', v: x => fmt.dt(x.recibido) }, { h: 'Estado', v: x => tag(x.entregado ? 'Entregado' : 'Por entregar') },
        { h: '', v: x => x.entregado ? `<span class="muted">${fmt.dt(x.entregado)}</span>` : `<button class="btn btn-accent btn-sm" data-ok="${x.id}">Entregar</button>` }], DB.get('paquetes'))),
    bind(v) {
      v.querySelector('#rec').onclick = () => UI.modal('Recibir paquete', `<div class="field"><label>Unidad</label><select name="unidad">${unidadOptions()}</select></div>
        <div class="form-grid"><div class="field"><label>Empresa / remitente</label><input class="input" name="empresa" required></div>
        <div class="field"><label>Descripción</label><input class="input" name="desc" placeholder="Caja, sobre…"></div></div>
        <div class="notice"><span>${ico('bell')}</span>El residente recibirá una notificación en el portal.</div>`,
        d => { DB.add('paquetes', { ...d, recibido: fmt.now(), entregado: null }); UI.toast('Paquete registrado y residente notificado'); App.refresh(); });
      v.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => { DB.update('paquetes', b.dataset.ok, { entregado: fmt.now() }); UI.toast('Entrega registrada'); App.refresh(); });
    },
  };
}

function minuta() {
  return {
    html: pageHead('Minuta digital', 'Libro de novedades del turno', `<button class="btn btn-primary" id="nov">${ico('plus')}Anotar novedad</button>`) +
      card('Novedades', `<ul class="list">${DB.get('minuta').map(m => `<li><span class="ic">${ico('clipboard')}</span><div><b>${m.turno} · ${fmt.dt(m.hora)}</b><span>${esc(m.texto)}</span></div></li>`).join('')}</ul>`),
    bind(v) { v.querySelector('#nov').onclick = novedad; },
  };
}

function citofonia() {
  return pageHead('Citofonía', 'Directorio de contacto por unidad') + card('Directorio', table([
    { h: 'Unidad', cls: 'id', v: u => `${u.torre} · ${u.apto}` }, { h: 'Residente', v: u => esc(u.inquilino || u.propietario) },
    { h: 'Teléfono', v: u => u.tel }, { h: '', v: u => `<a class="btn btn-ghost btn-sm" href="tel:${u.tel.replace(/ /g, '')}">${ico('phone')}Llamar</a>` }], DB.get('unidades')));
}

function vehiculosRes() {
  return {
    html: pageHead('Vehículos de residentes', 'Verificación de placas y cupos asignados') +
      `<div class="card"><div class="card-b toolbar"><input class="input" id="q" placeholder="Buscar placa, ej. JXQ-482" style="max-width:320px" aria-label="Buscar placa"></div><div id="res"></div></div>`,
    bind(v) {
      const draw = () => { const q = v.querySelector('#q').value.toUpperCase().replace(/\s/g, '');
        v.querySelector('#res').innerHTML = table([{ h: 'Placa', cls: 'id', v: x => esc(x.placa) }, { h: 'Tipo', v: x => esc(x.tipo) }, { h: 'Marca / color', v: x => `${esc(x.marca)} · ${esc(x.color)}` }, { h: 'Unidad', v: x => label(x.unidad) }, { h: 'Cupo', v: x => esc(x.parqueadero) }],
          DB.get('vehiculos').filter(x => x.placa.includes(q)), 'La placa no está registrada: trátelo como visitante.'); };
      v.querySelector('#q').oninput = draw; draw();
    },
  };
}

function pqrConsulta() {
  return pageHead('PQR', 'Consulta de solicitudes por unidad (solo lectura)') + card('Historial', table([
    { h: 'Radicado', cls: 'id', v: p => '#' + p.id }, { h: 'Unidad', v: p => label(p.unidad) }, { h: 'Asunto', v: p => esc(p.asunto) }, { h: 'Fecha', v: p => fmt.date(p.fecha) }, { h: 'Estado', v: p => tag(p.estado) }], DB.get('pqr')));
}

App.start({
  roleLabel: 'Portería', user: 'Luis Herrera', userSub: 'Turno diurno', bellTarget: 'correspondencia',
  nav: [
    { group: 'Turno', items: [
      { id: 'turno', label: 'Turno actual', icon: 'home', render: turno },
      { id: 'visitantes', label: 'Visitantes y vehículos', icon: 'users', render: visitantes, badge: () => dentro().length },
      { id: 'correspondencia', label: 'Correspondencia', icon: 'box', render: correspondencia, badge: () => porEntregar().length },
      { id: 'minuta', label: 'Minuta digital', icon: 'clipboard', render: minuta },
    ]},
    { group: 'Consulta', items: [
      { id: 'citofonia', label: 'Citofonía', icon: 'phone', render: citofonia },
      { id: 'vehiculos', label: 'Vehículos de residentes', icon: 'car', render: vehiculosRes },
      { id: 'pqr', label: 'PQR', icon: 'inbox', render: pqrConsulta },
      { id: 'mascotas', label: 'Censo de mascotas', icon: 'paw', desc: 'Consulta de mascotas registradas por unidad' },
    ]},
    { group: 'Autorizaciones', items: [
      { id: 'mudanzas', label: 'Mudanzas', icon: 'truck', desc: 'Trasteos autorizados por administración' },
      { id: 'materiales', label: 'Ingreso de materiales', icon: 'box', desc: 'Materiales y obras autorizadas' },
      { id: 'reservas', label: 'Reservas del día', icon: 'calendar', desc: 'Zonas comunes reservadas hoy' },
    ]},
  ],
});

if (!sessionStorage.getItem('cdv-login-porteria')) { sessionStorage.setItem('cdv-login-porteria', '1'); DB.log('Inicio de sesión', 'Portería principal'); }
