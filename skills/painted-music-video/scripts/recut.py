#!/usr/bin/env python3
"""recut.py: play a finished film on a NEW take or edit of the song (shorter, re-ordered, partly re-written), without
rebuilding the shots. Every moment of the new song is mapped to a moment of the original timeline.

    python recut.py --old=src/lyrics.js --new=src/lyrics-recut.js --old-duration=277.8 --new-duration=188.4
                    [--out=src/recut.js] [--pieces-out=tools/recut_pieces.json]
    python recut.py ... --pieces=tools/recut_pieces.json        (after editing the pieces by hand)

Before: time the new song like the first one, into separate variables:
    python analyze_song.py assets/song-recut.mp3 --out=src/beats-recut.js --var=RECUT_BEATS --words=tools/words-recut.json
    python align_lyrics.py lyrics-recut.txt --words=tools/words-recut.json --out=src/lyrics-recut.js --var=RECUT_LY

How: the new lyric lines are matched to the old ones by text (in order, so repeated choruses pair up in sequence).
Each new line becomes a piece that plays the matching old line; inside it, the words both versions share pin the
old words onto the new ones, so gestures, stamps and hits still land on the words. Where the old film continues
straight on, the pieces join seamlessly; elsewhere they join with a cut. Intro and outro map onto the old intro and
outro. A new line with no old match plays on from the previous piece and is flagged: it may need its own shot.

Writes src/recut.js (RECUT: [[newStart, newEnd, [[newT, oldT], ...]], ...] and ORIGINAL_DURATION) and the pieces
file [[newStart, newEnd, oldStart, oldEnd, newLine, oldLine], ...] to edit and feed back with --pieces=.
"""
import difflib, json, re, sys, unicodedata

opt = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
for k in ('old', 'new', 'old-duration', 'new-duration'):
    if k not in opt: print(__doc__); sys.exit(f'missing --{k}')
OD, ND = float(opt['old-duration']), float(opt['new-duration'])
OUT, POUT = opt.get('out', 'src/recut.js'), opt.get('pieces-out', 'tools/recut_pieces.json')

def load_ly(path):
    return [json.loads(l.strip().rstrip(',')) for l in open(path, encoding='utf8') if l.strip().startswith('[') and not l.strip().startswith('[[')]
def norm(s):
    s = unicodedata.normalize('NFKD', s); s = ''.join(c for c in s if not unicodedata.combining(c)).lower()
    return re.sub(r'[^a-z0-9 ]', '', s)
O, N = load_ly(opt['old']), load_ly(opt['new'])

# ---------- pieces ----------
def auto_pieces():
    # order-preserving line match (DP): score = text similarity when ≥ .55
    no, nn = [norm(l[2]) for l in O], [norm(l[2]) for l in N]
    S = [[0.0] * (len(O) + 1) for _ in range(len(N) + 1)]; B = [[None] * (len(O) + 1) for _ in range(len(N) + 1)]
    for i in range(1, len(N) + 1):
        for j in range(1, len(O) + 1):
            s = difflib.SequenceMatcher(None, nn[i - 1], no[j - 1]).ratio()
            best, how = S[i - 1][j], 'n'
            if S[i][j - 1] > best: best, how = S[i][j - 1], 'o'
            if s >= .55 and S[i - 1][j - 1] + s > best: best, how = S[i - 1][j - 1] + s, 'm'
            S[i][j], B[i][j] = best, how
    match = [None] * len(N); i, j = len(N), len(O)
    while i > 0 and j > 0:
        h = B[i][j]
        if h == 'm': match[i - 1] = j - 1; i, j = i - 1, j - 1
        elif h == 'n': i -= 1
        else: j -= 1
    P = []
    first = next((i for i, m in enumerate(match) if m is not None), None)
    if first is None: sys.exit('no new line matches an old one: this is a different song, not a re-cut')
    # intro: the new song's intro plays the old intro (cut from its start if the new one is much shorter)
    n_in, o_in = N[0][0], O[match[first]][0] if first == 0 else O[match[first]][0]
    if n_in > .05:
        o0 = max(0.0, o_in - 2.5 * n_in) if o_in / n_in > 2.5 else 0.0
        P.append([0.0, n_in, round(o0, 3), o_in, None, None])
    cur_o = o_in
    for i, L in enumerate(N):
        n0, n1 = L[0], (N[i + 1][0] if i + 1 < len(N) else L[1] + .3)
        j = match[i]
        if j is None:   # a new line: play on from where we were (but never past the end of the old film)
            o0 = min(cur_o, OD - (n1 - n0)); P.append([n0, n1, round(o0, 3), round(o0 + (n1 - n0), 3), i, None]); cur_o = o0 + (n1 - n0); continue
        o0 = O[j][0]
        jn = match[i + 1] if i + 1 < len(N) else None
        if jn == j + 1: o1 = O[j + 1][0]                                   # the old film continues straight on
        else: o1 = min(O[j][1] + max(.3, n1 - L[1]), O[j + 1][0] if j + 1 < len(O) else OD)
        P.append([n0, n1, o0, round(o1, 3), i, j]); cur_o = o1
    # outro: the rest of the new song plays the old ending, so the end card and the fade play whole
    n_last, o_last = P[-1][1], max(P[-1][3], O[match[max(i for i, m in enumerate(match) if m is not None)]][1])
    if ND - n_last > .05:
        span = ND - n_last; o0 = o_last if (OD - o_last) / span <= 2.5 else OD - 2.5 * span
        o0 = min(o0, OD - .4 * span)          # the old film has ended: hold its last moments at a slow speed
        P.append([n_last, ND, round(max(0.0, o0), 3), OD, None, None])
    return P, match

