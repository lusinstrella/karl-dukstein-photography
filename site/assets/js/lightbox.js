// Lightbox: keyboard nav, counter, close
document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('.lb-image');
  const close = lb.querySelector('.lb-close');
  const prev = lb.querySelector('.lb-prev');
  const next = lb.querySelector('.lb-next');
  const counter = lb.querySelector('.lb-counter');

  close.addEventListener('click', () => { lb.setAttribute('aria-hidden','true'); lbImg.src = ''; });

  document.addEventListener('keydown', (e) => {
    if (lb.getAttribute('aria-hidden') === 'false'){
      if (e.key === 'Escape') close.click();
      if (e.key === 'ArrowLeft') showAdjacent(-1);
      if (e.key === 'ArrowRight') showAdjacent(1);
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
    lbImg.src = nextImg.dataset.full || nextImg.dataset.fullJpg || nextImg.src;
    window.currentImage = nextImg;
    counter.textContent = `${nextIdx+1}/${imgs.length}`;
  }
});
