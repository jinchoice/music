# Video phase

How the music video is built once the user sends the chosen take and the lyrics as sung. This is distilled from a lyric-synced watercolour music video that Claude made end to end in Claude Code: a 156.6 s song at 88 BPM, nine chapters, painted in p5.brush and rendered frame by frame.

## Pipeline

1. **Beat grid.** Measure the BPM and the first-beat offset from the audio (a beat tracker such as librosa's, checked by ear against a click track). Store them as constants: `BPM`, `BEAT = 60 / BPM`, `OFF`, `DUR`. Beats fall at `OFF + n × BEAT`. A single grid only works because the tempo is locked.
2. **Timed lyrics.** Write one `[start, end, text]` triple per line, using the lyrics exactly as sung. These drive the karaoke and set every shot's boundaries.
3. **Storyboard** (below), written before any painting.
4. **Animation guide** (below), written to brief parallel subagents, one per chapter.
5. **Paint, check, render.**

## Storyboard

- **One idea for the whole video**, with a frame that bookends it. The source was a stage show that goes off the rails: it opens and closes on the same painted curtain, and the last line's twist pulls back to reveal that the apocalypse was a play.
- **Something happens in every shot**: a character acts, or something breaks, transforms, chases or falls.
- **Text-light.** Tell jokes with pictures and acting. Use a handful of big sound-effect words across the whole video (FOOM, BOOM, CHOMP, SLAM), and only rarely a single short word where the joke needs it. Labels, captions and signs that repeat the lyric stay out, since the karaoke already shows it.
- **Cast table** (who, look, role). The singer carries the story. The one sung to changes across the video (the source's AI grew from a doodle on a monitor to planet-sized, then shrank back to cute for the reveal). A troupe of small extras dance and work as stagehands. Guests appear in one verse and return for the finale. A recurring prop escalates every chorus (a stage thermometer pumped 8 → 34 → 61 → 86 → 99.9%).
- **Sets, not cards.** Each chapter happens in one place and the camera moves through it. Every chorus returns to the same set, escalating each time (party → pyro → flood → red alarm).
- **Motivated transitions.** Brush wipes mark chapter breaks. Inside a chapter, the action carries across the cut: a chomp to black, a rocket, a fall, a zoom through an eye, a bubble popping, a flash, a crash through the floor, a door slam.
- **Emotion morphs.** Faces change mood in stages: the eyes squash shut, the body does a squash-and-stretch take, an emote pops (sweat drop, sparkle, heart, "!"), then the new eyes open.
- **Camera.** Every shot has a push, pan, tilt, whip, zoom-out or on-beat shake.
- **Palette arc.** Each chapter gets its own palette, and the arc returns to the opening colours at the end.
- **Big dancers.** In chorus and dance shots the lead fills about 40% of the frame height.

Format: one heading per chapter with its time range and palette, then a table. `Out` is how the shot hands off to the next.

| Time | Lyric | Shot | Out |
|---|---|---|---|
| 9.0–12.4 | There was a sudden drop in your training loss, | The AI hops onto the loss curve and sleds down as it plunges off a cliff. The camera rides the drop and paint splashes at the bottom. | The AI bursts out of the monitor, now person-sized |

## Animation build

**Stack.** One HTML page paints each frame at 1920×1080 with p5.js and p5.brush (watercolour and ink brushes). A Node script drives the page in headless Chrome (puppeteer-core) at 24 fps, and ffmpeg joins the frames with the song (H.264 at CRF ~17, AAC 192k).

**Code layout.**
- Shared files: core (constants, palette, helpers, paper texture, compositing, render hooks), one file per character, props, lyrics, and a timeline (chapter registry, wipes, karaoke, overlays).
- One file per chapter, wrapped in an IIFE so its helpers stay private and ending in `chapter(name, start, end, [[t0, shotFn], ...])`. A shot is `shotFn(t, lt, dur)` (song time, time since the shot started, shot length) and paints the entire frame, background included. Cuts land on each shot's start time.
- Each subagent owns one chapter file and edits only that. A bug in a shared file gets reported to the lead agent, who fixes it.

**Frames are pure functions of `t`.** Frames render in parallel and out of order, so every value derives from `t`: stable per-object randomness comes from `hash(i)`, and hand-drawn jitter comes from a generator reseeded 12 times a second, so the linework "boils" like hand-drawn animation. State carried between frames and `Math.random()` both break this.

**Helpers worth building first.**
- **Timing**: `bpOf(t)` (beat position), `beatN`, `pulse(t)` (1 on each beat, then decaying; `pulse2` on eighths), `seg(t, a, b)` (0–1 progress), `kf(t, keyframes, ease)`, and easings including `backOut` (overshoot) and `elasticOut`.
- **Painting**: `paint(points, opts)` with a flat `wash` for characters, a bleeding watercolour `fill` for backgrounds and glows, optional hatching and an ink outline; point generators for rectangle, ellipse, rounded rectangle, star and heart; `inkLine` for strokes.
- **Camera**: `camBegin(cx, cy, zoom, rot)` / `camEnd()`, plus a deterministic `shakeXY` for hits.
- **Lettering** on its own layer composited over the paint: `letter()`, and a comic `sfx()` that pops, wobbles and fades.
- **Full-frame effects**: `flash`, `iris` (circle reveal) and `irisShape` (any outline: a mouth, a heart, a keyhole).
- **Characters** as parameterised functions: pose (squash, arm angles, flip, walk), a face vocabulary (eyes, mouths), hats and emotes. `mood(t, [[t0, face, emote], ...])` runs the staged mood change, and `move(style, t)` gives beat-synced dances (bounce, hop, sway, spin, stomp…).
- **Props** for the recurring chorus set, driven by the beat (a pump whose down-stroke lands on every beat).

**Overlays the timeline adds.** Karaoke sits in a painted bar across the bottom (y ≈ 975–1070) with word-by-word highlighting, so faces and key action stay above y ≈ 960. Brush wipes cover the frame by each chapter boundary, swap scenes under full cover, then reveal. During chorus windows, a small corner copy of the recurring prop appears whenever the shot doesn't draw it. A paper texture sits under every frame, with grain and a vignette multiplied over the top.

**Style rules.**
- Picture-book watercolour and ink: characters in flat colour with ink outlines, backgrounds in soft watercolour fills, and light as low-opacity fills. Use off-black and cream in place of pure black and white.
- One focal action per shot with a big silhouette. Shots last 1.4–4 s, so each gag has to read instantly.
- Everything moves: cameras drift or push, characters bounce on the beat and hits land on beat times. Use squash and stretch, anticipation and overshoot.
- Budget ≤ 2.5 s per frame, and never more than about 4 s. Cost comes from the number of fill shapes and strokes: hundreds are fine, thousands are not.

**Checking.** Render a contact sheet of several times on one image (it prints ms per frame), open it with Read, and look carefully. Cover the first and last frame of every shot plus a few in between, every 0.1 s around a hit, the transitions into and out of the chapter, and the karaoke band. Iterate until each shot is charming, readable, lively and on-model. The renderer's modes are: contact sheet, full-resolution stills, a short clip with audio, all frames (parallel workers, resumable, atomic writes) and encode.

**How the source got there.** It took two generations. A first, simpler pass served as a test. The storyboard was written after it, with three directions: paint in brushstrokes, make every scene visually interesting, and make every scene transition into the next. Apart from the character design and "give each lyric interesting visuals and transitions", the model chose every scene itself. The animation guide was then written to brief the subagents painting chapters in parallel.
