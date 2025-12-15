// Main site JS: loads manifest, renders grids, lazy loads images, scroll animations
document.addEventListener('DOMContentLoaded', async () => {
  const resp = await fetch('/data/sections.json');
  const data = await resp.json();

  // Render grids
  document.querySelectorAll('.grid').forEach(grid => {
    const section = grid.dataset.section;
    const imgs = data[section] || [];
    imgs.slice(0, 20).forEach((it, idx) => {
      const div = document.createElement('div');
      div.className = 'item fade-in';
      div.innerHTML = `
        <picture>
          <source srcset="/${it.thumb_webp}" type="image/webp">
          <img data-full="/${it.full_webp}" data-full-jpg="/${it.full_jpg}" data-id="${section}-${idx}" src="/${it.thumb_jpg}" alt="${it.alt}" loading="lazy">
        </picture>`;
      grid.appendChild(div);
    });
  });

  // Lazy load & fade-in
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, {threshold:0.08});

  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

  // Lightbox wiring
  document.querySelectorAll('.grid img').forEach(img => img.addEventListener('click', openLightbox));

  // Mobile menu
  document.querySelector('.menu-toggle').addEventListener('click', () => document.body.classList.toggle('menu-open'));
});

function openLightbox(e){
  const img = e.currentTarget;
  const lb = document.getElementById('lightbox');
  const lbImage = lb.querySelector('.lb-image');
  lbImage.src = img.dataset.full || img.dataset.fullJpg || img.src;
  lbImage.alt = img.alt || '';
  lb.setAttribute('aria-hidden','false');
  window.currentImage = img;
}
