#!/usr/bin/env python3
import os
import glob
from psd_tools import PSDImage
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ORIGINALS_ROOT = os.path.join(ROOT, 'images', 'originals')

if not os.path.isdir(ORIGINALS_ROOT):
    print('No originals folder found, exiting')
    exit(0)

psd_files = glob.glob(os.path.join(ORIGINALS_ROOT, '**', '*.psd'), recursive=True)
print(f'Found {len(psd_files)} PSD files to convert')

for f in psd_files:
    try:
        psd = PSDImage.open(f)
        image = psd.topil()
        out_path = os.path.splitext(f)[0] + '.jpg'
        # Convert mode to RGB if necessary
        if image.mode in ("RGBA", "LA"):
            bg = Image.new("RGB", image.size, (255,255,255))
            bg.paste(image, mask=image.split()[3])
            bg.save(out_path, 'JPEG', quality=95)
        else:
            image.convert('RGB').save(out_path, 'JPEG', quality=95)
        print(f'Converted {f} -> {out_path}')
    except Exception as e:
        print(f'Failed to convert {f}: {e}')

print('PSD conversion complete')