def anchors_for(p):
    n0, n1, o0, o1, ni, oi = p
    A = [(n0, o0)]
    if ni is not None and oi is not None:
        nw, ow = N[ni], O[oi]; nk = [norm(w) for w in nw[2].split(' ')]; ok = [norm(w) for w in ow[2].split(' ')]
        for blk in difflib.SequenceMatcher(a=nk, b=ok, autojunk=False).get_matching_blocks():
            for k in range(blk.size):
                if nk[blk.a + k]: A.append((nw[3][blk.a + k], ow[3][blk.b + k]))
    A.append((n1, o1)); A.sort()
    clean = [A[0]]   # monotonic, inside the piece, speed 0.35x–3.2x
    for n, o in A[1:]:
        pn, po = clean[-1]
        if n <= pn + .04 or o <= po + .02: continue
        if not (.35 <= (o - po) / (n - pn) <= 3.2) and (n, o) != (n1, o1): continue
        clean.append((n, o))
    if clean[-1] != (n1, o1):
        if clean[-1][0] >= n1 - .04: clean[-1] = (n1, o1)
        else: clean.append((n1, o1))
    return [[round(n, 3), round(o, 3)] for n, o in clean]

if 'pieces' in opt:
    P = json.load(open(opt['pieces'])); match = None
else:
    P, match = auto_pieces()
for a, b in zip(P, P[1:]):
    if abs(a[1] - b[0]) > 1e-6: sys.exit(f'pieces must be contiguous: {a[1]} then {b[0]}')
R = [[p[0], p[1], anchors_for(p)] for p in P]
with open(OUT, 'w') as f:
    f.write('// recut.js: generated by recut.py. RECUT = [[newStart, newEnd, [[newT, originalT], ...]], ...]: which moment of\n')
    f.write('// the original film plays at each moment of the new song. Pieces join with cuts where the original jumps.\n')
    f.write(f'const ORIGINAL_DURATION = {OD};\n')
    f.write('const RECUT = [\n' + ',\n'.join('  ' + json.dumps(r) for r in R) + '\n];\n')
with open(POUT, 'w', encoding='utf8') as f:
    f.write('[\n' + ',\n'.join('  ' + json.dumps(p) for p in P) + '\n]\n')

print(f'{len(R)} pieces → {OUT}   (pieces → {POUT})\n')
print('   new span          old span          speed  line')
for p in P:
    n0, n1, o0, o1, ni, oi = p; sp = (o1 - o0) / max(1e-6, n1 - n0)
    tag = 'intro/outro' if ni is None else (f'NEW LINE (no old match): "{N[ni][2]}"' if oi is None else N[ni][2])
    cut = '' if P.index(p) == 0 or abs(P[P.index(p) - 1][3] - o0) < .05 else '✂ '
    warn = '!' if not (.6 <= sp <= 1.6) else ' '
    print(f'{n0:7.2f}–{n1:7.2f}   {o0:7.2f}–{o1:7.2f}   {sp:4.2f}x{warn} {cut}{tag}')
if match:
    dropped = sorted(set(range(len(O))) - {m for m in match if m is not None})
    if dropped: print('\nold lines not in the new song (their shots are cut):', ', '.join(f'{j} "{O[j][2][:40]}"' for j in dropped))
print('\n! = the old film plays much faster or slower than real time here: fine for scenery, odd for a gesture.')
print('✂ = a cut. Check each cut with a seam sheet (the frame before and after). A NEW LINE plays on from the previous')
print('piece; give it a shot of its own or point its piece at a better old moment in the pieces file, then re-run.')
