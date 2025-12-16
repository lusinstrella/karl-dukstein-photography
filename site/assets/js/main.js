// Main site JS: loads manifest, renders grids, lazy loads images, scroll animations
document.addEventListener('DOMContentLoaded', async () => {
  // Load manifest but don't let a network/file error abort the whole script.
  let data = {};
  try{
    const resp = await fetch('data/sections.json');
    if (!resp.ok) throw new Error(`fetch failed: ${resp.status}`);
    data = await resp.json();
  }catch(e){
    console.warn('Could not load data/sections.json — section grids will be empty', e);
  }

  // Update hero if available
  try{
    const heroSection = data['dnc'] || [];
    if (heroSection.length > 0){
      // prefer explicitly marked hero
      const hero = heroSection.find(it => it.hero) || heroSection[0];
      const heroPic = document.querySelector('.hero picture');
      if (heroPic && hero){
        const src = heroPic.querySelector('source');
        const img = heroPic.querySelector('img');
        // pick largest available from srcset (full resolution fallback)
        if (src && hero.srcset_webp){
          // use the largest src (last when sorted by width)
          src.setAttribute('srcset', hero.srcset_webp.split(', ').pop().split(' ')[0]);
        }
        if (img){
          if (hero.full_jpg) img.setAttribute('src', hero.full_jpg);
          else if (hero.full_webp) img.setAttribute('src', hero.full_webp);
          img.alt = hero.alt || '';
        }
      }
    }
  }catch(e){console.warn('hero update failed', e)}
  // IntersectionObserver for fades
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, {threshold:0.08});

  // Render index covers if present
  const coversGrid = document.getElementById('covers-grid');
  if (coversGrid) {
    Object.keys(data).forEach(key => {
      const items = data[key] || [];
      const label = key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      if (items.length === 0) return; // leave empty if no images
      const cover = items.find(it => it.hero) || items[0];
      const a = document.createElement('a');
      a.className = 'section-cover';
      a.href = `${key}.html`;
      a.setAttribute('aria-label', label);
      a.innerHTML = `
        <picture>
          ${cover.srcset_webp ? `<source type="image/webp" srcset="${cover.srcset_webp.split(', ')[0]}">` : ''}
          <img src="${cover.thumb_jpg || cover.thumb_webp || cover.full_jpg || cover.full_webp}" alt="${cover.alt || label}">
        </picture>
        <div class="cover-label">${label}</div>`;
      coversGrid.appendChild(a);
    });
  }

  // Pagination-enabled section render
  const ITEMS_PER_PAGE = 24;
  function renderSection(key, page=1){
    const grid = document.querySelector(`.grid[data-section="${key}"]`);
    if (!grid) return;
    const imgs = data[key] || [];
    const total = imgs.length;
    const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
    page = Math.max(1, Math.min(page, totalPages));
    grid.innerHTML = '';

    if (total === 0){
      // helpful visible hint when there are no images to render (or manifest couldn't be loaded)
      grid.innerHTML = '<p class="empty">No images found for this section. If you opened this file directly, try serving the <code>site/</code> folder over HTTP (for example: <code>python -m http.server</code>) so the manifest can be fetched.</p>';
      const pager = grid.parentElement.querySelector('.pagination');
      if (pager) pager.innerHTML = '';
      return;
    }

    const start = (page-1)*ITEMS_PER_PAGE;
    const pageItems = imgs.slice(start, start + ITEMS_PER_PAGE);

    pageItems.forEach((it, idx) => {
      const div = document.createElement('div');
      div.className = 'item fade-in';
      const sizes = it.sizes || '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw';
      div.innerHTML = `
        <picture>
          ${it.srcset_webp ? `<source type="image/webp" srcset="${it.srcset_webp}" sizes="${sizes}">` : ''}
          <img data-full-webp="${it.full_webp}" data-full-jpg="${it.full_jpg}" data-id="${key}-${start+idx}" data-base="${it.id}" data-section="${key}" srcset="${it.srcset_jpg}" sizes="${sizes}" src="${it.thumb_jpg}" alt="${it.alt}" loading="lazy">
        </picture>`;
      grid.appendChild(div);
    });

    // render pagination controls (static in HTML so test can detect existence)
    let pager = grid.parentElement.querySelector('.pagination');
    if (!pager){
      pager = document.createElement('nav');
      pager.className = 'pagination';
      pager.setAttribute('aria-label','Pagination');
      grid.parentElement.appendChild(pager);
    }
    pager.innerHTML = '';
    if (totalPages > 1){
      const prev = document.createElement('button');
      prev.className = 'page-prev';
      prev.textContent = 'Prev';
      prev.disabled = page === 1;
      prev.addEventListener('click', ()=> renderSection(key, page-1));
      pager.appendChild(prev);

      const info = document.createElement('span');
      info.className = 'page-info';
      info.textContent = `Page ${page} / ${totalPages}`;
      pager.appendChild(info);

      const next = document.createElement('button');
      next.className = 'page-next';
      next.textContent = 'Next';
      next.disabled = page === totalPages;
      next.addEventListener('click', ()=> renderSection(key, page+1));
      pager.appendChild(next);
    }

    // attach lightbox handlers for newly added images
    grid.querySelectorAll('img').forEach(img => img.addEventListener('click', openLightbox));

    // rewire intersection observer for fade in
    grid.querySelectorAll('.fade-in').forEach(el => io.observe(el));
  }

  // initialize all section grids
  document.querySelectorAll('.grid').forEach(grid => {
    const section = grid.dataset.section;
    renderSection(section, 1);
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

  // Lightbox wiring (delegated is already in place; remove redundant static attachment)
  // document.querySelectorAll('.grid img').forEach(img => img.addEventListener('click', openLightbox));

  // Mobile menu
  document.querySelector('.menu-toggle').addEventListener('click', () => document.body.classList.toggle('menu-open'));

  // Delegated click handler so dynamically inserted images open the lightbox reliably
  document.addEventListener('click', (ev) => {
    const img = ev.target.closest && ev.target.closest('.grid img');
    if (img) openLightbox({ currentTarget: img });
  });
});

function openLightbox(e){
  const img = e.currentTarget;
  const lb = document.getElementById('lightbox');
  const lbImage = lb.querySelector('.lb-image');
  // choose best available full image (prefer webp full, then jpg full, then fallbacks)
  const src = img.dataset.fullWebp || img.dataset.fullWebp /* intentional duplicate safe-check */ || img.dataset.fullJpg || img.dataset.full || img.src;
  lbImage.src = src;
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
