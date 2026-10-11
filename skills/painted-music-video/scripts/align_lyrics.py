#!/usr/bin/env python3
"""align_lyrics.py: time the person's lyrics to the song, line by line and word by word, for karaoke and lip-sync.

    python align_lyrics.py lyrics.txt [--words=tools/words.json] [--out=src/lyrics.js] [--var=LY]
                           [--windows-out=tools/lyrics_windows.json] [--srt=out/lyrics.srt]
    python align_lyrics.py --windows=tools/lyrics_windows.json [...]      (after hand-fixing line windows)

lyrics.txt: the lyrics as sung, one karaoke line per text line. Blank lines are ignored. A line that is only a tag in
square brackets ([Verse 1], [Chorus], [Bridge], [Outro]) names the section for the lines after it. Other [bracketed]
text inside a line is dropped (stage directions). (Parenthesised backing vocals) stay in the line. LRC timestamps
("[01:23.45] words") are used as line starts when present.

How: every lyric word is aligned to Whisper's word timestamps (analyze_song.py → tools/words.json) by one global,
order-preserving alignment (dynamic programming over the whole song, so repeated choruses can't swap places). Words
Whisper heard set their own times; words it missed (backing vocals, invented words, mumbles) are spread between their
neighbours by length. Lines it missed entirely are placed between the lines around them and flagged GUESSED.

Writes
  src/lyrics.js              const LY = [[start, end, text, [start of each word]], ...]; const LY_SECTIONS = [[t, name]]
  tools/lyrics_windows.json  [[start, end, text, section], ...]: edit any line's start/end and re-run with --windows=
                             to re-time just those lines' words inside the new windows.
  --srt                      optional subtitle file (for uploads that take captions)
and prints a report: one row per line with how much of it Whisper heard, plus flags to check by hand.
"""
import difflib, json, os, re, sys, unicodedata

opt = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
pos = [a for a in sys.argv[1:] if not a.startswith('--')]
WORDS, OUT, VAR = opt.get('words', 'tools/words.json'), opt.get('out', 'src/lyrics.js'), opt.get('var', 'LY')
WOUT = opt.get('windows-out', 'tools/lyrics_windows.json')
if not pos and 'windows' not in opt:
    print(__doc__); sys.exit(1)

