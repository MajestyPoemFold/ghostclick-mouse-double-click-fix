// Tauri exposes its API on window.__TAURI__ because withGlobalTauri is true in tauri.conf.json.
const { invoke } = window.__TAURI__.core;
const win = window.__TAURI__.window.getCurrentWindow();

document.getElementById('min').addEventListener('click', () => win.minimize());
document.getElementById('max').addEventListener('click', () => win.toggleMaximize());
document.getElementById('close').addEventListener('click', () => win.close());

invoke('app_info')
  .then((info) => { document.getElementById('info').textContent = `${info.name} ${info.version}`; })
  .catch((err) => { document.getElementById('info').textContent = String(err); });
