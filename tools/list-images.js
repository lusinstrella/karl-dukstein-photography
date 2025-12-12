#!/usr/bin/env node
const fg = require('fast-glob');

const EXTENSIONS = ['jpg', 'jpeg', 'png', 'tiff', 'webp', 'heic'];
(async () => {
  const patterns = EXTENSIONS.map(ext => `images/**/*.${ext}`);
  const files = await fg(patterns);
  const counts = {};
  for (const f of files) {
    const dir = f.split('/')[1]; // images/<folder>/...
    counts[dir] = (counts[dir] || 0) + 1;
  }
  console.log('Image counts by folder:');
  Object.keys(counts).forEach(k => console.log(`${k}: ${counts[k]}`));
  console.log(`Total images found: ${files.length}`);
})();
