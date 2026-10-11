// props.js: a starter kit of recurring objects. Each draws one frame at a point and size; all are painted (wash + ink),
// and each seeds itself with boilSeed() so moving things drawn before it can't change its brush texture.
// Add the song's own props here (or in a props file of their own), in the same style: one function per object,
// (x, y) = a stated anchor (its base, its centre), s = scale, o = options, and the key states as 0..1 numbers.

// ---------- interiors ----------
// The desk: top surface from x0 to x0 + w at height y (the top edge), front panel down to y + h.
function desk(x0, y, w, h = 230, o = {}) {
  boilSeed('desk ' + x0);
  const wood = o.joy ? '#B9845A' : '#8A5E44', woodDk = o.joy ? '#8E5F3C' : '#5E3E2E';
  paint(rectPts(x0 + 30, y + 30, w - 60, h, 2), { wash: woodDk, fill: mixCol(woodDk, PAL.ink, .3), fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
  paint(rectPts(x0 + 60, y + 60, w * .36, h - 50, 2), { wash: wood, fill: woodDk, fillOp: 50, tex: .6, ink: PAL.ink, sw: .8 });
  for (let i = 0; i < 3; i++) { paint(rectPts(x0 + 70 + w * .36 + 30, y + 70 + i * (h - 60) / 3, w * .3, (h - 60) / 3 - 12, 2), { wash: wood, ink: PAL.ink, sw: .7 }); paint(rrPts(x0 + 70 + w * .36 + 30 + w * .15 - 22, y + 70 + i * (h - 60) / 3 + (h - 60) / 6 - 12, 44, 12, 5), { wash: PAL.ochre, ink: PAL.ink, sw: .5 }); }
  paint(rectPts(x0, y, w, 38, 1.5), { wash: wood, fill: mixCol(wood, PAL.cream, .3), fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
  inkLine([[x0 + 20, y + 12], [x0 + w * .4, y + 10], [x0 + w - 30, y + 13]], .4, mixCol(wood, PAL.ink, .4), 'inkfine', .5);
}
// Coffee mug at (x, y) = its base; o.steam 0..1, o.col, o.tilt (drinking), o.empty.
function mug(x, y, s = 1, o = {}) {
  boilSeed('mug ' + (o.key ?? x));
  push(); translate(x, y); rotate(o.tilt || 0);
  const col = o.col || PAL.cream;
  paint(ribbon([[24 * s, -48 * s], [46 * s, -40 * s], [44 * s, -18 * s], [22 * s, -14 * s]], 10 * s, 9 * s), { wash: col, ink: PAL.ink, sw: .8 * s });
  paint(rrPts(-26 * s, -62 * s, 52 * s, 62 * s, 8 * s), { wash: col, fill: mixCol(col, PAL.ink, .2), fillOp: 50, tex: .5, ink: PAL.ink, sw: .9 * s });
  paint(ellPts(0, -60 * s, 24 * s, 6 * s, 14), { wash: o.empty ? mixCol(col, PAL.ink, .3) : '#5B3A2A', ink: PAL.ink, sw: .6 * s });
  if (o.logo) paint(ellPts(0, -32 * s, 10 * s, 10 * s, 12), { wash: o.logo, ink: null });
  pop();
  if (o.steam > .02) for (let i = 0; i < 2; i++) {
    const ph = frac(T * .7 + i * .5), a = Math.sin(ph * Math.PI) * o.steam;
    if (a < .08) continue;
    inkLine([[x - 8 * s + i * 14 * s, y - 70 * s - ph * 60 * s], [x - 2 * s + i * 14 * s + 8 * s * Math.sin(ph * 7), y - 90 * s - ph * 60 * s], [x - 8 * s + i * 14 * s, y - 110 * s - ph * 60 * s]], 1.2 * s * a, mixCol(PAL.cream, '#FFFFFF', .5), 'dry', .6);
  }
}
// Desk lamp with its light pool. (x, y) = base on the desk; o.on 0..1, o.flip (head points left), o.big (spot).
function lamp(x, y, s = 1, o = {}) {
  boilSeed('lamp ' + x);
  const d = o.flip ? -1 : 1, on = o.on ?? 1, hx = x + d * 70 * s, hy = y - 190 * s;
  if (on > .02) glow(hx + d * 40 * s, hy + 90 * s, 300 * s * (o.big || 1), '#FFD58A', on * .9);
  paint(ellPts(x, y - 6 * s, 48 * s, 12 * s, 16), { wash: '#3B5B54', ink: PAL.ink, sw: .9 * s });
  inkLine([[x, y - 10 * s], [x - d * 20 * s, y - 110 * s], [hx - d * 10 * s, hy]], 6 * s, '#3B5B54', 'ink', .2);
  push(); translate(hx, hy); rotate(d * .55);
  paint([[-46 * s, 40 * s], [46 * s, 40 * s], [22 * s, -26 * s], [-22 * s, -26 * s]], { wash: '#3F7A6E', fill: '#2B5A51', fillOp: 70, tex: .5, ink: PAL.ink, sw: .9 * s });
  if (on > .02) paint(ellPts(0, 40 * s, 40 * s, 8 * s, 12), { wash: '#FFF0C2', washOp: 255 * on, ink: null });
  pop();
}

// ---------- thought bubble ----------
// A daydream bubble: (x, y) centre, rx/ry radii, k = 0..1 bloom; trail toward (tx, ty). The content is drawn by
// the caller INSIDE the ellipse (dream scenes are built to fit it); the bubble's cloudy rim covers the edges.
function bubbleRim(x, y, rx, ry, k = 1, o = {}) {
  if (k < .02) return;
  boilSeed('bubble ' + (o.key || 0));
  const q = backOut(k), RX = rx * q, RY = ry * q, n = 26, col = o.col || PAL.cream;
  const ring = []; for (let i = 0; i <= n; i++) { const a = i / n * TAU; ring.push([x + Math.cos(a) * RX * 1.02, y + Math.sin(a) * RY * 1.02]); }
  for (let i = 0; i < n; i++) {
    const a = (i + .5) / n * TAU, bx = x + Math.cos(a) * RX * 1.04, by = y + Math.sin(a) * RY * 1.04, r = (RX + RY) * .085 * (1 + .25 * hash(i * 3.7));
    paint(ellPts(bx, by, r, r * .85, 12, 1.5), { wash: col, ink: PAL.ink, sw: .7 });
  }
  paint(ribbon(ring, 18 * q, 18 * q), { wash: col, ink: null });
  if (o.tx != null) for (let i = 0; i < 3; i++) {
    const k2 = (i + 1) / 4, px = lerp(x + (o.tx - x) * .55, o.tx, k2), py = lerp(y + RY * .9, o.ty, k2), r = (26 - i * 7) * q;
    paint(ellPts(px, py, r, r * .85, 12, 1), { wash: col, ink: PAL.ink, sw: .7 });
  }
}
// Points of an ellipse arc, clipped to y >= cut (for building dream content inside a bubble).
function ellBelow(cx, cy, rx, ry, cut, n = 40) {
  const pts = []; for (let i = 0; i <= n; i++) { const a = i / n * TAU, px = cx + Math.cos(a) * rx, py = cy + Math.sin(a) * ry; if (py >= cut) pts.push([px, py]); }
  const dx = Math.sqrt(Math.max(0, 1 - ((cut - cy) / ry) ** 2)) * rx; pts.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
  return [[cx + dx, cut], ...pts.filter(p => p[1] > cut), [cx - dx, cut]];
}

// ---------- outdoors ----------
// A pine tree silhouette (painted), for far shores, forests and parks.
function pine(x, y, h, col, o = {}) {
  const w = h * .42, P = [];
  for (let i = 0; i <= 4; i++) { const k = i / 4, yy = y - h * (.15 + .85 * k), ww = w * (1 - k) + 2; P.push([x - ww, yy + h * .08]); P.push([x - ww * .45, yy]); }
  const R = P.map(([a, b]) => [2 * x - a, b]).reverse();
  paint([[x - 3, y], ...P, [x, y - h - 4], ...R, [x + 3, y]], { wash: col, ink: o.ink ?? null, sw: .5 });
}
// The canoe, (x, y) = waterline centre, s ≈ 1 is 260px long.
function canoe(x, y, s = 1, o = {}) {
  boilSeed('canoe ' + (o.key || x));
  push(); translate(x, y + Math.sin(T * 1.6) * 3 * s); rotate(Math.sin(T * 1.3) * .02);
  paint([[-130 * s, -30 * s], [-100 * s, 0], [100 * s, 0], [130 * s, -30 * s], [0, -18 * s]], { wash: o.col || '#C8553D', fill: '#8E3A2A', fillOp: 70, tex: .5, ink: PAL.ink, sw: 1 * s, curv: .4 });
  inkLine([[-120 * s, -24 * s], [0, -14 * s], [120 * s, -24 * s]], .6 * s, PAL.cream, 'inkfine', .5);
  pop();
}

// ---------- the city ----------
// A painted skyline along a baseline y; o.lights 0..1 (lit windows), o.snow, o.tower (a needle tower at 72%).
function skyline(x0, y, w, o = {}) {
  boilSeed('skyline ' + x0);
  const col = o.col || '#4A4F78', n = o.n || 14, sc = o.sc || 1;
  push(); translate(x0, y); scale(sc); translate(-x0, -y); w /= sc;
  for (let i = 0; i < n; i++) {
    const bx = x0 + i * w / n + (hash(i * 2) - .5) * 20, bw = w / n * (.7 + .4 * hash(i * 5)), bh = 120 + 260 * hash(i * 9.3);
    paint(rectPts(bx, y - bh, bw, bh + 4, 1), { wash: mixCol(col, PAL.ink, hash(i) * .25), ink: null });
    if (o.snow) paint(rectPts(bx - 2, y - bh - 6, bw + 4, 10, 1), { wash: PAL.cream, ink: null });
    if (o.lights > .02) for (let r = 0; r < Math.floor(bh / 34); r++) for (let c = 0; c < Math.floor(bw / 22); c++) {
      if (hash(i * 31 + r * 7 + c * 3) > o.lights) continue;
      paint(rectPts(bx + 6 + c * 22, y - bh + 14 + r * 34, 9, 13), { wash: '#FFD98A', ink: null });
    }
  }
  if (!o.tower) { pop(); return; }
  const tx = x0 + w * .72;
  paint([[tx - 16, y], [tx - 6, y - 420], [tx + 6, y - 420], [tx + 16, y]], { wash: mixCol(col, PAL.ink, .15), ink: null });
  paint(ellPts(tx, y - 400, 34, 16, 14), { wash: mixCol(col, PAL.ink, .2), ink: null });
  paint([[tx - 3, y - 420], [tx, y - 560], [tx + 3, y - 420]], { wash: mixCol(col, PAL.ink, .15), ink: null });
  if (o.lights > .02) paint(ellPts(tx, y - 560, 4, 4, 6), { wash: PAL.tomato, ink: null });
  pop();
}

// ---------- stage ----------
// Stage curtains. open 0..1 (0 = closed across the frame). o.title paints the song title on the closed curtain.
function curtains(t, open, o = {}) {
  boilSeed('curtains');
  const red = '#B8323F', redDk = '#7E1E2C', gold = PAL.gold, half = W / 2 * (1 - ease(open) * .86 - (o.extra || 0));
  for (const sd of [-1, 1]) {
    const edge = sd < 0 ? half : W - half, x0 = sd < 0 ? -40 : edge, x1 = sd < 0 ? edge : W + 40;
    paint(rectPts(x0, -40, x1 - x0, H + 80), { wash: red, fill: redDk, fillOp: 90, tex: .6, ink: null });
    const folds = Math.max(2, Math.round((x1 - x0) / 90));
    for (let i = 1; i < folds; i++) { const fx = lerp(x0, x1, i / folds) + Math.sin(T * 1.5 + i) * 3; inkLine([[fx, -30], [fx + 6, H * .5], [fx - 4, H + 30]], 2.2, redDk, 'dry', .5); }
    paint(rectPts(sd < 0 ? edge - 26 : edge, -40, 26, H + 80), { wash: redDk, ink: null });
  }
  // valance with gold fringe
  if (o.noValance) { if (o.title > .02) titleCard(t, o.title, o.titleY ?? 470); return; }
  paint(rectPts(-40, -20, W + 80, 120), { wash: red, fill: redDk, fillOp: 90, tex: .6, ink: PAL.ink, sw: 1.2 });
  for (let i = 0; i < 24; i++) paint(ellPts(40 + i * 80, 100, 42, 26, 12), { wash: red, ink: PAL.ink, sw: .8 });
  inkLine([[-20, 112], [W / 2, 118], [W + 20, 112]], 5, gold, 'ink', .5);
  if (o.title > .02) titleCard(t, o.title, o.titleY ?? 470);
}
// The title, painted onto the curtain (lettering is fine here: it's the one place the name of the song appears).
function titleCard(t, k, y = 470) {
  const a = clamp(k);
  letter(PROJECT.title, W / 2, y, 150, PAL.gold, { alpha: a, rot: -.03, stroke: '#5A1420' });
}
// Proscenium + boards + footlights, for stage shots.
function theatreFrame(t, o = {}) {
  boilSeed('proscenium');
  paint(rectPts(-40, 860, W + 80, 260), { wash: '#7A4A30', fill: '#5A3420', fillOp: 70, tex: .6, ink: null });
  for (let i = 0; i < 12; i++) inkLine([[i * 170, 862], [i * 170 - 120, 1080]], .7, '#4A2A18', 'inkfine', 0);
  for (let i = 0; i < 9; i++) { const fx = 120 + i * 210; glow(fx, 870, 90, '#FFD58A', o.foot ?? .6); paint(ellPts(fx, 872, 26, 9, 10), { wash: '#FFE9B0', ink: PAL.ink, sw: .5 }); }
}

// ---------- clocks ----------
// A story clock is a strong device for songs about time (a long day, waiting, a deadline): drive every clock prop from
// one function of song time so they always agree, e.g. const storyHour = t => kf(t, [[0, 9], [40, 17], [41, 9]]).
// A clock face at (x, y), radius r, showing hour h. Hands are painted strokes; the hour hand is short and fat.
function clockFace(x, y, r, h, o = {}) {
  boilSeed('clock ' + (o.key || x + ',' + y));
  if (o.glowK) glow(x, y, r * 2.2, o.glowCol || PAL.gold, o.glowK);
  paint(ellPts(x, y, r * 1.08, r * 1.08, 28, r * .02), { wash: o.rim || PAL.ink, ink: null });
  paint(ellPts(x, y, r, r, 28, r * .015), { wash: o.face || PAL.cream, fill: o.shade || PAL.manila, fillOp: 70, bleed: .1, tex: .5, ink: PAL.ink, sw: clamp(r / 60, .5, 1.6) });
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU, r0 = r * (i % 3 ? .82 : .74), r1 = r * .9;
    inkLine([[x + Math.sin(a) * r0, y - Math.cos(a) * r0], [x + Math.sin(a) * r1, y - Math.cos(a) * r1]], clamp(r / 50, .4, 1.6) * (i % 3 ? .6 : 1.1), PAL.ink, 'inkfine', 0);
  }
  const hand = (ang, len, w) => paint(ribbon([[x, y], [x + Math.sin(ang) * len * .5, y - Math.cos(ang) * len * .5], [x + Math.sin(ang) * len, y - Math.cos(ang) * len]], w, w * .35), { wash: PAL.ink, ink: null });
  const hh = ((h % 12) + 12) % 12;
  hand(hh / 12 * TAU, r * .5, r * .13);
  hand(frac(h) * TAU, r * .78, r * .08);
  paint(ellPts(x, y, r * .09, r * .09, 10), { wash: o.pin || PAL.tomato, ink: PAL.ink, sw: .5 });
}

// ---------- confetti and leaves ----------
// Falling confetti, a pure function of t: n pieces from time t0, colours from cols, painted leaves when o.leaves.
function confetti(t, t0, n, cols, o = {}) {
  if (t < t0) return;
  boilSeed('confetti ' + t0);
  const age = t - t0, x0 = o.x0 ?? 0, x1 = o.x1 ?? W;
  for (let i = 0; i < n; i++) {
    const delay = hash(i * 1.37) * (o.spread ?? 2), a = age - delay; if (a < 0) continue;
    const x = lerp(x0, x1, hash(i * 7.7)) + Math.sin(a * 2 + i) * 40, y = (o.y0 ?? -40) + a * (140 + 90 * hash(i * 3.3)); if (y > H + 40) continue;
    const c = cols[i % cols.length], r = a * 3 + i;
    if (o.leaves && i % 2 === 0) leafShape(x, y, 18 + 8 * hash(i), r, c);
    else { push(); translate(x, y); rotate(r); scale(1, Math.abs(Math.sin(a * 5 + i))); paint(rectPts(-9, -5, 18, 10), { wash: c, ink: null }); pop(); }
  }
}
function leafShape(x, y, s, rot, col) {   // a five-point leaf
  const P = [[0, -1], [.22, -.55], [.5, -.7], [.42, -.3], [.85, -.35], [.55, 0], [.62, .18], [.12, .12], [.1, .55], [-.1, .55], [-.12, .12], [-.62, .18], [-.55, 0], [-.85, -.35], [-.42, -.3], [-.5, -.7], [-.22, -.55]];
  push(); translate(x, y); rotate(rot);
  paint(P.map(([a, b]) => [a * s, b * s]), { wash: col, ink: PAL.ink, sw: .4 });
  pop();
}
// A painted spotlight cone from (x, top) widening to w at the floor y; k = brightness.
function spotCone(x, top, y, w, k = 1, col = '#FFF1C8') {
  if (k < .02) return;
  boilSeed('spot ' + x);
  paint([[x - 40, top], [x + 40, top], [x + w / 2, y], [x - w / 2, y]], { fill: col, fillOp: 70 * k, bleed: .15, tex: .2, border: .1, ink: null });
  glow(x, y - 60, w * .7, col, .55 * k);
  paint(ellPts(x, y, w * .55, 34, 22), { fill: col, fillOp: 120 * k, bleed: .2, ink: null });
}

// ---------- small things ----------
function phoneProp(x, y, s = 1, o = {}) {   // a phone, centre (x, y); o.screen(x, y, w, h) paints the screen
  boilSeed('phone ' + (o.key || 0));
  push(); translate(x, y); rotate(o.rot || 0);
  paint(rrPts(-34 * s, -62 * s, 68 * s, 124 * s, 12 * s), { wash: '#2B2838', ink: PAL.ink, sw: .9 * s });
  paint(rrPts(-28 * s, -54 * s, 56 * s, 108 * s, 6 * s), { wash: o.screenCol || '#BFE3FF', ink: null });
  if (o.screen) o.screen(0, 0, 56 * s, 108 * s);
  pop();
}
