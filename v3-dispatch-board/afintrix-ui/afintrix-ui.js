/*! Afintrix UI v3 (Board) · afintrix-ui.js · 2026-11-01 · Powered by Afintrix */
/* AxUI core: required once. Components register with AxUI.define(name, {init}) and start on every
   element with data-ax="name" (for markup added later call AxUI.init(root)).
   Also here: keyboard shortcuts for any button with data-key="ctrl+s" (shown with <kbd class="ax-kbd">),
   and AxUI.say(), which writes to the trail of the desk. */
(function () {
  'use strict';
  const modules = {};
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const AxUI = {
    $: (s, r) => (r || document).querySelector(s),
    $$: (s, r) => Array.from((r || document).querySelectorAll(s)),
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    uid: (p) => (p || 'ax') + '-' + Math.random().toString(36).slice(2, 8),
    icon: (name, cls) => `<svg class="ax-i ${cls || ''}" aria-hidden="true"><use href="#ax-i-${name}"></use></svg>`,
    money: (n, cur) => (n < 0 ? '−' : '') + (cur == null ? '$' : cur) + Math.abs(Number(n || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    time: () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    emit: (el, name, detail) => el.dispatchEvent(new CustomEvent('ax:' + name, { bubbles: true, detail })),
    typing: (el) => !!(el && el.closest && el.closest('input,textarea,select,[contenteditable="true"]')),
    define(name, mod) { modules[name] = mod; if (document.readyState !== 'loading') AxUI.init(document); },
    init(root) {
      AxUI.$$('[data-ax]', root || document).forEach((el) => {
        el.dataset.ax.split(/\s+/).forEach((name) => {
          const flag = 'axReady' + name.replace(/(^|-)(\w)/g, (m, d, c) => c.toUpperCase());
          if (modules[name] && !el.dataset[flag]) { el.dataset[flag] = '1'; modules[name].init(el); }
        });
      });
      if (isMac) AxUI.$$('.ax-kbd', root || document).forEach((k) => { k.textContent = k.textContent.replace(/\bCtrl\b ?/g, '⌘').replace(/\bAlt\b ?/g, '⌥'); });
    },
    /* Keeps keyboard focus inside a dock or dialog; returns a function that releases it. */
    trapFocus(box) {
      const prev = document.activeElement;
      const sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
      const onKey = (e) => {
        if (e.key !== 'Tab') return;
        const f = AxUI.$$(sel, box).filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      };
      box.addEventListener('keydown', onKey);
      const first = AxUI.$('[data-autofocus]', box) || AxUI.$$(sel, box).find((x) => x.offsetParent !== null && !x.classList.contains('ax-close'));
      if (first) setTimeout(() => first.focus(), 30);
      return () => { box.removeEventListener('keydown', onKey); if (prev && prev.focus && document.contains(prev)) prev.focus(); };
    },
  };
  window.AxUI = AxUI;

  /* Action trail: AxUI.say('Tom Becker held', { tone: 'ok'|'bad'|'warn', undo: fn, from: element }).
     Adds a chip, newest first, to the [data-trail] strip of the nearest .ax-desk (at most 6 chips stay). With undo the chip
     carries an Undo button and Ctrl+Z runs it. Without a desk it shows a floating message. */
  let lastUndo = null;
  AxUI.say = (text, o = {}) => {
    const desk = o.from ? o.from.closest && o.from.closest('.ax-desk') : AxUI.$('.ax-desk');
    const trail = desk && AxUI.$('[data-trail]', desk);
    lastUndo = o.undo || null;
    if (!trail) return AxUI.toast({ title: text, tone: o.tone || 'info', undo: o.undo });
    AxUI.$$('.ax-chip', trail).forEach((c) => c.classList.remove('is-new'));
    const chip = document.createElement('span');
    chip.className = 'ax-chip is-new' + (o.tone ? ' is-' + o.tone : '');
    chip.setAttribute('role', o.tone === 'bad' ? 'alert' : 'status');
    chip.innerHTML = `<span>${AxUI.esc(text)}</span>${o.undo ? '<button type="button" data-say-undo>Undo</button><span class="ax-kbd">Ctrl Z</span>' : ''}`;
    if (isMac) AxUI.$$('.ax-kbd', chip).forEach((k) => { k.textContent = '⌘ Z'; });
    const u = AxUI.$('[data-say-undo]', chip);
    if (u) u.addEventListener('click', () => { const f = lastUndo; lastUndo = null; u.remove(); if (f) f(); });
    const label = AxUI.$('.ax-trail-label', trail);
    trail.insertBefore(chip, label ? label.nextSibling : trail.firstChild);
    const chips = AxUI.$$('.ax-chip', trail);
    while (chips.length > 6) chips.pop().remove();
    return chip;
  };

  /* Shortcuts: data-key="ctrl+s", "ctrl+enter", "alt+n", "/", "n". Single keys never fire while typing.
     With a dock open, only its own shortcuts work. Otherwise they work in the desk (or [data-key-scope]) you last
     clicked or focused, plus any outside a desk. The element is clicked (or focused, for inputs). */
  const SCOPE = '.ax-desk, [data-key-scope]';
  let lastScope = null;
  ['focusin', 'pointerdown'].forEach((t) => document.addEventListener(t, (e) => { const s = e.target.closest && e.target.closest(SCOPE); if (s) lastScope = s; }, true));
  const parse = (s) => { const p = s.toLowerCase().split('+'); return { mod: p.includes('ctrl') || p.includes('cmd'), shift: p.includes('shift'), alt: p.includes('alt'), key: p[p.length - 1] }; };
  const keyName = (e) => (e.key === ' ' ? 'space' : e.key.toLowerCase());
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && keyName(e) === 'z' && !AxUI.typing(e.target) && lastUndo) { e.preventDefault(); const f = lastUndo; lastUndo = null; f(); return; }
    const top = AxUI.$$('.ax-scrim:not([hidden])').pop();
    const home = (lastScope && document.contains(lastScope) && lastScope) || AxUI.$(SCOPE);
    const pool = top ? AxUI.$$('[data-key]', top) : AxUI.$$('[data-key]').filter((el) => { const s = el.closest(SCOPE); return !s || s === home; });
    const hit = pool.find((el) => {
      if (el.disabled || el.offsetParent === null) return false;
      return el.dataset.key.split(/\s*,\s*/).some((combo) => {
        const k = parse(combo);
        if (k.key !== keyName(e) || k.mod !== mod || k.alt !== e.altKey || (k.shift && !e.shiftKey)) return false;
        return k.mod || k.alt || !AxUI.typing(e.target);
      });
    });
    if (!hit) return;
    e.preventDefault();
    if (hit.matches('input,textarea,select')) hit.focus(); else hit.click();
  });

  /* The icon set ships inside this file: added once to <body>, so <use href="#ax-i-…"> works with no extra markup. */
  const ICONS = "<svg xmlns=\"http://www.w3.org/2000/svg\" id=\"ax-icons\" style=\"display:none\" aria-hidden=\"true\">\n  <symbol id=\"ax-i-x\" viewBox=\"0 0 24 24\"><path d=\"M18 6 6 18M6 6l12 12\"/></symbol>\n  <symbol id=\"ax-i-check\" viewBox=\"0 0 24 24\"><path d=\"M20 6 9 17l-5-5\"/></symbol>\n  <symbol id=\"ax-i-check-circle\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m8.5 12 2.5 2.5 4.5-5\"/></symbol>\n  <symbol id=\"ax-i-x-circle\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m15 9-6 6M9 9l6 6\"/></symbol>\n  <symbol id=\"ax-i-alert\" viewBox=\"0 0 24 24\"><path d=\"M12 3 2 20h20L12 3z\"/><path d=\"M12 10v4M12 17.5v.01\"/></symbol>\n  <symbol id=\"ax-i-info\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v5M12 7.5v.01\"/></symbol>\n  <symbol id=\"ax-i-lock\" viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"11\" width=\"16\" height=\"10\" rx=\"1\"/><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"/></symbol>\n  <symbol id=\"ax-i-file\" viewBox=\"0 0 24 24\"><path d=\"M14 3H6v18h12V7l-4-4z\"/><path d=\"M14 3v4h4\"/></symbol>\n  <symbol id=\"ax-i-file-text\" viewBox=\"0 0 24 24\"><path d=\"M14 3H6v18h12V7l-4-4z\"/><path d=\"M14 3v4h4M9 12h6M9 16h6\"/></symbol>\n  <symbol id=\"ax-i-arrow-right\" viewBox=\"0 0 24 24\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></symbol>\n  <symbol id=\"ax-i-arrow-left\" viewBox=\"0 0 24 24\"><path d=\"M19 12H5M11 18l-6-6 6-6\"/></symbol>\n  <symbol id=\"ax-i-chevron-down\" viewBox=\"0 0 24 24\"><path d=\"m6 9 6 6 6-6\"/></symbol>\n  <symbol id=\"ax-i-chevron-right\" viewBox=\"0 0 24 24\"><path d=\"m9 6 6 6-6 6\"/></symbol>\n  <symbol id=\"ax-i-filter\" viewBox=\"0 0 24 24\"><path d=\"M3 5h18l-7 8v6l-4-2v-4L3 5z\"/></symbol>\n  <symbol id=\"ax-i-plus\" viewBox=\"0 0 24 24\"><path d=\"M12 5v14M5 12h14\"/></symbol>\n  <symbol id=\"ax-i-search\" viewBox=\"0 0 24 24\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-3.5-3.5\"/></symbol>\n  <symbol id=\"ax-i-more\" viewBox=\"0 0 24 24\"><circle cx=\"5\" cy=\"12\" r=\"1.2\"/><circle cx=\"12\" cy=\"12\" r=\"1.2\"/><circle cx=\"19\" cy=\"12\" r=\"1.2\"/></symbol>\n  <symbol id=\"ax-i-download\" viewBox=\"0 0 24 24\"><path d=\"M12 3v12M7 10l5 5 5-5M4 19h16\"/></symbol>\n  <symbol id=\"ax-i-upload\" viewBox=\"0 0 24 24\"><path d=\"M12 15V3M7 8l5-5 5 5M4 19h16\"/></symbol>\n  <symbol id=\"ax-i-printer\" viewBox=\"0 0 24 24\"><path d=\"M6 9V3h12v6\"/><rect x=\"3\" y=\"9\" width=\"18\" height=\"8\"/><path d=\"M6 14h12v7H6z\"/></symbol>\n  <symbol id=\"ax-i-mail\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\"/><path d=\"m3 6 9 7 9-7\"/></symbol>\n  <symbol id=\"ax-i-calendar\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"16\"/><path d=\"M3 10h18M8 3v4M16 3v4\"/></symbol>\n  <symbol id=\"ax-i-user\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6\"/></symbol>\n  <symbol id=\"ax-i-users\" viewBox=\"0 0 24 24\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20c1.2-3.5 3.8-5 6.5-5s5.3 1.5 6.5 5M16 4.5a3.5 3.5 0 0 1 0 7M18 15c1.8.6 3 2.2 3.6 5\"/></symbol>\n  <symbol id=\"ax-i-bank\" viewBox=\"0 0 24 24\"><path d=\"M3 9 12 4l9 5M4 9v9M20 9v9M8 11v6M12 11v6M16 11v6M3 20h18\"/></symbol>\n  <symbol id=\"ax-i-wallet\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"14\"/><path d=\"M3 10h18M16 15h2M6 6l9-3 1 3\"/></symbol>\n  <symbol id=\"ax-i-receipt\" viewBox=\"0 0 24 24\"><path d=\"M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z\"/><path d=\"M9 8h6M9 12h6M9 16h3\"/></symbol>\n  <symbol id=\"ax-i-briefcase\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"7\" width=\"18\" height=\"13\"/><path d=\"M8 7V4h8v3M3 13h18\"/></symbol>\n  <symbol id=\"ax-i-chart\" viewBox=\"0 0 24 24\"><path d=\"M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3\"/></symbol>\n  <symbol id=\"ax-i-home\" viewBox=\"0 0 24 24\"><path d=\"m3 11 9-7 9 7M5 10v10h14V10\"/></symbol>\n  <symbol id=\"ax-i-settings\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1\"/></symbol>\n  <symbol id=\"ax-i-trash\" viewBox=\"0 0 24 24\"><path d=\"M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3\"/></symbol>\n  <symbol id=\"ax-i-edit\" viewBox=\"0 0 24 24\"><path d=\"M4 20h4L19 9l-4-4L4 16v4z\"/><path d=\"m13 7 4 4\"/></symbol>\n  <symbol id=\"ax-i-copy\" viewBox=\"0 0 24 24\"><rect x=\"8\" y=\"8\" width=\"13\" height=\"13\"/><path d=\"M16 8V3H3v13h5\"/></symbol>\n  <symbol id=\"ax-i-clock\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/></symbol>\n  <symbol id=\"ax-i-shield\" viewBox=\"0 0 24 24\"><path d=\"M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z\"/><path d=\"m9 12 2 2 4-4\"/></symbol>\n  <symbol id=\"ax-i-refresh\" viewBox=\"0 0 24 24\"><path d=\"M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4\"/></symbol>\n  <symbol id=\"ax-i-eye\" viewBox=\"0 0 24 24\"><path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></symbol>\n  <symbol id=\"ax-i-paperclip\" viewBox=\"0 0 24 24\"><path d=\"M20 11.5 12 19.5a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5L10 17.5a2 2 0 0 1-3-3L14.5 7\"/></symbol>\n  <symbol id=\"ax-i-layers\" viewBox=\"0 0 24 24\"><path d=\"m12 3 9 5-9 5-9-5 9-5z\"/><path d=\"m3 13 9 5 9-5\"/></symbol>\n  <symbol id=\"ax-i-list\" viewBox=\"0 0 24 24\"><path d=\"M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01\"/></symbol>\n  <symbol id=\"ax-i-grid\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/></symbol>\n  <symbol id=\"ax-i-sun\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4\"/></symbol>\n  <symbol id=\"ax-i-moon\" viewBox=\"0 0 24 24\"><path d=\"M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z\"/></symbol>\n  <symbol id=\"ax-i-building\" viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"3\" width=\"16\" height=\"18\"/><path d=\"M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3\"/></symbol>\n  <symbol id=\"ax-i-send\" viewBox=\"0 0 24 24\"><path d=\"M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z\"/></symbol>\n  <symbol id=\"ax-i-pen\" viewBox=\"0 0 24 24\"><path d=\"M3 21c3-1 5-3 6-6l8-8 3 3-8 8c-3 1-5 3-6 6\"/><path d=\"m14 6 3-3 4 4-3 3\"/></symbol>\n  <symbol id=\"ax-i-external\" viewBox=\"0 0 24 24\"><path d=\"M14 4h6v6M20 4l-9 9M18 14v6H4V6h6\"/></symbol>\n  <symbol id=\"ax-i-box\" viewBox=\"0 0 24 24\"><path d=\"m3 7 9-4 9 4v10l-9 4-9-4V7z\"/><path d=\"m3 7 9 4 9-4M12 11v10\"/></symbol>\n  <symbol id=\"ax-i-truck\" viewBox=\"0 0 24 24\"><path d=\"M3 6h11v10H3zM14 10h4l3 3v3h-7\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/></symbol>\n  <symbol id=\"ax-i-command\" viewBox=\"0 0 24 24\"><path d=\"M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6z\"/></symbol>\n  <symbol id=\"ax-i-cpu\" viewBox=\"0 0 24 24\"><rect x=\"6\" y=\"6\" width=\"12\" height=\"12\"/><path d=\"M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4\"/></symbol>\n  <symbol id=\"ax-i-key\" viewBox=\"0 0 24 24\"><circle cx=\"8\" cy=\"15\" r=\"4\"/><path d=\"m11 12 9-9M17 6l3 3\"/></symbol>\n</svg>";
  const boot = () => {
    if (ICONS.startsWith('<svg') && !document.getElementById('ax-icons')) document.body.insertAdjacentHTML('afterbegin', ICONS);
    AxUI.init(document);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

/* Theme switch: <button data-ax="theme">. Light / dark, remembered per browser. */
AxUI.define('theme', {
  init(btn) {
    const root = document.documentElement;
    const apply = (t) => { root.setAttribute('data-theme', t); btn.setAttribute('aria-pressed', String(t === 'dark')); btn.title = t === 'dark' ? 'Switch to light' : 'Switch to dark'; };
    let saved = null;
    try { saved = localStorage.getItem('ax-theme'); } catch (e) { /* storage blocked */ }
    apply(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    btn.addEventListener('click', () => {
      const t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(t);
      try { localStorage.setItem('ax-theme', t); } catch (e) { /* storage blocked */ }
    });
  },
});

/* Desk frame: <div class="ax-desk" data-ax="desk">. On tablets and phones the [data-desk-nav] button opens the sidebar. */
AxUI.define('desk', {
  init(desk) {
    const btn = AxUI.$('[data-desk-nav]', desk);
    if (!btn) return;
    const set = (on) => { desk.classList.toggle('is-nav-open', on); btn.setAttribute('aria-expanded', String(on)); };
    btn.addEventListener('click', (e) => { e.stopPropagation(); set(!desk.classList.contains('is-nav-open')); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.ax-desk-nav')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && desk.classList.contains('is-nav-open')) { set(false); btn.focus(); } });
  },
});

/* Jump-to search in the top bar: <div class="ax-jump" data-ax="jump" data-items='[{"group":"Go to","label":"Payroll runs","hint":"List","href":"#"}]'>
   with a .ax-jump-box holding the input. Ctrl+K focuses it, ↑/↓/Enter pick, Escape leaves. Fires ax:command. */
AxUI.define('jump', {
  init(root) {
    const input = AxUI.$('input', root);
    const items = JSON.parse(root.dataset.items || '[]');
    const list = document.createElement('ul');
    const id = AxUI.uid('jump');
    list.className = 'ax-jump-list';
    list.id = id;
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    root.appendChild(list);
    Object.entries({ role: 'combobox', 'aria-controls': id, 'aria-expanded': 'false', 'aria-autocomplete': 'list', autocomplete: 'off' }).forEach(([k, v]) => input.setAttribute(k, v));
    if (!input.dataset.key) input.dataset.key = 'ctrl+k';
    let shown = [];
    let active = 0;
    const render = () => {
      const q = input.value.trim().toLowerCase();
      shown = items.filter((x) => !q || (x.label + ' ' + (x.hint || '') + ' ' + (x.group || '')).toLowerCase().includes(q)).slice(0, 10);
      let last = '';
      list.innerHTML = shown.map((x, i) => {
        const head = x.group && x.group !== last ? `<li class="ax-jump-group" role="presentation">${AxUI.esc(x.group)}</li>` : '';
        last = x.group;
        return head + `<li role="option" id="${id}-${i}" data-i="${i}" aria-selected="${i === active}">${AxUI.icon(x.icon || 'arrow-right', 'is-sm')}<span>${AxUI.esc(x.label)}</span><small>${AxUI.esc(x.hint || '')}</small></li>`;
      }).join('') || '<li class="ax-jump-group">No matches. Try a name, a number or a page.</li>';
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      if (shown.length) input.setAttribute('aria-activedescendant', `${id}-${active}`); else input.removeAttribute('aria-activedescendant');
    };
    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); };
    const run = (i) => {
      const x = shown[i];
      if (!x) return;
      close(); input.value = ''; input.blur();
      AxUI.emit(root, 'command', x);
      if (x.href && x.href !== '#') location.href = x.href;
    };
    input.addEventListener('focus', () => { active = 0; render(); });
    input.addEventListener('input', () => { active = 0; render(); });
    input.addEventListener('blur', () => setTimeout(close, 120));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!shown.length) return; active = (active + (e.key === 'ArrowDown' ? 1 : shown.length - 1)) % shown.length; render(); }
      else if (e.key === 'Enter') { e.preventDefault(); run(active); }
      else if (e.key === 'Escape') { close(); input.blur(); }
    });
    list.addEventListener('mousedown', (e) => { const li = e.target.closest('[data-i]'); if (li) { e.preventDefault(); run(+li.dataset.i); } });
  },
});

