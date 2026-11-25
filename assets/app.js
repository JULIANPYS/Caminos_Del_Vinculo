// Estructura común de los paneles (menú lateral, barra superior, rutas por #hash).
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const STATUS = {
  'Radicada': 't-info', 'En proceso': 't-warn', 'Cerrada': 't-ok', 'Rechazada': 't-bad',
  'Pagado': 't-ok', 'Pendiente': 't-warn', 'Vencido': 't-bad', 'Al día': 't-ok', 'En mora': 't-bad',
  'Aprobada': 't-ok', 'Vigente': 't-info', 'Usada': 't-neutral', 'Entregado': 't-ok', 'Por entregar': 't-warn',
  'Dentro': 't-info', 'Salió': 't-neutral',
};
const tag = s => `<span class="tag ${STATUS[s] || 't-neutral'}">${esc(s)}</span>`;

function table(cols, rows, emptyMsg = 'No hay registros todavía.') {
  if (!rows.length) return `<div class="empty"><div class="ic">${ico('inbox')}</div><h3>Sin registros</h3><p>${emptyMsg}</p></div>`;
  return `<table><thead><tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr></thead><tbody>${rows.map(r =>
    `<tr>${cols.map(c => `<td${c.cls ? ` class="${c.cls}"` : ''}>${c.v(r)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function card(title, body, actions = '') {
  return `<div class="card"><div class="card-h"><h3>${title}</h3>${actions}</div>${body}</div>`;
}

function pageHead(title, sub, actions = '') {
  return `<div class="page-h"><div><h1>${title}</h1><p>${sub}</p></div><div class="toolbar">${actions}</div></div>`;
}

function kpi(label, value, sub, icon) {
  return `<div class="card kpi"><div class="lbl">${label}${ico(icon, 'color:#94a3b8')}</div><div class="val">${value}</div><div class="sub">${sub}</div></div>`;
}

function soon(title, desc) {
  return pageHead(title, desc) + `<div class="card"><div class="empty"><div class="ic">${ico('settings')}</div>
    <h3>Módulo incluido en la siguiente fase</h3><p>La estructura y el acceso por rol ya están definidos. La lógica se conecta con la API en la fase 2.</p></div></div>`;
}

const UI = {
  toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.innerHTML = ico('check') + esc(msg); t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
  },
  modal(title, bodyHtml, onSubmit, submitLabel = 'Guardar') {
    let bg = document.querySelector('.modal-bg');
    if (!bg) { bg = document.createElement('div'); bg.className = 'modal-bg'; document.body.appendChild(bg); }
    const last = document.activeElement;
    bg.innerHTML = `<form class="card modal" role="dialog" aria-modal="true" aria-labelledby="mdl-t"><div class="card-h"><h3 id="mdl-t">${title}</h3><button type="button" class="link" style="background:none;border:0" data-close>Cerrar</button></div>
      <div class="card-b">${bodyHtml}<div class="toolbar" style="justify-content:flex-end;margin-top:6px">
      <button type="button" class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary">${submitLabel}</button></div></div></form>`;
    bg.classList.add('open');
    const close = () => { bg.classList.remove('open'); document.removeEventListener('keydown', esc_); last?.focus?.(); };
    const esc_ = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc_);
    a11yLabels(bg);
    bg.querySelector('input:not([type=hidden]),select,textarea')?.focus();
    bg.querySelectorAll('[data-close]').forEach(b => b.onclick = close);
    bg.onclick = e => { if (e.target === bg) close(); };
    bg.querySelector('form').onsubmit = e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      if (onSubmit(data) !== false) close();
    };
  },
};

