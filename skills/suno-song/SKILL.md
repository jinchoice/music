---
name: suno-song
description: Suno song inputs (title, style, lyrics, settings) for any subject the user brings, from a product to a family, shaped for a lyric-synced animated music video. Use when the user wants a song, jingle, or music video written for Suno.
---

# Suno song

Turn a subject (any theme, plus whatever material the user provides about it) into copy-paste inputs for Suno. The song is the first half of a lyric-synced animated music video ([VIDEO.md](VIDEO.md)): every frame is animated against a fixed beat grid, and every lyric line becomes one 1.5–4 s shot. That is why this skill insists on a steady tempo and on *paintable* lines. [SUNO.md](SUNO.md) holds the Suno craft (style boxes, exclusions, tags, pronunciation, settings, fixing takes) that step 4 applies.

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

Summarise the fact sheet in a few lines, then pitch **5 directions in 5 distinct genres**, each with whatever concept fits the subject best. For each, give the premise, genre, tempo and feel, a sample hook line, how it covers each pillar, one strength and one weakness. If v6 handles the genre poorly (grunge, metal, alt-country and synth-pop; rock and vintage-soul vocals drift generic), name that as its weakness. End with a recommendation (combining two is fine). If the material has outcome claims, ask whether they may be sung (see Claims in step 3).

Stop here until the user picks.

### 3. Write the lyrics

Draft the title (usually the hook phrase) and the lyrics with plain section tags (`[Verse 1]`, `[Chorus]`); step 4 adds the cues. [EXAMPLE.md](EXAMPLE.md) sets the quality bar for paintable lines and pillar coverage, and shows a finished hand-off. Its form and sound (chants, call-and-response, drum break, key lift) belong to that song; each new song takes its form from its own direction.

- **Paintable lines.** Each line is one drawable image or action (boxes sinking in quicksand, a cartwheel that lands in a hug), sung in 1.5–4 s, because each line becomes one shot. Abstract lines ("optimise your growth") have no shot.
- **Line length.** Aim for 7–9 syllables in verse lines and 10–12 in chorus lines (rap runs longer). Suno locks onto lines that size and rushes longer ones, and they fit inside one shot.
- **Line endings.** End lines on stressed nouns and verbs. Endings like "the", "of" and "and" get swallowed.
- **Length.** 200–350 words; two verses, a chorus and a bridge is the sweet spot. Budget the sections against the target length (default 2:30–3:00), reaching the first chorus by about 0:45: a bar lasts beats-per-bar × 60 / BPM seconds, 2 s for 4/4 at 120 BPM.
- **Chorus.** Sing the title in it at least twice, and repeat it word for word: a changed line is reported to come back with a new melody. Save any change for one deliberate escalation line in the final chorus.
- **Verses and bridge.** Verse 2 moves on in time, view or stakes; twin verses sound machine-written and hand the video the same shots twice. The bridge changes the key, the view or the truth; if it only restates the chorus, cut it.
- **Parentheses** hold sung echoes and backing vocals only, since Suno sings everything in the Lyrics Box.
- **Sayable words.** Write numbers as words, and rewrite around homographs (live, read, lead, wind, close, tear) when a rewrite costs nothing. Step 4 respells whatever stays ([SUNO.md § Pronunciation](SUNO.md#pronunciation)).
- **Claims.** Use numbers only when they are counts the material states ("a million items priced"). Keep outcome percentages out of the lyrics unless the user opts in: sung numbers carry the same substantiation weight as printed ones.

Done when:
- you can name the shot for every lyric line;
- every pillar is carried by a specific named line;
- every line's syllables are counted, and any line outside its range is noted for the hand-off;
- every chorus after the first matches the first, except a deliberate escalation line.

### 4. Engineer the Suno inputs

Read [SUNO.md](SUNO.md), then build Suno's fields from the draft lyrics and the chosen direction (genre, tempo, key, lead vocal, lead instrument, mood), meeting this **video brief**:

- **Steady tempo**: every style box states the BPM ("steady 118 BPM"), Exclude Styles includes `tempo changes`, every stripped-back section's cue includes "same tempo", and Weirdness sits at the low end of the genre's range.
- **Clean ending**: the lyrics close `[Outro]` → `[End]` on a cold stop.
- **Clear diction**: every vocal description asks for it.
- **Length**: 2:30–3:00 on v6, set by the section budget with Duration on Auto (v6-wild runs anywhere from ~50 s to ~7 min).
- **Three style boxes**: the main plus two alternates in different genres over the same lyrics, one with the opposite vocal gender.

Build:
- **Style Boxes**: vocal first, then genre, tempo and instruments, then production and atmosphere, every descriptor adding something new.
- **Exclude Styles**: `tempo changes` plus at most three bare elements the genres tend to drag in.
- **Lyrics Box**: the lyrics with a Performance Cue on every section tag, atmosphere cues matching the Style Box, and the respellings applied.
- **Respellings**: each respelled word with its display spelling.
- **Generation Settings**: v6, Variety Off, Max Mode On, Vocal Gender per box, Duration Auto, Weirdness and Style Influence from the genre ranges.

When a respelling or a cut changes a lyric, recheck that line's shot and pillar.

Done when:
- every item of the video brief appears in the fields;
- each style box has been measured with `wc -c` and is ≤ 1000, names no artist, and has no "no …" phrase;
- every section tag carries a cue, with at most three bracketed descriptors per section;
- every homograph, initialism, number and proper noun has been checked, and each respelling is applied at every occurrence.

### 5. Hand off

Present everything as fenced code blocks, one per Suno field, in this order: Title, Style Box (main + 2 alternates), Exclude Styles, Lyrics Box, Generation Settings. Follow with a short pillar-to-line map, the respelling table, the risks (pronunciation, a genre v6 handles poorly) plus any lines outside the syllable ranges, then how to generate: in Advanced Mode, with Variety confirmed Off (it resets when the model changes), each style box two or three times before judging it. For a product song, add that commercial use needs a download on a paid plan. Then the take-picking checklist:

1. **Steady tempo, no drift or slowdowns.** This outranks "sounds best": the animation's beat grid depends on it.
2. **Clear diction**, checked on acronyms and proper nouns, with the words as written.
3. **Length near the target** (default 2:30–3:00).
4. **The hook sticks** after one listen.
5. **The vocal sits on top of the mix**, and nothing excluded crept in.

Ask for two things back: the chosen take's audio (WAV, else MP3) and the lyrics exactly as sung. Those start the video phase in [VIDEO.md](VIDEO.md). If no take passes, diagnose it with [SUNO.md § Fixing a take](SUNO.md#fixing-a-take), change one thing, and send the revised fields.