/* Tabs: <div data-ax="tabs"> with [role=tab][aria-controls] buttons; arrow keys move between tabs.
   Segmented control: <div class="ax-seg" data-ax="seg"> with buttons (aria-pressed). Fires ax:tab / ax:seg. */
AxUI.define('tabs', {
  init(list) {
    const tabs = AxUI.$$('[role="tab"]', list);
    const select = (t, focus) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        const p = document.getElementById(x.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      if (focus) t.focus();
      AxUI.emit(list, 'tab', { id: t.getAttribute('aria-controls') });
    };
    list.addEventListener('click', (e) => { const t = e.target.closest('[role="tab"]'); if (t) select(t); });
    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
    });
    select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  },
});
AxUI.define('seg', {
  init(seg) {
    seg.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      AxUI.$$('button', seg).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      AxUI.emit(seg, 'seg', { value: b.dataset.value || b.textContent.trim() });
    });
  },
});

/* Menu: <div class="ax-menu-wrap" data-ax="menu"><button aria-haspopup="menu">…<div class="ax-menu" role="menu" hidden>.
   Closes on outside click and Escape; arrow keys move; items fire ax:menu with data-action. */
AxUI.define('menu', {
  init(wrap) {
    const btn = AxUI.$('[aria-haspopup]', wrap);
    const menu = AxUI.$('[role="menu"]', wrap);
    const items = () => AxUI.$$('button:not([disabled]),a', menu);
    const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    const open = () => { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); const f = items()[0]; if (f) f.focus(); };
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', (e) => { e.stopPropagation(); if (menu.hidden) open(); else close(); });
    menu.addEventListener('keydown', (e) => {
      const list = items();
      const i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
      if (e.key === 'Escape') { close(); btn.focus(); }
    });
    menu.addEventListener('click', (e) => {
      const it = e.target.closest('button,a');
      if (!it) return;
      if (it.tagName === 'A' && it.getAttribute('href') === '#') e.preventDefault();
      close();
      AxUI.emit(wrap, 'menu', { action: it.dataset.action || it.textContent.trim() });
    });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
  },
});

/* Link field (search + pick + create): <div class="ax-combo" data-ax="combobox" data-options='[{"value":"…","hint":"…"}]' data-create="Supplier">.
   Typing filters, ↑/↓/Enter pick, "Create" fires ax:create. Picking fires ax:pick. */
