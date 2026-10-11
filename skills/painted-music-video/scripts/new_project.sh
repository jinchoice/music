#!/usr/bin/env bash
# new_project.sh: start a music-video project from the skill's engine.
#   bash new_project.sh <project dir> <song.mp3> <lyrics.txt>
# Copies the engine (assets/engine) into the project, puts the song in assets/ and the lyrics at lyrics.txt, installs
# the node packages, and makes a Python venv for the audio tools (.venv, with librosa + faster-whisper).
# Safe to re-run: it never overwrites files that already exist in the project.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dir="${1:?usage: new_project.sh <project dir> <song.mp3> <lyrics.txt>}"; song="${2:?song file}"; lyrics="${3:?lyrics file}"
for tool in node npm ffmpeg ffprobe python3; do command -v "$tool" >/dev/null || { echo "missing: $tool (install it first)"; exit 1; }; done
mkdir -p "$dir/assets" "$dir/tools" "$dir/out/check"
cp -Rn "$here/../assets/engine/." "$dir/"
ext="${song##*.}"; [ -e "$dir/assets/song.$ext" ] || cp "$song" "$dir/assets/song.$ext"
[ -e "$dir/lyrics.txt" ] || cp "$lyrics" "$dir/lyrics.txt"
cp -n "$here/analyze_song.py" "$here/align_lyrics.py" "$here/recut.py" "$dir/tools/"
[ -e "$dir/.gitignore" ] || printf 'node_modules/\nout/\n.venv/\n.DS_Store\n' > "$dir/.gitignore"
# placeholders so the page loads before the analysis has run
[ -e "$dir/src/beats.js" ] || echo 'const BEATS = [];' > "$dir/src/beats.js"
[ -e "$dir/src/lyrics.js" ] || printf 'const LY = [];\nconst LY_SECTIONS = [];\n' > "$dir/src/lyrics.js"
sed -i.bak "s#audio: 'assets/song.mp3'#audio: 'assets/song.$ext'#" "$dir/src/config.js" && rm -f "$dir/src/config.js.bak"
(cd "$dir" && npm install --no-audit --no-fund --silent)
if [ ! -x "$dir/.venv/bin/python" ]; then
  if command -v uv >/dev/null; then (cd "$dir" && uv venv -q .venv && uv pip install -q --python .venv/bin/python librosa faster-whisper)
  else python3 -m venv "$dir/.venv" && "$dir/.venv/bin/pip" install -q librosa faster-whisper; fi
fi
echo "ready: $dir"
echo "next:  cd $dir && .venv/bin/python tools/analyze_song.py assets/song.$ext && .venv/bin/python tools/align_lyrics.py lyrics.txt"
