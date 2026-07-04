/* ============================================================================
   p5fx.js — The Fluid Vector Field
   An advanced, organic Perlin noise particle flow background.
   ============================================================================ */
window.P5Fx = (function () {
  'use strict';

  const REDUCE = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sketch(p) {
    let particles = [];
    const NUM_PARTICLES = p.windowWidth < 600 ? 500 : 1500;
    const NOISE_SCALE = 0.003;
    const Z_OFFSET_SPEED = 0.002;
    let zOffset = 0;
    let dark = false;

    p.setup = function () {
      const c = p.createCanvas(p.windowWidth, p.windowHeight);
      c.canvas.style.position = 'fixed';
      c.canvas.style.top = '0';
      c.canvas.style.left = '0';
      c.canvas.style.zIndex = '-3';
      c.canvas.style.pointerEvents = 'none';
      c.canvas.setAttribute('aria-hidden', 'true');
      
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));

      for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push({
          x: p.random(p.width),
          y: p.random(p.height),
          speed: p.random(0.5, 1.5),
          isPink: p.random() > 0.6,
          life: p.random(100, 300)
        });
      }

      if (REDUCE()) { p.noLoop(); }
    };

    p.draw = function () {
      // Create a slight trailing effect by drawing a faint rectangle instead of clear()
      p.clear();
      
      dark = document.documentElement.getAttribute('data-theme') === 'dark';
      
      p.noStroke();

      for (let i = 0; i < particles.length; i++) {
        let pt = particles[i];

        // Get angle from 3D perlin noise
        let angle = p.noise(pt.x * NOISE_SCALE, pt.y * NOISE_SCALE, zOffset) * p.TWO_PI * 4;
        
        // Move particle
        pt.x += p.cos(angle) * pt.speed;
        pt.y += p.sin(angle) * pt.speed;
        
        pt.life--;

        // Fade in and out based on life
        let alpha = p.map(pt.life, 0, 300, 0, 0.4);
        if (alpha < 0) alpha = 0;
        
        // Wrap edges or respawn if dead
        if (pt.x < 0 || pt.x > p.width || pt.y < 0 || pt.y > p.height || pt.life <= 0) {
          pt.x = p.random(p.width);
          pt.y = p.random(p.height);
          pt.life = p.random(100, 300);
        }

        // Draw particle
        if (pt.isPink) {
          p.fill(`rgba(224, 96, 154, ${alpha})`); // Pink
        } else {
          p.fill(`rgba(122, 92, 240, ${alpha})`); // Lavender
        }
        
        // Elongate particle based on velocity to make it look like a flow streak
        p.push();
        p.translate(pt.x, pt.y);
        p.rotate(angle);
        p.ellipse(0, 0, pt.speed * 2.5, 1.5);
        p.pop();
      }

      zOffset += Z_OFFSET_SPEED;
    };

    p.windowResized = function () {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  }

  function init() {
    if (!window.p5) return;
    new p5(sketch);
  }

  return { init: init };
})();

// Wait for DOM to load, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.P5Fx.init);
} else {
  window.P5Fx.init();
}
