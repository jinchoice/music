// core.js: constants, helpers, paper, paint wrapper, compositing and render hooks.
// From ClaudeAnimationBase (MIT, see LICENSE-ClaudeAnimationBase), extended for music videos: a beat map for the song,
// a karaoke hook, a real-bitmap logo, re-cut support, calm (no boil, no shake) and render-side checks.
// Length and rhythm come from PROJECT in config.js.
const W = 1920, H = 1080;
const BPM = PROJECT.bpm, BEAT = 60 / BPM, OFF = PROJECT.offset || 0, BOIL = 8, DUR = PROJECT.duration;
const TAU = Math.PI * 2;
const PAL = {
  paper: '#F3EBDC', ink: '#2B2233', clay: '#D97757', clayDk: '#A84D33', clayLt: '#F2A283',
  night: '#1F2550', indigo: '#2F3C7A', rose: '#E27A92', ochre: '#E8AA38', sap: '#6E9F58',
  teal: '#3A9C98', violet: '#7B5CA8', cream: '#FFF5E2', sky: '#8EC3E6',
  gold: '#E9C24A', emerald: '#3FAE84', tomato: '#E0533D', manila: '#E3C98F', midnight: '#22263F', lilac: '#D9B8F0',
  // the project's own colours go here (brand colours softened for watercolour, the setting's key colours), e.g.
  // brand: '#6E3AAE', brandDk: '#45206F', brandLt: '#B58BE8'
};

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const backOut = x => { x = clamp(x); const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// Beat position from the song's beat map (src/beats.js, BEATS), so pulse() and beat-timed hits land on the real track
// even where the band drifts a little; outside the map it runs on at the nominal tempo.
const bpMap = (B, t) => {
  if (!B || !B.length) return (t - OFF) / BEAT;
  if (t <= B[0]) return (t - B[0]) / BEAT;
  const n = B.length - 1; if (t >= B[n]) return n + (t - B[n]) / BEAT;
  let lo = 0, hi = n; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (B[m] <= t) lo = m; else hi = m; }
  return lo + (t - B[lo]) / (B[lo + 1] - B[lo]);
};
const beatMapT = (B, b) => {
  if (!B || !B.length) return OFF + b * BEAT;
  if (b <= 0) return B[0] + b * BEAT;
  const n = B.length - 1; if (b >= n) return B[n] + (b - n) * BEAT;
  const i = Math.floor(b); return lerp(B[i], B[i + 1], b - i);
};
// In a re-cut edition (src/recut.js), shots run on the ORIGINAL timeline (remapped), but everything that moves on the
// beat follows the NEW song: REMAP_NOW = { o, n, k } (original time, new time, original seconds per new second) for this
// frame, and RECUT_BEATS is the new song's beat map.
let REMAP_NOW = null;
const bpOf = t => REMAP_NOW ? bpMap(typeof RECUT_BEATS !== 'undefined' ? RECUT_BEATS : null, REMAP_NOW.n + (t - REMAP_NOW.o) / REMAP_NOW.k)
                            : bpMap(typeof BEATS !== 'undefined' ? BEATS : null, t);
// song time of beat position b (the inverse of bpOf): beatT(4 * bar) is that bar's downbeat
const beatT = b => REMAP_NOW ? REMAP_NOW.o + (beatMapT(typeof RECUT_BEATS !== 'undefined' ? RECUT_BEATS : null, b) - REMAP_NOW.n) * REMAP_NOW.k
                             : beatMapT(typeof BEATS !== 'undefined' ? BEATS : null, b);
