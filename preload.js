const { contextBridge, ipcRenderer } = require('electron');

// Η σελίδα μπορεί να ζητήσει ΜΟΝΟ ενέργειες με id (όχι ελεύθερες εντολές).
contextBridge.exposeInMainWorld('itApi', {
  run: (id, params, lang, title, desc) => ipcRenderer.send('run', { id, params, lang, title, desc }),
  stop: (job) => ipcRenderer.send('stop', job),
  onOutput: (cb) => ipcRenderer.on('console-output', (_e, data) => cb(data)),
  processes: () => ipcRenderer.invoke('processes'),
  kill: (pid, name, lang) => ipcRenderer.invoke('kill', { pid, name, lang }),
  cleanTemp: (lang) => ipcRenderer.invoke('clean-temp', { lang }),
  openLog: () => ipcRenderer.invoke('open-log'),
  openHelp: (lang, anchor) => ipcRenderer.invoke('open-help', { lang, anchor }),
  info: () => ipcRenderer.invoke('info')
});
