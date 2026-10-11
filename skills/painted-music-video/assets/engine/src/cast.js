// cast.js: the humans. Painted like everything else: flat wash + ink.
//
// person(x, y, s, o): a small chibi human. (x, y) is the ground point between the feet; s is the unit (about 13.5s tall,
// head 5s wide). The look comes from LOOKS (o.look = a key of LOOKS), and o.style overrides any of its fields. Replace
// the example looks with the song's cast: one entry per character, designed in the storyboard's Cast section.
//   Local coordinates: feet y 0, hips -3.3s, shoulders (±1.9s, -7.2s), head centre (0, -10.3s), eyes (±.92s, -10.05s),
//   mouth (0, -8.95s). Arms use Clawd's convention: aL/aR 0 = straight out sideways, + = up, about -1.3 = hanging;
//   bendL/bendR bend the elbow (+ lifts the forearm). Hooks: holdL/holdR(s, sw) draw upright at the hand (mugs,
//   phones, stamps), handL/handR(s, sw) draw along the forearm. draw(s, sw) paints in body space, on top.
//   Pose: dx, dy (in s), sq, rot, flip, walk (phase), sit, back (seen from behind), lean.
//   Face: eyes (Clawd's eye names, mapped to human eyes), mouth (Clawd's mouths), lookX/lookY, squint, blush, gloom,
//   brows ('worried' | 'angry' | 'up' | 'flat'), bags 0..1 (eye bags), frizz 0..1 (hair standing up), emote/emoteK/emoteAge.
// It returns world positions { hL, hR, head, top } so props and other characters can meet the hands.
// emotions()/feel() from clawd.js spread straight in; their arm angles are mapped to human arms (personArms).

// Look fields: skin, hair, hairStyle ('mop' | 'swoop' | 'slick' | 'bald' | 'bun' | 'short'), top/topDk (jacket or top),
// shirt, pants, shoes, outfit ('cardigan' | 'hoodie' | 'suit' (+ tie colour) | 'vest' | 'trench' | 'overalls' | none),
// glasses ('round' | 'reading'), mustache, lanyard (an ID badge), pen (behind the ear).
const LOOKS = {
  lead:    { skin: '#F2C4A0', hair: '#4A3245', hairStyle: 'mop', top: '#8F8B9E', topDk: '#6E6A80', shirt: '#FBF4E6', pants: '#3D4A7A', shoes: '#2B2233',
             glasses: 'round', outfit: 'cardigan' },
  hoodie:  { skin: '#D69A70', hair: '#2A2030', hairStyle: 'swoop', top: '#E08A4E', topDk: '#B4643A', shirt: '#B9B4C6', pants: '#33395E', shoes: '#F1ECE0',
             outfit: 'hoodie' },
  suit:    { skin: '#F0C6A6', hair: '#4B2E22', hairStyle: 'slick', top: '#2F3C7A', topDk: '#222B5A', shirt: '#FBF4E6', pants: '#2F3C7A', shoes: '#1E1A26',
             outfit: 'suit', tie: '#D8394E' },
  vest:    { skin: '#E8B894', hair: '#B9B1B4', hairStyle: 'bald', top: '#6E9F58', topDk: '#527A40', shirt: '#B8CDE6', pants: '#B59A6E', shoes: '#6B4630',
             glasses: 'reading', outfit: 'vest', mustache: true },
  trench:  { skin: '#C98E66', hair: '#2E2420', hairStyle: 'short', top: '#B58A5E', topDk: '#8E6844', shirt: '#F3EBDC', pants: '#4A4458', shoes: '#2B2233',
             outfit: 'trench' },
  overalls:{ skin: '#B97B57', hair: '#3A2B38', hairStyle: 'bun', top: '#3A9C98', topDk: '#2A7472', shirt: '#F3EBDC', pants: '#3A9C98', shoes: '#2B2233',
             outfit: 'overalls' },
};
// A look that changes across the song (the lead's arc: tired → rested), as a function of song time, e.g.
//   const leadLook = (t, over = {}) => ({ look: 'lead', bags: t < 90 ? clamp(seg(t, 5, 90)) : 0, frizz: t < 90 ? .6 * seg(t, 20, 90) : 0,
//                                         style: t > 90 ? { top: '#A08ACB', topDk: '#7C66AA' } : {}, ...over });
// and spread it into every person() call for that character: person(x, y, s, { ...leadLook(t), ...feel('happy', t) }).