// jit(): seeded randomness for hand-drawn wobble in outlines. BOILN is held at 0 in draw(), so the wobble is the same in
// every frame (no boil: a boiling line reads as shimmer and shake in a music video). Stable per-object values: hash(i).
const jit = a => (random() * 2 - 1) * a;
// Each boil drawing holds for several frames, so whatever isn't moving must draw the same until the next one. But a moving
// thing uses a different amount of randomness each frame, which shifts the stream for everything drawn after it and makes
// that re-boil every frame (jitter). boilSeed(key) restarts the stream from the boil frame and a key (any string or
// number) that's the same every frame: call it before each separate element. clawd() does this for itself and its parts.
let BOILN = 0, CLAWD_N = 0;
const FRAME_RESETS = [];   // functions run at the start of every frame (reset per-frame counters)
// Seeds: boilSeed(key) names the element; then every brush shape inside it gets its own fixed seed (key + its index in
// the element), and the stream is reseeded again after it. So a shape's texture never depends on how much randomness
// the shapes before it used: a shape only changes when its own geometry changes, and nothing shimmers.
let SEED_KEY = 'frame', SEED_SUB = 0;
const seedNow = () => { let h = 2166136261; for (const c of SEED_KEY + '|' + BOILN + '|' + SEED_SUB) h = Math.imul(h ^ c.charCodeAt(0), 16777619); randomSeed(h >>> 0); };
const boilSeed = key => { SEED_KEY = String(key); SEED_SUB = 0; seedNow(); };
const seedShape = () => { SEED_SUB++; seedNow(); };

// ---------- timing helpers (everything is a pure function of t; no state survives between frames) ----------
const seg = (t, a, b) => clamp((t - a) / (b - a));                 // 0..1 progress of t through [a, b]
const frac = x => x - Math.floor(x);
const beatN = t => Math.floor(bpOf(t));                            // integer beat index
const pulse = (t, k = 6) => Math.exp(-frac(bpOf(t)) * k);          // 1 exactly on each beat, decays after
const pulse2 = (t, k = 6) => Math.exp(-frac(bpOf(t) * 2) * k);     // same on eighth notes
const wob = (t, f = 1, ph = 0) => Math.sin((t * f + ph) * TAU);
const easeIn = x => Math.pow(clamp(x), 3);
const elasticOut = x => { x = clamp(x); return x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (TAU / 3)) + 1; };
// keyframes: kf(t, [[t0, v0], [t1, v1], ...], easeFn). Values may be numbers or arrays of numbers.
function kf(t, keys, e = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a));
      return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
    }
  }
  return keys[keys.length - 1][1];
}
// hex color mix
function mixCol(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = i => Math.round(lerp((pa >> i) & 255, (pb >> i) & 255, clamp(k)));
  return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
}
// The camera never shakes: viewers read shake as a glitch, and it fights the lyrics. shakeXY exists so code written for
// the base kit still runs, but it always returns zero. Show impacts with a squash, a flash, an emote or a cut instead.
const shakeXY = (t, amt) => [0, 0];

// ---------- motion principles, as pure functions of t ----------
// Damped spring kicked at t0: 0 before, then a wobble that dies away. Use it for secondary motion and settles: a body
// after landing, a hat that jiggles, a stack that sways, a tail that drags. k = damping, w = wobble speed (rad/s).
const spring = (t, t0, k = 6, w = 18) => t < t0 ? 0 : Math.exp(-k * (t - t0)) * Math.sin(w * (t - t0));
const ring = (t, evs, k = 6, w = 18) => evs.reduce((s, e) => s + spring(t, e, k, w), 0);    // one kick per event time
// Hold each drawing for two frames (12 drawings a second), like hand-drawn animation "on twos". Wrap a shot's t in it.
const onTwos = t => Math.floor(t * 12 + 1e-6) / 12;
// Point on a thrown or jumping arc from p0 to p1, peaking h px above the straight line; k = 0..1 along the flight.
const arcPt = (p0, p1, h, k) => [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k) - h * 4 * k * (1 - k)];
// A hop that takes off at t0 and lands at t1, h body units high: crouch (anticipation), stretch on takeoff,
// round at the top, squash on landing and spring back. Returns { dy, sq } to spread into clawd().
function jump(t, t0, t1, h = 3) {
  if (t < t0 - .12) return { dy: 0, sq: 0 };
  if (t < t0) return { dy: 0, sq: .18 * ease(seg(t, t0 - .12, t0)) };
  if (t < t1) { const k = (t - t0) / (t1 - t0); return { dy: -h * 4 * k * (1 - k), sq: -.16 * Math.abs(1 - 2 * k) }; }
  const a = t - t1; return { dy: 0, sq: .22 * Math.exp(-8 * a) * Math.cos(20 * a) };
}
// A surprise "take" peaking at t0: a quick squash, then a big stretch up that springs back. amt scales it.
function take(t, t0, amt = 1) {
  if (t < t0 - .1) return { sq: 0, dy: 0 };
  if (t < t0) return { sq: .12 * amt * ease(seg(t, t0 - .1, t0)), dy: 0 };
  const a = t - t0; return { sq: -.26 * amt * Math.exp(-6 * a) * Math.cos(16 * a), dy: -1.2 * amt * Math.exp(-7 * a) * Math.max(0, Math.cos(9 * a)) };
}
// Walk from x0 to x1 (px) between t0 and t1, for a character of unit u: eases in and out, faces the way it's
// going in 3/4 view, and faces front when it stops. Returns { x, walk, view, flip, dy } for clawd().
function stroll(t, t0, t1, x0, x1, u) {
  const x = lerp(x0, x1, ease(seg(t, t0, t1))), d = Math.abs(x - x0) / (4 * u), moving = t > t0 && t < t1;
  return { x, walk: d, view: moving ? 'q' : 'front', flip: x1 < x0, dy: moving ? -Math.abs(Math.sin(d * Math.PI)) * .5 : 0 };
}

