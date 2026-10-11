# music

Claude skills for writing songs and painting their music videos.

## Skills

### suno-song

Turns any subject (a product, a family, an event) into copy-paste inputs for Suno: title, three style boxes, exclude styles, a tagged lyrics box and generation settings. The song stands on its own, and [painted-music-video](#painted-music-video) can make a music video from the finished take.

Steps: brief and mine the subject, pitch five directions, write the chorus, map the song, write the rest and revise, engineer the Suno inputs, hand off, and optionally check the takes. You choose at three points: the direction, the chorus and the finished lyrics. The chorus comes first and is built around a short, singable hook that belongs to the subject, with a second hook (a vocal hook, chant or riff) beside it. The take check reuses painted-music-video's audio scripts to measure length, tempo and lift and to flag lines that came out unclear. [SUNO.md](skills/suno-song/SUNO.md) holds the Suno craft step 6 applies (style boxes, exclusions, tags, pronunciation, settings, fixing takes), distilled from the suno-engineer skill in [bitwize-music](https://github.com/bitwize-music-studio/claude-ai-music-skills). No other plugin is needed.

### painted-music-video

Turns a finished song (an MP3 plus the lyrics as sung) into a hand-painted, watercolour-and-ink music video with a story, characters, word-by-word karaoke and lip-sync, rendered to an MP4. Steps: analyse the song, find the story, storyboard, cast sheet, build one chapter per song section, review, render. Needs node, ffmpeg, python3 and Chrome. It never makes or edits music, so it pairs with suno-song.

## Install

As a Claude Code plugin:

```
/plugin marketplace add jinchoice/music
/plugin install music@jinchoice-music
```

The skills are then available as `music:suno-song` and `music:painted-music-video`.

With the [skills CLI](https://skills.sh):

```
npx skills add jinchoice/music
```

Or by hand: copy `skills/suno-song` and `skills/painted-music-video` into `~/.claude/skills/`.

## Layout

```
.claude-plugin/
  marketplace.json   marketplace listing this repo as one plugin
  plugin.json        plugin manifest
skills/
  suno-song/
    SKILL.md         the skill
    SUNO.md          Suno craft, read in step 6
    EXAMPLE.md       worked example and quality bar
  painted-music-video/
    SKILL.md         the skill
    references/      storyboard, craft, engine, review, audio and re-cut guides
    scripts/         project setup, song analysis, lyric alignment, re-cut
    assets/engine/   p5.js + p5.brush renderer, copied into each video project
```
