# Karl Dukstein Photography - Images

This repo contains images from Karl Dukstein's photography.

Folders created:
- images/hero
- images/dnc
- images/frack-county
- images/weld-county
- images/patriotism
- images/portraits
- images/misc
- images/student-work

DNC images and PSDs were moved from `DNC finals sized sm` into `images/dnc` and PSDs into `images/dnc/originals`. FRACK images were moved from `SM FRACK` into `images/frack-county`.

Optimizing images
---
You have two options to optimize images:

1) Node + sharp

- Install Node.js and then run:

```bash
npm install
npm run optimize-images
```

2) ImageMagick (magick/convert)

- Install ImageMagick and run the provided shell script:

```bash
brew install imagemagick
cd /path/to/repo
sh tools/optimize-images.sh
```

What the scripts do
- Creates 3 variants per image, preserving aspect ratio:
  - thumb: 400px wide, quality: 80
  - medium: 800px wide, quality: 85
  - full: 1600px wide, quality: 90
- Outputs each variant in WebP + JPEG with the naming format: `image-name-{thumb|medium|full}.webp` and `.jpg` (JPEG fallback).

Notes
- PSD files are not converted; they were moved to `images/dnc/originals/`.
- The scripts skip any files in `images/*/originals`.
