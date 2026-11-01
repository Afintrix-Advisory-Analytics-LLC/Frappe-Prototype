/*! Afintrix UI v1 · afintrix-ui.js · 2026-11-01 · Powered by Afintrix */
/* AxUI core: required once. Each component below registers itself with AxUI.define(name, {init})
   and starts on every element with data-ax="name" (also for markup added later: AxUI.init(root)). */
(function () {
  'use strict';
  const modules = {};
  const AxUI = {
    $: (s, r) => (r || document).querySelector(s),
    $$: (s, r) => Array.from((r || document).querySelectorAll(s)),
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    uid: (p) => (p || 'ax') + '-' + Math.random().toString(36).slice(2, 8),
    icon: (name, cls) => `<svg class="ax-i ${cls || ''}" aria-hidden="true"><use href="#ax-i-${name}"></use></svg>`,
    money: (n, cur) => (cur || '') + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    emit: (el, name, detail) => el.dispatchEvent(new CustomEvent('ax:' + name, { bubbles: true, detail })),
    define(name, mod) { modules[name] = mod; if (document.readyState !== 'loading') AxUI.init(document); },
    init(root) {
      AxUI.$$('[data-ax]', root || document).forEach((el) => {
        el.dataset.ax.split(/\s+/).forEach((name) => {
          const flag = 'axReady' + name.replace(/(^|-)(\w)/g, (m, d, c) => c.toUpperCase());
          if (modules[name] && !el.dataset[flag]) { el.dataset[flag] = '1'; modules[name].init(el); }
        });
      });
    },
    /* Keeps keyboard focus inside a dialog; returns a function that releases it. */
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
      const first = AxUI.$$(sel, box).find((x) => x.offsetParent !== null && !x.classList.contains('ax-close'));
      if (first) setTimeout(() => first.focus(), 30);
      return () => { box.removeEventListener('keydown', onKey); if (prev && prev.focus) prev.focus(); };
    },
  };
  window.AxUI = AxUI;
  /* The icon set ships inside this file: added once to <body>, so <use href="#ax-i-…"> works with no extra markup. */
  const ICONS = "<svg xmlns=\"http://www.w3.org/2000/svg\" id=\"ax-icons\" style=\"display:none\" aria-hidden=\"true\">\n  <symbol id=\"ax-i-x\" viewBox=\"0 0 24 24\"><path d=\"M18 6 6 18M6 6l12 12\"/></symbol>\n  <symbol id=\"ax-i-check\" viewBox=\"0 0 24 24\"><path d=\"M20 6 9 17l-5-5\"/></symbol>\n  <symbol id=\"ax-i-check-circle\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m8.5 12 2.5 2.5 4.5-5\"/></symbol>\n  <symbol id=\"ax-i-x-circle\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m15 9-6 6M9 9l6 6\"/></symbol>\n  <symbol id=\"ax-i-alert\" viewBox=\"0 0 24 24\"><path d=\"M12 3 2 20h20L12 3z\"/><path d=\"M12 10v4M12 17.5v.01\"/></symbol>\n  <symbol id=\"ax-i-info\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v5M12 7.5v.01\"/></symbol>\n  <symbol id=\"ax-i-lock\" viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"11\" width=\"16\" height=\"10\" rx=\"1\"/><path d=\"M8 11V7a4 4 0 0 1 8 0v4\"/></symbol>\n  <symbol id=\"ax-i-file\" viewBox=\"0 0 24 24\"><path d=\"M14 3H6v18h12V7l-4-4z\"/><path d=\"M14 3v4h4\"/></symbol>\n  <symbol id=\"ax-i-file-text\" viewBox=\"0 0 24 24\"><path d=\"M14 3H6v18h12V7l-4-4z\"/><path d=\"M14 3v4h4M9 12h6M9 16h6\"/></symbol>\n  <symbol id=\"ax-i-arrow-right\" viewBox=\"0 0 24 24\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></symbol>\n  <symbol id=\"ax-i-arrow-left\" viewBox=\"0 0 24 24\"><path d=\"M19 12H5M11 18l-6-6 6-6\"/></symbol>\n  <symbol id=\"ax-i-chevron-down\" viewBox=\"0 0 24 24\"><path d=\"m6 9 6 6 6-6\"/></symbol>\n  <symbol id=\"ax-i-chevron-right\" viewBox=\"0 0 24 24\"><path d=\"m9 6 6 6-6 6\"/></symbol>\n  <symbol id=\"ax-i-filter\" viewBox=\"0 0 24 24\"><path d=\"M3 5h18l-7 8v6l-4-2v-4L3 5z\"/></symbol>\n  <symbol id=\"ax-i-plus\" viewBox=\"0 0 24 24\"><path d=\"M12 5v14M5 12h14\"/></symbol>\n  <symbol id=\"ax-i-search\" viewBox=\"0 0 24 24\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-3.5-3.5\"/></symbol>\n  <symbol id=\"ax-i-more\" viewBox=\"0 0 24 24\"><circle cx=\"5\" cy=\"12\" r=\"1.2\"/><circle cx=\"12\" cy=\"12\" r=\"1.2\"/><circle cx=\"19\" cy=\"12\" r=\"1.2\"/></symbol>\n  <symbol id=\"ax-i-download\" viewBox=\"0 0 24 24\"><path d=\"M12 3v12M7 10l5 5 5-5M4 19h16\"/></symbol>\n  <symbol id=\"ax-i-upload\" viewBox=\"0 0 24 24\"><path d=\"M12 15V3M7 8l5-5 5 5M4 19h16\"/></symbol>\n  <symbol id=\"ax-i-printer\" viewBox=\"0 0 24 24\"><path d=\"M6 9V3h12v6\"/><rect x=\"3\" y=\"9\" width=\"18\" height=\"8\"/><path d=\"M6 14h12v7H6z\"/></symbol>\n  <symbol id=\"ax-i-mail\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\"/><path d=\"m3 6 9 7 9-7\"/></symbol>\n  <symbol id=\"ax-i-calendar\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"16\"/><path d=\"M3 10h18M8 3v4M16 3v4\"/></symbol>\n  <symbol id=\"ax-i-user\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6\"/></symbol>\n  <symbol id=\"ax-i-users\" viewBox=\"0 0 24 24\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20c1.2-3.5 3.8-5 6.5-5s5.3 1.5 6.5 5M16 4.5a3.5 3.5 0 0 1 0 7M18 15c1.8.6 3 2.2 3.6 5\"/></symbol>\n  <symbol id=\"ax-i-bank\" viewBox=\"0 0 24 24\"><path d=\"M3 9 12 4l9 5M4 9v9M20 9v9M8 11v6M12 11v6M16 11v6M3 20h18\"/></symbol>\n  <symbol id=\"ax-i-wallet\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"14\"/><path d=\"M3 10h18M16 15h2M6 6l9-3 1 3\"/></symbol>\n  <symbol id=\"ax-i-receipt\" viewBox=\"0 0 24 24\"><path d=\"M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z\"/><path d=\"M9 8h6M9 12h6M9 16h3\"/></symbol>\n  <symbol id=\"ax-i-briefcase\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"7\" width=\"18\" height=\"13\"/><path d=\"M8 7V4h8v3M3 13h18\"/></symbol>\n  <symbol id=\"ax-i-chart\" viewBox=\"0 0 24 24\"><path d=\"M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3\"/></symbol>\n  <symbol id=\"ax-i-home\" viewBox=\"0 0 24 24\"><path d=\"m3 11 9-7 9 7M5 10v10h14V10\"/></symbol>\n  <symbol id=\"ax-i-settings\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1\"/></symbol>\n  <symbol id=\"ax-i-trash\" viewBox=\"0 0 24 24\"><path d=\"M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3\"/></symbol>\n  <symbol id=\"ax-i-edit\" viewBox=\"0 0 24 24\"><path d=\"M4 20h4L19 9l-4-4L4 16v4z\"/><path d=\"m13 7 4 4\"/></symbol>\n  <symbol id=\"ax-i-copy\" viewBox=\"0 0 24 24\"><rect x=\"8\" y=\"8\" width=\"13\" height=\"13\"/><path d=\"M16 8V3H3v13h5\"/></symbol>\n  <symbol id=\"ax-i-clock\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/></symbol>\n  <symbol id=\"ax-i-shield\" viewBox=\"0 0 24 24\"><path d=\"M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z\"/><path d=\"m9 12 2 2 4-4\"/></symbol>\n  <symbol id=\"ax-i-refresh\" viewBox=\"0 0 24 24\"><path d=\"M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4\"/></symbol>\n  <symbol id=\"ax-i-eye\" viewBox=\"0 0 24 24\"><path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></symbol>\n  <symbol id=\"ax-i-paperclip\" viewBox=\"0 0 24 24\"><path d=\"M20 11.5 12 19.5a5 5 0 0 1-7-7l8.5-8.5a3.5 3.5 0 0 1 5 5L10 17.5a2 2 0 0 1-3-3L14.5 7\"/></symbol>\n  <symbol id=\"ax-i-layers\" viewBox=\"0 0 24 24\"><path d=\"m12 3 9 5-9 5-9-5 9-5z\"/><path d=\"m3 13 9 5 9-5\"/></symbol>\n  <symbol id=\"ax-i-list\" viewBox=\"0 0 24 24\"><path d=\"M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01\"/></symbol>\n  <symbol id=\"ax-i-grid\" viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/></symbol>\n  <symbol id=\"ax-i-sun\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4\"/></symbol>\n  <symbol id=\"ax-i-moon\" viewBox=\"0 0 24 24\"><path d=\"M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z\"/></symbol>\n  <symbol id=\"ax-i-building\" viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"3\" width=\"16\" height=\"18\"/><path d=\"M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3\"/></symbol>\n  <symbol id=\"ax-i-send\" viewBox=\"0 0 24 24\"><path d=\"M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z\"/></symbol>\n  <symbol id=\"ax-i-pen\" viewBox=\"0 0 24 24\"><path d=\"M3 21c3-1 5-3 6-6l8-8 3 3-8 8c-3 1-5 3-6 6\"/><path d=\"m14 6 3-3 4 4-3 3\"/></symbol>\n  <symbol id=\"ax-i-external\" viewBox=\"0 0 24 24\"><path d=\"M14 4h6v6M20 4l-9 9M18 14v6H4V6h6\"/></symbol>\n  <symbol id=\"ax-i-box\" viewBox=\"0 0 24 24\"><path d=\"m3 7 9-4 9 4v10l-9 4-9-4V7z\"/><path d=\"m3 7 9 4 9-4M12 11v10\"/></symbol>\n  <symbol id=\"ax-i-truck\" viewBox=\"0 0 24 24\"><path d=\"M3 6h11v10H3zM14 10h4l3 3v3h-7\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/></symbol>\n  <symbol id=\"ax-i-command\" viewBox=\"0 0 24 24\"><path d=\"M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6z\"/></symbol>\n  <symbol id=\"ax-i-cpu\" viewBox=\"0 0 24 24\"><rect x=\"6\" y=\"6\" width=\"12\" height=\"12\"/><path d=\"M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4\"/></symbol>\n  <symbol id=\"ax-i-key\" viewBox=\"0 0 24 24\"><circle cx=\"8\" cy=\"15\" r=\"4\"/><path d=\"m11 12 9-9M17 6l3 3\"/></symbol>\n</svg>";
  document.addEventListener('DOMContentLoaded', () => {
    if (ICONS.startsWith('<svg') && !document.getElementById('ax-icons')) document.body.insertAdjacentHTML('afterbegin', ICONS);
    AxUI.init(document);
  });
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

/* Tabs: <div data-ax="tabs"> with [role=tab][aria-controls] buttons; arrow keys move between tabs. */
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

/* Menu: <div class="ax-menu-wrap" data-ax="menu"><button aria-haspopup="menu">…<div class="ax-menu" role="menu" hidden>.
   Closes on outside click and Escape; arrow keys move; items fire ax:menu with data-action. */
AxUI.define('menu', {
  init(wrap) {
    const btn = AxUI.$('[aria-haspopup]', wrap);
    const menu = AxUI.$('[role="menu"]', wrap);
    const items = () => AxUI.$$('button,a', menu);
    const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    const open = () => { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); const f = items()[0]; if (f) f.focus(); };
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
   Typing filters, ↑/↓/Enter pick, "Create new" fires ax:create. Picking fires ax:pick. */
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
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-controls', id);
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('autocomplete', 'off');
    const options = JSON.parse(box.dataset.options || '[]');
    let active = 0;
    let shown = [];
    const render = () => {
      const q = input.value.trim().toLowerCase();
      shown = options.filter((o) => !q || o.value.toLowerCase().includes(q) || (o.hint || '').toLowerCase().includes(q)).slice(0, 8);
      const create = box.dataset.create && q && !options.some((o) => o.value.toLowerCase() === q);
      list.innerHTML = shown.map((o, i) => `<li role="option" id="${id}-${i}" aria-selected="${i === active}" data-i="${i}"><span>${AxUI.esc(o.value)}</span><small>${AxUI.esc(o.hint || '')}</small></li>`).join('')
        + (shown.length ? '' : '<li class="is-empty">No match</li>')
        + (create ? `<li role="option" class="is-create" data-create aria-selected="${active === shown.length}">+ Create ${AxUI.esc(box.dataset.create)} “${AxUI.esc(input.value.trim())}”</li>` : '');
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

/* Multi-select tokens: <div class="ax-tokens" data-ax="tokens"><input placeholder="Add…"></div>. Enter or comma adds, Backspace removes. */
AxUI.define('tokens', {
  init(box) {
    const input = AxUI.$('input', box);
    const add = (v) => {
      v = v.trim();
      if (!v || AxUI.$$('.ax-token', box).some((t) => t.dataset.value === v)) return;
      const t = document.createElement('span');
      t.className = 'ax-token';
      t.dataset.value = v;
      t.innerHTML = `${AxUI.esc(v)}<button type="button" aria-label="Remove ${AxUI.esc(v)}">${AxUI.icon('x', 'is-sm')}</button>`;
      box.insertBefore(t, input);
      AxUI.emit(box, 'change', { values: AxUI.$$('.ax-token', box).map((x) => x.dataset.value) });
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input.value); input.value = ''; }
      if (e.key === 'Backspace' && !input.value) { const last = AxUI.$$('.ax-token', box).pop(); if (last) last.remove(); }
    });
    box.addEventListener('click', (e) => { const x = e.target.closest('.ax-token button'); if (x) x.parentElement.remove(); else input.focus(); });
  },
});

/* Currency / number: <input data-ax="amount"> shows 1,234.50 when not editing.
   Password: <div class="ax-pw" data-ax="password"> with a Show/Hide button and optional .ax-strength meter. */
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

/* File drop: <div data-ax="upload"><label class="ax-drop">…<input type="file" hidden multiple></label><ul class="ax-files"></ul></div>. */
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
        li.innerHTML = `${AxUI.icon(tooBig ? 'alert' : 'file')}<span>${AxUI.esc(f.name)}</span><small>${tooBig ? 'Too large' : (f.size / 1024).toFixed(0) + ' KB'}</small><button type="button" class="ax-btn is-ghost is-sm is-icon" aria-label="Remove ${AxUI.esc(f.name)}">${AxUI.icon('x', 'is-sm')}</button>`;
        if (tooBig) li.style.borderColor = 'var(--ax-bad)';
        list.appendChild(li);
      });
      AxUI.emit(box, 'files', { count: list.children.length });
    };
    input.addEventListener('change', () => { add(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, () => drop.classList.remove('is-over')));
    drop.addEventListener('drop', (e) => { e.preventDefault(); add(e.dataTransfer.files); });
    list.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) b.closest('li').remove(); });
  },
});

