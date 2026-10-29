const { app, BrowserWindow, ipcMain, dialog, shell, session, Menu } = require('electron');
const path = require('path');
const { spawn, execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const { StringDecoder } = require('string_decoder');

const COMMANDS = require('./commands');

let win = null;
const jobs = new Map(); // job id -> child process
let nextJob = 1;

/* ---------- Μικρά κείμενα του κυρίως προγράμματος (παράθυρα επιβεβαίωσης) ---------- */
const MSG = {
  el: { confirm: 'Επιβεβαίωση', yes: 'Συνέχεια', no: 'Ακύρωση', ask: (t) => `Να εκτελεστεί: «${t}»;`, warn: 'Η ενέργεια αλλάζει ρυθμίσεις ή αρχεία του συστήματος.', killAsk: (n, p) => `Να τερματιστεί η διεργασία «${n}» (PID ${p});`, killWarn: 'Μπορεί να χαθούν μη αποθηκευμένα δεδομένα.', protectedProc: 'Αυτή είναι διεργασία του συστήματος και δεν τερματίζεται από εδώ.', tempAsk: 'Να καθαριστούν τα προσωρινά αρχεία;', tempWarn: 'Διαγράφονται μόνο αρχεία παλαιότερα από 24 ώρες. Όσα χρησιμοποιούνται παραλείπονται.' },
  en: { confirm: 'Confirm', yes: 'Continue', no: 'Cancel', ask: (t) => `Run “${t}”?`, warn: 'This action changes system settings or files.', killAsk: (n, p) => `End process “${n}” (PID ${p})?`, killWarn: 'Unsaved data may be lost.', protectedProc: 'This is a system process and cannot be ended from here.', tempAsk: 'Clean temporary files?', tempWarn: 'Only files older than 24 hours are deleted. Files in use are skipped.' },
  es: { confirm: 'Confirmar', yes: 'Continuar', no: 'Cancelar', ask: (t) => `¿Ejecutar «${t}»?`, warn: 'Esta acción cambia ajustes o archivos del sistema.', killAsk: (n, p) => `¿Finalizar el proceso «${n}» (PID ${p})?`, killWarn: 'Podrías perder datos sin guardar.', protectedProc: 'Es un proceso del sistema y no se puede finalizar desde aquí.', tempAsk: '¿Limpiar los archivos temporales?', tempWarn: 'Solo se borran archivos de más de 24 horas. Los que están en uso se omiten.' },
  ru: { confirm: 'Подтверждение', yes: 'Продолжить', no: 'Отмена', ask: (t) => `Выполнить «${t}»?`, warn: 'Действие меняет настройки или файлы системы.', killAsk: (n, p) => `Завершить процесс «${n}» (PID ${p})?`, killWarn: 'Несохранённые данные могут быть потеряны.', protectedProc: 'Это системный процесс, его нельзя завершить отсюда.', tempAsk: 'Очистить временные файлы?', tempWarn: 'Удаляются только файлы старше 24 часов. Используемые файлы пропускаются.' }
};
const LANGS = ['el', 'en', 'es', 'ru'];
const m = (lang) => MSG[LANGS.includes(lang) ? lang : 'en'];

/* ---------- Αρχείο καταγραφής ---------- */
function logDir() { return path.join(app.getPath('userData'), 'logs'); }
function log(line) {
  try {
    fs.mkdirSync(logDir(), { recursive: true });
    const d = new Date();
    const day = d.toISOString().slice(0, 10);
    fs.appendFileSync(path.join(logDir(), `toolkit-${day}.log`), `[${d.toISOString()}] ${line}\n`, 'utf8');
  } catch { /* η καταγραφή δεν πρέπει ποτέ να σταματά το πρόγραμμα */ }
}

function send(msg) {
  if (win && !win.isDestroyed()) win.webContents.send('console-output', msg);
}

/* ---------- Παράθυρο ---------- */
function createWindow() {
  win = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#06140f',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });
  Menu.setApplicationMenu(null);
  win.loadFile('index.html');
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e) => e.preventDefault());
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => {
    session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
    createWindow();
    log(`--- Toolkit started (v${app.getVersion()}) ---`);
  });
}
app.on('window-all-closed', () => app.quit());

