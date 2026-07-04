/* ============================================================================
   FOR THE JUDGE (in simple words):
   This is the WELCOME / START screen. Instead of dropping you straight into the
   calculator, QuadVision first shows a friendly overlay that says what the tool
   is and how to use it in three steps. Press "Start exploring" to enter. You can
   reopen this guide any time from the "Guide" button in the top menu. It is fully
   bilingual (English / Bahasa Melayu) and remembers nothing — judges always see
   it first.
   ============================================================================ */
window.Intro = (function () {
  'use strict';

  function lang() { return (window.I18N && I18N.current && I18N.current() === 'ms') ? 'ms' : 'en'; }
  function L(en, ms) { return (lang() === 'ms' && ms) ? ms : en; }

  var root, card, guideBtn, open = false, built = false;

  // ---- the styles for the overlay (injected once) -----------------------
  var CSS = ''
    // Backdrop: frosted glass matching the website's glassmorphism style
    + '#qv-intro{position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;padding:24px;'
    + 'background:rgba(18,16,40,.45);-webkit-backdrop-filter:saturate(160%) blur(16px);backdrop-filter:saturate(160%) blur(16px);'
    + 'opacity:0;pointer-events:none;transition:opacity .45s ease;}'
    + '#qv-intro.show{opacity:1;pointer-events:auto;}'

    // Card: premium glassmorphism card
    + '.qvi-card{width:min(720px,100%);max-height:92vh;overflow:auto;background:var(--card,#fff);color:var(--ink,#243b53);'
    + 'border:1px solid var(--glass-edge,rgba(255,255,255,.6));border-radius:28px;padding:40px 40px 32px;'
    + 'box-shadow:0 40px 100px -30px rgba(20,12,50,.55),0 0 0 1px rgba(122,92,240,.08);'
    + 'transform:translateY(24px) scale(.96);opacity:0;'
    + 'transition:transform .6s cubic-bezier(.16,1,.3,1),opacity .5s ease;}'
    + '#qv-intro.show .qvi-card{transform:none;opacity:1;}'

    // Header row
    + '.qvi-top{display:flex;align-items:center;gap:14px;margin-bottom:4px;}'
    + '.qvi-top img{width:50px;height:50px;border-radius:14px;box-shadow:0 8px 24px -10px rgba(122,92,240,.5);}'
    + '.qvi-top b{font-family:var(--display,system-ui);font-weight:700;font-size:1.6rem;letter-spacing:-.02em;}'
    + '.qvi-top b span{background:linear-gradient(135deg,var(--lav-strong,#7a5cf0),var(--pink-strong,#e0609a));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}'
    + '.qvi-badge{margin-left:auto;font-family:var(--display,system-ui);font-weight:600;font-size:.68rem;letter-spacing:.14em;'
    + 'text-transform:uppercase;color:var(--lav-strong,#7a5cf0);background:var(--lav-soft,#f1ebff);padding:6px 14px;border-radius:999px;}'

    // Lead copy
    + '.qvi-lead{font-family:var(--display,system-ui);font-weight:600;font-size:1.55rem;line-height:1.25;letter-spacing:-.02em;margin:18px 0 8px;}'
    + '.qvi-lead em{font-style:normal;background:linear-gradient(135deg,var(--lav-strong,#7a5cf0),var(--pink-strong,#e0609a));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}'
    + '.qvi-sub{color:var(--muted,rgba(36,59,83,.6));font-size:1.02rem;line-height:1.55;}'

    // Section headers
    + '.qvi-h{font-family:var(--display,system-ui);font-weight:700;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;'
    + 'color:var(--muted,rgba(36,59,83,.55));margin:26px 0 14px;display:flex;align-items:center;gap:10px;}'
    + '.qvi-h::before{content:"";width:24px;height:2.5px;border-radius:2px;background:linear-gradient(90deg,var(--lav-strong,#7a5cf0),var(--pink-strong,#e0609a));}'

    // Steps — staggered entrance
    + '.qvi-steps{display:grid;gap:10px;}'
    + '.qvi-step{display:flex;gap:14px;align-items:flex-start;background:var(--card-2,#fdfbff);border:1px solid var(--hair,rgba(36,59,83,.1));'
    + 'border-radius:16px;padding:16px 18px;opacity:0;transform:translateY(8px);animation:qvi-slide-in .45s ease forwards;}'
    + '.qvi-step:nth-child(1){animation-delay:.15s;}'
    + '.qvi-step:nth-child(2){animation-delay:.25s;}'
    + '.qvi-step:nth-child(3){animation-delay:.35s;}'
    + '@keyframes qvi-slide-in{to{opacity:1;transform:none;}}'
    + '.qvi-n{flex:none;width:32px;height:32px;border-radius:10px;display:grid;place-items:center;font-family:var(--display,system-ui);'
    + 'font-weight:700;font-size:.95rem;color:#fff;background:linear-gradient(135deg,var(--lav-strong,#7a5cf0),var(--pink-strong,#e0609a));'
    + 'box-shadow:0 4px 12px -4px rgba(122,92,240,.4);}'
    + '.qvi-step .t{font-weight:700;font-size:.98rem;}.qvi-step .d{color:var(--muted,rgba(36,59,83,.55));font-size:.92rem;margin-top:3px;line-height:1.5;}'

    // Feature pills — staggered entrance
    + '.qvi-feats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}'
    + '.qvi-feat{display:flex;gap:10px;align-items:center;font-weight:600;font-size:.93rem;'
    + 'background:var(--lav-soft,#f1ebff);border:1px solid rgba(122,92,240,.1);'
    + 'border-radius:14px;padding:12px 14px;opacity:0;transform:translateY(6px);animation:qvi-slide-in .4s ease forwards;}'
    + '.qvi-feat:nth-child(1){animation-delay:.4s;}'
    + '.qvi-feat:nth-child(2){animation-delay:.48s;}'
    + '.qvi-feat:nth-child(3){animation-delay:.56s;}'
    + '.qvi-feat:nth-child(4){animation-delay:.64s;}'
    + '.qvi-feat .e{font-size:1.2rem;line-height:1;}'

    // Action buttons
    + '.qvi-actions{display:flex;gap:14px;align-items:center;margin-top:28px;flex-wrap:wrap;}'
    + '.qvi-start{border:0;border-radius:14px;padding:15px 30px;font-family:var(--body,system-ui);font-weight:700;font-size:1.05rem;'
    + 'color:#fff;background:linear-gradient(135deg,var(--lav-strong,#7a5cf0),var(--pink-strong,#e0609a));cursor:pointer;'
    + 'box-shadow:0 14px 32px -12px rgba(122,92,240,.55);transition:transform .15s cubic-bezier(.2,.8,.2,1),box-shadow .25s ease,filter .2s;}'
    + '.qvi-start:hover{filter:brightness(1.06);box-shadow:0 18px 40px -14px rgba(122,92,240,.65);transform:translateY(-1px);}'
    + '.qvi-start:active{transform:scale(.97) translateY(0);}'
    + '.qvi-skip{background:none;border:0;color:var(--muted,rgba(36,59,83,.5));font-family:var(--body,system-ui);font-weight:700;'
    + 'font-size:.95rem;cursor:pointer;padding:12px;transition:color .2s;}.qvi-skip:hover{color:var(--ink,#243b53);}'
    + '.qvi-tip{margin-left:auto;color:var(--muted,rgba(36,59,83,.45));font-size:.82rem;font-style:italic;}'
    + '.nav a.qvi-guide{cursor:pointer;}'

    // Mobile
    + '@media (max-width:560px){.qvi-card{padding:26px 22px;border-radius:24px;}.qvi-lead{font-size:1.3rem;}.qvi-feats{grid-template-columns:1fr;}.qvi-tip{display:none;}}';

  function render() {
    card.innerHTML = ''
      + '<div class="qvi-top">'
      +   '<img src="' + LOGO + '" alt="QuadVision logo"/>'
      +   '<b>Quad<span>Vision</span></b>'
      +   '<span class="qvi-badge">KIE 2026</span>'
      + '</div>'
      + '<div class="qvi-lead">' + L('Quadratics you can actually <em>see</em>.', 'Kuasa dua yang boleh anda <em>lihat</em>.') + '</div>'
      + '<div class="qvi-sub">' + L(
            'QuadVision teaches you to solve quadratic equations by <b>showing</b> the method "completing the square" as a real picture made of tiles — not just formulas.',
            'QuadVision mengajar anda menyelesaikan persamaan kuasa dua dengan <b>menunjukkan</b> kaedah "menyempurnakan kuasa dua" sebagai gambar sebenar daripada jubin — bukan sekadar formula.') + '</div>'

      + '<div class="qvi-h">' + L('How to use it', 'Cara menggunakannya') + '</div>'
      + '<div class="qvi-steps">'
      +   step(1, L('Type your equation', 'Taip persamaan anda'), L('Enter a, b and c — or scan a photo of a question.', 'Masukkan a, b dan c — atau imbas gambar soalan.'))
      +   step(2, L('Watch the square form', 'Lihat segi empat terbentuk'), L('Press Visualise and step through as the tiles complete the square.', 'Tekan Visualise dan ikut langkah sambil jubin menyempurnakan segi empat.'))
      +   step(3, L('Explore & practise', 'Teroka & berlatih'), L('See the live graph, real-life examples, and play the challenges.', 'Lihat graf langsung, contoh kehidupan sebenar, dan main cabaran.'))
      + '</div>'

      + '<div class="qvi-h">' + L('What\'s inside', 'Apa yang ada') + '</div>'
      + '<div class="qvi-feats">'
      +   feat('🟦', L('Visual method, not memorising', 'Kaedah visual, bukan menghafal'))
      +   feat('🌐', L('English & Bahasa Melayu', 'Bahasa Inggeris & Melayu'))
      +   feat('📈', L('Live, interactive graph', 'Graf langsung & interaktif'))
      +   feat('📷', L('Scan a question by photo', 'Imbas soalan dengan foto'))
      + '</div>'

      + '<div class="qvi-actions">'
      +   '<button class="qvi-start" type="button">' + L('Start exploring', 'Mula meneroka') + '</button>'
      +   '<button class="qvi-skip" type="button">' + L('Skip', 'Langkau') + '</button>'
      +   '<span class="qvi-tip">' + L('Tip: reopen from "Guide" any time', 'Petua: buka semula dari "Panduan"') + '</span>'
      + '</div>';

    card.querySelector('.qvi-start').addEventListener('click', function () { hide(false); });
    card.querySelector('.qvi-skip').addEventListener('click', function () { hide(false); });
  }

  function step(n, t, d) {
    return '<div class="qvi-step"><span class="qvi-n">' + n + '</span><div><div class="t">' + t + '</div><div class="d">' + d + '</div></div></div>';
  }
  function feat(e, t) { return '<div class="qvi-feat"><span class="e">' + e + '</span><span>' + t + '</span></div>'; }

  var LOGO = '';
  function build() {
    if (built) return; built = true;

    var bi = document.querySelector('.brand img'); LOGO = bi ? bi.src : '';

    var style = document.createElement('style'); style.id = 'qv-intro-css'; style.textContent = CSS;
    document.head.appendChild(style);

    root = document.createElement('div'); root.id = 'qv-intro';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Welcome to QuadVision');
    card = document.createElement('div'); card.className = 'qvi-card';
    root.appendChild(card);
    document.body.appendChild(root);
    render();

    root.addEventListener('click', function (e) { if (e.target === root) hide(false); });
    document.addEventListener('keydown', function (e) { if (open && e.key === 'Escape') hide(false); });

    addGuideButton();
    if (window.I18N && I18N.onChange) I18N.onChange(function () { if (built) render(); if (guideBtn) guideBtn.textContent = L('Guide', 'Panduan'); });
  }

  function addGuideButton() {
    var nav = document.querySelector('.topbar .nav');
    if (!nav || nav.querySelector('.qvi-guide')) return;
    guideBtn = document.createElement('a');
    guideBtn.className = 'qvi-guide';
    guideBtn.setAttribute('role', 'button'); guideBtn.tabIndex = 0;
    guideBtn.textContent = L('Guide', 'Panduan');
    guideBtn.addEventListener('click', function (e) { e.preventDefault(); show(); });
    guideBtn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } });
    nav.appendChild(guideBtn);
  }

  function show() {
    build();
    render();
    open = true;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { root.classList.add('show'); });
  }

  function hide(goToSolver) {
    open = false;
    // Smooth exit: card slides down and fades
    card.style.transition = 'transform .4s cubic-bezier(.4,0,1,1), opacity .35s ease';
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px) scale(.97)';
    // Backdrop fades
    root.style.transition = 'opacity .4s ease .1s';
    root.classList.remove('show');
    document.body.style.overflow = '';

    // Reset card styles after transition so reopening works
    setTimeout(function () {
      card.style.transition = '';
      card.style.opacity = '';
      card.style.transform = '';
      root.style.transition = '';
    }, 500);

    if (goToSolver) {
      var s = document.getElementById('solve');
      if (s && s.scrollIntoView) setTimeout(function () { s.scrollIntoView({ behavior: 'smooth' }); }, 250);
      if (window.Squary && Squary.say) setTimeout(function () {
        Squary.say(L('Let\u2019s solve one together!', 'Jom selesaikan satu bersama!'), { state: 'wave', duration: 3200 });
      }, 900);
    }
  }

  function init() {
    function go() { show(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
    else go();
  }

  return { init: init, show: show, hide: hide };
})();

if (window.Intro) Intro.init();