/* Receipt toasts: AxUI.toast({ title, text, tone: 'ok'|'warn'|'bad'|'info', undo: fn, ref }). Stack bottom-left, 6 s, pauses on hover. */
(function () {
  let stack = null;
  AxUI.toast = function (o) {
    if (!stack) { stack = document.createElement('div'); stack.className = 'ax-toasts ax'; stack.setAttribute('aria-live', 'polite'); document.body.appendChild(stack); }
    const t = document.createElement('div');
    const tone = o.tone || 'info';
    t.className = 'ax-toast is-' + tone;
    t.setAttribute('role', tone === 'bad' ? 'alert' : 'status');
    const now = new Date();
    t.innerHTML = `${AxUI.icon({ ok: 'check-circle', warn: 'alert', bad: 'x-circle', info: 'info' }[tone])}
      <div><b>${AxUI.esc(o.title)}</b>${o.text ? `<p>${AxUI.esc(o.text)}</p>` : ''}<small>${AxUI.esc(o.ref || 'Ref')} · ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</small></div>
      ${o.undo ? '<button type="button" data-undo>Undo</button>' : ''}<button type="button" data-x aria-label="Dismiss">${AxUI.icon('x', 'is-sm')}</button>`;
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
  /* Declarative: <button data-ax="toast" data-title="Saved" data-text="…" data-tone="ok"> */
  AxUI.define('toast', { init(b) { b.addEventListener('click', () => AxUI.toast({ title: b.dataset.title, text: b.dataset.text, tone: b.dataset.tone, ref: b.dataset.ref })); } });
})();
/* Dismissible banner: <div class="ax-banner" data-ax="banner"> with a .ax-banner-x button. */
AxUI.define('banner', { init(b) { const x = AxUI.$('.ax-banner-x', b); if (x) x.addEventListener('click', () => b.remove()); } });

/* Dialogs. Markup: <div class="ax-scrim" id="…" hidden><div class="ax-dialog" role="dialog" aria-modal="true" aria-labelledby="…">.
   Open with <button data-ax="open" data-target="#id">, close with [data-close], Escape or a click on the scrim.
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
    scrim.hidden = true;
    document.body.style.overflow = '';
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
    if (open) AxUI.closeDialog(open);
  });
  AxUI.define('open', { init(b) { b.addEventListener('click', () => AxUI.openDialog(AxUI.$(b.dataset.target))); } });

  AxUI.confirm = (o) => new Promise((resolve) => {
    const scrim = document.createElement('div');
    scrim.className = 'ax-scrim ax';
    const id = AxUI.uid('dlg');
    scrim.innerHTML = `
      <div class="ax-dialog ${o.danger ? 'is-danger' : ''}" role="alertdialog" aria-modal="true" aria-labelledby="${id}">
        <div class="ax-dialog-head"><div><span class="ax-kicker">${o.danger ? 'Cannot be undone' : 'Please confirm'}</span><h2 id="${id}">${AxUI.esc(o.title)}</h2>${o.text ? `<p>${AxUI.esc(o.text)}</p>` : ''}</div><button class="ax-close" data-close aria-label="Close">${AxUI.icon('x')}</button></div>
        <div class="ax-dialog-body">
          ${o.consequences ? `<ul class="ax-consequences">${o.consequences.map((c) => `<li>${AxUI.esc(c)}</li>`).join('')}</ul>` : ''}
          ${o.typed ? `<div class="ax-field"><label class="ax-label" for="${id}-t">Type ${AxUI.esc(o.typed)} to confirm</label><input class="ax-input" id="${id}-t" autocomplete="off"></div>` : ''}
        </div>
        <div class="ax-dialog-foot"><button class="ax-btn is-secondary" data-close>Cancel</button><button class="ax-btn ${o.danger ? 'is-danger' : ''}" data-ok ${o.typed ? 'disabled' : ''}>${AxUI.esc(o.ok || 'Confirm')}</button></div>
      </div>`;
    document.body.appendChild(scrim);
    const ok = AxUI.$('[data-ok]', scrim);
    const typed = AxUI.$('input', scrim);
    if (typed) typed.addEventListener('input', () => { ok.disabled = typed.value.trim() !== o.typed; });
    let answered = false;
    ok.addEventListener('click', () => { answered = true; AxUI.closeDialog(scrim); });
    scrim.addEventListener('ax:close', () => { scrim.remove(); resolve(answered); });
    AxUI.openDialog(scrim);
  });
  /* <button data-ax="confirm" data-title="…" data-text="…" data-typed="DELETE" data-danger> */
  AxUI.define('confirm', {
    init(b) {
      b.addEventListener('click', async () => {
        const yes = await AxUI.confirm({ title: b.dataset.title, text: b.dataset.text, typed: b.dataset.typed, danger: b.hasAttribute('data-danger'), ok: b.dataset.ok, consequences: b.dataset.consequences ? b.dataset.consequences.split('|') : null });
        AxUI.emit(b, 'confirm', { yes });
      });
    },
  });
})();

