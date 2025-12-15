#!/usr/bin/env python3
import os
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / 'images'
OUT = ROOT / 'site' / 'data'
OUT.mkdir(parents=True, exist_ok=True)

CATEGORIES = [
    'frack-county',
    'dnc',
    'weld-county',
    'patriotism',
    'portraits',
    'misc',
    'student-work',
]

EXTS = ('.webp', '.jpg', '.jpeg', '.png')

def find_images(cat_dir):
    files = list(cat_dir.glob('*'))
    # find bases that have -thumb or -full
    thumbs = [f for f in files if f.name.endswith('-thumb.webp') or f.name.endswith('-thumb.jpg')]
    bases = set()
    for t in thumbs:
        base = t.name.rsplit('-thumb', 1)[0]
        bases.add(base)

    items = []
    for b in sorted(bases):
        thumb_webp = (cat_dir / f"{b}-thumb.webp")
        thumb_jpg = (cat_dir / f"{b}-thumb.jpg")
        full_webp = (cat_dir / f"{b}-full.webp")
        full_jpg = (cat_dir / f"{b}-full.jpg")

        item = {
            'id': b,
            'thumb_webp': str(thumb_webp.relative_to(ROOT)).replace('\\','/'),
            'thumb_jpg': str(thumb_jpg.relative_to(ROOT)).replace('\\','/'),
            'full_webp': str(full_webp.relative_to(ROOT)).replace('\\','/'),
            'full_jpg': str(full_jpg.relative_to(ROOT)).replace('\\','/'),
            'alt': b.replace('-', ' ')
        }
        items.append(item)

    return items


manifest = {}
for cat in CATEGORIES:
    cat_dir = IMAGES / cat
    if cat_dir.exists() and cat_dir.is_dir():
        manifest[cat] = find_images(cat_dir)
    else:
        manifest[cat] = []

out_file = OUT / 'sections.json'
out_file.write_text(json.dumps(manifest, indent=2))
print(f'Wrote manifest to {out_file}')