/* ---------- Τερματισμός εργασίας ---------- */
function killJob(job) {
  const child = jobs.get(job);
  if (child && child.pid) {
    execFile('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true }, () => {});
    return true;
  }
  return false;
}

async function confirmBox(lang, text, detail) {
  const t = m(lang);
  const r = await dialog.showMessageBox(win, {
    type: 'question', buttons: [t.yes, t.no], defaultId: 0, cancelId: 1, title: t.confirm, message: text, detail: detail || undefined
  });
  return r.response === 0;
}

/* ---------- 1. Εκτέλεση ενέργειας με id (κάθε εκτέλεση = ξεχωριστή εργασία / καρτέλα) ---------- */
ipcMain.on('run', async (_e, req) => {
  try {
    const id = req && typeof req.id === 'string' ? req.id : '';
    const spec = COMMANDS[id];
    if (!spec) { send({ type: 'note', text: `\n[ERR] Unknown action: ${id.slice(0, 40)}\n` }); return; }

    const lang = LANGS.includes(req.lang) ? req.lang : 'en';
    const title = String(req.title || id).slice(0, 80);
    const desc = String(req.desc || '').slice(0, 300);

    let built;
    try { built = spec.build ? spec.build(req.params || {}) : spec; }
    catch (err) { send({ type: 'note', text: `\n[ERR] ${err.message}\n` }); log(`REJECTED ${id}: ${err.message}`); return; }

    if (spec.confirm && !(await confirmBox(lang, m(lang).ask(title), desc))) { log(`CANCELLED ${id}`); return; }

    const job = nextJob++;
    send({ type: 'start', job, title });
    log(`RUN #${job} ${id}${req.params && Object.keys(req.params).length ? ' ' + JSON.stringify(req.params) : ''}`);

    let child;
    if (built.ps) {
      const pre = "$ErrorActionPreference='Continue';$ProgressPreference='SilentlyContinue';[Console]::OutputEncoding=[Text.Encoding]::UTF8;";
      const enc = Buffer.from(pre + built.ps, 'utf16le').toString('base64');
      child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', enc], { windowsHide: true });
    } else {
      child = spawn('cmd.exe', ['/d', '/s', '/c', `"chcp 65001 >nul & ${built.cmd}"`], { windowsHide: true, windowsVerbatimArguments: true });
    }
    jobs.set(job, child);

    // Το sfc γράφει UTF-16 όταν η έξοδος πάει σε pipe
    const enc16 = spec.utf16 === true;
    const dOut = new StringDecoder(enc16 ? 'utf16le' : 'utf8');
    const dErr = new StringDecoder(enc16 ? 'utf16le' : 'utf8');
    const clean = (t) => t.replace(/\u0000/g, '');
    child.stdout.on('data', (d) => { const t = clean(dOut.write(d)); if (t) send({ type: 'data', job, text: t }); });
    child.stderr.on('data', (d) => { const t = clean(dErr.write(d)); if (t) send({ type: 'data', job, text: t }); });
    child.on('error', (err) => send({ type: 'data', job, text: `\n[ERR] ${err.message}\n` }));
    child.on('close', (code) => {
      jobs.delete(job);
      send({ type: 'end', job, code });
      log(`END #${job} ${id} exit=${code}`);
    });
  } catch (err) {
    send({ type: 'note', text: `\n[ERR] ${err.message}\n` });
    log(`ERROR run: ${err.message}`);
  }
});

/* ---------- 2. Ακύρωση μιας εργασίας ---------- */
ipcMain.on('stop', (_e, job) => {
  const j = Number(job);
  if (killJob(j)) log(`STOP #${j}`);
});
app.on('before-quit', () => { for (const j of [...jobs.keys()]) killJob(j); });

/* ---------- 3. Λίστα διεργασιών (όλες, ταξινομημένες κατά μνήμη) ---------- */
ipcMain.handle('processes', () => new Promise((resolve) => {
  const script = "[Console]::OutputEncoding=[Text.Encoding]::UTF8;Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object Id,ProcessName,@{N='MB';E={[math]::Round($_.WorkingSet64/1MB)}} | ConvertTo-Json -Compress";
  const enc = Buffer.from(script, 'utf16le').toString('base64');
  execFile('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', enc], { windowsHide: true, maxBuffer: 16 * 1024 * 1024 }, (err, stdout) => {
    if (err) return resolve([]);
    try {
      let arr = JSON.parse(stdout.toString('utf8'));
      if (!Array.isArray(arr)) arr = [arr];
      resolve(arr.map((p) => ({ pid: Number(p.Id), name: String(p.ProcessName), mb: Number(p.MB) })));
    } catch { resolve([]); }
  });
}));

