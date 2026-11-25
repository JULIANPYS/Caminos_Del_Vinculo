// Portal del residente. Un mismo código sirve a Propietario e Inquilino con acceso
// diferenciado (principio de mínimo privilegio, ISO/IEC 27001): el inquilino no ve
// datos jurídicos del inmueble, cartera, asambleas ni votaciones.
const UNIDAD = 'T1-102';
const ES_PROP = ROL === 'propietario';
const PRESUPUESTO_MENSUAL = 15909000;          // presupuesto aprobado 2026 (COP / mes)
const u = () => DB.get('unidades').find(x => x.id === UNIDAD);
const mis = col => DB.get(col).filter(x => x.unidad === UNIDAD);
const pendientes = () => mis('paquetes').filter(p => !p.entregado);
const nombreUsuario = () => ES_PROP ? u().propietario : u().inquilino;
const saludo = () => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'; };
const cuota = () => Math.round(PRESUPUESTO_MENSUAL * u().coeficiente / 100 / 500) * 500;
const TIPOS_PQR = ['Petición', 'Queja', 'Reclamo', 'Sugerencia', 'Felicitación'];
const AREAS_PQR = ['Mantenimiento de zonas comunes', 'Convivencia / Ruido', 'Seguridad', 'Facturación', 'Infraestructura', 'Portería'];

/* ---------------- Inicio ---------------- */
function inicio() {
  const asam = DB.get('asambleas').find(a => a.estado === 'Convocada');
  const pend = mis('solicitudes').filter(s => s.estado === 'En revisión').length;
  return {
    html: `<div class="card welcome"><div class="card-b"><div><span class="eyebrow" style="color:#9fb6ca">${u().torre} · Apartamento ${u().apto}${ES_PROP ? ` · Coeficiente ${u().coeficiente.toLocaleString('es-CO')} %` : ''}</span>
      <h2 style="margin-top:6px">${saludo()}, ${esc(nombreUsuario().split(' ')[0])}</h2><p>${pendientes().length ? `Tiene ${pendientes().length} paquete(s) esperando en portería.` : 'No tiene paquetes pendientes en portería.'}${pend ? ` ${pend} solicitud(es) en revisión.` : ''}</p></div>
      ${ES_PROP ? `<div style="text-align:right"><span style="font-size:12px;color:#9fb6ca">Saldo a la fecha (COP)</span><div style="font-size:26px;font-weight:600;margin:2px 0 10px">${fmt.cop(u().saldo)}</div>
      ${u().saldo ? `<a class="btn btn-accent" href="#cuenta">${ico('card')}Pagar con PSE</a>` : `<a class="btn btn-ghost" href="#cuenta">${ico('download')}Paz y salvo</a>`}</div>` : `<a class="btn btn-ghost" href="#visitas">${ico('key')}Autorizar una visita</a>`}</div></div>
    ${ES_PROP && asam ? `<div class="notice"><span>${ico('calendar')}</span><div><b>${esc(asam.titulo)}</b> · ${fmt.dt(asam.fecha)} · ${esc(asam.lugar)}. Puede revisar el orden del día, votar u otorgar poder. <a class="link" href="#asambleas">Ir a la asamblea</a></div></div>` : ''}
    <div class="qa">
      <a class="card" href="#visitas"><span class="ic">${ico('key')}</span><div><b>Autorizar visita</b><br><span>Pre-registre a sus invitados</span></div></a>
      <a class="card" href="#solicitudes"><span class="ic">${ico('truck')}</span><div><b>Solicitudes</b><br><span>Mudanzas, obras y materiales</span></div></a>
      <a class="card" href="#reservas"><span class="ic">${ico('calendar')}</span><div><b>Reservar zona común</b><br><span>Salón social, BBQ, cancha</span></div></a>
      <a class="card" href="#pqr"><span class="ic">${ico('msg')}</span><div><b>Radicar PQRSF</b><br><span>Respuesta en máx. 15 días hábiles</span></div></a>
    </div>
    <div class="grid-2">
      ${card('Comunicados de la administración', `<ul class="list">${DB.get('comunicados').slice(0, 3).map(c => `<li><span class="ic">${ico('news')}</span><div><b>${esc(c.titulo)}</b><span>${esc(c.cuerpo)}</span></div><div class="r muted">${fmt.date(c.fecha)}</div></li>`).join('')}</ul>`, '<a class="link" href="#avisos">Ver todos</a>')}
      ${card('Correspondencia', `<ul class="list">${mis('paquetes').slice(0, 4).map(p => `<li><span class="ic">${ico('box')}</span><div><b>${esc(p.empresa)}</b><span>${esc(p.desc)} · ${fmt.dt(p.recibido)}</span></div><div class="r">${tag(p.entregado ? 'Entregado' : 'Por entregar')}</div></li>`).join('') || '<li class="muted">Sin correspondencia</li>'}</ul>`, '<a class="link" href="#paquetes">Ver todo</a>')}
    </div>`,
  };
}