/* Wizard: <div data-ax="wizard"> with .ax-wizard-steps li and .ax-wizard-pane sections; [data-next], [data-prev], [data-finish]. */
AxUI.define('wizard', {
  init(w) {
    const steps = AxUI.$$('.ax-wizard-steps li', w);
    const panes = AxUI.$$('.ax-wizard-pane', w);
    let i = 0;
    const show = () => {
      steps.forEach((s, k) => { s.classList.toggle('is-current', k === i); s.classList.toggle('is-done', k < i); s.setAttribute('aria-current', k === i ? 'step' : 'false'); });
      panes.forEach((p, k) => { p.hidden = k !== i; });
      AxUI.$$('[data-prev]', w.closest('.ax-dialog') || w).forEach((b) => { b.disabled = i === 0; });
      AxUI.$$('[data-next]', w.closest('.ax-dialog') || w).forEach((b) => { b.hidden = i === panes.length - 1; });
      AxUI.$$('[data-finish]', w.closest('.ax-dialog') || w).forEach((b) => { b.hidden = i !== panes.length - 1; });
    };
    const scope = w.closest('.ax-dialog') || w;
    scope.addEventListener('click', (e) => {
      if (e.target.closest('[data-next]')) {
        const req = AxUI.$$('[required]', panes[i]).find((x) => (x.type === 'checkbox' ? !x.checked : !x.value.trim()));
        if (req) {
          req.focus();
          const f = req.closest('.ax-field');
          if (f) f.classList.add('is-invalid');
          else AxUI.toast({ title: 'One more step', text: 'Tick the box to continue', tone: 'warn' });
          return;
        }
        i = Math.min(panes.length - 1, i + 1); show();
      }
      if (e.target.closest('[data-prev]')) { i = Math.max(0, i - 1); show(); }
    });
    w.addEventListener('input', (e) => { const f = e.target.closest('.ax-field'); if (f) f.classList.remove('is-invalid'); });
    show();
  },
});