// ---------- camera ----------
// camBegin(cx, cy, zoom, rot): world point (cx, cy) lands at screen centre. Letters queued while a camera is
// active are placed through it automatically (pass {screen:true} to opt out). One level only: always pair with camEnd().
// LAST_CAM stays set after camEnd(), until the next frame: renderSheet's crops that follow a world point use it.
let CAM = null, LAST_CAM = null;
function camBegin(cx = W / 2, cy = H / 2, zoom = 1, rot = 0) { push(); translate(W / 2, H / 2); rotate(rot); scale(zoom); translate(-cx, -cy); CAM = LAST_CAM = { cx, cy, zoom, rot }; }
function camEnd() { pop(); CAM = null; }
function toScreen(x, y, cam = CAM) {
  if (!cam) return [x, y];
  const c = Math.cos(cam.rot), s = Math.sin(cam.rot), dx = (x - cam.cx) * cam.zoom, dy = (y - cam.cy) * cam.zoom;
  return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c];
}

// ---------- full-frame effects (call outside a camera, in screen space) ----------
function flash(k, col = '#FFFDF6') { if (k > .01) paint(rectPts(-60, -60, W + 120, H + 120), { wash: col, washOp: 255 * clamp(k), ink: null }); }
// Light: glow(x, y, r, col, a) ADDS a soft halo of light for anything that shines (stars, lamps, fireflies, magic).
// p5.brush mixes every colour like pigment, so yellow painted over blue turns green and light can't be painted; this
// is the one non-paint mark in the kit. It lands on what's painted so far, under anything painted after it, follows
// the camera, and boils a little. Keep a = 1 on dark grounds; on light grounds it barely shows (as light would).
function glow(x, y, r, col = '#FFC766', a = 1) {
  if (a <= 0 || r < 1) return;
  flushBrush();
  const c = color(col), rr = r * (1 + jit(.03));
  push(); blendMode(ADD); tint(red(c), green(c), blue(c), 150 * clamp(a)); image(glowTex, x - rr, y - rr, 2 * rr, 2 * rr); noTint(); blendMode(BLEND); pop();
}
function makeGlowTex() {
  const g = createGraphics(256, 256); g.pixelDensity(1); const c = g.drawingContext, gr = c.createRadialGradient(128, 128, 0, 128, 128, 128);
  [[0, 1], [.18, .8], [.45, .32], [.75, .08], [1, 0]].forEach(([s, a]) => gr.addColorStop(s, `rgba(255,255,255,${a})`));
  c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
  return g;
}
// Paint everything OUTSIDE a star-shaped hole (irises, mouth-shaped reveals, keyholes).
function irisShape(pts, col = PAL.ink, far = 4000) {
  const n = pts.length; let cx = 0, cy = 0; for (const p of pts) { cx += p[0]; cy += p[1]; } cx /= n; cy /= n;
  const out = p => { const dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy) || 1; return [cx + dx / d * far, cy + dy / d * far]; };
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], ex = (b[0] - a[0]) * .06, ey = (b[1] - a[1]) * .06;
    const a2 = [a[0] - ex, a[1] - ey], b2 = [b[0] + ex, b[1] + ey];
    paint([a2, b2, out(b2), out(a2)], { wash: col, washOp: 255, ink: null });
  }
}
function iris(cx, cy, r, col = PAL.ink) { if (r < 4) paint(rectPts(-60, -60, W + 120, H + 120), { wash: col, ink: null }); else irisShape(ellPts(cx, cy, r, r, 40), col); }

