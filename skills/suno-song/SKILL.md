---
name: suno-song
description: Suno song inputs (title, style, lyrics, settings) for any subject the user brings, from a product to a family, shaped for a lyric-synced animated music video. Use when the user wants a song, jingle, or music video written for Suno.
---

# Suno song

Turn a subject (any theme, plus whatever material the user provides about it) into copy-paste inputs for Suno. The song is the first half of a lyric-synced animated music video ([VIDEO.md](VIDEO.md)): every frame is animated against a fixed beat grid, and every lyric line becomes one 1.5–4 s shot. That is why this skill insists on a steady tempo and on *paintable* lines. This skill owns the concept and the lyrics; the Suno craft (style boxes, tags, exclusions, settings, pronunciation) comes from the `bitwize-music:suno-engineer` skill in step 4.

## Steps

### 1. Mine the subject

Read all the material the user provides or points to: their own message, notes, docs, a README, a landing page (in a repo, the page template and every section component it renders, plus its meta title and description). Build a fact sheet with:

- **Pillars**: the things the song must carry, each matched to the passage that supports it. For a product these are its core benefits; for a family, each person and their traits; for an event, its moments.
- **Own words**, verbatim: headlines, taglines, mottos, catchphrases, names.
- **Numbers** the material states, labelled as either counts (items processed, years together) or outcome claims (% more profit).
- **Imagery**: recurring pictures, metaphors, mascots, hobbies, colour worlds. This is often the strongest song concept, and the easiest to miss (one site's every section image was a jungle prop, which became the winning direction; a family with two tennis players became "Love All").
- **Tension**, if any: what the song pushes against, such as life without the product or a busy week that scatters a family.
- For a product, also **objections and risk reducers**: FAQ answers, free trial, setup time, guarantees.

Done when every pillar points at a passage and the imagery has been checked across all the material (section by section for a page).

### 2. Pitch directions

Summarise the fact sheet in a few lines, then pitch **5 directions in 5 distinct genres**, each with whatever concept fits the subject best. For each, give the premise, genre, tempo and feel, a sample hook line, how it covers each pillar, one strength and one weakness. End with a recommendation (combining two is fine). If the material has outcome claims, ask whether they may be sung (see Claims in step 3).

Stop here until the user picks.

### 3. Write the lyrics

Draft the title (usually the hook phrase) and the lyrics with plain section tags (`[Verse 1]`, `[Chorus]`); step 4 adds the cues. [EXAMPLE.md](EXAMPLE.md) sets the quality bar for paintable lines and pillar coverage, and shows a finished hand-off. Its form and sound (chants, call-and-response, drum break, key lift) belong to that song; each new song takes its form from its own direction.

- **Paintable lines.** Each line is one drawable image or action (boxes sinking in quicksand, a cartwheel that lands in a hug), sung in 1.5–4 s, because each line becomes one shot. Abstract lines ("optimise your growth") have no shot.
- **Line length.** Aim for 7–9 syllables in verse lines and 10–12 in chorus lines (rap runs longer). Suno locks onto lines that size and rushes longer ones, and they fit inside one shot.
- **Length.** 200–350 words; two verses, a chorus and a bridge is the sweet spot. Budget the sections against the target length (default 2:30–3:00): a bar lasts beats-per-bar × 60 / BPM seconds, 2 s for 4/4 at 120 BPM.
- **Parentheses** hold sung echoes and backing vocals only, since Suno sings everything in the Lyrics Box.
- **Claims.** Use numbers only when they are counts the material states ("a million items priced"). Keep outcome percentages out of the lyrics unless the user opts in: sung numbers carry the same substantiation weight as printed ones.

Done when:
- you can name the shot for every lyric line;
- every pillar is carried by a specific named line;
- every line's syllables are counted, and any line outside its range is noted for the hand-off.

### 4. Refine with suno-engineer

Invoke the `bitwize-music:suno-engineer` skill in concept mode (it ships with the bitwize-music plugin; if that isn't installed, tell the user and hand off the draft lyrics). Pass it the draft lyrics, the chosen direction (genre, tempo, key, lead vocal, lead instrument, mood) and this **video brief**:

- **Steady tempo**: every style box states the BPM ("steady 118 BPM"), Exclude Styles includes `tempo changes`, and every stripped-back section's cue includes "same tempo".
- **Clean ending**: the lyrics close `[Outro]` → `[End]` on a cold stop.
- **Clear diction**: every vocal description asks for it.
- **Length**: 2:30–3:00 on a model with predictable length, which means v6 (v6-wild runs anywhere from ~50 s to ~7 min).
- **Three style boxes**: the main plus two alternates in different genres over the same lyrics, one with the opposite vocal gender.

Take back its Style Boxes, Exclude Styles, tagged Lyrics Box (Performance Cues and pronunciation fixes) and Generation Settings table. When it changes a lyric (a respelling, a cut line), recheck that line's shot and pillar.

Done when every item of the video brief appears in its output, and each style box has been measured with `wc -c` and is ≤ 1000.

### 5. Hand off

Present everything as fenced code blocks, one per Suno field, in this order: Title, Style Box (main + 2 alternates), Exclude Styles, Lyrics Box, Generation Settings. Follow with a short pillar-to-line map, the risks suno-engineer flagged (pronunciation, model fallbacks) plus any lines outside the syllable ranges, then the take-picking checklist:

1. **Steady tempo, no drift or slowdowns.** This outranks "sounds best": the animation's beat grid depends on it.
2. **Clear diction**, checked on acronyms and proper nouns.
3. **Length near the target** (default 2:30–3:00).
4. **The hook sticks** after one listen.

Ask for two things back: the chosen take's audio (WAV or MP3) and the lyrics exactly as sung. Those start the video phase in [VIDEO.md](VIDEO.md).
