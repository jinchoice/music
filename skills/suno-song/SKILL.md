---
name: suno-song
description: Suno song inputs (title, style, lyrics, settings) for any subject the user brings, from a product to a family, shaped for a lyric-synced animated music video. Use when the user wants a song, jingle, or music video written for Suno.
---

# Suno song

Turn a subject (any theme, plus whatever material the user provides about it) into copy-paste inputs for Suno. The song is the first half of a lyric-synced animated music video, which the painted-music-video skill makes from the finished song: every frame is animated against a fixed beat grid, and every lyric line becomes one 1.5–4 s shot. That is why this skill insists on a steady tempo and on *paintable* lines. [SUNO.md](SUNO.md) holds the Suno craft (style boxes, exclusions, tags, pronunciation, settings, fixing takes) that step 5 applies.

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

Summarise the fact sheet in a few lines, then pitch **5 directions in 5 distinct genres**, each with whatever concept fits the subject best. For each, give the premise, genre, tempo and feel, a sample hook line and the second hook it pairs with (a vocal hook, chant or riff), how it covers each pillar, one strength and one weakness. If v6 handles the genre poorly (grunge, metal, alt-country and synth-pop; rock and vintage-soul vocals drift generic), name that as its weakness. End with a recommendation (combining two is fine). If the material has outcome claims, ask whether they may be sung (see Claims in step 4).

Stop here until the user picks.

### 3. Write the chorus

