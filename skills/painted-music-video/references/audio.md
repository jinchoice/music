# Audio: beats, words and lyric timing

The video hangs on two timings taken from the song: the **beat map** (for hits and cuts) and the **lyric timing**
(for the karaoke, lip-sync and every shot keyed to a word). Both come from the person's MP3; nothing about the
music is changed.

## Contents
1. analyze_song.py: duration, beats, loudness, Whisper words
2. align_lyrics.py: lines and words
3. Fixing the alignment
4. Pitfalls

---

## 1. analyze_song.py

```bash
.venv/bin/python tools/analyze_song.py assets/song.mp3 [--shift=0] [--model=small.en] [--lang=en] [--prompt=lyrics.txt] [--no-words]
```

- **Duration** comes from ffprobe. The video's `duration` is the song's length.
- **Beats** come from librosa's beat tracker, regularised into one time per beat and then smoothed: the residual from a
  straight tempo line is medianed over 5 beats, then averaged over 9. Single misplaced beats vanish while real tempo
  drift stays. The result is written to `src/beats.js` as `BEATS`, and `bpOf`/`beatT`/`pulse` use it.
- **Downbeats:** beats 0, 4, 8, … are treated as bar starts. librosa doesn't know where the bar starts, so check a
  strip of a hit on `beatT(4 * n)` against the music. If it's off by one to three beats, re-run with `--shift=1..3`.
- **Tempo** can come out at double or half the felt tempo (the script warns outside 70–160 BPM). If the hits feel
  twice as busy, keep every other beat; if they feel half as busy, interpolate (or just use `beatT(b * 2)` in the
  shots).
- **Loudness per bar** is printed as a strip of ▁▄█: a rough map of where the song builds (choruses, the final chorus)
  and drops (breaks, a bridge). Use it for the storyboard's energy.
- **Words:** faster-whisper (`small.en` by default; `--model=small --lang=xx` for other languages) writes every
  recognised word with its start and end to `tools/words.json`. It takes a few minutes on a CPU.

## 2. align_lyrics.py

```bash
.venv/bin/python tools/align_lyrics.py lyrics.txt [--srt=out/lyrics.srt]
```

- **The lyrics file:**
  - one karaoke line per text line
  - `[Section]` tag lines name the section
  - other `[bracketed]` text is dropped
  - `(backing vocals)` stay in the line
  - LRC timestamps (`[01:23.45] words`) are taken as line starts
- **How it aligns:** one global, order-preserving alignment of every lyric word to the Whisper words, by dynamic
  programming over the whole song.
  - Matching tolerates spelling, numbers ("sixty" = "60") and accents.
  - It handles a word heard as two, two words heard as one, and mishearings (as weak anchors).
  - Because it's global and ordered, repeated choruses can't swap places.
- **Words Whisper missed** are spread between their neighbours. A line it missed entirely is placed between the lines
  around it and flagged.
- **Output:**
  - `src/lyrics.js`: `LY = [[start, end, text, [word starts]], ...]` and `LY_SECTIONS = [[t, name], ...]`
  - `tools/lyrics_windows.json`: line windows to hand-edit
  - optionally an SRT for upload sites that take captions
- **The report** prints one row per line, with the share of words heard and these flags:

  | flag | means | do |
  |---|---|---|
  | GUESSED | Whisper heard none of the line | find it by ear in the gaps of `words.json` (or by the loudness and neighbouring lines) and set its window |
  | LOW | under 40% heard | check the window edges |
  | START? / END? | the first or last two-plus words weren't heard, so that edge is extrapolated | check that edge; these are often off by seconds |
  | LONG | the line spans over 9 s | probably a long held note (fine) or two lines merged (split it) |
  | SPLIT? | over 60 characters | too wide for the karaoke band: split it in `lyrics.txt` |

## 3. Fixing the alignment

1. Look at `tools/words.json` around the flagged line. The transcript usually shows what was heard there, even if
   misheard.
2. Edit that line's `[start, end, text, section]` in `tools/lyrics_windows.json`. Keep the other lines as they are,
   and keep the windows in order without overlapping.
3. Re-run with `--windows=tools/lyrics_windows.json`. Each line's words are then re-timed inside its window.
4. Spot-check the result in the page: scrub to the line in `studio.html` with the audio playing in another tab, or
   render `--clip --range=a:b` and watch it.

The texts in the windows file are what the karaoke shows. To change how a word is displayed (a brand spelled
properly where the singer sings it phonetically), edit the text there or in `lyrics.txt`. Keep the number of words
close, so the word times still line up.

## 4. Pitfalls

- **Invented words, brand names and non-English words** are often misheard (a made-up name sung as "Zorvana" can come back as "so far now"). They
  show up as GUESSED or LOW lines, or as weak matches. Fix their windows by hand.
- **`--prompt=lyrics.txt` biases Whisper** toward the lyrics: it can "hear" a lyric where something else is sung, or
  where nothing is. Run without it first, and use it only to rescue specific lines. Compare the two runs before
  trusting it.
- **Backing vocals and choirs** are often unheard. The script spreads those words, which is usually fine for the
  karaoke sweep. Lip-sync the lead only.
- **Lines that start after a long instrumental** can be placed early when their first words weren't heard
  (START?). Check every line after a break.
- **Some audio files carry lyric timestamps** (an `.m4a` export from an AI music service may include a `mov_text`
  lyric track; `ffprobe` lists it as a subtitle stream). If the person's file has one, extract it with `ffmpeg -i song.m4a -map 0:s:0 lyrics.srt`, turn its times into LRC line
  starts in `lyrics.txt`, and the alignment will use them. Tag lines in such tracks may have zero duration; skip
  them.
- **Re-run both scripts** if the person sends a new version of the song. If the film is already built on the old
  one, see recut.md.
