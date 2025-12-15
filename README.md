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
  - medium: 1200px wide, quality: 85
  - full: 1920px wide, quality: 90
  - Outputs each variant in WebP + JPEG with the naming format: `image-name-{thumb|medium|full}.webp` and `.jpg` (JPEG fallback). Use the generated `site/data/sections.json` which now includes `srcset` and `sizes` fields for responsive `<picture>` markup. To explicitly set a hero for a category, one of the following is supported:

- Add an image file named `your-image-hero.webp` or `your-image-hero.jpg` in the category folder (e.g., `images/dnc/foo-hero.jpg`) — the manifest generator will mark that base as the hero.
- Or create a `hero.txt` file in the category folder containing the base id (one line, e.g., `foo`).

If no explicit hero is found the generator will select the first image as the hero.

Optional: To control the hero image focal point, create a file named `<base>-focus.txt` next to the images in the category folder. The file can contain `left`, `right`, `top`, or `bottom`, or two numbers representing `x y` percentages (for example: `30 40` for `30% 40%`). The manifest generator will pick this up and the hero image will use that `object-position` value.

Selecting the hero visually

- CLI option: run `python3 tools/set-hero.py <category> <base-id>` which writes `images/<category>/hero.txt` for you and instructs you to re-run `python3 tools/generate-manifest.py`.


Serving images when previewing the `site/` directory

When using `python3 -m http.server --directory site` to preview the site, the server serves files from the `site/` directory only, so the `images/` folder (which lives at the repo root) isn't visible by default. To make the images available to the site preview, create a symlink from `site/images` to the project `images/` folder:

```bash
ln -s ../images site/images
```

This repo already contains that symlink after running the preview setup above. If you prefer not to use a symlink, copy the `images/` folder into `site/` instead.
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

Preview the static site locally
---

Each project/section is a separate page (for example: `/dnc.html`, `/frack-county.html`).

Generate the image manifest and start a simple server to preview the site:

```
python3 tools/generate-manifest.py
python3 -m http.server 8000 --directory site
# then open http://localhost:8000 in your browser
```

Or use the convenience npm scripts:

```
npm run generate-manifest
npm run serve-site
```

Smoke tests

Run a lightweight smoke test (starts a local server on port 8001 and checks the manifest and index):

```
python3 tools/tests/test_site.py
```

