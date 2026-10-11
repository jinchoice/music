// timeline.js: the shot list, standalone loops and a brush-wipe transition (from ClaudeAnimationBase, MIT), plus the
// karaoke band and re-cut playback for music videos.
//
// shots([[t0, fn], [t1, fn], ...]) registers shots in time order. Each fn(t, lt, dur) is called with t = song time,
// lt = time since the shot started, dur = the shot's length. It paints the WHOLE frame, background included, and must be
// a pure function of t: frames render in parallel and out of order, so nothing may carry over from one frame to the next.
// Chapter files can call shots() as many times as they like; the list is kept sorted.

const SHOTS = [];
function shots(list) { SHOTS.push(...list); SHOTS.sort((a, b) => a[0] - b[0]); }

// Standalone loops (model sheets, reference images, tests), outside the main timeline: window.LOOP = LOOPS[name] swaps
// the whole frame for that function, called with loop time. Give each a length: LOOPS.x = t => { ... }; LOOPS.x.len = 4;
const LOOPS = {};

// Hooks a project can set (all optional):
//   AFTER_SHOT(t)  runs after every shot, in screen space (a corner prop that lives across shots, a logo bug)
//   KARAOKE_STYLE(t) → { band, fill, text, sung } colours for the lyric band at song time t (a palette arc)
let AFTER_SHOT = null, KARAOKE_STYLE = null;

function drawWorld(t) {
  if (window.LOOP) window.LOOP(t);
  else if (!SHOTS.length) placeholder(t);
  else {
    // a re-cut edition plays the moment of the original film that the remap assigns to this moment of the new song
    const r = typeof RECUT !== 'undefined' && EDITION !== 'main' ? remapAt(RECUT, t) : null;
    REMAP_NOW = r ? { o: r.o, n: t, k: r.k } : null;
    const to = r ? r.o : t;
    let i = 0; while (i + 1 < SHOTS.length && to >= SHOTS[i + 1][0]) i++;
    const t0 = SHOTS[i][0], end = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : (typeof ORIGINAL_DURATION !== 'undefined' ? ORIGINAL_DURATION : DUR);
    SHOTS[i][1](to, to - t0, end - t0);
    CAM = null;
    flushLetters();
    if (AFTER_SHOT) AFTER_SHOT(to);
    karaokeBand(t, r && typeof RECUT_LY !== 'undefined' ? RECUT_LY : (typeof LY !== 'undefined' ? LY : null));
  }
  flushLetters();
}

// The remap for a re-cut: the original time for new time t, and the local speed k (original s per new s).
// R = [[newStart, newEnd, [[newT, originalT], ...]], ...]: pieces join with cuts; inside a piece, anchors are linear.
function remapAt(R, t) {
  let i = 0; while (i + 1 < R.length && t >= R[i + 1][0]) i++;
  const A = R[i][2]; let j = 0; while (j + 2 < A.length && t >= A[j + 1][0]) j++;
  const [n0, o0] = A[j], [n1, o1] = A[j + 1], k = (o1 - o0) / Math.max(1e-6, n1 - n0);
  return { o: o0 + (t - n0) * k, k };
}

function placeholder(t) {
  paint(ellPts(960, 520, 520, 300, 30, 20), { fill: PAL.sky, fillOp: 90, bleed: .3, ink: null });
  clawd(960, 820, 20, feel('happy', t));
}

// ---------- lyric timing ----------
// Key shots and events to the sung words instead of typing seconds, so a re-aligned lyric file moves them with it:
//   lineT(i) / lineEnd(i): start / end of karaoke line i (0-based, in lyrics.txt order)
//   wordT(i, k): start of line i's k-th word; wordAt(i, 'free'): start of the first word in line i that contains 'free'
const _ly = i => { if (typeof LY === 'undefined' || !LY[i]) throw new Error('no lyric line ' + i); return LY[i]; };
const lineT = i => _ly(i)[0], lineEnd = i => _ly(i)[1];
const wordT = (i, k) => { const w = _ly(i)[3]; return w[Math.max(0, Math.min(k, w.length - 1))]; };
const wordAt = (i, txt) => { const L = _ly(i), ws = L[2].toLowerCase().split(' '), k = ws.findIndex(w => w.includes(txt.toLowerCase())); return k < 0 ? L[0] : L[3][k]; };

