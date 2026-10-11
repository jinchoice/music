# Writing the storyboard

The storyboard is where the video is decided. Write it in `STORYBOARD.md` before any scene code, time it from the
aligned lyrics (`src/lyrics.js` and the alignment report), and get the person's reaction before you build. A
storyboard change costs minutes; a change to a built chapter costs hours.

## Contents
1. Before you write: read the song
2. The format
3. Mapping the song's structure to shots
4. Devices that make it one film
5. Brand and product videos
6. Checklist

---

## 1. Before you write: read the song

From the alignment report and the lyrics, write down:
- **The sections and their times:** intro, verses, pre-choruses, choruses, bridge, instrumental breaks, outro. The
  `[Section]` tags give their names; the gaps over 4 s show the breaks. The loudness-per-bar map from
  `analyze_song.py` shows where the song builds and where it drops.
- **The voice:** who the "I" is, who "you" is, what they want, and what stands in the way.
- **The arc:** how the singer's situation or feeling differs between the first verse and the last chorus. If the
  lyrics don't change, the staging has to (the same wish, sung bigger, more people, the dream nearer each time).
- **The hook:** the chorus line everyone will remember. It gets the strongest, simplest image in the film, and that
  image returns every chorus.
- **The turn:** usually the bridge or the last pre-chorus. Something happens that changes the second half.

## 2. The format

```markdown
# <Song title>: storyboard

## The idea
Three to six sentences: the world, the main character, what they want, what changes, how it ends. Then the rules for
this video in a line each (e.g. "something happens in every shot", "text-light: karaoke only").

## Cast
| Who | Look | Role |
|---|---|---|
| **<Name>** | What they look like, specifically enough to draw: build, clothes and colours, hair, one signature prop. How the look changes across the song (tired → rested). | Their part in the story and their arc. |
| **<Recurring prop>** | ... | What it does each time it appears. |

## What ties it together
- the sets (one place per chapter; which chapters share a set)
- mirror shots, foreshadowing, the recurring prop, the bookend, the palette arc (see section 4)
- the camera's general behaviour, the size of the characters in frame

### Palette
| Name | Hex | Use |
|---|---|---|

---
The song is `assets/song.mp3` (m:ss, ~N BPM). Times below are the aligned lyric times. Note anything that differs
between the written and the sung lyrics.

## 0 · <Section name> (start–end) · <the palette of this chapter>

| Time | Lyric | Shot | Out |
|---|---|---|---|
| 0.0–3.9 | (intro) | What we see, and the EVENT: what changes between the shot's first frame and its last. Who reacts, and how. The camera's move. | The transition out (or — for a cut on action) |
| 3.9–7.4 | First sung line, | ... | ... |
```

Each chapter becomes one code file (`src/ch/cNN_<name>.js`), so keep the chapters the same as the song's sections.

- **The Time column comes from `src/lyrics.js`.** A shot starts on (or just before) its line's first word; an
  instrumental stretch gets a time range and a description in place of a lyric.
- **The Shot column describes action, not a picture.** "The lead stands in the rain" is a picture. "The lead's
  umbrella turns inside out on 'blow', and they laugh and let it go" is a shot.
- **Mark the hits**: the word or beat a gesture, impact, cut or reveal lands on ("the door slams on 'gone'"). They're
  what makes it feel locked to the music.
- **The Out column names the transition at every seam.** Within a chapter most seams are cuts on action or camera
  moves; between chapters they're bigger (a wipe, an iris, a match cut, a flash, a push through a window).

## 3. Mapping the song's structure to shots

- **One shot per line or couplet** is the natural grain (2–5 s each). Faster than one per line feels like a
  slideshow; slower than one per couplet needs a lot of action inside the shot.
- **Verses tell the story.** Each verse line gets its own concrete, physical gag or action that acts out the line's
  meaning. Don't illustrate every noun; pick the one image that carries the line.
