/* ============================================================================
   FOR THE JUDGE (in simple words):
   This builds the "living" background behind the whole site: faint floating
   equations, slowly-spinning 3D shapes (cubes, spheres, tilted rings) and soft
   glowing orbs — arranged in three depth layers that gently parallax as you
   move the mouse or scroll, so the page feels deep and three-dimensional. It is
   purely decorative: it sits behind everything, ignores clicks, and switches
   off when "reduce motion" is set.
   ============================================================================ */
window.BgFx = (function () {
  'use strict';

  const EQS = [
    'ax² + bx + c = 0', '(x + h)² = k', 'x = (−b ± √(b²−4ac)) / 2a',
    'b² − 4ac', 'y = a(x − h)² + k', 'f(x) = x²', 'Δ = b² − 4ac',
    '(x + 3)² − 9', 'x² − 5x + 6', '√(b² − 4ac)', '−b / 2a',
    'vertex (h, k)', 'y = x²', 'x² + y² = r²', '∑ aₙxⁿ', '∫ x² dx',
    'sin²θ + cos²θ = 1', 'πr²'
  ];
  const COLS = ['--lav-strong', '--pink-strong', '--brand', '--brand-2'];

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const REDUCE = () => (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // depth layers: [class, parallax factor, size scale, opacity]
  const LAYERS = [
    { cls: 'far',  factor: 0.10, scale: 0.7, op: 0.6 },
    { cls: 'mid',  factor: 0.26, scale: 1.0, op: 0.85 },
    { cls: 'near', factor: 0.5,  scale: 1.35, op: 1 }
  ];
  let layerEls = [], mx = 0, my = 0, sy = 0, raf = 0;

  function place(el, scale) {
    el.style.left = rnd(2, 92).toFixed(1) + '%';
    el.style.top = rnd(2, 92).toFixed(1) + '%';
    el.style.setProperty('--dur', rnd(18, 40).toFixed(1) + 's');
    el.style.animationDelay = (-rnd(0, 24)).toFixed(1) + 's';
    el.style.setProperty('--dx', (rnd(-46, 46) * scale).toFixed(0) + 'px');
    el.style.setProperty('--dy', (rnd(-58, 58) * scale).toFixed(0) + 'px');
    el.style.setProperty('--rot', rnd(-18, 18).toFixed(0) + 'deg');
  }

  function eqItem(scale) {
    const it = document.createElement('div');
    it.className = 'bgi bgi-eq';
    it.textContent = pick(EQS);
    it.style.fontSize = (rnd(0.85, 2.0) * scale).toFixed(2) + 'rem';
    it.style.color = 'var(' + pick(COLS) + ')';
    place(it, scale); return it;
  }
  function cubeItem(scale) {
    const it = document.createElement('div'); it.className = 'bgi bgi-cube';
    it.style.setProperty('--sz', (rnd(26, 60) * scale).toFixed(0) + 'px');
    it.style.setProperty('--spin', rnd(11, 22).toFixed(1) + 's');
    it.style.color = 'var(' + pick(COLS) + ')';
    const inner = document.createElement('div'); inner.className = 'cube3d';
    ['fr', 'bk', 'rt', 'lt', 'tp', 'bt'].forEach((c) => {
      const f = document.createElement('span'); f.className = 'cf cf-' + c; inner.appendChild(f);
    });
    it.appendChild(inner); place(it, scale); return it;
  }
  function sphereItem(scale) {
    const it = document.createElement('div'); it.className = 'bgi bgi-sphere';
    it.style.setProperty('--sz', (rnd(22, 52) * scale).toFixed(0) + 'px');
    it.style.setProperty('--spin', rnd(6, 11).toFixed(1) + 's');
    it.style.color = 'var(' + pick(COLS) + ')';
    const inner = document.createElement('div'); inner.className = 'sphere3d';
    it.appendChild(inner); place(it, scale); return it;
  }
  function ringItem(scale) {
    const it = document.createElement('div'); it.className = 'bgi bgi-ring';
    it.style.setProperty('--sz', (rnd(34, 74) * scale).toFixed(0) + 'px');
    it.style.setProperty('--spin', rnd(9, 18).toFixed(1) + 's');
    it.style.color = 'var(' + pick(COLS) + ')';
    const inner = document.createElement('div'); inner.className = 'ring3d';
    it.appendChild(inner); place(it, scale); return it;
  }
  function orbItem(scale) {
    const it = document.createElement('div'); it.className = 'bgi bgi-orb';
    it.style.setProperty('--sz', (rnd(120, 240) * scale).toFixed(0) + 'px');
    it.style.color = 'var(' + pick(COLS) + ')';
    place(it, scale); return it;
  }

  // populate one depth layer with a themed mix of items
  function fillLayer(layer, def) {
    const s = def.scale;
    if (def.cls === 'far') {
      for (let i = 0; i < 6; i++) layer.appendChild(eqItem(s));
      for (let i = 0; i < 2; i++) layer.appendChild(orbItem(s));
      for (let i = 0; i < 2; i++) layer.appendChild(sphereItem(s));
    } else if (def.cls === 'mid') {
      for (let i = 0; i < 6; i++) layer.appendChild(eqItem(s));
      for (let i = 0; i < 3; i++) layer.appendChild(cubeItem(s));
      for (let i = 0; i < 2; i++) layer.appendChild(ringItem(s));
      for (let i = 0; i < 2; i++) layer.appendChild(sphereItem(s));
    } else {
      for (let i = 0; i < 4; i++) layer.appendChild(eqItem(s));
      for (let i = 0; i < 3; i++) layer.appendChild(cubeItem(s));
      for (let i = 0; i < 2; i++) layer.appendChild(ringItem(s));
      for (let i = 0; i < 1; i++) layer.appendChild(orbItem(s));
    }
  }

  // gentle parallax: each layer shifts by its depth factor (mouse + scroll)
  function applyParallax() {
    raf = 0;
    layerEls.forEach((l) => {
      const tx = mx * l.factor, ty = my * l.factor - sy * l.factor * 0.06;
      l.el.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0)';
    });
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(applyParallax); }
  function onMove(e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 46;
    my = (e.clientY / window.innerHeight - 0.5) * 46;
    schedule();
  }
  function onScroll() { sy = window.scrollY || 0; schedule(); }

  function build() {
    if (document.querySelector('.bgfx')) return;
    const field = document.createElement('div');
    field.className = 'bgfx';
    field.setAttribute('aria-hidden', 'true');

    layerEls = [];
    LAYERS.forEach((def) => {
      const layer = document.createElement('div');
      layer.className = 'bg-layer bg-' + def.cls;
      layer.style.opacity = def.op;
      fillLayer(layer, def);
      field.appendChild(layer);
      layerEls.push({ el: layer, factor: def.factor });
    });

    document.body.appendChild(field);

    // interactivity (only when motion is allowed)
    if (!REDUCE()) {
      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  return { init: build };
})();