const App = {
  start(cfg) {
    this.cfg = cfg;
    const items = cfg.nav.flatMap(g => g.items);
    this.items = Object.fromEntries(items.map(i => [i.id, i]));
    document.body.innerHTML = `<a class="skip" href="#view">Saltar al contenido</a><div class="app">
      <aside class="side" aria-label="Menú principal">
        <a class="logo" href="index.html"><span class="mark">CV</span><span>Caminos del Vínculo<small>${esc(cfg.roleLabel)}</small></span></a>
        <nav class="nav">${cfg.nav.map(g => `<div class="nav-group"><p>${g.group}</p>${g.items.map(i =>
          `<a href="#${i.id}" data-id="${i.id}">${ico(i.icon)}${i.label}${i.badge ? `<span class="n" data-badge="${i.id}"></span>` : ''}</a>`).join('')}</div>`).join('')}</nav>
        <div class="me"><span class="avatar">${cfg.user.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
          <div><b>${esc(cfg.user)}</b><span>${esc(cfg.userSub)}</span></div>
          <a href="login.html" title="Cerrar sesión" aria-label="Cerrar sesión" style="margin-left:auto;color:#93a9bd">${ico('logout')}</a></div>
      </aside>
      <div class="main">
        <header class="top"><div class="crumb" aria-label="Ubicación">${esc(cfg.roleLabel)} / <b id="crumb"></b></div>
          <div class="tools"><div class="search">${ico('search')} Buscar unidad, residente o radicado</div>
          <a class="iconbtn" aria-label="Notificaciones" href="#${cfg.bellTarget || items[0].id}">${ico('bell')}<span class="dot"></span></a></div></header>
        <main class="content" id="view" tabindex="-1"></main>
        <footer class="app-foot"><span>Caminos del Vínculo · v1.0 · Sesión protegida, se cierra tras 15 min de inactividad</span><a href="politica-datos.html">Política de tratamiento de datos (Ley 1581 de 2012)</a></footer>
      </div></div>`;
    Session.watch();
    window.addEventListener('hashchange', () => this.route());
    this.route();
  },
  route() {
    const id = location.hash.slice(1) || this.cfg.nav[0].items[0].id;
    const it = this.items[id] || this.cfg.nav[0].items[0];
    document.querySelectorAll('.nav a').forEach(a => { const on = a.dataset.id === it.id; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
    document.getElementById('crumb').textContent = it.label;
    document.title = `${it.label} · Caminos del Vínculo`;
    const view = document.getElementById('view');
    const out = it.render ? it.render() : soon(it.label, it.desc || '');
    view.innerHTML = typeof out === 'string' ? out : out.html;
    if (out.bind) out.bind(view);
    a11yLabels(view);
    this.badges();
    window.scrollTo(0, 0);
  },
  refresh() { this.route(); },
  badges() {
    document.querySelectorAll('[data-badge]').forEach(b => {
      const it = this.items[b.dataset.badge]; const n = it.badge();
      b.textContent = n; b.style.display = n ? '' : 'none';
    });
  },
};

const unidadOptions = (sel = '') => DB.get('unidades').map(u => `<option ${u.id === sel ? 'selected' : ''} value="${u.id}">${u.torre} · Apto ${u.apto}</option>`).join('');

// Accesibilidad (ISO/IEC 40500 = WCAG 2.0 AA): cada campo queda asociado a su etiqueta.
let _fid = 0;
function a11yLabels(root) {
  root.querySelectorAll('.field').forEach(f => {
    const l = f.querySelector('label'), c = f.querySelector('input,select,textarea');
    if (l && c && !c.id) { c.id = 'f' + (++_fid); l.htmlFor = c.id; }
  });
  root.querySelectorAll('select:not([aria-label])').forEach(s => { if (!s.id) s.setAttribute('aria-label', s.closest('td') ? 'Cambiar estado' : 'Filtro'); });
}

// Cierre de sesión por inactividad (ISO/IEC 27001, control de acceso).
const Session = {
  LIMIT: 15 * 60e3, WARN: 60e3,
  watch() {
    const reset = () => { clearTimeout(this.t1); clearTimeout(this.t2);
      this.t1 = setTimeout(() => UI.toast('Su sesión se cerrará en 1 minuto por inactividad'), this.LIMIT - this.WARN);
      this.t2 = setTimeout(() => { DB.log('Cierre de sesión', 'Por inactividad'); location.href = 'login.html?expirada=1'; }, this.LIMIT); };
    ['click', 'keydown', 'mousemove', 'touchstart'].forEach(e => addEventListener(e, reset, { passive: true }));
    reset();
  },
};