let T = 0, paperG = null, grainC = null, letG = null, glowTex = null, outC = null, outX = null;
let LETTERS = [];
// A brand logo, drawn as the real image (PROJECT.logo), never painted: logoAt(x, y, w, h, alpha) queues it for this
// frame, in SCREEN pixels; it's composited over the paper grain so it stays exactly as designed. Put it on a plaque
// painted in the logo's own background colour so the bitmap's edges disappear.
let LOGO_IMG = null, LOGO_DRAW = null;
function logoAt(x, y, w, h, a = 1) { LOGO_DRAW = { x, y, w, h, a: clamp(a) }; }

// ---------- geometry ----------
function rectPts(x, y, w, h, j = 0) {
  return [[x + jit(j), y + jit(j)], [x + w / 2 + jit(j), y + jit(j) * .5], [x + w + jit(j), y + jit(j)],
          [x + w + jit(j) * .5, y + h / 2], [x + w + jit(j), y + h + jit(j)], [x + w / 2 + jit(j), y + h + jit(j) * .5],
          [x + jit(j), y + h + jit(j)], [x + jit(j) * .5, y + h / 2]];
}
function ellPts(cx, cy, rx, ry, n = 28, j = 0, rot = 0) {
  const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * rx + jit(j), cy + Math.sin(a) * ry + jit(j)]); } return p;
}
function rrPts(x, y, w, h, r, j = 0) {
  const p = [], seg = 5, corner = (cx, cy, a0) => { for (let i = 0; i <= seg; i++) { const a = a0 + i / seg * Math.PI / 2; p.push([cx + Math.cos(a) * r + jit(j), cy + Math.sin(a) * r + jit(j)]); } };
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return p;
}
function starPts(cx, cy, r, inner = .38, n = 4, rot = -Math.PI / 2) {
  const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, q = i % 2 ? r * inner : r; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p;
}
// Smooth curve through the points (Catmull-Rom), n samples per span.
function through(P, n = 6) {
  if (P.length < 3) return P.slice();
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (p2[d] - p0[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * u3)));
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
// Tapered ribbon around a path (w0 wide at the start, w1 at the end), as one closed outline for paint().
// Tails, tentacles, noodly arms, painted glyphs: one shape with one outline, so nothing looks glued on.
function ribbon(P, w0, w1 = w0) {
  const C = through(P), n = C.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / Math.max(1, n - 1)) / 2;
    L.push([C[i][0] - dy / d * w, C[i][1] + dx / d * w]); R.push([C[i][0] + dy / d * w, C[i][1] - dx / d * w]);
  }
  return L.concat(R.reverse());
}

