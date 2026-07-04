/* ============================================================================
   FOR THE JUDGE (in simple words):
   This draws the graph (the U-shaped parabola) for the same equation. It marks
   where the curve crosses the x-axis (the roots/answers), the turning point
   (vertex) and the line of symmetry, so students see the algebra and the graph
   agree with each other.
   ============================================================================ */
/* QuadVision — grapher.js
   Plots y = ax² + bx + c with auto-fit axes and marks roots, vertex,
   y-intercept and the axis of symmetry. The curve draws itself on Play. */
window.Grapher = (function () {
  'use strict';

  // State variables
  let canvas, ctx, dpr = 1, W = 0, H = 0, pal = {};  // Canvas context and palette
  let prob = null, view = null, drawT = 1, raf = null, animStart = 0;  // Current problem and view
  let hover = { x: 0, active: false };  // interactive tracer point that rides the curve
  const DUR = 900;  // Animation duration in milliseconds
  // easeOut creates a smooth easing animation (starts fast, slows down at the end)
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  // readPalette reads colour values from CSS variables
  // This allows the colors to change when switching light/dark theme
  function readPalette() {
    // Get all CSS variables from the root element
    const cs = getComputedStyle(document.documentElement);
    // Helper function to get a CSS variable with a fallback color
    const g = (n, f) => (cs.getPropertyValue(n).trim() || f);
    // Build the color palette used for drawing the graph
    pal = {
      grid: g('--g-grid', 'rgba(36,59,83,.08)'),        // Grid lines
      axis: g('--g-axis', 'rgba(36,59,83,.45)'),        // X and Y axes
      curve: g('--brand', '#1f5fa8'),                    // Parabola curve
      curve2: g('--brand-2', '#2f8f86'),                 // Gradient color for curve
      root: g('--pink-strong', '#e0609a'),               // Where curve crosses X axis
      vertex: g('--lav-strong', '#7a5cf0'),              // Turning point of parabola
      ink: g('--ink', '#243b53'),                        // Text color
      soft: g('--muted', 'rgba(36,59,83,.6)')            // Muted text color
    };
  }

  // attach connects the grapher to a canvas element on the page
  function attach(el) {
    canvas = el;  // Store reference to the canvas
    ctx = canvas.getContext('2d');  // Get 2D drawing context
    readPalette();  // Load colours from CSS
    resize();  // Set up the canvas size
    window.addEventListener('resize', resize);  // Redraw if window is resized
    wireTrace();  // make the graph interactive (drag a point along the curve)
  }

  // wireTrace lets the user hover/drag across the graph; a point rides the curve
  // and shows its exact (x, y). This is what makes the graph interactive, not static.
  function wireTrace() {
    function at(e) {
      if (!view) return;
      const rect = canvas.getBoundingClientRect();
      const cxp = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      let x = view.xmin + (cxp - pad.l) / (W - pad.l - pad.r) * (view.xmax - view.xmin);
      x = Math.max(view.xmin, Math.min(view.xmax, x));
      // magnetic snap: the tracer clicks onto the meaningful points — the
      // roots, the vertex and the y-intercept — when the finger gets close.
      const snapTol = (view.xmax - view.xmin) * 0.03;
      const cands = [view.vx, 0];
      if (view.D >= 0) {
        const s = Math.sqrt(view.D);
        cands.push((-prob.b - s) / (2 * prob.a), (-prob.b + s) / (2 * prob.a));
      }
      let bestD = snapTol, snapped = null;
      for (let i = 0; i < cands.length; i++) {
        const d = Math.abs(x - cands[i]);
        if (d < bestD) { bestD = d; snapped = cands[i]; }
      }
      if (snapped != null) x = snapped;
      hover.x = x; hover.snapped = snapped != null; hover.active = true; draw();
    }
    function off() { if (hover.active) { hover.active = false; draw(); } }
    canvas.addEventListener('mousemove', at);
    canvas.addEventListener('mouseleave', off);
    canvas.addEventListener('touchstart', function (e) { at(e); }, { passive: true });
    canvas.addEventListener('touchmove', function (e) { at(e); if (e.cancelable) e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchend', off);
  }

  // resize adapts the canvas to the window size and handles high-DPI screens
  function resize() {
    if (!canvas) return;
    // Get the actual display size of the canvas
    const rect = canvas.getBoundingClientRect();
    // Get the device pixel ratio (for retina screens, etc.)
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Set canvas width/height (at least 240px)
    W = Math.max(rect.width, 240); H = Math.max(rect.height, 240);
    // Scale the canvas by device pixel ratio for crisp drawing
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);  // Apply scaling
    draw();  // Redraw the graph
  }

  // setProblem updates the graph for a new quadratic equation
  function setProblem(a, b, c) {
    // Store the coefficients
    prob = { a: +a, b: +b, c: +c };
    // Calculate the view bounds (what part of the graph to show)
    computeView();
    // Redraw the graph
    draw();
  }

  // computeView calculates what portion of the graph to display
  function computeView() {
    // If a is 0, it's not a parabola, so don't show a graph
    if (!prob || prob.a === 0) { view = null; return; }

    const { a, b, c } = prob;
    // Find the vertex (turning point) of the parabola
    const vx = -b / (2 * a);  // Vertex x-coordinate
    const vy = a * vx * vx + b * vx + c;  // Vertex y-coordinate

    // Calculate the discriminant to find where the curve crosses the x-axis
    const D = b * b - 4 * a * c;
    const xs = [vx, 0];  // Important x values: vertex and origin
    // Add the roots if they exist
    if (D >= 0) {
      const s = Math.sqrt(D);
      xs.push((-b - s) / (2 * a), (-b + s) / (2 * a));
    }

    // Determine the x-range to display
    let xmin = Math.min(...xs), xmax = Math.max(...xs);
    let span = Math.max(xmax - xmin, 2);  // At least 2 units wide
    xmin -= span * 0.45; xmax += span * 0.45;  // Add padding on both sides

    // Sample the curve to find the y-range
    const N = 80;  // Sample 80 points
    let ymin = Math.min(vy, c, 0), ymax = Math.max(vy, c, 0);
    for (let i = 0; i <= N; i++) {
      const x = xmin + (xmax - xmin) * i / N;
      const y = a * x * x + b * x + c;
      // Track the minimum and maximum y values
      if (y < ymin) ymin = y; if (y > ymax) ymax = y;
    }

    // Add padding to the y-range
    const yspan = Math.max(ymax - ymin, 2);  // At least 2 units tall
    ymin -= yspan * 0.12; ymax += yspan * 0.12;

    // Store the view bounds
    view = { xmin, xmax, ymin, ymax, vx, vy, D };
  }

  // play starts the animation of the curve drawing itself
  function play() {
    if (!view) return;  // Don't play if there's no graph
    drawT = 0;  // Reset animation progress to start
    animStart = performance.now();  // Record animation start time
    if (raf) cancelAnimationFrame(raf);  // Cancel any existing animation
    loop();  // Start animation loop
  }

  // loop runs each frame of the curve animation
  function loop() {
    // Calculate animation progress (0 to 1)
    drawT = Math.min(1, (performance.now() - animStart) / DUR);
    draw();  // Redraw at new progress level
    // Keep animating until we reach 100%
    if (drawT < 1) raf = requestAnimationFrame(loop); else raf = null;
  }

  // Padding for the graph (space for axes, labels, etc.)
  const pad = { l: 34, r: 18, t: 16, b: 26 };

  // sx converts x-axis value to screen pixel
  const sx = (x) => pad.l + (x - view.xmin) / (view.xmax - view.xmin) * (W - pad.l - pad.r);
  // sy converts y-axis value to screen pixel (note: y is flipped because canvas coordinates are top-down)
  const sy = (y) => pad.t + (1 - (y - view.ymin) / (view.ymax - view.ymin)) * (H - pad.t - pad.b);

  // niceStep finds a "nice" grid spacing (like 1, 2, 5, 10, etc.) for the graph
  // This makes the grid look clean and easy to read
  function niceStep(range, target) {
    // Calculate raw step size needed to fit target number of steps
    const raw = range / target;
    // Find the order of magnitude (10^n)
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    // Normalize to 1-10 range
    const norm = raw / mag;
    // Choose a nice multiplier: 1, 2, 5, or 10
    const step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
    // Return the final step size
    return step * mag;
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    if (!view) { msg(); return; }
    const { a, b, c } = prob;

    // grid
    const stepX = niceStep(view.xmax - view.xmin, 8);
    const stepY = niceStep(view.ymax - view.ymin, 6);
    ctx.lineWidth = 1; ctx.strokeStyle = pal.grid;
    for (let x = Math.ceil(view.xmin / stepX) * stepX; x <= view.xmax; x += stepX) {
      ctx.beginPath(); ctx.moveTo(sx(x), pad.t); ctx.lineTo(sx(x), H - pad.b); ctx.stroke();
    }
    for (let y = Math.ceil(view.ymin / stepY) * stepY; y <= view.ymax; y += stepY) {
      ctx.beginPath(); ctx.moveTo(pad.l, sy(y)); ctx.lineTo(W - pad.r, sy(y)); ctx.stroke();
    }

    // numeric labels on the grid so the graph reads like real graph paper
    ctx.save();
    ctx.fillStyle = pal.soft; ctx.font = '600 10px Nunito, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let x = Math.ceil(view.xmin / stepX) * stepX; x <= view.xmax; x += stepX) {
      if (Math.abs(x) < stepX * 1e-6) continue;                    // skip 0 (origin clutter)
      ctx.fillText(MathCore.num(x), sx(x), H - pad.b + 4);
    }
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let y = Math.ceil(view.ymin / stepY) * stepY; y <= view.ymax; y += stepY) {
      if (Math.abs(y) < stepY * 1e-6) continue;
      ctx.fillText(MathCore.num(y), pad.l - 4, sy(y));
    }
    ctx.restore();

    // axes
    ctx.strokeStyle = pal.axis; ctx.lineWidth = 1.5;
    if (view.ymin < 0 && view.ymax > 0) { ctx.beginPath(); ctx.moveTo(pad.l, sy(0)); ctx.lineTo(W - pad.r, sy(0)); ctx.stroke(); }
    if (view.xmin < 0 && view.xmax > 0) { ctx.beginPath(); ctx.moveTo(sx(0), pad.t); ctx.lineTo(sx(0), H - pad.b); ctx.stroke(); }

    // axis arrowheads + letters — makes it read like a proper maths diagram
    ctx.save(); ctx.fillStyle = pal.axis;
    if (view.ymin < 0 && view.ymax > 0) {
      const ay = sy(0);
      ctx.beginPath(); ctx.moveTo(W - pad.r, ay); ctx.lineTo(W - pad.r - 8, ay - 4); ctx.lineTo(W - pad.r - 8, ay + 4); ctx.closePath(); ctx.fill();
      ctx.font = 'italic 700 12px Nunito, system-ui'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText('x', W - pad.r - 2, ay - 6);
    }
    if (view.xmin < 0 && view.xmax > 0) {
      const ax = sx(0);
      ctx.beginPath(); ctx.moveTo(ax, pad.t); ctx.lineTo(ax - 4, pad.t + 8); ctx.lineTo(ax + 4, pad.t + 8); ctx.closePath(); ctx.fill();
      ctx.font = 'italic 700 12px Nunito, system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('y', ax + 7, pad.t);
    }
    ctx.restore();

    // axis of symmetry — labelled, because x = −b/2a IS the “h” from
    // completing the square: the graph meets the algebra right here.
    ctx.save(); ctx.strokeStyle = pal.vertex; ctx.globalAlpha = .5; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sx(view.vx), pad.t); ctx.lineTo(sx(view.vx), H - pad.b); ctx.stroke(); ctx.restore();
    if (drawT > 0.8) {
      ctx.save();
      const st = 'x = ' + MathCore.num(view.vx);
      ctx.font = '700 10px Nunito, system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const stw = ctx.measureText(st).width + 12;
      let stx = sx(view.vx); stx = Math.max(pad.l + stw / 2, Math.min(W - pad.r - stw / 2, stx));
      ctx.globalAlpha = (drawT - 0.8) / 0.2;
      ctx.fillStyle = pal.vertex; ctx.beginPath(); ctx.roundRect(stx - stw / 2, pad.t + 2, stw, 16, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(st, stx, pad.t + 10.5);
      ctx.restore();
    }

    // parabola (progressive)
    const N = 220, end = Math.floor(N * easeOut(drawT));

    // soft area fill between the curve and the x-axis (up to draw progress)
    if (end > 1 && view.ymin < 0.001) {
      const y0 = sy(Math.max(0, Math.min(view.ymax, Math.max(view.ymin, 0))));
      const fillGrad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
      fillGrad.addColorStop(0, pal.curve); fillGrad.addColorStop(1, pal.curve2);
      ctx.save(); ctx.globalAlpha = 0.09; ctx.fillStyle = fillGrad; ctx.beginPath();
      ctx.moveTo(sx(view.xmin), y0);
      for (let i = 0; i <= end; i++) {
        const x = view.xmin + (view.xmax - view.xmin) * i / N;
        ctx.lineTo(sx(x), sy(a * x * x + b * x + c));
      }
      ctx.lineTo(sx(view.xmin + (view.xmax - view.xmin) * end / N), y0);
      ctx.closePath(); ctx.fill(); ctx.restore();
    }

    const grad = ctx.createLinearGradient(pad.l, 0, W - pad.r, 0);
    grad.addColorStop(0, pal.curve); grad.addColorStop(1, pal.curve2);
    ctx.save();
    ctx.shadowColor = pal.curve; ctx.shadowBlur = 10;               // gentle glow
    ctx.strokeStyle = grad; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let i = 0; i <= end; i++) {
      const x = view.xmin + (view.xmax - view.xmin) * i / N;
      const y = a * x * x + b * x + c;
      const px = sx(x), py = sy(y);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    if (drawT < 0.6) return;       // wait for the curve before placing markers
    const mA = (drawT - 0.6) / 0.4;

    // y-intercept
    dot(sx(0), sy(c), pal.curve2, 4.5, mA);

    // roots
    if (view.D >= 0) {
      const s = Math.sqrt(view.D);
      const r1 = (-b - s) / (2 * a), r2 = (-b + s) / (2 * a);
      [r1, r2].forEach((r) => { dot(sx(r), sy(0), pal.root, 5.5, mA); });
      tag(MathCore.num(r1), sx(r1), sy(0) + (a > 0 ? 16 : -16), pal.root, mA);
      if (Math.abs(r1 - r2) > 1e-6) tag(MathCore.num(r2), sx(r2), sy(0) + (a > 0 ? 16 : -16), pal.root, mA);
    }

    // vertex
    dot(sx(view.vx), sy(view.vy), pal.vertex, 5.5, mA);
    tag('(' + MathCore.num(view.vx) + ', ' + MathCore.num(view.vy) + ')',
      sx(view.vx), sy(view.vy) + (a > 0 ? 18 : -18), pal.vertex, mA);

    drawTracer(a, b, c);
  }

  // a faint hint, then the live tracer point the user drags along the curve
  function drawTracer(a, b, c) {
    if (drawT < 1) return;
    if (!hover.active) {
      ctx.save();
      ctx.fillStyle = pal.soft; ctx.globalAlpha = .8;
      ctx.font = '600 11px Nunito, system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('\u2194 drag across the curve to read points', W / 2, pad.t + 2);
      ctx.restore();
      return;
    }
    const x = hover.x, y = a * x * x + b * x + c;
    const px = sx(x), py = sy(y);
    // crosshair lines to the axes
    ctx.save();
    ctx.strokeStyle = pal.curve; ctx.globalAlpha = .35; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(px, pad.t); ctx.lineTo(px, H - pad.b); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.l, py); ctx.lineTo(W - pad.r, py); ctx.stroke();
    ctx.restore();
    // the point itself — when snapped to a special point it gets a gold ring
    if (hover.snapped) {
      ctx.save(); ctx.strokeStyle = '#ffb84d'; ctx.lineWidth = 2.5; ctx.globalAlpha = .95;
      ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    dot(px, py, pal.curve, hover.snapped ? 7 : 6, 1);
    // coordinate label, kept inside the canvas
    const txt = '(' + MathCore.num(x) + ', ' + MathCore.num(y) + ')';
    let lx = px, ly = py - 16; if (ly < pad.t + 12) ly = py + 18;
    ctx.save();
    ctx.font = '700 12px Nunito, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(txt).width + 14;
    lx = Math.max(pad.l + w / 2, Math.min(W - pad.r - w / 2, lx));
    ctx.fillStyle = pal.curve; rrect(lx - w / 2, ly - 10, w, 20, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText(txt, lx, ly);
    ctx.restore();
  }

  function dot(x, y, color, r, alpha) {
    ctx.save(); ctx.globalAlpha = alpha;
    // halo ring behind the dot
    ctx.strokeStyle = color; ctx.globalAlpha = alpha * 0.28; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y, r + 5, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = alpha; ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.restore();
  }
  function tag(text, x, y, color, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
    ctx.font = '600 12px Nunito, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(text).width + 10;
    ctx.globalAlpha = alpha * .9; ctx.fillStyle = 'rgba(255,255,255,.82)';
    rrect(x - w / 2, y - 9, w, 18, 6); ctx.fill();
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillText(text, x, y);
    ctx.restore();
  }
  function rrect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function msg() {
    ctx.save(); ctx.fillStyle = pal.soft; ctx.font = '15px Nunito, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Enter a, b, c with a ≠ 0', W / 2, H / 2); ctx.restore();
  }

  // refresh re-reads colors from CSS (used when theme changes) and redraws
  function refresh() { readPalette(); draw(); }

  // Export the public functions
  return { attach, resize, setProblem, play, refresh, draw };
})();
