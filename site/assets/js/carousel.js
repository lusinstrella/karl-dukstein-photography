// Carousel implementation with auto-advance (5 seconds)
class Carousel {
  constructor(element, images, autoAdvanceInterval = 5000) {
    this.element = element;
    this.images = images;
    this.currentIndex = 0;
    this.autoAdvanceInterval = autoAdvanceInterval;
    this.autoAdvanceTimer = null;
    this.isTransitioning = false;

    this.init();
  }

  init() {
    if (!this.element || this.images.length === 0) return;

    this.render();
    this.attachEventListeners();
    this.startAutoAdvance();
  }

  render() {
    const inner = this.element.querySelector('.carousel-inner');
    if (!inner) return;

    // Clear existing content
    inner.innerHTML = '';

    // Create carousel items
    this.images.forEach((img, index) => {
      const item = document.createElement('div');
      item.className = 'carousel-item';
      if (index === 0) item.classList.add('active');

      const picture = document.createElement('picture');

      if (img.srcset_webp) {
        const source = document.createElement('source');
        source.type = 'image/webp';
        source.srcset = img.srcset_webp.split(', ').pop().split(' ')[0]; // Get largest
        picture.appendChild(source);
      }

      const imgEl = document.createElement('img');
      imgEl.src = img.full_jpg || img.full_webp || img.thumb_jpg;
      imgEl.alt = img.alt || '';
      imgEl.loading = index === 0 ? 'eager' : 'lazy';

      picture.appendChild(imgEl);
      item.appendChild(picture);
      inner.appendChild(item);
    });

    // Update counter
    this.updateCounter();
  }

  attachEventListeners() {
    const prevBtn = this.element.querySelector('.carousel-prev');
    const nextBtn = this.element.querySelector('.carousel-next');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    // Pause on hover
    this.element.addEventListener('mouseenter', () => this.stopAutoAdvance());
    this.element.addEventListener('mouseleave', () => this.startAutoAdvance());
  }

  next() {
    if (this.isTransitioning) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.transition();
  }

  prev() {
    if (this.isTransitioning) return;
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.transition();
  }

  transition() {
    this.isTransitioning = true;
    const items = this.element.querySelectorAll('.carousel-item');
    const current = this.element.querySelector('.carousel-item.active');
    const next = items[this.currentIndex];

    if (current) {
      current.classList.remove('active');
      current.classList.add('fadeOut');
    }

    if (next) {
      next.classList.add('fadeIn');
      setTimeout(() => {
        if (current) {
          current.classList.remove('fadeOut');
        }
        next.classList.remove('fadeIn');
        next.classList.add('active');
        this.isTransitioning = false;
      }, 1000); // Match CSS animation duration
    }

    this.updateCounter();
    this.resetAutoAdvance();
  }

  updateCounter() {
    const counter = this.element.querySelector('.carousel-counter');
    if (counter) {
      counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
    }
  }

  startAutoAdvance() {
    this.stopAutoAdvance();
    if (this.images.length > 1) {
      this.autoAdvanceTimer = setInterval(() => this.next(), this.autoAdvanceInterval);
    }
  }

  stopAutoAdvance() {
    if (this.autoAdvanceTimer) {
      clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  resetAutoAdvance() {
    this.stopAutoAdvance();
    this.startAutoAdvance();
  }

  destroy() {
    this.stopAutoAdvance();
  }
}

// Initialize carousel on page load
document.addEventListener('DOMContentLoaded', async () => {
  const carouselEl = document.querySelector('.carousel');
  if (!carouselEl) return;

  try {
    // Load data
    const resp = await fetch('data/sections.json');
    if (!resp.ok) throw new Error(`fetch failed: ${resp.status}`);
    const data = await resp.json();

    // Determine which images to use
    const section = carouselEl.dataset.section;
    let images = [];

    if (section && section !== 'all') {
      // Section-specific carousel
      images = data[section] || [];
    } else {
      // Homepage: random selection from all sections
      const allImages = [];
      Object.values(data).forEach(sectionImages => {
        allImages.push(...sectionImages);
      });

      // Shuffle and pick 10 random images
      images = allImages
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
    }

    if (images.length > 0) {
      new Carousel(carouselEl, images, 5000);
    }
  } catch (e) {
    console.warn('Could not initialize carousel:', e);
  }
});
