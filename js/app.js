/* ═══════════════════════════════════════════════
   Wedding Invitation — Mahad & Laiba
   js/app.js
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── DOM refs ── */
  const gate         = document.getElementById('gate');
  const envelope     = document.getElementById('envelope');
  const sealBtn      = document.getElementById('gateOpen');
  const gateTap      = document.getElementById('gateTap');
  const gatePetalsEl = document.getElementById('gatePetals');
  const flapImg      = document.querySelector('.env-flap');

  /* ── Seal + tap-hint position — both anchored to flap bottom edge ── */
  function positionSeal() {
    if (!flapImg || !sealBtn) return;
    if (!flapImg.complete || !flapImg.naturalHeight) return;
    const flapBottom = flapImg.offsetHeight;
    sealBtn.style.top = flapBottom + 'px';
    if (gateTap) {
      gateTap.style.top = (flapBottom + sealBtn.offsetHeight / 2 + 14) + 'px';
      gateTap.style.transform = 'translateX(-50%)';
    }
  }
  if (flapImg) {
    flapImg.addEventListener('load', positionSeal, { once: true });
    positionSeal();
  }
  window.addEventListener('resize', positionSeal);

  /* ══════════════════════════════════════════
     PETALS
  ══════════════════════════════════════════ */
  const PETAL_COLORS = ['#cda45e','#e8c9a8','#f6ead2','#c1440e','#e07b39','#ffd180'];

  function spawnPetal(container) {
    const p     = document.createElement('div');
    p.className = 'petal';
    const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    const size  = 6 + Math.random() * 8;
    const dur   = 4.5 + Math.random() * 5;
    const delay = Math.random() * 4;
    const left  = Math.random() * 100;
    p.style.cssText = [
      `left:${left}%`,
      `width:${size}px`,
      `height:${size * 1.4}px`,
      `background:${color}`,
      `animation-duration:${dur}s`,
      `animation-delay:${delay}s`,
    ].join(';');
    container.appendChild(p);
    setTimeout(() => p.remove(), (dur + delay + 0.2) * 1000);
  }

  function startPetalLoop(container, intervalMs) {
    spawnPetal(container);
    return setInterval(() => spawnPetal(container), intervalMs || 600);
  }

  /* gate petals — run while gate is visible */
  const gatePetalTimer = startPetalLoop(gatePetalsEl, 600);

  /* ══════════════════════════════════════════
     ENVELOPE OPEN
  ══════════════════════════════════════════ */
  let opened = false;

  const bgMusic  = new Audio('img/backmusic.mp3');
  bgMusic.loop   = true;
  bgMusic.volume = 0.5;

  const musicBtn = document.getElementById('musicBtn');

  function setMusicIcon(playing) {
    musicBtn.classList.toggle('is-paused', !playing);
  }

  musicBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
      setMusicIcon(true);
    } else {
      bgMusic.pause();
      setMusicIcon(false);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      bgMusic.pause();
    } else if (opened && !musicBtn.classList.contains('is-paused')) {
      bgMusic.play().catch(() => {});
    }
  });

  function openEnvelope() {
    if (opened) return;
    opened = true;

    bgMusic.play().catch(() => {});
    setMusicIcon(true);

    clearInterval(gatePetalTimer);

    gateTap.classList.add('is-hidden');
    envelope.classList.add('is-opening');

    setTimeout(() => {
      gatePetalsEl.innerHTML = '';
      gate.classList.add('is-gone');
      burstMainPetals();
      setTimeout(() => musicBtn.classList.add('is-visible'), 950);
    }, 2000);
  }

  sealBtn.addEventListener('click', openEnvelope);

  /* burst petals briefly after gate opens */
  function burstMainPetals() {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:10;overflow:hidden';
    document.body.appendChild(wrap);
    setInterval(() => spawnPetal(wrap), 260);
  }


  /* ══════════════════════════════════════════
     COUNTDOWN
  ══════════════════════════════════════════ */
  const TARGET = new Date('2026-11-21T20:00:00+05:00');
  const cdD    = document.getElementById('cd-d');
  const cdH    = document.getElementById('cd-h');
  const cdM    = document.getElementById('cd-m');
  const cdS    = document.getElementById('cd-s');

  function pad(n, len) { return String(n).padStart(len, '0'); }

  function tick() {
    const diff = TARGET - Date.now();
    if (diff <= 0) {
      cdD.textContent = '000';
      cdH.textContent = cdM.textContent = cdS.textContent = '00';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    cdD.textContent = pad(d, 3);
    cdH.textContent = pad(h, 2);
    cdM.textContent = pad(m, 2);
    cdS.textContent = pad(s, 2);
  }

  tick();
  setInterval(tick, 1000);


  /* ══════════════════════════════════════════
     SCROLL FADE
  ══════════════════════════════════════════ */
  const sfEls = document.querySelectorAll('.sf');

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('on');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    sfEls.forEach(el => obs.observe(el));
  } else {
    sfEls.forEach(el => el.classList.add('on'));
  }


  /* ══════════════════════════════════════════
     COUNTDOWN / SCHEDULE PANEL SWITCHER
     All scroll/touch fully intercepted so a
     single fast swipe never skips the panel.
  ══════════════════════════════════════════ */
  const csSec    = document.getElementById('countdownSec');
  const csPanel1 = document.querySelector('.cs-panel-countdown');
  const csPanel2 = document.querySelector('.cs-panel-schedule');
  const csPanel3 = document.querySelector('.cs-panel-closing');

  if (csSec && csPanel1 && csPanel2 && csPanel3) {
    let csState  = 0;   // 0 = countdown, 1 = schedule, 2 = closing
    let csLocked = false;

    function csTo(next) {
      if (csLocked || csState === next) return;
      csLocked = true;
      const prev = csState;
      csState = next;

      if (next > prev) {
        // moving forward: current exits up, next slides in from bottom
        [csPanel1, csPanel2, csPanel3][prev].classList.add('cs-exit');
        [csPanel1, csPanel2, csPanel3][next].classList.add('cs-active');
      } else {
        // moving backward: current slides back down, previous comes back
        [csPanel1, csPanel2, csPanel3][prev].classList.remove('cs-active');
        [csPanel1, csPanel2, csPanel3][next].classList.remove('cs-exit');
      }
      setTimeout(() => { csLocked = false; }, 850);
    }

    let isLeavingForward  = false;
    let isLeavingBackward = false;

    function csGoNext() {
      const next = csSec.nextElementSibling;
      if (!next) return;
      isLeavingForward = true;
      next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function csGoPrev() {
      const prev = csSec.previousElementSibling;
      if (!prev) return;
      isLeavingBackward = true;
      prev.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* wheel */
    csSec.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (csLocked) return;
      if      (e.deltaY >  30 && csState < 2) csTo(csState + 1);
      else if (e.deltaY >  30 && csState === 2) csGoNext();
      else if (e.deltaY < -30 && csState > 0) csTo(csState - 1);
      else if (e.deltaY < -30 && csState === 0) csGoPrev();
    }, { passive: false });

    /* touch */
    let csTY = 0;
    csSec.addEventListener('touchstart', (e) => {
      csTY = e.touches[0].clientY;
    }, { passive: true });
    csSec.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
    csSec.addEventListener('touchend', (e) => {
      if (csLocked) return;
      const dy = csTY - e.changedTouches[0].clientY;
      if      (dy >  40 && csState < 2) csTo(csState + 1);
      else if (dy >  40 && csState === 2) csGoNext();
      else if (dy < -40 && csState > 0) csTo(csState - 1);
      else if (dy < -40 && csState === 0) csGoPrev();
    }, { passive: true });

    function csSetInstant(state) {
      const panels = [csPanel1, csPanel2, csPanel3];
      panels.forEach(p => p.style.transition = 'none');
      csPanel1.classList.remove('cs-exit');
      csPanel2.classList.remove('cs-active', 'cs-exit');
      csPanel3.classList.remove('cs-active');
      if (state >= 1) { csPanel1.classList.add('cs-exit'); csPanel2.classList.add('cs-active'); }
      if (state >= 2) { csPanel2.classList.add('cs-exit'); csPanel3.classList.add('cs-active'); }
      csState = state;
      requestAnimationFrame(() => requestAnimationFrame(() =>
        panels.forEach(p => p.style.transition = '')
      ));
    }

    /* reset panel based on scroll direction when section leaves/enters */
    new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry.isIntersecting) {
        if (isLeavingForward || isLeavingBackward) {
          isLeavingForward  = false;
          isLeavingBackward = false;
          return;
        }
        csSetInstant(0);
      } else if (entry.boundingClientRect.top < -10) {
        // entering from below (scrolling up from next section) → show panel 3
        csSetInstant(2);
      }
    }, { threshold: 0.1 }).observe(csSec);
  }


  /* ══════════════════════════════════════════
     SCROLL HINT — hide on couple portraits
  ══════════════════════════════════════════ */
  const scrollHint  = document.getElementById('scrollHint');
  const coupleSec   = document.querySelector('.couple-sec');
  if (scrollHint && coupleSec) {
    new IntersectionObserver((entries) => {
      scrollHint.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.3 }).observe(coupleSec);
  }


  /* ══════════════════════════════════════════
     FAQ ACCORDION
  ══════════════════════════════════════════ */
  document.querySelectorAll('.faq-q-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(i => i.classList.remove('is-open'));
      if (!isOpen) item.classList.add('is-open');
    });
  });

})();
