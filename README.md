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
  - thumb: 600px wide, quality: 80
  - full: 1920px wide, quality: 90
- Outputs each variant in WebP + JPEG with the naming format: `image-name-{thumb|full}.webp` and `.jpg` (JPEG fallback). Thumbnails are `-thumb` (600px, quality 80) and fulls are `-full` (1920px, quality 90). Use `<picture>` with `srcset` in your markup for responsive loading.

Notes
- PSD files are not converted; they were moved to `images/dnc/originals/`.
- The scripts skip any files in `images/*/originals`.

Command-line wrapper
---
You can run the included CLI wrapper which will choose the best available toolchain (Node.js -> ImageMagick -> Python) and run the appropriate script:

```
# From project root:
bin/karl-photos [--originals] [--images] [--all] [--dry-run]
```

Examples:
- `bin/karl-photos` — optimize both images + originals.
- `bin/karl-photos --originals` — only optimize images in `images/originals/*`.
- `bin/karl-photos --images` — only optimize existing images under `images/*` (skips originals).

If you'd like to install the command globally on your system (optional), from the repo root run:

```
npm install -g .
```