// ---------- brush wipe ----------
// A transition: fat paint strokes sweep across to cover the frame (p 0 → .5), then drag off (p .5 → 1).
// Cut to the next shot at p = .5, under full cover. Call it last in both shots, in screen space (outside a camera):
//   end of shot A:   if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6);
//   start of shot B: if (lt < .3) brushWipe(.5 + lt / .6);
function brushWipe(p, cols = [PAL.clayDk, PAL.clay]) {
  if (p <= 0 || p >= 1) return;
  const [c1, c2] = cols, n = 5, bh = (H + 420) / n + 40;
  push(); translate(W / 2, H / 2); rotate(-.1); translate(-W / 2, -H / 2);
  for (let i = 0; i < n; i++) {
    boilSeed('wipe ' + i);
    const y0 = -230 + i * (H + 420) / n, d = [0, .14, .06, .18, .1][i];
    const q = p < .5 ? easeOut(clamp((p * 2 - d) / (1 - d))) : ease(clamp(((p - .5) * 2 - d) / (1 - d)));
    const x0 = p < .5 ? -300 : lerp(-300, W + 400, q), x1 = p < .5 ? lerp(-300, W + 400, q) : W + 400;
    if (x1 - x0 < 30) continue;
    const pts = [], rag = k => 40 + 50 * hash(i * 31 + k) + jit(12);
    for (let k = 0; k <= 8; k++) pts.push([lerp(x0, x1, k / 8), y0 + Math.sin(k * .9 + i) * 14 + jit(5)]);
    for (let k = 1; k < 9; k++) pts.push([x1 + rag(k) - 40, y0 + bh * k / 9]);
    for (let k = 8; k >= 0; k--) pts.push([lerp(x0, x1, k / 8), y0 + bh + Math.sin(k * .8 + i * 2) * 14 + jit(5)]);
    if (p >= .5) for (let k = 8; k > 0; k--) pts.push([x0 - rag(k + 20) + 40, y0 + bh * k / 9]);
    paint(pts, { wash: i % 2 ? c1 : c2, washOp: 255, fill: i % 2 ? c2 : c1, fillOp: 70, bleed: .05, tex: .8, border: .6, ink: null,
      hatch: { d: 44, a: 0, o: { rand: .6, gradient: .5 }, b: 'charcoal', c: i % 2 ? c2 : PAL.cream, w: .8 } });
  }
  pop();
}

// ---------- karaoke ----------
// The sung line in a painted band along the bottom (y 975–1070); each word turns gold as it's sung (LY word times from
// scripts/align_lyrics.py: [start, end, text, [start time of each word]]). Keep faces and key action above y ≈ 960
// while a line is showing. Lines longer than ~60 characters overflow: split them in lyrics.txt.
let KARAOKE = null;
const KFONT = '800 46px "Shantell Sans", "Comic Sans MS", sans-serif';
const kStyle = t => ({ band: PAL.ink, fill: PAL.indigo, text: PAL.cream, sung: '#F6CE3C', ...(KARAOKE_STYLE ? KARAOKE_STYLE(t) : {}) });
function karaokeBand(t, lines) {
  KARAOKE = null;
  if (window.NO_KARAOKE) return;
  const L = lines && lines.find(l => t >= l[0] - .1 && t < l[1] + .25); if (!L) return;
  const [a, b, txt, wt] = L;
  outX.font = KFONT;
  const tw = outX.measureText(txt).width, grow = easeOut(seg(t, a - .1, a + .1)) * (1 - ease(seg(t, b + .1, b + .25)));
  if (grow < .02) return;
  const st = kStyle(REMAP_NOW ? REMAP_NOW.o : t), w = (tw + 100) * grow, x0 = 960 - w / 2, y0 = 980;
  boilSeed('karaoke ' + a);
  const pts = [[x0 + jit(6), y0 + jit(3)], [x0 + w / 2, y0 - 4 + jit(3)], [x0 + w + jit(6), y0 + jit(3)], [x0 + w + 14 + jit(6), y0 + 42],
               [x0 + w + jit(6), y0 + 84 + jit(3)], [x0 + w / 2, y0 + 88 + jit(3)], [x0 + jit(6), y0 + 84 + jit(3)], [x0 - 14 + jit(6), y0 + 42]];
  paint(pts, { wash: st.band, washOp: 222, fill: st.fill, fillOp: 70, tex: .7, border: .4, ink: null });
  KARAOKE = { a, b, txt, wt, grow, st };
}
// The words themselves, drawn on the 2D compositor (crisp, under the paper grain), with a per-word sweep.
window.overlayText = (c, t) => {
  const K = KARAOKE; if (!K || K.grow < .85) return;
  c.save(); c.font = KFONT; c.textBaseline = 'middle'; c.textAlign = 'left';
  const words = K.txt.split(' '), sp = c.measureText(' ').width, ws = words.map(w => c.measureText(w).width);
  const total = ws.reduce((p, q) => p + q, 0) + sp * (words.length - 1);
  let x = 960 - total / 2; const y = 1024;
  words.forEach((w, i) => {
    const s0 = K.wt[i] ?? K.a, s1 = Math.min(K.wt[i + 1] ?? (s0 + .45), s0 + .55), f = clamp((t - s0) / Math.max(.08, s1 - s0));
    c.fillStyle = 'rgba(20,12,30,.55)'; c.fillText(w, x + 2, y + 3);
    c.fillStyle = K.st.text; c.fillText(w, x, y);
    if (f > 0) { c.save(); c.beginPath(); c.rect(x - 2, y - 40, ws[i] * f + 4, 80); c.clip(); c.fillStyle = K.st.sung; c.fillText(w, x, y); c.restore(); }
    x += ws[i] + sp;
  });
  c.restore();
};
