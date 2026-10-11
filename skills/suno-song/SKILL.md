---
name: suno-song
description: Suno song inputs (title, style, lyrics, settings) for any subject the user brings, from a product to a family, shaped for a lyric-synced animated music video. Use when the user wants a song, jingle, or music video written for Suno.
---

# Suno song

Turn a subject (any theme, plus whatever material the user provides about it) into copy-paste inputs for Suno. The song is the first half of a lyric-synced animated music video, which the painted-music-video skill makes from the finished song: every lyric line becomes one 2–5 s shot (two short lines can share one). That is why this skill insists on *paintable* lines. [SUNO.md](SUNO.md) holds the Suno craft (style boxes, exclusions, tags, pronunciation, settings, fixing takes) that step 6 applies.

## Steps

### 1. Brief and mine the subject

Start with the brief, taken from the user's request:

- **The job**: who the song is for and where it will play (a birthday gift, a product ad, a party, a channel intro), and the feeling it should leave.
- **The voice**: who sings, and to whom (the dog to her family, the owner to the dog, a brand to its customers).
- **Their ears**: any genre, reference song or artist, vocal or length the user asked for. Suno replaces artist names, so translate a reference into its sound: instruments, vocal, rhythm feel, production era.

Don't stop to ask about what the request leaves open. Choose, and state the choice as an assumption at the top of the pitch.

Then read all the material the user provides or points to: their own message, notes, docs, a README, a landing page (in a repo, the page template and every section component it renders, plus its meta title and description). Build a fact sheet with:

