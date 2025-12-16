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

    // Add pause indicator
    const pauseIndicator = document.createElement('div');
    pauseIndicator.className = 'carousel-pause-indicator';
    this.element.appendChild(pauseIndicator);

    // Add indicators
    this.renderIndicators();

    // Update counter
    this.updateCounter();
  }

  renderIndicators() {
    // Remove existing indicators
    const existingIndicators = this.element.querySelector('.carousel-indicators');
    if (existingIndicators) existingIndicators.remove();

    // Create new indicators container
    const indicators = document.createElement('div');
    indicators.className = 'carousel-indicators';

    this.images.forEach((img, index) => {
      const indicator = document.createElement('div');
      indicator.className = 'carousel-indicator';
      if (index === 0) indicator.classList.add('active');
      indicator.addEventListener('click', () => {
        this.currentIndex = index;
        this.transition();
      });
      indicators.appendChild(indicator);
    });

    this.element.appendChild(indicators);
  }

  updateIndicators() {
    const indicators = this.element.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => {
      if (index === this.currentIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }

  attachEventListeners() {
    const prevBtn = this.element.querySelector('.carousel-prev');
    const nextBtn = this.element.querySelector('.carousel-next');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    // Pause on hover
    this.element.addEventListener('mouseenter', () => {
      this.stopAutoAdvance();
      this.element.classList.add('paused');
    });
    this.element.addEventListener('mouseleave', () => {
      this.startAutoAdvance();
      this.element.classList.remove('paused');
    });
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
    this.updateIndicators();
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
      // Preload first carousel image for better performance
      const firstImage = images[0];
      if (firstImage) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = firstImage.full_jpg || firstImage.full_webp || firstImage.thumb_jpg;
        if (firstImage.full_webp) {
          preloadLink.type = 'image/webp';
        }
        document.head.appendChild(preloadLink);
      }

      new Carousel(carouselEl, images, 5000);
    }
  } catch (e) {
    console.warn('Could not initialize carousel:', e);
  }
});
