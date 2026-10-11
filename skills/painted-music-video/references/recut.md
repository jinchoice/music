# Re-cut: the song changed after the film was built

People often come back with a new take of the song: shorter, with a verse dropped, a line re-written or the order
changed. Rebuilding the film for it would throw away hours of work. Instead, play the finished film on the new song
through a **time remap**: every moment of the new song shows a moment of the original timeline. Shared lines play
their original shots with the words pinned together, dropped lines' shots are cut, and the joins are cuts.

The original edition keeps working (`--edition=main`), and the re-cut is a second edition from the same code.

## Steps

1. **Time the new song into separate variables**, so the original data stays untouched:

   ```bash
   cp <new song> assets/song-recut.mp3
   .venv/bin/python tools/analyze_song.py assets/song-recut.mp3 --out=src/beats-recut.js --var=RECUT_BEATS --words=tools/words-recut.json
   .venv/bin/python tools/align_lyrics.py lyrics-recut.txt --words=tools/words-recut.json --out=src/lyrics-recut.js --var=RECUT_LY --windows-out=tools/lyrics_windows-recut.json
   ```

   Fix the alignment as usual (audio.md).
2. **Make the remap:**

   ```bash
   .venv/bin/python tools/recut.py --old=src/lyrics.js --new=src/lyrics-recut.js --old-duration=<old> --new-duration=<new>
   ```

   - **It matches the new lines to the old ones by text, in order.** Each new line becomes a piece that plays its old
     line. Inside a piece, the words both versions share pin old word times to new ones, so a gesture still lands on
     its word.
   - **Consecutive matches join seamlessly;** other joins are cuts (✂).
   - **The intro and outro** map onto the old intro and outro, so the end card plays whole.
   - **The report shows every piece** with its speed (the old film runs faster or slower to fit; `!` marks speeds
     outside 0.6–1.6×), the cuts, the old lines that were dropped, and the new lines with no old match.
3. **Fix what the automatic pass can't know.** Edit `tools/recut_pieces.json`
   (`[newStart, newEnd, oldStart, oldEnd, newLine, oldLine]`) and re-run with `--pieces=tools/recut_pieces.json`:
   - **A new line with no old match** plays on from the previous piece. Point it at an old moment that fits (a
     similar line elsewhere, a reaction shot), or write a new shot for it in the original timeline at an unused time.
   - **A piece at an odd speed** (a gesture at 2×) can take a different old span, or be split into two pieces.
   - **A cut that lands mid-gesture** can move its join to the nearest shot boundary (`node render.mjs --shots` lists
     them).
4. **Add the edition:**
   - In `src/config.js`, add an entry like `recut: { title, duration: <new>, bpm, offset, audio: 'assets/song-recut.mp3', logo }`.
   - In `studio.html`, after `lyrics.js`, add `src/beats-recut.js`, `src/lyrics-recut.js` and `src/recut.js`.
5. **Render it:** `node render.mjs --edition=recut --frames --workers=3`, then
   `--edition=recut --encode --audio=assets/song-recut.mp3 --out=out/<title>-recut.mp4`.

## How it plays

- The shots run at the remapped original time, so everything keyed to the old lyrics (`lineT`, `wordT`) and
  `singMouth` stays consistent with the pictures.
- The karaoke shows the new lyrics (`RECUT_LY`) at new-song time.
- Beat-driven motion follows the new song: `REMAP_NOW = {o, n, k}` routes `bpOf`/`beatT` through `RECUT_BEATS`.
  Anything that averages over beats has to work in the new song's beats too, with spans scaled by `k`. Averaging in
  original time while the beat runs in new time aliases into a flapping limb.
- `poseOf()` (the emotions' fixed poses) is computed once on the original beat grid, so it doesn't change between
  editions.

## Check

- Run a seam sheet for every ✂ in the report, plus a contact sheet per piece that ran at an odd speed.
- Check the karaoke against the new singing.
- Run `--determinism` on the re-cut edition too: `--edition=recut --determinism=...`.
