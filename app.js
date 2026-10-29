(function () {
  'use strict';
  const LANGS = ['el', 'en', 'es', 'ru'];
  const $ = (s) => document.querySelector(s);
  /* Λειτουργία προεπισκόπησης: όταν ανοίγει σε απλό browser (χωρίς Electron) δεν τρέχει τίποτα, μόνο δείχνει το UI */
  let outCb = () => {};
  let mockJob = 0;
  const api = window.itApi || {
    run: (id, p, l, title) => { const job = ++mockJob; outCb({ type: 'start', job, title }); let n = 0; const iv = setInterval(() => { n += 20; outCb({ type: 'data', job, text: `[PREVIEW] ${id}: Verification ${n}% complete.\r` }); if (n >= 100) { clearInterval(iv); outCb({ type: 'data', job, text: '\nPREVIEW — not executed in a browser\n' }); outCb({ type: 'end', job, code: 0 }); } }, 400); },
    stop() {}, onOutput: (cb) => { outCb = cb; },
    processes: async () => Array.from({ length: 25 }, (_, i) => ({ pid: 1000 + i, name: 'demo-' + i + '.exe', mb: 500 - i * 15 })),
    kill: async () => 'preview', cleanTemp: async () => ({ deleted: 0, skipped: 0, mb: 0 }),
    openLog() {}, openHelp: (l, a) => outCb({ type: 'note', text: `\n[PREVIEW] help: https://brokentools.org/${l}/toolkit-help.html${a ? '#' + a : ''}\n` }), info: async () => ({})
  };

  let lang = 'el';
  try {
    const s = localStorage.getItem('itk_lang');
    if (LANGS.includes(s)) lang = s;
    else { const n = (navigator.language || 'en').slice(0, 2); if (LANGS.includes(n)) lang = n; }
  } catch { /* localStorage μπορεί να λείπει */ }
  let cat = 'repairs';
  let procs = [];

  /* ---- μικρά εικονίδια (SVG, μόνο στατικό περιεχόμενο) ---- */
  const ICON = {
    repairs: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    quick: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    software: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    hardware: '<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    storage: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    security: '<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    network: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    processes: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    panels: '<rect x="3" y="4" width="18" height="14" rx="1"/><path d="M8 21h8M12 18v3"/>'
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

  const L = (v) => (v && typeof v === 'object') ? (v[lang] || v.en) : v;
  const ui = () => window.UI[lang];

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* ---- κονσόλα με καρτέλες (μία ανά εργασία) ---- */
  const placeholder = $('#console');
  const panes = $('#panes');
  const tabsEl = $('#tabs');
  const J = new Map(); // job -> { tab, pre, lines, cur, col, state }
  let active = null;
  const MAXLINES = 4000;

  function feed(j, text) {
    // υποστήριξη \r (progress που ξαναγράφεται στην ίδια γραμμή)
    for (const ch of text) {
      if (ch === '\n') { j.lines.push(j.cur); j.cur = ''; j.col = 0; }
      else if (ch === '\r') { j.col = 0; }
      else {
        if (j.col < j.cur.length) j.cur = j.cur.slice(0, j.col) + ch + j.cur.slice(j.col + 1);
        else j.cur += ch;
        j.col++;
      }
    }
    if (j.lines.length > MAXLINES) j.lines.splice(0, j.lines.length - MAXLINES);
    j.pre.textContent = j.lines.join('\n') + (j.lines.length ? '\n' : '') + j.cur;
    if (j.stick) j.pre.scrollTop = j.pre.scrollHeight;
  }

  function show(job) {
    active = job;
    placeholder.style.display = J.size ? 'none' : '';
    J.forEach((j, id) => { j.pre.style.display = id === job ? '' : 'none'; j.tab.classList.toggle('on', id === job); });
    const j = J.get(job);
    if (j) { j.tab.scrollIntoView({ block: 'nearest', inline: 'nearest' }); j.pre.scrollTop = j.pre.scrollHeight; }
  }

  function closeTab(job) {
    const j = J.get(job);
    if (!j) return;
    if (j.state === 'run') api.stop(job);
    j.tab.remove(); j.pre.remove(); J.delete(job);
    if (J.size) show(active === job ? [...J.keys()].pop() : active);
    else { active = null; placeholder.style.display = ''; placeholder.textContent = ui().noJobs; }
  }

  function startJob(job, title) {
    const pre = el('pre');
    pre.addEventListener('scroll', () => { j.stick = pre.scrollTop + pre.clientHeight >= pre.scrollHeight - 30; });
    const tab = el('div', 'tab');
    const dot = el('span', 'dot'); dot.title = ui().running;
    const lab = el('span', 'lab', title); lab.title = title;
    const x = el('button', 'x', '×'); x.title = ui().close;
    x.addEventListener('click', (e) => { e.stopPropagation(); closeTab(job); });
    tab.append(dot, lab, x);
    tab.addEventListener('click', () => show(job));
    const j = { tab, pre, lines: [], cur: '', col: 0, state: 'run', stick: true, dot };
    J.set(job, j);
    tabsEl.appendChild(tab);
    panes.appendChild(pre);
    show(job);
  }

  function onMsg(m) {
    if (!m) return;
    if (m.type === 'start') startJob(m.job, m.title);
    else if (m.type === 'data') { const j = J.get(m.job); if (j) feed(j, m.text); }
    else if (m.type === 'end') {
      const j = J.get(m.job);
      if (!j) return;
      j.state = 'end';
      feed(j, `\n[Exit ${m.code}]\n`);
      j.tab.classList.add(m.code === 0 ? 'fin' : 'err');
      j.dot.title = ui().done;
    } else if (m.type === 'note') {
      placeholder.style.display = J.size ? 'none' : '';
      placeholder.textContent += m.text;
    }
  }
  api.onOutput(onMsg);

  function run(id, params, title, desc) { api.run(id, params || {}, lang, title || id, desc || ''); }

  /* ---- κάρτα εργαλείου ---- */
  function card(t) {
    const c = el('div', 'card t-' + t.tone);
    const title = L(t.title);
    const h = el('h3');
    h.appendChild(el('i'));
    h.appendChild(el('span', '', title));
    if (t.confirm) { const w = el('span', 'warn', '⚠'); w.title = ui().confirmNote; h.appendChild(w); }
    c.appendChild(h);
    c.appendChild(el('p', '', L(t.d)));
    const row = el('div', 'row');
    const go = el('button', 'go', ui().btn[t.btn] || ui().btn.run);
    go.addEventListener('click', () => run(t.id, {}, title, L(t.d)));
    const q = el('button', 'qm', '?');
    q.title = ui().info;
    q.addEventListener('click', () => api.openHelp(lang, t.id));
    row.append(go, q);
    c.appendChild(row);
    return c;
  }
  function grid(items) {
    const g = el('div', 'grid');
    items.forEach((t) => g.appendChild(card(t)));
    return g;
  }
  const toolsOf = (c, skip) => window.TOOLS.filter((t) => t.cat === c && !(skip || []).includes(t.id));

  function textInput(ph, cls, val) {
    const i = el('input', 'in' + (cls ? ' ' + cls : ''));
    i.type = 'text'; i.placeholder = ph; i.spellcheck = false; i.autocomplete = 'off';
    if (val) i.value = val;
    return i;
  }
  function barBtn(label, fn, solid) {
    const b = el('button', 'go' + (solid ? ' solid' : ''), label);
    b.addEventListener('click', fn);
    return b;
  }

  /* ---- σελίδες ---- */
  function pageHead(root) {
    root.appendChild(el('h2', 'title', ui().titles[cat]));
  }

  function renderSoftware(root) {
    root.appendChild(grid(toolsOf('software')));
    root.appendChild(el('p', 'sub', ui().wgSub));
    const p = el('div', 'pkgs');
    window.PACKAGES.forEach(([key, name, d, tone]) => {
      const b = el('button', 'pkg t-' + tone);
      b.append(el('b', '', name), el('span', '', L(d)));
      b.addEventListener('click', () => run('winget_install', { pkg: key }, name));
      p.appendChild(b);
    });
    root.appendChild(p);
  }

  function renderStorage(root) {
    const g = grid(toolsOf('storage'));
    const c = el('div', 'card t-y');
    const h = el('h3'); h.append(el('i'), el('span', '', ui().tempTitle));
    c.appendChild(h);
    c.appendChild(el('p', '', ui().tempDesc));
    const res = el('div', 'tempres');
    const row = el('div', 'row');
    const go = el('button', 'go', ui().tempBtn);
    go.addEventListener('click', async () => {
      res.textContent = '…';
      const r = await api.cleanTemp(lang);
      res.textContent = ui().tempDone(r);
    });
    const q = el('button', 'qm', '?'); q.title = ui().info;
    q.addEventListener('click', () => api.openHelp(lang, 'temp'));
    row.append(go, q);
    c.append(row, res);
    g.insertBefore(c, g.children[3] || null);
    root.appendChild(g);
  }

  function renderNetwork(root) {
    const bar = el('div', 'bar stack');
    const r1 = el('div', 'brow');
    r1.appendChild(el('span', 'lbl', ui().hostbar));
    const host = textInput(ui().host, '', '8.8.8.8');
    r1.appendChild(host);
    const val = () => host.value.trim();
    r1.appendChild(barBtn('Ping', () => run('ping', { host: val() }, 'Ping'), true));
    r1.appendChild(barBtn('Traceroute', () => run('tracert', { host: val() }, 'Traceroute')));
    r1.appendChild(barBtn('NSLookup', () => run('nslookup', { host: val() }, 'NSLookup')));
    const r2 = el('div', 'brow');
    r2.appendChild(el('span', 'lbl', ui().portTest));
    const port = textInput(ui().port, 'port', '443');
    r2.appendChild(port);
    r2.appendChild(barBtn(ui().portTest, () => run('port_test', { host: val(), port: port.value.trim() }, ui().portTest)));
    bar.append(r1, r2);
    root.appendChild(bar);
    root.appendChild(grid(toolsOf('network')));
  }

  async function loadProcs() {
    const tb = $('#ptbody');
    if (!tb) return;
    tb.textContent = '';
    const r = el('tr'); const d = el('td', '', ui().procLoading); d.colSpan = 4; r.appendChild(d); tb.appendChild(r);
    procs = await api.processes();
    drawProcs();
  }
  function drawProcs() {
    const tb = $('#ptbody');
    if (!tb) return;
    const f = ($('#pfilter') ? $('#pfilter').value : '').toLowerCase();
    const list = procs.filter((p) => !f || p.name.toLowerCase().includes(f));
    tb.textContent = '';
    list.forEach((p) => {
      const tr = el('tr');
      tr.appendChild(el('td', '', p.name));
      tr.appendChild(el('td', '', String(p.pid)));
      tr.appendChild(el('td', 'r', p.mb + ' MB'));
      const a = el('td', 'r');
      const k = el('button', 'kill', ui().kill);
      k.addEventListener('click', async () => {
        const res = await api.kill(p.pid, p.name, lang);
        onMsg({ type: 'note', text: `\n> ${ui().kill}: ${p.name} (${p.pid}) -> ${res}\n` });
        if (res !== 'cancelled') loadProcs();
      });
      a.appendChild(k); tr.appendChild(a);
      tb.appendChild(tr);
    });
    if ($('#pcount')) $('#pcount').textContent = ui().procCount(list.length);
  }
  function renderProcesses(root) {
    const bar = el('div', 'bar');
    bar.appendChild(barBtn(ui().procRefresh, loadProcs, true));
    const f = textInput(ui().procFilter, '', ''); f.id = 'pfilter';
    f.addEventListener('input', drawProcs);
    bar.appendChild(f);
    bar.appendChild(barBtn('Netstat -ano', () => run('netstat', {}, 'Netstat')));
    bar.appendChild(el('span', 'count')).id = 'pcount';
    root.appendChild(bar);
    const wrap = el('div', 'ptable');
    const t = el('table');
    const th = el('thead'); const hr = el('tr');
    [[ui().procName, ''], ['PID', ''], [ui().procMem, 'r'], [ui().procAct, 'r']].forEach(([x, c]) => hr.appendChild(el('th', c, x)));
    th.appendChild(hr);
    const tb = el('tbody'); tb.id = 'ptbody';
    const r = el('tr'); const d = el('td', '', ui().procEmpty); d.colSpan = 4; r.appendChild(d); tb.appendChild(r);
    t.append(th, tb); wrap.appendChild(t);
    root.appendChild(wrap);
    if (procs.length) drawProcs();
  }

  function renderPanels(root) {
    const bar = el('div', 'bar');
    bar.appendChild(el('span', 'lbl', ui().rdpTitle));
    const h = textInput(ui().rdpHost, '', '');
    bar.appendChild(h);
    bar.appendChild(barBtn('RDP (mstsc)', () => run('rdp', { host: h.value.trim() }, 'RDP'), true));
    root.appendChild(bar);
    root.appendChild(grid(toolsOf('panels')));
  }

  function render() {
    const root = $('#content');
    root.textContent = '';
    pageHead(root);
    if (cat === 'software') renderSoftware(root);
    else if (cat === 'storage') renderStorage(root);
    else if (cat === 'network') renderNetwork(root);
    else if (cat === 'processes') renderProcesses(root);
    else if (cat === 'panels') renderPanels(root);
    else root.appendChild(grid(toolsOf(cat)));
    root.scrollTop = 0;
  }

  /* ---- πλοήγηση / γλώσσα ---- */
  function renderNav() {
    const nav = $('#nav');
    nav.textContent = '';
    window.CAT_ORDER.forEach((c) => {
      const b = el('button', c === cat ? 'on' : '');
      b.innerHTML = svg(c);
      b.appendChild(el('span', '', ui().cats[c]));
      b.addEventListener('click', () => { cat = c; renderNav(); render(); });
      nav.appendChild(b);
    });
  }
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('#langs button').forEach((b) => b.classList.toggle('on', b.dataset.l === lang));
    const u = ui();
    $('#brandSub').textContent = u.app + ' · ' + u.by;
    $('#helpLbl').textContent = u.help; $('#helpBtn').title = u.helpTip;
    $('#logBtn').textContent = u.log; $('#logBtn').title = u.logTip;
    $('#statLbl').textContent = u.status; $('#statVal').textContent = u.admin;
    $('#conTitle').textContent = u.conTitle; $('#conHint').textContent = u.conHint;
    $('#stopBtn').textContent = u.stop; $('#clearBtn').textContent = u.clear;
    $('#expandBtn').textContent = expanded ? u.collapse : u.expand;
    renderNav(); render();
  }
  let expanded = false;

  document.querySelectorAll('#langs button').forEach((b) => b.addEventListener('click', () => {
    lang = b.dataset.l;
    try { localStorage.setItem('itk_lang', lang); } catch { /* αγνοούμε */ }
    applyLang();
  }));
  $('#helpBtn').addEventListener('click', () => api.openHelp(lang, cat));
  $('#logBtn').addEventListener('click', () => api.openLog());
  $('#stopBtn').addEventListener('click', () => { if (active) api.stop(active); });
  $('#clearBtn').addEventListener('click', () => { const j = J.get(active); if (j) { j.lines = []; j.cur = ''; j.col = 0; j.pre.textContent = ''; } else placeholder.textContent = ''; });

  /* Ctrl+C = ακύρωση (μόνο αν δεν υπάρχει επιλεγμένο κείμενο) */
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && ['c', 'C', 'ψ', 'Ψ', 'с', 'С'].includes(e.key) && !window.getSelection().toString()) {
      e.preventDefault(); if (active) api.stop(active);
    }
  });

  /* ---- ύψος κονσόλας ---- */
  const panel = $('#consolePanel');
  let drag = false;
  $('#resizer').addEventListener('mousedown', () => { drag = true; document.body.style.cursor = 'ns-resize'; });
  document.addEventListener('mousemove', (e) => {
    if (!drag) return;
    const h = window.innerHeight - e.clientY;
    if (h >= 110 && h <= window.innerHeight - 200) panel.style.height = h + 'px';
  });
  document.addEventListener('mouseup', () => { if (drag) { drag = false; document.body.style.cursor = ''; } });
  $('#expandBtn').addEventListener('click', () => {
    expanded = !expanded;
    panel.style.height = expanded ? Math.round(window.innerHeight * 0.62) + 'px' : '210px';
    $('#expandBtn').textContent = expanded ? ui().collapse : ui().expand;
  });

  applyLang();
  placeholder.textContent = ui().noJobs;
})();
