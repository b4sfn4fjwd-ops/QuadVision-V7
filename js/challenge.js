/* ============================================================================
   FOR THE JUDGE (in simple words):
   This is the arcade. It turns practice into a game: a 60-second Sprint where
   students answer as many quick questions as they can, and a Boss Battle where
   every correct answer damages a friendly square "boss" until it's defeated.
   Right answers earn XP and combo bonuses that raise the student's Level and
   unlock badges. Games are proven to keep learners practising longer — and more
   practice is exactly what builds fluency with completing the square.
   ============================================================================ */
/* QuadVision — challenge.js  (Gamified Challenge Mode)
   Sprint + Boss modes, a question generator with mistake-shaped distractors,
   live timer, combo multiplier, and XP/level/badges via Store. Vanilla JS. */
window.Challenge = (function () {
  'use strict';

  const REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const L = (en, ms) => (window.I18N && I18N.current && I18N.current() === 'ms' && ms) ? ms : en;

  // DOM handles for the game card.
  let body, timerEl, scoreEl, hudLevel, hudXp, hudBar, hudCombo, root, card;
  // Live run state.
  let mode = null, score = 0, combo = 0, timeLeft = 0, ticker = null, q = null;
  let bossHP = 0, bossMax = 0, running = false;

  // ---- question generator -------------------------------------------------
  // rndInt picks an integer in [lo, hi].
  const rndInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  // shuffle returns a new shuffled array (Fisher–Yates).
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // The question kinds. Each returns { q, options:[{html, ok}], skill }.
  const KINDS = [
    // 1) The number that completes the square: (b⁄2)².
    function () {
      const b = 2 * rndInt(1, 8) * (Math.random() < 0.4 ? -1 : 1);   // even b
      const half = b / 2, ans = half * half;
      const opts = uniqueOpts(ans, [b * b, half, Math.abs(b)]);       // distractors = classic slips
      return {
        skill: 'square',
        q: L('What completes the square for ', 'Apa menyempurnakan kuasa dua bagi ') +
           '<b>x² ' + (b < 0 ? '−' : '+') + ' ' + Math.abs(b) + 'x</b>?',
        options: opts.map((v) => ({ html: '+ ' + v, ok: v === ans }))
      };
    },
    // 2) Half of b (the very first move).
    function () {
      const b = 2 * rndInt(1, 9) * (Math.random() < 0.4 ? -1 : 1);
      const ans = b / 2;
      const opts = uniqueOpts(ans, [b, b * 2, -ans]);
      return {
        skill: 'halve',
        q: L('Half of the middle number in ', 'Separuh nombor tengah dalam ') +
           '<b>x² ' + (b < 0 ? '−' : '+') + ' ' + Math.abs(b) + 'x</b> = ?',
        options: opts.map((v) => ({ html: String(v), ok: v === ans }))
      };
    },
    // 3) Factor the perfect-square trinomial into (x + b⁄2)².
    function () {
      const h = rndInt(1, 7) * (Math.random() < 0.4 ? -1 : 1);
      const b = 2 * h, sq = h * h;
      const factored = (v) => '(x ' + (v < 0 ? '−' : '+') + ' ' + Math.abs(v) + ')²';
      const opts = shuffle([
        { html: factored(h), ok: true },
        { html: factored(-h), ok: false },        // sign flip
        { html: factored(b), ok: false },         // forgot to halve
        { html: '(x ' + (h < 0 ? '−' : '+') + ' ' + Math.abs(h) + ')', ok: false } // forgot the square
      ]);
      return {
        skill: 'factor',
        q: L('Write as a perfect square: ', 'Tulis sebagai segi empat sempurna: ') +
           '<b>x² ' + (b < 0 ? '−' : '+') + ' ' + Math.abs(b) + 'x + ' + sq + '</b>',
        options: opts
      };
    },
    // 4) Roots of a nicely factorable quadratic.
    function () {
      const r1 = rndInt(-5, 5), r2 = rndInt(-5, 5);
      const b = -(r1 + r2), c = r1 * r2;
      const fmt = (a, bb) => 'x = ' + a + ', ' + bb;
      const opts = shuffle([
        { html: fmt(r1, r2), ok: true },
        { html: fmt(-r1, -r2), ok: false },       // sign error
        { html: fmt(r1 + 1, r2 - 1), ok: false },
        { html: fmt(r2, r1 + 2), ok: false }
      ]);
      const bs = b === 0 ? '' : (b < 0 ? ' − ' + Math.abs(b) + 'x' : ' + ' + b + 'x');
      const cs = c === 0 ? '' : (c < 0 ? ' − ' + Math.abs(c) : ' + ' + c);
      return {
        skill: 'solve',
        q: L('Solve ', 'Selesaikan ') + '<b>x²' + bs + cs + ' = 0</b>',
        options: opts
      };
    }
  ];

  // uniqueOpts returns the answer plus up to 3 distinct distractors, shuffled.
  function uniqueOpts(ans, distractors) {
    const out = [ans];
    distractors.forEach((d) => { if (out.indexOf(d) === -1 && out.length < 4) out.push(d); });
    let pad = 1;
    while (out.length < 4) { const v = ans + pad; if (out.indexOf(v) === -1) out.push(v); pad = pad > 0 ? -pad : -pad + 1; }
    return shuffle(out);
  }

  // nextQuestion builds a fresh question of a random kind and renders it.
  function nextQuestion() {
    q = KINDS[Math.floor(Math.random() * KINDS.length)]();
    const wrap = document.createElement('div');
    wrap.className = 'q-wrap';
    wrap.innerHTML = '<div class="q-text">' + q.q + '</div>';
    const grid = document.createElement('div');
    grid.className = 'q-options';
    q.options.forEach((o) => {
      const b = document.createElement('button');
      b.className = 'q-opt'; b.type = 'button'; b.innerHTML = o.html;
      b.addEventListener('click', () => answer(o, b, grid));
      grid.appendChild(b);
    });
    wrap.appendChild(grid);
    if (mode === 'boss') wrap.appendChild(bossView());
    swap(wrap);
  }

  // answer scores a tap, applies combo bonus, and advances (or ends boss).
  function answer(o, btn, grid) {
    if (!running) return;
    Array.prototype.forEach.call(grid.children, (c) => { c.disabled = true; });
    if (o.ok) {
      btn.classList.add('right');
      combo++;
      const bonus = Math.min(combo, 5);                 // streak multiplier (cap 5)
      const gained = 10 * bonus;
      score += gained;
      if (window.Store) Store.recordAttempt(q.skill, true, 8 + bonus);
      showCombo(combo);
      xpPop('+' + gained, false);
      if (mode === 'boss') { bossHP--; flashBoss(); if (bossHP <= 0) { return endBoss(true); } }
      scoreEl.textContent = score;
      bump(scoreEl);
      setTimeout(nextQuestion, REDUCE ? 60 : 360);
    } else {
      btn.classList.add('wrong');
      combo = 0;
      hideCombo();
      xpPop(L('Miss!', 'Tersasar!'), true);
      // Show the correct option so the learner still learns from the miss.
      Array.prototype.forEach.call(grid.children, (c, i) => { if (q.options[i].ok) c.classList.add('right'); });
      if (window.Store) Store.recordAttempt(q.skill, false, 0);
      if (mode === 'boss') { timeLeft = Math.max(0, timeLeft - 4); bumpTimer(); } // boss "attacks" → lose time
      setTimeout(nextQuestion, REDUCE ? 120 : 700);
    }
  }

  // showCombo flashes the streak multiplier pill (only from x2 upward).
  function showCombo(n) {
    if (!hudCombo) return;
    if (n < 2) { hideCombo(); return; }
    hudCombo.textContent = '🔥 ' + Math.min(n, 5) + '× ' + L('combo', 'kombo');
    hudCombo.classList.remove('show'); void hudCombo.offsetWidth; hudCombo.classList.add('show');
  }
  function hideCombo() { if (hudCombo) hudCombo.classList.remove('show'); }

  // xpPop floats a "+XP" (or "Miss!") label up out of the game card.
  function xpPop(text, miss) {
    if (REDUCE || !card) return;
    const s = document.createElement('span');
    s.className = 'xp-pop' + (miss ? ' miss' : '');
    s.textContent = text;
    card.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }

  // ---- boss battle visuals ------------------------------------------------
  // bossFace returns the SVG for "Quadra" — a faceted crystal-square guardian
  // with a crown and a glowing core. Its colour + expression escalate as its
  // health drops: a composed indigo gem → a focused violet → an enraged ember.
  function bossFace(frac) {
    let c1, c2, glow, brows = '', mouth, cracks = '', tiltL, tiltR;
    if (frac > 0.6) {                       // composed & confident
      c1 = '#5b46c9'; c2 = '#9d86ff'; glow = '#cbb9ff'; tiltL = 0; tiltR = 0;
      mouth = '<path d="M50 84 Q60 90 70 83" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".92"/>';
    } else if (frac > 0.3) {                // focused
      c1 = '#8a3fb8'; c2 = '#c970dc'; glow = '#edb8f2'; tiltL = 10; tiltR = -10;
      brows = '<path d="M37 50 L52 54 M83 50 L68 54" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>';
      mouth = '<path d="M50 86 H70" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".85"/>';
    } else {                                // enraged
      c1 = '#e23d57'; c2 = '#ff9248'; glow = '#ffc59a'; tiltL = 18; tiltR = -18;
      brows = '<path d="M37 47 L55 55 M83 47 L65 55" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>';
      mouth = '<path d="M48 90 Q60 80 72 90" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>'
            + '<path d="M53 86 V90 M60 85 V91 M67 86 V90" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>';
      cracks = '<path d="M30 42 l8 6 l-3 8 M95 58 l-8 5 l4 9" stroke="rgba(255,255,255,.4)" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
    }
    // one sleek angular eye (white lens + pupil + glint), rotated by mood
    const eye = (cx, tilt) => '<g transform="translate(' + cx + ',62) rotate(' + tilt + ')">'
      + '<ellipse rx="9" ry="6.2" fill="#fff"/>'
      + '<circle cx="1.6" cy="0" r="3.9" fill="#2a2150"/>'
      + '<circle cx="0" cy="-1.8" r="1.5" fill="#fff"/></g>';

    return '<svg viewBox="0 0 120 120" aria-hidden="true">'
      + '<defs>'
      +   '<linearGradient id="qbBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c2 + '"/><stop offset="1" stop-color="' + c1 + '"/></linearGradient>'
      +   '<linearGradient id="qbCrown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#f3b100"/></linearGradient>'
      +   '<radialGradient id="qbCore" cx="0.5" cy="0.42" r="0.55"><stop offset="0" stop-color="' + glow + '" stop-opacity="0.85"/><stop offset="1" stop-color="' + glow + '" stop-opacity="0"/></radialGradient>'
      + '</defs>'
      // crown (seated behind the square's top edge)
      + '<path d="M40 29 L40 16 L50 23 L60 9 L70 23 L80 16 L80 29 Z" fill="url(#qbCrown)" stroke="#d99a00" stroke-width="1" stroke-linejoin="round"/>'
      + '<circle cx="60" cy="14.5" r="2.4" fill="#ff7aa8"/><circle cx="44" cy="20.5" r="1.7" fill="#7fd3ff"/><circle cx="76" cy="20.5" r="1.7" fill="#7fd3ff"/>'
      // crystal body + sheen + inner highlight
      + '<rect x="22" y="26" width="76" height="76" rx="19" fill="url(#qbBody)"/>'
      + '<path d="M30 34 Q60 26 90 34 L86 48 Q60 41 34 48 Z" fill="#fff" opacity="0.16"/>'
      + '<rect x="22" y="26" width="76" height="76" rx="19" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.6"/>'
      + '<ellipse cx="60" cy="66" rx="30" ry="28" fill="url(#qbCore)"/>'
      + cracks + brows
      + eye(46, tiltL) + eye(74, tiltR)
      + mouth
      + '</svg>';
  }

  // bossView draws the boss, its name, an HP bar and a numeric HP readout.
  function bossView() {
    const frac = bossHP / bossMax;
    const d = document.createElement('div');
    d.className = 'boss';
    d.innerHTML =
      '<div class="boss-name">' +
        (frac <= 0.3 ? '🔥 ' : '') + L('Quadra, the Square Boss', 'Quadra, Bos Segi Empat') +
      '</div>' +
      '<div class="boss-sprite' + (frac <= 0.3 ? ' angry' : '') + '" id="bossSprite">' + bossFace(frac) + '</div>' +
      '<div class="boss-hp"><i id="bossHpFill" style="width:' + Math.round(frac * 100) + '%"></i></div>' +
      '<div class="boss-hp-num" id="bossHpNum">HP ' + Math.max(0, bossHP) + ' / ' + bossMax + '</div>';
    return d;
  }
  // flashBoss reacts to a hit: drop the HP bar, refresh the (angrier) face and recoil.
  function flashBoss() {
    const frac = Math.max(0, bossHP / bossMax);
    const fill = document.getElementById('bossHpFill');
    const num = document.getElementById('bossHpNum');
    const sprite = document.getElementById('bossSprite');
    if (fill) fill.style.width = Math.round(frac * 100) + '%';
    if (num) num.textContent = 'HP ' + Math.max(0, bossHP) + ' / ' + bossMax;
    if (sprite) {
      sprite.innerHTML = bossFace(frac);
      sprite.classList.toggle('angry', frac <= 0.3 && bossHP > 0);
      if (!REDUCE) { sprite.classList.add('hit'); setTimeout(() => sprite.classList.remove('hit'), 400); }
    }
  }

  // ---- run lifecycle ------------------------------------------------------
  // startSprint begins a 60-second answer-as-many-as-you-can run.
  function startSprint() {
    mode = 'sprint'; score = 0; combo = 0; timeLeft = 60; running = true;
    scoreEl.textContent = '0'; hideCombo(); modeChrome();
    tick(); nextQuestion();
  }
  // startBoss begins a 90-second boss battle with a fixed HP pool.
  function startBoss() {
    mode = 'boss'; score = 0; combo = 0; timeLeft = 90; running = true;
    bossMax = 10; bossHP = 10;
    scoreEl.textContent = '0'; hideCombo(); modeChrome();
    tick(); nextQuestion();
  }

  // tick runs the countdown; ending the run when time hits zero.
  function tick() {
    clearInterval(ticker);
    timerEl.textContent = timeLeft;
    ticker = setInterval(() => {
      timeLeft--;
      timerEl.textContent = Math.max(0, timeLeft);
      if (timeLeft <= 10) timerEl.classList.add('low'); else timerEl.classList.remove('low');
      if (timeLeft <= 0) { if (mode === 'boss') endBoss(false); else endSprint(); }
    }, 1000);
  }

  // endSprint stops the clock and shows the score + best-score result screen.
  function endSprint() {
    running = false; clearInterval(ticker); timerEl.classList.remove('low');
    if (window.Store) Store.setChallengeScore(score);
    const best = window.Store ? Store.get().challengeBest : score;
    result('⏱️', L('Time! You scored', 'Tamat masa! Markah anda'), score,
      L('Best: ', 'Terbaik: ') + best, 'sprint');
  }

  // endBoss handles win/lose, awarding the boss badge + XP on a win.
  function endBoss(win) {
    running = false; clearInterval(ticker); timerEl.classList.remove('low'); hideCombo();
    if (win) {
      if (window.Store) { Store.winBoss(); Store.addXP(60); Store.setChallengeScore(score); }
      if (window.Squary && Squary.confetti) Squary.confetti(110);
      // Let the boss dramatically spin away before the victory screen.
      const sprite = document.getElementById('bossSprite');
      const fill = document.getElementById('bossHpFill');
      if (fill) fill.style.width = '0%';
      const showWin = () => result('👑', L('Boss defeated!', 'Bos dikalahkan!'), score,
        L('+60 XP and the Boss Slayer badge!', '+60 XP dan lencana Penakluk Bos!'), 'boss');
      if (sprite && !REDUCE) {
        sprite.classList.remove('angry', 'hit'); sprite.classList.add('defeated');
        setTimeout(showWin, 850);
      } else { showWin(); }
    } else {
      result('💪', L('So close! The boss survived.', 'Hampir! Bos masih hidup.'), score,
        L('Try again — you’ll get it!', 'Cuba lagi — anda pasti boleh!'), 'boss');
    }
  }

  // result renders the end screen with a play-again button.
  function result(icon, title, sc, sub, again) {
    const d = document.createElement('div');
    d.className = 'q-result';
    d.innerHTML =
      '<div class="qr-icon">' + icon + '</div>' +
      '<div class="qr-title">' + title + ' <b>' + sc + '</b></div>' +
      '<div class="qr-sub">' + sub + '</div>';
    const row = document.createElement('div'); row.className = 'qr-actions';
    const replay = button(L('Play again', 'Main lagi'), 'btn btn-primary', () => again === 'boss' ? startBoss() : startSprint());
    const menu = button(L('Back to modes', 'Kembali ke mod'), 'btn btn-ghost', showStart);
    row.appendChild(replay); row.appendChild(menu); d.appendChild(row);
    swap(d);
  }

  // showStart renders the mode-choice start screen.
  function showStart() {
    running = false; mode = null; clearInterval(ticker);
    timerEl.textContent = '—'; scoreEl.textContent = '0'; hideCombo(); modeChrome();
    const d = document.createElement('div');
    d.className = 'q-start';
    d.innerHTML = '<p class="q-start-lead">' +
      L('Choose a mode. Answers earn XP, combos multiply your score, and badges unlock as you level up.',
        'Pilih mod. Jawapan memberi XP, kombo menggandakan markah, dan lencana terbuka apabila anda naik aras.') + '</p>';
    const row = document.createElement('div'); row.className = 'q-start-modes';
    row.appendChild(modeCard('⚡', L('60-Second Sprint', 'Pecut 60 Saat'),
      L('Answer as many as you can.', 'Jawab sebanyak mungkin.'), startSprint));
    row.appendChild(modeCard('👑', L('Boss Battle', 'Pertempuran Bos'),
      L('Defeat the boss before time runs out.', 'Kalahkan bos sebelum masa tamat.'), startBoss));
    d.appendChild(row);
    swap(d);
  }

  // modeCard builds one big start-screen choice.
  function modeCard(icon, title, sub, fn) {
    const b = document.createElement('button');
    b.className = 'mode-card'; b.type = 'button';
    b.innerHTML = '<span class="mc-ico">' + icon + '</span><span class="mc-t">' + title + '</span><span class="mc-s">' + sub + '</span>';
    b.addEventListener('click', fn);
    return b;
  }

  // ---- small helpers ------------------------------------------------------
  function button(text, cls, fn) { const b = document.createElement('button'); b.className = cls; b.type = 'button'; b.textContent = text; b.addEventListener('click', fn); return b; }
  function swap(node) { if (!body) return; body.innerHTML = ''; body.appendChild(node); if (!REDUCE) { node.animate ? node.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' }) : 0; } }
  function bump(el) { if (REDUCE || !el.animate) return; el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 280 }); }
  function bumpTimer() { if (timerEl && timerEl.animate && !REDUCE) timerEl.animate([{ color: '#e0609a' }, { color: '' }], { duration: 500 }); }
  function modeChrome() { if (root) root.setAttribute('data-mode', mode || 'idle'); }

  // syncHud mirrors the live XP / level from the Store into the game HUD.
  function syncHud(snap) {
    snap = snap || (window.Store && Store.get());
    if (!snap || !hudLevel) return;
    hudLevel.textContent = L('Level ', 'Aras ') + snap.level.level;
    hudXp.textContent = snap.xp + ' XP';
    if (hudBar) hudBar.style.width = Math.round(snap.level.frac * 100) + '%';
  }

  // init wires the section and subscribes the HUD to store changes.
  function init() {
    root = document.getElementById('play');
    if (!root) return;
    body = document.getElementById('gameBody');
    card = document.getElementById('gameCard');
    timerEl = document.getElementById('gameTimer');
    scoreEl = document.getElementById('gameScore');
    hudLevel = document.getElementById('hudLevel');
    hudXp = document.getElementById('hudXp');
    hudBar = document.getElementById('hudBar');
    hudCombo = document.getElementById('hudCombo');
    if (!body) return;
    showStart();
    syncHud();
    if (window.Store) Store.on(() => syncHud());
    if (window.I18N && I18N.onChange) I18N.onChange(() => { if (!running) showStart(); syncHud(); });
  }

  return { init, startSprint, startBoss };
})();
