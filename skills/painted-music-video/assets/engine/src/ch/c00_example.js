// c00_example.js: a PATTERN for chapter files, not a template to keep. Delete it once the first real chapter exists
// (and its script tag in studio.html). One file per song section; each is an IIFE that ends with shots([...]).
//
// What it shows: shots keyed to lyric lines (lineT / wordT), a curtain-and-title opening, a singer whose mouth follows
// the words (singMouth), an acted emotion change landing on a word, a one-shot gesture (seg, not a loop), a slow camera
// push, a hand meeting a prop through gripR, and a brush wipe across the seam into the next chapter.
(() => {
  const ground = (t) => {
    boilSeed('sky'); paint(rectPts(-200, -200, W + 400, 1000), { wash: PAL.sky, fill: mixCol(PAL.sky, PAL.cream, .4), fillOp: 90, bleed: .25, ink: null });
    boilSeed('hill'); paint(ellPts(960, 1180, 1500, 420, 40, 2), { wash: PAL.sap, fill: mixCol(PAL.sap, PAL.ink, .2), fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 9; i++) pine(120 + i * 210, 790 + 30 * hash(i), 120 + 60 * hash(i * 3), '#4E6A58');
  };
  // Intro (before the first sung line): the curtain opens on the title.
  function opening(t, lt, dur) {
    camBegin(960, 540, 1.0);
    ground(t);
    person(960, 900, 26, { look: 'lead', ...feel('neutral', t), lookX: -.3 });
    camEnd();
    const open = ease(seg(lt, dur - 2.2, dur - .4));
    curtains(t, open, { title: 1 - seg(lt, dur - 2.6, dur - 2.0) });
  }
  // Line 0: the lead sings; on the line's third word their mood turns, and the right hand lifts a mug to the mouth.
  function firstLine(t, lt, dur) {
    const turn = wordT(0, 2), sip = ease(seg(t, turn + .4, turn + 1.2)) * (1 - ease(seg(t, turn + 2.2, turn + 2.8)));
    camBegin(960, lerp(560, 500, ease(lt / dur)), lerp(1.0, 1.15, ease(lt / dur)));   // one slow push: no drift loops
    ground(t);
    const mood = emotions(t, [[lineT(0), 'neutral'], [turn, 'hopeful']]);
    const at = [960 + 70, lerp(900 - 120, 900 - 215, sip)];
    const P = person(960, 900, 26, { look: 'lead', ...mood, mouth: singMouth(t, 'smile'), gripR: at, bendL: -.2 });
    mug(P.hR[0] + 6, P.hR[1] + 30, .7, { key: 'lead mug', steam: .6 });
    camEnd();
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6);
  }
  // Only register what the song has: the example needs one sung line.
  if (typeof LY !== 'undefined' && LY.length) shots([[0, opening], [lineT(0) - .2, firstLine]]);
})();
