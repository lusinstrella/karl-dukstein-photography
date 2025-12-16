// Main site JS: loads manifest, renders grids, lazy loads images with new hover animation
document.addEventListener('DOMContentLoaded', async () => {
  // Load manifest
  let data = {};
  try{
    const resp = await fetch('data/sections.json');
    if (!resp.ok) throw new Error(`fetch failed: ${resp.status}`);
    data = await resp.json();
  }catch(e){
    console.warn('Could not load data/sections.json — section grids will be empty', e);
  }

  // IntersectionObserver for lazy loading images with fade-in
  const imgObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
          imgObserver.unobserve(img);
        } else {
          img.classList.add('loaded');
        }
      }
    });
  }, {threshold:0.1});

  // Render index covers if present
  const coversGrid = document.getElementById('covers-grid');
  if (coversGrid) {
    Object.keys(data).forEach(key => {
      const items = data[key] || [];
      const label = key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      if (items.length === 0) return;
      const cover = items.find(it => it.hero) || items[0];
      const a = document.createElement('a');
      a.className = 'section-cover';
      a.href = `${key}.html`;
      a.setAttribute('aria-label', label);

      const picture = document.createElement('picture');
      if (cover.srcset_webp) {
        const source = document.createElement('source');
        source.type = 'image/webp';
        source.srcset = cover.srcset_webp.split(', ')[0];
        picture.appendChild(source);
      }

      const img = document.createElement('img');
      img.src = cover.thumb_jpg || cover.thumb_webp || cover.full_jpg || cover.full_webp;
      img.alt = cover.alt || label;
      picture.appendChild(img);

      const labelDiv = document.createElement('div');
      labelDiv.className = 'cover-label';
      labelDiv.textContent = label;

      a.appendChild(picture);
      a.appendChild(labelDiv);
      coversGrid.appendChild(a);

      // Observe image for loading animation
      imgObserver.observe(img);
    });
  }

  // Render section grids (full-page grid style)
  function renderSection(key){
    const grid = document.querySelector(`.grid[data-section="${key}"]`);
    if (!grid) return;
    const imgs = data[key] || [];

    grid.innerHTML = '';

    if (imgs.length === 0){
      grid.innerHTML = '<p class="empty">No images found for this section. If you opened this file directly, try serving the <code>site/</code> folder over HTTP (for example: <code>python -m http.server</code>) so the manifest can be fetched.</p>';
      return;
    }

    imgs.forEach((it, idx) => {
      const div = document.createElement('div');
      div.className = 'item';

      const picture = document.createElement('picture');
      if (it.srcset_webp) {
        const source = document.createElement('source');
        source.type = 'image/webp';
        source.srcset = it.srcset_webp;
        source.sizes = it.sizes || '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw';
        picture.appendChild(source);
      }

      const img = document.createElement('img');
      img.dataset.fullWebp = it.full_webp;
      img.dataset.fullJpg = it.full_jpg;
      img.dataset.id = `${key}-${idx}`;
      img.dataset.base = it.id;
      img.dataset.section = key;
      img.srcset = it.srcset_jpg;
      img.sizes = it.sizes || '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw';
      img.src = it.thumb_jpg;
      img.alt = it.alt;
      img.loading = 'lazy';

      picture.appendChild(img);
      div.appendChild(picture);
      grid.appendChild(div);

      // Observe for loading animation
      imgObserver.observe(img);

      // Error fallback
      img.addEventListener('error', function(){
        console.warn('Image load failed, attempting JPG fallback for', this.src);
        const tryList = [];
        if (this.dataset && this.dataset.fullJpg) tryList.push(this.dataset.fullJpg);
        const src = this.getAttribute('src') || '';
        if (src.endsWith('.webp')) tryList.push(src.replace(/\.webp$/, '.jpg'));
        const srcset = this.getAttribute('srcset') || '';
        if (srcset.includes('.jpg')) tryList.push(srcset.split(', ')[0].split(' ')[0]);
        for (const candidate of tryList){
          if (candidate && candidate !== this.src){
            this.src = candidate;
            this.srcset = this.srcset ? this.srcset.replace(/\.webp/g, '.jpg') : this.src;
            console.info('Switched image src to', candidate);
            return;
          }
        }
      });
    });

    // Attach lightbox handlers
    grid.querySelectorAll('img').forEach(img => {
      img.addEventListener('click', openLightbox);
    });
  }

  // Initialize all section grids
  document.querySelectorAll('.grid').forEach(grid => {
    const section = grid.dataset.section;
    renderSection(section);
  });

  // Mobile menu
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.body.classList.toggle('menu-open');
    });
  }

  // Mobile dropdown toggle
  const portfolioDropdown = document.querySelector('.portfolio-dropdown > a');
  if (portfolioDropdown) {
    portfolioDropdown.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        document.querySelector('.portfolio-dropdown').classList.toggle('open');
      }
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('menu-open')) {
      if (!e.target.closest('.main-nav') && !e.target.closest('.menu-toggle')) {
        document.body.classList.remove('menu-open');
      }
    }
  });

  // Set active navigation link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.main-nav a');
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
    // Also handle about and contact pages
    if (currentPage === 'about.html' && linkPage === 'about.html') {
      link.classList.add('active');
    }
    if (currentPage === 'contact.html' && linkPage === 'contact.html') {
      link.classList.add('active');
    }
  });
});

function openLightbox(e){
  const img = e.currentTarget;
  const lb = document.getElementById('lightbox');
  const lbImage = lb.querySelector('.lb-image');
  const src = img.dataset.fullWebp || img.dataset.fullJpg || img.src;
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

  // Update counter
  const imgs = Array.from(document.querySelectorAll('.grid img'));
  const idx = imgs.indexOf(img);
  const counter = document.querySelector('#lightbox .lb-counter');
  if (counter) counter.textContent = `${idx+1} / ${imgs.length}`;
}
