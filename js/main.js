'use strict';

(function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
})();


(function initParticipantsCarousel() {
  const track   = document.getElementById('partTrack');
  const prevBtn = document.getElementById('partPrev');
  const nextBtn = document.getElementById('partNext');
  const counter = document.getElementById('partCounter');

  if (!track || !prevBtn || !nextBtn) return;

  const originals = Array.from(track.children);
  const N = originals.length;
  const CLONES = 3; // must be >= max visible count (3 on desktop)

  originals.slice(-CLONES).reverse().forEach((card) => {
    track.insertBefore(card.cloneNode(true), track.firstChild);
  });

  originals.slice(0, CLONES).forEach((card) => {
    track.appendChild(card.cloneNode(true));
  });

  let current = CLONES;
  let isAnimating = false;

  function getCardWidth() {
    const card = track.children[current] || track.children[0];
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function setPos(idx, instant) {
    if (instant) {
      track.style.transition = 'none';
    }
    track.style.transform = `translateX(-${idx * getCardWidth()}px)`;
    if (instant) {
      track.getBoundingClientRect();
      track.style.transition = '';
    }
  }

  function updateCounter() {
    if (!counter) return;
    const realIndex = ((current - CLONES) % N + N) % N;
    counter.textContent = `${realIndex + 1} / ${N}`;
  }

  function goTo(idx) {
    if (isAnimating) return;
    isAnimating = true;
    current = idx;
    setPos(current, false);
    updateCounter();
  }

  track.addEventListener('transitionend', (e) => {
    if (e.propertyName !== 'transform') return;

    if (current >= CLONES + N) {
      current = CLONES + (current - (CLONES + N));
      setPos(current, true);
    } else if (current < CLONES) {
      current = CLONES + N - (CLONES - current);
      setPos(current, true);
    }

    isAnimating = false;
  });

  setPos(current, true);
  updateCounter();

  let autoTimer = null;

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  startAuto();

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  prevBtn.addEventListener('click', () => {
    stopAuto();
    goTo(current - 1);
    startAuto();
  });

  nextBtn.addEventListener('click', () => {
    stopAuto();
    goTo(current + 1);
    startAuto();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => setPos(current, true), 150);
  });
})();


(function initStagesCarousel() {
  const track      = document.getElementById('stagesTrack');
  const prevBtn    = document.getElementById('stagesPrev');
  const nextBtn    = document.getElementById('stagesNext');
  const dotsWrap   = document.getElementById('stagesDots');

  if (!track || !prevBtn || !nextBtn) return;

  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

  const slides = Array.from(track.querySelectorAll('.stage-slide'));
  const N = slides.length;
  let current = 0;
  let isAnimating = false;

  function getSlideWidth() {
    const slide = slides[0];
    if (!slide) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return slide.getBoundingClientRect().width + gap;
  }

  function setPos(instant) {
    if (instant) track.style.transition = 'none';
    track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
    if (instant) {
      track.getBoundingClientRect();
      track.style.transition = '';
    }
  }

  function updateUI() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === N - 1;
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.stages__dot').forEach((dot, i) => {
      dot.classList.toggle('stages__dot--active', i === current);
    });
  }

  function goTo(idx) {
    if (isAnimating || !isMobile()) return;
    current = Math.max(0, Math.min(N - 1, idx));
    isAnimating = true;
    setPos(false);
    updateUI();
  }

  track.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'transform') isAnimating = false;
  });

  function init() {
    if (!isMobile()) {
      track.style.transform = '';
      track.style.transition = '';
      return;
    }
    current = 0;
    setPos(true);
    updateUI();
  }

  init();

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 150);
  });
})();


(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
