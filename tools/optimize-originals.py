#!/usr/bin/env python3
import os
import glob
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ORIGINALS_ROOT = os.path.join(ROOT, 'images', 'originals')

SIZES = [
    ('thumb', 600, 80),
    ('full', 1920, 90),
]

EXTENSIONS = ('.jpg', '.jpeg', '.png', '.tiff', '.webp', '.heic')

if not os.path.isdir(ORIGINALS_ROOT):
    print('No originals folder found, exiting')
    exit(0)

files = []
for ext in EXTENSIONS:
    files.extend(glob.glob(os.path.join(ORIGINALS_ROOT, '**', f'*{ext}'), recursive=True))

print(f'Found {len(files)} originals to process')

for f in files:
    rel = os.path.relpath(f, ORIGINALS_ROOT)  # dnc/filename.jpg
    parts = rel.split(os.sep)
    category = parts[0]
    base = os.path.splitext(parts[-1])[0]
    sanitized = base.replace(' ', '-')

    target_dir = os.path.join(ROOT, 'images', category)
    os.makedirs(target_dir, exist_ok=True)

    try:
        with Image.open(f) as img:
            original_width, original_height = img.size
            for name, width, quality in SIZES:
                use_width = min(width, original_width) if original_width else width
                ratio = use_width / float(original_width)
                new_height = int(original_height * ratio)
                resized = img.resize((use_width, new_height), Image.LANCZOS)

                webp_out = os.path.join(target_dir, f"{sanitized}-{name}.webp")
                jpg_out = os.path.join(target_dir, f"{sanitized}-{name}.jpg")

                try:
                    resized.save(webp_out, 'WEBP', quality=quality)
                except Exception as e:
                    print(f'Warning: failed to write WebP for {webp_out}: {e}')

                try:
                    if resized.mode in ("RGBA", "LA"):
                        bg = Image.new("RGB", resized.size, (255,255,255))
                        bg.paste(resized, mask=resized.split()[3])
                        bg.save(jpg_out, 'JPEG', quality=quality)
                    else:
                        resized.convert('RGB').save(jpg_out, 'JPEG', quality=quality)
                except Exception as e:
                    print(f'Warning: failed to write JPG for {jpg_out}: {e}')

                print(f'Wrote: {webp_out} and {jpg_out} (from {f})')

    except Exception as e:
        print(f'Failed to process {f}: {e}')

print('Done optimizing originals')
