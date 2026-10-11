# Craft: how the video should look and move

Read this before building shots. Most of the rules come from ClaudeAnimationBase's animation guide. The calm-motion
section comes from a real production's feedback, where it took four rounds of notes before the viewer was happy.
Start with those defaults so the person doesn't have to ask for them.

The person decides **what** the video is. These rules decide **how** it's made. If they ask for something a rule
forbids (a caption, a shaky cam), do what they ask.

## Contents
1. The look
2. Text
3. Something happens in every shot
4. Timing: model the viewer
5. Calm motion (the defaults viewers asked for)
6. Acting, lip-sync and size
7. Transitions
8. Animation principles
9. Common failures

---

## 1. The look

- **Paint everything with `paint()` and `inkLine()`** (p5.brush). Characters and props are a flat `wash` with an
  ink outline. Skies, hills and shading are soft watercolour `fill` shapes with no outline or a thin one. Never use
  plain p5 shapes (`rect`, `ellipse`, `fill()`): they look like 2000s Flash.
- **Flat 2D, never projected 3D.** Characters turn through drawn key views, not rotations. Depth comes from overlap,
  scale and colour: farther things are smaller, bluer and paler.
- **Light is the one exception.** Pigment mixing turns yellow-over-blue green, so anything that shines (lamps, stars,
  glows, magic) uses `glow()`, which adds real light.
- **Soft palette, with no pure black or white.** Use `PAL.ink` and `PAL.cream`/`PAL.paper`. Pick a small palette per
  chapter and keep the characters readable against every background.
- **Still linework holds still.** The base kit "boiled" every line 12 times a second. In a music video that reads
  as shimmer, so the engine holds `BOILN` at 0. Hand-drawn wobble comes from `jit()` in the shapes, and it is the
  same every frame.

## 2. Text

- **The karaoke band is the only running text.** It carries the lyrics, so nothing else needs to: no captions, no
  labels on objects, and no signs or screens that repeat the lyric.
- **Allowed:** the title card, the end card (with the real logo), and a handful of big comic sound effects across
  the whole film (`sfx()`: THUD, DING, CLICK). Use them on impacts, once each.
- **Reactions are painted marks, never letters:** `!`, `?`, sweat, hearts, a bulb, a rain cloud (the emotes).
- **Keep the action above y ≈ 960 while a line is showing,** because the band covers the bottom of the frame.
- **Lines over ~60 characters overflow the band.** Split them in `lyrics.txt` and re-align.

## 3. Something happens in every shot

- **Every shot has an event:** something changes between its first frame and its last. A character wants, finds,
  tries, fails, reacts or gets something. "The singer stands there singing" is not a shot, even in a chorus.
- **One focal action at a time,** with a clear silhouette, so it reads at a glance.
- **Cause, then reaction.** When something happens, someone reacts: a take, an emotion change, a turn toward it.
- **Pay it off.** Whatever a shot sets up gets resolved on screen, in that shot or a later one.
- **Act the line's meaning, physically.** The best shots turn a line into a gag the viewer can see. A metaphor sung
  in the lyric can be taken literally on screen.

## 4. Timing: model the viewer

You know what happens because you wrote it. The viewer sees it once, at full speed, while also listening to the
words. **For every moment, ask what the viewer needs to understand and how long that takes.**

- **Write the reads.** List, in order, what the viewer has to understand in each shot. Each read needs time for the
  eye to find it, time to understand it, and a beat to register before the next one starts.
- **One read at a time.** When two things happen at once, the viewer sees one of them. Put a cause and its reaction
  in sequence, not on top of each other.
- **Fast actions, slow meanings.** A move can be quick if it's anticipated, but what it means needs held time. The
  contrast between quick and held gives the film rhythm.
- **Lead the eye** to the next read before it happens: a character looks at it, it moves or lights up first, or the
  camera goes there.
- **The music sets the clock.** Land the hits on words and beats (`wordT`, `wordAt`, `beatT`). Cut a little before
  a line starts, so the new picture is there when the word arrives.

## 5. Calm motion (the defaults viewers asked for)

In a music video the song already carries the energy. Pictures that also pulse, bob and shake on every beat read
as jitter, and viewers ask for it to stop. The engine is set up calm; keep it that way:

- **Characters stand still on the ground.** No idle bob or bounce. Each emotion holds one fixed resting pose
  (`feel()` → `calmBody`). The eyes keep a little of their glances, but nothing else moves unless the shot makes it.
- **The beat goes into cuts and hits, not into bodies.** Put the beat into the edit, the lights, the props, the
  karaoke sweep and the occasional deliberate hit. A character's body doesn't move on every beat.
- **Takes are a small squash, not a hop.** `emotions()` keeps them small, so don't add `jump()` to a mood change.
- **Dances are damped.** `move()` cuts sway to a fifth and arm swing to a third, with no bounce. When a dance is the
  point of the shot (a kickline, a finale), choreograph it as a sequence of one-shot moves.