/* ---------------- Ficha del inmueble / Mi hogar ---------------- */
function ficha() {
  const x = u();
  const datos = ES_PROP ? [
    ['Matrícula inmobiliaria', x.matricula], ['Cédula catastral', x.catastral], ['Coeficiente de copropiedad', x.coeficiente.toLocaleString('es-CO') + ' %'], ['Área privada', x.area.toLocaleString('es-CO') + ' m²'],
    ['Parqueadero asignado', x.parqueadero], ['Depósito', x.deposito], ['Estrato', x.estrato], ['Uso actual', x.uso],
  ] : [['Unidad', `${x.torre} · Apto ${x.apto}`], ['Parqueadero asignado', x.parqueadero], ['Depósito', x.deposito], ['Propietario', x.propietario]];
  return {
    html: pageHead(ES_PROP ? 'Ficha del inmueble' : 'Mi hogar', ES_PROP ? 'Datos de la unidad privada según el reglamento de propiedad horizontal (Ley 675 de 2001)' : 'Personas, vehículos y mascotas registradas en la unidad',
      ES_PROP ? `<button class="btn btn-ghost" id="corr">${ico('file')}Solicitar corrección de datos</button>` : '') +
    `<div class="card"><div class="card-h"><h3>${x.torre} · Apartamento ${x.apto}</h3>${ES_PROP ? `<span class="tag t-info">${esc(x.uso)}</span>` : ''}</div>
      <div class="facts">${datos.map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div></div>
    ${ES_PROP && x.inquilino ? `<div class="notice"><span>${ico('users')}</span><div>La unidad está arrendada a <b>${esc(x.inquilino)}</b>. Usted conserva el acceso a cartera y asambleas; el arrendatario gestiona visitas, correspondencia y reservas. <a class="link" href="#solicitudes">Reportar cambio de arrendatario</a></div></div>` : ''}
    ${card('Personas que habitan la unidad', table([
      { h: 'Nombre', cls: 'id', v: p => esc(p.nombre) }, { h: 'Relación', v: p => esc(p.parentesco) }, { h: 'Documento', v: p => esc(p.doc) || '—' }, { h: 'Teléfono', v: p => p.tel || '—' }],
      mis('hogar')), `<button class="btn btn-ghost btn-sm" data-add="hogar">${ico('plus')}Agregar persona</button>`)}
    <div class="grid-2e">
      ${card('Vehículos registrados', table([
        { h: 'Placa', cls: 'id', v: v => esc(v.placa) }, { h: 'Tipo', v: v => esc(v.tipo) }, { h: 'Marca / color', v: v => `${esc(v.marca)} · ${esc(v.color)}` }, { h: 'Cupo', v: v => esc(v.parqueadero) }],
        mis('vehiculos')), `<button class="btn btn-ghost btn-sm" data-add="vehiculos">${ico('plus')}Agregar</button>`)}
      ${card('Mascotas (censo)', table([
        { h: 'Nombre', cls: 'id', v: m => esc(m.nombre) }, { h: 'Especie / raza', v: m => `${esc(m.especie)} · ${esc(m.raza)}` },
        { h: 'Vacunas vigentes hasta', v: m => `${fmt.date(m.vacunas)} ${new Date(m.vacunas) < new Date() ? tag('Vencido') : ''}` }],
        mis('mascotas')), `<button class="btn btn-ghost btn-sm" data-add="mascotas">${ico('plus')}Agregar</button>`)}
    </div>`,
    bind(v) {
      v.querySelector('#corr')?.addEventListener('click', () => UI.modal('Solicitar corrección de datos', `<div class="field"><label>Dato a corregir</label><select name="dato">${datos.map(d => `<option>${d[0]}</option>`).join('')}</select></div>
        <div class="field"><label>Valor correcto y soporte</label><textarea name="detalle" required placeholder="Indique el dato correcto. Administración puede pedir el certificado de tradición."></textarea></div>`,
        d => { DB.add('solicitudes', { unidad: UNIDAD, tipo: 'Corrección de datos', fecha: fmt.today(), detalle: `${d.dato}: ${d.detalle}`, estado: 'En revisión' }); UI.toast('Solicitud enviada a administración'); }, 'Enviar'));
      const forms = {
        hogar: ['Agregar persona', `<div class="field"><label>Nombre completo</label><input class="input" name="nombre" required></div><div class="form-grid">
          <div class="field"><label>Relación con la unidad</label><select name="parentesco"><option>Cónyuge / compañero(a)</option><option>Hijo(a)</option><option>Familiar</option><option>Empleada(o) doméstica(o)</option><option>Contacto de emergencia</option></select></div>
          <div class="field"><label>Teléfono</label><input class="input" name="tel" inputmode="tel"></div></div>
          <div class="notice"><span>${ico('shield')}</span>Los datos de menores de edad se muestran enmascarados y solo los ve administración.</div>`],
        vehiculos: ['Registrar vehículo', `<div class="form-grid"><div class="field"><label>Tipo</label><select name="tipo"><option>Automóvil</option><option>Motocicleta</option><option>Bicicleta</option></select></div>
          <div class="field"><label>Placa</label><input class="input" name="placa" required placeholder="ABC-123"></div>
          <div class="field"><label>Marca y línea</label><input class="input" name="marca" required></div><div class="field"><label>Color</label><input class="input" name="color" required></div></div>`],
        mascotas: ['Registrar mascota', `<div class="form-grid"><div class="field"><label>Nombre</label><input class="input" name="nombre" required></div>
          <div class="field"><label>Especie</label><select name="especie"><option>Perro</option><option>Gato</option><option>Otra</option></select></div>
          <div class="field"><label>Raza</label><input class="input" name="raza"></div><div class="field"><label>Vacunas vigentes hasta</label><input class="input" type="date" name="vacunas" required></div></div>
          <div class="notice warn"><span>${ico('paw')}</span>Si es un perro de raza potencialmente peligrosa (Ley 1801 de 2016), administración le pedirá la póliza y el registro.</div>`],
      };
      v.querySelectorAll('[data-add]').forEach(b => b.onclick = () => {
        const [t, f] = forms[b.dataset.add];
        UI.modal(t, f, d => {
          if (d.placa) d.placa = d.placa.toUpperCase();
          DB.add(b.dataset.add, { doc: '', ...d, unidad: UNIDAD, parqueadero: d.tipo === 'Motocicleta' ? 'M-07' : u().parqueadero.split(' ')[0] });
          UI.toast('Registro guardado. Portería ya puede verlo.'); App.refresh();
        });
      });
    },
  };
}