/* Command bar (Ctrl+K / ⌘K): <div class="ax-scrim" data-ax="cmd" hidden> with the .ax-cmd box.
   Items come from data-items='[{"group":"Go to","label":"Purchase Orders","hint":"List","href":"#"}]'. Fires ax:command. */
AxUI.define('cmd', {
  init(scrim) {
    const box = AxUI.$('.ax-cmd', scrim);
    const input = AxUI.$('input', box);
    const list = AxUI.$('ul', box);
    const items = JSON.parse(scrim.dataset.items || '[]');
    let active = 0;
    let shown = [];
    const render = () => {
      const q = input.value.trim().toLowerCase();
      shown = items.filter((x) => !q || (x.label + ' ' + (x.hint || '') + ' ' + x.group).toLowerCase().includes(q));
      let last = '';
      list.innerHTML = shown.map((x, i) => {
        const head = x.group !== last ? `<li class="ax-cmd-group" role="presentation">${AxUI.esc(x.group)}</li>` : '';
        last = x.group;
        return head + `<li role="option" data-i="${i}" aria-selected="${i === active}">${AxUI.icon(x.icon || 'arrow-right')}<span>${AxUI.esc(x.label)}</span><small>${AxUI.esc(x.hint || '')}</small></li>`;
      }).join('') || '<li class="ax-cmd-group">Nothing matches</li>';
    };
    const run = (i) => { const x = shown[i]; if (!x) return; AxUI.closeDialog(scrim); AxUI.emit(document, 'command', x); if (x.href && x.href !== '#') location.href = x.href; };
    input.addEventListener('input', () => { active = 0; render(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(shown.length - 1, active + 1); render(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); render(); }
      if (e.key === 'Enter') { e.preventDefault(); run(active); }
    });
    list.addEventListener('click', (e) => { const li = e.target.closest('[role="option"]'); if (li) run(+li.dataset.i); });
    const open = () => { input.value = ''; active = 0; render(); AxUI.openDialog(scrim); };
    document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (scrim.hidden) open(); } });
    AxUI.$$('[data-cmd-open]').forEach((b) => b.addEventListener('click', open));
    render();
  },
});

