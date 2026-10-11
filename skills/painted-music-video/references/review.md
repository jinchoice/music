# Review, render and feedback

You can't see motion by reading code. Look at every chapter at three zoom levels, run the two numeric checks, fix
what you find, and look again. Contact sheets cost about 0.1–1 s a frame, so looking is cheap; a full render you have
to redo is not.

## Contents
1. The looking commands
2. What to check
3. Numeric checks: motion and determinism
4. Rendering
5. Verifying the MP4
6. Turning feedback into fixes

---

## 1. The looking commands

```bash
# contact sheet: the shape of a chapter (each shot's first, middle and last moments)
node render.mjs --sheet=47.9,49,51,52.1,54,55.9 --cols=3 --w=640 --out=out/check/ch2.jpg
# seams: the frame before and after every cut (t0 - 1/24 and t0)
node render.mjs --sheet=51.958,52.0,55.958,56.0 --cols=4 --w=480 --out=out/check/seams2.jpg
# strip: EVERY frame of a moment (a gesture, a take, a transition)
node render.mjs --strip=52.6:53.2 --cols=6 --w=320 --out=out/check/door.jpg
# crop: full-resolution detail (faces, hands holding props, logo edges); crop=x,y,w,h in frame pixels
node render.mjs --sheet=53.0,54.0 --crop=760,300,400,400 --w=600 --out=out/check/face.jpg
# crop-at: the same, following a WORLD point through a moving camera (x,y may be page expressions)
node render.mjs --strip=52:53 --crop-at=960,780,500,400 --out=out/check/feet.jpg
# stills: full-resolution PNGs
node render.mjs --stills=52.5 --out=out/stills
```

Open each image and actually look at it. The scrubber (`studio.html` in Chrome) is good for feel, but the sheets are
the record: generate one whenever you claim something is fixed.