/* ---------------- Estado de cuenta ---------------- */
function cuenta() {
  const x = u(), c = cuota();
  return {
    html: pageHead('Estado de cuenta', `${x.torre} · Apartamento ${x.apto} · valores en pesos colombianos (COP)`,
      x.saldo ? `<button class="btn btn-accent" id="pse">${ico('card')}Pagar ${fmt.cop(x.saldo)} con PSE</button>` : `<button class="btn btn-primary" id="pys">${ico('download')}Descargar paz y salvo</button>`) +
      `<div class="kpis">${kpi('Saldo pendiente', fmt.cop(x.saldo), x.saldo ? 'Vence el día 5 de cada mes' : 'Está al día', 'wallet')}
       ${kpi('Cuota ordinaria', fmt.cop(c), `Coeficiente ${x.coeficiente.toLocaleString('es-CO')} %`, 'receipt')}
       ${kpi('Cuota extraordinaria', fmt.cop(0), 'Sin cuotas vigentes', 'building')}
       ${kpi('Intereses de mora', fmt.cop(0), 'Tasa máxima legal (art. 30, Ley 675)', 'scale')}</div>
      <div class="grid-2">
      ${card('Movimientos', table([{ h: 'Concepto', cls: 'id', v: p => esc(p.concepto) }, { h: 'Fecha', v: p => fmt.date(p.fecha) }, { h: 'Valor', v: p => `<b>${fmt.cop(p.valor)}</b>` }, { h: 'Estado', v: p => tag(p.estado) },
        { h: '', v: p => p.estado === 'Pagado' ? `<button class="link" style="background:none;border:0" data-rec="${p.id}">Recibo</button>` : '' }], mis('pagos')))}
      ${card('¿Cómo se calcula su cuota?', `<div class="card-b">
        <div class="stat-row"><span class="muted">Presupuesto mensual aprobado</span><b>${fmt.cop(PRESUPUESTO_MENSUAL)}</b></div>
        <div class="stat-row"><span class="muted">Coeficiente de la unidad</span><b>${x.coeficiente.toLocaleString('es-CO')} %</b></div>
        <div class="stat-row"><span class="muted">Cuota mensual</span><b>${fmt.cop(c)}</b></div>
        <p class="muted" style="font-size:12.5px;margin-top:12px">Las expensas comunes se distribuyen según el coeficiente de copropiedad del reglamento (Ley 675 de 2001, art. 29). El presupuesto lo aprueba la asamblea.</p></div>`)}
      </div>`,
    bind(v) {
      v.querySelector('#pse')?.addEventListener('click', () => UI.modal('Pago con PSE', `<div class="stat-row"><span class="muted">Concepto</span><b>Administración noviembre</b></div><div class="stat-row"><span class="muted">Valor</span><b>${fmt.cop(x.saldo)} COP</b></div>
        <div class="notice" style="margin:14px 0"><span>${ico('lock')}</span>Será redirigido a la pasarela segura de PSE. La plataforma no almacena datos bancarios. (En esta demostración el pago se simula.)</div>`,
        () => { mis('pagos').filter(p => p.estado === 'Pendiente').forEach(p => DB.update('pagos', p.id, { estado: 'Pagado' })); DB.update('unidades', UNIDAD, { saldo: 0 }); UI.toast('Pago aprobado. Ya puede descargar su paz y salvo.'); App.refresh(); }, 'Continuar a PSE'));
      v.querySelector('#pys')?.addEventListener('click', () => certificado('PAZ Y SALVO', `que la unidad <b>${x.torre}, apartamento ${x.apto}</b>, con matrícula inmobiliaria <b>${x.matricula}</b>, de propiedad de <b>${esc(x.propietario)}</b>, se encuentra a paz y salvo por concepto de expensas comunes ordinarias y extraordinarias, intereses y sanciones a la fecha de expedición.`));
      v.querySelectorAll('[data-rec]').forEach(b => b.onclick = () => { const p = mis('pagos').find(p => p.id == b.dataset.rec);
        certificado('RECIBO DE PAGO', `que se recibió de la unidad <b>${x.torre}, apartamento ${x.apto}</b> la suma de <b>${fmt.cop(p.valor)} COP</b> por concepto de <b>${esc(p.concepto)}</b>, con fecha ${fmt.date(p.fecha)}.`); });
    },
  };
}

