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
      const sizes = it.sizes || '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw';
      div.innerHTML = `
        <picture>
          ${it.srcset_webp ? `<source type="image/webp" srcset="/${it.srcset_webp}" sizes="${sizes}">` : ''}
          <img data-full-webp="/${it.full_webp}" data-full-jpg="/${it.full_jpg}" data-id="${section}-${idx}" srcset="/${it.srcset_jpg}" sizes="${sizes}" src="/${it.thumb_jpg}" alt="${it.alt}" loading="lazy">
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
  // prefer webp full if available
  lbImage.src = img.dataset.fullWebp || img.dataset.fullWebp || img.dataset.fullJpg || img.dataset.full || img.src;
  lbImage.alt = img.alt || '';
  lb.setAttribute('aria-hidden','false');
  lb.setAttribute('aria-modal','true');
  if (!window.previousActiveElement) window.previousActiveElement = document.activeElement;
  const closeBtn = lb.querySelector('.lb-close');
  const prevBtn = lb.querySelector('.lb-prev');
  const nextBtn = lb.querySelector('.lb-next');
  [closeBtn, prevBtn, nextBtn].forEach(b => b && b.setAttribute('tabindex','0'));
  if (closeBtn) closeBtn.focus();
  document.body.classList.add('no-scroll');
  window.currentImage = img;

  // update counter if available
  const imgs = Array.from(document.querySelectorAll('.grid img'));
  const idx = imgs.indexOf(img);
  const counter = document.querySelector('#lightbox .lb-counter');
  if (counter) counter.textContent = `${idx+1}/${imgs.length}`;
}