- **Pillars**: the things the song must carry, each matched to the passage that supports it. For a product these are its core benefits; for a family, each person and their traits; for an event, its moments.
- **Own words**, verbatim: headlines, taglines, mottos, catchphrases, names.
- **Numbers** the material states, labelled as either counts (items processed, years together) or outcome claims (% more profit).
- **Imagery**: recurring pictures, metaphors, mascots, hobbies, colour worlds. This is often the strongest song concept, and the easiest to miss (one site's every section image was a jungle prop, which became the winning direction; a family with two tennis players became "Love All").
- **Tension**, if any: what the song pushes against, such as life without the product or a busy week that scatters a family.
- For a product, also **objections and risk reducers**: FAQ answers, free trial, setup time, guarantees.

Done when every brief item has an answer or a stated assumption, every pillar points at a passage, and the imagery has been checked across all the material (section by section for a page).

### 2. Pitch directions

Open with the brief's assumptions and a few lines summarising the fact sheet, then pitch **5 directions**. When the user named a genre or a reference, all five stay in that sound and differ in concept, angle and feel; otherwise they span 5 distinct genres. For each, give the premise, genre, tempo and feel, a title and sample hook line and the second hook it pairs with (a vocal hook, chant or riff), how it covers each pillar, one strength and one weakness. Titles and hook lines pass step 3's hook tests. If v6 handles the genre poorly (grunge, metal, alt-country and synth-pop; rock and vintage-soul vocals drift generic), name that as its weakness. End with a recommendation (combining two is fine). If the material has outcome claims, ask whether they may be sung (see Claims in step 5).

Stop here until the user picks.

### 3. Write the chorus

Write the chorus before anything else, and write the rest of the song to set it up. Suno writes the melody, so the words can only make a catchy one likely, through rhythm, repetition, rhyme and vowel sounds. [EXAMPLE.md](EXAMPLE.md#hooks) shows both hooks at work.

1. **Draft 8–10 hook candidates** for the chosen direction, at least half of them built from the fact sheet's own words and imagery rather than from general idioms, and test each one:
   - **Short**: 3–6 syllables.
   - **Familiar**: it sounds like something people say, or a twist on it ("Don't just survive, thrive").
   - **Specific**: it belongs to this subject (a name, a trait, a phrase from the material), so it couldn't title a song about anything else ("Love All" for a family of tennis players). The first pun anyone would reach for fails, because every song gets it ("head over paws" for any pet). If web search is available, search the finalists; a title that is already a common song or brand name fails too.
   - **Singable**: stresses on the strong beats, and an open vowel on the syllable it holds (day, high, go, free).
   - **Safe**: no homograph, initialism or name Suno might mangle.

   The best one becomes the title, or sits inside it.
2. **Build the chorus around the hook.**
   - The hook is the chorus's first or last line (or both), sung at least twice.
   - No chorus line runs longer than 9 syllables, the top of the verse range. Fewer words than the verses leave room for held notes, and the contrast is what makes a chorus land.
   - Rhyme the line ends with perfect rhymes. Parallel lines share a stress pattern, so they fit one melody ("I know the trail, I know the way").
   - Carry one idea: the core promise, or the heart of the subject (an outcome claim only if the user opted in; see Claims in step 5). The verses cover the other pillars. Chorus lines don't each need their own picture, because every chorus returns to the same set in the video, with a prop that escalates each time.
3. **Add a second hook**, whichever suits the direction: a wordless vocal hook in a post-chorus ("oh-oh-oh", "na-na-na"), a chant or call-and-response, or a signature instrument riff for the style box. Something that repeats without words is easy to remember and easy to sing back.

Present the top two or three choruses, each with its second hook, and recommend one. Stop here until the user picks.

Done when, for every chorus shown:
- its hook passes all five tests and is sung at least twice;
- no line runs longer than 9 syllables;
- its line-end rhymes and the stress patterns of its parallel lines have been checked.

### 4. Map the song

Before drafting, write one line per section: what it says, what's new since the section before, and which pillars it carries. [EXAMPLE.md](EXAMPLE.md#song-map) shows the format.

- **Arc.** Verse 1 sets the scene and the tension. Verse 2 moves on in time, view or stakes; twin verses sound machine-written and hand the video the same shots twice. The bridge turns: a new key, view or truth. If it only restates the chorus, cut it.
- **The chorus gains meaning.** Each verse should change what the same chorus means when it comes round again: a promise after verse 1, a fact after verse 2, a view from the top at the end.
- **Length.** 200–350 words; two verses, a chorus and a bridge is the sweet spot. Budget the sections against the target length (default 2:30–3:00), reaching the first chorus by about 0:45: a bar lasts beats-per-bar × 60 / BPM seconds, 2 s for 4/4 at 120 BPM.

The map is also the story the video tells, so it's shown to the user with the lyrics in step 5.

Done when every section has its line, every pillar has a section, and verse 2's line says something verse 1's doesn't.

### 5. Write the rest and revise

Draft the remaining sections from the map, around the chosen chorus, with plain section tags (`[Verse 1]`, `[Pre-Chorus]`); step 6 adds the cues. [EXAMPLE.md](EXAMPLE.md) sets the quality bar for paintable lines and pillar coverage, and shows a finished hand-off. Its form and sound (chants, call-and-response, drum break, key lift) belong to that song; each new song takes its form from its own direction.

- **Paintable lines.** Each verse, pre-chorus and bridge line is one drawable image or action (boxes sinking in quicksand, a cartwheel that lands in a hug), sung in 2–5 s, because each line becomes one shot; a shorter line shares its shot with the next. Abstract lines ("optimise your growth") have no shot.
- **Line length.** Aim for 7–9 syllables in verse lines (rap runs longer). Suno locks onto lines that size and rushes longer ones, and they fit inside one shot.
- **Line endings.** End lines on stressed nouns and verbs, and rhyme them; near rhymes are fine outside the chorus. Endings like "the", "of" and "and" get swallowed.
- **Hook early.** Open with a fragment of the hook or the second hook, so it's heard within the first 10 s ("Oh-oh-oh-oh, thrive!").
- **Pre-chorus.** A ramp: shorter lines than the verse, rising, ending on a phrase the chorus answers ("Now I'm climbing, climbing up!").
- **Chorus repeats** word for word: a changed line is reported to come back with a new melody. Save any change for one deliberate escalation line in the final chorus.
- **Parentheses** hold sung echoes and backing vocals only, since Suno sings everything in the Lyrics Box.
- **Sayable words.** Write numbers as words, and rewrite around homographs (live, read, lead, wind, close, tear) when a rewrite costs nothing. Step 6 respells whatever stays ([SUNO.md § Pronunciation](SUNO.md#pronunciation)).
- **Claims.** Use numbers only when they are counts the material states ("a million items priced"). Keep outcome percentages out of the lyrics unless the user opts in: sung numbers carry the same substantiation weight as printed ones.

Then revise. Read the whole lyric top to bottom, the way a listener will hear it, and:

- rank the lines and rewrite the weakest three to five;
- replace stock images and phrases that could sit in any song (neon lights, shadows, whispers, a heart on fire, dancing in the rain) and stock puns with details from the fact sheet;
- fix any rhyme that forced a word in only for its sound;
- keep one point of view and one tense, unless a change is the point.

Done when:
- you can name the shot for every verse, pre-chorus and bridge line;
- every pillar is carried by a specific named line;
- every line's syllables are counted, and any line outside its range is noted for the hand-off;
- every chorus after the first matches the first, except a deliberate escalation line;
- the hook (or the second hook) is heard in the intro, the hook twice in every chorus, and one of them again in the outro;
- the revision pass is done.

Present the song map, then the lyrics, and stop until the user approves or edits them, unless they asked for the Suno inputs straight away. Only they know whether the names, details and inside jokes are right, and lyric changes after step 6 mean redoing its respellings and cues.

### 6. Engineer the Suno inputs

Read [SUNO.md](SUNO.md), then build Suno's fields from the approved lyrics and the chosen direction (genre, tempo, key, lead vocal, lead instrument, mood), meeting these requirements:

- **Clean ending**: the lyrics close `[Outro]` → `[End]` on a cold stop.
- **Clear diction**: every vocal description asks for it.
- **Length**: 2:30–3:00 on v6, set by the section budget with Duration on Auto (v6-wild runs anywhere from ~50 s to ~7 min).
- **Three style boxes**: the main plus two alternates in different genres over the same lyrics, one with the opposite vocal gender.

Build:
- **Style Boxes**: vocal first, then genre, tempo and instruments (naming the riff when the second hook is one), then production and atmosphere, every descriptor adding something new.
- **Exclude Styles**: at most four bare elements the genres tend to drag in. When nothing needs keeping out, say so instead of filling the field.
- **Lyrics Box**: the lyrics with a Performance Cue on every section tag, atmosphere cues matching the Style Box, and the respellings applied.
- **Respellings**: each respelled word with its display spelling.
- **Generation Settings**: v6, Variety Off, Max Mode On, Vocal Gender per box, Duration Auto, Weirdness and Style Influence from the genre ranges.

When a respelling or a cut changes a lyric, recheck that line's shot and pillar.

Done when:
- every requirement above appears in the fields;
- each style box has been measured with `wc -c` and is ≤ 1000, names no artist, and has no "no …" phrase;
- every section tag carries a cue, with at most three bracketed descriptors per section;
- every homograph, initialism, number and proper noun has been checked, and each respelling is applied at every occurrence.

### 7. Hand off

Present everything as fenced code blocks, one per Suno field, in this order: Title, Style Box (main + 2 alternates), Exclude Styles, Lyrics Box, Generation Settings. Follow with a short pillar-to-line map, the respelling table, the risks (pronunciation, a genre v6 handles poorly) plus any lines outside the syllable ranges, then how to generate: in Advanced Mode, with Variety confirmed Off (it resets when the model changes), each style box two or three times before judging it. For a product song, add that commercial use needs a download on a paid plan. Then how to pick a take. It must pass all of these:

1. **Clear diction**, checked on acronyms and proper nouns, with the words as written.
2. **Length near the target** (default 2:30–3:00).
3. **The vocal sits on top of the mix**, and nothing excluded crept in.

Among the takes that pass, the hook decides: listen through the batch once and keep the take whose chorus you're still humming. When no chorus sticks, generate more takes of the main box before changing the lyrics. When the take with the best hook fails a check, fix that take rather than starting over, since its melody is the hard part to get back ([SUNO.md § Fixing a take](SUNO.md#fixing-a-take)). Offer step 8 to check the takes before choosing.

Ask for two things back: the chosen take's audio (WAV, else MP3) and the lyrics exactly as sung. Those are the two inputs the painted-music-video skill needs, so hand them to it to make the video. If no take passes, diagnose it with [SUNO.md § Fixing a take](SUNO.md#fixing-a-take), change one thing, and send the revised fields.

### 8. Check the takes (optional)

When the user shares takes' audio, before choosing or when a take sounds off and they can't say why, measure them with the painted-music-video skill's audio scripts, which ship in this plugin (`../painted-music-video/scripts/`). If that skill isn't installed, skip this step.

1. In a scratch folder, make a Python venv with librosa and faster-whisper (ffmpeg must be installed), and save the Lyrics Box as `lyrics.txt`.
2. For each take, run `analyze_song.py <take> --out=<scratch>/beats.js --words=<scratch>/<take>-words.json`, then `align_lyrics.py lyrics.txt --words=<scratch>/<take>-words.json --out=<scratch>/lyrics.js --windows-out=<scratch>/windows.json`. Whisper takes a few minutes per take on a CPU.
3. Report per take:
   - **Length** against the target.
   - **Tempo** against the style box's BPM. v6 often comes in slower, and the tracker can read half or double the felt tempo.
   - **Lift**: whether the loudness map rises at each chorus.
   - **Intro**: how long before the first sung line.
   - **Diction**: lines the aligner flags GUESSED (none of it heard: skipped, garbled or buried) or LOW (under 40% heard).

Whisper misses some sung words even when they're clear, so a flag marks a place to listen, not a verdict. Turn each confirmed problem into a fix from [SUNO.md § Fixing a take](SUNO.md#fixing-a-take). Which hook sticks stays the user's call.