`node render.mjs --shots --range=40:70` prints the shot list for a stretch, with a ready-made `--sheet=` list (each
shot's start, middle and end) and a seam list (the frame before and at every cut) to paste into the commands above.

## 2. What to check

- **Story:** is each shot's event clear from its sheet alone? Is the main character big enough and separate from the
  background? Does each chapter's palette match the storyboard?
- **Timing:** render a shot at a fixed step (every 0.1–0.15 s) and read it like a viewer. Where is the eye? Does each
  read get enough frames (24 = 1 s)? Does the hit land on its word? Compare the word times in `src/lyrics.js`.
- **Motion** (in strips):
  - anticipation and follow-through
  - no pops or snaps between frames
  - parts moving at different times
  - nothing mirrored left and right, nothing at constant speed
- **Calm** (see craft.md section 5):
  - nobody bobbing on the beat; no shake; still things identical frame to frame
  - one-shot actions happen once
  - no fast flapping of big parts
- **Contacts:** feet on the ground; hands on what they hold (crop them); thrown things leaving from the hand.
- **Arms:** no V-folded elbows, no shoulders twisted backwards, hands at sensible heights.
- **Karaoke:**
  - the sweep matches the singing (spot-check a few lines against `tools/words.json`)
  - no line overflows the band
  - no face or key action is hidden behind it
- **Seams:** every cut has its planned transition; nothing jumps across a cut except on purpose.
- **Rules:** no stray text, no 3D, no dead stretch where nothing happens, no muddy green-grey glows.
- **Brand:** the logo is the real bitmap, uncropped and undistorted, on a clean plaque; every claim is as approved.

**Budget:** at least one contact sheet and one seam sheet per chapter, a strip for every key motion and transition,
and a crop for every face and hand that carries the story.

## 3. Numeric checks: motion and determinism

```bash
node render.mjs --motion=34:36 --out=out/check/motion.jpg
node render.mjs --determinism=10,60,120
```

- **`--motion=a:b`** prints, per frame:
  - `d1`: the mean change from the last frame. A camera move, a walk or a cut shows here.
  - `d2`: the mean second difference, which is back-and-forth motion: a bob, a flap, a shimmer, a shake. A smooth
    pan has a high d1 and a low d2.

  It also prints the hottest 160×120 cells and writes a heat map of d2 over the first frame. Use it whenever someone
  says "it's jittery" or "it shakes":
  - The hot cells name the culprit's position: find what's drawn there.
  - In a held shot, d2 should be near zero except where something is meant to move.
  - A d2 rhythm that repeats with the beat is beat-driven idle motion. Remove it.
- **`--determinism=t1,t2,...`** renders each time, then another time, then the first again, and compares (the GPU's
  own noise is ignored). "DIFFERENT" means state leaks between frames:
  - a per-frame counter that isn't reset
  - a cached value that depends on render order
  - an unseeded `Math.random()`

  Find it before a full render: leaked state makes the parallel workers disagree, so stills flicker in the final
  video even when every sheet looks fine.

## 4. Rendering

```bash
node render.mjs --frames --workers=3                                    # out/frames/f00000.jpg ..., resumable
node render.mjs --encode --audio=assets/song.mp3 --out=out/<title>.mp4  # H.264 + AAC, yuv420p, faststart
```

- **Time:** about 0.4–0.7 s a frame with 3 workers on an Apple-silicon laptop, depending on how much is painted.
  Multiply by `duration × 24` and tell the person what to expect before you start.
- **Run it in the background** and watch the log, which prints frame counts, ms/frame and an ETA. An interrupted
  render resumes: re-run the same command and finished frames are skipped.
- **Re-rendering after fixes:** delete the frames for the changed range (`f{start*24}` … `f{end*24}`), or render
  that range with `--frames --range=a:b`, then encode again. Check that no chapter outside the range changed: shared
  code (a character, a set) changes every shot that uses it.
- **Previews:**
  - `--frames --range=a:b` renders one chapter.
  - `--clip --range=a:b --out=out/clip.mp4` goes straight to an MP4 with audio, using one worker.
  - `--fps=12` makes a half-cost draft; encode with the same `--fps`.
- **More workers** only help up to the GPU's limit. 3–4 is typical on a laptop. Watch ms/frame "effective" in the
  log.

## 5. Verifying the MP4

Before handing it over:

```bash
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact out/<title>.mp4
ffmpeg -v error -ss 52.5 -i out/<title>.mp4 -frames:v 1 out/check/mp4_52.5.png      # compare with --stills=52.5
```

- The duration matches the song (within a frame).
- The video is 1920×1080 at 24 fps; the audio is AAC.
- A few frames pulled from the MP4 match the page at the same times.
- The karaoke is in sync at the start, the middle and the end. Drift means the frame count or the fps is wrong.

## 6. Turning feedback into fixes

People describe what they see, not what's wrong in the code. Translate the note, find the cause with the motion map
or a strip, fix it at the source, and re-check the same moment plus one other place that uses the same code.

| they say | usually it's | fix |
|---|---|---|
| "too jittery", "never still", "bouncing" | idle motion from emotions or dances; takes with hops; beat pulses on bodies | fixed poses (`calmBody`), takes as squash only, `move()` damped, remove `pulse()` from bodies |
| "shakes", "the whole scene shimmers" | camera shake; boiling linework; brush textures re-seeded per frame; a state leak | `shakeXY` → 0, `BOILN = 0`, per-shape seeding, then `--determinism` |
| "bounces very quickly" (still, after calming) | frames that differ from themselves (counters not reset), or fast `sin(t * k)` on a part | reset counters in `draw()` / `FRAME_RESETS`; slow or remove the oscillation |
| "the arms are at weird angles" | grip targets too high, too close or behind the body; the elbow solution flipping | natural-elbow solve, targets a little below the shoulder, a check with `?loop=arms` or a crop |
| "it happens twice" | a `frac(t)` or `sin` loop where a one-shot was meant | `ease(seg(t, a, b))` |
| "I can't tell what's happening" | reads stacked or too short; the subject too small; the eye not led | one read at a time, a longer hold, a push in, a look toward it |
| "the logo is wrong" | a painted or re-lettered logo | the real PNG via `logoAt()` on a matching plaque |
| "the subtitles are off" | an alignment window wrong for that line | fix that line in `tools/lyrics_windows.json`, re-run with `--windows=` |
| "change the word X to Y on screen" | karaoke text only (the song is unchanged) | edit `lyrics.txt` (keep the word count close), re-align, re-render |
| "the colour of … flashes" | the emotion colour cross-fade on a custom character | use the character's own body colour, ignore `o.col` |

After a round of fixes, tell the person exactly what changed, at which times, and what you checked, then re-render and
re-verify. If a fix touches shared code, say which other moments it changed too.