- **The camera never shakes.** `shakeXY()` returns zero. Sell an impact with a squash, a flash, an emote or a cut.
- **Camera moves are slow and one-way:** one push, pan or pull per shot, eased. Don't use drift loops
  (`sin(t)` on the camera).
- **One-shot actions, not loops.** A paper plane crosses the room once, with `ease(seg(t, a, b))`. A `frac(t)` or
  `sin(t * k)` loop repeats inside the shot, and the viewer sees the plane fly twice.
- **Oscillation limits.** Anything that swings back and forth faster than about once a second on a large part
  (whole bodies, arms, big props) reads as flapping. Keep fast oscillation for small things that really vibrate (a
  phone buzzing, a tail wag), and keep it brief.
- **Arms reach naturally.** Use `gripL`/`gripR` targets with the natural-elbow solve, which bends elbows down and
  out. Put chest-level grips a little below the shoulders, and check unusual reaches with `?loop=arms` or a crop.
  A V-shaped arm, with the elbow up by the ear, is the usual failure.
- **Every frame is a pure function of time.** Reset per-frame counters in `draw()` and seed each brush shape on its
  own (the engine does both). Give every character that comes and goes a `boilKey`. Run `--determinism` after
  adding any new character or prop. If frames leak state, the parallel workers paint different films and a still
  shot flickers.

If the person asks for more energy, add it on purpose and in one place (a dance break, a finale), not as a global
idle.

## 6. Acting, lip-sync and size

- **Faces act, never snap.** Change moods with `emotions(t, [[t0, 'sad'], [wordT(3, 2), 'hopeful']])`. It squints,
  swaps the face under the squint, cross-fades colour and pops the new emote. Never swap `eyes`/`mouth` between two
  frames by hand.
- **Lip-sync the singer only:** `mouth: singMouth(t, 'smile')`. A duet or a call-and-response passes a filter so
  each character sings only their lines. Everyone else keeps their resting mouth; a whole cast mouthing every word
  reads as a choir.
- **Plan the emotional arc across the whole song,** not per shot. Write the emotion keys in the storyboard.
- **Big enough to feel.** In a medium shot a `person()` unit `s` is about 22–30 (the character is 13.5s tall); in a
  close-up 40–70. Tiny characters are for wide establishing shots only. In dance and chorus shots the main
  characters should fill about 40% of the frame's height.
- **Looks change with the story,** through a look function of time (eye bags fading, a jacket picking up the brand
  colour). Keep every character on model otherwise: the same shape and features in every shot.

## 7. Transitions

- **Every seam gets one:** into the first shot, between every pair of shots, and out of the last one. Never start on
  a hard frame and never just stop.
- **Pick a transition that belongs to the story,** and vary it:
  - a push through a window or door
  - a camera flash or a light flare
  - a bubble popping
  - a match cut (the same shape or motion across the cut)
  - a cut on action
  - an iris (`iris`, `irisShape`)
  - a brush wipe (`brushWipe`, sparingly)
  - a fade from paper or black
- A plain cut is fine when it's on action or on a strong beat, as a deliberate smash cut.
- **Changes inside a shot are transitions too:** emotions go through `emotions()`, turns through `turn()`, and props
  arrive and leave on arcs (`arcPt`). Nothing pops in.
- **Check every seam** with a sheet of the frames just before and after it.

## 8. Animation principles

Motion written as code comes out mechanical: every part moves at once, on the same curve, by the same amount. These
fix it:
- **Anticipation:** a small move the opposite way before a big one (a crouch, a wind-up, a squint).
- **Slow in, slow out:** run every `lerp` through an easing (`ease`, `easeOut`, `backOut`).
- **Arcs:** thrown things, reaches and head turns travel on arcs (`arcPt`).
- **Overlap and follow-through:** the eyes lead, the body follows, and props settle last (`spring`, `backOut`).
- **Avoid twinning:** don't give both arms the same angle, all eyes the same blink, or a crowd the same timing.
  Offset each with its `seed` and phase.
- **Strong key poses:** each shot's storytelling poses should read as stills before any motion goes between them.
- **Show the thought:** a character notices, thinks, then acts, and the eyes move first.
- **Exaggerate the poses, not the jitter.** Push poses and expressions; keep idle motion at zero.

## 9. Common failures

- characters bobbing, bouncing or swinging their arms on every beat
- screen shake; linework or textures that shimmer from frame to frame
- an action that loops inside a shot (it happens twice)
- elbows folded into a V; hands floating near a prop instead of holding it
- signs, captions or screens that repeat the lyric
- the singer standing still and smiling while nothing happens
- events stacked on top of each other, with no holds; moments over before anyone reads them
- action hidden behind the karaoke band
- everyone lip-syncing every line
- hard cuts everywhere, or a film that just starts and stops
- a painted copy of a logo instead of the real one
- every chorus staged differently, so they don't feel like choruses
- the last read cut off by the end of the audio