// ---------- paint wrapper ----------
// One call = one painted shape: optional flat wash, optional watercolor fill, optional hatch, optional ink outline.
// p5.brush 2.2.3 loses strokes drawn far from the origin under a zoomed camera (from zoom ~2, an outline or a line
// leaves only a dot at its first vertex), so every shape and line is drawn around its own centre.
function centred(pts, draw) {
  if (!pts.length) return;
  for (const q of pts) if (!(Number.isFinite(q[0]) && Number.isFinite(q[1]))) {   // a NaN would crash p5.brush deep inside
    if (!window._nanWarned) { window._nanWarned = 1; console.warn('skipped a shape with a NaN point: ' + new Error().stack.split('\n').slice(2, 6).join(' | ')); }
    return;
  }
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  push(); translate(cx, cy); draw(pts.map(([x, y]) => [x - cx, y - cy])); pop();
}
function paint(pts, o = {}) { seedShape(); centred(pts, (P) => paintAt(P, o)); seedShape(); }
function paintAt(pts, o) {
  if (o.wash || o.fill || o.hatch) {
    if (o.wash) brush.wash(o.wash, o.washOp ?? 255); else brush.noWash();
    if (o.fill) { brush.fill(o.fill, o.fillOp ?? 170); brush.fillBleed(o.bleed ?? .1); brush.fillTexture(o.tex ?? .4, o.border ?? .35); } else brush.noFill();
    if (o.hatch) { brush.hatch(o.hatch.d, o.hatch.a, o.hatch.o || { rand: .15 }); brush.hatchStyle(o.hatch.b || 'HB', o.hatch.c || PAL.ink, o.hatch.w || 1); } else brush.noHatch();
    brush.noStroke();
    try {
      if (o.curv) { brush.beginShape(o.curv); for (const p of pts) brush.vertex(p[0], p[1]); brush.endShape(true); }
      else brush.polygon(pts);
    } catch (e) {
      // p5.brush's watercolour fill can throw on a degenerate outline; paint it flat instead of losing the frame
      if (!window._fillWarned) { window._fillWarned = 1; console.warn('fill failed, painted flat: ' + JSON.stringify({ n: pts.length, curv: o.curv, fill: o.fill })); }
      brush.noFill(); brush.noHatch();
      if (o.wash) { brush.wash(o.wash, o.washOp ?? 255); brush.polygon(pts); }
    }
  }
  // the outline is one continuous tapered stroke, not a stroke per side
  if (o.ink !== null) {
    brush.noWash(); brush.noFill(); brush.noHatch(); brush.set(o.br || 'ink', o.ink || PAL.ink, o.sw ?? 1);
    brush.beginShape(o.curv || 0); for (const p of pts) brush.vertex(p[0], p[1]); brush.endShape(true);
  }
}
function inkLine(pts, sw = 1, col = PAL.ink, br = 'ink', curv = .5) {
  seedShape();
  centred(pts, (P) => { brush.noFill(); brush.noWash(); brush.noHatch(); brush.set(br, col, sw); brush.spline(P, curv); });
  seedShape();
}

// ---------- lettering (drawn on the 2D compositor, under the paper grain) ----------
// Use sparingly: see "No text" in ANIMATION_GUIDE.md. Clawd's emotes are painted and never need these.
function letter(txt, x, y, size, color, o = {}) {
  if (CAM && !o.screen) { [x, y] = toScreen(x, y); size *= CAM.zoom; o = { ...o, rot: (o.rot || 0) + CAM.rot }; if (o.font) o.font = o.font.replace(/(\d+(\.\d+)?)px/, (m, v) => (v * CAM.zoom) + 'px'); }
  LETTERS.push({ txt, x, y, size, color, ...o });
}
// Comic sound effect: pops in at age 0, wobbles, fades by `life` seconds.
function sfx(txt, x, y, size, color, age, o = {}) {
  const life = o.life ?? 1.2; if (age < 0 || age > life) return;
  letter(txt, x, y, size, color, { pop: age * 5, rot: (o.rot ?? -.08) + Math.sin(age * 20) * .03 * (1 - age / life), alpha: 1 - seg(age, life - .25, life), ...o });
}
function drawLetters(c) {
  for (const L of LETTERS) {
    const k = L.pop != null ? backOut(L.pop) : 1; if (k <= .01) continue;
    c.save(); c.translate(L.x, L.y); c.rotate(L.rot || 0); c.scale(k, k); c.globalAlpha = L.alpha ?? 1;
    c.font = L.font || `${L.size}px "Permanent Marker", "Comic Sans MS", cursive`;
    c.textAlign = L.align || 'center'; c.textBaseline = 'middle';
    if (L.stroke) { c.lineJoin = 'round'; c.lineWidth = L.size * .12; c.strokeStyle = L.stroke; c.strokeText(L.txt, 0, 0); }
    if (L.ink !== false) { c.fillStyle = PAL.ink; c.fillText(L.txt, L.size * .045, L.size * .055); }
    c.fillStyle = L.color; c.fillText(L.txt, 0, 0);
    c.restore();
  }
}

