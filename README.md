# music

Claude skills for writing songs.

## Skills

### suno-song

Turns any subject (a product, a family, an event) into copy-paste inputs for Suno: title, three style boxes, exclude styles, a tagged lyrics box and generation settings. The song is written as the first half of a lyric-synced animated music video, so it holds a steady tempo and every lyric line is a paintable shot. [VIDEO.md](skills/suno-song/VIDEO.md) covers the video phase.

Steps: mine the subject, pitch five directions, write the chorus, write the rest, engineer the Suno inputs, hand off. The chorus comes first and is built around a short, singable hook, with a second hook (a vocal hook, chant or riff) beside it. [SUNO.md](skills/suno-song/SUNO.md) holds the Suno craft step 5 applies (style boxes, exclusions, tags, pronunciation, settings, fixing takes), distilled from the suno-engineer skill in [bitwize-music](https://github.com/bitwize-music-studio/claude-ai-music-skills). No other plugin is needed.

## Install

As a Claude Code plugin:

```
/plugin marketplace add jinchoice/music
/plugin install music@jinchoice-music
```

The skill is then available as `music:suno-song`.

With the [skills CLI](https://skills.sh):

```
npx skills add jinchoice/music
```

Or by hand: copy `skills/suno-song` into `~/.claude/skills/`.

## Layout

```
.claude-plugin/
  marketplace.json   marketplace listing this repo as one plugin
  plugin.json        plugin manifest
skills/
  suno-song/
    SKILL.md         the skill
    SUNO.md          Suno craft, read in step 5
    EXAMPLE.md       worked example and quality bar
    VIDEO.md         video phase, read after the song is chosen
```
