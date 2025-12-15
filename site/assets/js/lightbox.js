// Lightbox: keyboard nav, counter, close
document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('.lb-image');
  const close = lb.querySelector('.lb-close');
  const prev = lb.querySelector('.lb-prev');
  const next = lb.querySelector('.lb-next');
  const counter = lb.querySelector('.lb-counter');

  close.addEventListener('click', () => { closeLightbox(); });
  // click on overlay closes
  lb.addEventListener('click', (ev) => { if (ev.target === lb) closeLightbox(); });

  function closeLightbox(){
    lb.setAttribute('aria-hidden','true');
    lb.removeAttribute('aria-modal');
    lbImg.src = '';
    lb.querySelectorAll('[tabindex="-1"]').forEach(el => el.removeAttribute('tabindex'));
    document.body.classList.remove('no-scroll');
    if (window.previousActiveElement) window.previousActiveElement.focus();
  }

  document.addEventListener('keydown', (e) => {
    if (lb.getAttribute('aria-hidden') === 'false'){
      if (e.key === 'Escape') close.click();
      if (e.key === 'ArrowLeft') showAdjacent(-1);
      if (e.key === 'ArrowRight') showAdjacent(1);

      // trap Tab within lightbox controls
      if (e.key === 'Tab'){
        const focusables = [close, prev, next].filter(Boolean);
        if (focusables.length === 0) return;
        const cur = document.activeElement;
        let idx = focusables.indexOf(cur);
        if (e.shiftKey){
          idx = idx <= 0 ? focusables.length - 1 : idx - 1;
        } else {
          idx = idx === -1 ? 0 : (idx + 1) % focusables.length;
        }
        focusables[idx].focus();
        e.preventDefault();
      }
    }
  });

  prev.addEventListener('click', () => showAdjacent(-1));
  next.addEventListener('click', () => showAdjacent(1));

  function showAdjacent(delta){
    const imgs = Array.from(document.querySelectorAll('.grid img'));
    const idx = imgs.indexOf(window.currentImage);
    if (idx === -1) return;
    const nextIdx = (idx + delta + imgs.length) % imgs.length;
    const nextImg = imgs[nextIdx];
    lbImg.src = nextImg.dataset.fullWebp || nextImg.dataset.fullJpg || nextImg.dataset.full || nextImg.src;
    window.currentImage = nextImg;
    counter.textContent = `${nextIdx+1}/${imgs.length}`;
  }
});