AxUI.define('combobox', {
  init(box) {
    const input = AxUI.$('input', box);
    const list = document.createElement('ul');
    const id = AxUI.uid('combo');
    list.className = 'ax-combo-list';
    list.id = id;
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    box.appendChild(list);
    Object.entries({ role: 'combobox', 'aria-controls': id, 'aria-expanded': 'false', 'aria-autocomplete': 'list', autocomplete: 'off' }).forEach(([k, v]) => input.setAttribute(k, v));
    const options = JSON.parse(box.dataset.options || '[]');
    let active = 0;
    let shown = [];
    const render = () => {
      const q = input.value.trim().toLowerCase();
      shown = options.filter((o) => !q || o.value.toLowerCase().includes(q) || (o.hint || '').toLowerCase().includes(q)).slice(0, 8);
      const create = box.dataset.create && q && !options.some((o) => o.value.toLowerCase() === q);
      list.innerHTML = shown.map((o, i) => `<li role="option" id="${id}-${i}" aria-selected="${i === active}" data-i="${i}"><span>${AxUI.esc(o.value)}</span><small>${AxUI.esc(o.hint || '')}</small></li>`).join('')
        + (shown.length ? '' : '<li class="is-empty">No match</li>')
        + (create ? `<li role="option" id="${id}-${shown.length}" class="is-create" data-create aria-selected="${active === shown.length}">Create ${AxUI.esc(box.dataset.create)} “${AxUI.esc(input.value.trim())}”</li>` : '');
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      input.setAttribute('aria-activedescendant', `${id}-${active}`);
    };
    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); };
    const pick = (li) => {
      if (!li) return;
      if (li.hasAttribute('data-create')) { AxUI.emit(box, 'create', { value: input.value.trim(), doctype: box.dataset.create }); close(); return; }
      const o = shown[+li.dataset.i];
      if (!o) return;
      input.value = o.value;
      close();
      AxUI.emit(box, 'pick', o);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    input.addEventListener('focus', () => { active = 0; render(); });
    input.addEventListener('input', () => { active = 0; render(); });
    input.addEventListener('keydown', (e) => {
      const max = list.querySelectorAll('[role="option"]').length - 1;
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(max, active + 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); render(); }
      else if (e.key === 'Enter' && !list.hidden) { e.preventDefault(); pick(list.querySelectorAll('[role="option"]')[active]); }
      else if (e.key === 'Escape') close();
    });
    list.addEventListener('mousedown', (e) => { e.preventDefault(); pick(e.target.closest('[role="option"]')); });
    input.addEventListener('blur', () => setTimeout(close, 100));
  },
});

/* Multi-select tokens: <div class="ax-tokens" data-ax="tokens"><input placeholder="Add…"></div>. Enter or comma adds, Backspace removes. Fires ax:change. */
AxUI.define('tokens', {
  init(box) {
    const input = AxUI.$('input', box);
    const values = () => AxUI.$$('.ax-token', box).map((x) => x.dataset.value);
    const add = (v) => {
      v = v.trim();
      if (!v || values().includes(v)) return;
      const t = document.createElement('span');
      t.className = 'ax-token';
      t.dataset.value = v;
      t.innerHTML = `${AxUI.esc(v)}<button type="button" aria-label="Remove ${AxUI.esc(v)}">${AxUI.icon('x', 'is-sm')}</button>`;
      box.insertBefore(t, input);
      AxUI.emit(box, 'change', { values: values() });
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input.value); input.value = ''; }
      if (e.key === 'Backspace' && !input.value) { const last = AxUI.$$('.ax-token', box).pop(); if (last) { last.remove(); AxUI.emit(box, 'change', { values: values() }); } }
    });
    box.addEventListener('click', (e) => { const x = e.target.closest('.ax-token button'); if (x) { x.parentElement.remove(); AxUI.emit(box, 'change', { values: values() }); input.focus(); } else input.focus(); });
  },
});

/* Currency / number: <input data-ax="amount"> shows 1,234.50 when not editing.
   Password: <div class="ax-pw" data-ax="password"> with a Show/Hide button and an optional .ax-strength meter. */
AxUI.define('amount', {
  init(input) {
    const fmt = () => { const n = parseFloat(String(input.value).replace(/,/g, '')); if (!isNaN(n)) input.value = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
    input.addEventListener('focus', () => { input.value = String(input.value).replace(/,/g, ''); });
    input.addEventListener('blur', fmt);
    fmt();
  },
});
AxUI.define('password', {
  init(box) {
    const input = AxUI.$('input', box);
    const btn = AxUI.$('button', box);
    const meter = box.parentElement.querySelector('.ax-strength');
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide' : 'Show';
      btn.setAttribute('aria-pressed', String(show));
    });
    if (meter) {
      input.addEventListener('input', () => {
        const v = input.value;
        const score = !v ? 0 : [v.length >= 8, /[A-Z]/.test(v) && /[a-z]/.test(v), /\d/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
        meter.dataset.score = score;
        meter.setAttribute('aria-label', 'Password strength ' + ['none', 'weak', 'fair', 'good', 'strong'][score]);
      });
    }
  },
});

/* File drop: <div data-ax="upload" data-max-mb="25"><label class="ax-drop">…<input type="file" hidden multiple></label><ul class="ax-files"></ul></div>. Fires ax:files. */
AxUI.define('upload', {
  init(box) {
    const drop = AxUI.$('.ax-drop', box);
    const input = AxUI.$('input[type="file"]', box);
    const list = AxUI.$('.ax-files', box);
    const max = (+box.dataset.maxMb || 25) * 1048576;
    const add = (files) => {
      Array.from(files).forEach((f) => {
        const li = document.createElement('li');
        const tooBig = f.size > max;
        if (tooBig) li.className = 'is-bad';
        li.innerHTML = `${AxUI.icon(tooBig ? 'alert' : 'file')}<span>${AxUI.esc(f.name)}</span><small>${tooBig ? `Too large: limit ${box.dataset.maxMb || 25} MB` : (f.size / 1024).toFixed(0) + ' KB'}</small><button type="button" class="ax-btn is-quiet is-sm is-icon" aria-label="Remove ${AxUI.esc(f.name)}">${AxUI.icon('x', 'is-sm')}</button>`;
        list.appendChild(li);
      });
      AxUI.emit(box, 'files', { count: list.children.length });
    };
    input.addEventListener('change', () => { add(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, () => drop.classList.remove('is-over')));
    drop.addEventListener('drop', (e) => { e.preventDefault(); add(e.dataTransfer.files); });
    list.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { b.closest('li').remove(); AxUI.emit(box, 'files', { count: list.children.length }); } });
  },
});

/* Floating messages for pages without a desk status bar: AxUI.toast({ title, text, tone: 'ok'|'warn'|'bad'|'info', undo: fn }).
   Inside a desk, prefer AxUI.say(). Declarative: <button data-ax="toast" data-title="Saved" data-tone="ok">. */
(function () {
  let stack = null;
  AxUI.toast = function (o) {
    if (!stack) { stack = document.createElement('div'); stack.className = 'ax-toasts ax'; stack.setAttribute('aria-live', 'polite'); document.body.appendChild(stack); }
    const t = document.createElement('div');
    const tone = o.tone || 'info';
    t.className = 'ax-toast is-' + tone;
    t.setAttribute('role', tone === 'bad' ? 'alert' : 'status');
    t.innerHTML = `${AxUI.icon({ ok: 'check-circle', warn: 'alert', bad: 'x-circle', info: 'info' }[tone])}<div><b>${AxUI.esc(o.title)}</b>${o.text ? `<p>${AxUI.esc(o.text)}</p>` : ''}</div>${o.undo ? '<button type="button" data-undo>Undo</button>' : '<span></span>'}<button type="button" data-x aria-label="Dismiss">${AxUI.icon('x', 'is-sm')}</button>`;
    stack.appendChild(t);
    let timer = setTimeout(() => t.remove(), o.ms || 6000);
    t.addEventListener('mouseenter', () => clearTimeout(timer));
    t.addEventListener('mouseleave', () => { timer = setTimeout(() => t.remove(), 2500); });
    t.addEventListener('click', (e) => {
      if (e.target.closest('[data-undo]')) { o.undo(); t.remove(); }
      if (e.target.closest('[data-x]')) t.remove();
    });
    return t;
  };
  /* Declarative: inside a desk the message goes to the trail. data-undo-text adds an Undo that reports it. */
  AxUI.define('toast', {
    init(b) {
      b.addEventListener('click', () => {
        const text = b.dataset.title + (b.dataset.text ? '. ' + b.dataset.text : '');
        const undo = b.dataset.undoText ? () => AxUI.say(b.dataset.undoText, { from: b }) : null;
        if (b.closest('.ax-desk')) AxUI.say(text, { tone: b.dataset.tone, from: b, undo });
        else AxUI.toast({ title: b.dataset.title, text: b.dataset.text, tone: b.dataset.tone, undo });
      });
    },
  });
  /* Dismissible banner: <div class="ax-banner" data-ax="banner"> with a .ax-banner-x button. */
  AxUI.define('banner', { init(b) { const x = AxUI.$('.ax-banner-x', b); if (x) x.addEventListener('click', () => b.remove()); } });
})();

/* Live totals: <aside class="ax-readout" data-ax="readout"> with <dd data-out="total">.
   AxUI.readout(el, { total: 1234.5 }) writes the values (money unless data-format="int" or "text") and highlights what changed.
   AxUI.checks(listEl, [{ tone: 'warn', text: '…', fix: 'Add W-4', onFix: fn }]) fills an .ax-checks list. */
(function () {
  AxUI.readout = (el, values) => {
    const box = typeof el === 'string' ? AxUI.$(el) : el;
    if (!box) return;
    Object.entries(values).forEach(([k, v]) => {
      const dd = AxUI.$(`[data-out="${k}"]`, box);
      if (!dd) return;
      const f = dd.dataset.format;
      const t = f === 'text' ? String(v) : f === 'int' ? Number(v).toLocaleString('en-US') : AxUI.money(v);
      if (dd.textContent === t) return;
      const first = !dd.dataset.axShown;
      dd.textContent = t;
      dd.dataset.axShown = '1';
      if (first) return;
      dd.classList.add('is-changed');
      requestAnimationFrame(() => requestAnimationFrame(() => dd.classList.remove('is-changed')));
    });
  };
  AxUI.checks = (el, items) => {
    const list = typeof el === 'string' ? AxUI.$(el) : el;
    if (!list) return;
    list.innerHTML = '';
    items.forEach((c) => {
      const li = document.createElement('li');
      li.className = c.tone ? 'is-' + c.tone : '';
      li.innerHTML = `<span>${AxUI.esc(c.text)}</span>`;
      if (c.fix) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ax-btn is-quiet is-sm';
        b.textContent = c.fix;
        b.addEventListener('click', c.onFix);
        li.appendChild(b);
      }
      list.appendChild(li);
    });
  };
  AxUI.define('readout', { init(box) { AxUI.$$('[data-out]', box).forEach((dd) => { if (dd.textContent.trim()) dd.dataset.axShown = '1'; }); } });
})();

/* Docked panels (the "popup" of this design: they slide in at the right, beside the work).
   Markup: <div class="ax-scrim" id="…" hidden><section class="ax-dock" role="dialog" aria-modal="true" aria-labelledby="…">.
   Open with <button data-ax="open" data-target="#id">; close with [data-close], Escape or a click on the scrim.
   AxUI.confirm({ title, text, consequences: [], typed: 'DELETE', ok: 'Delete', danger: true }) returns a Promise<boolean>. */
