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

    # discover bases by thumbs
    thumbs = [f for f in files if f.name.endswith('-thumb.webp') or f.name.endswith('-thumb.jpg')]
    bases = set()
    for t in thumbs:
        base = t.name.rsplit('-thumb', 1)[0]
        bases.add(base)

    # detect explicit hero markers: files like <base>-hero.webp or a hero.txt file containing base name
    hero_bases = set()
    for f in files:
        if '-hero.' in f.name:
            base = f.name.rsplit('-hero', 1)[0]
            hero_bases.add(base)
    hero_txt = cat_dir / 'hero.txt'
    if hero_txt.exists():
        try:
            txt = hero_txt.read_text().strip().splitlines()
            for line in txt:
                line = line.strip()
                if line:
                    hero_bases.add(line)
        except Exception:
            pass

    items = []
    for b in sorted(bases):
        # Available size files
        variants = []
        size_map = {
            'thumb': 600,
            'medium': 1200,
            'full': 1920,
        }
        for name in ['thumb', 'medium', 'full']:
            webp = cat_dir / f"{b}-{name}.webp"
            jpg = cat_dir / f"{b}-{name}.jpg"
            if webp.exists() or jpg.exists():
                variants.append((name, size_map[name], webp if webp.exists() else None, jpg if jpg.exists() else None))

        # Build srcsets
        webp_srcs = []
        jpg_srcs = []
        for name, width, webp, jpg in variants:
            if webp:
                webp_rel = str(webp.relative_to(ROOT)).replace('\\','/')
                webp_srcs.append(f"{webp_rel} {width}w")
            if jpg:
                jpg_rel = str(jpg.relative_to(ROOT)).replace('\\','/')
                jpg_srcs.append(f"{jpg_rel} {width}w")

        # Fallbacks
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
            'srcset_webp': ", ".join(webp_srcs),
            'srcset_jpg': ", ".join(jpg_srcs),
            'sizes': "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw",
            'alt': b.replace('-', ' '),
            'hero': True if b in hero_bases else False,
        }
        # optional focal point via <base>-focus.txt containing either "left", "right", "top", "bottom" or "x y" as percentages
        focus_file = cat_dir / f"{b}-focus.txt"
        if focus_file.exists():
            try:
                txt = focus_file.read_text().strip()
                if txt in ('left','right','top','bottom'):
                    item['object_position'] = {'position': txt}
                else:
                    parts = txt.split()
                    if len(parts) == 2:
                        # expect numbers as percentages
                        x, y = parts
                        item['object_position'] = {'position': f"{x}% {y}%"}
            except Exception:
                pass
        items.append(item)

    # If no explicit hero was found, mark the first image as hero (for having a reasonable default)
    if items and not any(i.get('hero') for i in items):
        items[0]['hero'] = True

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