// Clawd's arm angles (0 = out, small nubs) → human arms (hanging at rest).
function personArms(a) { if (a == null) return null; return clamp(a < .15 ? -1.25 + (a - .15) * .3 : -1.25 + (a - .15) * 1.05, -1.45, 1.7); }

let PERSON_N = 0;
function person(x, y, s, o = {}) {
  const L = { ...(LOOKS[o.look] || LOOKS.lead), ...(o.style || {}) };
  const id = o.boilKey ?? ('p' + (++PERSON_N)), rs = part => boilSeed(`person ${id} ${part}`);
  const sw = clamp(s / 19, .4, 1.7) * (o.swMul || 1), J = s * .022;
  const sq = (o.sq || 0), fx = (o.flip ? -1 : 1) * (1 + sq * .5) * (o.sx ?? 1), fy = (1 - sq) * (o.sy ?? 1);
  const X = x + (o.dx || 0) * s, Y = y + (o.dy || 0) * s, R = o.rot || 0, cr = Math.cos(R), sr = Math.sin(R);
  const toW = (lx, ly) => [X + (lx * fx) * cr - (ly * fy) * sr, Y + (lx * fx) * sr + (ly * fy) * cr];
  const P = pts => pts.map(([a, b]) => [a * s, b * s]);
  const skin = tintSkin(L.skin, o), dark = '#4A1F2A';

  rs('shadow');
  if (!o.noShadow && !o.sit) {
    const f = 1 - Math.min(.5, Math.abs(Math.min(0, o.dy || 0)) * .08);
    paint(ellPts(x + (o.dx || 0) * s, y + s * .12, s * 2.9 * f, s * .55 * f, 18), { fill: PAL.ink, fillOp: 80, bleed: .2, tex: .3, border: .1, ink: null });
  }

  // arm angles: explicit, or from an emotion (mapped), or hanging; walking swings them. gripL/gripR = [x, y] in WORLD
  // space (or reachL/reachR in body units) solve the arm so the hand lands there.
  let aL = o.aLp ?? personArms(o.aL) ?? -1.28, aR = o.aRp ?? personArms(o.aR) ?? -1.28;
  if (o.walk != null && o.aL == null && o.aLp == null) { const w = Math.sin(o.walk * TAU) * .35; aL = -1.28 + w; aR = -1.28 - w; }
  let bendL = o.bendL ?? -.2, bendR = o.bendR ?? -.2;
  const toL = (wx, wy) => { const dx = wx - X, dy = wy - Y, lx = dx * cr + dy * sr, ly = -dx * sr + dy * cr; return [lx / fx / s, ly / fy / s]; };
  for (const side of [-1, 1]) {
    const g = side < 0 ? (o.gripL ? toL(...o.gripL) : o.reachL) : (o.gripR ? toL(...o.gripR) : o.reachR);
    if (!g) continue;
    const k = side < 0 ? (o.gripLk ?? 1) : (o.gripRk ?? 1), sol = reachArm(side, g[0], g[1], side < 0 ? o.elbowL : o.elbowR);
    if (side < 0) { aL = lerp(aL, sol.a, k); bendL = lerp(bendL, sol.bend, k); } else { aR = lerp(aR, sol.a, k); bendR = lerp(bendR, sol.bend, k); }
  }
  const shoulder = side => [side * 1.85 * s, -7.05 * s];
  const armGeo = (side, a, bend) => {
    const [sx0, sy0] = shoulder(side), u1 = 1.85 * s, u2 = 1.75 * s;
    const ex = sx0 + side * Math.cos(a) * u1, ey = sy0 - Math.sin(a) * u1;
    const a2 = a + bend, hx = ex + side * Math.cos(a2) * u2, hy = ey - Math.sin(a2) * u2;
    return { sx0, sy0, ex, ey, hx, hy, ang: Math.atan2(-Math.sin(a2), side * Math.cos(a2)) };
  };
  const gL = armGeo(-1, aL, bendL), gR = armGeo(1, aR, bendR);

  push();
  translate(X, Y); if (R) rotate(R); scale(fx, fy);

  // legs
  if (!o.noLegs) {
    for (const side of [-1, 1]) {
      rs('leg' + side);
      let a = 0, h = o.sit ? 2.3 : 3.35;
      if (o.walk != null) a = Math.sin((o.walk + (side > 0 ? .5 : 0)) * TAU) * .42;
      if (o.kick && Math.sign(o.kick) === side) a = -side * 1.25 * Math.abs(o.kick);   // a kickline kick, out to the side
      if (o.run != null) a = Math.sin((o.run + (side > 0 ? .5 : 0)) * TAU) * .7;
      push(); translate(side * .62 * s, -3.3 * s); rotate(a);
      paint(rrPts(-.47 * s, 0, .94 * s, h * s, .3 * s, J * .6), { wash: L.pants, fill: mixCol(L.pants, PAL.ink, .3), fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .7 });
      paint(ellPts(side * .18 * s, h * s - .1 * s, .7 * s, .36 * s, 14), { wash: L.shoes, ink: PAL.ink, sw: sw * .6 });
      pop();
    }
  }

  // hood behind the neck (hoodie)
  if (L.outfit === 'hoodie' && !o.back) { rs('hood'); paint(ellPts(0, -7.5 * s, 2.0 * s, .9 * s, 16, J), { wash: L.shirt, ink: PAL.ink, sw: sw * .7 }); }

  // torso
  rs('torso');
  const TOR = P([[-1.95, -7.35], [-1.15, -7.75], [0, -7.85], [1.15, -7.75], [1.95, -7.35], [2.1, -6.3], [1.8, -4.5], [2.05, -3.0], [0, -2.85], [-2.05, -3.0], [-1.8, -4.5], [-2.1, -6.3]]);
  if (L.outfit === 'overalls') {
    paint(TOR, { wash: L.shirt, ink: null });
    paint(P([[-1.9, -5.6], [1.9, -5.6], [2.05, -3.0], [0, -2.85], [-2.05, -3.0]]), { wash: L.top, fill: L.topDk, fillOp: 60, tex: .5, ink: null });
    paint(P([[-1.2, -5.6], [1.2, -5.6], [1.1, -6.6], [-1.1, -6.6]]), { wash: L.top, ink: PAL.ink, sw: sw * .5 });
    for (const sd of [-1, 1]) inkLine(P([[sd * 1.1, -6.5], [sd * 1.5, -7.6]]), sw * 1.1, L.topDk, 'ink', 0);
  } else {
    paint(TOR, { wash: L.top, fill: L.topDk, fillOp: 70, bleed: .05, tex: .55, border: .5, ink: null });
  }
  if (!o.back) {
    if (L.outfit === 'cardigan' || L.outfit === 'suit' || L.outfit === 'hoodie' || L.outfit === 'trench') {
      // the open front: shirt V (or hoodie front) between two lapel edges
      const V = L.outfit === 'cardigan' ? P([[-.95, -7.8], [.95, -7.8], [.55, -4.9], [0, -2.9], [-.55, -4.9]]) : P([[-.9, -7.8], [.9, -7.8], [0, -5.4]]);
      paint(V, { wash: L.shirt, ink: null });
      if (L.outfit === 'hoodie') { for (const sd of [-1, 1]) inkLine(P([[sd * .35, -7.4], [sd * .4, -6.2]]), sw * .5, PAL.cream, 'inkfine', 0); paint(P([[-.9, -5.4], [.9, -5.4], [.75, -3.0], [-.75, -3.0]]), { wash: L.shirt, ink: null }); }
      if (L.outfit === 'suit') {
        paint(P([[-.16, -7.7], [.16, -7.7], [.3, -5.8], [0, -5.2], [-.3, -5.8]]), { wash: L.tie, ink: PAL.ink, sw: sw * .4 });
        for (let i = 0; i < 6; i++) { const px = -1.75 + i * .7; if (Math.abs(px) < .8) continue; inkLine(P([[px, -7.3], [px * .96, -3.1]]), sw * .3, mixCol(L.top, PAL.cream, .45), 'inkfine', 0); }
      }
      if (L.outfit === 'trench') { paint(P([[-2.0, -4.6], [2.0, -4.6], [2.0, -4.15], [-2.0, -4.15]]), { wash: L.topDk, ink: PAL.ink, sw: sw * .4 }); }
      for (const sd of [-1, 1]) inkLine(P([[sd * .95, -7.75], [sd * .55, -4.9], [sd * .05, -2.95]]), sw * .55, PAL.ink, 'inkfine', .4);
      if (L.outfit === 'cardigan') for (const by of [-4.4, -3.6]) paint(ellPts(.62 * s, by * s, .14 * s, .14 * s, 8), { wash: L.topDk, ink: null });
    } else if (L.outfit === 'vest') {
      paint(P([[-.95, -7.8], [.95, -7.8], [0, -5.6]]), { wash: L.shirt, ink: null });
      inkLine(P([[-.95, -7.75], [0, -5.6], [.95, -7.75]]), sw * .55, PAL.ink, 'inkfine', 0);
      for (let i = 0; i < 4; i++) inkLine(P([[-1.6, -4.9 + i * .45], [1.6, -4.9 + i * .45]]), sw * .3, mixCol(L.top, PAL.ink, .25), 'inkfine', 0);
    }
    if (L.lanyard) {
      rs('lanyard');
      inkLine(P([[-.75, -7.7], [-.2, -5.6], [0, -5.2]]), sw * .8, PAL.teal, 'inkfine', .3);
      inkLine(P([[.75, -7.7], [.2, -5.6], [0, -5.2]]), sw * .8, PAL.teal, 'inkfine', .3);
      paint(rrPts(-.48 * s, -5.25 * s, .96 * s, 1.15 * s, .12 * s), { wash: PAL.cream, ink: PAL.ink, sw: sw * .45 });
      paint(rectPts(-.3 * s, -5.05 * s, .32 * s, .38 * s), { wash: L.hair, ink: null });
      inkLine(P([[.1, -4.85], [.35, -4.85]]), sw * .3, PAL.ink, 'inkfine', 0);
    }
  }
  paint(TOR, { ink: PAL.ink, sw: sw * .85 });

  // neck + head
  rs('head');
  if (!o.back) paint(rectPts(-.45 * s, -8.25 * s, .9 * s, .7 * s), { wash: skin, ink: null });
  const head = ellPts(0, -10.3 * s, 2.45 * s, 2.35 * s, 26, J * .5);
  for (const sd of [-1, 1]) paint(ellPts(sd * 2.38 * s, -10.05 * s, .42 * s, .52 * s, 12), { wash: skin, ink: PAL.ink, sw: sw * .55 });
  paint(head, { wash: skin, fill: mixCol(skin, PAL.rose, .35), fillOp: 40, bleed: .1, tex: .4, ink: PAL.ink, sw: sw * .85 });
  if (!o.back) {
    rs('face');
    if (o.blush) for (const sd of [-1, 1]) paint(ellPts(sd * 1.62 * s, -9.25 * s, .48 * s, .26 * s, 12), { fill: PAL.rose, fillOp: 170 * clamp(o.blush === true ? 1 : o.blush), bleed: .2, ink: null });
    if (o.gloom > .02) {
      paint(ellPts(0, -11.4 * s, 2.1 * s, 1.0 * s, 16), { fill: PAL.indigo, fillOp: 150 * o.gloom, bleed: .08, tex: .5, ink: null });
      for (let i = 0; i < 5; i++) { const gx = (-1.4 + i * .7) * s; inkLine([[gx, -12.0 * s], [gx + jit(.03 * s), (-12.0 + 1.3 * o.gloom * (.7 + .3 * hash(i))) * s]], sw * .4, PAL.ink, 'inkfine', 0); }
    }
    if (o.bags > .02) for (const sd of [-1, 1]) inkLine(P([[sd * .92 - .42, -9.6], [sd * .92, -9.42], [sd * .92 + .42, -9.6]]), sw * .55 * o.bags, mixCol(PAL.violet, PAL.ink, .2), 'inkfine', .6);
    personEyes(s, o, sw);
    if (L.glasses === 'round') {
      for (const sd of [-1, 1]) {
        const g = ellPts((sd * .92 + (o.glassesX || 0)) * s, -10.05 * s, .7 * s, .64 * s, 16);
        paint(g, { fill: PAL.cream, fillOp: 25, bleed: 0, ink: PAL.ink, sw: sw * .6 });
      }
      inkLine(P([[-.24, -10.1], [0, -10.25], [.24, -10.1]]), sw * .5, PAL.ink, 'inkfine', .5);
      for (const sd of [-1, 1]) inkLine(P([[sd * 1.6, -10.15], [sd * 2.2, -10.3]]), sw * .45, PAL.ink, 'inkfine', 0);
    } else if (L.glasses === 'reading') {
      for (const sd of [-1, 1]) paint(P([[sd * .92 - .62, -9.75], [sd * .92 + .62, -9.75], [sd * .92 + .5, -9.35], [sd * .92 - .5, -9.35]]), { fill: PAL.cream, fillOp: 30, ink: PAL.ink, sw: sw * .55 });
    }
    // nose
    inkLine(P([[-.08, -9.6], [.12, -9.45], [-.05, -9.35]]), sw * .45, mixCol(skin, PAL.ink, .5), 'inkfine', .5);
    if (L.mustache) paint(P([[-.95, -9.15], [0, -9.4], [.95, -9.15], [.6, -8.85], [0, -9.05], [-.6, -8.85]]), { wash: L.hair, ink: PAL.ink, sw: sw * .45, curv: .4 });
    rs('mouth');
    const mu = s * .58; push(); translate(0, -8.9 * s + 4.3 * mu); mouth(mu, o.mouth ?? 'smile', sw * .9); pop();
  }
  rs('hair'); hairdo(s, sw, L, o, J);

  // arms in front
  const arm = (side, g, hook, hold, sleeve) => {
    rs('arm' + side);
    const A = [[g.sx0, g.sy0], [g.ex, g.ey], [g.hx, g.hy]];
    paint(ribbon(A, .95 * s, .78 * s), { wash: sleeve, fill: mixCol(sleeve, PAL.ink, .25), fillOp: 45, tex: .5, ink: PAL.ink, sw: sw * .7 });
    paint(ellPts(g.hx, g.hy, .5 * s, .5 * s, 12), { wash: skin, ink: PAL.ink, sw: sw * .6 });
    if (hook) { push(); translate(g.hx, g.hy); rotate(g.ang); hook(s, sw); pop(); }
    if (hold) { push(); translate(g.hx, g.hy); hold(s, sw); pop(); }
  };
  arm(-1, gL, o.handL, o.holdL, L.outfit === 'overalls' ? L.shirt : L.top);
  arm(1, gR, o.handR, o.holdR, L.outfit === 'overalls' ? L.shirt : L.top);
  rs('draw'); if (o.draw) o.draw(s, sw);
  pop();

  rs('emote');
  if (o.emote) { const ep = toW(2.9 * s, -13.0 * s); emote(o.emote, ep[0], ep[1], s * .62, o.emoteK ?? 1, o.emoteAge ?? T); }
  rs('after');
  return { hL: toW(gL.hx, gL.hy), hR: toW(gR.hx, gR.hy), head: toW(0, -10.3 * s), top: toW(0, -13 * s), eye: toW(0, -10.05 * s) };
}
// Two-bone arm solve: the angles that put this side's hand at (tx, ty) in body units. elbowUp flips the elbow.
// Of the two elbow solutions it picks the natural one: the elbow out to the side and down (score cos a − sin a in the
// arm's frame, x outward, y up), so hands on the chest fold with the elbows down and reaches up keep the elbow out.
// Pass elbowUp true/false to force a side.
function reachArm(side, tx, ty, elbowUp) {
  const l1 = 1.85, l2 = 1.75, X = side * (tx - side * 1.85), Y = -(ty + 7.05);
  let d = Math.hypot(X, Y); d = clamp(d, Math.abs(l1 - l2) + .02, l1 + l2 - .02);
  const phi = Math.atan2(Y, X), al = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const aP = phi + al, aM = phi - al, score = a => Math.cos(a) - Math.sin(a);
  const a = elbowUp === true ? aP : elbowUp === false ? aM : (score(aP) >= score(aM) ? aP : aM), ex = Math.cos(a) * l1, ey = Math.sin(a) * l1;
  const tX = Math.cos(phi) * d, tY = Math.sin(phi) * d, a2 = Math.atan2(tY - ey, tX - ex);
  let bend = a2 - a; while (bend > Math.PI) bend -= TAU; while (bend < -Math.PI) bend += TAU;
  return { a, bend };
}
function tintSkin(c, o) {
  const k = clamp(o.tintK ?? 1);
  if (o.tint === 'pale') return mixCol(c, '#F6EEE4', .45 * k);
  if (o.tint === 'flush') return mixCol(c, '#E86A5E', .3 * k);
  if (o.tint === 'blue') return mixCol(c, '#A7B2D8', .25 * k);
  if (o.tint === 'green') return mixCol(c, '#B5C78A', .35 * k);
  return c;
}

