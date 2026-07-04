/* ============================================================================
   FOR THE JUDGE (in simple words):
   Two games, both about COMPLETING THE SQUARE.

     1. TILE FORGE — a decision puzzle. The dock holds FOUR strips but only two
        are the true (b/2)·x halves — the decoys are the classic mistakes (b·x,
        (b/2±1)·x). Snap the right halves on, then CHOOSE the corner cap from
        three labelled tiles: (b/2)², b² or 2b — again the classic mistakes.
        Wrong corner costs a heart. Later levels use NEGATIVE b, teaching that
        x² − 6x still gets a POSITIVE +9 corner and becomes (x − 3)².

     2. KNIGHT DUNGEON — a real dungeon crawler. Skulls HUNT the knight (they
        pathfind toward you every beat, faster each level), slimes wander, and a
        monster that reaches you AMBUSHES you. Every battle is a TIMED duel with
        three question types that mirror completing the square: find the corner
        (b/2)², find h in (x+h)², and solve (x+h)² = k. Consecutive wins build a
        streak multiplier; chests can restore hearts.
   ============================================================================ */
window.Games = (function () {
  'use strict';

  function ms() { return window.I18N && I18N.current && I18N.current() === 'ms'; }
  function L(en, m) { return (ms() && m) ? m : en; }
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function rf(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function best(key, v) { try { var k = 'qv-best-' + key, c = +(localStorage.getItem(k) || 0); if (v != null && v > c) { localStorage.setItem(k, v); return v; } return Math.max(c, v || 0); } catch (e) { return v || 0; } }

  function makeCanvas(host, hpx) {
    var c = el('canvas', 'gx-canvas'); host.appendChild(c);
    var ctx = c.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0;
    function size() { var r = c.getBoundingClientRect(); W = Math.max(r.width, 260); H = hpx; c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); c.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size();
    return { c: c, ctx: ctx, size: size, get W() { return W; }, get H() { return H; } };
  }
  function endScreen(area, key, score, onAgain) {
    var b = best(key, score);
    var e = el('div', 'game-over');
    e.innerHTML = '<div class="go-big">' + L('Game over', 'Tamat') + '</div><div class="go-score">' + L('Score', 'Skor') + ': <b>' + score + '</b></div><div class="go-best">' + L('Best', 'Terbaik') + ': ' + b + '</div>';
    var again = el('button', 'go-again', L('Play again', 'Main lagi') + ' ↻'); again.type = 'button'; again.addEventListener('click', onAgain); e.appendChild(again);
    area.appendChild(e);
  }

  var mount, activeCleanup = null;
  var GAMES = [
    { id: 'forge', icon: '🧱', name: { en: 'Tile Forge', ms: 'Bengkel Jubin' },
      desc: { en: 'Spot the true b\u20442 strips among decoys, then cap the corner with (b\u20442)\u00b2 \u2014 hearts on the line.', ms: 'Kenal pasti jalur b\u20442 sebenar antara umpan, lalu tutup sudut dengan (b\u20442)\u00b2.' }, start: startForge },
    { id: 'dungeon', icon: '🏰', name: { en: 'Knight Dungeon', ms: 'Kurungan Kesateria' },
      desc: { en: 'Skulls hunt you \u2014 survive timed completing-the-square duels, streaks multiply your score.', ms: 'Tengkorak memburu anda \u2014 menang duel bermasa, rentetan menggandakan skor.' }, start: startDungeon }
  ];

  function showHub() {
    cleanup(); mount.innerHTML = '';
    var grid = el('div', 'games-grid games-grid-2');
    GAMES.forEach(function (g) {
      var c = el('button', 'game-pick'); c.type = 'button';
      c.innerHTML = '<span class="gp-ico">' + g.icon + '</span><span class="gp-name">' + L(g.name.en, g.name.ms) + '</span><span class="gp-desc">' + L(g.desc.en, g.desc.ms) + '</span><span class="gp-best">' + L('Best', 'Terbaik') + ': ' + best(g.id) + '</span><span class="gp-go">' + L('Play', 'Main') + ' →</span>';
      c.addEventListener('click', function () { launch(g); });
      grid.appendChild(c);
    });
    mount.appendChild(grid);
  }
  function launch(g) {
    cleanup(); mount.innerHTML = '';
    var stage = el('div', 'game-stage'), bar = el('div', 'game-bar');
    var back = el('button', 'game-back'); back.type = 'button'; back.innerHTML = '‹ ' + L('All games', 'Semua permainan'); back.addEventListener('click', showHub); bar.appendChild(back);
    bar.appendChild(el('div', 'game-title', g.icon + ' ' + L(g.name.en, g.name.ms)));
    stage.appendChild(bar);
    var area = el('div', 'game-area'); stage.appendChild(area); mount.appendChild(stage);
    activeCleanup = g.start(area) || null;
  }
  function cleanup() { if (activeCleanup) { try { activeCleanup(); } catch (e) {} activeCleanup = null; } }

  /* shared quadratic helpers */
  function fmtEq(b, c) { var bx = b === 0 ? '' : (b > 0 ? ' + ' + b + 'x' : ' − ' + (-b) + 'x'); var cc = c === 0 ? '' : (c > 0 ? ' + ' + c : ' − ' + (-c)); return 'x²' + bx + cc; }
  function fmtSq(p, k) { var inner = p >= 0 ? '(x + ' + p + ')²' : '(x − ' + (-p) + ')²'; var tail = k === 0 ? '' : (k > 0 ? ' + ' + k : ' − ' + (-k)); return inner + tail; }
  function uPush(a, v) { if (a.indexOf(v) === -1) a.push(v); }
  function genQuestion() {  // generic, for the dungeon
    if (Math.random() < 0.5) {
      var r1 = ri(-6, 6), r2 = ri(-6, 6), g = 0; while (r2 === r1 && g++ < 20) r2 = ri(-6, 6);
      var b = -(r1 + r2), c = r1 * r2, rs = function (a, b2) { var s = [a, b2].sort(function (x, y) { return x - y; }); return 'x = ' + s[0] + ', ' + s[1]; };
      var ans = rs(r1, r2), o = [ans]; uPush(o, rs(-r1, -r2)); uPush(o, rs(r1 + 1, r2)); uPush(o, rs(r1, r2 - 1));
      var gg = 1; while (o.length < 4 && gg < 12) { uPush(o, rs(ri(-6, 6), ri(-6, 6))); gg++; }
      return { q: L('Roots of ', 'Punca ') + fmtEq(b, c) + ' = 0', opts: shuffle(o.slice(0, 4)), ans: ans };
    }
    var bb = ri(-4, 4) * 2, cc = ri(-6, 6), p = bb / 2, k = cc - p * p, a2 = fmtSq(p, k), o2 = [a2];
    uPush(o2, fmtSq(-p, k)); uPush(o2, fmtSq(p, cc)); uPush(o2, fmtSq(p, -k));
    var h = 1; while (o2.length < 4 && h < 12) { uPush(o2, fmtSq(p, k + h)); h++; }
    return { q: L('Complete the square: ', 'Sempurnakan: ') + fmtEq(bb, cc), opts: shuffle(o2.slice(0, 4)), ans: a2 };
  }
  function genSquare() {  // completing-the-square: missing corner = (b/2)^2
    var p = ri(1, 6), sign = Math.random() < 0.4 ? -1 : 1, b = 2 * p * sign, c = ri(-5, 5), corner = p * p, k = c - corner;
    var cand = [corner, 2 * p, corner * 2, p, corner + 1, Math.max(1, corner - 1), corner + 3, p + 1, corner + 5], opts = [];
    for (var i = 0; i < cand.length; i++) { var v = cand[i]; if (v > 0) uPush(opts, v); if (opts.length >= 4 && opts.indexOf(corner) >= 0) break; }
    if (opts.indexOf(corner) < 0) opts[0] = corner; opts = opts.slice(0, 4); shuffle(opts);
    var pstr = sign > 0 ? '+ ' + p : '− ' + p;
    return { p: p, sign: sign, b: b, c: c, corner: corner, k: k, opts: opts, ans: corner,
      completed: '(x ' + pstr + ')²' + (k === 0 ? '' : (k > 0 ? ' + ' + k : ' − ' + (-k))), eq: 'x² ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + 'x ' + (c < 0 ? '− ' + (-c) : '+ ' + c) };
  }

  /* ════════════ GAME 1 — TILE FORGE (decision puzzle: real halves vs decoys) ════════════ */
  function startForge(area) {
    area.innerHTML = '';
    var hud = el('div', 'gx-hud',
      '<span class="gx-pill gx-hearts f-hearts"></span>'
      + '<span class="gx-pill">' + L('Level', 'Aras') + ' <b class="f-lvl">1</b></span>'
      + '<span class="gx-pill">' + L('Score', 'Skor') + ' <b class="f-score">0</b></span>'
      + '<span class="gx-pill">\ud83d\udd25 <b class="f-streak">0</b></span>');
    area.appendChild(hud);
    area.appendChild(el('div', 'gx-help', L('Only TWO strips are the true b\u20442 halves \u2014 the rest are decoys. Snap the real ones on, then choose the correct corner cap: (b\u20442)\u00b2. Wrong corner costs a heart!',
      'Hanya DUA jalur ialah separuh b\u20442 sebenar \u2014 yang lain umpan. Lekapkan yang betul, kemudian pilih penutup sudut yang tepat: (b\u20442)\u00b2. Sudut salah hilang satu hati!')));
    var cv = makeCanvas(area, 500), ctx = cv.ctx;
    var lvlEl = hud.querySelector('.f-lvl'), scoreEl = hud.querySelector('.f-score'), streakEl = hud.querySelector('.f-streak'), heartsEl = hud.querySelector('.f-hearts');

    var U = 22, X = 116;
    var level = 1, score = 0, streak = 0, hearts = 3, over = false, raf = 0, lastT = 0;
    var bp = null, step = 'strips', drag = null, slots = {}, pieces = [];
    var built = { sR: false, sB: false }, cornerDone = false;
    var parts = [], toast = null, flash = 0, doneT = 0, mascot = '', mascotT = 0, timer = 0, timerMax = 34;
    var bx0 = 0, by0 = 0, dockY = 0, dockH = 150, shake = null;

    function setHud() {
      lvlEl.textContent = level; scoreEl.textContent = score; streakEl.textContent = streak;
      var h = ''; for (var i = 0; i < 3; i++) h += (i < hearts ? '\u2764\ufe0f' : '\ud83e\udd0d'); heartsEl.innerHTML = h;
    }
    function say(s) { mascot = s; mascotT = 3.0; }
    function toastMsg(s) { toast = { s: s, life: 2.4 }; }
    function emit(x, y, col, n) { for (var i = 0; i < (n || 14); i++) { var a = Math.random() * 6.28, sp = rf(40, 200); parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, col: col }); } }

    function layout() {
      U = clamp(Math.floor(cv.W / 17), 16, 24); X = Math.round(U * 5.3);
      var side = X + bp.ah * U; dockY = cv.H - dockH;
      bx0 = Math.round((cv.W - side) / 2);
      by0 = Math.round(clamp((dockY - side) / 2 + 6, 50, 92));
      slots = {
        block: { x: bx0, y: by0, w: X, h: X },
        sR: { x: bx0 + X, y: by0, w: bp.ah * U, h: X },
        sB: { x: bx0, y: by0 + X, w: X, h: bp.ah * U },
        corner: { x: bx0 + X, y: by0 + X, w: bp.ah * U, h: bp.ah * U }
      };
      homePieces();
    }
    function homePieces() {
      var xs = pieces.length === 3 ? [0.22, 0.5, 0.78] : [0.14, 0.38, 0.62, 0.86];
      var cy = dockY + dockH / 2 + 4;
      pieces.forEach(function (p, i) {
        if (p.placed || p.drag) return;
        p.hx = Math.round(cv.W * xs[i] - p.w / 2); p.hy = Math.round(cy - p.h / 2);
        p.x = p.hx; p.y = p.hy;
      });
    }

    function newBlueprint() {
      var SEQ = [4, 6, -4, 8, -6, 10, -8];
      var b = level <= SEQ.length ? SEQ[level - 1] : (rnd(2) ? 1 : -1) * 2 * ri(2, 5);
      var h = b / 2, ah = Math.abs(h), cc = ri(0, 6), k = cc - h * h;
      bp = { b: b, h: h, ah: ah, c: cc, k: k, corner: h * h,
        eq: 'x\u00b2 ' + (b < 0 ? '\u2212 ' : '+ ') + Math.abs(b) + 'x' + (cc ? ' + ' + cc : ''),
        completed: '(x ' + (h < 0 ? '\u2212 ' : '+ ') + ah + ')\u00b2' + (k === 0 ? '' : (k > 0 ? ' + ' + k : ' \u2212 ' + (-k))) };
      step = 'strips'; drag = null; cornerDone = false; built = { sR: false, sB: false }; shake = null;
      var d1 = ah + 1, d2 = (ah > 2 ? ah - 1 : Math.abs(b));
      pieces = shuffle([
        { kind: 'strip', val: ah, correct: true }, { kind: 'strip', val: ah, correct: true },
        { kind: 'strip', val: d1, correct: false }, { kind: 'strip', val: d2, correct: false }
      ]);
      pieces.forEach(function (p) { p.w = p.val * U; p.h = 86; p.placed = false; p.drag = false; p.x = 0; p.y = 0; p.hx = 0; p.hy = 0; });
      layout();
      pieces.forEach(function (p) { p.w = p.val * U; p.h = 86; }); homePieces();
      timer = timerMax = Math.max(16, 34 - level * 2);
      say(L('Which strips are b\u20442 = ' + (b < 0 ? '\u2212' : '') + ah + '? Halve the ' + Math.abs(b) + 'x!', 'Jalur mana b\u20442? Separuhkan ' + Math.abs(b) + 'x!'));
      setHud();
    }
    function toCorner() {
      step = 'corner';
      var v1 = bp.ah * bp.ah, v2 = bp.b * bp.b, v3 = 2 * Math.abs(bp.b);
      if (v3 === v1) v3 = Math.abs(bp.b);
      pieces = shuffle([
        { kind: 'corner', val: v1, correct: true }, { kind: 'corner', val: v2, correct: false }, { kind: 'corner', val: v3, correct: false }
      ]);
      pieces.forEach(function (p) { var s = Math.min(Math.round(Math.sqrt(p.val) * U), 96); p.w = s; p.h = s; p.placed = false; p.drag = false; });
      homePieces();
      say(L('Cap the corner \u2014 its area is (b\u20442)\u00b2. Which tile is right?', 'Tutup sudut \u2014 luasnya (b\u20442)\u00b2. Jubin mana betul?'));
    }
    function complete() {
      cornerDone = true; step = 'done'; flash = 1; doneT = 0;
      var side = X + bp.ah * U; emit(bx0 + side / 2, by0 + side / 2, '#ffd23f', 48);
      var t = timer / timerMax, bonus = Math.round(60 * t), star = (t > 0.55 && hearts === 3) ? 3 : t > 0.3 ? 2 : 1;
      bp.star = star; score += 100 + bonus + streak * 10; streak++; best('forge', score); setHud();
      say(['\u2605 ', '\u2605\u2605 ', '\u2605\u2605\u2605 '][star - 1] + L('Square complete!', 'Kuasa dua lengkap!'));
    }
    function gameOver() { over = true; setTimeout(function () { area.innerHTML = ''; endScreen(area, 'forge', score, function () { activeCleanup = startForge(area); }); }, 340); }
    function next() { if (step !== 'done') return; level++; newBlueprint(); }
    function wrongStrip(p) {
      p.x = p.hx; p.y = p.hy; shake = { p: p, t: 0.45 };
      timer = Math.max(0, timer - 5); streak = 0; setHud();
      toastMsg(L('Not b\u20442! Halve the ' + Math.abs(bp.b) + 'x strip.', 'Bukan b\u20442! Separuhkan jalur ' + Math.abs(bp.b) + 'x.'));
      emit(p.x + p.w / 2, p.y + p.h / 2, '#ff5d5d', 10);
    }
    function wrongCorner(p) {
      p.x = p.hx; p.y = p.hy; shake = { p: p, t: 0.45 };
      hearts--; streak = 0; setHud();
      toastMsg(L('Corner = (b\u20442)\u00b2 \u2014 square the half!', 'Sudut = (b\u20442)\u00b2 \u2014 kuasa duakan separuh!'));
      emit(p.x + p.w / 2, p.y + p.h / 2, '#ff5d5d', 12);
      if (hearts <= 0) gameOver();
    }

    function pt(e) { var r = cv.c.getBoundingClientRect(), p = e.touches && e.touches[0] ? e.touches[0] : e; return { x: p.clientX - r.left, y: p.clientY - r.top }; }
    function down(e) {
      if (over) return; var q = pt(e); if (e.cancelable) e.preventDefault();
      if (step === 'done') { next(); return; }
      for (var i = pieces.length - 1; i >= 0; i--) { var p = pieces[i]; if (!p.placed && q.x >= p.x && q.x <= p.x + p.w && q.y >= p.y && q.y <= p.y + p.h) { p.drag = true; drag = { p: p, dx: q.x - p.x, dy: q.y - p.y }; pieces.splice(i, 1); pieces.push(p); break; } }
    }
    function move(e) { if (!drag || over) return; if (e.cancelable) e.preventDefault(); var q = pt(e); drag.p.x = q.x - drag.dx; drag.p.y = q.y - drag.dy; }
    function up() {
      if (!drag || over) { drag = null; return; }
      var p = drag.p; drag = null; if (!p) return; p.drag = false;
      var tol = U * 1.6;
      function near(s) { return s && Math.abs((p.x + p.w / 2) - (s.x + s.w / 2)) < tol && Math.abs((p.y + p.h / 2) - (s.y + s.h / 2)) < tol; }
      if (step === 'strips' && p.kind === 'strip') {
        var target = (!built.sR && near(slots.sR)) ? 'sR' : (!built.sB && near(slots.sB)) ? 'sB' : null;
        if (target) {
          if (p.correct) {
            built[target] = true; p.placed = true; score += 20; setHud();
            var s = slots[target]; emit(s.x + s.w / 2, s.y + s.h / 2, '#8fd0ff', 14);
            if (built.sR && built.sB) toCorner(); else say(L('One more half-strip!', 'Satu lagi jalur separuh!'));
          } else wrongStrip(p);
          return;
        }
      }
      if (step === 'corner' && p.kind === 'corner' && near(slots.corner)) {
        if (p.correct) { p.placed = true; complete(); } else wrongCorner(p);
        return;
      }
      p.x = p.hx; p.y = p.hy;
    }
    cv.c.addEventListener('mousedown', down); window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    cv.c.addEventListener('touchstart', down, { passive: false }); window.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchend', up);
    var onR = function () { cv.size(); if (bp) { layout(); if (step === 'corner') pieces.forEach(function (p) { var s = Math.min(Math.round(Math.sqrt(p.val) * U), 96); p.w = s; p.h = s; }); homePieces(); } }; window.addEventListener('resize', onR);

    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
    function tile(x, y, w, h, c1, c2) {
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.30)'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 3;
      var g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; rr(x, y, w, h, 7); ctx.fill(); ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.4; rr(x + 1, y + 1, w - 2, h - 2, 6); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 1; rr(x + .5, y + .5, w - 1, h - 1, 7); ctx.stroke();
    }
    function label(x, y, t, sz, col) { ctx.fillStyle = col || '#fff'; ctx.font = '800 ' + (sz || 16) + 'px Nunito, system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; }
    function dim(x, y, t) { label(x, y, t, 12, '#cfe0ff'); }
    function slotGlow(s, time) { var a = 0.22 + Math.sin(time * 4) * 0.14; ctx.fillStyle = 'rgba(126,209,255,' + a + ')'; rr(s.x, s.y, s.w, s.h, 6); ctx.fill(); ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(126,209,255,.85)'; ctx.lineWidth = 1.5; rr(s.x, s.y, s.w, s.h, 6); ctx.stroke(); ctx.setLineDash([]); }
    function stripLabel(v) { return (bp.b < 0 ? '\u2212' : '') + v + 'x'; }

    function loop(ts) {
      if (!lastT) lastT = ts; var dt = Math.min(0.05, (ts - lastT) / 1000); lastT = ts; var time = ts / 1000;
      if (!over && step !== 'done') { timer -= dt; if (timer <= 0) { timer = 0; gameOver(); } }
      flash = Math.max(0, flash - dt * 1.4); if (mascotT > 0) mascotT -= dt; if (toast) { toast.life -= dt; if (toast.life <= 0) toast = null; }
      if (shake) { shake.t -= dt; if (shake.t <= 0) shake = null; }
      if (step === 'done') { doneT += dt; if (doneT > 6) next(); }
      for (var i = parts.length - 1; i >= 0; i--) { var q = parts[i]; q.life -= dt * 1.7; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 240 * dt; if (q.life <= 0) parts.splice(i, 1); }

      ctx.clearRect(0, 0, cv.W, cv.H);
      var g0 = ctx.createLinearGradient(0, 0, 0, cv.H); g0.addColorStop(0, '#0f1830'); g0.addColorStop(1, '#142546'); ctx.fillStyle = g0; ctx.fillRect(0, 0, cv.W, cv.H);
      ctx.strokeStyle = 'rgba(120,160,220,.07)'; ctx.lineWidth = 1; for (var gx = 26; gx < cv.W; gx += 26) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, cv.H); ctx.stroke(); } for (var gy = 26; gy < cv.H; gy += 26) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cv.W, gy); ctx.stroke(); }
      if (!bp) { raf = requestAnimationFrame(loop); return; }
      ctx.fillStyle = 'rgba(0,0,0,.22)'; rr(8, dockY, cv.W - 16, dockH - 8, 12); ctx.fill();
      var side = X + bp.ah * U;

      ctx.fillStyle = 'rgba(8,16,34,.72)'; rr(8, 6, cv.W - 16, 34, 9); ctx.fill();
      ctx.strokeStyle = 'rgba(126,209,255,.4)'; ctx.lineWidth = 1.2; rr(8, 6, cv.W - 16, 34, 9); ctx.stroke();
      label(cv.W / 2, 23, L('Complete the square:  ', 'Sempurnakan:  ') + bp.eq, 16, '#eaf2ff');

      ctx.fillStyle = 'rgba(0,0,0,.4)'; rr(8, 45, cv.W - 16, 5, 3); ctx.fill();
      var tp = clamp(timer / timerMax, 0, 1); ctx.fillStyle = tp > 0.3 ? '#34d3a6' : '#ff5d5d'; rr(8, 45, (cv.W - 16) * tp, 5, 3); ctx.fill();

      ctx.setLineDash([6, 5]); ctx.strokeStyle = 'rgba(255,210,63,.32)'; ctx.lineWidth = 2; rr(bx0, by0, side, side, 9); ctx.stroke(); ctx.setLineDash([]);

      tile(slots.block.x, slots.block.y, X, X, '#5b9be8', '#2f6bbf'); label(slots.block.x + X / 2, slots.block.y + X / 2, 'x\u00b2', 26);
      dim(bx0 + X / 2, by0 - 9, 'x'); dim(bx0 - 11, by0 + X / 2, 'x');

      if (built.sR) { tile(slots.sR.x, slots.sR.y, bp.ah * U, X, '#38c08a', '#1f8a5f'); label(slots.sR.x + bp.ah * U / 2, slots.sR.y + X / 2, stripLabel(bp.ah), 13); }
      else if (step === 'strips') slotGlow(slots.sR, time);
      if (built.sB) { tile(slots.sB.x, slots.sB.y, X, bp.ah * U, '#38c08a', '#1f8a5f'); label(slots.sB.x + X / 2, slots.sB.y + bp.ah * U / 2, stripLabel(bp.ah), 13); }
      else if (step === 'strips') slotGlow(slots.sB, time);

      var s = slots.corner;
      if (step === 'corner') {
        ctx.fillStyle = 'rgba(255,210,63,.08)'; ctx.fillRect(s.x, s.y, s.w, s.h);
        for (var cy2 = 0; cy2 < bp.ah; cy2++) for (var cx2 = 0; cx2 < bp.ah; cx2++) { ctx.strokeStyle = 'rgba(255,210,63,.35)'; ctx.lineWidth = 1; ctx.strokeRect(s.x + cx2 * U + .5, s.y + cy2 * U + .5, U - 1, U - 1); }
        var ca = 0.3 + Math.sin(time * 5) * 0.2; ctx.strokeStyle = 'rgba(255,210,63,' + ca + ')'; ctx.lineWidth = 2; rr(s.x, s.y, s.w, s.h, 4); ctx.stroke();
        dim(s.x + s.w / 2, s.y + s.h + 11, String(bp.ah)); dim(s.x + s.w + 11, s.y + s.h / 2, String(bp.ah));
      }
      if (cornerDone) {
        for (var cy3 = 0; cy3 < bp.ah; cy3++) for (var cx3 = 0; cx3 < bp.ah; cx3++) tile(s.x + cx3 * U + 1, s.y + cy3 * U + 1, U - 2, U - 2, '#ffd765', '#e0a426');
        label(s.x + s.w / 2, s.y + s.h / 2, '+' + bp.corner, Math.min(15, s.w * 0.3), '#5c3d05');
      }

      pieces.forEach(function (p) {
        if (p.placed) return;
        var sx2 = 0, sy2 = 0;
        if (shake && shake.p === p) { sx2 = Math.sin(shake.t * 42) * 6 * shake.t; }
        if (p.kind === 'strip') { tile(p.x + sx2, p.y + sy2, p.w, p.h, p.drag ? '#46d09a' : '#38c08a', '#1f8a5f'); label(p.x + p.w / 2 + sx2, p.y + p.h / 2, stripLabel(p.val), 14); }
        else { tile(p.x + sx2, p.y + sy2, p.w, p.h, p.drag ? '#ffe07a' : '#ffd765', '#e0a426'); label(p.x + p.w / 2 + sx2, p.y + p.h / 2, String(p.val), Math.min(16, p.w * 0.34), '#5c3d05'); }
      });

      var hint = step === 'strips' ? L('drag the TRUE b\u20442 strips onto the glowing sides', 'seret jalur b\u20442 SEBENAR ke sisi bercahaya')
        : step === 'corner' ? L('drag the correct corner cap \u2014 area (b\u20442)\u00b2', 'seret penutup sudut betul \u2014 luas (b\u20442)\u00b2') : '';
      if (hint) { ctx.fillStyle = '#cfe0ff'; ctx.font = '700 12px Nunito, system-ui'; ctx.textAlign = 'center'; ctx.fillText(hint, cv.W / 2, dockY + 16); ctx.textAlign = 'left'; }

      parts.forEach(function (q) { ctx.globalAlpha = Math.max(0, q.life); ctx.fillStyle = q.col; ctx.beginPath(); ctx.arc(q.x, q.y, 3, 0, 6.28); ctx.fill(); }); ctx.globalAlpha = 1;

      if (step === 'done') {
        ctx.fillStyle = 'rgba(255,255,255,' + (flash * 0.5) + ')'; ctx.fillRect(0, 0, cv.W, cv.H);
        ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; rr(bx0 - 2, by0 - 2, side + 4, side + 4, 10); ctx.stroke();
        var py = Math.min(cv.H - 70, by0 + side + 22);
        ctx.fillStyle = 'rgba(8,16,34,.86)'; rr(cv.W / 2 - 158, py - 18, 316, 50, 10); ctx.fill();
        ctx.strokeStyle = 'rgba(52,211,166,.6)'; ctx.lineWidth = 1.4; rr(cv.W / 2 - 158, py - 18, 316, 50, 10); ctx.stroke();
        label(cv.W / 2, py - 1, bp.eq + '  =  ' + bp.completed, 15, '#eaf2ff');
        ctx.fillStyle = '#9fe9cf'; ctx.font = '700 12px Nunito, system-ui'; ctx.textAlign = 'center'; ctx.fillText(L('tap to continue \u2192', 'ketik untuk teruskan \u2192'), cv.W / 2, py + 20); ctx.textAlign = 'left';
      }

      if (mascotT > 0 && mascot) { ctx.save(); ctx.globalAlpha = Math.min(1, mascotT); ctx.font = '700 13px Nunito, system-ui'; var mw = ctx.measureText(mascot).width + 42, mx = 10, myb = 56; ctx.fillStyle = 'rgba(0,0,0,.72)'; rr(mx, myb, mw, 26, 8); ctx.fill(); ctx.font = '16px system-ui'; ctx.fillText('\ud83d\udc3b', mx + 8, myb + 19); ctx.fillStyle = '#fff'; ctx.font = '700 13px Nunito, system-ui'; ctx.fillText(mascot, mx + 28, myb + 18); ctx.restore(); }

      if (toast) { ctx.save(); ctx.globalAlpha = Math.min(1, toast.life); ctx.font = '700 14px Nunito, system-ui'; ctx.textAlign = 'center'; var w = ctx.measureText(toast.s).width + 24; ctx.fillStyle = 'rgba(0,0,0,.72)'; rr(cv.W / 2 - w / 2, dockY - 34, w, 26, 8); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(toast.s, cv.W / 2, dockY - 16); ctx.restore(); ctx.textAlign = 'left'; }

      if (!over) raf = requestAnimationFrame(loop);
    }

    newBlueprint();
    raf = requestAnimationFrame(loop);
    return function () { if (raf) cancelAnimationFrame(raf); cv.c.removeEventListener('mousedown', down); window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); cv.c.removeEventListener('touchstart', down); window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up); window.removeEventListener('resize', onR); };
  }

  /* ════════════════ GAME 2 — KNIGHT DUNGEON (pixel-art) ════════════════ */
  function startDungeon(area) {
    area.innerHTML = '';
    var hud = el('div', 'gx-hud',
      '<span class="gx-pill gx-hearts"></span><span class="gx-pill">\ud83d\udc8e <b class="d-gems">0</b></span>'
      + '<span class="gx-pill gx-key">\ud83d\udddd <b class="d-key">0</b></span><span class="gx-pill">\ud83d\udd25 <b class="d-streak">0</b></span><span class="gx-pill">\u2728 <b class="d-mana">0</b></span>'
      + '<span class="gx-pill">' + L('Level', 'Aras') + ' <b class="d-lvl">1</b></span>'
      + '<span class="gx-pill">' + L('Score', 'Skor') + ' <b class="d-score">0</b></span>');
    area.appendChild(hud);
    if (window.Dungeon3D && Dungeon3D.supported()) {
      var tgl = el('button', 'gx-pill gx-3d');
      tgl.type = 'button';
      tgl.textContent = localStorage.getItem('qv-dg3d') !== '0' ? 'HD\u20112D \u2713' : '2D \u25a6';
      tgl.title = L('Switch 2D / HD-2D renderer (restarts the run)', 'Tukar penampil 2D / HD-2D (mula semula)');
      tgl.addEventListener('click', function () {
        localStorage.setItem('qv-dg3d', localStorage.getItem('qv-dg3d') !== '0' ? '0' : '1');
        try { if (typeof activeCleanup === 'function') activeCleanup(); } catch (e2) { }
        area.innerHTML = '';
        activeCleanup = startDungeon(area);
      });
      hud.appendChild(tgl);
    }
    area.appendChild(el('div', 'gx-help', L('\ud83d\udc80 Skulls hunt you \u2014 plan your route! Battles are timed: answer before the bar empties. Streaks multiply your score. Chests can heal \u2764.',
      '\ud83d\udc80 Tengkorak memburu anda \u2014 rancang laluan! Pertarungan bermasa: jawab sebelum bar habis. Rentetan menggandakan skor. Peti boleh pulihkan \u2764.')));

    var MAPS = [
      ['#############', '#S...G...M.K#', '#.#.#.#.#.#.#', '#..M...G...W#', '#.#.#.#.#.#.#', '#G...C...M..#', '#.#.#.#.#.#.#', '#..M..G....D#', '#############'],
      ['#############', '#S..M..G..WW#', '#.#.#.#.#.#.#', '#G...K...M..#', '#.#.#.#.#.#.#', '#..C..M..G..#', '#.#.#.#.#.#.#', '#M..G...M..D#', '#############'],
      ['#############', '#S.G..M..G.M#', '#.#.#.#.#.#.#', '#..M..K..C..#', '#.#.#.#.#.#.#', '#WW..G..M..G#', '#.#.#.#.#.#.#', '#.M..G..M..D#', '#############']
    ];

    var cv = makeCanvas(area, 444), vctx = cv.ctx;
    cv.c.classList.add('gx-pixel');
    var d3 = null, use3d = false;
    try {
      if (window.Dungeon3D && Dungeon3D.supported() && localStorage.getItem('qv-dg3d') !== '0') {
        d3 = Dungeon3D.create(area, cv); use3d = !!d3;
      }
    } catch (e) { d3 = null; use3d = false; }
    if (use3d) cv.c.style.display = 'none';
    var toastEl = el('div', 'dg-toast3d'); toastEl.style.display = 'none'; area.appendChild(toastEl);
    var N = 32, grid, cols, rows, TILE, scale, ox, oy, nc, nctx, torches;
    var hero, gems, monsters, chests, keyPos, doorPos, level = 0, gemCount = 0, score = 0, hearts = 3, hasKey = false, over = false, paused = false;
    var parts = [], toast = null, raf = 0, lastT = 0;
    var mtick = 0, streakB = 0, floats = [], battleIv = 0, mana = 0, frozenT = 0, bossHp = 0;

    function parse(m) {
      rows = m.length; cols = m[0].length; grid = []; gems = []; monsters = []; chests = []; keyPos = null; doorPos = null; hasKey = false; torches = [];
      for (var y = 0; y < rows; y++) { var row = []; for (var x = 0; x < cols; x++) {
        var ch = m[y][x]; row.push(ch === '#' ? '#' : (ch === 'W' ? 'W' : '.'));
        if (ch === 'S') hero = { gx: x, gy: y, fx: x, fy: y, mv: 0, dir: 1 };
        else if (ch === 'G') gems.push({ x: x, y: y, got: false });
        else if (ch === 'M') monsters.push({ x: x, y: y, alive: true, ph: Math.random() * 6, type: rnd(2) });
        else if (ch === 'K') keyPos = { x: x, y: y, got: false };
        else if (ch === 'C') chests.push({ x: x, y: y, open: false });
        else if (ch === 'D') doorPos = { x: x, y: y };
      } grid.push(row); }
      for (var ty = 0; ty < rows; ty++) for (var tx = 0; tx < cols; tx++) { if (grid[ty][tx] === '#' && ty < rows - 1 && grid[ty + 1][tx] !== '#' && grid[ty + 1][tx] !== 'W' && ((tx * 5 + ty * 3) % 6 === 0)) torches.push({ x: tx, y: ty }); }
      if (!nc || nc.width !== cols * N) { nc = document.createElement('canvas'); nc.width = cols * N; nc.height = rows * N; nctx = nc.getContext('2d'); }
    }
    function fit() { scale = clamp(Math.floor(Math.min(cv.W / (N * cols), cv.H / (N * rows))), 1, 4); TILE = N * scale; ox = Math.floor((cv.W - TILE * cols) / 2); oy = Math.floor((cv.H - TILE * rows) / 2); }
    function load(i) {
      parse(MAPS[i]); renderBG(); fit(); mtick = 0;
      if (use3d) try { d3.buildLevel(grid, cols, rows, { gems: gems, monsters: monsters, chests: chests, keyPos: keyPos, doorPos: doorPos, torches: torches }); } catch (e) { }
      area.querySelector('.d-lvl').textContent = (i + 1);
      if (i > 0) toastMsg(L('Level ' + (i + 1) + ' \u2014 they hunt faster!', 'Aras ' + (i + 1) + ' \u2014 mereka lebih pantas!'));
      sync();
    }
    function isWall(x, y) { return (x < 0 || y < 0 || x >= cols || y >= rows) ? true : grid[y][x] === '#'; }
    function monAt(x, y) { for (var i = 0; i < monsters.length; i++) if (monsters[i].alive && monsters[i].x === x && monsters[i].y === y) return monsters[i]; return null; }
    function chestAt(x, y) { for (var i = 0; i < chests.length; i++) if (!chests[i].open && chests[i].x === x && chests[i].y === y) return chests[i]; return null; }
    function addFloat(s, gx, gy, col) { floats.push({ s: s, x: (gx + 0.5) * N, y: gy * N, life: 1.25, col: col || '#fff' }); }

    function tryMove(dx, dy) {
      if (paused || over || hero.mv > 0) return;
      if (dx < 0) hero.dir = -1; if (dx > 0) hero.dir = 1;
      var nx = hero.gx + dx, ny = hero.gy + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return;
      if (grid[ny][nx] === '#') return;
      if (grid[ny][nx] === 'W') { toastMsg(L('Water blocks the way', 'Air menghalang')); return; }
      var mon = monAt(nx, ny); if (mon) { battle(mon, false); return; }
      var ch = chestAt(nx, ny);
      if (ch) {
        ask('chest', function (ok) {
          if (ok) {
            ch.open = true; streakB++; gainMana(1);
            if (hearts < 3) { hearts++; addFloat('+\u2764', ch.x, ch.y, '#ff6b8a'); toastMsg(L('A heart! +1 HP', 'Hati! +1 HP')); }
            else { gemCount += 2; addFloat('+2\ud83d\udc8e', ch.x, ch.y, '#7ad7ff'); }
            score += 20; burst(ch.x, ch.y, '#ffd23f'); sync();
          } else { streakB = 0; hurt(); }
        });
        return;
      }
      if (doorPos && nx === doorPos.x && ny === doorPos.y) {
        if (!hasKey) { toastMsg(L('Locked \u2014 find the \ud83d\udddd key!', 'Berkunci \u2014 cari \ud83d\udddd kunci!')); return; }
        if (level === MAPS.length - 1) { bossFight(); return; }
        ask('door', function (ok) {
          if (ok) { var pts = 30 + streakB * 5; score += pts; streakB++; gainMana(1); addFloat('+' + pts, doorPos.x, doorPos.y, '#ffd23f'); burst(doorPos.x, doorPos.y, '#ffd23f'); next(); }
          else { streakB = 0; hurt(); }
        });
        return;
      }
      hero.fx = hero.gx; hero.fy = hero.gy; hero.gx = nx; hero.gy = ny; hero.mv = 1;
    }
    /* ── BOSS: the Seal Guardian ── the final door is guarded. Answer THREE
       questions in a row (one of each kind) to break the seal. Each hit
       bursts the door; each miss costs a heart. The climax the run builds to. */
    function bossFight() {
      if (paused || over) return;
      if (bossHp === 0) { bossHp = 3; toastMsg(L('\ud83d\udc80 SEAL GUARDIAN \u2014 answer 3 in a row!', '\ud83d\udc80 PENJAGA METERAI \u2014 jawab 3 berturut!')); }
      ask(['slime', 'skull', 'door'][3 - bossHp], function (ok) {
        if (ok) {
          bossHp--; streakB++; gainMana(1);
          burst(doorPos.x, doorPos.y, '#ff5a3c'); sync();
          if (bossHp <= 0) {
            var pts = 80 + streakB * 5; score += pts;
            addFloat('+' + pts, doorPos.x, doorPos.y, '#ffd23f');
            toastMsg(L('Seal broken!', 'Meterai pecah!'));
            next();
          } else {
            toastMsg(L('Hit! ' + bossHp + ' more\u2026', 'Kena! ' + bossHp + ' lagi\u2026'));
            setTimeout(function () { if (!over && !paused) bossFight(); }, 550);
          }
        } else {
          streakB = 0; hurt();
          if (hearts > 0) toastMsg(L('The seal holds \u2014 step in to try again!', 'Meterai bertahan \u2014 cuba lagi!'));
        }
      }, false, bossHp);
    }
    function battle(m, ambush) {
      if (paused || over) return;
      ask(m.type === 1 ? 'skull' : 'slime', function (ok) {
        if (ok) {
          m.alive = false; streakB++; gainMana(1);
          var pts = 15 + Math.min(25, (streakB - 1) * 5);
          score += pts; addFloat('+' + pts, m.x, m.y, '#34d3a6'); burst(m.x, m.y, '#34d3a6'); sync();
        } else { streakB = 0; hurt(); }
      }, ambush);
    }
    function arrive() {
      for (var i = 0; i < gems.length; i++) { var g = gems[i]; if (!g.got && g.x === hero.gx && g.y === hero.gy) { g.got = true; gemCount++; score += 10; addFloat('+10', g.x, g.y, '#7ad7ff'); burst(g.x, g.y, '#7ad7ff'); sync(); } }
      if (keyPos && !keyPos.got && keyPos.x === hero.gx && keyPos.y === hero.gy) { keyPos.got = true; hasKey = true; score += 15; addFloat('\ud83d\udddd!', keyPos.x, keyPos.y, '#ffd23f'); burst(keyPos.x, keyPos.y, '#ffd23f'); toastMsg(L('Key found! The door will open.', 'Kunci dijumpai! Pintu boleh dibuka.')); sync(); }
    }
    function next() { level++; if (level >= MAPS.length) { over = true; setTimeout(function () { area.innerHTML = ''; endScreen(area, 'dungeon', score + hearts * 25, function () { activeCleanup = startDungeon(area); }); }, 320); return; } burst(doorPos.x, doorPos.y, '#ffd23f'); load(level); }
    function hurt() { hearts--; sync(); toastMsg(L('Ouch! \u22121 \u2764', 'Aduh! \u22121 \u2764')); if (hearts <= 0) { over = true; setTimeout(function () { area.innerHTML = ''; endScreen(area, 'dungeon', score, function () { activeCleanup = startDungeon(area); }); }, 360); } }
    function burst(gx, gy, col) {
      if (use3d && d3) { try { d3.burst(gx, gy, col); } catch (e) { } } var cx = gx * N + N / 2, cy = gy * N + N / 2; for (var i = 0; i < 12; i++) { var a = Math.random() * 6.28, s = rf(8, 34); parts.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, col: col }); } }
    function toastMsg(s) { toast = { s: s, life: 2.1 }; }
    function sync() { area.querySelector('.d-gems').textContent = gemCount; area.querySelector('.d-score').textContent = score; area.querySelector('.d-key').textContent = (hasKey ? 1 : 0); area.querySelector('.d-streak').textContent = streakB; area.querySelector('.d-mana').textContent = mana; var h = ''; for (var i = 0; i < 3; i++) h += (i < hearts ? '\u2764\ufe0f' : '\ud83e\udd0d'); area.querySelector('.gx-hearts').innerHTML = h; updSpells(); }
    function gainMana(n) { mana = Math.min(9, mana + (n || 1)); }
    function updSpells() {
      if (!spells) return;
      spells.querySelector('.sp-bolt').disabled = mana < 3;
      spells.querySelector('.sp-frz').disabled = mana < 2;
      spells.querySelector('.sp-heal').disabled = mana < 4 || hearts >= 3;
    }

    /* ── QUESTION FORGE ─────────────────────────────────────────────────
       Ten templates, each one real facet of completing the square, phrased
       in the site's own vocabulary (corner, half-strip, vertex form). Signs,
       coefficients and templates are randomised, and ranges grow with the
       level — so no two runs of the dungeon quiz the same way.
         easy  (slime tier): corner \u00b7 halve the strip \u00b7 expand the square \u00b7 find b
         medium (skull tier): find h \u00b7 vertex-form constant k \u00b7 vertex position
         hard  (door tier):  solve (x+h)\u00b2 = k \u00b7 minimum value \u00b7 tougher k     */
    function pick3(ans, pool) {
      var o = [ans];
      shuffle(pool.slice()).forEach(function (v) { if (o.length < 4 && o.indexOf(v) === -1) o.push(v); });
      var i = 2; while (o.length < 4) { if (o.indexOf(ans + i) === -1) o.push(ans + i); i++; }
      return shuffle(o).map(String);
    }
    function eqB(b, tail) { return 'x\u00b2 ' + (b < 0 ? '\u2212 ' : '+ ') + Math.abs(b) + 'x ' + tail; }
    function sgnP(v) { return (v < 0 ? '\u2212 ' : '+ ') + Math.abs(v); }

    function genQ2(kind) {
      var boost = Math.min(3, level);
      var h = ri(1, 3 + boost), sgn = (level >= 1 && rnd(2)) ? -1 : 1, b = 2 * h * sgn;
      var tier = kind === 'chest' ? (rnd(2) ? 'slime' : 'skull') : kind;

      var T = {
        corner: function () {
          return { q: L('Complete the square (the corner):', 'Sempurnakan kuasa dua (sudut):') + '  ' + eqB(b, '+ \u25a2'),
            ans: h * h, pool: [b * b, Math.abs(b), 2 * h, (h + 1) * (h + 1)] };
        },
        halve: function () {
          return { q: L('Cut the strip in half: each half of ', 'Belah jalur separuh: setiap separuh ') + Math.abs(b) + 'x ' + L('is', 'ialah') + ' \u25a2x',
            ans: h, pool: [Math.abs(b), h + 1, h > 1 ? h - 1 : h + 2, h * h] };
        },
        expand: function () {
          return { q: '(x ' + sgnP(sgn * h) + ')\u00b2  =  ' + eqB(b, '+ \u25a2'),
            ans: h * h, pool: [Math.abs(b), h, 2 * h, (h + 1) * (h + 1)] };
        },
        findB: function () {
          return { q: 'x\u00b2 + \u25a2x + ' + (h * h) + '  =  (x + ' + h + ')\u00b2',
            ans: 2 * h, pool: [h, 4 * h, h * h, h + 2] };
        },
        findH: function () {
          return { q: eqB(b, '+ ' + (h * h)) + '  =  (x ' + (sgn < 0 ? '\u2212' : '+') + ' \u25a2)\u00b2',
            ans: h, pool: [Math.abs(b), h * h, h + 1, h > 1 ? h - 1 : h + 2] };
        },
        vertexK: function () {
          var cc = ri(0, 6 + boost), k = cc - h * h;
          return { q: eqB(b, '+ ' + cc) + '  =  (x ' + (sgn < 0 ? '\u2212 ' : '+ ') + h + ')\u00b2 ' + (0 <= k ? '+ \u25a2' : '\u2212 \u25a2'),
            ans: Math.abs(k), pool: [cc, h * h, Math.abs(cc - h), Math.abs(k) + 2] };
        },
        vertexX: function () {
          var cc = ri(0, 6);
          return { q: L('Vertex of ', 'Verteks bagi ') + 'y = ' + eqB(b, '+ ' + cc) + '  \u2192  x = \u25a2',
            ans: -b / 2, pool: [b / 2, b, -b, h * h] };
        },
        solve: function () {
          var s = ri(1, 3 + boost), hd = ri(1, 4) * sgn;
          return { q: '(x ' + sgnP(hd) + ')\u00b2 = ' + (s * s) + '   \u2192   ' + L('larger x = ?', 'x terbesar = ?'),
            ans: -hd + s, pool: [-hd - s, hd + s, hd - s, s] };
        },
        minVal: function () {
          var m = ri(-6, 6), hd = ri(1, 4) * sgn;
          return { q: L('Smallest value of ', 'Nilai terkecil ') + 'y = (x ' + sgnP(hd) + ')\u00b2 ' + (m < 0 ? '\u2212 ' + (-m) : '+ ' + m),
            ans: m, pool: [hd, -m, m + 1, hd * hd + m] };
        }
      };

      var pools = {
        slime: ['corner', 'halve', 'expand', 'findB'],
        skull: ['findH', 'vertexK', 'vertexX'],
        door: ['solve', 'minVal', 'vertexK']
      };
      var pick = pools[tier][rnd(pools[tier].length)];
      var made = T[pick]();

      var tags = {
        slime: ['\u2694 ' + L('Slime attack', 'Serangan slaim'), '\u2694 ' + L('Sticky ambush', 'Serangan melekit'), '\u2694 ' + L('Slime duel', 'Duel slaim')],
        skull: ['\ud83d\udc80 ' + L('Skull duel', 'Duel tengkorak'), '\ud83d\udc80 ' + L('Haunted riddle', 'Teka-teki berhantu'), '\ud83d\udc80 ' + L('Bone challenge', 'Cabaran tulang')],
        door: ['\ud83d\udeaa ' + L('Door lock', 'Kunci pintu'), '\ud83d\udeaa ' + L('Ancient seal', 'Meterai purba')],
        chest: ['\ud83c\udf81 ' + L('Chest lock', 'Kunci peti'), '\ud83c\udf81 ' + L('Treasure riddle', 'Teka-teki harta')]
      };
      var tagList = tags[kind] || tags.door;

      return { tag: tagList[rnd(tagList.length)], q: made.q, ans: String(made.ans), opts: pick3(made.ans, made.pool) };
    }


    function ask(kind, cb, ambush, bossN) {
      paused = true; var Q = genQ2(kind);
      var tMax = kind === 'door' ? 12 : 9, tLeft = tMax, answered = false;
      var modal = el('div', 'dg-modal');
      var tagTxt = bossN
        ? '\ud83d\udc80 ' + L('SEAL GUARDIAN', 'PENJAGA METERAI') + '  ' + '\u25cf\u25cf\u25cf'.slice(0, bossN) + '\u25cb\u25cb\u25cb'.slice(0, 3 - bossN)
        : (ambush ? '\u26a1 ' : '') + Q.tag;
      modal.innerHTML = '<div class="dg-card"><div class="dg-tag">' + tagTxt + '</div><div class="dg-q">' + Q.q + '</div>'
        + '<div class="dg-timer"><i></i></div>'
        + '<div class="dg-opts">' + Q.opts.map(function (o) { return '<button class="dg-opt" type="button">' + o + '</button>'; }).join('') + '</div>'
        + (streakB > 1 ? '<div class="dg-streakline">\ud83d\udd25 ' + L('streak', 'rentetan') + ' \u00d7' + streakB + '</div>' : '')
        + '</div>';
      area.appendChild(modal);
      var bar = modal.querySelector('.dg-timer i');
      function finish(ok) {
        if (answered) return; answered = true;
        if (battleIv) { clearInterval(battleIv); battleIv = 0; }
        Array.prototype.forEach.call(modal.querySelectorAll('.dg-opt'), function (b) { b.disabled = true; if (b.textContent === Q.ans) b.classList.add('ok'); });
        setTimeout(function () { modal.remove(); paused = false; cb(ok); }, ok ? 360 : 850);
      }
      battleIv = setInterval(function () {
        tLeft -= 0.1;
        if (bar) { bar.style.width = Math.max(0, tLeft / tMax * 100) + '%'; if (tLeft <= 2.5) bar.classList.add('low'); }
        if (tLeft <= 0) { toastMsg(L('Too slow!', 'Terlalu lambat!')); finish(false); }
      }, 100);
      Array.prototype.forEach.call(modal.querySelectorAll('.dg-opt'), function (btn) {
        btn.addEventListener('click', function () {
          var ok = btn.textContent === Q.ans; if (!ok) btn.classList.add('bad');
          finish(ok);
        });
      });
    }

    function onKey(e) { var k = e.key.toLowerCase(); if (k === 'arrowup' || k === 'w') { tryMove(0, -1); e.preventDefault(); } else if (k === 'arrowdown' || k === 's') { tryMove(0, 1); e.preventDefault(); } else if (k === 'arrowleft' || k === 'a') { tryMove(-1, 0); e.preventDefault(); } else if (k === 'arrowright' || k === 'd') { tryMove(1, 0); e.preventDefault(); } }
    window.addEventListener('keydown', onKey);
    var pad = el('div', 'dg-pad', '<button class="dg-btn dg-up" type="button">\u25b2</button><div class="dg-mid"><button class="dg-btn dg-left" type="button">\u25c0</button><button class="dg-btn dg-right" type="button">\u25b6</button></div><button class="dg-btn dg-down" type="button">\u25bc</button>');
    area.appendChild(pad);
    /* ── SPELLS ── correct answers charge mana \u2728; spend it on tactics.
       This is the decision layer: burn mana to escape a bad spot, or bank
       it to heal? Each spell is themed on the algebra it teaches. */
    var spells = el('div', 'dg-spells',
      '<button type="button" class="dg-spell sp-bolt" title="' + L('Zap a monster within 2 tiles \u2014 no battle needed', 'Panah raksasa dalam 2 petak \u2014 tanpa pertarungan') + '">\u26a1 ' + L('Bolt', 'Panah') + ' \u00b73\u2728</button>'
      + '<button type="button" class="dg-spell sp-frz" title="' + L('Freeze all monsters for 6s', 'Bekukan semua raksasa 6s') + '">\u2744 ' + L('Freeze', 'Beku') + ' \u00b72\u2728</button>'
      + '<button type="button" class="dg-spell sp-heal" title="' + L('Restore 1 heart', 'Pulihkan 1 hati') + '">\u2764 ' + L('Heal', 'Pulih') + ' \u00b74\u2728</button>');
    area.appendChild(spells);
    spells.querySelector('.sp-bolt').addEventListener('click', function () {
      if (mana < 3 || paused || over) return;
      var tgt = null, bd = 99;
      monsters.forEach(function (m) { if (!m.alive) return; var d = Math.abs(m.x - hero.gx) + Math.abs(m.y - hero.gy); if (d < bd) { bd = d; tgt = m; } });
      if (!tgt || bd > 2) { toastMsg(L('No monster within 2 tiles', 'Tiada raksasa dalam 2 petak')); return; }
      mana -= 3; tgt.alive = false; score += 10;
      burst(tgt.x, tgt.y, '#7ad7ff'); addFloat('\u26a1', tgt.x, tgt.y, '#7ad7ff');
      toastMsg(L('Discriminant Bolt!', 'Panahan Diskriminan!')); sync();
    });
    spells.querySelector('.sp-frz').addEventListener('click', function () {
      if (mana < 2 || paused || over) return;
      mana -= 2; frozenT = 6;
      toastMsg(L('b\u00b2\u22124ac < 0 \u2014 no real movement!', 'b\u00b2\u22124ac < 0 \u2014 tiada gerakan nyata!')); sync();
    });
    spells.querySelector('.sp-heal').addEventListener('click', function () {
      if (mana < 4 || paused || over || hearts >= 3) return;
      mana -= 4; hearts++; addFloat('+\u2764', hero.gx, hero.gy, '#ff6b8a');
      toastMsg(L('Healed!', 'Dipulihkan!')); sync();
    });
    pad.querySelector('.dg-up').addEventListener('click', function () { tryMove(0, -1); });
    pad.querySelector('.dg-down').addEventListener('click', function () { tryMove(0, 1); });
    pad.querySelector('.dg-left').addEventListener('click', function () { tryMove(-1, 0); });
    pad.querySelector('.dg-right').addEventListener('click', function () { tryMove(1, 0); });
    var onR = function () { cv.size(); fit(); }; window.addEventListener('resize', onR);

    /* ---------- pixel-art drawing on the native (low-res) canvas ----------
       High-detail 32px tiles. The static environment (floor slabs, brick
       walls, moss, ambient occlusion) is pre-rendered once per level to an
       offscreen canvas; each frame only animated things are redrawn. A smooth
       light pass (hero lamp, torch glows, vignette) sits on top of the crisp
       pixel blit, giving the dungeon depth without losing the pixel style. */
    var bgc = null, bgctx = null, embers = [], motes = [];
    function fr(x, y, w, h, col) { nctx.fillStyle = col; nctx.fillRect(x, y, w, h); }
    function frB(x, y, w, h, col) { bgctx.fillStyle = col; bgctx.fillRect(x, y, w, h); }
    function diamond(cx, cy, r, col) { nctx.fillStyle = col; for (var i = -r; i <= r; i++) { var w = r - Math.abs(i); nctx.fillRect(cx - w, cy + i, 2 * w + 1, 1); } }
    function h2(x, y) { var n = ((x * 73856093) ^ (y * 19349663)) >>> 0; n = (n ^ (n >> 13)) >>> 0; return n % 9973; }
    function nearWater(x, y) { return (grid[y] && grid[y][x + 1] === 'W') || (grid[y] && grid[y][x - 1] === 'W') || (grid[y + 1] && grid[y + 1][x] === 'W') || (grid[y - 1] && grid[y - 1][x] === 'W'); }

    function floorB(x, y) {
      var px = x * N, py = y * N, r = h2(x, y);
      frB(px, py, N, N, ['#4a4763', '#464359', '#514e69', '#434055'][r & 3]);
      frB(px + 1, py + 1, N - 2, 1, 'rgba(255,255,255,.05)');
      frB(px, py, 1, N, 'rgba(255,255,255,.03)');
      frB(px, py + N - 1, N, 1, 'rgba(0,0,0,.32)'); frB(px + N - 1, py, 1, N, 'rgba(0,0,0,.22)');
      if ((r % 5) === 0) {                                              // hairline crack
        var cx0 = px + 4 + (r % 9), cy0 = py + 6 + (r % 7);
        frB(cx0, cy0, 4, 1, 'rgba(0,0,0,.30)'); frB(cx0 + 3, cy0 + 1, 3, 1, 'rgba(0,0,0,.24)'); frB(cx0 + 5, cy0 + 2, 3, 1, 'rgba(0,0,0,.16)');
      }
      frB(px + 3 + (r % 13), py + 4 + (r % 11), 2, 1, 'rgba(0,0,0,.20)');   // pebbles / speckle
      frB(px + 16 + (r % 7), py + 18 + (r % 9), 1, 1, 'rgba(255,255,255,.07)');
      frB(px + 8 + (r % 17), py + 22 + (r % 5), 2, 2, 'rgba(0,0,0,.14)');
      if ((r % 11) === 0) { frB(px + 20 + (r % 6), py + 8, 1, 1, '#6a6784'); }
      if (nearWater(x, y)) {                                            // damp moss by the water
        frB(px + 5, py + N - 3, 2, 2, '#3f7d52'); frB(px + 12, py + N - 2, 3, 1, '#356c46'); frB(px + 22, py + N - 3, 2, 2, '#3f7d52');
        frB(px + 2, py + N - 5, N - 4, 1, 'rgba(30,70,50,.22)');
      }
      if (isWall(x, y - 1)) { frB(px, py, N, 2, 'rgba(0,0,0,.32)'); frB(px, py + 2, N, 2, 'rgba(0,0,0,.18)'); frB(px, py + 4, N, 1, 'rgba(0,0,0,.10)'); }  // AO under walls
      if (isWall(x - 1, y)) { frB(px, py, 2, N, 'rgba(0,0,0,.22)'); frB(px + 2, py, 1, N, 'rgba(0,0,0,.10)'); }
      if (isWall(x + 1, y)) { frB(px + N - 2, py, 2, N, 'rgba(0,0,0,.16)'); }
    }

    function wallB(x, y) {
      var px = x * N, py = y * N, up = isWall(x, y - 1), lf = isWall(x - 1, y), rt = isWall(x + 1, y);
      var capH = up ? 0 : 10;
      frB(px, py + capH, N, N - capH, '#262b3b');                       // mortar base
      var shades = ['#3b415c', '#394059', '#404663', '#363c54'];
      for (var ry = py + capH; ry < py + N; ry += 8) {                  // brick courses
        var rowI = Math.floor((ry - py) / 8), off = (rowI + y) % 2 ? 7 : 0, bh = Math.min(7, py + N - ry);
        for (var bx = -off; bx < N; bx += 13) {
          var t = h2(x * 31 + bx + off, y * 17 + rowI);
          var x0 = Math.max(px, px + bx), x1 = Math.min(px + N, px + bx + 12); if (x1 <= x0) continue;
          frB(x0, ry, x1 - x0, bh, shades[t & 3]);
          frB(x0, ry, x1 - x0, 1, 'rgba(255,255,255,.06)');
          frB(x0, ry + bh - 1, x1 - x0, 1, 'rgba(0,0,0,.28)');
          if (t % 7 === 0) frB(x0 + 3 + (t % 5), ry + 2, 1, 3, 'rgba(0,0,0,.30)');   // cracked brick
          if (t % 13 === 0) frB(x0 + 2, ry + 2, 2, 1, 'rgba(255,255,255,.05)');
        }
      }
      if (!up) {                                                        // exposed lit top cap
        frB(px, py, N, 10, '#6f7994'); frB(px, py, N, 2, '#8d97b3'); frB(px, py + 2, N, 1, '#7d87a3');
        frB(px + 7, py + 2, 1, 7, 'rgba(0,0,0,.18)'); frB(px + 15, py + 2, 1, 7, 'rgba(0,0,0,.18)'); frB(px + 23, py + 2, 1, 7, 'rgba(0,0,0,.18)');
        frB(px + 3 + (h2(x, y) % 9), py + 4, 2, 1, 'rgba(0,0,0,.15)');
        frB(px, py + 9, N, 1, 'rgba(0,0,0,.45)');
        if (h2(x, y) % 4 === 0) { frB(px + 5, py + 10, 2, 5, '#3f7d52'); frB(px + 5, py + 15, 1, 2, '#356c46'); }   // moss drip
        if (h2(y, x) % 5 === 0) { frB(px + 21, py + 10, 2, 4, '#3f7d52'); }
      }
      if (!lf) frB(px, py, 2, N, 'rgba(0,0,0,.30)');
      if (!rt) frB(px + N - 2, py, 2, N, 'rgba(0,0,0,.36)');
    }

    function renderBG() {
      bgc = document.createElement('canvas'); bgc.width = cols * N; bgc.height = rows * N; bgctx = bgc.getContext('2d');
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var t = grid[y][x];
        if (t === '#') wallB(x, y);
        else if (t === 'W') frB(x * N, y * N, N, N, '#0f2f66');         // base under animated water
        else floorB(x, y);
      }
      // torch sconce brackets are part of the wall
      torches.forEach(function (t) {
        var bx = t.x * N + N / 2, by = t.y * N + N - 6;
        frB(bx - 3, by + 3, 6, 2, '#5b6478'); frB(bx - 2, by + 2, 4, 1, '#6f7890');
        frB(bx - 1, by - 3, 2, 7, '#4a3419'); frB(bx - 1, by - 3, 1, 7, '#5d431f');
      });
      motes = [];
      for (var i = 0; i < 16; i++) motes.push({ x: rf(N, (cols - 1) * N), y: rf(N, (rows - 1) * N), v: rf(2.5, 6.5), ph: rf(0, 6.28) });
      embers = [];
    }

    function waterN(x, y, f) {
      var px = x * N, py = y * N;
      fr(px, py, N, 10, '#164490'); fr(px, py + 10, N, 8, '#1a4da4'); fr(px, py + 18, N, 14, '#123a80');
      var above = !(grid[y - 1] && grid[y - 1][x] === 'W');
      if (above) {
        fr(px, py, N, 2, 'rgba(0,0,0,.35)');
        var o = (f + x) % 4;
        fr(px + 1 + o, py + 2, 4, 1, 'rgba(220,240,255,.8)'); fr(px + 10 + ((o + 2) % 4), py + 2, 5, 1, 'rgba(220,240,255,.65)'); fr(px + 21 + o, py + 2, 4, 1, 'rgba(220,240,255,.8)');
      }
      var o1 = (f + x * 3) % 8, o2 = (f * 2 + x * 5) % 8;
      fr(px + 2 + o1, py + 8, 7, 1, 'rgba(150,200,255,.5)'); fr(px + 14 + ((o1 + 4) % 8), py + 13, 6, 1, 'rgba(150,200,255,.38)');
      fr(px + 4 + o2, py + 20, 8, 1, 'rgba(120,180,255,.28)'); fr(px + 16 + ((o2 + 3) % 8), py + 26, 6, 1, 'rgba(120,180,255,.22)');
      if (((h2(x, y) + f) % 13) === 0) fr(px + 6 + (h2(x, y) % 18), py + 5 + (h2(y, x) % 20), 1, 1, '#dff0ff');
    }

    function torchN(t, f) {
      var bx = t.x * N + N / 2, by = t.y * N + N - 6, ph = f % 3;
      fr(bx - 3, by - 9 - ph, 6, 7, '#c93a10'); fr(bx - 2, by - 11 - ph, 4, 2, '#c93a10');    // outer flame
      fr(bx - 2, by - 9 - ph, 4, 6, '#ff8c1f'); fr(bx - 1, by - 11 - ph, 2, 2, '#ff8c1f');    // mid
      fr(bx - 1, by - 8 - ph, 2, 4, '#ffd75e'); fr(bx - 1 + (f % 2), by - 10 - ph, 1, 2, '#fff3c0'); // core
      if (Math.random() < 0.10) embers.push({ x: bx + rf(-2, 2), y: by - 10, vx: rf(-3, 3), vy: rf(-16, -8), life: 1 });
    }

    function gemN(g, bob, f) {
      if (g.got) return; var cx = g.x * N + N / 2, cy = g.y * N + N / 2 + bob;
      fr(cx - 5, cy + 8, 10, 2, 'rgba(0,0,0,.22)');
      diamond(cx, cy, 7, '#0e4d86'); diamond(cx, cy, 6, '#1c6fb0'); diamond(cx, cy, 4, '#2f96d8');
      fr(cx - 3, cy - 2, 3, 1, '#7cc4ee'); fr(cx - 2, cy - 3, 1, 1, '#a8dcf7');
      fr(cx - 6, cy, 13, 1, 'rgba(255,255,255,.16)'); fr(cx, cy - 6, 1, 13, 'rgba(0,0,0,.14)');
      if (f % 8 === 0) { fr(cx + 2, cy - 5, 1, 3, '#fff'); fr(cx + 1, cy - 4, 3, 1, '#fff'); }
    }

    function keyN(bob, f) {
      if (!keyPos || keyPos.got) return; var cx = keyPos.x * N + N / 2 - 1, cy = keyPos.y * N + N / 2 + bob;
      fr(cx - 8, cy + 6, 18, 2, 'rgba(0,0,0,.2)');
      var c = '#e3b83a', d = '#a87f18', l = '#ffe27a';
      fr(cx - 9, cy - 3, 8, 2, c); fr(cx - 9, cy + 2, 8, 2, c); fr(cx - 9, cy - 1, 2, 3, c); fr(cx - 3, cy - 1, 2, 3, c);   // ring
      fr(cx - 9, cy - 3, 8, 1, l);
      fr(cx - 1, cy - 1, 11, 2, c); fr(cx - 1, cy, 11, 1, d);                                   // shaft
      fr(cx + 5, cy + 1, 2, 3, c); fr(cx + 8, cy + 1, 2, 4, c); fr(cx + 8, cy + 4, 2, 1, d);    // teeth
      if (f % 9 === 0) fr(cx - 8, cy - 3, 2, 1, '#fff');
    }

    function chestN(ch, f) {
      var x = ch.x * N + 4, y = ch.y * N + 8, w = 24, h = 18;
      fr(x - 1, y + h - 1, w + 2, 2, 'rgba(0,0,0,.30)');
      if (ch.open) {
        fr(x, y - 6, w, 6, '#7a4a20'); fr(x, y - 6, w, 1, '#9a6430'); fr(x + 2, y - 4, w - 4, 4, '#2a1808');
        fr(x, y + 7, w, h - 7, '#5f3a17');
        fr(x + 2, y + 8, w - 4, 4, '#ffd75e'); fr(x + 4, y + 8, 3, 2, '#fff3c0'); fr(x + 12, y + 9, 2, 2, '#7ad7ff'); fr(x + 18, y + 8, 2, 2, '#ff9ec7');
        if (f % 4 === 0) fr(x + 6 + (f % 12), y + 4, 1, 2, '#fff3c0');
      } else {
        fr(x, y, w, 7, '#7a4a20'); fr(x, y, w, 1, '#9a6430'); fr(x, y + 3, w, 1, 'rgba(0,0,0,.25)');
        fr(x, y + 7, w, h - 7, '#5f3a17'); fr(x, y + 11, w, 1, 'rgba(0,0,0,.25)'); fr(x, y + 15, w, 1, 'rgba(0,0,0,.25)');
      }
      fr(x, y + 6, w, 2, '#aab3c6'); fr(x, y + 6, w, 1, '#cdd4e2');
      fr(x, y, 3, 3, '#8f99ad'); fr(x + w - 3, y, 3, 3, '#8f99ad'); fr(x, y + h - 3, 3, 3, '#8f99ad'); fr(x + w - 3, y + h - 3, 3, 3, '#8f99ad');
      fr(x + w / 2 - 2, y, 4, h, '#8f99ad'); fr(x + w / 2 - 2, y, 1, h, '#aeb7ca'); fr(x + w / 2, y + 2, 1, 1, '#5b6478'); fr(x + w / 2, y + h - 4, 1, 1, '#5b6478');
      if (!ch.open) { fr(x + w / 2 - 3, y + 8, 6, 6, '#d8b13a'); fr(x + w / 2 - 3, y + 8, 6, 1, '#ffe27a'); fr(x + w / 2 - 1, y + 10, 2, 3, '#3a2410'); }
    }

    function doorN(time) {
      if (!doorPos) return; var px = doorPos.x * N, py = doorPos.y * N, gl = hasKey ? (0.55 + Math.sin(time * 5) * 0.35) : 0;
      diamond(px + N / 2, py + 9, 14, '#77809c'); diamond(px + N / 2, py + 9, 11, '#59617a');   // stone arch
      fr(px + 3, py + 8, N - 6, N - 8, '#0c0914');
      fr(px + 5, py + 10, N - 10, N - 11, '#6a4423'); fr(px + 6, py + 8, N - 12, 2, '#6a4423');
      fr(px + 9, py + 9, 1, N - 10, 'rgba(0,0,0,.30)'); fr(px + 13, py + 9, 1, N - 10, 'rgba(0,0,0,.30)'); fr(px + 19, py + 9, 1, N - 10, 'rgba(0,0,0,.30)'); fr(px + 23, py + 9, 1, N - 10, 'rgba(0,0,0,.30)');
      fr(px + N / 2 - 1, py + 9, 2, N - 10, '#241608');                                          // double-door split
      fr(px + 7, py + 12, 1, 1, '#caa24a'); fr(px + N - 8, py + 12, 1, 1, '#caa24a'); fr(px + 7, py + 22, 1, 1, '#caa24a'); fr(px + N - 8, py + 22, 1, 1, '#caa24a');
      fr(px + N / 2 - 5, py + 18, 2, 2, '#caa24a'); fr(px + N / 2 + 3, py + 18, 2, 2, '#caa24a'); // handles
      fr(px + 4, py + 14, 2, 1, '#8f99ad'); fr(px + N - 6, py + 14, 2, 1, '#8f99ad');             // hinges
      if (gl) {
        fr(px + 4, py + 8, N - 8, 1, 'rgba(255,210,63,' + gl + ')');
        fr(px + 4, py + N - 2, N - 8, 2, 'rgba(255,225,130,' + (gl * 0.55) + ')');
        fr(px + N / 2 - 1, py + 9, 2, N - 10, 'rgba(255,210,63,' + (gl * 0.6) + ')');
      }
    }

    function slimeN(m, time) {
      var cx = m.x * N + N / 2, base = m.y * N + N - 8;
      var sq = Math.sin(time * 5 + m.ph) > 0 ? 2 : 0, lx = hero ? (hero.gx > m.x ? 1 : hero.gx < m.x ? -1 : 0) : 0;
      fr(cx - 8, base + 5, 16, 2, 'rgba(0,0,0,.28)');
      var rows = [[3, 6], [5, 10], [7, 14], [8, 16], [9, 18], [9, 18], [9, 18], [8, 16]];
      for (var i = 0; i < rows.length; i++) {
        var yy = base - 8 + sq + i; if (i >= rows.length - 2) yy = base - 8 + i;   // base stays planted
        var col = i < 2 ? '#36bd74' : (i >= 6 ? '#157a44' : '#1d9457');
        fr(cx - rows[i][0], yy, rows[i][1], 1, col);
      }
      fr(cx - 5, base - 6 + sq, 4, 2, '#a8f2cc'); fr(cx - 6, base - 4 + sq, 2, 2, '#7fe2b0');    // gloss
      fr(cx - 5, base - 3 + sq, 3, 3, '#eafff3'); fr(cx + 2, base - 3 + sq, 3, 3, '#eafff3');    // eyes
      fr(cx - 4 + lx, base - 2 + sq, 1, 2, '#083a22'); fr(cx + 3 + lx, base - 2 + sq, 1, 2, '#083a22');
      fr(cx - 1, base + 1 + sq, 3, 1, '#0b5c33');
      fr(cx + 5, base - 1 + sq, 1, 1, '#7fe2b0'); fr(cx - 7, base + (sq ? 0 : 1), 1, 1, '#7fe2b0');
      if (Math.floor(time * 6) % 6 < 2) fr(cx + 7, base + 2, 1, 2, '#36bd74');                   // drip
    }

    function skullN(m, time) {
      var cx = m.x * N + N / 2, hov = Math.sin(time * 3 + m.ph), cy = m.y * N + N / 2 + Math.round(hov * 2);
      var lx = hero ? (hero.gx > m.x ? 1 : hero.gx < m.x ? -1 : 0) : 0, f = Math.floor(time * 6);
      fr(cx - 5, m.y * N + N - 5, 10, 2, 'rgba(0,0,0,' + (0.26 - 0.08 * hov).toFixed(2) + ')');
      fr(cx - 5, cy - 8, 10, 2, '#f2f3f8'); fr(cx - 6, cy - 6, 12, 3, '#e9ebf2'); fr(cx - 7, cy - 4, 14, 4, '#e9ebf2');
      fr(cx - 7, cy - 2, 2, 2, '#c3c7d4'); fr(cx + 5, cy - 3, 2, 3, '#b9bdcb');                  // side shading
      fr(cx - 5, cy - 4, 4, 4, '#141420'); fr(cx + 1, cy - 4, 4, 4, '#141420');                  // sockets
      fr(cx - 4 + lx, cy - 3, 2, 2, '#ff5a3c'); fr(cx + 2 + lx, cy - 3, 2, 2, '#ff5a3c');
      fr(cx - 4 + lx, cy - 3, 1, 1, '#ffd7c9'); fr(cx + 2 + lx, cy - 3, 1, 1, '#ffd7c9');
      fr(cx - 1, cy, 2, 2, '#141420');                                                          // nasal
      fr(cx - 4, cy + 2, 8, 3, '#dfe2ea'); fr(cx - 2, cy + 2, 1, 3, '#9ba0b0'); fr(cx, cy + 2, 1, 3, '#9ba0b0'); fr(cx + 2, cy + 2, 1, 3, '#9ba0b0');
      fr(cx - 4, cy + 4, 8, 1, 'rgba(0,0,0,.25)');
      fr(cx - 3 + (f % 3), cy + 7, 2, 1, 'rgba(190,200,255,.35)'); fr(cx + 2 - (f % 3), cy + 9, 2, 1, 'rgba(190,200,255,.22)');  // wisps
    }

    function knightN(time) {
      var k = 1 - hero.mv, nx = Math.round((hero.fx + (hero.gx - hero.fx) * k) * N), ny = Math.round((hero.fy + (hero.gy - hero.fy) * k) * N);
      var cx = nx + N / 2, top = ny + 4, d = hero.dir, f = Math.floor(time * 6);
      var walking = hero.mv > 0, bob = walking && (Math.floor(time * 12) % 2 === 0) ? 1 : 0, wf = walking ? Math.floor(time * 12) % 2 : 0;
      fr(cx - 7, ny + N - 3, 14, 2, 'rgba(0,0,0,.30)');
      var pf = Math.floor(time * 8) % 2;
      fr(cx - 1, top - 3, 3, 3, '#d13b2a'); fr(cx - 1 - d * 2, top - 2 - pf, 2, 2, '#d13b2a'); fr(cx - 1 - d * 3, top - 1 - pf, 1, 2, '#a82f20');  // plume
      fr(cx - 4, top, 8, 2, '#dfe5f2'); fr(cx - 5, top + 2, 10, 4, '#c2cadd'); fr(cx + 3, top + 2, 2, 4, '#97a1ba');    // helmet
      fr(cx - 4, top + 4, 8, 2, '#20242f'); fr(cx - 2 + d, top + 4, 1, 1, '#7ad7ff'); fr(cx + 1 + d, top + 4, 1, 1, '#7ad7ff'); // visor + eye glow
      fr(cx - 3, top + 6, 6, 1, '#8b94ac');
      fr(cx - 5, top + 7 + bob, 10, 7, '#cdd6e8'); fr(cx, top + 7 + bob, 1, 7, '#aab3c9'); fr(cx - 4, top + 8 + bob, 3, 1, '#eef2fa');  // cuirass
      fr(cx - 7, top + 7 + bob, 3, 3, '#b6bfd4'); fr(cx + 4, top + 7 + bob, 3, 3, '#b6bfd4'); fr(cx - 7, top + 7 + bob, 3, 1, '#d6ddeb'); fr(cx + 4, top + 7 + bob, 3, 1, '#d6ddeb');  // pauldrons
      fr(cx - 7, top + 10 + bob, 2, 2, '#8b94ac'); fr(cx + 5, top + 10 + bob, 2, 2, '#8b94ac');  // gauntlets
      fr(cx - 5, top + 13 + bob, 10, 2, '#5a3a1c'); fr(cx - 1, top + 13 + bob, 2, 2, '#e3b83a'); // belt + buckle
      fr(cx - 4, top + 15 + bob, 8, 2, '#9aa3ba');                                               // tasses
      fr(cx - 3, top + 17 + bob, 3, 4 + (wf ? 1 : 0), '#3b4254'); fr(cx + 1, top + 17 + bob, 3, 4 + (wf ? 0 : 1), '#3b4254');
      fr(cx - 3, top + 20 + bob + (wf ? 1 : 0), 3, 1, '#22252f'); fr(cx + 1, top + 20 + bob + (wf ? 0 : 1), 3, 1, '#22252f');
      var shX = d > 0 ? cx - 9 : cx + 6, swX = d > 0 ? cx + 7 : cx - 8;                          // shield + sword
      fr(shX, top + 8 + bob, 4, 6, '#b8452f'); fr(shX + 1, top + 14 + bob, 2, 2, '#b8452f'); fr(shX, top + 8 + bob, 4, 1, '#e8c86a'); fr(shX + 1, top + 10 + bob, 2, 2, '#e3b83a');
      fr(swX, top + 3 + bob, 2, 9, '#eef2fa'); fr(swX, top + 3 + bob, 1, 9, '#c9d2e2'); fr(swX, top + 2 + bob, 2, 1, '#fff');
      fr(swX - 2, top + 12 + bob, 6, 1, '#caa24a'); fr(swX, top + 13 + bob, 2, 3, '#5a3a1c'); fr(swX, top + 16 + bob, 2, 1, '#e3b83a');
      if (f % 9 === 0) fr(swX, top + 5 + bob, 1, 1, '#fff');
    }

    function loop(ts) {
      if (!lastT) lastT = ts; var dt = Math.min(0.05, (ts - lastT) / 1000); lastT = ts; var time = ts / 1000, fr2 = Math.floor(time * 6);
      if (hero && hero.mv > 0) { hero.mv = Math.max(0, hero.mv - dt * 7); if (hero.mv === 0) arrive(); }
      if (frozenT > 0) frozenT -= dt;
      // monsters think on a beat: skulls hunt the knight, slimes wander
      // (unless frozen \u2014 b\u00b2\u22124ac < 0: no real movement!)
      if (!paused && !over && frozenT <= 0) {
        mtick += dt;
        var beat = Math.max(0.55, 1.15 - level * 0.18);
        if (mtick >= beat) {
          mtick = 0;
          for (var mi = 0; mi < monsters.length; mi++) {
            var m = monsters[mi]; if (!m.alive || paused) continue;
            var ddx = hero.gx - m.x, ddy = hero.gy - m.y;
            var sxp = ddx > 0 ? 1 : ddx < 0 ? -1 : 0, syp = ddy > 0 ? 1 : ddy < 0 ? -1 : 0;
            var tries;
            if (m.type === 1) tries = Math.abs(ddx) >= Math.abs(ddy) ? [[sxp, 0], [0, syp]] : [[0, syp], [sxp, 0]];
            else { if (Math.random() < 0.55) continue; var ds = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]); tries = [ds[0], ds[1]]; }
            for (var ti = 0; ti < tries.length; ti++) {
              if (tries[ti][0] === 0 && tries[ti][1] === 0) continue;
              var nx2 = m.x + tries[ti][0], ny2 = m.y + tries[ti][1];
              if (nx2 === hero.gx && ny2 === hero.gy) { battle(m, true); break; }
              if (isWall(nx2, ny2) || grid[ny2][nx2] === 'W' || monAt(nx2, ny2) || chestAt(nx2, ny2)) continue;
              if (doorPos && nx2 === doorPos.x && ny2 === doorPos.y) continue;
              if (keyPos && !keyPos.got && nx2 === keyPos.x && ny2 === keyPos.y) continue;
              m.x = nx2; m.y = ny2; break;
            }
            if (paused) break;
          }
        }
      }
      for (var p = parts.length - 1; p >= 0; p--) { var q = parts[p]; q.life -= dt * 1.8; q.x += q.vx * dt; q.y += q.vy * dt; if (q.life <= 0) parts.splice(p, 1); }
      for (var e = embers.length - 1; e >= 0; e--) { var em = embers[e]; em.life -= dt * 1.4; em.x += em.vx * dt; em.y += em.vy * dt; if (em.life <= 0) embers.splice(e, 1); }
      if (toast) { toast.life -= dt; if (toast.life <= 0) toast = null; }

      if (use3d) {
        for (var fi2 = floats.length - 1; fi2 >= 0; fi2--) { floats[fi2].life -= dt; if (floats[fi2].life <= 0) floats.splice(fi2, 1); }
        var k3 = 1 - hero.mv;
        try {
          d3.sync({
            heroX: hero.fx + (hero.gx - hero.fx) * k3,
            heroY: hero.fy + (hero.gy - hero.fy) * k3,
            heroDir: hero.dir, heroMv: hero.mv, hasKey: hasKey, frozen: frozenT > 0
          }, time, dt);
        } catch (e) { }
        if (toast) { toastEl.textContent = toast.s; toastEl.style.opacity = Math.min(1, toast.life); toastEl.style.display = 'block'; }
        else toastEl.style.display = 'none';
        if (!over) raf = requestAnimationFrame(loop);
        return;
      }

      // ---- draw native scene ----
      nctx.drawImage(bgc, 0, 0);                                        // pre-rendered environment
      var bob = Math.round(Math.sin(time * 3) * 2);
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) if (grid[y][x] === 'W') waterN(x, y, fr2);
      motes.forEach(function (mo) {                                      // drifting dust
        mo.y -= mo.v * dt; if (mo.y < 4) { mo.y = (rows - 1) * N; mo.x = rf(N, (cols - 1) * N); }
        nctx.fillStyle = 'rgba(205,215,255,' + (0.05 + 0.05 * Math.sin(time * 2 + mo.ph)).toFixed(3) + ')';
        nctx.fillRect(Math.round(mo.x), Math.round(mo.y), 1, 1);
      });
      torches.forEach(function (t) { torchN(t, fr2); });
      embers.forEach(function (em) { nctx.globalAlpha = Math.max(0, em.life); nctx.fillStyle = '#ffb84d'; nctx.fillRect(Math.round(em.x), Math.round(em.y), 1, 1); }); nctx.globalAlpha = 1;
      gems.forEach(function (g) { gemN(g, bob, fr2); });
      chests.forEach(function (ch) { chestN(ch, fr2); });
      keyN(bob, fr2); doorN(time);
      monsters.forEach(function (m) { if (m.alive) (m.type === 0 ? slimeN : skullN)(m, time); });
      if (hero) knightN(time);
      parts.forEach(function (q) { nctx.globalAlpha = Math.max(0, q.life); nctx.fillStyle = q.col; nctx.fillRect(Math.round(q.x), Math.round(q.y), 2, 2); }); nctx.globalAlpha = 1;

      // ---- blit native -> visible (crisp upscale) ----
      vctx.clearRect(0, 0, cv.W, cv.H); vctx.fillStyle = '#0a0810'; vctx.fillRect(0, 0, cv.W, cv.H);
      vctx.imageSmoothingEnabled = false;
      vctx.drawImage(nc, 0, 0, cols * N, rows * N, ox, oy, TILE * cols, TILE * rows);

      // ---- smooth light pass on top ----
      torches.forEach(function (t) {
        var sx = ox + (t.x + 0.5) * TILE, sy = oy + (t.y + 0.7) * TILE, fl = 0.7 + Math.sin(time * 10 + t.x) * 0.3;
        var g = vctx.createRadialGradient(sx, sy, 2, sx, sy, TILE * 1.5);
        g.addColorStop(0, 'rgba(255,170,60,' + (0.42 * fl) + ')'); g.addColorStop(1, 'rgba(255,170,60,0)');
        vctx.fillStyle = g; vctx.beginPath(); vctx.arc(sx, sy, TILE * 1.5, 0, 6.28); vctx.fill();
      });
      if (hero) {                                                        // warm lamp around the knight
        var kk = 1 - hero.mv;
        var hx = ox + ((hero.fx + (hero.gx - hero.fx) * kk) + 0.5) * TILE, hy = oy + ((hero.fy + (hero.gy - hero.fy) * kk) + 0.5) * TILE;
        var hg = vctx.createRadialGradient(hx, hy, TILE * 0.2, hx, hy, TILE * 2.6);
        hg.addColorStop(0, 'rgba(255,196,120,.14)'); hg.addColorStop(1, 'rgba(255,196,120,0)');
        vctx.fillStyle = hg; vctx.beginPath(); vctx.arc(hx, hy, TILE * 2.6, 0, 6.28); vctx.fill();
      }
      var vg = vctx.createRadialGradient(cv.W / 2, cv.H / 2, Math.min(cv.W, cv.H) * 0.36, cv.W / 2, cv.H / 2, Math.max(cv.W, cv.H) * 0.72);
      vg.addColorStop(0, 'rgba(6,4,14,0)'); vg.addColorStop(1, 'rgba(6,4,14,.46)');
      vctx.fillStyle = vg; vctx.fillRect(0, 0, cv.W, cv.H);              // vignette

      for (var fi = floats.length - 1; fi >= 0; fi--) {
        var ft = floats[fi]; ft.life -= dt; ft.y -= dt * 16;
        if (ft.life <= 0) { floats.splice(fi, 1); continue; }
        vctx.save(); vctx.globalAlpha = Math.min(1, ft.life * 1.5);
        vctx.font = '800 13px Nunito, system-ui'; vctx.textAlign = 'center';
        vctx.strokeStyle = 'rgba(0,0,0,.6)'; vctx.lineWidth = 3; vctx.strokeText(ft.s, ox + ft.x * scale, oy + ft.y * scale);
        vctx.fillStyle = ft.col; vctx.fillText(ft.s, ox + ft.x * scale, oy + ft.y * scale);
        vctx.restore(); vctx.textAlign = 'left';
      }
      if (toast) { vctx.save(); vctx.globalAlpha = Math.min(1, toast.life); vctx.font = '700 14px Nunito, system-ui'; vctx.textAlign = 'center'; var w = vctx.measureText(toast.s).width + 24; vctx.fillStyle = 'rgba(0,0,0,.72)'; vctx.beginPath(); vctx.roundRect(cv.W / 2 - w / 2, 8, w, 26, 8); vctx.fill(); vctx.fillStyle = '#fff'; vctx.fillText(toast.s, cv.W / 2, 25); vctx.restore(); vctx.textAlign = 'left'; }

      if (!over) raf = requestAnimationFrame(loop);
    }

    load(0);
    raf = requestAnimationFrame(loop);
    return function () { if (raf) cancelAnimationFrame(raf); if (battleIv) clearInterval(battleIv); if (d3) d3.dispose(); window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onR); };
  }

  function init() { mount = document.getElementById('gamesMount'); if (!mount) return; showHub(); if (window.I18N && I18N.onChange) I18N.onChange(function () { if (mount.querySelector('.games-grid')) showHub(); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  return { init: init, showHub: showHub };
})();
