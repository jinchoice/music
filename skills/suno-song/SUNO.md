# Suno craft

How to fill each Suno field so the take follows the brief. Distilled from bitwize-music's suno-engineer skill and its Suno reference docs, current for the v6 model family (September 2026). Behaviour marked "reported" comes from community testing, not Suno's documentation. Examples in backticks illustrate a kind of choice, not a default: pick what fits the song rather than reusing an example's words.

## Ground rules

- **Advanced Mode only.** Simple Mode treats typed lyrics as a seed and writes extra lines.
- **Variety Off.** At any setting above Off, Suno rewrites and expands the Style Box before the model sees it, differently for each take. v6 defaults to Normal, and the default comes back whenever the model is switched.
- **Suno is literal.** Say what you want in plain descriptors. It acts on every word in the Style Box and sings every word in the Lyrics Box.
- **Negatives go in Exclude Styles.** v6 ignores "no drums" typed into the Style Box.
- **Limits**: Style Box 1,000 characters, Lyrics Box 5,000, Exclude Styles 1,000.

## Style Box

Three blocks separated by periods, descriptors within a block separated by commas: `[Vocal]. [Genre, tempo, instruments]. [Production, mood].` The vocal goes first, because Suno weights early words and a vocal described last tends to sit low in the mix. Semicolons, slashes and quotes are reported to parse inconsistently, so leave them out.

- **Vocal**: gender, range, texture and delivery, plus "clear diction". Use audible qualities (alto, baritone, gritty, raspy, smoky, nasal, reedy, twangy, deadpan, half-spoken, belting, chest voice), not intent words. "Powerful" or "defiant" gets the genre's stock voice, and "mature" on its own still comes back young. Two texture words are plenty.
- **Genre**: a primary genre and one or two modifiers, at most three genre terms; bigger fusions come back muddy. An era anchor (`1994 boom bap`, `late-70s disco`) brings instrumentation, mix and vocal style in one phrase.
- **Tempo and density**: the BPM as a number, plus a density word ("driving", "busy", "sparse"). When the box leaves them open, v6 leans slower, sparser and longer than intended.
- **Instruments**: two or three by name (`fretless bass, Rhodes, brushed snare` for late-night jazz-pop; `tabla, sitar drone, sub bass` for an Indian-fusion groove; `accordion, tuba, snare rolls` for a polka). Left unnamed, Suno falls back on the genre's clichés. When the second hook is a riff, say so (`bright marimba riff`).
- **Production**: one or two notes on the mix or the room (`dry close-mic vocal`, `cavernous plate reverb`, `blown-out cassette lo-fi`, `glossy modern pop polish`). "Professional" and "high quality" add nothing.
- **Atmosphere**, only when the song's world calls for it; most songs don't need one. Name the sound (rain, birds, a crowd) in the Style Box. A Lyrics Box cue naming it too makes it come through more reliably, but the Lyrics Box is shared by all three style boxes, so add the cue only when every box uses that sound.
- **Two singers**: say so here ("dual vocalists, male and female, trading verses") as well as in the section tags, or one voice sings everything.
- **No artist names.** v6 swaps them for its own pick ("Artist name replaced"). Describe the sound instead: instrumentation, vocal character, rhythm feel, production era.

Every descriptor should add distinct information. Around ten distinct descriptors works well; what dilutes the box is a synonym pile ("intimate, breathy, whispery, soft" is one idea said four ways). Section-by-section changes stay out of the box and go in Performance Cues.

## Exclude Styles

The field shifts the odds against an element. It is not a hard filter: a Style Box that strongly implies the element still wins, so lean the box away from it too.

- **Bare elements**: `autotune`, not `no autotune`. The field is the negation.
- **At most four items**, and none when nothing needs keeping out. More dilutes each one.
- **What to list**: group vocals Suno adds unasked (`choir`, `gang vocals`, `backing vocals`), unless the song wants them; and whatever the genre tends to drag in (`autotune` on boom bap, `drums, electric instruments` on acoustic folk, `EDM drops` on pop).

One list serves all three style boxes unless an alternate needs its own.

## Lyrics Box

Suno sings everything except bracketed tags. Stage directions, production notes and instrument cues in parentheses get sung, so parentheses hold sung echoes and backing vocals only.

