#!/usr/bin/env node
/**
 * render-media.mjs
 * Renders README media (PNG screenshots, transparent PNG parts, GIF demos)
 * straight from the HTML design files, with no npm dependencies.
 *
 *   node scripts/render-media.mjs                 render every job in media.config.json
 *   node scripts/render-media.mjs --only ruler    render jobs whose name/out contains "ruler"
 *   node scripts/render-media.mjs --list          list jobs
 *
 * Requirements (Windows):
 *   - Node.js 22+ (uses the global WebSocket)
 *   - Google Chrome or Microsoft Edge (override with CHROME_PATH)
 *   - ffmpeg on PATH (GIF jobs only)
 *
 * Page contract (deterministic animation):
 *   A design page may expose  window.__demo = { duration, still, seek(t) }.
 *   The renderer calls seek(t) for every frame (t in seconds) and also pauses
 *   and seeks every CSS animation to t. CSS transitions are disabled while
 *   rendering, so animated state must be a pure function of t.
 *   The renderer adds class "render-mode" to <html> and sets window.__RENDER__.
 *   Pages should skip their own requestAnimationFrame loop when __RENDER__ is set.
 *
 * Job fields (media.config.json -> "jobs": [...]):
 *   name         string   short id, used by --only
 *   src          string   html path relative to the config, may carry ?query and #hash
 *   out          string   output path (.png or .gif) relative to the config
 *   width/height number   CSS viewport size (default 1440x900)
 *   scale        number   device pixel ratio (default 2 for png, 1 for gif)
 *   selector     string   capture only this element's box (png only)
 *   transparent  boolean  transparent page background (png only)
 *   fullPage     boolean  capture the whole document height (png only)
 *   at           number   seek time in seconds for a still (default __demo.still or 0)
 *   colorScheme  "dark" | "light"   emulate prefers-color-scheme
 *   fps, duration, start   GIF timing (default 15 fps, __demo.duration or 4 s)
 *   outWidth     number   downscale the GIF to this pixel width (lanczos)
 *   colors       number   GIF palette size (default 256)
 *   dither       string   ffmpeg paletteuse dither (default "sierra2_4a")
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i >= 0 ? (argv[i + 1] ?? true) : fallback;
};

const configPath = path.resolve(process.cwd(), flag('--config', 'media.config.json'));
const baseDir = path.dirname(configPath);
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const only = flag('--only');
const jobs = (config.jobs || []).filter((j) => !only || `${j.name} ${j.out}`.includes(only));

if (argv.includes('--list')) {
  for (const j of config.jobs || []) console.log(`${j.name.padEnd(24)} ${j.out}`);
  process.exit(0);
}
if (!jobs.length) {
  console.error('No jobs matched.');
  process.exit(1);
}

const chromePath = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => p && fs.existsSync(p));
if (!chromePath) {
  console.error('Chrome or Edge not found. Set CHROME_PATH.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const userDir = fs.mkdtempSync(path.join(os.tmpdir(), 'render-media-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--mute-audio',
    '--force-color-profile=srgb',
    '--allow-file-access-from-files',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function connect() {
  const portFile = path.join(userDir, 'DevToolsActivePort');
  for (let i = 0; i < 150 && !fs.existsSync(portFile); i++) await sleep(100);
  const [port, wsPath] = fs.readFileSync(portFile, 'utf8').trim().split(/\r?\n/);
  const ws = new WebSocket(`ws://127.0.0.1:${port}${wsPath}`);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  let seq = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(`${msg.error.message} ${msg.error.data || ''}`)) : resolve(msg.result);
    } else if (msg.method) {
      for (const l of listeners) l(msg);
    }
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const once = (method, sessionId, timeout = 30000) =>
    new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        listeners.delete(l);
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeout);
      const l = (m) => {
        if (m.method === method && m.sessionId === sessionId) {
          clearTimeout(t);
          listeners.delete(l);
          resolve(m.params);
        }
      };
      listeners.add(l);
    });
  return { ws, send, once };
}

function toUrl(src) {
  const cut = src.search(/[?#]/);
  const file = cut >= 0 ? src.slice(0, cut) : src;
  const suffix = cut >= 0 ? src.slice(cut) : '';
  const abs = path.resolve(baseDir, file);
  if (!fs.existsSync(abs)) throw new Error(`Missing source: ${abs}`);
  return pathToFileURL(abs).href + suffix;
}

const RENDER_PRELUDE = `
  window.__RENDER__ = true;
  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('render-mode');
    const s = document.createElement('style');
    s.textContent = '*,*::before,*::after{transition:none!important;caret-color:transparent!important}';
    document.head.appendChild(s);
  });
`;

const seekExpr = (t) => `(async () => {
  const t = ${Number(t)};
  if (window.__demo && typeof window.__demo.seek === 'function') await window.__demo.seek(t);
  for (const a of document.getAnimations()) { try { a.pause(); a.currentTime = t * 1000; } catch (e) {} }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return true;
})()`;

async function evaluate(s, expression) {
  const r = await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) {
    throw new Error(`Page error: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
  }
  return r.result.value;
}

async function openPage(cdp, job, isGif) {
  const width = job.width ?? 1440;
  const height = job.height ?? 900;
  const scale = job.scale ?? (isGif ? 1 : 2);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const s = (m, p) => cdp.send(m, p, sessionId);
  await s('Page.enable');
  await s('Runtime.enable');
  await s('Page.addScriptToEvaluateOnNewDocument', { source: RENDER_PRELUDE });
  await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
  const features = [{ name: 'prefers-reduced-motion', value: 'no-preference' }];
  if (job.colorScheme) features.push({ name: 'prefers-color-scheme', value: job.colorScheme });
  await s('Emulation.setEmulatedMedia', { features });
  if (job.transparent) {
    await s('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  }
  const loaded = cdp.once('Page.loadEventFired', sessionId);
  await s('Page.navigate', { url: toUrl(job.src) });
  await loaded;
  await evaluate(s, 'document.fonts.ready.then(() => document.fonts.size)');
  await sleep(job.settle ?? 150);
  const demo = await evaluate(
    s,
    'window.__demo ? { duration: window.__demo.duration ?? null, still: window.__demo.still ?? null } : null',
  );
  return { s, targetId, width, height, scale, demo };
}

const kb = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(2)} MB` : `${Math.round(bytes / 1024)} KB`);

async function renderPng(cdp, job) {
  const page = await openPage(cdp, job, false);
  const { s } = page;
  await evaluate(s, seekExpr(job.at ?? page.demo?.still ?? 0));
  const params = { format: 'png', fromSurface: true, captureBeyondViewport: false };
  if (job.selector) {
    const box = await evaluate(
      s,
      `(() => { const el = document.querySelector(${JSON.stringify(job.selector)});
         if (!el) return null; const r = el.getBoundingClientRect();
         return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`,
    );
    if (!box) throw new Error(`Selector not found: ${job.selector}`);
    params.clip = { ...box, scale: 1 };
    params.captureBeyondViewport = true;
  } else if (job.fullPage) {
    const h = await evaluate(s, 'Math.ceil(document.documentElement.scrollHeight)');
    await s('Emulation.setDeviceMetricsOverride', {
      width: page.width,
      height: h,
      deviceScaleFactor: page.scale,
      mobile: false,
    });
    await sleep(120);
    await evaluate(s, seekExpr(job.at ?? page.demo?.still ?? 0));
  }
  const { data } = await s('Page.captureScreenshot', params);
  const out = path.resolve(baseDir, job.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(data, 'base64'));
  await cdp.send('Target.closeTarget', { targetId: page.targetId });
  return out;
}

async function renderGif(cdp, job) {
  const ff = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (ff.status !== 0) throw new Error('ffmpeg not found on PATH');
  const page = await openPage(cdp, job, true);
  const { s } = page;
  const fps = job.fps ?? 15;
  const duration = job.duration ?? page.demo?.duration ?? 4;
  const start = job.start ?? 0;
  const frames = Math.max(1, Math.round(duration * fps));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'render-frames-'));
  for (let i = 0; i < frames; i++) {
    await evaluate(s, seekExpr(start + i / fps));
    const { data } = await s('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(path.join(dir, `f_${String(i).padStart(4, '0')}.png`), Buffer.from(data, 'base64'));
    if (i % 10 === 0) process.stdout.write('.');
  }
  await cdp.send('Target.closeTarget', { targetId: page.targetId });
  const out = path.resolve(baseDir, job.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const pre = job.outWidth ? `scale=${job.outWidth}:-1:flags=lanczos,` : '';
  const vf =
    `${pre}split[a][b];[a]palettegen=max_colors=${job.colors ?? 256}:stats_mode=full[p];` +
    `[b][p]paletteuse=dither=${job.dither ?? 'sierra2_4a'}:diff_mode=rectangle`;
  const r = spawnSync(
    'ffmpeg',
    ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(dir, 'f_%04d.png'), '-vf', vf, '-loop', '0', out],
    { stdio: 'inherit' },
  );
  fs.rmSync(dir, { recursive: true, force: true });
  if (r.status !== 0) throw new Error('ffmpeg failed');
  return out;
}

const cdp = await connect();
let failed = 0;
try {
  for (const job of jobs) {
    const isGif = job.out.toLowerCase().endsWith('.gif');
    const t0 = Date.now();
    process.stdout.write(`${isGif ? 'GIF' : 'PNG'}  ${job.name.padEnd(24)} `);
    try {
      const out = isGif ? await renderGif(cdp, job) : await renderPng(cdp, job);
      console.log(` -> ${path.relative(baseDir, out)}  ${kb(fs.statSync(out).size)}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    } catch (e) {
      failed++;
      console.log(` FAILED: ${e.message}`);
    }
  }
} finally {
  cdp.ws.close();
  chrome.kill();
  await sleep(300);
  try {
    fs.rmSync(userDir, { recursive: true, force: true });
  } catch {}
}
process.exit(failed ? 1 : 0);