(function () {
  const release = new WeakMap();
  AxUI.openDialog = (scrim) => {
    scrim.hidden = false;
    document.body.style.overflow = 'hidden';
    release.set(scrim, AxUI.trapFocus(scrim));
    AxUI.emit(scrim, 'open');
  };
  AxUI.closeDialog = (scrim) => {
    if (scrim.hidden) return;
    scrim.hidden = true;
    if (!AxUI.$('.ax-scrim:not([hidden])')) document.body.style.overflow = '';
    const r = release.get(scrim);
    if (r) r();
    AxUI.emit(scrim, 'close');
  };
  document.addEventListener('click', (e) => {
    const scrim = e.target.closest('.ax-scrim');
    if (!scrim) return;
    if (e.target === scrim || e.target.closest('[data-close]')) AxUI.closeDialog(scrim);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = AxUI.$$('.ax-scrim:not([hidden])').pop();
    if (open) { e.preventDefault(); AxUI.closeDialog(open); }
  });
  AxUI.define('open', { init(b) { b.addEventListener('click', () => AxUI.openDialog(AxUI.$(b.dataset.target))); } });

  AxUI.confirm = (o) => new Promise((resolve) => {
    const scrim = document.createElement('div');
    scrim.className = 'ax-scrim ax';
    const id = AxUI.uid('dlg');
    scrim.innerHTML = `
      <section class="ax-dock ${o.danger ? 'is-danger' : ''}" role="alertdialog" aria-modal="true" aria-labelledby="${id}">
        <header class="ax-dock-head"><div><h2 id="${id}">${AxUI.esc(o.title)}</h2>${o.text ? `<p>${AxUI.esc(o.text)}</p>` : ''}</div><button class="ax-close" type="button" data-close aria-label="Close">${AxUI.icon('x')}<span class="ax-kbd">Esc</span></button></header>
        <div class="ax-dock-body">
          ${o.consequences ? `<b class="ax-strong">What happens</b><ul class="ax-consequences">${o.consequences.map((c) => `<li>${AxUI.esc(c)}</li>`).join('')}</ul>` : ''}
          ${o.typed ? `<div class="ax-field"><label class="ax-label" for="${id}-t">Type ${AxUI.esc(o.typed)} to confirm</label><input class="ax-input" id="${id}-t" autocomplete="off" data-autofocus></div>` : ''}
        </div>
        <footer class="ax-dock-foot"><button class="ax-btn is-secondary" type="button" data-close>Cancel</button><button class="ax-btn ${o.danger ? 'is-danger' : ''}" type="button" data-ok data-key="ctrl+enter" ${o.typed ? 'disabled' : ''}>${AxUI.esc(o.ok || 'Confirm')}<span class="ax-kbd">Ctrl ↵</span></button></footer>
      </section>`;
    document.body.appendChild(scrim);
    AxUI.init(scrim);
    const ok = AxUI.$('[data-ok]', scrim);
    const typed = AxUI.$('input', scrim);
    if (typed) typed.addEventListener('input', () => { ok.disabled = typed.value.trim() !== o.typed; });
    let answered = false;
    ok.addEventListener('click', () => { answered = true; AxUI.closeDialog(scrim); });
    scrim.addEventListener('ax:close', () => { scrim.remove(); resolve(answered); });
    AxUI.openDialog(scrim);
  });
  /* <button data-ax="confirm" data-title="…" data-text="…" data-typed="DELETE" data-danger data-consequences="a|b"> fires ax:confirm {yes}. */
  AxUI.define('confirm', {
    init(b) {
      b.addEventListener('click', async () => {
        const yes = await AxUI.confirm({ title: b.dataset.title, text: b.dataset.text, typed: b.dataset.typed, danger: b.hasAttribute('data-danger'), ok: b.dataset.ok, consequences: b.dataset.consequences ? b.dataset.consequences.split('|') : null });
        AxUI.emit(b, 'confirm', { yes });
      });
    },
  });
})();

/* Wizard: <div data-ax="wizard"> with .ax-steps li and .ax-wizard-pane sections; [data-next], [data-prev], [data-finish] anywhere in its dock. */
AxUI.define('wizard', {
  init(w) {
    const steps = AxUI.$$('.ax-steps li', w);
    const panes = AxUI.$$('.ax-wizard-pane', w);
    const scope = w.closest('.ax-dock') || w;
    let i = 0;
    const show = () => {
      steps.forEach((s, k) => { s.classList.toggle('is-current', k === i); s.classList.toggle('is-done', k < i); s.setAttribute('aria-current', k === i ? 'step' : 'false'); });
      panes.forEach((p, k) => { p.hidden = k !== i; });
      AxUI.$$('[data-prev]', scope).forEach((b) => { b.disabled = i === 0; });
      AxUI.$$('[data-next]', scope).forEach((b) => { b.hidden = i === panes.length - 1; });
      AxUI.$$('[data-finish]', scope).forEach((b) => { b.hidden = i !== panes.length - 1; });
    };
    scope.addEventListener('click', (e) => {
      if (e.target.closest('[data-next]')) {
        const req = AxUI.$$('[required]', panes[i]).find((x) => (x.type === 'checkbox' ? !x.checked : !x.value.trim()));
        if (req) {
          const f = req.closest('.ax-field');
          if (f) { f.classList.add('is-invalid'); req.setAttribute('aria-invalid', 'true'); }
          req.focus();
          return;
        }
        i = Math.min(panes.length - 1, i + 1); show();
        const first = AxUI.$('input,select,textarea', panes[i]);
        if (first) first.focus();
      }
      if (e.target.closest('[data-prev]')) { i = Math.max(0, i - 1); show(); }
    });
    w.addEventListener('input', (e) => { const f = e.target.closest('.ax-field'); if (f) { f.classList.remove('is-invalid'); e.target.removeAttribute('aria-invalid'); } });
    show();
  },
});

/* Worksheet form: <form class="ax-ws" data-ax="worksheet" data-checks="#checks" data-progress="#progress">.
   Fields are .ax-field blocks (label + .ax-input + .ax-help + .ax-err). Rules: required, type=email, min/max,
   pattern (+ title), data-rule="bizday" (no weekend or bank holiday). Checks a field when you leave it,
   lists every problem in an error summary ([data-errsum]) and in the checks panel on save,
   tracks unsaved changes in [data-ws-state] and the trail. Fires ax:save / ax:submit with the values. */