/* Ledger form: <form data-ax="ledgerform"> with .ax-row rows (data-label) holding required inputs,
   an optional .ax-fixlist [hidden], .ax-meter, .ax-checklist and .ax-savebar.
   Validates on submit: margin notes per row + "N things to fix" list with jump links; tracks unsaved changes. */
AxUI.define('ledgerform', {
  init(form) {
    const rows = () => AxUI.$$('.ax-row', form);
    const fix = AxUI.$('.ax-fixlist', form);
    const savebar = AxUI.$('.ax-savebar', form);
    const meter = AxUI.$('.ax-meter i', form.closest('.ax-formpage') || form);
    const checklist = AxUI.$('.ax-checklist', form.closest('.ax-formpage') || form);
    let dirty = false;
    const problem = (row) => {
      const f = AxUI.$('input,select,textarea', row);
      if (!f) return null;
      if (f.required && !f.value.trim()) return 'Required — enter ' + (row.dataset.label || 'a value').toLowerCase() + '.';
      if (f.type === 'email' && f.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value)) return 'Use a full email address, like name@company.com.';
      if (f.dataset.min && parseFloat(f.value.replace(/,/g, '')) < +f.dataset.min) return 'Must be at least ' + f.dataset.min + '.';
      if (f.pattern && f.value && !new RegExp('^(?:' + f.pattern + ')$').test(f.value)) return f.title || 'Check the format.';
      return null;
    };
    const mark = (row, msg) => {
      row.classList.toggle('is-invalid', !!msg);
      const note = AxUI.$('.ax-row-note', row);
      if (note) note.innerHTML = msg ? `<span class="ax-note" role="alert">${AxUI.icon('alert', 'is-sm')}${AxUI.esc(msg)}</span>` : (note.dataset.hint ? `<span class="ax-note is-info">${AxUI.esc(note.dataset.hint)}</span>` : '');
    };
    const progress = () => {
      const req = rows().filter((r) => AxUI.$('[required]', r));
      const done = req.filter((r) => !problem(r));
      if (meter) meter.style.width = (req.length ? Math.round((done.length / req.length) * 100) : 100) + '%';
      if (checklist) checklist.innerHTML = req.map((r) => `<li class="${problem(r) ? '' : 'is-done'}">${AxUI.esc(r.dataset.label)}</li>`).join('');
    };
    form.addEventListener('input', (e) => {
      const row = e.target.closest('.ax-row');
      if (row && row.classList.contains('is-invalid')) mark(row, problem(row));
      if (!dirty && savebar) { dirty = true; savebar.hidden = false; }
      progress();
    });
    form.addEventListener('focusin', (e) => { AxUI.$$('.ax-ledger-sec', form).forEach((s) => s.classList.toggle('is-focus', s.contains(e.target))); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = rows().map((r) => [r, problem(r)]).filter(([, m]) => m);
      rows().forEach((r) => mark(r, problem(r)));
      if (fix) {
        fix.hidden = !bad.length;
        fix.innerHTML = bad.length ? `<b>${bad.length} ${bad.length === 1 ? 'thing' : 'things'} to fix before saving</b><ol>${bad.map(([r, m]) => `<li><a href="#" data-jump="${AxUI.$('input,select,textarea', r).id}">${AxUI.esc(r.dataset.label)}</a> — ${AxUI.esc(m)}</li>`).join('')}</ol>` : '';
        if (bad.length) fix.scrollIntoView({ block: 'nearest' });
      }
      if (bad.length) { AxUI.$('input,select,textarea', bad[0][0]).focus(); return; }
      dirty = false;
      if (savebar) savebar.hidden = true;
      AxUI.emit(form, 'save', Object.fromEntries(new FormData(form)));
    });
    if (fix) fix.addEventListener('click', (e) => { const a = e.target.closest('[data-jump]'); if (a) { e.preventDefault(); document.getElementById(a.dataset.jump).focus(); } });
    form.addEventListener('reset', () => setTimeout(() => { rows().forEach((r) => mark(r, null)); if (fix) fix.hidden = true; dirty = false; if (savebar) savebar.hidden = true; progress(); }));
    window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
    rows().forEach((r) => mark(r, null));
    progress();
  },
});

/* Child table: <table class="ax-grid-table" data-ax="grid" data-total="#el"> with rows of
   [data-col="qty"] and [data-col="rate"] inputs; amount = qty × rate. [data-add-row] adds, [data-del-row] removes. */
AxUI.define('grid', {
  init(table) {
    const body = AxUI.$('tbody', table);
    const tpl = body.rows[0].cloneNode(true);
    const scope = table.closest('.ax-card') || table.parentElement;
    const num = (v) => parseFloat(String(v || '').replace(/,/g, '')) || 0;
    const recalc = () => {
      let total = 0;
      Array.from(body.rows).forEach((tr, i) => {
        const q = num(AxUI.$('[data-col="qty"]', tr).value);
        const r = num(AxUI.$('[data-col="rate"]', tr).value);
        AxUI.$('.ax-idx', tr).textContent = i + 1;
        AxUI.$('[data-col="amount"]', tr).textContent = AxUI.money(q * r);
        total += q * r;
      });
      const foot = AxUI.$('[data-grid-total]', table);
      if (foot) foot.textContent = AxUI.money(total);
      // The last row cannot be removed: a document keeps at least one line.
      AxUI.$$('[data-del-row]', body).forEach((b) => { b.disabled = body.rows.length < 2; });
      AxUI.emit(table, 'total', { total });
    };
    table.addEventListener('input', recalc);
    scope.addEventListener('click', (e) => {
      if (e.target.closest('[data-add-row]')) {
        const tr = tpl.cloneNode(true);
        AxUI.$$('input', tr).forEach((i) => { i.value = i.dataset.col === 'qty' ? '1' : ''; });
        body.appendChild(tr);
        AxUI.$('input', tr).focus();
        recalc();
      }
      const del = e.target.closest('[data-del-row]');
      if (del && body.rows.length > 1) { del.closest('tr').remove(); recalc(); }
    });
    recalc();
  },
});

/* Route slip (workflow states): <ol class="ax-route" data-ax="routeslip" data-actions="#actions"> with li[data-state];
   buttons in the actions box carry data-to="<state>". Moves the current state and fires ax:transition. */
