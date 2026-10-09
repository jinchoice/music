# music

Claude skills for writing songs.

## Skills

### suno-song

Turns any subject (a product, a family, an event) into copy-paste inputs for Suno: title, three style boxes, exclude styles, a tagged lyrics box and generation settings. The song is written as the first half of a lyric-synced animated music video, so it holds a steady tempo and every lyric line is a paintable shot. [VIDEO.md](skills/suno-song/VIDEO.md) covers the video phase.

Steps: mine the subject, pitch five directions, write the lyrics, refine with suno-engineer, hand off.

**Requires** the [bitwize-music](https://github.com/bitwize-music-studio/claude-ai-music-skills) plugin for its `suno-engineer` skill (step 4). Without it, the skill stops at draft lyrics.

## Install

As a Claude Code plugin:

```
/plugin marketplace add bitwize-music-studio/claude-ai-music-skills
/plugin install bitwize-music@bitwize-music
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
    EXAMPLE.md       worked example and quality bar
    VIDEO.md         video phase, read after the song is chosen
```