- **A list in the lyrics** ("wash it, dry it, fold it, stack it") is a gift: one snap mini-shot per word, a beat
  each. Make it a motif and repeat it with a twist (the same four shots at night, faster, worse).
- **Choruses return to one place**, a chorus stage or set, and escalate each time (alone in a spotlight → the problem
  bigger → the wish nearer → everyone together). The repetition is what makes them feel like choruses.
- **Backing vocals and call-and-response** ("(oh yeah!)", "— No way!") belong to a second voice: a group of extras, a
  chorus of props with faces, a character who answers.
- **Instrumental breaks** are for what doesn't need words: a journey, a transformation, a time-lapse, a reveal, a
  dance. Never leave a break as a held still.
- **The bridge is the turn.** Change the light, the set or the cast here so the second half visibly differs.
- **The final chorus is the biggest staging in the film**: the whole cast, the full palette, every payoff.
- **The outro rhymes with the opening** and ends on the end card (title, artist, or the brand's real logo). Give the
  last read time to land before the audio ends.
- **Time the reads.** For every shot, list what the viewer has to understand, in order, and give each read time to
  land (a gesture can be quick; what it means needs a held moment). If a shot's reads don't fit its line, move a
  read to the next shot or cut it.

## 4. Devices that make it one film

Pick a few; they're what separates a film from a playlist of clips.
- **Sets, not cards.** Each chapter happens in one place the camera moves through, and the choruses share a set.
- **Mirror shots.** For a before/after song, each problem in the first half has a matching fix in the second half,
  with the same framing, camera move and timing, so the change reads instantly. Mark them "mirror of …".
- **A recurring prop** that changes state every time it's seen, such as a pile that grows, a plant that wilts and
  blooms, or a clock.
- **A story clock.** For a song about time (a long day, waiting, a deadline), drive every clock from one
  function of song time so they always agree, and let it be one of the jokes.
- **Foreshadowing.** Plant the turn early: a light blinking in a window, a poster in the background, a character
  glimpsed in a crowd.
- **Daydreams come true.** Whatever the singer wishes for in an early chorus shows up for real later.
- **A bookend.** A curtain, a window, a door, a photo: the film opens and closes on it, changed.
- **A palette arc.** Each chapter has its own palette (write it in the chapter heading), and the arc follows the
  story: cold → warm, grey → colour, night → dawn.
- **Motivated transitions.** The action carries you across the cut: a push through a window, a camera flash, a bubble
  popping, a match cut from one round thing to another, a door bursting open. Use the brush wipe once or twice, not
  everywhere.

## 5. Brand and product videos

When the song is for a company, a product or a cause:
- **Claims guardrails.** List every claim the video makes, in the lyrics and in the pictures. Each one must be true,
  must be something the person confirmed, and must not promise more than the lyrics do. A picture can over-claim as
  easily as a word: an AI doing the human's job implies something different from an AI helping them do it.
- **The real logo, never a painted copy.** Use the PNG with `logoAt()`. The brand name appears in the karaoke and on
  the end card; nowhere else unless it's the joke.
- **Brand colours, softened.** Put them in `PAL` with watercolour-friendly variants, and give the brand's colour a
  job in the palette arc (it arrives when the product does).
- **No real people, regulators, competitors or trademarks** in the pictures unless the person supplied and approved
  them. Make generic stand-ins.
- **A mascot** for a product works well in this style: design it in the Cast section like any character, with a
  look that echoes the logo.

## 6. Checklist

Check every storyboard before you show it:
- Is every sung line, break, intro and outro covered, with the times from the aligned lyrics?
- Does every shot have an event, and a reaction to it?
- Does the arc show: is the last chorus visibly different from the first?
- Is the hook's image strong, simple, and repeated?
- Does every seam have a transition, and are the chapter seams motivated?
- Is it text-light? (No signs or captions that repeat the lyric: the karaoke already does that.)
- Does the ending rhyme with the opening, and does the last read have time to land?
- For a brand video: is every claim listed and true, and is the logo the real one?
