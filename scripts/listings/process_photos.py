"""Process approved photos into site images.

Usage: python3 -I process_photos.py <repo> <approved-photos.json> [more.json ...]
approved: {slug: {"hero": path, "extras": [paths], "crop": [l,t,r,b]?, "brighten": 1.8?, "centering": [x,y]?}}
Writes images/operators/<slug>/{01..NN.webp, card.webp, og.jpg}. Index.html is updated by build_listings.mjs.
"""
import json
import os
import shutil
import sys

from PIL import Image, ImageEnhance, ImageOps

REPO = sys.argv[1]
approved = {}
for f in sys.argv[2:]:
    approved.update(json.load(open(f)))
for slug, spec in sorted(approved.items()):
    out = f'{REPO}/images/operators/{slug}'
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(out)
    paths = [spec['hero']] + list(spec.get('extras') or [])
    for i, p in enumerate(paths, 1):
        im = ImageOps.exif_transpose(Image.open(p)).convert('RGB')
        if i == 1 and spec.get('crop'):
            im = im.crop(tuple(spec['crop']))
        if i == 1 and spec.get('brighten'):
            im = ImageEnhance.Contrast(ImageEnhance.Brightness(im).enhance(spec['brighten'])).enhance(1.05)
        im.thumbnail((1600, 1600), Image.LANCZOS)
        im.save(f'{out}/{i:02d}.webp', 'WEBP', quality=80, method=6)
        if i == 1:
            c = tuple(spec.get('centering') or (0.5, 0.4))
            ImageOps.fit(im, (800, 550), Image.LANCZOS, centering=c).save(f'{out}/card.webp', 'WEBP', quality=78, method=6)
            ImageOps.fit(im, (1200, 630), Image.LANCZOS, centering=c).save(f'{out}/og.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
    print(f'{slug}: {len(paths)} photo(s)')
