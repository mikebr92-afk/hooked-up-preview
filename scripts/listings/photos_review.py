"""Extract a state agent's chosen photos and build review sheets.

Usage: python3 -I photos_review.py <repo> <agentsDir> <group> [pipelineBranch]
Writes <agentsDir>/<group>/review/<slug>--hero.webp etc, hero/extras sheets, and
proposed-photos.json ({slug: {hero: path, extras: [paths]}}) — copy/edit it to
approved-photos.json after reviewing.
"""
import json
import os
import subprocess
import sys

from PIL import Image, ImageDraw

REPO, AG, G = sys.argv[1:4]
BRANCH = sys.argv[4] if len(sys.argv) > 4 else f'operator-images/state-{G}'  # optional: pipeline branch name
L = json.load(open(f'{AG}/{G}/listings.json'))
branch = f'origin/{BRANCH}'
subprocess.run(['git', '-C', REPO, 'fetch', '-q', 'origin', BRANCH], check=True)
out_dir = f'{AG}/{G}/review'
os.makedirs(out_dir, exist_ok=True)
proposed = {}
rows = []
for r in L:
    ph = r.get('_photos') or {}
    if ph.get('keep') or not ph.get('hero'):
        continue
    items = [('hero', ph['hero'])] + [(f'extra{i}', e) for i, e in enumerate(ph.get('extras') or [], 1)]
    got = {}
    for kind, h in items:
        data = subprocess.run(['git', '-C', REPO, 'show', f'{branch}:{h["file"]}'], capture_output=True).stdout
        if not data:
            print('MISSING', r['slug'], h['file'])
            continue
        p = f'{out_dir}/{r["slug"]}--{kind}.webp'
        open(p, 'wb').write(data)
        got[kind] = p
        rows.append((r['slug'], kind, p))
    if 'hero' in got:
        proposed[r['slug']] = {'hero': got['hero'], 'extras': [got[k] for k in sorted(got) if k != 'hero']}
json.dump(proposed, open(f'{AG}/{G}/proposed-photos.json', 'w'), indent=1)

for name, sel, (TW, TH, COLS) in [('heroes', [x for x in rows if x[1] == 'hero'], (420, 290, 4)),
                                  ('extras', [x for x in rows if x[1] != 'hero'], (340, 235, 5))]:
    if not sel:
        continue
    for page in range(0, len(sel), COLS * 4):
        chunk = sel[page:page + COLS * 4]
        nrows = (len(chunk) + COLS - 1) // COLS
        s = Image.new('RGB', (COLS * TW, nrows * (TH + 22)), 'white')
        d = ImageDraw.Draw(s)
        for i, (slug, kind, p) in enumerate(chunk):
            im = Image.open(p).convert('RGB')
            w, h = im.size
            im.thumbnail((TW - 8, TH - 8))
            x, y = (i % COLS) * TW, (i // COLS) * (TH + 22)
            s.paste(im, (x + 4, y + 4))
            d.text((x + 6, y + TH + 2), f'{slug[:40]} {kind} {w}x{h}', fill='black')
        fn = f'{AG}/{G}/{name}-{page // (COLS * 4) + 1}.jpg'
        s.save(fn, quality=85)
        print('sheet', fn, len(chunk))
print(len(proposed), 'operators with proposed photos')