AxUI.define('routeslip', {
  init(ol) {
    const items = AxUI.$$('li', ol);
    const actions = AxUI.$(ol.dataset.actions);
    const set = (state, who) => {
      const idx = items.findIndex((li) => li.dataset.state === state);
      items.forEach((li, i) => {
        li.classList.toggle('is-done', i < idx);
        li.classList.toggle('is-current', i === idx);
        li.classList.remove('is-stopped');
        li.setAttribute('aria-current', i === idx ? 'step' : 'false');
      });
      if (who) { const s = AxUI.$('small', items[idx]); if (s) s.textContent = who; }
      if (actions) AxUI.$$('[data-to]', actions).forEach((b) => { b.hidden = b.dataset.from && b.dataset.from !== state; });
      AxUI.emit(ol, 'transition', { state });
    };
    if (actions) {
      actions.addEventListener('click', (e) => {
        const b = e.target.closest('[data-to]');
        if (!b) return;
        if (b.dataset.to === 'Rejected') {
          const cur = items.find((li) => li.classList.contains('is-current'));
          cur.classList.remove('is-current');
          cur.classList.add('is-stopped');
          AxUI.$('small', cur).textContent = 'Rejected · just now';
          AxUI.$$('[data-to]', actions).forEach((x) => { x.hidden = x.dataset.to !== 'Draft'; });
          return;
        }
        set(b.dataset.to, 'You · just now');
      });
    }
    set((items.find((li) => li.classList.contains('is-current')) || items[0]).dataset.state);
  },
});

/* List view: <section data-ax="listview" data-rows='[…]' data-columns='[…]'>. Filter sentence (tokens open choice popovers),
   search, sortable headers, selection with the action dock, peek drawer on row click, page length. */