# ---------- normalising words so lyrics and transcript compare ----------
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()
def num_words(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ('' if n % 10 == 0 else ONES[n % 10])
    if n < 1000: return ONES[n // 100] + 'hundred' + ('' if n % 100 == 0 else num_words(n % 100))
    return str(n)
def norm(s):
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower()
    s = re.sub(r"[’'`]", '', s)
    s = re.sub(r'\d+', lambda m: num_words(int(m.group())) if len(m.group()) < 4 else m.group(), s)
    return re.sub(r'[^a-z0-9]', '', s)
def sim(a, b):
    if not a or not b: return 0.0
    if a == b: return 1.0
    if abs(len(a) - len(b)) > max(len(a), len(b)) * .6: return 0.0
    return difflib.SequenceMatcher(None, a, b, autojunk=False).ratio()

W = json.load(open(WORDS))
W = [w for w in W if norm(w[2])]
HK = [norm(w[2]) for w in W]

# ---------- reading the lyrics ----------
def parse_lyrics(path):
    lines, section = [], None
    for raw in open(path, encoding='utf-8-sig'):
        s = raw.strip()
        if not s: continue
        hint = None
        m = re.match(r'^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$', s)
        if m: hint, s = int(m.group(1)) * 60 + float(m.group(2)), m.group(3).strip()
        if re.fullmatch(r'\[[^\]]*\]', s): section = s[1:-1].strip(); continue
        s = re.sub(r'\s*\[[^\]]*\]\s*', ' ', s).strip()
        s = re.sub(r'\s+', ' ', s)
        if not s or not any(norm(t) for t in s.split(' ')): continue
        lines.append({'text': s, 'section': section, 'hint': hint})
    return lines

def spread(t, a, b):
    """fill None gaps in a line's word times: between neighbours, by position (a, b = the line's window)"""
    i = 0
    while i < len(t):
        if t[i] is None:
            j = i
            while j < len(t) and t[j] is None: j += 1
            lo = t[i - 1] + .18 if i > 0 else a
            hi = t[j] if j < len(t) else max(lo + .2 * (j - i), b - .35)
            n = j - i
            for q in range(n): t[i + q] = lo + (hi - lo) * (q + (0 if i == 0 else 1)) / (n + (0 if i == 0 else 1))
            i = j
        else: i += 1
    for q in range(1, len(t)): t[q] = max(t[q], t[q - 1] + .05)
    return t

def local_times(a, b, text):
    """word times for one line inside a fixed window [a, b]: match the words heard there, spread the rest"""
    shown = text.split(' '); keys = [norm(w) for w in shown]
    heard = [k for k, w in enumerate(W) if a - .25 <= w[0] < b]
    t, hit = [None] * len(shown), 0
    sm = difflib.SequenceMatcher(a=keys, b=[HK[k] for k in heard], autojunk=False)
    for blk in sm.get_matching_blocks():
        for q in range(blk.size):
            if keys[blk.a + q]: t[blk.a + q] = max(a, W[heard[blk.b + q]][0]); hit += 1
    return spread(t, a, b), hit / max(1, len(shown))

# ---------- global alignment ----------
def global_align(lines):
    toks = []   # (line index, word index, key)
    for li, L in enumerate(lines):
        for wi, w in enumerate(L['text'].split(' ')): toks.append((li, wi, norm(w)))
    N, M = len(toks), len(W)
    GAP_L, GAP_W, SUB = -.55, -.45, -.85      # a lyric word not heard, a heard word not in the lyrics, a mishearing
    NEG = -1e18
    S = [[NEG] * (M + 1) for _ in range(N + 1)]; B = [[None] * (M + 1) for _ in range(N + 1)]
    S[0][0] = 0
    for j in range(1, M + 1): S[0][j] = S[0][j - 1] + GAP_W * .3; B[0][j] = 'w'   # transcript before the first line is cheap to skip
    for i in range(1, N + 1):
        ki = toks[i - 1][2]; Si, Sp = S[i], S[i - 1]; Bi = B[i]
        Si[0] = Sp[0] + GAP_L; Bi[0] = 'l'
        for j in range(1, M + 1):
            best, how = Sp[j] + GAP_L, 'l'
            v = Si[j - 1] + GAP_W
            if v > best: best, how = v, 'w'
            s = sim(ki, HK[j - 1])
            v = Sp[j - 1] + (2.0 * s if s >= .72 else SUB)
            if v > best: best, how = v, ('m' if s >= .72 else 's')
            if j >= 2 and ki and len(ki) > 3:      # one lyric word heard as two ("red-ink" → "red", "ink")
                s2 = sim(ki, HK[j - 2] + HK[j - 1])
                if s2 >= .8:
                    v = Sp[j - 2] + 2.2 * s2
                    if v > best: best, how = v, 'm2'
            if i >= 2 and toks[i - 2][0] == toks[i - 1][0]:   # two lyric words heard as one ("every one" → "everyone")
                s3 = sim(toks[i - 2][2] + ki, HK[j - 1])
                if s3 >= .8:
                    v = S[i - 2][j - 1] + 2.2 * s3
                    if v > best: best, how = v, 'l2'
            Si[j] = best; Bi[j] = how
    # the transcript after the last line is cheap to skip too
    jbest = max(range(M + 1), key=lambda j: S[N][j] + (M - j) * GAP_W * .3)
    match = [None] * N   # per token: (start, end, strong?)
    i, j = N, jbest
    while i > 0 or j > 0:
        how = B[i][j] if i >= 0 and j >= 0 else None
        if how is None: break
        if how == 'm': match[i - 1] = (W[j - 1][0], W[j - 1][1], True); i, j = i - 1, j - 1
        elif how == 's': match[i - 1] = (W[j - 1][0], W[j - 1][1], False); i, j = i - 1, j - 1
        elif how == 'm2': match[i - 1] = (W[j - 2][0], W[j - 1][1], True); i, j = i - 1, j - 2
        elif how == 'l2': match[i - 2] = (W[j - 1][0], W[j - 1][0] + (W[j - 1][1] - W[j - 1][0]) / 2, True); match[i - 1] = (W[j - 1][0] + (W[j - 1][1] - W[j - 1][0]) / 2, W[j - 1][1], True); i, j = i - 2, j - 1
        elif how == 'l': i -= 1
        else: j -= 1
    return toks, match

def windows_from_alignment(lines, toks, match):
    per = [[] for _ in lines]
    for (li, wi, _), m in zip(toks, match): per[li].append(m)
    out = []
    for li, L in enumerate(lines):
        ms = per[li]
        strong = [k for k, m in enumerate(ms) if m and m[2]]
        weak = [k for k, m in enumerate(ms) if m and not m[2]]
        n = len(ms)
        if strong:
            k0, k1 = strong[0], strong[-1]
            # weak (misheard) words count as anchors only when they sit inside the strong span or next to it
            a = ms[k0][0] - .3 * k0
            b = ms[k1][1] + .3 * (n - 1 - k1)
            for k in weak:
                if k < k0 and ms[k][0] < ms[k0][0]: a = min(a, ms[k][0])
                if k > k1 and ms[k][1] > ms[k1][1]: b = max(b, ms[k][1])
            times = [ms[k][0] if ms[k] and (ms[k][2] or k0 <= k <= k1) else None for k in range(n)]
            out.append({'a': a, 'b': b, 'times': times, 'heard': len(strong) / n, 'guessed': False, 'start?': k0 > 1, 'end?': n - 1 - k1 > 1})
        else:
            out.append({'a': None, 'b': None, 'times': [None] * n, 'heard': 0.0, 'guessed': True})
    # hints from LRC timestamps override starts
    for L, o in zip(lines, out):
        if L['hint'] is not None:
            if o['a'] is None or abs(o['a'] - L['hint']) > 1.5: o['a'] = L['hint']; o['b'] = None; o['times'] = [None] * len(o['times']); o['guessed'] = False; o['hinted'] = True
    # place guessed lines between their neighbours, by word count
    i = 0
    while i < len(out):
        if out[i]['a'] is None:
            j = i
            while j < len(out) and out[j]['a'] is None: j += 1
            lo = out[i - 1]['b'] + .3 if i > 0 and out[i - 1]['b'] else (out[i - 1]['a'] + 2 if i > 0 else 0.5)
            hi = out[j]['a'] - .3 if j < len(out) else lo + 3.0 * (j - i)
            counts = [len(lines[q]['text'].split(' ')) for q in range(i, j)]; tot = sum(counts) or 1; x = lo
            for q, c in zip(range(i, j), counts):
                span = (hi - lo) * c / tot; out[q]['a'], out[q]['b'] = x, x + span * .92; x += span
            i = j
        else: i += 1
    for i, o in enumerate(out):
        if o['b'] is None: o['b'] = (out[i + 1]['a'] - .1) if i + 1 < len(out) else o['a'] + 3
    # no overlaps: a line ends before the next one starts
    for i in range(len(out) - 1):
        if out[i]['b'] > out[i + 1]['a'] - .05: out[i]['b'] = max(out[i]['a'] + .3, out[i + 1]['a'] - .05)
    return out

# ---------- main ----------
if 'windows' in opt:
    rows = json.load(open(opt['windows'], encoding='utf8'))
    lines = [{'text': r[2], 'section': r[3] if len(r) > 3 else None, 'hint': None} for r in rows]
    result = []
    for r in rows:
        t, heard = local_times(r[0], r[1], r[2])
        result.append({'a': r[0], 'b': r[1], 'times': t, 'heard': heard, 'guessed': False})
else:
    lines = parse_lyrics(pos[0])
    if not lines: sys.exit('no lyric lines found in ' + pos[0])
    toks, match = global_align(lines)
    result = windows_from_alignment(lines, toks, match)
    for o in result: o['times'] = spread(list(o['times']), o['a'], o['b'])

LY = []
for L, o in zip(lines, result):
    a, b = round(o['a'], 2), round(o['b'], 2)
    t = [round(min(max(x, a), b - .05), 2) for x in o['times']]
    for q in range(1, len(t)): t[q] = max(t[q], round(t[q - 1] + .05, 2))
    LY.append([a, b, L['text'], t])
SECTIONS = []
for L, row in zip(lines, LY):
    if L['section'] and (not SECTIONS or SECTIONS[-1][1] != L['section']): SECTIONS.append([row[0], L['section']])

os.makedirs(os.path.dirname(OUT) or '.', exist_ok=True)
with open(OUT, 'w', encoding='utf8') as f:
    f.write('// lyrics.js: generated by align_lyrics.py. [start, end, text, [start time of each word]].\n')
    f.write(f'const {VAR} = [\n' + ',\n'.join('  ' + json.dumps(r, ensure_ascii=False) for r in LY) + '\n];\n')
    f.write(f'const {VAR}_SECTIONS = {json.dumps(SECTIONS, ensure_ascii=False)};\n')
os.makedirs(os.path.dirname(WOUT) or '.', exist_ok=True)
with open(WOUT, 'w', encoding='utf8') as f:
    f.write('[\n' + ',\n'.join('  ' + json.dumps([r[0], r[1], r[2], L['section']], ensure_ascii=False) for r, L in zip(LY, lines)) + '\n]\n')
if 'srt' in opt:
    ts = lambda x: f'{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round(x % 1 * 1000)) % 1000:03d}'
    os.makedirs(os.path.dirname(opt['srt']) or '.', exist_ok=True)
    with open(opt['srt'], 'w', encoding='utf8') as f:
        for k, r in enumerate(LY): f.write(f'{k + 1}\n{ts(r[0])} --> {ts(r[1])}\n{r[2]}\n\n')

# ---------- report ----------
print(f'{len(LY)} lines → {OUT}   (windows → {WOUT})\n')
print(' #   start    end    heard  flags        text')
prev_sec = None
for k, (r, L, o) in enumerate(zip(LY, lines, result)):
    if L['section'] != prev_sec and L['section']: print(f'     [{L["section"]}]'); prev_sec = L['section']
    fl = []
    if o.get('guessed'): fl.append('GUESSED')
    elif o['heard'] < .4: fl.append('LOW')
    if o.get('hinted'): fl.append('LRC')
    elif o.get('start?'): fl.append('START?')
    if o.get('end?') and not o.get('guessed'): fl.append('END?')
    if r[1] - r[0] > 9: fl.append('LONG')
    if len(r[2]) > 60: fl.append('SPLIT?')
    if k and r[0] - LY[k - 1][1] > 4: print(f'     ~ {r[0] - LY[k - 1][1]:.1f}s without singing ~')
    print(f'{k:2d}  {r[0]:6.2f} {r[1]:6.2f}   {o["heard"] * 100:4.0f}%  {" ".join(fl):14s}  {r[2]}')
if LY and LY[0][0] > 3: print(f'\nintro: {LY[0][0]:.1f}s before the first line')
print('\nflags: GUESSED = Whisper heard none of it (placed between neighbours); LOW = under 40% heard; LONG = over 9 s;')
print('       START? / END? = the first / last words weren\'t heard, so that edge is estimated (often off by seconds);')
print('       SPLIT? = over 60 characters, too wide for the karaoke band. Check flagged lines against tools/words.json,')
print('       fix their start/end in the windows file, and re-run with --windows=' + WOUT)
