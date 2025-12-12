#!/usr/bin/env python3
import os
from PIL import Image
import glob

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IMAGES_ROOT = os.path.join(ROOT, 'images')

SIZES = [
    ('thumb', 400, 80),
    ('medium', 800, 85),
    ('full', 1600, 90),
]

EXTENSIONS = ('.jpg', '.jpeg', '.png', '.tiff', '.webp', '.heic')

def sanitize_name(name):
    return name.replace(' ', '-')

def process_image(filepath):
    dirpath = os.path.dirname(filepath)
    base = os.path.splitext(os.path.basename(filepath))[0]
    sanitized = sanitize_name(base)

    try:
        with Image.open(filepath) as img:
            original_width, original_height = img.size
            for name, width, quality in SIZES:
                use_width = min(width, original_width) if original_width else width
                # Preserve aspect ratio
                ratio = use_width / float(original_width)
                new_height = int(original_height * ratio)
                resized = img.resize((use_width, new_height), Image.LANCZOS)

                webp_out = os.path.join(dirpath, f"{sanitized}-{name}.webp")
                jpg_out = os.path.join(dirpath, f"{sanitized}-{name}.jpg")

                # Save WebP
                try:
                    resized.save(webp_out, 'WEBP', quality=quality)
                except Exception as e:
                    print(f"Warning: failed to write WebP for {webp_out}: {e}")

                # Save JPEG
                try:
                    # Convert to RGB if image has alpha channel for JPEG
                    if resized.mode in ("RGBA", "LA"):
                        bg = Image.new("RGB", resized.size, (255,255,255))
                        bg.paste(resized, mask=resized.split()[3])
                        bg.save(jpg_out, 'JPEG', quality=quality)
                    else:
                        resized.convert('RGB').save(jpg_out, 'JPEG', quality=quality)
                except Exception as e:
                    print(f"Warning: failed to write JPG for {jpg_out}: {e}")

                print(f"Wrote: {webp_out} and {jpg_out}")

    except Exception as e:
        print(f"Failed to process {filepath}: {e}")


def main():
    files = []
    for ext in EXTENSIONS:
        files.extend(glob.glob(os.path.join(IMAGES_ROOT, '**', f'*{ext}'), recursive=True))

    files = [f for f in files if '/originals/' not in f.replace('\\','/')]
    print(f"Found {len(files)} images to process")
    for f in files:
        process_image(f)

if __name__ == '__main__':
    main()
