/* ============================================================================
   FOR THE JUDGE (in simple words):
   This is the "conductor". It listens to the a, b, c boxes, asks the maths brain
   for the answer, tells the tile picture and the graph what to draw, runs the
   Play / Next / Back buttons for the walkthrough, handles the photo scan, and
   the language switch. It connects all the other files together.
   ============================================================================ */
/* QuadVision — app.js
   Ties the inputs, solver, tile visualizer, grapher, walkthrough and
   photo scanner together, and handles the language switch. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const num = MathCore.num;

  // ---- state ----- These variables track what's currently happening in the app

  // steps = array of step objects for the walkthrough
  // stepIx = which step we're currently on (0 = first step)
  // playing = whether the autoplay is running
  // playTimer = the timeout ID for the current step timer
  // lastRes = the most recent solve result (used by Squary the mascot)
  let steps = [], stepIx = 0, playing = false, playTimer = null, lastRes = null;
  // PLAY_MS = how many milliseconds each step stays visible during autoplay
  const PLAY_MS = 3800;   // time each step lingers during autoplay (reading time)

  // ---- elements ----
  const inA = $('#inA'), inB = $('#inB'), inC = $('#inC');
  const eqPreview = $('#eqPreview');
  const sumDisc = $('#sumDisc'), sumRoots = $('#sumRoots'), sumVertex = $('#sumVertex'), sumAxis = $('#sumAxis');
  const sumVForm = $('#sumVForm'), sumStdForm = $('#sumStdForm');
  const rootsBadge = $('#rootsBadge');
  const stepTitle = $('#stepTitle'), stepNote = $('#stepNote'), stepMath = $('#stepMath');
  const stepDots = $('#stepDots'), stepCounter = $('#stepCounter');
  const btnPlay = $('#btnPlay');

  // ---- equation preview ----- These functions format the equation for display

  // fmtTerm formats a single term like "3x" or "−5" for display
  function fmtTerm(coef, suffix, lead) {
    // Skip zero terms (except leading term)
    if (coef === 0 && !lead) return '';
    // Get the absolute value of the coefficient
    const a = Math.abs(coef);
    // If coefficient is 1 and has a suffix, don't show it
    const mag = (a === 1 && suffix) ? '' : trimNum(a);
    // Add appropriate sign (nothing for first positive term, + or - for others)
    const sign = lead ? (coef < 0 ? '−' : '') : (coef < 0 ? ' − ' : ' + ');
    return sign + mag + suffix;
  }

  // trimNum safely converts a number to a string for display
  function trimNum(x) { return Number.isFinite(x) ? num(x) : '0'; }

  // readVals gets the current values of a, b, c from the input boxes
  function readVals() {
    // Read values from the three input boxes
    const a = parseFloat(inA.value), b = parseFloat(inB.value), c = parseFloat(inC.value);
    // Return 0 if any value is invalid (not a finite number)
    return { a: Number.isFinite(a) ? a : 0, b: Number.isFinite(b) ? b : 0, c: Number.isFinite(c) ? c : 0 };
  }

  // renderPreview shows the equation as the user types it in
  function renderPreview() {
    const { a, b, c } = readVals();
    // Start building the equation display
    const lead = fmtTerm(a, 'x²', true) || (a === 0 ? '' : '');
    let html;
    // Handle special cases where all coefficients are 0
    if (a === 0 && b === 0 && c === 0) html = '0 = 0';
    else html = (a === 0 ? (fmtTerm(b, 'x', true) || '') : fmtTerm(a, 'x²', true))
      + (a === 0 ? '' : fmtTerm(b, 'x'))  // Skip b term if a is 0 (not a quadratic)
      + fmtTerm(c, '') + ' = 0';
    // If a and b are both 0, just show c = 0
    if (a === 0 && b === 0) html = trimNum(c) + ' = 0';
    // Display the equation, removing any leading " + "
    eqPreview.innerHTML = html.replace(/^ \+ /, '');
  }

  // ---- summary ----- Functions to display the solution summary

  // rootsLabel gets the human-readable description of how many roots exist
  function rootsLabel(res) {
    // Map from result type to the translation key
    const map = { two: 'roots_two', double: 'roots_double', complex: 'roots_complex',
      linear: 'roots_linear', none: 'roots_none', all: 'roots_all' };
    // Look up the translation and return it
    return I18N.t(map[res.type] || 'roots_two');
  }
  function fmtRoots(res) {
    if (res.degenerate) {
      if (res.type === 'linear') return 'x = ' + num(res.roots[0]);
      if (res.type === 'none') return '—';
      if (res.type === 'all') return '∀ x';
    }
    const ex = MathCore.exactRoots(res.a, res.b, res.c);
    if (res.type === 'two') {
      let s = 'x = ' + num(res.roots[0]) + ' , ' + num(res.roots[1]);
      if (ex) s += ' <span class="exact">(' + ex.html + ')</span>';
      return s;
    }
    if (res.type === 'double') {
      let s = 'x = ' + num(res.roots[0]);
      return s;
    }
    const r = res.roots[1];
    let s = 'x = ' + num(r.re) + ' ± ' + num(Math.abs(r.im)) + '<em>i</em>';
    return s;
  }

  // a(x − h)² + k  — the vertex form, built from the solved result
  function vertexFormHtml(res) {
    const a = res.a, h = res.vertexX, k = res.vertexY;
    const aPart = (Math.abs(a - 1) < 1e-9) ? '' : (Math.abs(a + 1) < 1e-9 ? '−' : num(a));
    const inner = 'x ' + (h < 0 ? '+' : '−') + ' ' + num(Math.abs(h));
    let kPart = '';
    if (Math.abs(k) >= 1e-9) kPart = (k < 0 ? ' − ' : ' + ') + num(Math.abs(k));
    return aPart + '(' + inner + ')²' + kPart;
  }

  function renderSummary(res) {
    rootsBadge.textContent = rootsLabel(res);
    rootsBadge.className = 'badge ' + (res.type || 'two');
    if (sumStdForm) sumStdForm.innerHTML = eqPreview.innerHTML;
    if (res.degenerate) {
      sumDisc.textContent = '—';
      sumRoots.innerHTML = fmtRoots(res);
      sumVertex.textContent = '—'; sumAxis.textContent = '—';
      if (sumVForm) sumVForm.textContent = '—';
      return;
    }
    sumDisc.innerHTML = 'b² − 4ac = ' + num(res.D);
    sumRoots.innerHTML = fmtRoots(res);
    sumVertex.innerHTML = '(' + num(res.vertexX) + ', ' + num(res.vertexY) + ')';
    sumAxis.innerHTML = 'x = ' + num(res.axis);
    if (sumVForm) sumVForm.innerHTML = vertexFormHtml(res);
  }

  // ---- walkthrough ----- Build and display the step-by-step solution

  // buildAll is the main solver: reads input, solves, and updates all displays
  function buildAll(opts) {
    // Get current a, b, c values from input boxes
    const { a, b, c } = readVals();
    // Show the equation preview
    renderPreview();
    // Solve the quadratic
    const res = MathCore.solve(a, b, c);
    lastRes = res;  // Store for Squary mascot
    // Display the solution summary (roots, discriminant, vertex, etc.)
    renderSummary(res);

    // Special case: if a is 0, it's not a quadratic
    if (a === 0) {
      // Clear the walkthrough
      steps = []; stepDots.innerHTML = ''; stepCounter.textContent = '';
      stepTitle.textContent = I18N.t('roots_linear');  // Show "Linear equation"
      stepNote.textContent = ''; stepMath.innerHTML = '';
      // Show intro state (just the x² square pulsing)
      Visualizer.setProblem(1, 0, 0); Visualizer.show('intro');
      // But still update the graph
      Grapher.setProblem(a, b, c);
      // Tell Squary it's not valid
      if (opts && opts.play && window.Squary) Squary.onInvalid();
      return;
    }

    // Build the step-by-step walkthrough
    steps = MathCore.buildSteps(a, b, c, I18N.labels());
    // Set up the visualizer and grapher
    Visualizer.setProblem(a, b, c);
    Grapher.setProblem(a, b, c);
    // Show the step navigation dots
    renderDots();
    // Start at step 0
    stepIx = 0;
    renderStep(false);  // Don't animate yet
    // If autoplay was requested, start it
    if (opts && opts.play) {
      startPlay();
      if (window.Squary) Squary.onSolveStart(res);  // Notify mascot
      // Count a deliberate, valid solve toward XP and badges.
      if (window.Store && !res.degenerate) { Store.markSolved(); Store.addXP(10); }
    } else {
      stopPlay();
    }
  }

  // renderDots creates the step navigation dots (one for each step)
  function renderDots() {
    stepDots.innerHTML = '';
    // Create one button for each step
    steps.forEach((s, i) => {
      const d = document.createElement('button');
      d.className = 'dot'; d.type = 'button';
      d.setAttribute('aria-label', 'Step ' + (i + 1));
      // Clicking a dot jumps to that step
      d.addEventListener('click', () => {
        stopPlay();  // Stop autoplay
        stepIx = i;  // Jump to this step
        renderStep(true);  // Render it with animation
      });
      stepDots.appendChild(d);
    });
  }

  // renderStep displays the current step's title, notes, and visualizations
  function renderStep(animate) {
    if (!steps.length) return;
    // Clamp stepIx to valid range
    stepIx = Math.max(0, Math.min(stepIx, steps.length - 1));
    // Get the current step
    const s = steps[stepIx], lang = I18N.current();
    // Update title, note, and math display
    stepTitle.textContent = s.title[lang] || s.title.en;  // Translated or English fallback
    stepNote.textContent = s.note[lang] || s.note.en;
    stepMath.innerHTML = s.math;
    // Update step counter
    stepCounter.textContent = I18N.t('step_of') + ' ' + (stepIx + 1) + ' / ' + steps.length;
    // Update dot indicators (active, completed, not yet)
    $$('.dot', stepDots).forEach((d, i) => {
      d.classList.toggle('on', i === stepIx);      // Highlight current step
      d.classList.toggle('done', i < stepIx);      // Mark completed steps
    });
    // Show the appropriate visualization
    Visualizer.show(s.phase);
    // If this is the final solve step, animate the curve
    if (s.key === 'solve') Grapher.play();
    // Tell Squary mascot what step we're on
    if (window.Squary) Squary.onStep(s.phase, lastRes);
  }

  // go moves forward or backward by delta steps
  function go(delta) { stopPlay(); stepIx += delta; renderStep(true); }

  // startPlay begins the autoplay walkthrough
  function startPlay() {
    if (!steps.length) return;  // Can't play if no steps
    playing = true;
    btnPlay.classList.add('on');  // Highlight the play button
    setPlayLabel();
    // If we're at the end, restart from beginning
    if (stepIx >= steps.length - 1) { stepIx = 0; renderStep(true); }
    // Schedule the first step change
    schedule();
  }

  // schedule handles the timing between steps in autoplay
  function schedule() {
    clearTimeout(playTimer);
    playTimer = setTimeout(() => {
      // If play was stopped, don't continue
      if (!playing) return;
      // Move to next step
      if (stepIx < steps.length - 1) {
        stepIx++;
        renderStep(true);
        schedule();  // Schedule the next step
      } else {
        // Reached the end
        stopPlay();
      }
    }, PLAY_MS);  // Wait PLAY_MS milliseconds before advancing
  }

  // stopPlay halts the autoplay
  function stopPlay() {
    playing = false;
    clearTimeout(playTimer);
    btnPlay.classList.remove('on');  // Unhighlight the play button
    setPlayLabel();
  }

  // togglePlay switches between play and pause
  function togglePlay() { playing ? stopPlay() : startPlay(); }

  // setPlayLabel updates the play/pause button text and icon
  function setPlayLabel() {
    const span = $('.label', btnPlay);
    if (span) span.textContent = playing ? I18N.t('pause') : I18N.t('play');
    btnPlay.querySelector('.ico').textContent = playing ? '❚❚' : '►';  // Pause or play symbol
  }

  // ---- examples ----
  function setVals(a, b, c, play) {
    inA.value = a; inB.value = b; inC.value = c;
    buildAll({ play: !!play });
  }

  // ---- scanning ----- Handle photo upload and OCR

  // Get references to the scanning UI elements
  const scanInput = $('#scanInput'), camInput = $('#camInput');      // File input elements
  const scanStatus = $('#scanStatus'), scanResult = $('#scanResult'); // Status and result displays
  const scanText = $('#scanText'), scanEq = $('#scanEq');            // Text and equation displays
  const scanBar = $('#scanBar'), scanBarWrap = $('#scanBarWrap');    // Progress bar
  let pendingEq = null;  // Holds the a, b, c values from the last scan

  // resetScanUI hides all the scanning results and resets the UI
  function resetScanUI() {
    // Hide the results area and clear the pending equation
    scanResult.hidden = true; pendingEq = null;
    // Clear status text and hide progress bar
    scanStatus.textContent = ''; scanBarWrap.hidden = true; scanBar.style.width = '0%';
  }

  // handleImage processes an uploaded or photographed image
  async function handleImage(file) {
    // If no file, do nothing
    if (!file) return;
    // Clear any previous results
    resetScanUI();
    // Show loading message
    scanStatus.textContent = I18N.t('scan_reading');
    scanBarWrap.hidden = false;

    try {
      // Ask the scanner to recognize the text in the image (with progress callback)
      const { text, eq } = await Scanner.recognise(file, (p) => {
        // Update the progress bar as OCR processes
        scanBar.style.width = Math.round(p * 100) + '%';
      });
      // Hide the progress bar
      scanBarWrap.hidden = true;
      // Show the raw text that was recognized
      scanText.textContent = text ? text.replace(/\n+/g, '  ') : '—';

      // If we successfully parsed a, b, c, show it
      if (eq) {
        pendingEq = eq;
        scanEq.innerHTML = eqString(eq);
        scanStatus.textContent = I18N.t('scan_found');
        scanResult.hidden = false;
      } else {
        // OCR worked but couldn't find a quadratic
        scanStatus.textContent = I18N.t('scan_none');
        scanResult.hidden = false;
        scanEq.textContent = '—';
        pendingEq = null;
      }
    } catch (e) {
      // Handle errors (library didn't load, bad image, etc.)
      scanBarWrap.hidden = true;
      scanStatus.textContent = (e && e.message === 'ocr-load-failed')
        ? 'Could not load the reader. Check your connection and try again.'
        : 'Something went wrong reading that image. Try a clearer photo.';
    }
  }
  function eqString(eq) {
    const a = fmtTerm(eq.a, 'x²', true), b = fmtTerm(eq.b, 'x'), c = fmtTerm(eq.c, '');
    return (a + b + c + ' = 0').replace(/^ \+ /, '');
  }

  // ---- language ----- Set up English/Bahasa Melayu toggle

  // buildLangToggle creates the language switcher buttons
  function buildLangToggle() {
    const en = $('#langEN'), ms = $('#langMS');

    // sync updates which language button looks "active"
    function sync() {
      const l = I18N.current();
      // Add "on" class to the active button, remove from the other
      en.classList.toggle('on', l === 'en'); ms.classList.toggle('on', l === 'ms');
      // Update accessibility attributes
      en.setAttribute('aria-pressed', l === 'en'); ms.setAttribute('aria-pressed', l === 'ms');
    }

    // When user clicks EN button, switch to English
    en.addEventListener('click', () => I18N.set('en'));
    // When user clicks BM button, switch to Bahasa Melayu
    ms.addEventListener('click', () => I18N.set('ms'));
    // When language changes, update buttons and all text on page
    I18N.onChange(() => { sync(); reLocalise(); });
    // Initialize button states
    sync();
  }
  // ---- theme (light / dark) ----- Set up light/dark mode toggle

  // buildThemeToggle creates the day/night mode switcher
  function buildThemeToggle() {
    const root = document.documentElement;
    const btn = $('#themeToggle');
    if (!btn) return;

    // isDark checks if we're currently in dark mode
    const isDark = () => root.getAttribute('data-theme') === 'dark';

    // sync updates the button appearance and label
    function sync() {
      btn.setAttribute('aria-checked', isDark() ? 'true' : 'false');
      btn.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
    }

    // setTheme switches to light or dark mode
    function setTheme(next) {
      // Set the theme attribute on the root HTML element
      root.setAttribute('data-theme', next === 'dark' ? 'dark' : 'light');
      // Save the choice so it persists across page reloads
      try { localStorage.setItem('qv-theme', next); } catch (e) {}
      // Update the button
      sync();
      // The canvases (visualizer and grapher) read colours from CSS variables
      // So we need to refresh them to pick up the new colours
      Visualizer.refresh(); Grapher.refresh();
    }

    // Toggle theme when user clicks the button
    btn.addEventListener('click', () => setTheme(isDark() ? 'light' : 'dark'));
    // Initialize button state
    sync();
  }

  function reLocalise() {
    if (steps.length) { steps = MathCore.buildSteps(readVals().a, readVals().b, readVals().c, I18N.labels()); renderStep(false); }
    const res = MathCore.solve(readVals().a, readVals().b, readVals().c);
    renderSummary(res);
    setPlayLabel();
    if (pendingEq) { scanEq.innerHTML = eqString(pendingEq); scanStatus.textContent = I18N.t('scan_found'); }
  }

  // ---- init ----- Set up the app when the page loads

  function init() {
    // Initialize the translation system
    I18N.init();
    // Attach the canvas-based visualizations
    Visualizer.attach($('#vizCanvas'));
    Grapher.attach($('#graphCanvas'));
    // Set up language and theme toggles
    buildLangToggle();
    buildThemeToggle();

    // When user types in a, b, c boxes, update after they stop typing (debounce)
    let deb;
    [inA, inB, inC].forEach((el) => el.addEventListener('input', () => {
      clearTimeout(deb);
      deb = setTimeout(() => buildAll({ play: false }), 280);  // Wait 280ms before updating
    }));

    // "Visualise" button: solve and scroll to the studio
    $('#btnVisualise').addEventListener('click', () => {
      buildAll({ play: true });  // Solve and start autoplay
      var st_=document.querySelector('#studio'); st_ && st_.scrollIntoView && st_.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // "Reset" button: load default example
    $('#btnReset').addEventListener('click', () => setVals(1, -5, 6, false));

    // Play/pause button
    btnPlay.addEventListener('click', togglePlay);

    // Prev/next step buttons
    $('#btnPrev').addEventListener('click', () => go(-1));
    $('#btnNext').addEventListener('click', () => go(1));

    // Example buttons
    $$('.chip[data-ex]').forEach((ch) => ch.addEventListener('click', () => {
      // Parse the example values (e.g., "1,-5,6")
      const [a, b, c] = ch.getAttribute('data-ex').split(',').map(Number);
      setVals(a, b, c, true);  // Load example and auto-play
      var sv_=document.querySelector('#solve'); sv_ && sv_.scrollIntoView && sv_.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));

    // Camera/upload buttons for photo scanning
    $('#btnUpload').addEventListener('click', () => scanInput.click());
    $('#btnCamera').addEventListener('click', () => camInput.click());
    scanInput.addEventListener('change', (e) => handleImage(e.target.files[0]));
    camInput.addEventListener('change', (e) => handleImage(e.target.files[0]));

    // Use scanned equation
    $('#btnUseScan').addEventListener('click', () => {
      if (!pendingEq) return;
      setVals(pendingEq.a, pendingEq.b, pendingEq.c, true);
      var sv_=document.querySelector('#solve'); sv_ && sv_.scrollIntoView && sv_.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Retry scanning
    $('#btnRetry').addEventListener('click', () => {
      resetScanUI();
      scanInput.value = '';  // Clear file inputs so they can be used again
      camInput.value = '';
    });

    // Keyboard shortcuts for the walkthrough
    document.addEventListener('keydown', (e) => {
      // But not if user is typing in an input field
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      // Arrow keys to navigate steps
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      // Space bar to toggle play/pause
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    });

    // Solve the default example to start
    buildAll({ play: false });

    // Initialize Squary mascot if available
    if (window.Squary) { Squary.init(); Squary.greet(); }

    // Initialize the new interactive features (each is self-contained and
    // simply no-ops if its section isn't on the page).
    if (window.A11y) A11y.init();                 // accessibility panel
    if (window.BgFx) BgFx.init();                 // animated background field
    if (window.Mistakes) Mistakes.init();         // spot-the-mistake
    if (window.Challenge) Challenge.init();        // challenge + boss mode
    if (window.Applications) Applications.init();  // real-life applications
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
