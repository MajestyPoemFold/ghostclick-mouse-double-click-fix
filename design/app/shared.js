/*
 * GhostClick shared page code
 *   - window chrome (Windows 11 title bar with caption buttons, navigation rail)
 *   - icons (one stroke style: 24 px grid, 1.7 px stroke, round caps and joins)
 *   - seeded PRNG (mulberry32) and easing helpers
 *   - chart paper drawing for canvas: grid, perforations, ink pulses, red ink circles
 *   - the deterministic demo contract used by scripts/render-media.mjs
 */
(function (G) {
  'use strict';

  /* ---------- Icons ---------- */
  const s = (d, extra = '') =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${extra}</svg>`;
  G.ICON = {
    recorder: s('<path d="M2 16h3.2V8h5.6v8h2.1l.9-8.5.9 8.5H22"/>'),
    intervals: s('<path d="M3 20.5h18"/><path d="M5 20.5v-4M7.8 20.5v-8M10.6 20.5v-2.5"/><path d="M15 20.5v-6M17.8 20.5V8M20.6 20.5v-5"/><path d="M12.8 3v4M12.8 9.5v2" stroke-width="1.5"/>'),
    filter: s('<path d="M4 5h16l-6.2 7.3V18l-3.6 2v-7.7z"/>'),
    hold: s('<path d="M2 17h3V7h6.2l.7 5.2.7-5.2H19v10h3"/>'),
    wear: s('<path d="M4 17.5a8.5 8.5 0 1 1 16 0"/><path d="M12 14.2l4.3-4.9"/><circle cx="12" cy="14.5" r="1.2"/><path d="M6.6 10.9l1 .7M12 6.2v1.2M17.4 10.9l-1 .7" stroke-width="1.4"/>'),
    report: s('<path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9 15h1.6v-4h2.8v4H15"/><path d="M9 7.2h6"/>'),
    settings: s('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'),
    download: s('<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>'),
    pause: s('<path d="M9 6v12M15 6v12"/>'),
    plus: s('<path d="M12 5v14M5 12h14"/>'),
    minus: s('<path d="M5 12h14"/>'),
    chevron: s('<path d="M6 9l6 6 6-6"/>'),
    check: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.3l2.4 2.4 4.6-5"/></svg>',
    app: s('<path d="M12 3v3M9 21h6"/>'),
    mark: s('<path d="M5 20V4M5 5h11l-2.5 3.5L16 12H5"/>'),
    copy: s('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
    x: s('<path d="M6 6l12 12M18 6L6 18"/>'),
    shield: s('<path d="M12 3l7 3v5.5c0 4.2-2.9 7.9-7 9.5-4.1-1.6-7-5.3-7-9.5V6z"/>'),
    clock: s('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    file: s('<path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/><path d="M14 3v4h4"/>'),
    image: s('<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><path d="M3.5 16l5-4.5 4 3.5 2.5-2 5.5 4.5"/><circle cx="15.5" cy="9.5" r="1.3"/>'),
  };
  G.APP_GLYPH =
    '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">' +
    '<rect x=".5" y=".5" width="15" height="15" rx="3.6" fill="#ffffff"/>' +
    '<path d="M2.4 11.2h1.9V4.8h3.9v6.4h1.3" fill="none" stroke="#15171a" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M10.5 11.2V5" fill="none" stroke="#d3261d" stroke-width="1.2"/>' +
    '<path d="M11.7 11.2h1.9" fill="none" stroke="#15171a" stroke-width="1.4"/></svg>';

  const CAPTION = {
    min: '<svg viewBox="0 0 10 10"><path d="M0 5.5h10" stroke="currentColor" stroke-width="1"/></svg>',
    max: '<svg viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1"/></svg>',
    restore:
      '<svg viewBox="0 0 10 10"><rect x=".5" y="2.5" width="7" height="7" rx="1.3" fill="none" stroke="currentColor" stroke-width="1"/><path d="M2.6 .5h5.4a1.5 1.5 0 0 1 1.5 1.5v5.4" fill="none" stroke="currentColor" stroke-width="1"/></svg>',
    close: '<svg viewBox="0 0 10 10"><path d="M.6 .6l8.8 8.8M9.4 .6L.6 9.4" stroke="currentColor" stroke-width="1"/></svg>',
  };

  const NAV = [
    ['recorder', 'Recorder', 'recorder.html'],
    ['intervals', 'Intervals', 'histogram.html'],
    ['filter', 'Filter', 'filter.html'],
    ['hold', 'Hold test', 'hold-test.html'],
    ['wear', 'Wear', 'wear.html'],
    ['report', 'Report', 'report.html'],
  ];

  /* ---------- Window chrome ---------- */
  G.mountChrome = function () {
    const tb = document.querySelector('.titlebar');
    if (tb) {
      const maximized = tb.dataset.maximized === 'true';
      tb.innerHTML =
        `<div class="tb-app">${G.APP_GLYPH}<b>GhostClick</b></div>` +
        `<span class="tb-sep" style="align-self:center"></span>` +
        `<div class="tb-status" style="padding-left:14px"><i></i>Filter on · Left, Right</div>` +
        `<div class="tb-drag"></div>` +
        `<div class="caption">` +
        `<button type="button" aria-label="Minimize">${CAPTION.min}</button>` +
        `<button type="button" aria-label="${maximized ? 'Restore' : 'Maximize'}">${maximized ? CAPTION.restore : CAPTION.max}</button>` +
        `<button type="button" class="close" aria-label="Close">${CAPTION.close}</button></div>`;
    }
    const rail = document.querySelector('.rail');
    if (rail) {
      const active = rail.dataset.active;
      rail.innerHTML =
        NAV.map(([id, label, href]) =>
          `<a href="${href}" class="${id === active ? 'active' : ''}"${id === active ? ' aria-current="page"' : ''}>${G.ICON[id]}<span>${label}</span></a>`,
        ).join('') +
        `<div class="rail-spacer"></div>` +
        `<div class="rail-filter" title="System-wide filter"><span class="dot"></span><b>1,284</b>filtered<br>this week</div>` +
        `<a href="#settings">${G.ICON.settings}<span>Settings</span></a>`;
    }
    document.querySelectorAll('[data-icon]').forEach((el) => {
      if (!el.querySelector('svg')) el.insertAdjacentHTML('afterbegin', G.ICON[el.dataset.icon] || '');
    });
  };

  /* ---------- Tokens to canvas ---------- */
  G.tok = function () {
    const cs = getComputedStyle(document.documentElement);
    const v = (n) => cs.getPropertyValue(n).trim();
    return {
      paper: v('--paper'), panel: v('--paper-panel'), sunk: v('--paper-sunk'), edge: v('--paper-edge'),
      minor: v('--grid-minor'), major: v('--grid-major'), label: v('--grid-label'),
      ink: v('--ink'), ink2: v('--ink-2'), ink3: v('--ink-3'), blue: v('--ink-blue'), red: v('--ink-red'),
      redWash: v('--ink-red-wash'), green: v('--ink-green'), amber: v('--ink-amber'),
      g950: v('--graphite-950'), g900: v('--graphite-900'), g800: v('--graphite-800'), g700: v('--graphite-700'),
      g500: v('--graphite-500'), g300: v('--graphite-300'), g100: v('--graphite-100'), rule: v('--rule'),
    };
  };

  /* ---------- PRNG + easing ---------- */
  G.prng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  G.clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  G.lerp = (a, b, k) => a + (b - a) * k;
  G.seg = (t, a, b) => G.clamp((t - a) / (b - a));
  G.easeOut = (k) => 1 - Math.pow(1 - k, 3);
  G.easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  G.backOut = (k) => { const c = 1.5; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  G.fmt = (n) => n.toLocaleString('en-US');

  /* ---------- Canvas ---------- */
  G.canvas = function (el) {
    const dpr = window.devicePixelRatio || 1;
    const r = el.getBoundingClientRect();
    el.width = Math.round(r.width * dpr);
    el.height = Math.round(r.height * dpr);
    const ctx = el.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: r.width, h: r.height, dpr };
  };
  const snap = (v) => Math.round(v) + 0.5;
  G.snap = snap;

  /*
   * Chart paper grid. offset = how far the paper has travelled left, in px.
   * Vertical lines are fixed to the paper (they scroll), horizontal lines are fixed to the frame.
   */
  G.grid = function (ctx, x, y, w, h, o = {}) {
    const T = o.tok || G.tok();
    const u = o.unit || 10, M = o.major || 5, off = o.offset || 0, oy = o.originY ?? y;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = T.paper; ctx.fillRect(x, y, w, h);
    ctx.lineWidth = 1;
    for (const pass of [0, 1]) {
      ctx.strokeStyle = pass ? T.major : T.minor;
      ctx.beginPath();
      if (!o.noVertical) {
        for (let i = Math.ceil(off / u); ; i++) {
          const px = x + i * u - off;
          if (px > x + w) break;
          const isMajor = ((i % M) + M) % M === 0;
          if (isMajor !== !!pass) continue;
          ctx.moveTo(snap(px), y); ctx.lineTo(snap(px), y + h);
        }
      }
      for (let j = Math.ceil((y - oy) / u); ; j++) {
        const py = oy + j * u;
        if (py > y + h) break;
        const isMajor = ((j % M) + M) % M === 0;
        if (isMajor !== !!pass) continue;
        ctx.moveTo(x, snap(py)); ctx.lineTo(x + w, snap(py));
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  /* Perforated margin: sprocket holes that travel with the paper */
  G.perf = function (ctx, x, y, w, h, o = {}) {
    const T = o.tok || G.tok();
    const pitch = o.pitch || 20, r = o.r || 3.6, off = o.offset || 0;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = o.paper || T.paper; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = o.hole || T.g900;
    const cy = y + h / 2;
    for (let i = Math.floor(off / pitch) - 1; ; i++) {
      const cx = x + i * pitch + pitch / 2 - off;
      if (cx - r > x + w) break;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    if (o.line) { // margin line between the holes and the grid
      ctx.strokeStyle = T.major; ctx.lineWidth = 1; ctx.beginPath();
      const ly = o.line === 'bottom' ? y + h - 0.5 : y + 0.5;
      ctx.moveTo(x, ly); ctx.lineTo(x + w, ly); ctx.stroke();
    }
    ctx.restore();
  };

  /*
   * A red ink loop drawn by hand around a ghost spike. p = drawing progress 0..1.
   * The loop overshoots its start a little, like a pen circling a mark.
   */
  G.inkCircle = function (ctx, cx, cy, rx, ry, p, seed, color, lw = 2) {
    if (p <= 0) return;
    const rnd = G.prng(seed);
    const a0 = -2.4 + rnd() * 0.7, ph1 = rnd() * 6.283, ph2 = rnd() * 6.283;
    const span = Math.PI * 2 * 1.1, n = 90, end = n * G.clamp(p);
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= Math.ceil(end); i++) {
      const k = Math.min(i, end) / n;
      const a = a0 + span * k;
      const wob = 1 + 0.045 * Math.sin(2 * a + ph1) + 0.03 * Math.sin(3 * a + ph2) + 0.09 * k;
      const px = cx + Math.cos(a) * rx * wob, py = cy + Math.sin(a) * ry * wob;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  };

  /* Label with a paper knockout so the grid does not run through the letters */
  G.label = function (ctx, text, x, y, o = {}) {
    ctx.save();
    ctx.font = o.font || '600 12px "SF Mono"';
    ctx.textBaseline = 'middle';
    ctx.textAlign = o.align || 'left';
    const m = ctx.measureText(text);
    const w = m.width, pad = o.pad ?? 4, h = o.h || 18;
    const lx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
    if (o.bg !== false) {
      ctx.fillStyle = o.bg || '#ffffff';
      ctx.fillRect(lx - pad, y - h / 2, w + pad * 2, h);
    }
    ctx.fillStyle = o.color || '#15171a';
    ctx.fillText(text, x, y + (o.dy || 0.5));
    ctx.restore();
    return w;
  };

  /* ---------- Demo contract ---------- */
  G.demo = function (render, duration, still) {
    window.__demo = { duration, still, seek: render };
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = () => {
      render(still);
      if (window.__RENDER__ || reduce) return;
      const t0 = performance.now();
      const loop = (now) => { render(((now - t0) / 1000) % duration); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    };
    G.fontsReady().then(start);
  };

  /* Canvas text needs its faces loaded before the first draw */
  G.fontsReady = function () {
    if (!document.fonts) return Promise.resolve();
    const faces = ['400 12px "SF Mono"', '500 12px "SF Mono"', '600 12px "SF Mono"', '700 12px "SF Mono"',
      '400 12px "SF Pro Rounded"', '500 12px "SF Pro Rounded"', '600 12px "SF Pro Rounded"', '700 12px "SF Pro Rounded"',
      '800 12px "SF Pro Rounded"'];
    return Promise.all(faces.map((f) => document.fonts.load(f).catch(() => null))).then(() => document.fonts.ready);
  };

  G.mountChrome();
})((window.GC = window.GC || {}));