// Human eyes, by Clawd's eye names (so feel()/emotions() work), at (±.92s, -10.05s).
function personEyes(s, o, sw) {
  const kinds = Array.isArray(o.eyes) ? o.eyes : o.eyes === 'wink' ? ['happy', 'normal'] : [o.eyes || 'normal', o.eyes || 'normal'];
  const sqz = clamp(o.squint || 0), lx = (o.lookX || 0) * .22 * s, ly = (o.lookY || 0) * .18 * s;
  const P = pts => pts.map(([a, b]) => [a * s, b * s]);
  const brows = o.brows !== undefined ? o.brows : ({ sad: 'worried', teary: 'worried', cry: 'worried', scared: 'worried', angry: 'angry', determined: 'angry', red: 'angry', wide: 'up', spark: 'up', shine: 'up' })[kinds[1]] || null;
  for (const sd of [-1, 1]) {
    const k = kinds[sd < 0 ? 0 : 1], ex = sd * .92, ey = -10.05;
    push(); translate(ex * s, ey * s);
    if (sqz > .75) inkLine(P([[-.32, .02], [0, .1], [.32, .02]]), sw * .9, PAL.ink, 'ink', .5);
    else {
      if (sqz > 0) scale(1, 1 - sqz);
      const blink = ['normal', 'look', 'wide', 'dot'].includes(k) && ((T * .9 + (o.seed || 0) * 1.7 + (o.look === 'lead' ? 0 : 1.1)) % 3.4) < .11;
      const dot = (rx, ry) => { paint(ellPts(lx, ly, rx * s, ry * s, 12), { wash: PAL.ink, ink: null }); if (s > 7) paint(ellPts(lx - rx * .35 * s, ly - ry * .4 * s, rx * .32 * s, rx * .32 * s, 8), { wash: PAL.cream, ink: null }); };
      if (blink) inkLine(P([[-.3, .05], [.3, .05]]), sw * .9, PAL.ink, 'ink', 0);
      else switch (k) {
        case 'normal': case 'look': case 'dot': case 'determined': case 'angry': case 'red': dot(.27, .36); break;
        case 'wide': case 'shine': dot(.36, .46); if (k === 'shine') paint(ellPts(lx + .12 * s, ly + .14 * s, .08 * s, .08 * s, 6), { wash: PAL.cream, ink: null }); break;
        case 'happy': inkLine(P([[-.36, .12], [0, -.22], [.36, .12]]), sw * 1.0, PAL.ink, 'ink', .5); break;
        case 'closed': case 'relieved': inkLine(P([[-.36, -.05], [0, .2], [.36, -.05]]), sw * 1.0, PAL.ink, 'ink', .5); break;
        case 'sleepy': inkLine(P([[-.34, 0], [.34, 0]]), sw * .9, PAL.ink, 'ink', 0); paint(ellPts(lx, .14 * s, .22 * s, .16 * s, 8), { wash: PAL.ink, ink: null }); break;
        case 'narrow': paint(ellPts(lx, ly + .05 * s, .3 * s, .14 * s, 10), { wash: PAL.ink, ink: null }); inkLine(P([[-.38, -.08], [.38, -.12]]), sw * .7, PAL.ink, 'inkfine', 0); break;
        case 'sad': case 'teary': dot(.27, .34);
          if (k === 'teary') paint(ellPts(0, .42 * s + Math.sin(T * 9 + sd) * .03 * s, .34 * s, .14 * s, 10), { wash: PAL.sky, washOp: 220, ink: PAL.ink, sw: sw * .3 }); break;
        case 'cry': {
          inkLine(P([[-.36, -.02], [0, .16], [.36, -.02]]), sw, PAL.ink, 'ink', .5);
          const Rb = []; for (let q = 0; q <= 4; q++) Rb.push([(sd * .1 + Math.sin(T * 8 + q + sd) * .05) * s, (.25 + q * .42) * s]);
          paint(ribbon(Rb, .22 * s, .34 * s), { wash: PAL.sky, washOp: 230, ink: PAL.ink, sw: sw * .3 }); break;
        }
        case 'squeeze': inkLine(P([[-.3 * -sd, -.3], [.3 * -sd, 0], [-.3 * -sd, .3]]), sw, PAL.ink, 'ink', 0); break;
        case 'scared': paint(ellPts(0, 0, .42 * s, .5 * s, 12), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 }); paint(ellPts(lx * .5 + Math.sin(T * 40) * .03 * s, .05 * s, .13 * s, .17 * s, 8), { wash: PAL.ink, ink: null }); break;
        case 'blank': paint(ellPts(0, 0, .38 * s, .46 * s, 12), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 }); break;
        case 'spark': paint(starPts(0, 0, .55 * s * (1 + .12 * Math.sin(T * 14)), .42, 4), { wash: PAL.cream, fill: PAL.ochre, fillOp: 80, ink: PAL.ink, sw: sw * .45 }); break;
        case 'heart': paint(heartPts(0, .03 * s, .42 * s * (1 + .1 * pulse(T))), { wash: '#E2476E', ink: PAL.ink, sw: sw * .4 }); break;
        case 'x': inkLine(P([[-.3, -.3], [.3, .3]]), sw * .8, PAL.ink, 'ink', 0); inkLine(P([[.3, -.3], [-.3, .3]]), sw * .8, PAL.ink, 'ink', 0); break;
        case 'swirl': { const sp = []; for (let q = 0; q < 14; q++) { const a = q * .75 + T * 6 * sd, r = q * .03 * s; sp.push([Math.cos(a) * r, Math.sin(a) * r]); } inkLine(sp, sw * .5, PAL.ink, 'inkfine', .6); break; }
        case 'shades': paint(P([[-.62, -.32], [.62, -.32], [.5, .3], [-.5, .3]]), { wash: '#2A2740', ink: PAL.ink, sw: sw * .5, curv: .3 }); inkLine(P([[-.35, -.15], [-.05, -.25]]), sw * .3, PAL.cream, 'inkfine', 0); break;
        default: dot(.27, .36);
      }
    }
    pop();
    if (brows && sqz < .75) {
      const by = -10.95;
      const B = brows === 'worried' ? [[ex - .38 * sd, by + .02], [ex + .38 * sd, by - .2]]
              : brows === 'angry' ? [[ex - .38 * sd, by - .2], [ex + .38 * sd, by + .1]]
              : brows === 'up' ? [[ex - .36, by - .32], [ex, by - .42], [ex + .36, by - .32]]
              : [[ex - .36, by - .08], [ex + .36, by - .08]];
      inkLine(P(B), sw * .75, PAL.ink, 'ink', .4);
    }
  }
}

