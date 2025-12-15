#!/usr/bin/env node
const fg = require('fast-glob');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs-extra');

const ROOT = path.resolve(__dirname, '..');
const IMAGES_ROOT = path.join(ROOT, 'images');
const IGNORES = ['**/originals/**'];

const SIZES = [
  { name: 'thumb', width: 600, quality: 80 },
  { name: 'medium', width: 1200, quality: 85 },
  { name: 'full', width: 1920, quality: 90 },
];

const EXTENSIONS = ['jpg', 'jpeg', 'png', 'tiff', 'webp', 'heic'];

function sanitizeName(name) {
  return name.replace(/\s+/g, '-');
}

async function optimizeFile(file) {
  try {
    const fullPath = path.resolve(file);
    const dir = path.dirname(fullPath);
    const ext = path.extname(fullPath).slice(1).toLowerCase();
    const base = path.basename(fullPath, path.extname(fullPath)).replace(/\s+/g, '-');
    if (IGNORES.some(ignore => file.includes(ignore))) return;
    if (!EXTENSIONS.includes(ext)) return;

    const image = sharp(fullPath, { limitInputPixels: false });
    const metadata = await image.metadata();
    const originalWidth = metadata.width || SIZES[SIZES.length - 1].width;

    for (const size of SIZES) {
      const width = Math.min(size.width, originalWidth);
      const webpOut = path.join(dir, `${base}-${size.name}.webp`);
      const jpgOut = path.join(dir, `${base}-${size.name}.jpg`);

      // Create WebP
      await image
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: size.quality })
        .toFile(webpOut);

      // Create JPEG fallback
      await image
        .clone()
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality: size.quality })
        .toFile(jpgOut);

      console.log(`Wrote: ${webpOut} and ${jpgOut}`);
    }
  } catch (err) {
    console.error('Error optimizing', file, err);
  }
}

async function run() {
  console.log('Scanning images...');
  const patterns = EXTENSIONS.map(ext => `images/**/*.${ext}`);
  const files = await fg(patterns, { dot: false, ignore: IGNORES });

  console.log(`Found ${files.length} images to process`);
  for (const file of files) {
    await optimizeFile(file);
  }
  console.log('Done optimizing images');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
