---
name: painted-music-video
description: Make a hand-painted, watercolour-and-ink animated music video for a song the person supplies (an MP3 plus its lyrics), with a story, characters, word-by-word karaoke subtitles, lip-sync and cuts locked to the beat, rendered to an MP4 with the song. Built on p5.js + p5.brush in headless Chrome, with a storyboard → cast sheet → chapters → review → render workflow. Use this whenever someone wants a music video, lyric video, animated video or cartoon for a song, or wants to "make a video for my song", "animate these lyrics", turn an MP3 into a video, or make a promotional or explainer song video for a product, brand or company, even if they don't say "painted" or "animation". It does not make or edit music.
---

# Painted music video

Turn a finished song (an MP3 plus its lyrics) into a hand-painted, story-driven music video. Every frame is painted
procedurally in watercolour and ink as a pure function of song time, so the whole film renders in parallel and stays
locked to the music: shots cut on the lyrics, gestures land on words, mouths move with the singing, and the sung
line runs along the bottom as karaoke.

The song is the input, not the output. This skill never writes, generates, edits or re-times the music, and it never
rewrites the lyrics. The video follows the song as sung. If the person wants a different song, they make it
elsewhere and bring the new MP3 back. A changed song after the film is built is a re-cut (see
[references/recut.md](references/recut.md)), not a rebuild.

## What you need from the person

Both of these are required. Ask for whichever is missing before doing anything else:

1. **The song**: an MP3 (or any audio file ffmpeg reads: m4a, wav).
2. **The lyrics as sung**: plain text with one karaoke line per text line. `[Section]` tags like `[Chorus]` are
   welcome. If they paste lyrics into chat, save them to `lyrics.txt` exactly as given.

Then ask, in one message, only what you can't infer from the lyrics. Offer sensible defaults so they can answer
"go ahead":
- What is the video for, and who will watch it? (personal, a brand or product, an event)
- Who should be in it? (the singer as a character, a mascot, real roles like "a teacher" or "a chef")
- Brand assets, if any: a logo PNG, brand colours, and what may or may not be claimed or shown.
- Anything that must or must not appear.

## Setup

The engine lives in `assets/engine/` and the tools in `scripts/`. Start a project with:

```bash
bash <skill>/scripts/new_project.sh <project-dir> <song.mp3> <lyrics.txt>
```

This copies the engine, puts the song at `assets/song.mp3` and the lyrics at `lyrics.txt`, runs `npm install`
(p5, p5.brush, puppeteer-core), and makes a `.venv` with librosa and faster-whisper. It needs node, ffmpeg and
python3, plus Google Chrome or Chromium for rendering (`render.mjs` finds it, or pass `--chrome=`).

## Workflow

Work through these stages in order. Stages 3 and 4 end with the person's approval. Getting the story and the cast
right on paper is cheap, and changing them after the shots are built is expensive.

### 1. Analyse the song

```bash
.venv/bin/python tools/analyze_song.py assets/song.mp3       # src/beats.js + tools/words.json; prints config values
.venv/bin/python tools/align_lyrics.py lyrics.txt            # src/lyrics.js + tools/lyrics_windows.json + a report
```

- Put the printed `duration`, `bpm`, `offset` and the song's title into `src/config.js`.
- Read the alignment report. Fix every line flagged GUESSED, LOW, START? or END? by checking `tools/words.json` around
  it and editing that line's start and end in `tools/lyrics_windows.json`. Then re-run with
  `--windows=tools/lyrics_windows.json`.
- Lines flagged SPLIT? are too wide for the karaoke band. Split them in `lyrics.txt`.
- Note the instrumental gaps, the intro and outro lengths, and the loudness-per-bar map. They show where the song
  breathes and where it builds, and that's what the storyboard is built around.

Details and pitfalls (half- or double-time tempo, misheard invented words, Whisper prompt bias) are in
[references/audio.md](references/audio.md).

### 2. Find the story

Read the lyrics as a story before thinking about pictures:
- Who is singing, to whom, and what do they want?
- What changes between the first verse and the last chorus? That change is the arc.
- What is the hook (the chorus line everyone will remember)? What does the bridge turn on?

A video that only illustrates nouns line by line feels like clip art. One that follows a character through a change
feels like a film.

### 3. Storyboard: wait for approval

Write `STORYBOARD.md` in the format in [references/storyboard.md](references/storyboard.md):
- the idea, the cast and the world with its palette arc;
- the devices that tie it together;
- then one table per song section, with rows of Time | Lyric | Shot | Out.

Time it from the aligned lyrics, not by guessing. Share it, and wait for the person's reaction before writing any
scene code. For a brand video, also list every claim the visuals make and check each one against what the person
told you.

### 4. Cast: wait for approval