AxUI.define('listview', {
  init(root) {
    const rows = JSON.parse(root.dataset.rows);
    const cols = JSON.parse(root.dataset.columns);
    const filters = JSON.parse(root.dataset.filters || '{}');
    const choices = JSON.parse(root.dataset.choices || '{}');
    const tbody = AxUI.$('tbody', root);
    const thead = AxUI.$('thead tr', root);
    const sentence = AxUI.$('.ax-sentence', root);
    const dock = AxUI.$('.ax-dock', root);
    const peek = AxUI.$('.ax-peek', root);
    const count = AxUI.$('[data-count]', root);
    const tones = { Draft: '', 'To Receive and Bill': 'is-info', 'To Bill': 'is-warn', 'To Receive': 'is-info', Completed: 'is-ok', Cancelled: 'is-bad', Overdue: 'is-bad', Paid: 'is-ok', Unpaid: 'is-warn', Approved: 'is-ok', Open: 'is-info', Rejected: 'is-bad' };
    const rail = { 'is-ok': 'var(--ax-ok)', 'is-warn': 'var(--ax-warn)', 'is-bad': 'var(--ax-bad)', 'is-info': 'var(--ax-blue)' };
    const state = { sort: null, dir: 1, q: '', page: 20, selected: new Set() };
    const fmt = (c, v) => (c.type === 'money' ? AxUI.money(v) : c.type === 'status' ? `<span class="ax-stamp ${tones[v] || ''}">${AxUI.esc(v)}</span>` : AxUI.esc(v));
    const matches = (r) => Object.entries(filters).every(([k, v]) => v == null || v === '' || r[k] === v) && (!state.q || Object.values(r).join(' ').toLowerCase().includes(state.q));
    const drawSentence = () => {
      const label = (k) => (cols.find((c) => c.key === k) || { label: k }).label.toLowerCase();
      sentence.innerHTML = `${AxUI.icon('filter')}<span>Showing</span><b class="ax-num">${rows.filter(matches).length}</b><span>${AxUI.esc(root.dataset.noun || 'records')}</span>`
        + Object.keys(choices).map((k, i) => `<span>${i === 0 ? 'where' : 'and'} ${AxUI.esc(label(k))} is</span><button type="button" class="ax-tok ${filters[k] ? 'is-set' : ''}" data-tok="${k}" aria-haspopup="listbox">${AxUI.esc(filters[k] || 'any')}${filters[k] ? '<span class="ax-x" data-clear="' + k + '" aria-label="Clear">×</span>' : ''}</button>`).join('')
        + `<input class="ax-search" type="search" placeholder="Search in results" value="${AxUI.esc(state.q)}" aria-label="Search">`;
    };
    const draw = () => {
      let list = rows.filter(matches);
      if (state.sort) list = list.slice().sort((a, b) => (a[state.sort] > b[state.sort] ? 1 : a[state.sort] < b[state.sort] ? -1 : 0) * state.dir);
      const page = list.slice(0, state.page);
      tbody.innerHTML = page.map((r) => {
        const tone = tones[r.status] || '';
        return `<tr class="ax-rowlink" data-id="${AxUI.esc(r.id)}" style="--rail:${rail[tone] || 'transparent'}" aria-selected="${state.selected.has(r.id)}">
          <td class="ax-sel"><label class="ax-check"><input type="checkbox" data-pick ${state.selected.has(r.id) ? 'checked' : ''} aria-label="Select ${AxUI.esc(r.id)}"></label></td>
          ${cols.map((c, i) => `<td class="${c.type === 'money' ? 'is-num ax-num' : ''} ${i === 0 ? 'ax-first' : ''}" ${i === 0 ? '' : `data-label="${AxUI.esc(c.label)}"`}>${i === 0 ? `<span class="ax-ref">${AxUI.esc(r[c.key])}</span>${r.sub ? `<span class="ax-sub">${AxUI.esc(r.sub)}</span>` : ''}` : fmt(c, r[c.key])}</td>`).join('')}
        </tr>`;
      }).join('') || `<tr><td colspan="${cols.length + 1}"><div class="ax-empty"><div class="ax-empty-art">${AxUI.icon('filter', 'is-lg')}</div><b>Nothing matches</b><p>No ${AxUI.esc(root.dataset.noun || 'records')} fit this sentence. Clear a condition to widen it.</p><button type="button" class="ax-btn is-secondary is-sm" data-clear-all>Clear all conditions</button></div></td></tr>`;
      if (count) count.textContent = `Showing ${page.length} of ${list.length}`;
      AxUI.$$('th[data-sort]', thead).forEach((th) => th.setAttribute('aria-sort', th.dataset.sort === state.sort ? (state.dir > 0 ? 'ascending' : 'descending') : 'none'));
      dock.hidden = !state.selected.size;
      AxUI.$('[data-selcount]', dock).textContent = `${state.selected.size} selected`;
      const all = AxUI.$('[data-pick-all]', root);
      if (all) { all.checked = page.length > 0 && page.every((r) => state.selected.has(r.id)); all.indeterminate = !all.checked && page.some((r) => state.selected.has(r.id)); }
      AxUI.$$('[data-view]', root).forEach((v) => {
        const vf = JSON.parse(v.dataset.view);
        const n = rows.filter((r) => Object.entries(vf).every(([k, x]) => !x || r[k] === x)).length;
        let c = AxUI.$('.ax-count', v);
        if (!c) { c = document.createElement('span'); c.className = 'ax-count'; v.appendChild(c); }
        c.textContent = n;
        v.setAttribute('aria-selected', String(Object.keys(vf).every((k) => (vf[k] || '') === (filters[k] || ''))));
      });
      drawSentence();
      AxUI.emit(root, 'filter', { filters, q: state.q, sort: state.sort });
    };
    const popover = (btn, key) => {
      AxUI.$$('.ax-pop', root).forEach((p) => p.remove());
      const pop = document.createElement('div');
      pop.className = 'ax-pop';
      pop.setAttribute('role', 'listbox');
      pop.innerHTML = ['any'].concat(choices[key]).map((v) => `<button type="button" role="option" aria-checked="${(filters[key] || 'any') === v}" data-v="${AxUI.esc(v)}"><span>${AxUI.esc(v)}</span><small>${v === 'any' ? rows.length : rows.filter((r) => r[key] === v).length}</small></button>`).join('');
      const r = btn.getBoundingClientRect();
      const base = root.getBoundingClientRect();
      pop.style.left = (r.left - base.left) + 'px';
      pop.style.top = (r.bottom - base.top + 6) + 'px';
      root.style.position = 'relative';
      root.appendChild(pop);
      AxUI.$('button', pop).focus();
      pop.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; filters[key] = b.dataset.v === 'any' ? '' : b.dataset.v; pop.remove(); draw(); });
      pop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { pop.remove(); btn.focus(); } });
    };
    root.addEventListener('click', (e) => {
      const clear = e.target.closest('[data-clear]');
      if (clear) { e.stopPropagation(); filters[clear.dataset.clear] = ''; draw(); return; }
      if (e.target.closest('[data-clear-all]')) { Object.keys(filters).forEach((k) => { filters[k] = ''; }); state.q = ''; draw(); return; }
      const view = e.target.closest('[data-view]');
      if (view) { Object.assign(filters, JSON.parse(view.dataset.view)); draw(); return; }
      const save = e.target.closest('[data-save-view]');
      if (save) {
        const name = Object.values(filters).filter(Boolean).join(' · ') || 'All';
        const b = document.createElement('button');
        b.setAttribute('role', 'tab');
        b.dataset.view = JSON.stringify(Object.assign({}, filters));
        b.textContent = name;
        save.before(b);
        draw();
        AxUI.emit(root, 'saveview', { name, filters: Object.assign({}, filters) });
        return;
      }
      const tok = e.target.closest('[data-tok]');
      if (tok) { popover(tok, tok.dataset.tok); return; }
      if (!e.target.closest('.ax-pop')) AxUI.$$('.ax-pop', root).forEach((p) => p.remove());
      const th = e.target.closest('th[data-sort]');
      if (th) { state.dir = state.sort === th.dataset.sort ? -state.dir : 1; state.sort = th.dataset.sort; draw(); return; }
      const len = e.target.closest('[data-page]');
      if (len) { state.page = +len.dataset.page; AxUI.$$('[data-page]', root).forEach((b) => b.setAttribute('aria-pressed', String(b === len))); draw(); return; }
      if (e.target.closest('[data-pick-all]')) {
        const ids = rows.filter(matches).slice(0, state.page).map((r) => r.id);
        const on = e.target.checked;
        ids.forEach((id) => (on ? state.selected.add(id) : state.selected.delete(id)));
        draw(); return;
      }
      const pick = e.target.closest('[data-pick]');
      if (pick) { const id = pick.closest('tr').dataset.id; if (pick.checked) state.selected.add(id); else state.selected.delete(id); draw(); return; }
      if (e.target.closest('[data-dock-clear]')) { state.selected.clear(); draw(); return; }
      if (e.target.closest('[data-peek-close]')) { peek.hidden = true; return; }
      const tr = e.target.closest('tr.ax-rowlink');
      if (tr && peek && !e.target.closest('.ax-sel')) {
        const r = rows.find((x) => x.id === tr.dataset.id);
        AxUI.$('[data-peek-title]', peek).textContent = r.id;
        AxUI.$('[data-peek-sub]', peek).innerHTML = fmt({ type: 'status' }, r.status);
        AxUI.$('[data-peek-facts]', peek).innerHTML = cols.slice(1).map((c) => `<div><dt>${AxUI.esc(c.label)}</dt><dd>${c.type === 'status' ? AxUI.esc(r[c.key]) : fmt(c, r[c.key])}</dd></div>`).join('');
        peek.hidden = false;
        AxUI.$('[data-peek-close]', peek).focus();
        AxUI.emit(root, 'peek', r);
      }
    });
    root.addEventListener('input', (e) => { if (e.target.classList.contains('ax-search')) { state.q = e.target.value.toLowerCase(); const pos = e.target.selectionStart; draw(); const s = AxUI.$('.ax-search', root); s.focus(); s.setSelectionRange(pos, pos); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && peek && !peek.hidden) peek.hidden = true; });
    draw();
  },
});

/* Statement report: <section data-ax="report">. Parameter strip changes re-run (fires ax:run), group rows collapse,
   [data-export] downloads the visible table as CSV, rows with data-drill fire ax:drill. */