(function () {
  const HOLIDAYS = { '01-01': 'New Year’s Day', '07-04': 'Independence Day', '11-11': 'Veterans Day', '12-25': 'Christmas Day' };
  const fmtDay = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const closed = (d) => d.getDay() === 0 || d.getDay() === 6 || HOLIDAYS[String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')];
  const near = (d, dir) => { const x = new Date(d); do { x.setDate(x.getDate() + dir); } while (closed(x)); return fmtDay(x); };
  AxUI.bizday = (v) => {
    if (!v) return '';
    const d = new Date(v + 'T12:00:00');
    const why = d.getDay() === 0 ? 'a Sunday' : d.getDay() === 6 ? 'a Saturday' : closed(d) ? `a bank holiday (${closed(d)})` : '';
    return why ? `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} is ${why}. Pick ${near(d, -1)} or ${near(d, 1)}.` : '';
  };
  const labelOf = (f) => {
    if (f.dataset.label) return f.dataset.label;
    const l = f.closest('.ax-field') && AxUI.$('.ax-label', f.closest('.ax-field'));
    if (l) return l.textContent.replace('*', '').trim();
    const own = f.closest('label');
    return own ? own.textContent.trim().slice(0, 40) : f.name;
  };
  AxUI.validate = (f) => {
    if (f.tagName === 'CANVAS') return AxUI.signature(f.closest('.ax-sign')) ? '' : (f.dataset.msg || 'Sign in the box.');
    if (f.type === 'radio') return f.required && !(f.form || document).querySelector(`input[name="${f.name}"]:checked`) ? (f.dataset.msg || `Choose ${labelOf(f).toLowerCase()}.`) : '';
    const v = (f.type === 'checkbox' ? (f.checked ? 'on' : '') : f.value).trim();
    const name = labelOf(f).toLowerCase();
    if (f.required && !v) return f.dataset.msg || (f.type === 'checkbox' ? 'Tick this box to continue.' : `Enter ${name}.`);
    if (!v) return '';
    if (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return 'Use a full email address, like name@company.com.';
    const n = parseFloat(v.replace(/,/g, ''));
    if (f.min !== '' && f.min != null && f.type !== 'date' && n < +f.min) return `Enter ${f.min} or more.`;
    if (f.max !== '' && f.max != null && f.type !== 'date' && n > +f.max) return `Enter ${f.max} or less.`;
    if (f.pattern && !new RegExp('^(?:' + f.pattern + ')$').test(v)) return f.title || 'Check the format.';
    if (f.dataset.rule === 'bizday') return AxUI.bizday(v);
    return '';
  };
  AxUI.define('worksheet', {
    init(form) {
      const scope = form.closest('.ax-desk') || document;
      const checks = form.dataset.checks && AxUI.$(form.dataset.checks);
      const progress = form.dataset.progress && AxUI.$(form.dataset.progress);
      const sum = AxUI.$('[data-errsum]', form);
      const state = AxUI.$('[data-ws-state]', scope);
      const fields = () => {
        const seen = new Set();
        return AxUI.$$('.ax-field input, .ax-field select, .ax-field textarea, .ax-field canvas[data-required]', form).filter((f) => {
          if (f.disabled || f.type === 'hidden') return false;
          if (f.type !== 'radio') return true;
          if (seen.has(f.name)) return false;
          seen.add(f.name);
          return true;
        }).map((f) => (f.type === 'radio' ? AxUI.$(`input[name="${f.name}"][required]`, form) || f : f));
      };
      let dirty = false;
      const mark = (f, msg) => {
        const box = f.closest('.ax-field');
        if (!box) return;
        let err = AxUI.$('.ax-err', box);
        if (!err) { err = document.createElement('span'); err.className = 'ax-err'; box.appendChild(err); }
        if (!err.id) err.id = AxUI.uid('err');
        box.classList.toggle('is-invalid', !!msg);
        err.innerHTML = msg ? AxUI.icon('alert', 'is-sm') + `<span>${AxUI.esc(msg)}</span>` : '';
        const ids = (f.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && x !== err.id);
        if (msg) { f.setAttribute('aria-invalid', 'true'); ids.push(err.id); } else f.removeAttribute('aria-invalid');
        if (ids.length) f.setAttribute('aria-describedby', ids.join(' ')); else f.removeAttribute('aria-describedby');
      };
      const setState = (text, tone) => { if (state) { state.className = 'ax-lamp' + (tone ? ' is-' + tone : ''); state.textContent = text; } };
      const count = () => {
        if (!progress) return;
        const req = fields().filter((f) => f.required);
        const done = req.filter((f) => !AxUI.validate(f)).length;
        const t = AxUI.$('[data-ws-count]', progress);
        if (t) t.textContent = `${done} of ${req.length} required fields done`;
        const m = AxUI.$('.ax-meter > i', progress);
        if (m) m.style.width = (req.length ? Math.round((done / req.length) * 100) : 100) + '%';
      };
      const problems = () => fields().map((f) => [f, AxUI.validate(f)]).filter(([, m]) => m);
      const report = (bad) => {
        if (sum) {
          sum.hidden = !bad.length;
          sum.innerHTML = bad.length ? `<b>${bad.length === 1 ? '1 field needs' : bad.length + ' fields need'} attention</b><ol>${bad.map(([f, m]) => `<li><a href="#${f.id}" data-jump="${f.id}">${AxUI.esc(labelOf(f))}</a>: ${AxUI.esc(m)}</li>`).join('')}</ol>` : '';
        }
        if (checks) AxUI.checks(checks, bad.length ? bad.map(([f, m]) => ({ tone: 'bad', text: `${labelOf(f)}: ${m}`, fix: 'Go to field', onFix: () => f.focus() })) : [{ tone: 'ok', text: 'All checks pass.' }]);
      };
      form.addEventListener('focusout', (e) => { const f = e.target; if (f.closest('.ax-field') && (f.value || f.closest('.ax-field').classList.contains('is-invalid'))) mark(f, AxUI.validate(f)); });
      form.addEventListener('input', (e) => {
        const f = e.target;
        if (f.closest('.ax-field') && f.closest('.ax-field').classList.contains('is-invalid')) mark(f, AxUI.validate(f));
        if (!dirty) { dirty = true; setState('Unsaved changes', 'warn'); AxUI.say('Unsaved changes. Press Ctrl S to save.', { from: form }); }
        count();
      });
      form.addEventListener('change', (e) => {
        const t = e.target;
        if (t.type === 'radio') { const first = AxUI.$(`input[name="${t.name}"][required]`, form) || t; mark(first, AxUI.validate(first)); }
        else if (t.matches('select,input[type=checkbox],input[type=date]')) mark(t, AxUI.validate(t));
        count();
      });
      form.addEventListener('ax:signed', (e) => { const c = AxUI.$('canvas', e.target); if (c) mark(c, ''); count(); });
      if (sum) sum.addEventListener('click', (e) => { const a = e.target.closest('[data-jump]'); if (a) { e.preventDefault(); document.getElementById(a.dataset.jump).focus(); } });
      const finish = (action) => {
        const bad = problems();
        fields().forEach((f) => mark(f, AxUI.validate(f)));
        report(bad);
        if (bad.length) {
          AxUI.say(`${bad.length === 1 ? '1 field needs' : bad.length + ' fields need'} attention before you can ${action === 'save' ? 'save' : action}.`, { tone: 'bad', from: form });
          if (sum) { sum.tabIndex = -1; sum.focus(); } else bad[0][0].focus();
          return;
        }
        dirty = false;
        const data = Object.fromEntries(new FormData(form));
        const sc = form.closest('.ax-scrim');
        if (sc && action === 'save') { AxUI.emit(form, 'save', data); AxUI.closeDialog(sc); AxUI.say(form.dataset.saved || `Saved at ${AxUI.time()}.`, { tone: 'ok', from: AxUI.$('[data-target="#' + sc.id + '"]') || form }); form.reset(); return; }
        if (action === 'save') { setState('Saved', 'ok'); AxUI.say(form.dataset.saved || `Saved at ${AxUI.time()}.`, { tone: 'ok', from: form }); AxUI.emit(form, 'save', data); }
        else { setState('Waiting for approval', 'info'); AxUI.say(`Submitted for approval at ${AxUI.time()}.`, { tone: 'ok', from: form }); AxUI.emit(form, 'submit', { action, data }); }
      };
      form.addEventListener('submit', (e) => { e.preventDefault(); finish('save'); });
      scope.addEventListener('click', (e) => { const b = e.target.closest('[data-ws-submit]'); if (b && (form.contains(b) || !b.closest('form'))) finish(b.dataset.wsSubmit || 'submit'); });
      form.addEventListener('reset', () => setTimeout(() => { fields().forEach((f) => mark(f, '')); if (sum) sum.hidden = true; dirty = false; setState('Draft', ''); count(); }));
      if (form.hasAttribute('data-guard')) window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
      count();
    },
  });
})();

/* Line items: <table class="ax-table ax-lines" data-ax="grid" data-readout="#ro" data-tax="0.0825"> with rows of
   [data-col="qty"] and [data-col="rate"] inputs and a [data-col="amount"] cell. [data-add-row] adds (Alt+N), [data-del-row] removes,
   Enter moves down the same column. Totals (lines, subtotal, tax, total) go to the readout and fire ax:total. */
AxUI.define('grid', {
  init(table) {
    const body = AxUI.$('tbody', table);
    const tpl = body.rows[0].cloneNode(true);
    const scope = table.closest('.ax-panel') || table.parentElement;
    const num = (v) => parseFloat(String(v || '').replace(/,/g, '')) || 0;
    const rate = +table.dataset.tax || 0;
    const recalc = () => {
      let sub = 0;
      Array.from(body.rows).forEach((tr, i) => {
        const a = num(AxUI.$('[data-col="qty"]', tr).value) * num(AxUI.$('[data-col="rate"]', tr).value);
        const idx = AxUI.$('.ax-idx', tr);
        if (idx) idx.textContent = i + 1;
        AxUI.$('[data-col="amount"]', tr).textContent = AxUI.money(a);
        sub += a;
      });
      const totals = { lines: body.rows.length, subtotal: sub, tax: sub * rate, total: sub * (1 + rate) };
      AxUI.$$('[data-grid-out]', table).forEach((c) => { c.textContent = AxUI.money(totals[c.dataset.gridOut]); });
      AxUI.$$('[data-del-row]', body).forEach((b) => { b.disabled = body.rows.length < 2; });
      if (table.dataset.readout) AxUI.readout(table.dataset.readout, totals);
      AxUI.emit(table, 'total', totals);
    };
    const addRow = () => {
      const tr = tpl.cloneNode(true);
      AxUI.$$('input', tr).forEach((i) => { i.value = i.dataset.col === 'qty' ? '1' : ''; i.removeAttribute('aria-invalid'); });
      body.appendChild(tr);
      AxUI.$('input', tr).focus();
      recalc();
    };
    table.addEventListener('input', recalc);
    table.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !e.target.dataset.col) return;
      e.preventDefault();
      const tr = e.target.closest('tr');
      const next = tr.nextElementSibling;
      if (next) AxUI.$(`[data-col="${e.target.dataset.col}"]`, next).focus(); else addRow();
    });
    scope.addEventListener('click', (e) => {
      if (e.target.closest('[data-add-row]')) addRow();
      const del = e.target.closest('[data-del-row]');
      if (del && body.rows.length > 1) {
        const tr = del.closest('tr');
        const at = tr.rowIndex;
        const prev = tr.previousElementSibling || tr.nextElementSibling;
        tr.remove(); recalc();
        AxUI.$('input', prev).focus();
        AxUI.say('Line removed.', { from: table, undo: () => { const ref = body.rows[at - 1] || null; body.insertBefore(tr, ref); recalc(); } });
      }
    });
    recalc();
  },
});

/* List view: <section class="ax-list" data-ax="listview" data-rows='[…]' data-columns='[…]' data-choices='{"status":[…]}' data-noun="purchase orders">.
   Views (tabs with counts), filter chips with "Add filter", search (/), sortable headers, ↑/↓ or J/K move, Enter opens the preview,
   X selects, a bulk bar acts on the selection, page size. Fires ax:filter, ax:preview, ax:bulk. */
