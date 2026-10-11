// config.js: project settings. Fill these in from the song (scripts/analyze_song.py prints duration, tempo and first
// beat). The beat map in src/beats.js wins over bpm/offset wherever it exists.
//   title:    the song's title, painted on the title card (props.js titleCard)
//   duration: the video's length in seconds (the song's length; the last frame is at duration - 1/fps)
//   bpm, offset: nominal tempo and the time of the first downbeat
//   audio:    the song, muxed in by render.mjs (--audio overrides)
//   logo:     optional brand logo PNG, composited as a real bitmap by logoAt() (never repaint a logo)
//
// Editions: if the song is replaced by a new take or edit after the film is built, a re-cut plays the same film on the
// new song (see the skill's references/recut.md). Add its settings under EDITIONS and render with --edition=<name>.
const EDITION = (typeof location !== 'undefined' && new URLSearchParams(location.search).get('edition')) || 'main';
const EDITIONS = {
  main: { title: 'Song Title', duration: 180.0, bpm: 120, offset: 0.0, audio: 'assets/song.mp3', logo: null },
  // recut: { title: 'Song Title', duration: 150.0, bpm: 120, offset: 0.0, audio: 'assets/song-recut.mp3', logo: null },
};
const PROJECT = EDITIONS[EDITION] || EDITIONS.main;