**Section tags.** Tag every section; an untagged block is sung as a verse. `[Verse 1]`, `[Pre-Chorus]`, `[Chorus]`, `[End]` and `[Fade Out]` are the most reliable, and `[Bridge]`, `[Break]` and `[Outro]` mostly work. `[Post-Chorus]` is less tested, though it held in [EXAMPLE.md](EXAMPLE.md). So is `[Refrain]`, for a verse–refrain song: put the refrain line in its own `[Refrain]` section after each verse so Suno treats it as a repeat, and listen for whether it does. `[Intro]` is unreliable: write `[Short Instrumental Intro]` or open on a sung line, which also stops a long intro burying the vocal. Name instrumental sections by instrument (`[Drum Break]`, `[Guitar Solo]`), since a bare `[Solo]` tends to noodle.

**Performance Cues.** Every section tag carries a delivery cue of a word or two: `[Verse 1 - tense]`, `[Chorus - wide open, soaring]`, `[Bridge - easing down]`. Bare tags are a common cause of flat output, because the cues are how the song's arc reaches Suno. A typical arc runs verse low and tight, pre-chorus rising, chorus open and sustained, bridge a new texture. Keep to three bracketed descriptors per section, cues included; more becomes noise.

**Transitions.** Suno switches the arrangement at the tag, so a cue naming where a section ends up (`[Bridge - stripped back]`) right after a full chorus gets a hard cut. Wherever the energy drops between sections, give Suno room. The usual drops are a chorus or post-chorus into verse 2, anything into the bridge, and the way into a quiet last section. Either put a short instrumental tag with no lyrics between them (`[Break]` or `[Interlude]`, a couple of bars that count toward the song's length), or use a cue that describes the move rather than the destination (`[Bridge - easing down]`). This hasn't been tested against a direct cut, so compare a few takes with and without it.

**Phrasing on the page.** A line break is a breath; an ellipsis holds or pauses; a comma mid-line barely registers. A stretched vowel (`lo-ove`, `ohhh`) gives a sustained note. ALL CAPS reads as shouting, unpredictably, so use it on one line at most.

**Ending.** `[Outro]`, then `[End]` on its own line, the strongest stop signal. Without it Suno rambles on or cuts off mid-phrase.

## Pronunciation

Suno reads spelling, not context. Fix in this order: rewrite the line, respell the word, hyphenate it, add context that forces the reading, or accept the risk and flag it.

- **Homographs**: never trust context. High risk: live, read, lead, wind, close, tear, bow, bass, wound, minute, record, present, content, desert, refuse, object, project. Respell for the meaning: `lyve` (alive) or `liv` (a live show), `red` (past-tense read), `led` (the metal), `wynd` (wind a clock).
- **Initialisms**: periods make Suno spell them letter by letter (`F.B.A.`, `A.P.I.`); without them it may say them as a word.
- **Acronyms said as words, brand names and proper names**: respell as they sound (`gooey`, `sass`, `koo-ber-NET-eez`) and hyphenate syllables; a capitalised syllable is reported to force the stress. Check every name in the lyrics: people, products, places.
- **Numbers**: write them as words (`twenty-one`, `a million`). Digits are unreliable.
- **Other languages**: one language per section, the mix named in the Style Box ("bilingual, Spanish verses, English chorus"). Romanise with hyphens where the script is risky (`sa-rang-hae`).

Apply each respelling at every occurrence; the usual miss is a word fixed in a verse and left as it was in the chorus. Keep a respelling table (Suno spelling, display spelling): it goes in the hand-off, so anywhere the lyrics are shown (a lyric sheet, captions, a video's karaoke) uses the display spelling.

## Generation Settings

The model picker sits at the top right of the Create form; pick it first, since switching models resets Variety. The rest are under More Options, below Exclude Styles, in this order.

| Setting | Value | Why |
|---|---|---|
| Model | v6 | The flagship, and its length follows the lyrics. v6-wild runs anywhere from ~50 s to ~7 min on the same prompt. v6-mini is the Free plan's model, and Free output is personal use only. |
| Vocal Gender | From each box's vocal | Steadier than the descriptor alone. |
| Duration | Auto | Custom hard-cuts at the value and rushes lyrics that don't fit. The section budget sets the length. |
| Max Mode | On | Suno recommends it over ~2:00 for consistency through the song (20 credits instead of 10); without it, mixes are reported to go muffled after ~2:30. |
| Weirdness | A best guess for each box (below) | How far Suno strays from the predictable: low gives familiar, hooky choices, high gives surprises. Above ~60 it is reported to bring tempo shifts and structure drift. |
| Style Influence | A best guess for each box (below) | How strictly Suno follows the box: high holds the genre tight, low lets Suno blend and fill gaps its own way. |
| Variety | Off | Above Off, Suno rewrites the Style Box. |
| Personalize | Off | It only acts when Variety is above Off, and then steers the rewrite toward what Suno has learned of your taste (My Taste). |

**Choosing Weirdness and Style Influence.** There's no starting number. Suno's default of 50 / 50 is a reference point, not a target, and the whole 0–100 scale (shown as a percentage) is open. For each style box, weigh what the song needs:

| | Push higher for | Push lower for |
|---|---|---|
| Weirdness | an exploratory or atmospheric brief; a wildcard; a familiar genre at risk of sounding generic; a genre that rewards surprise (jazz, electronic, ambient, art pop); what the user has said they like | a jingle or ad that has to be dependable from its first seconds; a song where a tight, predictable hook matters most (a children's sing-along); a take that came back chaotic |
| Style Influence | a song that depends on one exact sound or era (1920s ragtime, 90s boom bap); Suno drifting off-genre | a fusion of genres, which Suno has to blend or the tags fight; a high Weirdness that needs room; a brief that wants Suno to surprise |

The two interact. High Weirdness with solid Style Influence gives surprises that still sound like the genre; high Weirdness with low Style Influence is a true wild card.

Give each style box its own values, alternates included, since each has its own genre and job. Each value gets a reason that comes from this song: one that would fit any song ("the box is full and holds together") isn't a reason. Say how sure the guess is, and which way to move if the take comes back too safe or too wild.

**Genres v6 handles poorly.** v6 is reported weak on grunge, metal, alt-country and synth-pop, and rock or vintage-soul vocals drift to a generic timbre. A sharp vocal texture descriptor helps. v6-wild has more character there, but its length is unpredictable and polishing a wild take by covering it on v6 is unproven, so it suits a sketch, not a finished take.

**With a Suno Voice** (the user's own cloned voice): drop gender and register from the style boxes, leave Vocal Gender unset, keep Max Mode On and set Audio Influence to 70–85.

## Generating

- Generate each style box two or three times (four to six takes) before judging it. One generation can't tell a weak prompt from bad luck.
- Commercial use, such as a product song or an ad, needs a download on a paid plan. One song is one download, stems included, so download the keeper as WAV.

## Fixing a take

First decide whether it's a prompt problem or a slider problem. The prompt decides what the track is (genre, instruments, tempo, vocal); the sliders decide how strictly Suno follows it. Change one thing per pass (the box, the lyrics or one slider) so the next takes show what helped. If 12–15 generations haven't landed, the direction is wrong, not the luck.

| Symptom | Fix |
|---|---|
| Vocal buried or late | Vocal first in the box, with "clear, prominent lead vocal"; shorten the intro or open on a sung line. |
| Vocal generic | Swap intent words for range and texture (`mezzo-soprano, raw chest voice, rasp on the belts`). If it persists, put the vocal descriptor inside each section tag (`[Chorus: gritty female belt]`), and check the genre word isn't pulling toward a stock pop voice. |
| Vocal too young | A range (`alto`, `baritone`) and older textures (`smoky`, `weathered`); drop `breathy`, `whispered` and `delicate`; exclude `youthful vocals`. |
| Wrong genre | A more specific genre term or an era anchor, then raise Style Influence. |
| Chaotic, structure wanders | Lower Weirdness; keep Style Influence mid to high. |
| Safe or generic | Raise Weirdness, or lower Style Influence, one at a time. |
| Stiff, wooden | Lower Style Influence a little, or simplify the box. |
| Unwanted choir, gang vocals or instrument | Add it to Exclude Styles and lean the box away from it. |
| Slower, sparser or longer than wanted | State the BPM and density in the box; cut a section. |
| A word mispronounced | Respell it. On an otherwise good take, Replace Section with the same lyrics and only that word respelled keeps the rest of the audio. |
| Cuts off, or rambles at the end | `[Outro]`, then `[End]`. |
| Repeats or skips sections | Tag every section, and make verse 2 differ from verse 1. |
| No hook sticks | Generate more takes of the main box first: Suno writes a new melody each time. If two batches pass without one, rewrite the hook. |

**Editing a good take.** When most of a take is right, fix the section, not the song: Replace Section, or Remake in the Song Editor. Make one change per edit, and first write down what must survive it (tempo, groove, the vocal). Listen across the seam for a tempo hitch or a garbled vocal, both reported. Two or three edits or extensions per song is the limit before the vocal degrades.

**Keeping a melody.** When a take has the hook but the wrong sound (vocal, instruments, mix), Cover it with Variety Off, Max Mode On and Audio Influence high (65–100), with the style box changed only where the sound was wrong. Covers made this way are reported to hold the source melody and structure. Check that the hook survived.