AxUI.define('listview', {
  init(root) {
    const rows = JSON.parse(root.dataset.rows);
    const cols = JSON.parse(root.dataset.columns);
    const choices = JSON.parse(root.dataset.choices || '{}');
    const tones = Object.assign({ Draft: '', 'To Receive and Bill': 'info', 'To Bill': 'warn', 'To Receive': 'info', Completed: 'ok', Cancelled: 'off', Overdue: 'bad', Paid: 'ok', Unpaid: 'warn', Approved: 'ok', Pending: 'warn', Rejected: 'bad' }, JSON.parse(root.dataset.tones || '{}'));
    const filters = {};
    const st = { q: '', sort: null, dir: 1, page: 10, sel: new Set(), focus: -1, open: null };
    const tbody = AxUI.$('tbody', root);
    const thead = AxUI.$('thead tr', root);
    const chips = AxUI.$('[data-chips]', root);
    const bulk = AxUI.$('.ax-bulk', root);
    const body = AxUI.$('.ax-list-body', root);
    const preview = AxUI.$('.ax-preview', root);
    const search = AxUI.$('[data-list-search]', root);
    const label = (k) => (cols.find((c) => c.key === k) || { label: k }).label;
    const cell = (c, v) => (c.type === 'money' ? AxUI.money(v) : c.type === 'status' ? `<span class="ax-lamp ${tones[v] ? 'is-' + tones[v] : ''}">${AxUI.esc(v)}</span>` : AxUI.esc(v));
    const match = (r, f) => Object.entries(f).every(([k, v]) => !v || r[k] === v) && (!st.q || Object.values(r).join(' ').toLowerCase().includes(st.q));
    const visible = () => {
      let list = rows.filter((r) => match(r, filters));
      if (st.sort) list = list.slice().sort((a, b) => (a[st.sort] > b[st.sort] ? 1 : a[st.sort] < b[st.sort] ? -1 : 0) * st.dir);
      return list;
    };
    const draw = () => {
      const all = visible();
      const page = all.slice(0, st.page);
      st.focus = Math.min(st.focus, page.length - 1);
      tbody.innerHTML = page.map((r, i) => `<tr data-id="${AxUI.esc(r.id)}" aria-selected="${st.sel.has(r.id)}" class="${i === st.focus ? 'is-focus' : ''}">
        <td class="ax-sel"><label class="ax-check"><input type="checkbox" data-pick ${st.sel.has(r.id) ? 'checked' : ''} aria-label="Select ${AxUI.esc(r.id)}"></label></td>
        ${cols.map((c, k) => `<td class="${c.type === 'money' ? 'is-num' : ''}" ${k ? `data-label="${AxUI.esc(c.label)}"` : ''}>${k ? cell(c, r[c.key]) : `<b>${AxUI.esc(r[c.key])}</b>${r.sub ? `<small>${AxUI.esc(r.sub)}</small>` : ''}`}</td>`).join('')}</tr>`).join('')
        || `<tr><td colspan="${cols.length + 1}" class="is-full"><div class="ax-empty"><div class="ax-empty-art">${AxUI.icon('filter', 'is-lg')}</div><b>No ${AxUI.esc(root.dataset.noun || 'records')} match</b><p>Remove a filter or clear the search to see more.</p><button type="button" class="ax-btn is-secondary is-sm" data-clear-all>Clear filters and search</button></div></td></tr>`;
      chips.innerHTML = Object.entries(filters).filter(([, v]) => v).map(([k, v]) => `<span class="ax-chip"><span>${AxUI.esc(label(k))}</span>${AxUI.esc(v)}<button type="button" data-unfilter="${k}" aria-label="Remove filter ${AxUI.esc(label(k))}">${AxUI.icon('x', 'is-sm')}</button></span>`).join('')
        + `<button type="button" class="ax-btn is-quiet is-sm" data-add-filter aria-haspopup="listbox">${AxUI.icon('plus', 'is-sm')}Add filter</button>`;
      AxUI.$$('[data-view]', root).forEach((v) => {
        const vf = JSON.parse(v.dataset.view);
        let n = AxUI.$('.ax-count', v);
        if (!n) { n = document.createElement('span'); n.className = 'ax-count'; v.appendChild(n); }
        n.textContent = rows.filter((r) => Object.entries(vf).every(([k, x]) => !x || r[k] === x)).length;
        v.setAttribute('aria-selected', String(Object.keys(choices).every((k) => (vf[k] || '') === (filters[k] || ''))));
      });
      AxUI.$$('th[data-sort]', thead).forEach((th) => th.setAttribute('aria-sort', th.dataset.sort === st.sort ? (st.dir > 0 ? 'ascending' : 'descending') : 'none'));
      const all2 = AxUI.$('[data-pick-all]', root);
      if (all2) { all2.checked = page.length > 0 && page.every((r) => st.sel.has(r.id)); all2.indeterminate = !all2.checked && page.some((r) => st.sel.has(r.id)); }
      bulk.hidden = !st.sel.size;
      AxUI.$('[data-selcount]', bulk).textContent = `${st.sel.size} selected`;
      const foot = AxUI.$('[data-count]', root);
      if (foot) foot.textContent = `Showing ${page.length} of ${all.length}`;
      AxUI.emit(root, 'filter', { filters: Object.assign({}, filters), q: st.q, sort: st.sort });
    };
    const openPreview = (id) => {
      const r = rows.find((x) => x.id === id);
      if (!r || !preview) return;
      st.open = id;
      body.classList.add('has-preview');
      preview.hidden = false;
      AxUI.$('[data-pv-title]', preview).textContent = r.id;
      AxUI.$('[data-pv-status]', preview).innerHTML = cell({ type: 'status' }, r.status);
      AxUI.$('[data-pv-facts]', preview).innerHTML = cols.slice(1).map((c) => `<div><dt>${AxUI.esc(c.label)}</dt><dd>${c.type === 'status' ? AxUI.esc(r[c.key]) : cell(c, r[c.key])}</dd></div>`).join('');
      AxUI.emit(root, 'preview', r);
    };
    const closePreview = () => { if (!preview) return; preview.hidden = true; body.classList.remove('has-preview'); st.open = null; };
    const pop = (btn) => {
      AxUI.$$('.ax-pop', root).forEach((p) => p.remove());
      const p = document.createElement('div');
      p.className = 'ax-pop';
      p.setAttribute('role', 'listbox');
      p.innerHTML = Object.entries(choices).map(([k, vals]) => `<div class="ax-menu-label">${AxUI.esc(label(k))} is</div>` + vals.map((v) => `<button type="button" role="option" data-k="${k}" data-v="${AxUI.esc(v)}"><span>${AxUI.esc(v)}</span><small>${rows.filter((r) => r[k] === v).length}</small></button>`).join('')).join('');
      const a = btn.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      p.style.left = Math.max(0, Math.min(a.left - b.left, b.width - 220)) + 'px';
      p.style.top = (a.bottom - b.top + 6) + 'px';
      root.style.position = 'relative';
      root.appendChild(p);
      AxUI.$('button', p).focus();
      p.addEventListener('keydown', (e) => {
        const list = AxUI.$$('button', p);
        const i = list.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
        if (e.key === 'Escape') { e.stopPropagation(); p.remove(); btn.focus(); }
      });
    };
    root.addEventListener('click', (e) => {
      const o = e.target.closest('.ax-pop [data-k]');
      if (o) { filters[o.dataset.k] = o.dataset.v; AxUI.$$('.ax-pop', root).forEach((p) => p.remove()); draw(); AxUI.$('[data-add-filter]', root).focus(); return; }
      if (!e.target.closest('.ax-pop')) AxUI.$$('.ax-pop', root).forEach((p) => p.remove());
      if (e.target.closest('[data-add-filter]')) { pop(e.target.closest('[data-add-filter]')); return; }
      const un = e.target.closest('[data-unfilter]');
      if (un) { filters[un.dataset.unfilter] = ''; draw(); AxUI.$('[data-add-filter]', root).focus(); return; }
      if (e.target.closest('[data-clear-all]')) { Object.keys(filters).forEach((k) => { filters[k] = ''; }); st.q = ''; if (search) search.value = ''; draw(); return; }
      const v = e.target.closest('[data-view]');
      if (v) { Object.keys(filters).forEach((k) => { filters[k] = ''; }); Object.assign(filters, JSON.parse(v.dataset.view)); draw(); return; }
      const th = e.target.closest('th[data-sort]');
      if (th) { st.dir = st.sort === th.dataset.sort ? -st.dir : 1; st.sort = th.dataset.sort; draw(); return; }
      const len = e.target.closest('[data-page]');
      if (len) { st.page = +len.dataset.page; draw(); return; }
      if (e.target.closest('[data-pick-all]')) { const ids = visible().slice(0, st.page).map((r) => r.id); ids.forEach((id) => (e.target.checked ? st.sel.add(id) : st.sel.delete(id))); draw(); return; }
      const pk = e.target.closest('[data-pick]');
      if (pk) { const id = pk.closest('tr').dataset.id; if (pk.checked) st.sel.add(id); else st.sel.delete(id); draw(); return; }
      if (e.target.closest('[data-bulk-clear]')) { st.sel.clear(); draw(); return; }
      const bk = e.target.closest('[data-bulk]');
      if (bk) { const ids = Array.from(st.sel); AxUI.emit(root, 'bulk', { action: bk.dataset.bulk, ids }); AxUI.say(`${bk.textContent.trim()}: ${ids.length} selected.`, { tone: 'ok', from: root }); st.sel.clear(); draw(); return; }
      if (e.target.closest('[data-pv-close]')) { closePreview(); return; }
      const tr = e.target.closest('tbody tr[data-id]');
      if (tr && !e.target.closest('.ax-sel')) { st.focus = Array.from(tbody.rows).indexOf(tr); draw(); openPreview(tr.dataset.id); }
    });
    if (search) search.addEventListener('input', () => { st.q = search.value.trim().toLowerCase(); st.focus = -1; draw(); });
    const table = AxUI.$('table', root);
    table.tabIndex = 0;
    table.setAttribute('aria-label', (root.dataset.noun || 'Records') + ' list. Arrow keys move, Enter opens, X selects.');
    table.addEventListener('keydown', (e) => {
      if (AxUI.typing(e.target)) return;
      const n = tbody.rows.length;
      const k = e.key.toLowerCase();
      if (k === 'arrowdown' || k === 'j') { e.preventDefault(); st.focus = Math.min(n - 1, st.focus + 1); draw(); }
      else if (k === 'arrowup' || k === 'k') { e.preventDefault(); st.focus = Math.max(0, st.focus - 1); draw(); }
      else if ((k === 'enter' || k === 'o') && st.focus >= 0) { e.preventDefault(); openPreview(tbody.rows[st.focus].dataset.id); }
      else if (k === 'x' && st.focus >= 0) { e.preventDefault(); const id = tbody.rows[st.focus].dataset.id; if (st.sel.has(id)) st.sel.delete(id); else st.sel.add(id); draw(); }
      else if (k === 'escape') { if (st.open) { e.preventDefault(); closePreview(); } else if (st.sel.size) { st.sel.clear(); draw(); } }
    });
    table.addEventListener('focus', () => { if (st.focus < 0 && tbody.rows.length && tbody.rows[0].dataset.id) { st.focus = 0; draw(); } });
    Object.keys(choices).forEach((k) => { filters[k] = ''; });
    const init = AxUI.$('[data-view][aria-selected="true"]', root);
    if (init) Object.assign(filters, JSON.parse(init.dataset.view));
    draw();
  },
});

/* Statement report: <section data-ax="report" data-name="profit-and-loss">. Changing a parameter re-runs (fires ax:run, Ctrl+Enter too),
   group rows collapse, [data-export] downloads the visible table as CSV, rows with data-drill fire ax:drill. */