// Documento imprimible con código de verificación (trazabilidad, ISO 9001 §7.5)
function certificado(titulo, cuerpo) {
  const cod = 'CDV-' + Date.now().toString(36).toUpperCase();
  DB.log('Expedición de documento', `${titulo} ${cod}`);
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${titulo} ${cod}</title><link rel="stylesheet" href="assets/styles.css">
    <style>body{background:#fff;padding:56px;max-width:760px;margin:auto}h1{font-size:20px;letter-spacing:.08em;text-align:center;margin:40px 0 28px}p{font-size:14.5px;line-height:1.8;margin-bottom:14px}.f{margin-top:70px;border-top:1px solid #0f1f2e;width:260px;padding-top:6px;font-size:13px}.v{margin-top:48px;font-size:11.5px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:12px}@media print{.np{display:none}}</style></head>
    <body><div class="logo"><span class="mark">CV</span><span>Conjunto Residencial Caminos del Vínculo – Propiedad Horizontal<small>NIT 900.000.000-0 · Soacha, Cundinamarca</small></span></div>
    <h1>${titulo}</h1><p>La administración del Conjunto Residencial Caminos del Vínculo certifica ${cuerpo}</p>
    <p>Se expide en Soacha el ${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
    <div class="f"><b>Administración</b><br>Representante legal</div>
    <div class="v">Código de verificación: <b>${cod}</b> · Expedido: ${fmt.iso()} · Documento generado electrónicamente.</div>
    <p class="np" style="margin-top:24px"><button class="btn btn-primary" onclick="print()">Imprimir o guardar en PDF</button></p></body></html>`);
  w.document.close();
}

/* ---------------- Asambleas ---------------- */
function asambleas() {
  const lista = DB.get('asambleas'), a = lista.find(x => x.estado === 'Convocada');
  const poder = DB.get('poderes').find(p => p.unidad === UNIDAD && p.asamblea === a?.id);
  return {
    html: pageHead('Asambleas', 'Convocatorias, orden del día, poderes y votaciones ponderadas por coeficiente') +
      (a ? `<div class="grid-2">
        ${card(esc(a.titulo), `<div class="card-b" style="padding-bottom:4px"><div class="chip-row">${tag('Vigente')}<span class="tag t-neutral">${a.tipo}</span></div>
          <div class="stat-row" style="margin-top:12px"><span class="muted">Fecha y hora</span><b>${fmt.dt(a.fecha)}</b></div><div class="stat-row"><span class="muted">Lugar</span><b>${esc(a.lugar)}</b></div>
          <div class="stat-row"><span class="muted">Su coeficiente de voto</span><b>${u().coeficiente.toLocaleString('es-CO')} %</b></div><p class="eyebrow" style="margin-top:16px">Orden del día</p></div>
          <ol class="agenda">${a.orden.map(o => `<li>${esc(o)}</li>`).join('')}</ol>`)}
        ${card('Representación', `<div class="card-b">${poder ? `<div class="notice"><span>${ico('check')}</span><div>Otorgó poder a <b>${esc(poder.apoderado)}</b> (CC ${esc(poder.doc)}). El apoderado votará en su nombre.</div></div>
          <button class="btn btn-ghost" style="margin-top:14px;width:100%" id="revocar">Revocar poder</button>`
          : `<p class="muted" style="margin-bottom:14px">Si no puede asistir, puede otorgar poder a otra persona para que lo represente (Ley 675 de 2001).</p><button class="btn btn-primary" style="width:100%" id="poder">${ico('file')}Otorgar poder</button>`}
          <p class="muted" style="font-size:12px;margin-top:14px">Cada propietario puede representar como máximo los poderes que fije el reglamento.</p></div>`)}
      </div>
      ${card('Votaciones', a.votaciones.map(q => `<div class="vote"><p>${esc(q.pregunta)}</p><div class="opts" role="group" aria-label="${esc(q.pregunta)}">${q.opciones.map(o => `<button aria-pressed="${q.voto === o}" class="${q.voto === o ? 'sel' : ''}" data-q="${q.id}" data-o="${o}" ${poder ? 'disabled' : ''}>${o}</button>`).join('')}</div>
        <p class="muted" style="font-size:12px;font-weight:400;margin:8px 0 0">${q.voto ? `Voto registrado: ${q.voto} · pondera ${u().coeficiente.toLocaleString('es-CO')} %` : poder ? 'Votará su apoderado' : 'Seleccione una opción. En la asamblea real se habilita al verificarse el quórum.'}</p></div>`).join(''))}` : '') +
      card('Asambleas anteriores', table([{ h: 'Asamblea', cls: 'id', v: x => esc(x.titulo) }, { h: 'Fecha', v: x => fmt.date(x.fecha.slice(0, 10)) }, { h: 'Tipo', v: x => x.tipo }, { h: 'Acta', v: x => x.acta ? `<a class="link" href="#documentos">${esc(x.acta)}</a>` : '—' }], lista.filter(x => x.estado === 'Realizada'))),
    bind(v) {
      v.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { const q = a.votaciones.find(q => q.id === b.dataset.q); q.voto = b.dataset.o; DB.save(); DB.log('Voto en asamblea', `${a.titulo}: ${q.id}`); UI.toast('Voto registrado'); App.refresh(); });
      v.querySelector('#poder')?.addEventListener('click', () => UI.modal('Otorgar poder', `<div class="field"><label>Nombre del apoderado</label><input class="input" name="apoderado" required></div>
        <div class="field"><label>Cédula del apoderado</label><input class="input" name="doc" required inputmode="numeric"></div>
        <div class="notice"><span>${ico('shield')}</span>El poder queda firmado electrónicamente con su usuario, fecha y hora, y se envía a administración para verificar el quórum.</div>`,
        d => { DB.get('poderes').push({ unidad: UNIDAD, asamblea: a.id, ...d, ts: fmt.iso() }); DB.save(); DB.log('Poder otorgado', `${a.titulo} → ${d.apoderado}`); UI.toast('Poder registrado'); App.refresh(); }, 'Firmar y enviar'));
      v.querySelector('#revocar')?.addEventListener('click', () => { DB.data.poderes = DB.get('poderes').filter(p => !(p.unidad === UNIDAD && p.asamblea === a.id)); DB.save(); DB.log('Poder revocado', a.titulo); UI.toast('Poder revocado'); App.refresh(); });
    },
  };
}

/* ---------------- Solicitudes ---------------- */
function solicitudes() {
  const tipos = ES_PROP ? ['Mudanza / trasteo', 'Obra o reforma', 'Ingreso de materiales', 'Cambio de arrendatario', 'Certificado de residencia'] : ['Mudanza / trasteo', 'Ingreso de materiales', 'Certificado de residencia'];
  return {
    html: pageHead('Solicitudes', 'Trámites que requieren autorización de administración', `<button class="btn btn-primary" id="n">${ico('plus')}Nueva solicitud</button>`) +
      `<div class="notice"><span>${ico('clock')}</span>Mudanzas: lunes a sábado de 8:00 a. m. a 5:00 p. m., con 3 días hábiles de anticipación. Obras: requieren descripción y, si afectan estructura o fachada, aprobación del consejo.</div>` +
      card('Mis solicitudes', table([{ h: 'Tipo', cls: 'id', v: s => esc(s.tipo) }, { h: 'Detalle', v: s => esc(s.detalle) }, { h: 'Radicada', v: s => fmt.date(s.fecha) }, { h: 'Estado', v: s => tag(s.estado === 'En revisión' ? 'Pendiente' : s.estado) }], mis('solicitudes'))),
    bind(v) {
      v.querySelector('#n').onclick = () => UI.modal('Nueva solicitud', `<div class="field"><label>Tipo de trámite</label><select name="tipo">${tipos.map(t => `<option>${t}</option>`).join('')}</select></div>
        <div class="field"><label>Fecha programada</label><input class="input" type="date" name="fprog" min="${diasHabiles(fmt.today(), 3)}" value="${diasHabiles(fmt.today(), 3)}"></div>
        <div class="field"><label>Detalle</label><textarea name="detalle" required placeholder="Ej. empresa de trasteo, vehículo, materiales, alcance de la obra…"></textarea></div>`,
        d => { DB.add('solicitudes', { unidad: UNIDAD, tipo: d.tipo, fecha: fmt.today(), detalle: `${d.detalle} (para el ${fmt.date(d.fprog)})`, estado: 'En revisión' }); UI.toast('Solicitud radicada. Recibirá respuesta en el portal.'); App.refresh(); }, 'Radicar');
    },
  };
}

/* ---------------- Correspondencia, visitas, reservas ---------------- */
function paquetes() {
  return pageHead('Correspondencia', 'Paquetes y sobres recibidos en portería') + card('Historial', table([
    { h: 'Remitente', cls: 'id', v: p => esc(p.empresa) }, { h: 'Descripción', v: p => esc(p.desc) }, { h: 'Recibido', v: p => fmt.dt(p.recibido) },
    { h: 'Estado', v: p => tag(p.entregado ? 'Entregado' : 'Por entregar') }, { h: 'Entregado', v: p => p.entregado ? fmt.dt(p.entregado) : '—' }], mis('paquetes'), 'Cuando portería reciba algo para usted, aparecerá aquí.'));
}

function visitas() {
  return {
    html: pageHead('Visitas', 'Pre-autorice el ingreso de sus invitados', `<button class="btn btn-primary" id="aut">${ico('plus')}Autorizar visita</button>`) +
      `<div class="grid-2e">${card('Autorizaciones', table([{ h: 'Invitado', cls: 'id', v: a => esc(a.nombre) }, { h: 'Fecha', v: a => fmt.date(a.fecha) }, { h: 'Motivo', v: a => esc(a.nota) }, { h: 'Estado', v: a => tag(a.estado) }], mis('autorizaciones')))}
      ${card('Visitas recibidas', table([{ h: 'Visitante', cls: 'id', v: x => esc(x.nombre) }, { h: 'Ingreso', v: x => fmt.dt(x.ingreso) }, { h: 'Estado', v: x => tag(x.salida ? 'Salió' : 'Dentro') }], mis('visitas')))}</div>`,
    bind(v) {
      v.querySelector('#aut').onclick = () => UI.modal('Autorizar visita', `<div class="field"><label>Nombre del invitado</label><input class="input" name="nombre" required></div>
        <div class="form-grid"><div class="field"><label>Fecha</label><input class="input" type="date" name="fecha" value="${fmt.today()}" min="${fmt.today()}" required></div>
        <div class="field"><label>Motivo</label><input class="input" name="nota" placeholder="Visita familiar, técnico…"></div></div>
        <div class="notice"><span>${ico('shield')}</span>Portería verá esta autorización y no tendrá que llamarle por citófono.</div>`,
        d => { DB.add('autorizaciones', { ...d, unidad: UNIDAD, estado: 'Vigente' }); UI.toast('Visita autorizada. Portería ya fue informada.'); App.refresh(); }, 'Autorizar');
    },
  };
}

function reservas() {
  return {
    html: pageHead('Reservas', 'Zonas comunes del conjunto', `<button class="btn btn-primary" id="n">${ico('plus')}Nueva reserva</button>`) +
      card('Mis reservas', table([{ h: 'Zona', cls: 'id', v: r => esc(r.zona) }, { h: 'Fecha', v: r => fmt.date(r.fecha) }, { h: 'Horario', v: r => r.hora }, { h: 'Estado', v: r => tag(r.estado) }], mis('reservas'))),
    bind(v) {
      v.querySelector('#n').onclick = () => {
        if (ES_PROP && u().saldo) return UI.modal('Reserva no disponible', `<div class="notice warn"><span>${ico('wallet')}</span>Según el manual de convivencia, las reservas requieren estar a paz y salvo. Su saldo es ${fmt.cop(u().saldo)}.</div>`, () => { location.hash = 'cuenta'; }, 'Ir a pagar');
        UI.modal('Nueva reserva', `<div class="field"><label>Zona</label><select name="zona"><option>Salón social</option><option>BBQ</option><option>Cancha múltiple</option></select></div>
        <div class="form-grid"><div class="field"><label>Fecha</label><input class="input" type="date" name="fecha" required value="${fmt.today()}" min="${fmt.today()}"></div><div class="field"><label>Horario</label><select name="hora"><option>08:00 – 13:00</option><option>14:00 – 20:00</option></select></div></div>
        <label class="chk" style="font-size:13px"><input type="checkbox" required> Acepto el reglamento de uso y el depósito reembolsable.</label>`,
        d => { DB.add('reservas', { zona: d.zona, fecha: d.fecha, hora: d.hora, unidad: UNIDAD, estado: 'Pendiente' }); UI.toast('Solicitud enviada a administración'); App.refresh(); }, 'Solicitar');
      };
    },
  };
}

/* ---------------- PQRSF (ISO 10002 / Ley 1755 de 2015) ---------------- */
function pqr() {
  return {
    html: pageHead('PQRSF', 'Peticiones, quejas, reclamos, sugerencias y felicitaciones', `<button class="btn btn-primary" id="n">${ico('plus')}Radicar</button>`) +
      `<div class="notice"><span>${ico('clock')}</span>Toda solicitud recibe número de radicado y respuesta dentro de 15 días hábiles. Puede consultar el estado en cualquier momento.</div>` +
      card('Historial', table([{ h: 'Radicado', cls: 'id', v: p => '#' + p.id }, { h: 'Tipo', v: p => esc(p.clase || 'Petición') }, { h: 'Asunto', v: p => esc(p.asunto) }, { h: 'Radicada', v: p => fmt.date(p.fecha) },
        { h: 'Responder antes de', v: p => p.estado === 'Cerrada' || p.estado === 'Rechazada' ? '—' : fmt.date(diasHabiles(p.fecha, 15)) }, { h: 'Estado', v: p => tag(p.estado) }], mis('pqr'))),
    bind(v) {
      v.querySelector('#n').onclick = () => UI.modal('Radicar PQRSF', `<div class="form-grid"><div class="field"><label>Tipo</label><select name="clase">${TIPOS_PQR.map(t => `<option>${t}</option>`).join('')}</select></div>
        <div class="field"><label>Área</label><select name="tipo">${AREAS_PQR.map(t => `<option>${t}</option>`).join('')}</select></div></div>
        <div class="field"><label>Asunto</label><input class="input" name="asunto" required maxlength="120"></div><div class="field"><label>Descripción</label><textarea name="desc" required></textarea></div>`,
        d => { const n = Math.max(...DB.get('pqr').map(p => +p.id.split('-')[1])) + 1; DB.add('pqr', { id: 'PQR-' + String(n).padStart(3, '0'), unidad: UNIDAD, ...d, fecha: fmt.today(), estado: 'Radicada' });
          UI.toast(`Radicado #PQR-${n}. Fecha límite de respuesta: ${fmt.date(diasHabiles(fmt.today(), 15))}`); App.refresh(); }, 'Radicar');
    },
  };
}