/* ---------- 4. Τερματισμός διεργασίας ---------- */
const PROTECTED = new Set(['system', 'idle', 'registry', 'smss', 'csrss', 'wininit', 'winlogon', 'services', 'lsass', 'svchost', 'dwm', 'fontdrvhost', 'memory compression', 'secure system']);
ipcMain.handle('kill', async (_e, req) => {
  const lang = LANGS.includes(req && req.lang) ? req.lang : 'en';
  const pid = Number(req && req.pid);
  const name = String((req && req.name) || '').slice(0, 60);
  if (!Number.isInteger(pid) || pid <= 4) return 'invalid PID';
  if (PROTECTED.has(name.toLowerCase())) return m(lang).protectedProc;
  if (pid === process.pid) return 'self';
  if (!(await confirmBox(lang, m(lang).killAsk(name, pid), m(lang).killWarn))) return 'cancelled';
  log(`KILL pid=${pid} name=${name}`);
  return new Promise((resolve) => {
    execFile('taskkill', ['/F', '/PID', String(pid)], { windowsHide: true }, (err, stdout, stderr) => resolve(err ? (stderr || err.message).trim() : stdout.trim()));
  });
});

/* ---------- 5. Καθαρισμός %TEMP% (μόνο αρχεία >24 ωρών) ---------- */
function sizeOf(p) {
  let total = 0;
  try {
    const st = fs.lstatSync(p);
    if (st.isDirectory()) { for (const f of fs.readdirSync(p)) total += sizeOf(path.join(p, f)); }
    else total = st.size;
  } catch { /* αγνοούμε */ }
  return total;
}
ipcMain.handle('clean-temp', async (_e, req) => {
  const lang = LANGS.includes(req && req.lang) ? req.lang : 'en';
  if (!(await confirmBox(lang, m(lang).tempAsk, m(lang).tempWarn))) return { cancelled: true };
  const tempDir = os.tmpdir();
  const limit = Date.now() - 24 * 3600 * 1000;
  let deleted = 0, skipped = 0, bytes = 0;
  try {
    for (const f of fs.readdirSync(tempDir)) {
      const full = path.join(tempDir, f);
      try {
        const st = fs.lstatSync(full);
        if (st.mtimeMs > limit) { skipped++; continue; }
        const sz = sizeOf(full);
        fs.rmSync(full, { recursive: true, force: true });
        deleted++; bytes += sz;
      } catch { skipped++; }
    }
  } catch (err) { log(`TEMP error ${err.message}`); return { error: err.message }; }
  log(`TEMP deleted=${deleted} skipped=${skipped} freedMB=${Math.round(bytes / 1048576)}`);
  return { deleted, skipped, mb: Math.round(bytes / 1048576) };
});

/* ---------- 6. Αρχείο καταγραφής, βοήθεια, πληροφορίες ---------- */
ipcMain.handle('open-log', async () => {
  fs.mkdirSync(logDir(), { recursive: true });
  return shell.openPath(logDir());
});
ipcMain.handle('open-help', async (_e, req) => {
  const lang = LANGS.includes(req && req.lang) ? req.lang : 'en';
  const anchor = req && typeof req.anchor === 'string' && /^[a-z0-9_-]{0,40}$/.test(req.anchor) ? req.anchor : '';
  await shell.openExternal(`https://brokentools.org/${lang}/toolkit-help.html${anchor ? '#' + anchor : ''}`);
});
ipcMain.handle('info', () => ({ version: app.getVersion(), platform: process.platform }));