AxUI.define('report', {
  init(root) {
    const table = AxUI.$('.ax-statement', root);
    const stamp = AxUI.$('[data-ran]', root);
    const run = () => {
      const params = Object.fromEntries(AxUI.$$('.ax-params [name]', root).map((i) => [i.name, i.value]));
      if (stamp) stamp.textContent = 'Run ' + new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      AxUI.emit(root, 'run', params);
      AxUI.say('Report updated.', { tone: 'ok', from: root });
    };
    root.addEventListener('change', (e) => { if (e.target.closest('.ax-params')) run(); });
    /* Group and account names become real buttons, so the keyboard reaches them. */
    AxUI.$$('tr.ax-rgroup, tr[data-drill]', root).forEach((tr) => {
      const td = tr.cells[0];
      if (AxUI.$('.ax-rbtn', td)) return;
      td.innerHTML = `<button type="button" class="ax-rbtn"${tr.classList.contains('ax-rgroup') ? ' aria-expanded="true"' : ''}>${td.innerHTML}</button>`;
    });
    root.addEventListener('click', (e) => {
      const g = e.target.closest('tr.ax-rgroup');
      if (g && e.target.closest('.ax-rbtn')) {
        g.classList.toggle('is-closed');
        AxUI.$('.ax-rbtn', g).setAttribute('aria-expanded', String(!g.classList.contains('is-closed')));
        let n = g.nextElementSibling;
        while (n && !n.classList.contains('ax-rgroup') && !n.classList.contains('ax-grand')) { n.hidden = g.classList.contains('is-closed') && !n.classList.contains('ax-subtotal'); n = n.nextElementSibling; }
        return;
      }
      const d = e.target.closest('tr[data-drill]');
      if (d && e.target.closest('.ax-rbtn')) AxUI.emit(root, 'drill', { account: d.dataset.drill });
      if (e.target.closest('[data-run]')) run();
      if (e.target.closest('[data-export]')) {
        const csv = Array.from(table.rows).filter((r) => !r.hidden).map((r) => Array.from(r.cells).map((c) => `"${c.textContent.trim().replace(/"/g, '""')}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = (root.dataset.name || 'report') + '.csv';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        AxUI.say(`Exported ${a.download}.`, { tone: 'ok', from: root });
      }
    });
  },
});

/* Charts (SVG, no library): <div class="ax-chart" data-ax="chart" data-type="bar|line|donut|spark"
   data-labels='[…]' data-series='[{"name":"…","values":[…]}]'>. Draws in on load (bars grow, lines reveal, slices fade). */
AxUI.define('chart', {
  init(el) {
    const type = el.dataset.type || 'bar';
    const labels = JSON.parse(el.dataset.labels || '[]');
    const series = JSON.parse(el.dataset.series || '[]');
    const colors = ['var(--ax-viz-1)', 'var(--ax-viz-2)', 'var(--ax-viz-3)', 'var(--ax-viz-4)', 'var(--ax-viz-5)', 'var(--ax-viz-6)'];
    const short = (n) => (Math.abs(n) >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.abs(n) >= 1e3 ? (n / 1e3).toFixed(0) + 'K' : String(n));
    if (type === 'spark') {
      const v = series[0].values;
      const max = Math.max(...v);
      const min = Math.min(...v);
      const pts = v.map((y, i) => `${(i / (v.length - 1)) * 100},${28 - ((y - min) / (max - min || 1)) * 24}`).join(' ');
      el.innerHTML = `<svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true" class="ax-spark"><polyline class="ax-line ax-reveal" points="${pts}" style="stroke:${el.dataset.color || colors[0]};stroke-width:1.75" vector-effect="non-scaling-stroke"/></svg>`;
      return;
    }
    if (type === 'donut') {
      const v = series[0].values;
      const tot = v.reduce((a, b) => a + b, 0) || 1;
      let a0 = -Math.PI / 2;
      const arcs = v.map((x, i) => {
        const a1 = a0 + (x / tot) * Math.PI * 2;
        const p = (a, r) => `${(100 + r * Math.cos(a)).toFixed(2)} ${(100 + r * Math.sin(a)).toFixed(2)}`;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const d = `M${p(a0, 86)} A86 86 0 ${large} 1 ${p(a1, 86)} L${p(a1, 58)} A58 58 0 ${large} 0 ${p(a0, 58)}Z`;
        a0 = a1;
        return `<path class="ax-slice" d="${d}" style="fill:${colors[i % 6]};--i:${i}"><title>${AxUI.esc(labels[i])}: ${x.toLocaleString()}</title></path>`;
      }).join('');
      el.innerHTML = `<svg viewBox="0 0 200 200" style="max-width:210px;margin:0 auto" role="img" aria-label="${AxUI.esc(el.dataset.title || 'Chart')}">${arcs}<text x="100" y="98" text-anchor="middle" style="font:700 22px var(--ax-font-head);fill:var(--ax-heading)">${AxUI.esc(el.dataset.total || short(tot))}</text><text x="100" y="118" text-anchor="middle" style="font:11px var(--ax-font-body);fill:var(--ax-muted)">${AxUI.esc(el.dataset.center || 'Total')}</text></svg>
        <div class="ax-legend">${labels.map((l, i) => `<span><i style="background:${colors[i % 6]}"></i>${AxUI.esc(l)} <b class="ax-num">${v[i].toLocaleString()}</b></span>`).join('')}</div>`;
      return;
    }
    const W = 600; const H = 220; const L = 44; const B = 24;
    const all = series.flatMap((s) => s.values);
    const max = Math.max(...all, 0) * 1.1 || 1;
    const y = (v) => H - B - (v / max) * (H - B - 10);
    const step = (W - L) / labels.length;
    const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => `<line x1="${L}" x2="${W}" y1="${y(max * t)}" y2="${y(max * t)}"/>`).join('');
    const axis = [0, 0.5, 1].map((t) => `<text x="${L - 8}" y="${y(max * t) + 4}" text-anchor="end">${short(Math.round(max * t))}</text>`).join('')
      + labels.map((l, i) => `<text x="${L + step * i + step / 2}" y="${H - 6}" text-anchor="middle">${AxUI.esc(l)}</text>`).join('');
    let marks = '';
    if (type === 'bar') {
      const bw = Math.min(28, (step * 0.62) / series.length);
      marks = labels.map((l, i) => series.map((s, k) => {
        const x = L + step * i + (step - bw * series.length) / 2 + k * bw;
        return `<rect class="ax-bar" style="--i:${i};fill:${colors[k % 6]}" x="${x}" y="${y(s.values[i])}" width="${bw - 2}" height="${H - B - y(s.values[i])}" data-i="${i}"/>`;
      }).join('')).join('');
    } else {
      marks = series.map((s, k) => `<g class="ax-reveal"><polyline class="ax-line" style="stroke:${colors[k % 6]}" points="${s.values.map((v, i) => `${L + step * i + step / 2},${y(v)}`).join(' ')}"/>${s.values.map((v, i) => `<circle cx="${L + step * i + step / 2}" cy="${y(v)}" r="3.5" style="fill:var(--ax-surface);stroke:${colors[k % 6]};stroke-width:2"/>`).join('')}</g>`).join('');
    }
    const hit = labels.map((l, i) => `<rect x="${L + step * i}" y="0" width="${step}" height="${H - B}" fill="transparent" data-i="${i}"/>`).join('');
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${AxUI.esc(el.dataset.title || 'Chart')}"><g class="ax-grid">${grid}</g><g class="ax-axis">${axis}</g>${marks}<g>${hit}</g></svg>
      ${series.length > 1 ? `<div class="ax-legend">${series.map((s, k) => `<span><i style="background:${colors[k % 6]}"></i>${AxUI.esc(s.name)}</span>`).join('')}</div>` : ''}<div class="ax-tip" hidden></div>`;
    const tip = AxUI.$('.ax-tip', el);
    el.addEventListener('pointermove', (e) => {
      const r = e.target.closest('[data-i]');
      if (!r) { tip.hidden = true; return; }
      const i = +r.dataset.i;
      tip.innerHTML = `<b>${AxUI.esc(labels[i])}</b>${series.map((s) => `${AxUI.esc(s.name)}: ${s.values[i].toLocaleString()}`).join('<br>')}`;
      const box = el.getBoundingClientRect();
      tip.hidden = false;
      tip.style.left = Math.max(0, Math.min(e.clientX - box.left + 12, box.width - tip.offsetWidth)) + 'px';
      tip.style.top = (e.clientY - box.top - 10) + 'px';
    });
    el.addEventListener('pointerleave', () => { tip.hidden = true; });
  },
});

/* Sign-in: <div data-ax="login"> with .ax-auth-step sections (data-step="signin|otp|forgot|sent").
   Links/buttons with data-go switch steps; the 6-box code input auto-advances and accepts paste;
   3 failed attempts lock the form for 60 s with a countdown. Fires ax:signin and ax:otp.
   Add data-autofocus to put the cursor in the email field on load (use it on the real login page). */
AxUI.define('login', {
  init(root) {
    const steps = AxUI.$$('.ax-auth-step', root);
    const go = (name, focus = true) => {
      steps.forEach((s) => { s.hidden = s.dataset.step !== name; });
      const f = AxUI.$(`[data-step="${name}"] input`, root);
      if (f && focus) f.focus();
    };
    let fails = 0;
    let lockUntil = 0;
    const msg = AxUI.$('[data-login-msg]', root);
    const form = AxUI.$('[data-step="signin"] form', root);
    const show = (tone, icon, title, text) => { msg.hidden = false; msg.className = 'ax-banner is-' + tone; msg.innerHTML = `${AxUI.icon(icon)}<div><b>${title}</b>${text ? `<p>${text}</p>` : ''}</div>`; };
    const lock = () => {
      const left = Math.ceil((lockUntil - Date.now()) / 1000);
      const on = left > 0;
      AxUI.$$('input,button[type="submit"]', form).forEach((i) => { i.disabled = on; });
      if (on) { show('bad', 'lock', 'Too many attempts', `Try again in <span class="ax-num">${left}</span> s, or reset your password.`); setTimeout(lock, 1000); }
      else if (lockUntil) { lockUntil = 0; fails = 0; msg.hidden = true; }
    };
    root.addEventListener('click', (e) => { const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go); } });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (!data.usr || !data.pwd) { show('warn', 'alert', 'Enter your email and password'); return; }
      const ok = root.dataset.demoPassword ? data.pwd === root.dataset.demoPassword : true;
      if (!ok) {
        fails += 1;
        if (fails >= 3) { lockUntil = Date.now() + 60000; lock(); return; }
        show('bad', 'x-circle', 'Email or password is wrong', `${3 - fails} attempt${3 - fails === 1 ? '' : 's'} left before a 60 s lock.`);
        return;
      }
      msg.hidden = true;
      AxUI.emit(root, 'signin', { usr: data.usr });
      if (root.dataset.twoFactor !== undefined) go('otp');
    });
    const boxes = AxUI.$$('.ax-otp input', root);
    boxes.forEach((b, i) => {
      b.addEventListener('input', () => { b.value = b.value.replace(/\D/g, '').slice(-1); if (b.value && boxes[i + 1]) boxes[i + 1].focus(); if (boxes.every((x) => x.value)) AxUI.emit(root, 'otp', { code: boxes.map((x) => x.value).join('') }); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus(); });
      b.addEventListener('paste', (e) => { const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (!d) return; e.preventDefault(); d.split('').forEach((c, k) => { if (boxes[k]) boxes[k].value = c; }); (boxes[d.length] || boxes[5]).focus(); });
    });
    const forgot = AxUI.$('[data-step="forgot"] form', root);
    if (forgot) forgot.addEventListener('submit', (e) => { e.preventDefault(); const em = AxUI.$('input', forgot).value; AxUI.$('[data-sent-to]', root).textContent = em || 'your email'; go('sent'); });
    go('signin', root.hasAttribute('data-autofocus'));
  },
});

/* Signature pad (W-4, approvals): <div class="ax-sign" data-ax="sign"><canvas tabindex="0" aria-label="Signature"></canvas></div> + [data-sign-clear].
   Draw with a finger, pen or mouse, or focus the pad and type your name (the keyboard alternative).
   AxUI.signature(el) returns a PNG data URL, or null while empty. Fires ax:signed / ax:cleared. */
AxUI.define('sign', {
  init(box) {
    const c = AxUI.$('canvas', box);
    const ctx = c.getContext('2d');
    let drawing = false;
    let empty = true;
    const size = () => { const r = c.getBoundingClientRect(); c.width = r.width * devicePixelRatio; c.height = r.height * devicePixelRatio; ctx.scale(devicePixelRatio, devicePixelRatio); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = getComputedStyle(box).getPropertyValue('--ax-heading').trim() || '#0E1340'; };
    const pos = (e) => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    c.addEventListener('pointerdown', (e) => { drawing = true; c.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.moveTo(...pos(e)); });
    c.addEventListener('pointermove', (e) => { if (!drawing) return; ctx.lineTo(...pos(e)); ctx.stroke(); if (empty) { empty = false; AxUI.emit(box, 'signed', {}); } });
    c.addEventListener('pointerup', () => { drawing = false; });
    let typed = '';
    const write = () => {
      const r = c.getBoundingClientRect();
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.font = 'italic 600 30px "Montserrat", cursive';
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fillText(typed, 18, r.height / 2 + 10);
      const was = empty;
      empty = !typed;
      if (was && !empty) AxUI.emit(box, 'signed', { typed: true });
    };
    c.addEventListener('keydown', (e) => {
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); typed += e.key; write(); }
      else if (e.key === 'Backspace') { e.preventDefault(); typed = typed.slice(0, -1); write(); }
    });
    const scope = box.parentElement;
    scope.addEventListener('click', (e) => { if (e.target.closest('[data-sign-clear]')) { ctx.clearRect(0, 0, c.width, c.height); empty = true; typed = ''; AxUI.emit(box, 'cleared', {}); } });
    box.axSignature = () => (empty ? null : c.toDataURL('image/png'));
    requestAnimationFrame(size);
  },
});
AxUI.signature = (el) => (el.axSignature ? el.axSignature() : null);

/* Board: <div class="ax-board" data-ax="board"> with <section class="ax-col" data-col="ready"> columns, each holding
   <div class="ax-cards"> of <article class="ax-card" draggable="true" data-id="…" data-amount="1234">.
   Drag a card to a column, or focus it and press ← / → (Home / End for first / last column). Before a move the board fires
   a cancelable ax:move { id, from, to, card }; call event.preventDefault() to refuse it. After a move: counts (.ax-count),
   column sums ([data-sum], from data-amount) and the gate button ([data-gate-col] enabled when that column is empty). */
AxUI.define('board', {
  init(board) {
    const cols = () => AxUI.$$('.ax-col', board);
    const colOf = (card) => card.closest('.ax-col');
    let drag = null;
    const refresh = () => {
      cols().forEach((col) => {
        const cards = AxUI.$$('.ax-card', col);
        const n = AxUI.$('.ax-count', col);
        if (n) n.textContent = cards.length;
        const sum = AxUI.$('[data-sum]', col);
        if (sum) sum.innerHTML = cards.length ? `${AxUI.esc(sum.dataset.sum || 'Total')} <b class="ax-num">${AxUI.money(cards.reduce((a, c) => a + (+c.dataset.amount || 0), 0))}</b>` : AxUI.esc(sum.dataset.empty || 'Nothing here');
        let empty = AxUI.$('.ax-card-empty', col);
        if (!cards.length && !empty && col.dataset.empty) { empty = document.createElement('div'); empty.className = 'ax-card-empty'; empty.textContent = col.dataset.empty; AxUI.$('.ax-cards', col).appendChild(empty); }
        if (cards.length && empty) empty.remove();
      });
      AxUI.$$('[data-gate-col]', board.closest('.ax-desk') || document).forEach((b) => { const col = AxUI.$(`.ax-col[data-col="${b.dataset.gateCol}"]`, board); if (col) b.disabled = AxUI.$$('.ax-card', col).length > 0 || board.hasAttribute('data-locked'); });
      AxUI.emit(board, 'board', { counts: Object.fromEntries(cols().map((c) => [c.dataset.col, AxUI.$$('.ax-card', c).length])) });
    };
    const move = (card, col, byButton) => {
      if (!card || !col || board.hasAttribute('data-locked') || (!byButton && card.classList.contains('is-static'))) return false;
      const from = colOf(card);
      if (from === col) return false;
      if (card.dataset.to && !card.dataset.to.split(/\s+/).includes(col.dataset.col)) { AxUI.say(card.dataset.toMsg || 'This card can’t move there.', { tone: 'warn', from: board }); card.focus({ preventScroll: true }); return false; }
      const ev = new CustomEvent('ax:move', { bubbles: true, cancelable: true, detail: { id: card.dataset.id, from: from.dataset.col, to: col.dataset.col, card } });
      card.dispatchEvent(ev);
      if (ev.defaultPrevented) { card.focus({ preventScroll: true }); return false; }
      AxUI.$('.ax-cards', col).appendChild(card);
      card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
      refresh();
      card.focus({ preventScroll: true });
      AxUI.emit(card, 'moved', { id: card.dataset.id, from: from.dataset.col, to: col.dataset.col });
      return true;
    };
    board.addEventListener('click', (e) => { const b = e.target.closest('[data-move-to]'); if (b && b.closest('.ax-card')) move(b.closest('.ax-card'), AxUI.$('.ax-col[data-col="' + b.dataset.moveTo + '"]', board), true); });
    board.addEventListener('dragstart', (e) => { const c = e.target.closest('.ax-card'); if (!c || board.hasAttribute('data-locked') || c.classList.contains('is-static')) { if (c) e.preventDefault(); return; } drag = c; c.classList.add('is-drag'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', c.dataset.id || ''); });
    board.addEventListener('dragend', () => { drag = null; AxUI.$$('.is-drag, .is-over', board).forEach((x) => x.classList.remove('is-drag', 'is-over')); });
    board.addEventListener('dragover', (e) => { const col = e.target.closest('.ax-col'); if (!col || !drag) return; e.preventDefault(); AxUI.$$('.is-over', board).forEach((x) => x.classList.remove('is-over')); col.classList.add('is-over'); });
    board.addEventListener('dragleave', (e) => { const col = e.target.closest('.ax-col'); if (col && !col.contains(e.relatedTarget)) col.classList.remove('is-over'); });
    board.addEventListener('drop', (e) => { const col = e.target.closest('.ax-col'); if (!col || !drag) return; e.preventDefault(); const c = drag; drag = null; AxUI.$$('.is-over', board).forEach((x) => x.classList.remove('is-over')); move(c, col); });
    board.addEventListener('keydown', (e) => {
      const c = e.target.closest('.ax-card');
      if (!c || e.target !== c) return;
      const list = cols();
      const i = list.indexOf(colOf(c));
      const to = { ArrowRight: list[i + 1], ArrowLeft: list[i - 1], End: list[list.length - 1], Home: list[0] }[e.key];
      if (to) { e.preventDefault(); move(c, to); }
    });
    board.axMove = (id, colName) => move(AxUI.$(`.ax-card[data-id="${id}"]`, board), AxUI.$(`.ax-col[data-col="${colName}"]`, board), true);
    board.axRefresh = refresh;
    refresh();
  },
});
/* Moves a card from script: AxUI.boardMove(boardEl, id, 'ready'). */
AxUI.boardMove = (board, id, col) => board.axMove && board.axMove(id, col);

/* Payroll run as a board: <div class="ax-desk" data-ax="payboard" data-rates='{…}' data-approver="Marcus Lee"> holding a
   data-ax="board" with columns attn / ready / hold and employee cards <article class="ax-card" data-id data-emp data-rate data-w4>
   with an hours input [data-hours], a [data-gross] and [data-net] cell and action buttons [data-act="w4|hold|release"].
   Rules: a card without a W-4 cannot enter "ready"; hold = card in "hold"; totals go to [data-out] in the band; the
   [data-gate-col="attn"] submit button opens when the attention column is empty. Fires ax:payrun { action, totals, held }. */
AxUI.define('payboard', {
  init(desk) {
    const R = Object.assign({ fed: 0.11, state: 0.04, fica: 0.0765, employer: 0.1095 }, JSON.parse(desk.dataset.rates || '{}'));
    const board = AxUI.$('[data-ax~="board"]', desk);
    if (!board.axRefresh) AxUI.init(board.parentElement);
    const cards = () => AxUI.$$('.ax-card[data-emp]', desk);
    const col = (c) => c.closest('.ax-col').dataset.col;
    const hours = (c) => parseFloat(AxUI.$('[data-hours]', c).value) || 0;
    const pay = (c) => { const h = hours(c), r = +c.dataset.rate; return Math.min(h, 80) * r + Math.max(0, h - 80) * r * 1.5; };
    const net = (g) => g * (1 - R.fed - R.state - R.fica);
    let locked = false;
    const paint = (c) => {
      const g = pay(c), held = col(c) === 'hold';
      c.dataset.amount = held ? 0 : g.toFixed(2);
      AxUI.$('[data-gross]', c).textContent = held ? 'Not paid' : AxUI.money(g);
      const n = AxUI.$('[data-net]', c); if (n) n.closest('.ax-card-row').hidden = held; if (n) n.textContent = AxUI.money(net(g));
      AxUI.$('[data-hours]', c).disabled = held || locked;
      const acts = AxUI.$('.ax-card-acts', c);
      acts.innerHTML = locked ? '' : held ? '<button class="ax-btn is-secondary is-sm" type="button" data-act="release">Release</button>' : (c.dataset.w4 !== '1' ? '<button class="ax-btn is-sm" type="button" data-act="w4">Add W-4</button>' : '') + '<button class="ax-btn is-quiet is-sm" type="button" data-act="hold">Hold</button>';
    };
    const totals = () => {
      const paid = cards().filter((c) => col(c) !== 'hold');
      const gross = paid.reduce((s, c) => s + pay(c), 0);
      return { gross, net: net(gross), fund: gross * (1 + R.employer), count: `${paid.length} of ${cards().length}`, paid: paid.length };
    };
    const refresh = () => { cards().forEach(paint); board.axRefresh(); AxUI.readout(desk, totals()); };
    desk.addEventListener('ax:move', (e) => {
      const c = e.detail.card;
      if (locked) { e.preventDefault(); return; }
      if (e.detail.to === 'ready' && c.dataset.w4 !== '1') { e.preventDefault(); AxUI.say(`${c.dataset.emp} can’t be paid without a W-4. Press Add W-4 first.`, { tone: 'bad', from: desk }); }
    });
    desk.addEventListener('ax:moved', (e) => {
      const c = e.target; refresh();
      const text = { hold: `${c.dataset.emp}’s pay is on hold.`, ready: `${c.dataset.emp} is ready to pay.`, attn: c.dataset.w4 === '1' ? `${c.dataset.emp} is back in this run.` : `${c.dataset.emp} still needs a W-4.` }[e.detail.to];
      AxUI.say(text, { tone: e.detail.to === 'attn' && c.dataset.w4 !== '1' ? 'warn' : 'ok', from: desk, undo: e.detail.to === 'hold' ? () => { board.axMove(c.dataset.id, e.detail.from); } : null });
      AxUI.emit(desk, 'payrun', { action: e.detail.to === 'hold' ? 'hold' : 'move', employee: c.dataset.emp, totals: totals() });
    });
    desk.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (b) {
        const c = b.closest('.ax-card');
        if (b.dataset.act === 'w4') { c.dataset.w4 = '1'; refresh(); if (col(c) === 'attn' && board.axMove(c.dataset.id, 'ready')) return; AxUI.say(`W-4 added for ${c.dataset.emp}. Withholding updated.`, { tone: 'ok', from: desk }); }
        if (b.dataset.act === 'hold') board.axMove(c.dataset.id, 'hold');
        if (b.dataset.act === 'release') board.axMove(c.dataset.id, c.dataset.w4 === '1' ? 'ready' : 'attn');
        return;
      }
      if (e.target.closest('[data-pay-save]')) { AxUI.say(`Draft saved at ${AxUI.time()}.`, { tone: 'ok', from: desk }); AxUI.emit(desk, 'payrun', { action: 'save', totals: totals() }); }
      if (e.target.closest('[data-pay-submit]')) {
        if (AxUI.$('.ax-col[data-col="attn"] .ax-card', desk)) return;
        locked = true; board.setAttribute('data-locked', ''); refresh();
        AxUI.$$('[data-pay-submit],[data-pay-save]', desk).forEach((x) => { x.disabled = true; });
        const rail = AxUI.$('.ax-rail', desk); if (rail) rail.querySelectorAll('li').forEach((li, i) => { li.classList.toggle('is-done', i === 0); li.classList.toggle('is-current', i === 1); li.setAttribute('aria-current', i === 1 ? 'step' : 'false'); });
        const st = AxUI.$('[data-pay-state]', desk); if (st) { st.className = 'ax-lamp is-info'; st.textContent = 'Waiting for approval'; }
        AxUI.say(`Submitted for approval at ${AxUI.time()}. ${desk.dataset.approver || 'The approver'} gets an email.`, { tone: 'ok', from: desk });
        AxUI.emit(desk, 'payrun', { action: 'submit', totals: totals(), held: cards().filter((c) => col(c) === 'hold').map((c) => c.dataset.emp) });
      }
    });
    desk.addEventListener('input', (e) => {
      const inp = e.target.closest('[data-hours]'); if (!inp) return;
      const v = parseFloat(inp.value); const ok = inp.value !== '' && v >= 0 && v <= 120;
      inp.setAttribute('aria-invalid', String(!ok));
      if (!ok) { AxUI.say('Hours must be between 0 and 120.', { tone: 'bad', from: desk }); return; }
      refresh(); AxUI.say('Unsaved changes. Press Ctrl S to save.', { from: desk });
    });
    refresh();
  },
});