/* ---------------- Información de la copropiedad ---------------- */
function avisos() {
  return pageHead('Comunicados', 'Avisos oficiales de la administración') + card('Todos los comunicados', `<ul class="list">${DB.get('comunicados').filter(c => c.destino === 'Todos' || c.destino === (ES_PROP ? 'Propietarios' : 'Inquilinos')).map(c => `<li><span class="ic">${ico('news')}</span><div><b>${esc(c.titulo)}</b><span>${esc(c.cuerpo)}</span></div><div class="r muted">${fmt.date(c.fecha)}</div></li>`).join('')}</ul>`);
}

function documentos() {
  const docs = DB.get('documentos').filter(d => ES_PROP || d.cat === 'Normativo');
  return pageHead('Documentos de la copropiedad', ES_PROP ? 'Reglamento, actas, estados financieros, presupuesto y pólizas' : 'Reglamento, manual de convivencia y política de datos') +
    card(`Biblioteca (${docs.length})`, table([{ h: 'Documento', cls: 'id', v: d => esc(d.nombre) }, { h: 'Categoría', v: d => `<span class="tag t-neutral">${d.cat}</span>` }, { h: 'Publicado', v: d => fmt.date(d.fecha) }, { h: 'Tamaño', v: d => d.tam },
      { h: '', v: () => `<button class="btn btn-ghost btn-sm">${ico('download')}PDF</button>` }], docs));
}

