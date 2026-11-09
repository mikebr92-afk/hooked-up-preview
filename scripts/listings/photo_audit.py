"""Photo audit: contact sheets + quality/duplicate flags for every live listing's current photos.

Usage: /usr/bin/python3 -I photo_audit.py <repo> <outDir>
Writes <outDir>/<group>/:
  sheets/<slug>.jpg   every current photo for the listing, labelled with file, size and flags
  heroes.jpg          overview: each listing's hero (what shows on cards and search results)
  audit.json          per listing: images [{file, w, h, sharp, bright, colours, flags}], listing-level issues
Groups match seo_inputs.mjs (nsw, qld_south, qld_north, nt, wa, tas, vic).
Flags are hints for a human/agent review, not verdicts:
  small (<800px wide), portrait, soft (low edge detail), dark, washed (very bright), graphic (few colours: logo/text?),
  dup-in-gallery, dup-other-operator (same photo on another listing: wrong business?), no-photos, few-photos.
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageStat

REPO, OUT = sys.argv[1], sys.argv[2]
ops = json.load(open(f'{REPO}/data/operators.json'))
QLD_SOUTH = {'gold-coast', 'brisbane', 'sunshine-coast', 'rainbow-beach', 'hervey-bay', 'bundaberg', 'gladstone', 'yeppoon', 'agnes-water'}


def group(o):
    s = o['state']
    if s == 'QLD':
        return 'qld_south' if o.get('hotspot') in QLD_SOUTH else 'qld_north'
    return s.lower()


def dhash(im):
    g = im.convert('L').resize((9, 8), Image.LANCZOS)
    px = list(g.get_flattened_data())
    return sum(1 << i for i in range(64) if px[(i // 8) * 9 + i % 8] > px[(i // 8) * 9 + i % 8 + 1])


def metrics(path):
    im = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    w, h = im.size
    small = im.copy()
    small.thumbnail((512, 512))
    g = small.convert('L')
    sharp = ImageStat.Stat(g.filter(ImageFilter.FIND_EDGES)).var[0] ** 0.5
    bright = ImageStat.Stat(g).mean[0]
    colours = len(set(small.resize((64, 64)).quantize(256).get_flattened_data()))
    return im, {'w': w, 'h': h, 'sharp': round(sharp, 1), 'bright': round(bright), 'colours': colours, 'hash': dhash(im)}


def ham(a, b):
    return bin(a ^ b).count('1')


rows = {}
allhash = []  # (hash, slug, file)
for o in ops:
    d = f'{REPO}/images/operators/{o["slug"]}'
    files = sorted(f for f in (os.listdir(d) if os.path.isdir(d) else []) if f[:2].isdigit() and f.endswith('.webp'))
    imgs = []
    for f in files:
        im, m = metrics(f'{d}/{f}')
        m['file'] = f'images/operators/{o["slug"]}/{f}'
        m['flags'] = []
        if m['w'] < 800:
            m['flags'].append('small')
        if m['h'] > m['w']:
            m['flags'].append('portrait')
        if m['sharp'] < 22:
            m['flags'].append('soft')
        if m['bright'] < 60:
            m['flags'].append('dark')
        if m['bright'] > 215:
            m['flags'].append('washed')
        if m['colours'] < 60:
            m['flags'].append('graphic')
        imgs.append((im, m))
        allhash.append((m['hash'], o['slug'], m['file']))
    rows[o['slug']] = (o, imgs)

# duplicates
for o, imgs in rows.values():
    for i, (_, m) in enumerate(imgs):
        for j, (_, n) in enumerate(imgs[:i]):
            if ham(m['hash'], n['hash']) <= 6:
                m['flags'].append(f'dup-in-gallery:{os.path.basename(n["file"])}')
        others = [s for h, s, f in allhash if s != o['slug'] and ham(h, m['hash']) <= 5]
        if others:
            m['flags'].append('dup-other-operator:' + ','.join(sorted(set(others))))


def label_tile(im, text, width=420):
    t = im.copy()
    t.thumbnail((width, width))
    canvas = Image.new('RGB', (width, t.size[1] + 34), 'white')
    canvas.paste(t, (0, 0))
    ImageDraw.Draw(canvas).text((4, t.size[1] + 4), text[:70], fill='black')
    return canvas


def sheet(tiles, cols, path):
    if not tiles:
        return
    W = max(t.size[0] for t in tiles)
    rows_ = [tiles[i:i + cols] for i in range(0, len(tiles), cols)]
    H = sum(max(t.size[1] for t in r) for r in rows_)
    out = Image.new('RGB', (W * cols, H), (230, 230, 230))
    y = 0
    for r in rows_:
        for k, t in enumerate(r):
            out.paste(t, (k * W, y))
        y += max(t.size[1] for t in r)
    out.save(path, quality=82)


summary = {}
for slug, (o, imgs) in rows.items():
    g = group(o)
    gdir = f'{OUT}/{g}'
    os.makedirs(f'{gdir}/sheets', exist_ok=True)
    issues = []
    if not imgs:
        issues.append('no-photos')
    elif len(imgs) < 3:
        issues.append('few-photos')
    if imgs and imgs[0][1]['flags']:
        issues.append('hero-flagged:' + ';'.join(imgs[0][1]['flags']))
    tiles = [label_tile(im, f"{os.path.basename(m['file'])} {m['w']}x{m['h']} {' '.join(f.split(':')[0] for f in m['flags'])}") for im, m in imgs]
    sheet(tiles, 2, f'{gdir}/sheets/{slug}.jpg')
    rec = summary.setdefault(g, {})
    rec[slug] = {'name': o['name'], 'hotspot': o.get('hotspot'), 'website': o.get('website'), 'facebook': o.get('facebook'),
                 'instagram': o.get('instagram'), 'boat_name': o.get('boat_name'), 'boat_type': o.get('boat_type'),
                 'boat_length_m': o.get('boat_length_m'), 'issues': issues,
                 'images': [{k: v for k, v in m.items() if k != 'hash'} for _, m in imgs]}

for g, rec in summary.items():
    gdir = f'{OUT}/{g}'
    json.dump(rec, open(f'{gdir}/audit.json', 'w'), indent=1)
    heroes = [label_tile(imgs[0][0], f'{s}', 300) for s, (o, imgs) in rows.items() if group(o) == g and imgs]
    sheet(heroes, 4, f'{gdir}/heroes.jpg')
    n_issue = sum(1 for r in rec.values() if r['issues'])
    flagged = sum(1 for r in rec.values() for i in r['images'] if i['flags'])
    print(f'{g}: {len(rec)} listings, {n_issue} with listing issues, {flagged} flagged images')