// Hair, drawn last on the head so it frames the face. Back view: hair covers the head.
function hairdo(s, sw, L, o, J) {
  const P = pts => pts.map(([a, b]) => [a * s, b * s]), col = L.hair, ink = { ink: PAL.ink, sw: sw * .75 };
  const bumpy = (pts, amt) => pts.map(([a, b], i) => [a + jit(amt), b + jit(amt) - (i % 2 ? amt * 1.2 : 0)]);
  if (o.back) {
    if (L.hairStyle === 'bald') { paint(ellPts(0, -10.0 * s, 2.5 * s, 1.4 * s, 18, J), { wash: col, ...ink }); return; }
    paint(ellPts(0, -10.55 * s, 2.62 * s, 2.45 * s, 22, J * 2), { wash: col, fill: mixCol(col, PAL.ink, .3), fillOp: 60, tex: .5, ...ink });
    if (L.hairStyle === 'bun') paint(ellPts(0, -13.2 * s, .95 * s, .85 * s, 14, J), { wash: col, ...ink });
    if (L.pen) paint(ribbon(P([[1.1, -12.1], [1.9, -12.9], [2.6, -13.6]]), .28 * s, .22 * s), { wash: PAL.tomato, ink: PAL.ink, sw: sw * .5 });
    return;
  }
  switch (L.hairStyle) {
    case 'mop': {
      const out = []; for (let i = 0; i <= 16; i++) { const a = Math.PI * (1.02 + i / 16 * .96), r = 2.72 + .22 * Math.sin(i * 2.1) + (i % 2 ? .12 : 0); out.push([Math.cos(a) * r, -10.35 + Math.sin(a) * r * .98]); }
      const pts = [[-2.62, -9.4], ...out, [2.62, -9.4], [2.35, -10.6], [1.6, -11.25], [.9, -10.95], [.2, -11.4], [-.55, -11.05], [-1.3, -11.45], [-2.1, -10.85]];
      paint(P(pts), { wash: col, fill: mixCol(col, PAL.violet, .3), fillOp: 60, tex: .5, ...ink, curv: .25 });
      for (let i = 0; i < 4; i++) inkLine(P([[-1.6 + i * .9, -12.35], [-1.3 + i * .9, -11.75]]), sw * .4, mixCol(col, PAL.cream, .35), 'inkfine', .5);
      const fz = clamp(o.frizz || 0);
      if (fz > .02) for (let i = 0; i < 9; i++) {
        const a = Math.PI * (1.08 + i / 8 * .84), r0 = 2.7, r1 = 2.7 + fz * (1.0 + .6 * hash(i * 3.1)) + .15 * Math.sin(T * 9 + i);
        const p0 = [Math.cos(a) * r0, -10.35 + Math.sin(a) * r0], p1 = [Math.cos(a + .1 * Math.sin(i)) * r1, -10.35 + Math.sin(a) * r1];
        inkLine(P([p0, [lerp(p0[0], p1[0], .5) + .15 * Math.sin(i * 5), lerp(p0[1], p1[1], .5)], p1]), sw * .8, col, 'ink', .6);
      }
      if (L.pen) { paint(ribbon(P([[1.0, -12.0], [1.8, -12.8], [2.55, -13.55]]), .3 * s, .24 * s), { wash: PAL.tomato, ink: PAL.ink, sw: sw * .5 }); paint(ellPts(2.6 * s, -13.6 * s, .17 * s, .17 * s, 8), { wash: PAL.ink, ink: null }); }
      break;
    }
    case 'swoop': {
      const pts = [[-2.55, -9.6], [-2.75, -11.0], [-2.4, -12.2], [-1.4, -12.9], [-.2, -13.3], [1.2, -14.0], [2.6, -14.1], [2.1, -13.3], [2.75, -12.0], [2.7, -11.0], [2.55, -9.7], [2.2, -10.7], [1.3, -11.6], [.2, -11.9], [-1.0, -11.5], [-2.0, -10.8]];
      paint(P(pts), { wash: col, fill: PAL.indigo, fillOp: 50, tex: .5, ...ink, curv: .35 });
      inkLine(P([[.2, -12.9], [1.3, -13.5], [2.2, -13.7]]), sw * .45, mixCol(col, PAL.cream, .4), 'inkfine', .5);
      break;
    }
    case 'slick': {
      const pts = [[-2.55, -9.8], [-2.7, -11.3], [-2.0, -12.5], [-.6, -13.0], [.9, -12.95], [2.1, -12.4], [2.7, -11.2], [2.55, -9.8], [2.25, -10.9], [1.6, -11.5], [-.4, -11.65], [-1.7, -11.4], [-2.25, -10.8]];
      paint(P(pts), { wash: col, fill: mixCol(col, PAL.ink, .3), fillOp: 50, tex: .4, ...ink, curv: .35 });
      inkLine(P([[-1.0, -12.55], [-.9, -11.7]]), sw * .5, PAL.ink, 'inkfine', 0);
      inkLine(P([[.3, -12.6], [1.4, -12.2], [1.9, -11.6]]), sw * .6, mixCol(col, PAL.cream, .55), 'inkfine', .5);
      break;
    }
    case 'bald': {
      for (const sd of [-1, 1]) paint(P([[sd * 2.1, -9.5], [sd * 2.65, -10.0], [sd * 2.7, -11.1], [sd * 2.2, -11.7], [sd * 1.9, -11.0], [sd * 2.0, -10.1]]), { wash: col, ...ink, curv: .4 });
      inkLine(P([[-.6, -12.35], [.1, -12.55], [.7, -12.4]]), sw * .6, mixCol(L.skin, PAL.cream, .6), 'inkfine', .5);
      break;
    }
    case 'bun': {
      paint(ellPts(0, -13.15 * s, .95 * s, .85 * s, 14, J), { wash: col, ...ink });
      const pts = [[-2.55, -9.7], [-2.7, -11.2], [-2.0, -12.4], [0, -12.95], [2.0, -12.4], [2.7, -11.2], [2.55, -9.7], [2.1, -10.9], [0, -11.6], [-2.1, -10.9]];
      paint(P(pts), { wash: col, ...ink, curv: .35 });
      break;
    }
    default: {   // short
      const pts = [[-2.55, -9.9], [-2.65, -11.4], [-1.8, -12.6], [0, -12.95], [1.8, -12.6], [2.65, -11.4], [2.55, -9.9], [2.1, -11.0], [.6, -11.5], [-.8, -11.2], [-2.0, -11.1]];
      paint(P(bumpy(pts, .04)), { wash: col, ...ink, curv: .3 });
    }
  }
}

// Lip-flap from the karaoke word times: an open mouth on each sung word, held on long notes. Use it for whoever is
// singing the line (filter(text) → true limits it to lines that character sings, e.g. a duet or a backing-vocal call).
// Characters who aren't singing keep their resting mouth: everyone lip-syncing every line reads as a choir.
function singMouth(t, rest = 'smile', filter) {
  if (typeof LY === 'undefined') return rest;
  const L = LY.find(l => t >= l[0] && t < l[1] + .1); if (!L || (filter && !filter(L[2]))) return rest;
  const wt = L[3]; let i = -1; for (let k = 0; k < wt.length; k++) if (wt[k] <= t) i = k;
  if (i < 0) return rest;
  const age = t - wt[i], next = wt[i + 1] ?? L[1], held = next - wt[i] > .55;
  if (age < .26 || (held && t < next - .08)) return i % 3 === 1 ? 'open' : 'O';
  return 'o';
}