function convivencia() {
  const n = [['car', 'Velocidad en parqueaderos', 'Máximo 10 km/h en todas las áreas comunes.'], ['paw', 'Tenencia de mascotas', 'Recoger los desechos y usar traílla en zonas comunes (Ley 1801 de 2016).'], ['cart', 'Carros de mercado', 'No obstruir pasillos ni ascensores; devolverlos a su lugar.'], ['clock', 'Horario de silencio', 'De 10:00 p. m. a 7:00 a. m. todos los días.']];
  return pageHead('Manual de convivencia', 'Normas principales del conjunto', `<a class="btn btn-ghost" href="#documentos">${ico('download')}Manual completo</a>`) +
    `<div class="grid-2e">${n.map(([i, t, d]) => `<div class="card rule"><div class="ic">${ico(i)}</div><h4>${t}</h4><p>${d}</p></div>`).join('')}</div>`;
}

/* ---------------- Privacidad (Ley 1581 de 2012 / ISO/IEC 27701) ---------------- */
function privacidad() {
  const k = 'cdv-consent-' + ROL, c = JSON.parse(localStorage.getItem(k) || '{"correo":true,"sms":false,"directorio":false}');
  const ops = [['correo', 'Notificaciones por correo', 'Paquetes, visitas, comunicados y respuestas a PQRSF'], ['sms', 'Mensajes de texto / WhatsApp', 'Solo avisos urgentes de portería'], ['directorio', 'Aparecer en el directorio de citofonía', 'Portería podrá ver su teléfono para anunciar visitas']];
  return {
    html: pageHead('Privacidad y datos personales', 'Usted decide cómo se usan sus datos (Ley 1581 de 2012, habeas data)') +
      `<div class="grid-2">${card('Autorizaciones', ops.map(([id, t, d]) => `<label class="switch"><div><b>${t}</b><span>${d}</span></div><input type="checkbox" data-c="${id}" ${c[id] ? 'checked' : ''}></label>`).join(''))}
      ${card('Sus derechos', `<div class="card-b"><p class="muted" style="margin-bottom:14px">Puede conocer, actualizar, rectificar y solicitar la supresión de sus datos en cualquier momento.</p>
        <button class="btn btn-ghost" style="width:100%;margin-bottom:8px" id="exp">${ico('download')}Descargar mis datos (JSON)</button>
        <button class="btn btn-ghost" style="width:100%;margin-bottom:8px" id="sup">${ico('file')}Solicitar rectificación o supresión</button>
        <a class="link" href="politica-datos.html">Leer la política de tratamiento de datos</a></div>`)}</div>
      ${card('Actividad reciente de su cuenta', table([{ h: 'Fecha y hora', cls: 'id', v: b => fmt.dt(b.ts) }, { h: 'Acción', v: b => esc(b.accion) }, { h: 'Detalle', v: b => esc(b.detalle) }],
        DB.get('bitacora').filter(b => b.usuario === nombreUsuario()).slice(0, 10), 'Aquí verá los inicios de sesión y cambios hechos con su usuario.'))}`,
    bind(v) {
      v.querySelectorAll('[data-c]').forEach(i => i.onchange = () => { c[i.dataset.c] = i.checked; localStorage.setItem(k, JSON.stringify(c)); DB.log('Cambio de autorización de datos', `${i.dataset.c}: ${i.checked ? 'sí' : 'no'}`); UI.toast('Preferencia guardada'); });
      v.querySelector('#exp').onclick = () => {
        const datos = { exportado: fmt.iso(), titular: nombreUsuario(), rol: ROL, unidad: ES_PROP ? u() : { id: UNIDAD }, hogar: mis('hogar'), vehiculos: mis('vehiculos'), mascotas: mis('mascotas'), pqr: mis('pqr'), autorizaciones: mis('autorizaciones'), ...(ES_PROP ? { pagos: mis('pagos') } : {}) };
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })); a.download = `mis-datos-${UNIDAD}.json`; a.click();
        DB.log('Exportación de datos personales', 'Derecho de acceso'); UI.toast('Descarga generada');
      };
      v.querySelector('#sup').onclick = () => UI.modal('Rectificación o supresión de datos', `<div class="field"><label>Solicitud</label><select name="t"><option>Rectificación</option><option>Supresión</option><option>Revocar autorización</option></select></div><div class="field"><label>Detalle</label><textarea name="d" required></textarea></div>
        <p class="muted" style="font-size:12.5px">Se responde en máximo 15 días hábiles (Ley 1581 de 2012, art. 15).</p>`,
        d => { DB.add('solicitudes', { unidad: UNIDAD, tipo: `Datos personales: ${d.t}`, fecha: fmt.today(), detalle: d.d, estado: 'En revisión' }); UI.toast('Solicitud radicada'); });
    },
  };
}