AxUI.define('report', {
  init(root) {
    const table = AxUI.$('.ax-rtable', root);
    const stamp = AxUI.$('[data-ran]', root);
    const run = () => {
      const params = Object.fromEntries(AxUI.$$('.ax-param [name]', root).map((i) => [i.name, i.value]));
      if (stamp) stamp.textContent = 'Run ' + new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      AxUI.emit(root, 'run', params);
    };
    root.addEventListener('change', (e) => { if (e.target.closest('.ax-params')) run(); });
    root.addEventListener('click', (e) => {
      const g = e.target.closest('tr.ax-rgroup');
      if (g) {
        g.classList.toggle('is-closed');
        let n = g.nextElementSibling;
        while (n && !n.classList.contains('ax-rgroup') && !n.classList.contains('ax-grand')) { n.hidden = g.classList.contains('is-closed') && !n.classList.contains('ax-subtotal'); n = n.nextElementSibling; }
        return;
      }
      const d = e.target.closest('tr[data-drill]');
      if (d) AxUI.emit(root, 'drill', { account: d.dataset.drill });
      if (e.target.closest('[data-run]')) run();
      if (e.target.closest('[data-export]')) {
        const csv = Array.from(table.rows).filter((r) => !r.hidden).map((r) => Array.from(r.cells).map((c) => `"${c.textContent.trim().replace(/^[▾▸]\s*/, '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = (root.dataset.name || 'report') + '.csv';
        a.click();
        URL.revokeObjectURL(a.href);
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
      el.innerHTML = `<svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline class="ax-line ax-reveal" points="${pts}" style="stroke:${colors[0]};stroke-width:1.75" vector-effect="non-scaling-stroke"/></svg>`;
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
        const d = `M${p(a0, 86)} A86 86 0 ${large} 1 ${p(a1, 86)} L${p(a1, 56)} A56 56 0 ${large} 0 ${p(a0, 56)}Z`;
        a0 = a1;
        return `<path class="ax-slice" d="${d}" style="fill:${colors[i % 6]};--i:${i}"><title>${AxUI.esc(labels[i])}: ${x.toLocaleString()}</title></path>`;
      }).join('');
      el.innerHTML = `<svg viewBox="0 0 200 200" style="max-width:220px;margin:0 auto" role="img" aria-label="${AxUI.esc(el.dataset.title || 'Chart')}">${arcs}<text x="100" y="96" text-anchor="middle" style="font:700 22px var(--ax-font-head);fill:var(--ax-heading)">${short(tot)}</text><text x="100" y="116" text-anchor="middle" style="font:11px var(--ax-font-body);fill:var(--ax-muted)">${AxUI.esc(el.dataset.center || 'Total')}</text></svg>
        <div class="ax-legend">${labels.map((l, i) => `<span><i style="background:${colors[i % 6]}"></i>${AxUI.esc(l)} · <b class="ax-num">${v[i].toLocaleString()}</b></span>`).join('')}</div>`;
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
      tip.style.left = Math.min(e.clientX - box.left + 12, box.width - tip.offsetWidth) + 'px';
      tip.style.top = (e.clientY - box.top - 10) + 'px';
    });
    el.addEventListener('pointerleave', () => { tip.hidden = true; });
  },
});

/* Sign-in: <div data-ax="login"> with .ax-auth-step sections (data-step="signin|otp|forgot|sent").
   Links/buttons with data-go switch steps; 6-box code input auto-advances and accepts paste;
   3 failed attempts lock the form for 60 s with a countdown. Fires ax:signin with the entered values.
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
    const lock = () => {
      const left = Math.ceil((lockUntil - Date.now()) / 1000);
      const on = left > 0;
      AxUI.$$('input,button[type="submit"]', form).forEach((i) => { i.disabled = on; });
      msg.hidden = !on && !msg.dataset.err;
      if (on) { msg.className = 'ax-banner is-bad'; msg.innerHTML = `${AxUI.icon('lock')}<div><b>Too many attempts</b><p>Try again in <span class="ax-num">${left}</span> s, or reset your password.</p></div>`; setTimeout(lock, 1000); }
      else if (lockUntil) { lockUntil = 0; fails = 0; msg.hidden = true; }
    };
    root.addEventListener('click', (e) => { const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go); } });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (!data.usr || !data.pwd) { msg.hidden = false; msg.dataset.err = '1'; msg.className = 'ax-banner is-warn'; msg.innerHTML = `${AxUI.icon('alert')}<div><b>Enter your email and password</b></div>`; return; }
      const ok = root.dataset.demoPassword ? data.pwd === root.dataset.demoPassword : true;
      if (!ok) {
        fails += 1;
        if (fails >= 3) { lockUntil = Date.now() + 60000; lock(); return; }
        msg.hidden = false; msg.dataset.err = '1'; msg.className = 'ax-banner is-bad';
        msg.innerHTML = `${AxUI.icon('x-circle')}<div><b>Email or password is wrong</b><p>${3 - fails} attempt${3 - fails === 1 ? '' : 's'} left before a 60 s lock.</p></div>`;
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

/* Signature pad (W-4, approvals): <div class="ax-sign" data-ax="sign"><canvas></canvas></div> + [data-sign-clear].
   AxUI.signature(el) returns a PNG data URL, or null while empty. */
AxUI.define('sign', {
  init(box) {
    const c = AxUI.$('canvas', box);
    const ctx = c.getContext('2d');
    let drawing = false;
    let empty = true;
    const size = () => { const r = c.getBoundingClientRect(); c.width = r.width * devicePixelRatio; c.height = r.height * devicePixelRatio; ctx.scale(devicePixelRatio, devicePixelRatio); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = getComputedStyle(box).getPropertyValue('--ax-ink') || '#0E1340'; };
    const pos = (e) => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    c.addEventListener('pointerdown', (e) => { drawing = true; c.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.moveTo(...pos(e)); });
    c.addEventListener('pointermove', (e) => { if (!drawing) return; ctx.lineTo(...pos(e)); ctx.stroke(); if (empty) { empty = false; AxUI.emit(box, 'signed', {}); } });
    c.addEventListener('pointerup', () => { drawing = false; });
    const scope = box.parentElement;
    scope.addEventListener('click', (e) => { if (e.target.closest('[data-sign-clear]')) { ctx.clearRect(0, 0, c.width, c.height); empty = true; AxUI.emit(box, 'cleared', {}); } });
    box.axSignature = () => (empty ? null : c.toDataURL('image/png'));
    requestAnimationFrame(size);
  },
});
AxUI.signature = (el) => (el.axSignature ? el.axSignature() : null);