// p5.brush defers washes and strokes into a mask layer; a (tiny, off-screen) watercolor fill forces it to composite
// now, so everything painted before this call really lands under whatever p5 draws next (letters, glow).
function flushBrush() {
  push(); resetMatrix(); translate(-W / 2, -H / 2);
  brush.noStroke(); brush.noHatch(); brush.noWash(); brush.fill('#000000', 1); brush.fillBleed(0); brush.fillTexture(0, 0);
  brush.polygon([[-50, -50], [-40, -50], [-40, -40]]); brush.noFill(); pop();
}
// Paint the queued lettering into the scene itself, so later layers (wipes) cover it. drawWorld calls this after each
// frame; call it yourself before a wipe or iris if the shot has lettering, or the letters will sit on top of it.
function flushLetters() {
  if (!LETTERS.length) return;
  letG.clear(); drawLetters(letG.drawingContext); LETTERS = [];
  flushBrush();
  // Letters are already in screen space, so composite them with the base transform even inside camBegin().
  push(); resetMatrix(); translate(-W / 2, -H / 2); image(letG, 0, 0); pop();
}

// ---------- paper ----------
function lcg(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function makePaper() {
  const g = createGraphics(W, H); g.pixelDensity(1); const c = g.drawingContext, rnd = lcg(11);
  c.fillStyle = PAL.paper; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const x = rnd() * W, y = rnd() * H, r = 120 + rnd() * 380, gr = c.createRadialGradient(x, y, 0, x, y, r), a = .045 * rnd(); gr.addColorStop(0, `rgba(160,125,80,${a})`); gr.addColorStop(1, 'rgba(160,125,80,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  c.lineWidth = 1;
  for (let i = 0; i < 1400; i++) { const x = rnd() * W, y = rnd() * H, l = 6 + rnd() * 26, a = rnd() * TAU; c.strokeStyle = `rgba(110,88,60,${.035 + rnd() * .06})`; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  return g;
}
// Static grain + vignette, multiplied over the painted frame so pigment sits "in" the paper.
function makeGrain() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'), rnd = lcg(5);
  const id = c.createImageData(W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 255 - (rnd() < .55 ? rnd() * rnd() * 34 : 0); d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 3; d[i + 3] = 255; }
  c.putImageData(id, 0, 0);
  const g = c.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,95,70,.35)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  return cv;
}

// ---------- custom brushes ----------
function defineBrushes() {
  brush.add('ink', { type: 'default', weight: 5, scatter: .25, sharpness: .8, grain: 40, opacity: 235, spacing: .2, pressure: [1.15, .75], rotate: 'natural', noise: .15 });
  brush.add('inkfine', { type: 'default', weight: 2.6, scatter: .15, sharpness: .85, grain: 40, opacity: 230, spacing: .2, pressure: [1.1, .8], rotate: 'natural', noise: .1 });
  brush.add('dry', { type: 'default', weight: 14, scatter: 3, sharpness: .3, grain: 6, opacity: 90, spacing: .6, pressure: [1, .6], rotate: 'natural', noise: .4 });
}

// ---------- frame ----------
async function setup() {
  createCanvas(W, H, WEBGL); pixelDensity(1); noLoop();
  brush.scaleBrushes(5); defineBrushes();
  paperG = makePaper(); grainC = makeGrain(); glowTex = makeGlowTex(); letG = createGraphics(W, H); letG.pixelDensity(1);
  outC = document.getElementById('out'); outX = outC.getContext('2d');
  await document.fonts.load('100px "Permanent Marker"'); await document.fonts.load('800 50px "Shantell Sans"');
  if (PROJECT.logo) LOGO_IMG = await new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => { console.warn('logo not found: ' + PROJECT.logo); r(null); }; im.src = PROJECT.logo; });
  window.ready = true;
  if (!location.search.includes('render')) devUI();
}
function draw() {
  if (!window.ready) return;
  LETTERS = []; LOGO_DRAW = null; CAM = LAST_CAM = null;
  push(); translate(-W / 2, -H / 2);
  // The linework holds still: no boil. Every element draws from the same seed in every frame (boilSeed keys stay
  // fixed), so a still drawing is identical frame to frame and only things that really move change.
  BOILN = 0; CLAWD_N = 0; boilSeed('frame'); noiseSeed(77);
  // per-frame call counters (they name each character's brush seeds): reset, so a frame always paints the same way no
  // matter which frame this page rendered before. A new character with its own counter registers a reset:
  // FRAME_RESETS.push(() => { MASCOT_N = 0; })
  if (typeof PERSON_N !== 'undefined') PERSON_N = 0;
  for (const f of FRAME_RESETS) f();
  image(paperG, 0, 0);
  drawWorld(T);
  pop();
}
function composite(t) {
  const c = outX;
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.drawImage(drawingContext.canvas, 0, 0, W, H);
  drawLetters(c);
  if (window.overlayText) window.overlayText(c, t);   // karaoke lettering (timeline.js), under the grain
  c.globalCompositeOperation = 'multiply'; c.drawImage(grainC, 0, 0);
  c.globalCompositeOperation = 'source-over';
  if (LOGO_DRAW && LOGO_IMG && LOGO_DRAW.a > 0) {   // over the grain: the logo stays exactly as designed
    const L = LOGO_DRAW; c.save(); c.globalAlpha = L.a; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(LOGO_IMG, L.x, L.y, L.w, L.h); c.restore();
  }
}
window.renderAt = async (t, type = 'image/png', q = .92) => { T = t; await redraw(); composite(t); return outC.toDataURL(type, q); };
// Contact sheet of several times, for visual checks: returns { url, ms[] }. crop = [x, y, w, h] fills each cell with just
// that region of the frame, at full resolution (for checking faces, hands and contacts up close). at = [x, y, w, h]
// instead crops w × h around the WORLD point (x, y), wherever each frame's camera put it (a foot, a splash, a prop on
// a moving shot); x and y may be expressions evaluated in the page.
window.renderSheet = async (times, cols = 3, w = 640, crop = null, at = null) => {
  if (at) at = at.map((v) => typeof v === 'string' ? (0, eval)(v) : v);
  const [, , cw, ch] = at || crop || [0, 0, W, H], h = Math.round(w * ch / cw), rows = Math.ceil(times.length / cols), sc = document.createElement('canvas');
  sc.width = cols * w; sc.height = rows * h; const c = sc.getContext('2d'), ms = [];
  for (let i = 0; i < times.length; i++) {
    const t0 = performance.now(); T = times[i]; await redraw(); composite(times[i]); ms.push(Math.round(performance.now() - t0));
    const x = (i % cols) * w, y = Math.floor(i / cols) * h;
    const [cx, cy] = at ? toScreen(at[0], at[1], LAST_CAM).map((v, j) => v - (j ? ch : cw) / 2) : crop || [0, 0];
    c.drawImage(outC, cx, cy, cw, ch, x, y, w, h); c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(x, y, 84, 24); c.fillStyle = '#fff'; c.font = '15px sans-serif'; c.fillText(times[i].toFixed(2) + 's', x + 6, y + 17);
  }
  return { url: sc.toDataURL('image/jpeg', .9), ms };
};
// ---------- checks (render.mjs --motion / --determinism) ----------
// Luma of the composited frame at full resolution.
function lumaNow() { const d = outX.getImageData(0, 0, W, H).data, L = new Float32Array(W * H); for (let i = 0, j = 0; j < L.length; i += 4, j++) L[j] = .299 * d[i] + .587 * d[i + 1] + .114 * d[i + 2]; return L; }
async function frameLuma(t) { T = t; await redraw(); composite(t); return lumaNow(); }
// Motion over consecutive frames ts: per frame, the mean change from the last frame (d1: anything moving, pans
// included) and the mean second difference (d2: back-and-forth motion: bounce, shimmer, flapping, shake). A smooth pan
// has a high d1 and a low d2. Also a heat map of d2 over the first frame, and the hottest 160×120 cells.
window.motionScan = async (ts) => {
  const rows = [], acc = new Float32Array(W * H); let a = null, b = null, n = 0, first = null;
  for (const t of ts) {
    const c = await frameLuma(t); if (!first) first = outX.getImageData(0, 0, W, H);
    let d1 = 0, d2 = 0;
    if (b) { for (let i = 0; i < c.length; i += 7) d1 += Math.abs(c[i] - b[i]); d1 /= c.length / 7; }
    if (a) { for (let i = 0; i < c.length; i++) { const v = Math.abs(c[i] - 2 * b[i] + a[i]); acc[i] += v; if (i % 7 === 0) d2 += v; } d2 /= c.length / 7; n++; }
    rows.push([+t.toFixed(3), +d1.toFixed(3), +d2.toFixed(3)]); a = b; b = c;
  }
  if (n) for (let i = 0; i < acc.length; i++) acc[i] /= n;
  const cells = []; for (let y = 0; y < H; y += 120) for (let x = 0; x < W; x += 160) { let s = 0; for (let yy = y; yy < y + 120; yy += 3) for (let xx = x; xx < x + 160; xx += 3) s += acc[yy * W + xx]; cells.push([+(s / (40 * 54)).toFixed(2), x, y]); }
  cells.sort((p, q) => q[0] - p[0]);
  const hc = document.createElement('canvas'); hc.width = W; hc.height = H; const hx = hc.getContext('2d'), img = first;
  for (let i = 0, j = 0; j < acc.length; i += 4, j++) { const h = Math.min(255, acc[j] * 6); img.data[i] = Math.min(255, img.data[i] * .45 + h); img.data[i + 1] *= .45; img.data[i + 2] *= .45; }
  hx.putImageData(img, 0, 0);
  return { rows, cells: cells.slice(0, 8), url: hc.toDataURL('image/jpeg', .85) };
};
// Determinism: render t, then another time (or nothing, for the control), then t again. The GPU adds a little noise
// (under ~8 levels on a fraction of a percent of pixels, even back to back), so the test is the share of pixels that
// changed by more than 16 levels: above 0.01% is a leak. A leak can show even back to back (a counter that grows
// every frame). A frame that really differs from itself means state leaked between frames (a counter,
// a cached value, an unseeded random): parallel workers would then paint different films.
window.selfDiff = async (t, other) => {
  const a = await frameLuma(t); if (other != null) await frameLuma(other); const b = await frameLuma(t);
  let s = 0, mx = 0, big = 0; for (let i = 0; i < a.length; i++) { const v = Math.abs(a[i] - b[i]); s += v; if (v > mx) mx = v; if (v > 16) big++; }
  return { mean: +(s / a.length).toFixed(4), max: Math.round(mx), big: +(big / a.length * 100).toFixed(3) };
};
window.gpuInfo = () => { const gl = drawingContext, e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); };

function devUI() {
  const s = document.getElementById('scrub'), lab = document.getElementById('tt'); s.max = window.LOOP ? window.LOOP.len : DUR;
  let busy = false, want = null;
  const go = async () => { if (busy) return; busy = true; while (want != null) { const t = want; want = null; const t0 = performance.now(); await window.renderAt(t); lab.textContent = `${t.toFixed(2)}s  ·  ${Math.round(performance.now() - t0)} ms/frame`; } busy = false; };
  s.addEventListener('input', () => { want = +s.value; go(); });
  want = +(new URLSearchParams(location.search).get('t') || 0); s.value = want; go();
}