App.start({
  roleLabel: ES_PROP ? 'Propietario' : 'Inquilino', user: nombreUsuario(), userSub: `${u().torre} · Apto ${u().apto}`, bellTarget: 'paquetes',
  nav: [
    { group: ES_PROP ? 'Mi inmueble' : 'Mi hogar', items: [
      { id: 'inicio', label: 'Inicio', icon: 'home', render: inicio },
      { id: 'ficha', label: ES_PROP ? 'Ficha del inmueble' : 'Personas, vehículos y mascotas', icon: 'building', render: ficha },
      ...(ES_PROP ? [{ id: 'cuenta', label: 'Estado de cuenta', icon: 'wallet', render: cuenta, badge: () => u().saldo ? 1 : 0 }] : []),
    ]},
    { group: 'Servicios', items: [
      { id: 'paquetes', label: 'Correspondencia', icon: 'box', render: paquetes, badge: () => pendientes().length },
      { id: 'visitas', label: 'Visitas', icon: 'key', render: visitas },
      { id: 'reservas', label: 'Reservas', icon: 'calendar', render: reservas },
      { id: 'solicitudes', label: 'Solicitudes', icon: 'truck', render: solicitudes },
      { id: 'pqr', label: 'PQRSF', icon: 'msg', render: pqr },
    ]},
    { group: 'Copropiedad', items: [
      ...(ES_PROP ? [{ id: 'asambleas', label: 'Asambleas', icon: 'users', render: asambleas, badge: () => DB.get('asambleas').filter(a => a.estado === 'Convocada').length }] : []),
      { id: 'avisos', label: 'Comunicados', icon: 'news', render: avisos },
      { id: 'documentos', label: 'Documentos', icon: 'file', render: documentos },
      { id: 'convivencia', label: 'Manual de convivencia', icon: 'book', render: convivencia },
    ]},
    { group: 'Mi cuenta', items: [
      { id: 'privacidad', label: 'Privacidad y datos', icon: 'shield', render: privacidad },
    ]},
  ],
});
if (!sessionStorage.getItem('cdv-login-' + ROL)) { sessionStorage.setItem('cdv-login-' + ROL, '1'); DB.log('Inicio de sesión', ES_PROP ? 'Portal propietario' : 'Portal inquilino'); }
