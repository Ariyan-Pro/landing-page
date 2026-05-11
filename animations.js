/* ════════════════════════════════════════════════════
   ARIYAN — Shared Animation Engine
   Performant: IntersectionObserver + rAF only
   ════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. CUSTOM CURSOR ───────────────────────────── */
  const dot  = document.querySelector('.custom-cursor');
  const ring = document.querySelector('.cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  if (dot && ring && !prefersReduced) {
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
    }, { passive: true });

    function ringAnim() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
      requestAnimationFrame(ringAnim);
    }
    ringAnim();

    document.querySelectorAll('a, button, .tilt-card, .volume-card, .project-card, .bento-cell')
      .forEach(el => {
        el.addEventListener('mouseenter', () => dot.classList.add('expanded'), { passive: true });
        el.addEventListener('mouseleave', () => dot.classList.remove('expanded'), { passive: true });
      });
  }

  /* ── 2. SCROLL PROGRESS BAR ─────────────────────── */
  const bar = document.querySelector('.progress-bar');
  if (bar) {
    const updateBar = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop || document.body.scrollTop) /
                  (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateBar, { passive: true });
  }

  /* ── 3. INTERSECTION OBSERVER — SCROLL REVEAL ───── */
  if (!prefersReduced) {
    const srObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          srObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.sr').forEach(el => srObs.observe(el));
  } else {
    document.querySelectorAll('.sr').forEach(el => el.classList.add('visible'));
  }

  /* ── 4. BENTO CELL REVEAL ───────────────────────── */
  if (!prefersReduced) {
    const bentoObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // stagger children
          e.target.querySelectorAll('.bento-cell').forEach((cell, i) => {
            setTimeout(() => cell.classList.add('visible'), i * 70);
          });
          bentoObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.bento').forEach(el => bentoObs.observe(el));
  } else {
    document.querySelectorAll('.bento-cell').forEach(el => el.classList.add('visible'));
  }

  /* ── 5. TIMELINE ITEMS ──────────────────────────── */
  if (!prefersReduced) {
    const tlObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.timeline-item').forEach((item, i) => {
            setTimeout(() => item.classList.add('visible'), i * 90);
          });
          tlObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });

    document.querySelectorAll('.timeline').forEach(el => tlObs.observe(el));
  } else {
    document.querySelectorAll('.timeline-item').forEach(el => el.classList.add('visible'));
  }

  /* ── 6. QUOTE TREE ──────────────────────────────── */
  if (!prefersReduced) {
    const qtObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const trunk = e.target.querySelector('.qt-trunk');
          if (trunk) trunk.classList.add('visible');
          e.target.querySelectorAll('.qt-item').forEach((item, i) => {
            setTimeout(() => item.classList.add('visible'), 300 + i * 320);
          });
          qtObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.quote-tree').forEach(el => qtObs.observe(el));
  } else {
    document.querySelectorAll('.qt-trunk, .qt-item').forEach(el => el.classList.add('visible'));
  }

  /* ── 7. 3D TILT ─────────────────────────────────── */
  if (!prefersReduced) {
    document.querySelectorAll('.tilt-wrap').forEach(wrap => {
      const card  = wrap.querySelector('.tilt-card') || wrap;
      const shine = card.querySelector('.tilt-shine');

      let rafId = null;
      let targetRX = 0, targetRY = 0;
      let currentRX = 0, currentRY = 0;

      const lerp = (a, b, t) => a + (b - a) * t;

      function tick() {
        currentRX = lerp(currentRX, targetRX, 0.1);
        currentRY = lerp(currentRY, targetRY, 0.1);
        card.style.transform =
          `perspective(1100px) rotateX(${currentRX}deg) rotateY(${currentRY}deg) translateZ(8px)`;
        if (Math.abs(currentRX - targetRX) > 0.01 || Math.abs(currentRY - targetRY) > 0.01) {
          rafId = requestAnimationFrame(tick);
        } else {
          rafId = null;
        }
      }

      wrap.addEventListener('mousemove', e => {
        const rect = wrap.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width  - 0.5;
        const py = (e.clientY - rect.top)  / rect.height - 0.5;
        targetRY =  px * 14;
        targetRX = -py * 10;
        if (shine) {
          shine.style.setProperty('--mx', (px + 0.5) * 100 + '%');
          shine.style.setProperty('--my', (py + 0.5) * 100 + '%');
        }
        if (!rafId) rafId = requestAnimationFrame(tick);
      }, { passive: true });

      wrap.addEventListener('mouseleave', () => {
        targetRX = 0; targetRY = 0;
        if (shine) shine.style.setProperty('--mx', '50%');
        if (card.style.transform !== '') {
          if (!rafId) rafId = requestAnimationFrame(tick);
        }
        // reset
        setTimeout(() => {
          currentRX = 0; currentRY = 0;
          card.style.transform = '';
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        }, 500);
      }, { passive: true });
    });
  }

  /* ── 8. HERO PARALLAX ───────────────────────────── */
  const heroTitle = document.querySelector('.parallax-title');
  if (heroTitle && !prefersReduced) {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 2) {
        heroTitle.style.transform = `translateY(${y * 0.18}px)`;
        lastY = y;
      }
    }, { passive: true });
  }

  /* ── 9. SECTION BREAK SPARKLE ───────────────────── */
  if (!prefersReduced) {
    document.querySelectorAll('.section-break').forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            el.style.opacity = '1';
            el.style.letterSpacing = '0.6em';
            obs.unobserve(el);
          }
        });
      }, { threshold: 0.5 });
      el.style.opacity    = '0.2';
      el.style.transition = 'opacity 1s ease, letter-spacing 1s ease';
      obs.observe(el);
    });
  }

})();
