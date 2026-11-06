#!/usr/bin/env python3
"""Adds a small 'OrthoVault | Dr. Devarsh Goyal' watermark (bottom-right) to hero, exercise and care images.
Thumbnails are skipped. Files already done are listed in scripts/watermarked.txt and skipped.
Usage:  python3 scripts/watermark.py            (all new images)
        python3 scripts/watermark.py public/img/<slug>/<file>.webp ...
"""
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DONE = os.path.join(ROOT, 'scripts', 'watermarked.txt')
TEXT = 'OrthoVault  |  Dr. Devarsh Goyal'
FONT = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
done = set(open(DONE).read().split('\n')) if os.path.exists(DONE) else set()
files = sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT, 'public/img/*/*.webp')))
n = 0
for f in files:
    rel = os.path.relpath(os.path.abspath(f), ROOT)
    if rel.startswith('public/img/thumb/') or rel in done: continue
    im = Image.open(f).convert('RGBA'); W, H = im.size
    size = max(14, round(W * 0.034)); font = ImageFont.truetype(FONT, size)
    d = ImageDraw.Draw(Image.new('RGBA', (1, 1)))
    tw = d.textlength(TEXT, font=font); pad = round(W * 0.025)
    x, y = W - tw - pad, H - size - pad
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
    ld.text((x + 1.5, y + 1.5), TEXT, font=font, fill=(0, 0, 0, 120))
    layer = layer.filter(ImageFilter.GaussianBlur(1.2)); ld = ImageDraw.Draw(layer)
    ld.text((x, y), TEXT, font=font, fill=(255, 255, 255, 170))
    Image.alpha_composite(im, layer).convert('RGB').save(f, 'webp', quality=88)
    done.add(rel); n += 1
open(DONE, 'w').write('\n'.join(sorted(done)))
print('watermarked', n, 'images')