Design the characters as `LOOKS` entries in `src/cast.js`, using `person()` for humans. Build a mascot or creature on
`clawd()`, or write a new painted character in the same style (see [references/engine.md](references/engine.md)).
Render the model sheet and the arm check, and look at both yourself before showing them:

```bash
node render.mjs --loop=cast --sheet=1 --cols=1 --w=1920 --out=out/check/cast.jpg
node render.mjs --loop=arms --sheet=0 --cols=1 --w=1920 --out=out/check/arms.jpg
```

Show the cast sheet to the person. If there's a logo, set `PROJECT.logo` and composite the real bitmap with `logoAt()`
on a plaque in the logo's background colour. Never repaint or re-letter a logo.

### 5. Build the chapters

Write one file per song section (`src/ch/c01_verse1.js`, ...), each an IIFE ending in `shots([...])`, and add each
one to `studio.html` in order. Delete the example chapter once the first real one exists.
- **Key everything to the lyrics** with `lineT(i)`, `wordT(i, k)` and `wordAt(i, 'word')`, so a re-timed lyric file
  moves the shots with it. Cut a beat or so before a line starts, and land hits with `beatT()`.
- **Build and check one chapter at a time.** Block each shot's key poses as stills first (`--sheet` at the key
  times), then add the motion between them.
- **Before writing motion, read [references/craft.md](references/craft.md).** Its calm-motion defaults come from
  real viewer feedback, and ignoring them is the most common reason a first cut gets sent back.

### 6. Review loop

You can't see motion by reading code. Render and look, at three zoom levels: contact sheets per chapter, strips
across every seam and key move, and crops of faces and hands. Then run the numeric checks:

```bash
node render.mjs --sheet=<shot starts, middles and ends> --cols=4 --w=480 --out=out/check/ch1.jpg
node render.mjs --motion=34:36 --out=out/check/motion.jpg      # bounce, shimmer, flap or shake show up as d2
node render.mjs --determinism=10,60,120                        # a frame must equal itself
```

What to look for, and how to turn notes like "too jittery" or "the arms look weird" into fixes, is in
[references/review.md](references/review.md).

### 7. Render and deliver

```bash
node render.mjs --frames --workers=3          # out/frames/f00000.jpg ... (parallel, resumable)
node render.mjs --encode --audio=assets/song.mp3 --out=out/<title>.mp4
```

- **Budget about 0.4–0.7 s per frame** with 3 workers on an Apple-silicon laptop. A 3-minute song is about 4,300
  frames, or 30–50 minutes.
- **Run it in the background** and check its progress. If it's interrupted, re-run the same command: finished frames
  are skipped. A chapter-only preview is `--frames --range=a:b`, and a half-cost draft is `--fps=12` (encode with the
  same `--fps`).
- **Before handing it over:**
  - Check the MP4's duration with ffprobe.
  - Pull a few frames back out of the MP4 and compare them with the page at the same times.
  - Spot-check that the karaoke matches the singing.
- **Give the person the MP4** with a short list of what's in it and what you'd look at next. Expect notes. Each round
  of feedback is a few targeted fixes plus a re-render of the frames that changed. Delete the changed range from
  `out/frames` and run `--frames` again.

## Defaults worth keeping unless the person asks otherwise

- **Calm, not twitchy.**
  - Characters stand still on the ground and act on purpose.
  - Nothing bobs to the beat, the camera never shakes, and still linework never boils.
  - Back-and-forth idle motion reads as jitter in a music video. The person will ask for it to be removed, so don't
    add it in the first place.
- **Text-light.** The karaoke band is the only running text, plus a title card and an end card. Everything else is
  shown, not written.
- **One-shot actions.** A paper plane crosses the room once. Use `seg()` and `ease()` for one-off events, never `frac(t)`
  loops that repeat inside a shot.
- **Every seam has a motivated transition**: a brush wipe, an iris, a match cut, a cut on action, or a camera move
  that carries across.
- **Determinism.** Every frame is a pure function of time. Per-frame counters are reset in `draw()`, and every brush
  shape is seeded on its own. Run `--determinism` after adding any new character or prop.

## Reference files

| file | read it when |
|---|---|
| [references/storyboard.md](references/storyboard.md) | writing STORYBOARD.md: format, mapping a song's structure to shots, story devices, brand guardrails |
| [references/craft.md](references/craft.md) | before building shots: the look, calm motion, timing, transitions, lip-sync, common failures |
| [references/engine.md](references/engine.md) | while coding: files, painting, time and beat helpers, camera, characters, props, karaoke, logo, pitfalls |
| [references/review.md](references/review.md) | checking work and turning feedback into fixes; rendering and verifying the MP4 |
| [references/audio.md](references/audio.md) | the beat map, Whisper word times, lyric alignment and fixing it |
| [references/recut.md](references/recut.md) | the song changes after the film is built (a new take, a shorter edit) |