Write the chorus before anything else, and write the rest of the song to set it up. Suno writes the melody, so the words can only make a catchy one likely, through rhythm, repetition, rhyme and vowel sounds. [EXAMPLE.md](EXAMPLE.md#hooks) shows both hooks at work.

1. **Draft 8–10 hook candidates** for the chosen direction and test each one:
   - **Short**: 3–6 syllables.
   - **Idiomatic**: a phrase people already say, or a twist on one ("Don't just survive, thrive"; "Love All" for a family of tennis players).
   - **Singable**: stresses on the strong beats, and an open vowel on the syllable it holds (day, high, go, free).
   - **Safe**: no homograph, initialism or name Suno might mangle.

   The best one becomes the title, or sits inside it.
2. **Build the chorus around the hook.**
   - The hook is the chorus's first or last line (or both), sung at least twice.
   - No chorus line runs longer than 9 syllables, the top of the verse range. Fewer words than the verses leave room for held notes, and the contrast is what makes a chorus land.
   - Rhyme the line ends with perfect rhymes. Parallel lines share a stress pattern, so they fit one melody ("I know the trail, I know the way").
   - Carry one idea: the core promise, or the heart of the subject (an outcome claim only if the user opted in; see Claims in step 4). The verses cover the other pillars. Chorus lines don't each need their own picture, because every chorus returns to the same set in the video, with a prop that escalates each time.
3. **Add a second hook**, whichever suits the direction: a wordless vocal hook in a post-chorus ("oh-oh-oh", "na-na-na"), a chant or call-and-response, or a signature instrument riff for the style box. Something that repeats without words is easy to remember and easy to sing back.

Present the top two or three choruses, each with its second hook, and recommend one. Stop here until the user picks.

Done when, for every chorus shown:
- its hook passes all four tests and is sung at least twice;
- no line runs longer than 9 syllables;
- its line-end rhymes and the stress patterns of its parallel lines have been checked.

### 4. Write the rest

Draft the remaining sections around the chosen chorus with plain section tags (`[Verse 1]`, `[Pre-Chorus]`); step 5 adds the cues. [EXAMPLE.md](EXAMPLE.md) sets the quality bar for paintable lines and pillar coverage, and shows a finished hand-off. Its form and sound (chants, call-and-response, drum break, key lift) belong to that song; each new song takes its form from its own direction.

- **Paintable lines.** Each verse, pre-chorus and bridge line is one drawable image or action (boxes sinking in quicksand, a cartwheel that lands in a hug), sung in 1.5–4 s, because each line becomes one shot. Abstract lines ("optimise your growth") have no shot.
- **Line length.** Aim for 7–9 syllables in verse lines (rap runs longer). Suno locks onto lines that size and rushes longer ones, and they fit inside one shot.
- **Line endings.** End lines on stressed nouns and verbs, and rhyme them; near rhymes are fine outside the chorus. Endings like "the", "of" and "and" get swallowed.
- **Length.** 200–350 words; two verses, a chorus and a bridge is the sweet spot. Budget the sections against the target length (default 2:30–3:00), reaching the first chorus by about 0:45: a bar lasts beats-per-bar × 60 / BPM seconds, 2 s for 4/4 at 120 BPM.
- **Hook early.** Open with a fragment of the hook or the second hook, so it's heard within the first 10 s ("Oh-oh-oh-oh, thrive!").
- **Pre-chorus.** A ramp: shorter lines than the verse, rising, ending on a phrase the chorus answers ("Now I'm climbing, climbing up!").
- **Chorus repeats** word for word: a changed line is reported to come back with a new melody. Save any change for one deliberate escalation line in the final chorus.
- **Verses and bridge.** Verse 2 moves on in time, view or stakes; twin verses sound machine-written and hand the video the same shots twice. The bridge changes the key, the view or the truth; if it only restates the chorus, cut it.
- **Parentheses** hold sung echoes and backing vocals only, since Suno sings everything in the Lyrics Box.
- **Sayable words.** Write numbers as words, and rewrite around homographs (live, read, lead, wind, close, tear) when a rewrite costs nothing. Step 5 respells whatever stays ([SUNO.md § Pronunciation](SUNO.md#pronunciation)).
- **Claims.** Use numbers only when they are counts the material states ("a million items priced"). Keep outcome percentages out of the lyrics unless the user opts in: sung numbers carry the same substantiation weight as printed ones.

Done when:
- you can name the shot for every verse, pre-chorus and bridge line;
- every pillar is carried by a specific named line;
- every line's syllables are counted, and any line outside its range is noted for the hand-off;
- every chorus after the first matches the first, except a deliberate escalation line;
- the hook (or the second hook) is heard in the intro, the hook twice in every chorus, and one of them again in the outro.

### 5. Engineer the Suno inputs

Read [SUNO.md](SUNO.md), then build Suno's fields from the draft lyrics and the chosen direction (genre, tempo, key, lead vocal, lead instrument, mood), meeting this **video brief**:

- **Steady tempo**: every style box states the BPM ("steady 118 BPM"), Exclude Styles includes `tempo changes`, every stripped-back section's cue includes "same tempo", and Weirdness sits at the low end of the genre's range.
- **Clean ending**: the lyrics close `[Outro]` → `[End]` on a cold stop.
- **Clear diction**: every vocal description asks for it.
- **Length**: 2:30–3:00 on v6, set by the section budget with Duration on Auto (v6-wild runs anywhere from ~50 s to ~7 min).
- **Three style boxes**: the main plus two alternates in different genres over the same lyrics, one with the opposite vocal gender.

Build:
- **Style Boxes**: vocal first, then genre, tempo and instruments (naming the riff when the second hook is one), then production and atmosphere, every descriptor adding something new.
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

### 6. Hand off

Present everything as fenced code blocks, one per Suno field, in this order: Title, Style Box (main + 2 alternates), Exclude Styles, Lyrics Box, Generation Settings. Follow with a short pillar-to-line map, the respelling table, the risks (pronunciation, a genre v6 handles poorly) plus any lines outside the syllable ranges, then how to generate: in Advanced Mode, with Variety confirmed Off (it resets when the model changes), each style box two or three times before judging it. For a product song, add that commercial use needs a download on a paid plan. Then how to pick a take. It must pass all of these:

1. **Steady tempo, no drift or slowdowns.** This outranks "sounds best": the animation's beat grid depends on it.
2. **Clear diction**, checked on acronyms and proper nouns, with the words as written.
3. **Length near the target** (default 2:30–3:00).
4. **The vocal sits on top of the mix**, and nothing excluded crept in.

Among the takes that pass, the hook decides: listen through the batch once and keep the take whose chorus you're still humming. When no chorus sticks, generate more takes of the main box before changing the lyrics. When the take with the best hook fails a check, fix that take rather than starting over, since its melody is the hard part to get back ([SUNO.md § Fixing a take](SUNO.md#fixing-a-take)).

Ask for two things back: the chosen take's audio (WAV, else MP3) and the lyrics exactly as sung. Those are the two inputs the painted-music-video skill needs, so hand them to it to make the video. If no take passes, diagnose it with [SUNO.md § Fixing a take](SUNO.md#fixing-a-take), change one thing, and send the revised fields.
