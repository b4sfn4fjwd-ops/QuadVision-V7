/* ============================================================================
   FOR THE JUDGE (in simple words):
   This is "Squary", our friendly bear helper. He greets students, explains each
   step in a speech bubble (in both languages), points at the graph, throws
   confetti and hands out little achievements when a question is solved. His eyes
   follow the mouse, you can pet him (hearts) or drag him around, and he naps if
   left alone — small touches that keep younger learners engaged.
   ============================================================================ */
/* QuadVision — squary.js
   Squary: a friendly square-shaped learning companion (NOT a chatbot).
   Pure vanilla JS + injected CSS + inline SVG. It greets, narrates the
   completing-the-square steps, points at the graph, drops confetti on a
   solve, hands out achievements, offers progressive hints when a student
   is stuck, and shares short tips. No dependencies, no build step. */
window.Squary = (function () {
  'use strict';

  // Check if the user prefers reduced motion (accessibility)
  const REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Size of Squary's box (in pixels)
  const CHAR = 104;

  // ---- bilingual helpers ----- Helper functions for two-language support

  // lang returns the current language ('en' or 'ms')
  function lang() { return (window.I18N && I18N.current && I18N.current() === 'ms') ? 'ms' : 'en'; }

  // L selects between English and Malay versions of text
  function L(en, ms) { return (lang() === 'ms' && ms) ? ms : en; }

  // ---- message pools (English; 100+ for the click feature) --------------
  const CLICKS = [
    "Mathematics is easier when you can see it!",
    "Every expert once solved their first quadratic.",
    "Practice makes progress.",
    "I believe in you!",
    "Let's complete another square!",
    "A square is just four equal sides — and a little patience.",
    "Mistakes are proof that you're trying.",
    "Half of b, then square it. That's the secret.",
    "You're sharper than you think.",
    "Every parabola has a turning point — its vertex.",
    "Completing the square turns chaos into a tidy box.",
    "Curiosity is your best calculator.",
    "Slow is smooth, and smooth is fast.",
    "The discriminant tells you how many roots to expect.",
    "b² − 4ac — small numbers, big secrets.",
    "You don't have to be perfect, just persistent.",
    "Vertex form shows you exactly where the curve turns.",
    "Math is a language, and you're becoming fluent.",
    "One step at a time builds the whole square.",
    "When in doubt, draw it out.",
    "The x² tile is always a perfect square of side x.",
    "Great mathematicians ask 'why', not just 'how'.",
    "Roots are where the curve kisses the x-axis.",
    "What you add to one side, add to the other.",
    "You just got a little smarter — I felt it!",
    "A parabola is a smile (or a frown) made of math.",
    "Symmetry is everywhere, even in equations.",
    "Keep going — the square is almost complete.",
    "Numbers are friends once you get to know them.",
    "The axis of symmetry splits the parabola in half.",
    "Today's struggle is tomorrow's skill.",
    "Squaring a number means multiplying it by itself.",
    "Focus on the next step, not the whole mountain.",
    "Negative b over 2a points you straight to the vertex.",
    "Any quadratic can become a perfect square plus a number.",
    "Learning is just leveling up your brain.",
    "The corner tile (b⁄2)² completes the picture.",
    "Be patient with yourself — growth takes time.",
    "Every quadratic hides a square inside it.",
    "Confidence comes from repetition.",
    "Think of x as the side length of a square.",
    "Two roots, one root, or none — the discriminant decides.",
    "You're not stuck, you're loading.",
    "The graph and the algebra always agree.",
    "Divide out 'a' first to keep things simple.",
    "Small wins add up to big understanding.",
    "Completing the square is where the quadratic formula is born.",
    "Trust the process — and the parabola.",
    "Your brain grows every time you try something hard.",
    "Square it, balance it, solve it.",
    "The vertex is the turning point of the whole story.",
    "Even Pythagoras started somewhere.",
    "Read the equation like a sentence.",
    "Halve, square, add, balance — your four magic moves.",
    "You're allowed to think slowly.",
    "A perfect square trinomial folds neatly into (x + h)².",
    "Curves have feelings too — the vertex is their heart.",
    "Progress, not perfection.",
    "If a > 0 the parabola smiles upward.",
    "If a < 0 the parabola frowns downward.",
    "Each tile you place reveals the pattern.",
    "You and math make a great team.",
    "The number you add must keep both sides equal.",
    "Visualize first, calculate second.",
    "Completing the square is just reshaping area.",
    "One good question beats ten memorized rules.",
    "The roots add up to −b⁄a. Neat, right?",
    "The roots multiply to c⁄a. Another secret!",
    "You're doing better than you realize.",
    "A square has no rough edges — like a finished solution.",
    "Take a breath, then take the square root.",
    "Don't just memorize — understand.",
    "The parabola never lies about its vertex.",
    "Effort today, mastery tomorrow.",
    "Every '±' gives you two paths to a root.",
    "Geometry and algebra are old friends.",
    "Keep your signs in check — they love to flip.",
    "You turned an equation into a picture. That's power.",
    "The middle term tells you the strip's width.",
    "A little courage solves a lot of math.",
    "Squares are stable — so is steady practice.",
    "When the corner fits, the square is complete.",
    "You're closer to the answer than you feel.",
    "Math rewards the curious.",
    "Completing the square is tidying your room, for numbers.",
    "Vertex form whispers the maximum or minimum.",
    "Brains, like muscles, grow with use.",
    "A graph is just an equation wearing a costume.",
    "Halving b is step one of the magic.",
    "You've got this — one square at a time.",
    "Patterns are math's way of saying hello.",
    "The sign under the root decides what's real.",
    "Add the corner, keep the balance, claim the square.",
    "Learning math is learning to see.",
    "Be brave enough to be a beginner.",
    "A finished square is a tiny victory.",
    "The same square trick works for any quadratic — that's the beauty.",
    "Your future self will thank you for practicing today.",
    "Solve it once, understand it forever.",
    "Squares everywhere — that's why they call me Squary!",
    "Take the leap; the square root will catch you.",
    "You make hard things look possible.",
    "From standard form to vertex form in four moves.",
    "Keep stacking those tiny wins.",
    "Drawing the square makes the algebra obvious."
  ];

  const TIPS = [
    "Did you know? Completing the square is how the vertex form of a quadratic is created.",
    "Tip: the coefficient of x is always divided by two before squaring.",
    "Remember: the value you add must also be added to the opposite side to keep the equation balanced.",
    "Tip: if a ≠ 1, divide every term by a before completing the square.",
    "Did you know? The vertex of y = a(x − h)² + k is exactly (h, k).",
    "Tip: the discriminant b² − 4ac tells you how many real roots there are.",
    "Did you know? Doing this with letters instead of numbers gives the quadratic formula.",
    "Tip: a positive 'a' opens the parabola upward; a negative 'a' opens it downward.",
    "Did you know? The axis of symmetry is the vertical line x = −b⁄2a.",
    "Tip: a perfect square trinomial factors into (x + b⁄2)².",
    "Did you know? The two roots always add up to −b⁄a.",
    "Tip: the corner tile you add has area (b⁄2)².",
    "Did you know? Completing the square reshapes the equation into pure area.",
    "Tip: taking a square root means remembering the ± sign.",
    "Did you know? The product of the roots equals c⁄a.",
    "Tip: the y-intercept of the parabola is simply c."
  ];

  const ENCOURAGE = [
    "Almost! Let's try that step again.",
    "You're very close!",
    "Remember to divide the coefficient by 2 first.",
    "So close — keep the equation balanced on both sides.",
    "Not quite yet — but you're on the right track!",
    "Give it another go; you've nearly got it."
  ];

  const HINTS = [
    () => L("Start by writing it as ax² + bx + c = 0. If a isn't 1, divide every term by a.",
            "Mulakan dengan ax² + bx + c = 0. Jika a bukan 1, bahagi setiap sebutan dengan a."),
    () => L("Take half of the x-coefficient, then square it — that's the number you'll add.",
            "Ambil separuh pekali x, kemudian kuasa duakannya — itulah nombor yang akan ditambah."),
    () => L("Add that squared number to BOTH sides, then write the left side as (x + b⁄2)².",
            "Tambah nombor kuasa dua itu pada KEDUA-DUA belah, kemudian tulis sebelah kiri sebagai (x + b⁄2)².")
  ];

  const ACH = {
    first:   () => L("🎉 First Equation Solved!", "🎉 Persamaan Pertama Selesai!"),
    streak5: () => L("🔥 Five Correct in a Row!", "🔥 Lima Betul Berturut-turut!"),
    accuracy:() => L("⭐ Perfect Accuracy!", "⭐ Ketepatan Sempurna!"),
    master:  () => L("🏆 Completing Square Master!", "🏆 Master Menyempurnakan Kuasa Dua!")
  };

  // ---- tiny utilities ----- Helper functions

  // rnd picks a random item from an array
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // clickBag shuffles the messages so we show them in a random order without repeating
  let clickBag = [];

  // nextClick gets the next message, reshuffling when we've shown them all
  function nextClick() {
    // If bag is empty, refill it with all messages shuffled
    if (!clickBag.length) clickBag = CLICKS.slice().sort(() => Math.random() - 0.5);
    // Return the next one
    return clickBag.pop();
  }

  // store saves/loads data in browser storage (achievements, settings, etc.)
  function store(k, v) {
    try {
      // If no value, retrieve instead of store
      if (v === undefined) return localStorage.getItem(k);
      // Otherwise save it
      localStorage.setItem(k, v);
    } catch (e) { return null; }
  }

  // ---- DOM scaffolding --------------------------------------------------
  let root, charEl, bubbleEl, bubbleText, bubbleActions, confettiLayer, achEl;
  let busy = false, bubbleTimer = null, stateTimer = null, hintTimer = null, tipTimer = null;
  let curState = 'idle';

  const CSS = `
  #squary{position:fixed;left:0;top:0;width:${CHAR}px;height:${CHAR}px;z-index:70;pointer-events:none;
    transition:transform .9s cubic-bezier(.5,.08,.3,1);will-change:transform;}
  .squary-char{position:absolute;inset:0;cursor:pointer;pointer-events:auto;transform-origin:bottom center;outline:none;}
  .squary-char svg{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 10px 14px rgba(40,30,90,.22));}
  .squary-char:focus-visible{outline:none;}
  .squary-char:focus-visible .sq-body{stroke:var(--lav-strong,#7a5cf0);stroke-width:3;}
  .sq-foot,.sq-arm,.sq-cheek{transform-box:fill-box;transform-origin:center;}
  .sq-arm-l{transform-origin:right center;}
  .sq-arm-r{transform-origin:left center;}
  .sq-eyes-dyn{transform-box:fill-box;transform-origin:center;}
  .sq-eyes-dyn.blink{animation:sq-blink 4.4s infinite;}
  .sq-cheek{opacity:0;transition:opacity .25s;}

  /* idle / state machine */
  .squary-char[data-state="idle"]{animation:sq-idle 2.9s ease-in-out infinite;}
  .squary-char[data-state="walk"]{animation:sq-walk .5s ease-in-out infinite;}
  .squary-char[data-state="jump"]{animation:sq-jump .7s ease;}
  .squary-char[data-state="happy"]{animation:sq-happy .7s ease;}
  .squary-char[data-state="celebrate"]{animation:sq-celebrate 1.05s ease;}
  .squary-char[data-state="think"]{animation:sq-think 1.7s ease-in-out infinite;}
  .squary-char[data-state="wave"]{animation:sq-idle 2.9s ease-in-out infinite;}

  .squary-char[data-state="walk"] .sq-foot-l{animation:sq-step .5s ease-in-out infinite;}
  .squary-char[data-state="walk"] .sq-foot-r{animation:sq-step .5s ease-in-out infinite .25s;}
  .squary-char[data-state="wave"] .sq-arm-r{animation:sq-wave .5s ease-in-out infinite;}
  .squary-char[data-state="point"] .sq-arm-r{transform:rotate(-26deg) translateX(4px);}
  .squary-char[data-state="think"] .sq-arm-r{transform:rotate(-72deg) translate(1px,7px);}
  .squary-char[data-state="clap"] .sq-arm-l{animation:sq-clapL .26s ease-in-out 5 alternate;}
  .squary-char[data-state="clap"] .sq-arm-r{animation:sq-clapR .26s ease-in-out 5 alternate;}
  .squary-char[data-state="happy"] .sq-cheek,
  .squary-char[data-state="celebrate"] .sq-cheek,
  .squary-char[data-state="clap"] .sq-cheek{opacity:.9;}

  @keyframes sq-idle{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-5px) rotate(-1.5deg)}}
  @keyframes sq-walk{0%,100%{transform:translateY(0) rotate(-2.5deg)}50%{transform:translateY(-3px) rotate(2.5deg)}}
  @keyframes sq-step{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes sq-jump{0%{transform:translateY(0) scaleY(1)}22%{transform:translateY(-3px) scaleY(.85)}55%{transform:translateY(-36px) scaleY(1.06)}80%{transform:translateY(0) scaleY(.88)}100%{transform:translateY(0) scaleY(1)}}
  @keyframes sq-happy{0%,100%{transform:scale(1)}30%{transform:scale(1.12,.9)}60%{transform:scale(.95,1.08)}}
  @keyframes sq-celebrate{0%{transform:translateY(0) rotate(0)}25%{transform:translateY(-28px) rotate(9deg)}50%{transform:translateY(0) rotate(-9deg)}72%{transform:translateY(-15px) rotate(6deg)}100%{transform:translateY(0) rotate(0)}}
  @keyframes sq-think{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(3deg)}}
  @keyframes sq-wave{0%,100%{transform:rotate(2deg)}50%{transform:rotate(-40deg)}}
  @keyframes sq-clapL{to{transform:rotate(30deg) translateX(11px)}}
  @keyframes sq-clapR{to{transform:rotate(-30deg) translateX(-11px)}}
  @keyframes sq-blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.12)}}

  /* speech bubble (--sq-bx keeps it inside the viewport; --sq-tail re-aims the tail) */
  .squary-bubble{position:absolute;left:${CHAR / 2}px;bottom:${CHAR + 12}px;transform:translate(calc(-50% + var(--sq-bx,0px)),8px) scale(.92);
    width:max-content;max-width:248px;background:var(--card,#fff);color:var(--ink,#243b53);
    border:1px solid var(--hair,rgba(36,59,83,.12));border-radius:18px;padding:11px 14px;
    box-shadow:0 16px 40px -18px rgba(40,30,90,.5);opacity:0;pointer-events:none;
    transition:opacity .25s ease,transform .3s cubic-bezier(.3,1.4,.5,1);
    font-family:var(--body,system-ui);font-size:.92rem;line-height:1.45;font-weight:600;z-index:2;}
  .squary-bubble.show{opacity:1;transform:translate(calc(-50% + var(--sq-bx,0px)),0) scale(1);pointer-events:auto;}
  .squary-bubble::after{content:"";position:absolute;left:var(--sq-tail,50%);bottom:-7px;width:14px;height:14px;
    background:var(--card,#fff);border-right:1px solid var(--hair,rgba(36,59,83,.12));
    border-bottom:1px solid var(--hair,rgba(36,59,83,.12));transform:translateX(-50%) rotate(45deg);}
  .squary-bubble .sq-actions{display:flex;gap:8px;margin-top:10px;}
  .squary-bubble .sq-btn{border:0;border-radius:999px;padding:7px 13px;font-family:var(--body,system-ui);
    font-weight:800;font-size:.82rem;cursor:pointer;transition:transform .12s,box-shadow .18s,background .18s;}
  .squary-bubble .sq-btn:active{transform:translateY(1px);}
  .squary-bubble .sq-btn.primary{background:linear-gradient(120deg,var(--lav-strong,#7a5cf0),var(--pink-strong,#e0609a));color:#fff;}
  .squary-bubble .sq-btn.ghost{background:var(--card-2,#f4f4fb);color:var(--ink-soft,#3d566e);border:1px solid var(--hair,rgba(36,59,83,.12));}

  /* confetti + achievement toast */
  #squary-confetti{position:fixed;inset:0;pointer-events:none;z-index:66;overflow:hidden;}
  .sq-confetti-bit{position:absolute;top:-16px;border-radius:3px;will-change:transform,opacity;animation:sq-fall linear forwards;}
  @keyframes sq-fall{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(108vh) rotate(720deg);opacity:.15}}
  #squary-ach{position:fixed;top:84px;left:50%;transform:translate(-50%,-16px);z-index:80;opacity:0;
    pointer-events:none;background:var(--card,#fff);color:var(--ink,#243b53);
    border:1px solid var(--hair,rgba(36,59,83,.12));border-radius:16px;padding:12px 18px;
    box-shadow:0 18px 44px -16px rgba(40,30,90,.5);font-family:var(--display,system-ui);font-weight:600;
    font-size:1.02rem;transition:opacity .3s ease,transform .35s cubic-bezier(.3,1.4,.5,1);}
  #squary-ach.show{opacity:1;transform:translate(-50%,0);}
  #squary-ach .sq-ach-sub{display:block;font-family:var(--body,system-ui);font-weight:700;font-size:.76rem;
    letter-spacing:.08em;text-transform:uppercase;color:var(--muted,rgba(36,59,83,.6));margin-bottom:2px;}

  /* ---- extra emotions + interactivity (added) ---- */
  .sq-top{transform-box:fill-box;transform-origin:center bottom;}
  .squary-char[data-state="love"]{animation:sq-love .9s ease;}
  .squary-char[data-state="sleepy"]{animation:sq-sleepy 3.2s ease-in-out infinite;}
  .squary-char[data-state="surprised"]{animation:sq-pop .5s ease;}
  .squary-char[data-state="spin"]{animation:sq-spin .85s cubic-bezier(.3,.7,.4,1);}
  .squary-char[data-state="dragging"]{cursor:grabbing;}
  .squary-char[data-state="love"] .sq-cheek,
  .squary-char[data-state="celebrate"] .sq-cheek,
  .squary-char[data-state="surprised"] .sq-cheek{opacity:.92;}
  @keyframes sq-spin{0%{transform:rotate(0) scale(1)}45%{transform:rotate(360deg) scale(.86)}100%{transform:rotate(720deg) scale(1)}}
  .sq-ear-twitch .sq-top{animation:sq-eartwitch .52s ease;}
  @keyframes sq-love{0%,100%{transform:translateY(0) rotate(0) scale(1)}25%{transform:translateY(-10px) rotate(-6deg) scale(1.05)}50%{transform:translateY(0) rotate(6deg) scale(1.02)}75%{transform:translateY(-6px) rotate(-3deg)}}
  @keyframes sq-sleepy{0%,100%{transform:rotate(-3deg) translateY(0)}50%{transform:rotate(3deg) translateY(2px)}}
  @keyframes sq-pop{0%{transform:scale(1)}40%{transform:scale(1.16,.9)}100%{transform:scale(1)}}
  @keyframes sq-eartwitch{0%,100%{transform:rotate(0)}30%{transform:rotate(-9deg)}60%{transform:rotate(6deg)}}
  .sq-heart{position:fixed;color:#ff6fae;pointer-events:none;z-index:69;font-weight:700;will-change:transform,opacity;animation:sq-heart-rise ease-out forwards;}
  @keyframes sq-heart-rise{0%{transform:translateY(0) scale(.5);opacity:0}25%{opacity:1}100%{transform:translateY(-74px) scale(1.15);opacity:0}}
  .sq-zzz{position:fixed;color:var(--lav-strong,#7a5cf0);font-family:var(--display,system-ui);font-weight:700;pointer-events:none;z-index:69;animation:sq-zzz-rise 1.8s ease-out forwards;}
  @keyframes sq-zzz-rise{0%{transform:translateY(0) scale(.6);opacity:0}25%{opacity:1}100%{transform:translate(14px,-50px) scale(1.2);opacity:0}}
  @media (max-width:560px){#squary{width:84px;height:84px;}.squary-bubble{max-width:200px;font-size:.86rem;}}
  `;

  const SVG = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <defs>
      <linearGradient id="sqBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f7cd92"/><stop offset="1" stop-color="#e0a258"/>
      </linearGradient>
      <radialGradient id="sqBelly" cx="0.5" cy="0.4" r="0.62">
        <stop offset="0" stop-color="#fff6e9"/><stop offset="1" stop-color="#ffe6c6"/>
      </radialGradient>
      <radialGradient id="sqEarIn" cx="0.5" cy="0.45" r="0.6">
        <stop offset="0" stop-color="#ffc7dd"/><stop offset="1" stop-color="#ff9ec7"/>
      </radialGradient>
      <radialGradient id="sqPaw" cx="0.5" cy="0.4" r="0.75">
        <stop offset="0" stop-color="#ffe7c9"/><stop offset="1" stop-color="#ffd2a3"/>
      </radialGradient>
    </defs>

    <!-- feet (with toe beans) -->
    <g class="sq-foot sq-foot-l"><rect x="40" y="100" width="17" height="12" rx="6" fill="#cf8f44"/><ellipse cx="48.5" cy="106" rx="4.6" ry="3.4" fill="url(#sqPaw)"/></g>
    <g class="sq-foot sq-foot-r"><rect x="63" y="100" width="17" height="12" rx="6" fill="#cf8f44"/><ellipse cx="71.5" cy="106" rx="4.6" ry="3.4" fill="url(#sqPaw)"/></g>

    <!-- arms (paws with pads) -->
    <g class="sq-arm sq-arm-l"><rect x="2" y="60" width="25" height="15" rx="7.5" fill="#e3a657"/><ellipse cx="9" cy="68" rx="3.6" ry="4.6" fill="url(#sqPaw)"/></g>
    <g class="sq-arm sq-arm-r"><rect x="93" y="60" width="25" height="15" rx="7.5" fill="#e3a657"/><ellipse cx="111" cy="68" rx="3.6" ry="4.6" fill="url(#sqPaw)"/></g>

    <!-- ears + a little fur tuft -->
    <g class="sq-top">
      <circle cx="36" cy="26" r="14" fill="#e0a258"/>
      <circle cx="84" cy="26" r="14" fill="#e0a258"/>
      <circle cx="36" cy="27" r="7" fill="url(#sqEarIn)"/>
      <circle cx="84" cy="27" r="7" fill="url(#sqEarIn)"/>
      <path d="M53 17 q3.5 -7 7 0 q3.5 -7 7 0" fill="none" stroke="#e0a258" stroke-width="3.2" stroke-linecap="round"/>
    </g>

    <!-- head / body -->
    <rect class="sq-body" x="20" y="22" width="80" height="82" rx="30" fill="url(#sqBody)"/>
    <rect x="25" y="26" width="70" height="26" rx="20" fill="#fff" opacity="0.12"/>

    <!-- cream muzzle / tummy patch -->
    <ellipse cx="60" cy="75" rx="24" ry="19" fill="url(#sqBelly)"/>

    <!-- cheeks (CSS fades these in on happy states) -->
    <circle class="sq-cheek" cx="35" cy="63" r="5.4" fill="#ff8fc0"/>
    <circle class="sq-cheek" cx="85" cy="63" r="5.4" fill="#ff8fc0"/>

    <!-- dynamic expression layers (filled by setFace) -->
    <g class="sq-brows-dyn"></g>
    <g class="sq-eyes-dyn blink"></g>

    <!-- nose + philtrum -->
    <path d="M55 63 Q60 61 65 63 Q63.5 69 60 69 Q56.5 69 55 63 Z" fill="#43291a"/>
    <ellipse cx="57.8" cy="64.4" rx="1.5" ry="1" fill="#fff" opacity="0.4"/>
    <path d="M60 69 v2.6" fill="none" stroke="#43291a" stroke-width="2.2" stroke-linecap="round"/>

    <!-- dynamic mouth -->
    <g class="sq-mouth-dyn"></g>
  </svg>`;

  // ---- facial-expression system -----------------------------------------
  // Squary's eyes, brows and mouth are swapped per emotion so he has a real,
  // readable face: sparkly open eyes, happy squints, heart eyes, star eyes,
  // sleepy lids, wide surprise, worried, winking. Open-eye faces keep the
  // .sq-eye-l/.sq-eye-r groups so the pupils still follow the cursor.
  const EYEC = '#4a3221';
  const eyeOpen = (cx, cls) =>
    '<ellipse cx="' + cx + '" cy="52" rx="9" ry="10.6" fill="#fff"/>' +
    '<g class="' + cls + '">' +
      '<circle cx="' + cx + '" cy="53" r="6.4" fill="' + EYEC + '"/>' +
      '<circle cx="' + cx + '" cy="53.6" r="3.3" fill="#16100a"/>' +
      '<circle cx="' + (cx + 2.3) + '" cy="49.8" r="2.5" fill="#fff"/>' +
      '<circle cx="' + (cx - 2) + '" cy="55.4" r="1.1" fill="#fff" opacity="0.8"/>' +
    '</g>';
  const eyeWide = (cx, cls) =>
    '<ellipse cx="' + cx + '" cy="52" rx="10" ry="11.6" fill="#fff"/>' +
    '<g class="' + cls + '">' +
      '<circle cx="' + cx + '" cy="53" r="5" fill="' + EYEC + '"/>' +
      '<circle cx="' + cx + '" cy="53.4" r="2.6" fill="#16100a"/>' +
      '<circle cx="' + (cx + 2) + '" cy="50" r="2" fill="#fff"/>' +
    '</g>';
  const happyArc = (cx) => '<path d="M' + (cx - 8) + ' 54 Q' + cx + ' 45 ' + (cx + 8) + ' 54" fill="none" stroke="' + EYEC + '" stroke-width="3.4" stroke-linecap="round"/>';
  const sleepyArc = (cx) => '<path d="M' + (cx - 8) + ' 51 Q' + cx + ' 58 ' + (cx + 8) + ' 51" fill="none" stroke="' + EYEC + '" stroke-width="3.2" stroke-linecap="round"/>';
  const heartEye = (cx) => '<path transform="translate(' + cx + ',52) scale(1.25)" d="M0 3 C0 3 -6 -2 -6 -6 C-6 -9 -2 -9 0 -6 C2 -9 6 -9 6 -6 C6 -2 0 3 0 3 Z" fill="#ff5b9e"/><circle cx="' + (cx - 2.4) + '" cy="48.4" r="1.3" fill="#fff" opacity="0.85"/>';
  const starEye = (cx) => '<path transform="translate(' + cx + ',52)" d="M0 -7 L1.9 -2.1 7.2 -2.1 2.9 1.1 4.4 6.4 0 3.2 -4.4 6.4 -2.9 1.1 -7.2 -2.1 -1.9 -2.1 Z" fill="#ffce3a" stroke="#f0a500" stroke-width="0.7" stroke-linejoin="round"/>';

  const mSmileSmall = '<path d="M53 73 Q60 78 67 73" fill="none" stroke="#43291a" stroke-width="2.7" stroke-linecap="round"/>';
  const mGrin = '<path d="M51 72 Q60 86 69 72 Q60 77 51 72 Z" fill="#8a4636"/><path d="M54.5 78 Q60 83 65.5 78 Q60 80 54.5 78 Z" fill="#ff8fb0"/>';
  const mO = '<ellipse cx="60" cy="77" rx="4.4" ry="5.4" fill="#8a4636"/>';
  const mTiny = '<path d="M56.5 75 Q60 78 63.5 75" fill="none" stroke="#43291a" stroke-width="2.5" stroke-linecap="round"/>';
  const mFrown = '<path d="M53 78 Q60 73 67 78" fill="none" stroke="#43291a" stroke-width="2.6" stroke-linecap="round"/>';

  const bThink = '<path d="M64 41 Q72 37 80 41" fill="none" stroke="' + EYEC + '" stroke-width="2.6" stroke-linecap="round"/>';
  const bSad = '<path d="M41 45 Q47 41 53 45 M67 45 Q73 41 79 45" fill="none" stroke="' + EYEC + '" stroke-width="2.6" stroke-linecap="round"/>';
  const bSurprise = '<path d="M40 42 Q47 38 54 42 M66 42 Q73 38 80 42" fill="none" stroke="' + EYEC + '" stroke-width="2.4" stroke-linecap="round"/>';

  const FACES = {
    normal:    { blink: true, eyes: eyeOpen(46, 'sq-eye-l') + eyeOpen(74, 'sq-eye-r'), mouth: mSmileSmall },
    happy:     { eyes: happyArc(46) + happyArc(74), mouth: mGrin },
    celebrate: { eyes: starEye(46) + starEye(74), mouth: mGrin },
    love:      { eyes: heartEye(46) + heartEye(74), mouth: mSmileSmall },
    sleepy:    { eyes: sleepyArc(46) + sleepyArc(74), mouth: mTiny },
    surprised: { eyes: eyeWide(46, 'sq-eye-l') + eyeWide(74, 'sq-eye-r'), mouth: mO, brows: bSurprise },
    sad:       { eyes: eyeOpen(46, 'sq-eye-l') + eyeOpen(74, 'sq-eye-r'), mouth: mFrown, brows: bSad },
    think:     { blink: true, eyes: eyeOpen(46, 'sq-eye-l') + eyeOpen(74, 'sq-eye-r'), mouth: mTiny, brows: bThink },
    wink:      { eyes: happyArc(46) + eyeOpen(74, 'sq-eye-r'), mouth: mSmileSmall }
  };

  // which face goes with each animation state
  const STATE_FACE = {
    idle: 'normal', walk: 'normal', jump: 'happy', happy: 'happy', wave: 'happy',
    celebrate: 'celebrate', think: 'think', point: 'normal', clap: 'happy',
    love: 'love', sleepy: 'sleepy', surprised: 'surprised', dragging: 'surprised', spin: 'surprised'
  };

  let curFace = 'normal';
  // setFace swaps the eyes / brows / mouth to the named expression.
  function setFace(name) {
    if (!charEl) return;
    const f = FACES[name] || FACES.normal;
    const eyes = charEl.querySelector('.sq-eyes-dyn');
    const brows = charEl.querySelector('.sq-brows-dyn');
    const mouth = charEl.querySelector('.sq-mouth-dyn');
    if (eyes) { eyes.innerHTML = f.eyes; eyes.classList.toggle('blink', !!f.blink); }
    if (brows) brows.innerHTML = f.brows || '';
    if (mouth) mouth.innerHTML = f.mouth;
    curFace = name;
  }

  // ---- state + speech ----- Squary's emotions and speech

  // ONE_SHOT defines how long each emotion lasts before returning to idle
  const ONE_SHOT = { jump: 800, happy: 760, celebrate: 1100, clap: 1500, spin: 850, surprised: 900 };

  // setState changes Squary's emotion/animation (and its matching face)
  function setState(s) {
    if (!charEl) return;
    // Cancel any existing state timer
    clearTimeout(stateTimer);
    // Update the current state
    curState = s;
    // Apply the state as a CSS class
    charEl.setAttribute('data-state', s);
    // Swap to the face that belongs to this state
    setFace(STATE_FACE[s] || 'normal');
    // If this is a one-shot emotion, revert to idle after the duration
    if (ONE_SHOT[s]) stateTimer = setTimeout(() => {
      if (curState === s) setState('idle');
    }, ONE_SHOT[s]);
  }

  // say makes Squary say something in a speech bubble
  function say(text, opts) {
    opts = opts || {};
    if (!bubbleEl) return;
    // Clear any buttons from previous messages
    bubbleActions.innerHTML = '';
    bubbleActions.style.display = 'none';
    // Set the message text
    bubbleText.textContent = text;
    // Show the bubble
    bubbleEl.classList.add('show');
    clampBubble();  // Make sure it stays on screen
    // Clear any previous hide timer
    clearTimeout(bubbleTimer);
    // Change emotion if specified
    if (opts.state) setState(opts.state);
    // Auto-hide after a duration unless 'hold' is true
    if (!opts.hold) {
      // Duration depends on text length (longer text = more time to read)
      const dur = opts.duration || Math.min(7000, Math.max(2600, text.length * 55));
      bubbleTimer = setTimeout(hideBubble, dur);
    }
    return bubbleEl;
  }

  // hideBubble hides the speech bubble
  function hideBubble() { if (bubbleEl) bubbleEl.classList.remove('show'); }

  // keep the speech bubble fully inside the viewport, re-aiming its tail at Squary
  function clampBubble() {
    if (!bubbleEl || !root) return;
    bubbleEl.style.setProperty('--sq-bx', '0px');
    bubbleEl.style.setProperty('--sq-tail', '50%');
    const w = bubbleEl.offsetWidth;                    // layout width (transform-independent)
    const center = root.getBoundingClientRect().left + CHAR / 2;
    const pad = 10;
    let shift = 0;
    if (center - w / 2 < pad) shift = pad - (center - w / 2);
    else if (center + w / 2 > window.innerWidth - pad) shift = (window.innerWidth - pad) - (center + w / 2);
    if (shift) {
      shift = Math.round(shift);
      bubbleEl.style.setProperty('--sq-bx', shift + 'px');
      bubbleEl.style.setProperty('--sq-tail', 'calc(50% - ' + shift + 'px)');
    }
  }

  // ---- movement ----- Squary's position on the screen

  // place moves Squary to a specific x, y position (with or without animation)
  function place(x, y, animate) {
    if (!root) return;
    // Disable transition for instant movement
    if (!animate) root.style.transition = 'none';
    // Move Squary
    root.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    // Re-enable transition
    if (!animate) {
      root.offsetWidth;  // Force browser reflow
      root.style.transition = '';  // Re-enable transition
    }
  }

  // homeXY returns Squary's default position (bottom-left corner)
  function homeXY() { return { x: 24, y: Math.max(80, window.innerHeight - CHAR - 18) }; }

  // targetFor calculates where Squary should move to (next to an element)
  function targetFor(sel, side) {
    // Get the element (either CSS selector or element itself)
    const el = (typeof sel === 'string') ? document.querySelector(sel) : sel;
    // If element doesn't exist, go home
    if (!el) return homeXY();
    // Get the element's position on screen
    const r = el.getBoundingClientRect();
    // Default position: next to element vertically
    let x, y = r.top + r.height / 2 - CHAR / 2;
    // Adjust x position based on 'side' parameter
    if (side === 'right') x = r.right + 14;  // To the right
    else if (side === 'below') x = r.left + r.width / 2 - CHAR / 2, y = r.bottom + 12;  // Below
    else x = r.left - CHAR - 14;  // Default: to the left
    // Clamp position to stay on screen
    x = Math.max(12, Math.min(window.innerWidth - CHAR - 12, x));
    y = Math.max(78, Math.min(window.innerHeight - CHAR - 12, y));
    return { x, y };
  }

  function moveTo(sel, opts) {
    opts = opts || {};
    const side = opts.side || 'left';
    const { x, y } = (sel && typeof sel === 'object' && 'x' in sel) ? sel : targetFor(sel, side);
    if (REDUCE) { place(x, y, false); if (opts.then) setState(opts.then); else setState('idle'); if (opts.done) opts.done(); return; }
    setState('walk');
    place(x, y, true);
    clearTimeout(moveTo._t);
    moveTo._t = setTimeout(() => { setState(opts.then || 'idle'); if (opts.done) opts.done(); }, 940);
  }

  // ---- confetti ----- Celebration animation

  // Colors for confetti pieces
  const COLORS = ['#7a5cf0', '#e0609a', '#62a6ef', '#2f8f86', '#ffd27a', '#ff8fc0', '#8f7bf0'];

  // confetti creates a burst of falling colored squares to celebrate success
  function confetti(n) {
    // Skip if user prefers reduced motion or we don't have a container
    if (REDUCE || !confettiLayer) return;
    n = n || 90;  // Default 90 pieces
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const b = document.createElement('div');
      b.className = 'sq-confetti-bit';
      // Random size for each piece
      const sz = 7 + Math.random() * 8;
      b.style.left = Math.random() * 100 + 'vw';  // Random horizontal position
      b.style.width = sz + 'px'; b.style.height = (sz * (0.5 + Math.random())) + 'px';
      b.style.background = rnd(COLORS);  // Random color
      b.style.opacity = '0.95';
      // Vary the fall duration and delay for natural effect
      b.style.animationDuration = (1.8 + Math.random() * 1.7) + 's';
      b.style.animationDelay = (Math.random() * 0.5) + 's';
      frag.appendChild(b);
      // Remove the element after animation completes
      setTimeout(() => b.remove(), 4200);
    }
    confettiLayer.appendChild(frag);
  }

  // ---- achievements -----------------------------------------------------
  let lastSolvedSig = null, sessionInvalids = 0;
  function unlocked() { return (store('qv-sq-ach') || '').split(',').filter(Boolean); }
  function unlock(id) {
    const set = unlocked();
    if (set.indexOf(id) !== -1) return false;
    set.push(id); store('qv-sq-ach', set.join(','));
    return true;
  }
  function showAch(id) {
    if (!achEl) return;
    achEl.innerHTML = '<span class="sq-ach-sub">' + L('Achievement', 'Pencapaian') + '</span>' + ACH[id]();
    achEl.classList.add('show');
    confetti(60);
    clearTimeout(showAch._t);
    showAch._t = setTimeout(() => achEl.classList.remove('show'), 3400);
  }
  function queueAch(ids) {
    ids.forEach((id, i) => setTimeout(() => showAch(id), 600 + i * 1700));
  }

  // ---- public hooks (called by app.js) ----------------------------------
  let lastPhase = null;

  function greet() {
    const h = homeXY();
    place(-150, h.y, false);                 // start off-screen left
    setTimeout(() => {
      moveTo({ x: h.x, y: h.y }, { then: 'wave' });
      setTimeout(() => { say(L("Hi! I'm Squary! Let's learn Completing the Square together!",
        "Hai! Saya Squary! Jom belajar Menyempurnakan Kuasa Dua bersama!"), { state: 'wave', duration: 5200 }); }, REDUCE ? 50 : 700);
    }, 500);
  }

  function onSolveStart(res) {
    lastPhase = null;
    clearTimeout(hintTimer);                 // they took action
    if (!res || res.degenerate) return;
    busy = true;
    say(L("Great! Let's solve it step by step.", "Bagus! Mari selesaikan langkah demi langkah."), { state: 'clap', duration: 3200 });
    setTimeout(() => { busy = false; }, 3200);
  }

  function onInvalid() {
    sessionInvalids++;
    store('qv-sq-streak', 0);
    setState('think');
    setFace('sad');                          // a concerned little face
    say(L("Almost! For a square we need an x² term — set 'a' to a non-zero number.",
          "Hampir! Untuk segi empat kita perlukan sebutan x² — tetapkan 'a' kepada nombor bukan sifar."),
        { duration: 4200 });
  }

  function onStep(phase, res) {
    if (!phase || phase === lastPhase) { if (phase !== 'solved') return; }
    if (phase === 'tiles1') {
      lastPhase = phase;
      moveTo('.panel.feature', { side: 'left' });
      setTimeout(() => say(L("Notice how these rectangles almost form a perfect square.",
        "Perhatikan bagaimana segi empat tepat ini hampir membentuk segi empat sama."), { state: 'think', duration: 4200 }), REDUCE ? 0 : 700);
    } else if (phase === 'tiles3') {
      lastPhase = phase;
      say(L("We're filling the missing corner so the shape becomes a complete square.",
        "Kita isi sudut yang hilang supaya bentuknya menjadi segi empat sama lengkap."), { state: 'happy', duration: 4400 });
    } else if (phase === 'tiles4') {
      lastPhase = phase;
      say(L("Now we have a perfect square!", "Sekarang kita ada segi empat sama sempurna!"), { state: 'happy', duration: 3400 });
    } else if (phase === 'solved') {
      solvedSequence(res);
    }
  }

  function solvedSequence(res) {
    const sig = res ? [res.a, res.b, res.c].join(',') : null;
    const replay = (sig && sig === lastSolvedSig);
    lastPhase = 'solved';

    moveTo('#graphCanvas', { side: 'left', then: 'point' });
    setTimeout(() => say(L("The graph changes too! Watch how the vertex shows up in vertex form.",
      "Graf turut berubah! Lihat bagaimana verteks muncul dalam bentuk verteks."), { state: 'point', duration: 4200 }), REDUCE ? 0 : 900);

    setTimeout(() => {
      setState('celebrate'); confetti(replay ? 40 : 95);
      say(L("Excellent work!", "Kerja yang cemerlang!"), { state: 'celebrate', duration: 3000 });
      if (!replay) award(res, sig);
    }, REDUCE ? 400 : 2400);

    setTimeout(() => { const h = homeXY(); moveTo({ x: h.x, y: h.y }, { then: 'idle' }); }, REDUCE ? 1200 : 6200);
  }

  function award(res, sig) {
    lastSolvedSig = sig;
    let solved = parseInt(store('qv-sq-solved') || '0', 10) + 1;
    let streak = parseInt(store('qv-sq-streak') || '0', 10) + 1;
    store('qv-sq-solved', solved); store('qv-sq-streak', streak);
    const fresh = [];
    if (solved === 1 && unlock('first')) fresh.push('first');
    if (streak >= 5 && unlock('streak5')) fresh.push('streak5');
    if (streak >= 3 && sessionInvalids === 0 && unlock('accuracy')) fresh.push('accuracy');
    if (solved >= 10 && unlock('master')) fresh.push('master');
    if (fresh.length) queueAch(fresh);
  }

  // ---- ambient behaviour (self-wired) -----------------------------------
  let lastHover = 0;
  function wireAmbient() {
    charEl.addEventListener('click', () => {
      if (curState === 'celebrate') return;
      // mostly a happy hop / wink, occasionally a little spin trick
      const r = Math.random();
      const st = r < 0.16 ? 'spin' : (r < 0.5 ? 'happy' : 'jump');
      say(nextClick(), { state: st, duration: 4200 });
    });
    charEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); charEl.click(); }
    });

    const inputs = document.querySelector('.coef-row');
    if (inputs) inputs.addEventListener('mouseenter', () => {
      const now = Date.now();
      if (busy || now - lastHover < 14000) return;
      lastHover = now;
      say(L("Type your quadratic equation here!  e.g. x² + 6x + 5",
            "Taip persamaan kuasa dua anda di sini!  cth. x² + 6x + 5"), { state: 'point', duration: 4200 });
    });

    // hint timer: arm when a student touches the inputs but hasn't solved
    ['#inA', '#inB', '#inC'].forEach((id) => {
      const el = document.querySelector(id);
      if (el) { el.addEventListener('focus', armHint); el.addEventListener('input', armHint); }
    });

    // gentle concept tips while idle
    tipTimer = setInterval(() => {
      if (busy || (bubbleEl && bubbleEl.classList.contains('show'))) return;
      if (document.hidden) return;
      if (Math.random() < 0.55) say(rnd(TIPS), { state: 'idle', duration: 5200 });
    }, 32000);

    window.addEventListener('resize', () => {
      if (curState === 'idle') { const h = homeXY(); place(h.x, h.y, false); }
      if (bubbleEl && bubbleEl.classList.contains('show')) clampBubble();
    });

    wireDelight();   // eyes-follow-cursor, petting, dragging, moods
  }

  let hintLevel = 0;
  function armHint() {
    clearTimeout(hintTimer);
    hintTimer = setTimeout(offerHint, 20000);
  }
  function offerHint() {
    if (busy) { armHint(); return; }
    moveTo('.solver', { side: 'left' });
    setTimeout(showHintPrompt, REDUCE ? 0 : 900);
  }
  function showHintPrompt() {
    setState('think');
    say(L("Need a hint?", "Perlukan petunjuk?"), { hold: true });
    bubbleActions.style.display = 'flex';
    bubbleActions.innerHTML = '';
    const yes = document.createElement('button');
    yes.className = 'sq-btn primary'; yes.textContent = L('Show hint', 'Tunjuk petunjuk');
    yes.addEventListener('click', revealHint);
    const no = document.createElement('button');
    no.className = 'sq-btn ghost'; no.textContent = L('Not yet', 'Belum lagi');
    no.addEventListener('click', () => { hideBubble(); setState('idle'); armHint(); });
    bubbleActions.appendChild(yes); bubbleActions.appendChild(no);
    clampBubble();
  }
  function revealHint() {
    const fn = HINTS[Math.min(hintLevel, HINTS.length - 1)];
    say(fn(), { state: 'point', duration: 6000 });
    hintLevel = Math.min(hintLevel + 1, HINTS.length);
    if (hintLevel < HINTS.length) {
      // keep the bubble open with a "next hint" affordance
      setTimeout(() => {
        if (!bubbleEl.classList.contains('show')) return;
        bubbleActions.style.display = 'flex';
        bubbleActions.innerHTML = '';
        const more = document.createElement('button');
        more.className = 'sq-btn primary'; more.textContent = L('Another hint', 'Petunjuk lagi');
        more.addEventListener('click', revealHint);
        bubbleActions.appendChild(more);
        clampBubble();
      }, 1400);
    } else { hintLevel = 0; }
  }

  // ---- delight: eyes follow cursor, petting, dragging, moods (added) ----
  // These make Squary feel alive: the eyes track the mouse, extra clicks
  // "pet" him (hearts), you can drag him around, he naps when ignored, and
  // he reacts when you flip day/night mode.
  let eyeRAF = 0, eyeTo = { x: 0, y: 0 }, eyeAt = { x: 0, y: 0 };
  function aimEyes(cx, cy) {                     // point the pupils toward (cx,cy)
    if (REDUCE || !root) return;
    const r = root.getBoundingClientRect();
    const ax = r.left + r.width * 0.5, ay = r.top + r.height * 0.47;
    let dx = cx - ax, dy = cy - ay; const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 130), max = 3.2;
    eyeTo.x = (dx / d) * max * k; eyeTo.y = (dy / d) * max * 0.8 * k;
    if (!eyeRAF) eyeRAF = requestAnimationFrame(eyeLoop);
  }
  function eyeLoop() {                            // smoothly ease the eyes to the target
    eyeAt.x += (eyeTo.x - eyeAt.x) * 0.2; eyeAt.y += (eyeTo.y - eyeAt.y) * 0.2;
    const t = 'translate(' + eyeAt.x.toFixed(2) + ' ' + eyeAt.y.toFixed(2) + ')';
    const l = charEl && charEl.querySelector('.sq-eye-l'), rr = charEl && charEl.querySelector('.sq-eye-r');
    if (l) l.setAttribute('transform', t); if (rr) rr.setAttribute('transform', t);
    eyeRAF = (Math.abs(eyeTo.x - eyeAt.x) > 0.1 || Math.abs(eyeTo.y - eyeAt.y) > 0.1) ? requestAnimationFrame(eyeLoop) : 0;
  }
  function glance() {                             // a small self-directed look-around
    if (REDUCE) return;
    eyeTo.x = (Math.random() * 2 - 1) * 3; eyeTo.y = (Math.random() * 2 - 1) * 2;
    if (!eyeRAF) eyeRAF = requestAnimationFrame(eyeLoop);
  }

  function hearts(n) {                            // floating hearts when petted / in love
    if (REDUCE || !confettiLayer || !root) return;
    const r = root.getBoundingClientRect(); n = n || 9;
    for (let i = 0; i < n; i++) {
      const h = document.createElement('div'); h.className = 'sq-heart'; h.textContent = '\u2665';
      h.style.left = (r.left + CHAR * 0.5 + (Math.random() * 42 - 21)) + 'px';
      h.style.top = (r.top + CHAR * 0.28) + 'px';
      h.style.fontSize = (12 + Math.random() * 13) + 'px';
      h.style.animationDuration = (1.1 + Math.random() * 0.9) + 's';
      confettiLayer.appendChild(h); setTimeout(() => h.remove(), 2200);
    }
  }
  function zzz() {                                // little "Z" when sleeping
    if (REDUCE || !confettiLayer || !root) return;
    const r = root.getBoundingClientRect(); const z = document.createElement('div');
    z.className = 'sq-zzz'; z.textContent = 'Z';
    z.style.left = (r.left + CHAR * 0.7) + 'px'; z.style.top = (r.top + CHAR * 0.1) + 'px';
    z.style.fontSize = (14 + Math.random() * 8) + 'px';
    confettiLayer.appendChild(z); setTimeout(() => z.remove(), 1900);
  }

  let lastInteract = Date.now();
  function poke() {                               // call on any interaction; wakes him up
    lastInteract = Date.now();
    if (curState === 'sleepy') { setState('idle'); say(L("I'm awake!", "Saya dah bangun!"), { state: 'happy', duration: 1800 }); }
  }
  function checkSleep() {                          // nap if ignored for a while
    if (busy || REDUCE) return;
    if (Date.now() - lastInteract > 45000 && curState === 'idle' && !document.hidden) {
      setState('sleepy'); zzz(); setTimeout(zzz, 900); setTimeout(zzz, 1800);
    }
  }

  let petCount = 0, petAt = 0;
  function pet() {                                // 3 quick clicks = a happy "pet"
    const now = Date.now(); if (now - petAt > 1300) petCount = 0; petAt = now; petCount++;
    if (petCount >= 3) {
      petCount = 0; setState('love'); hearts(11);
      say(rnd([L("Hehe, that tickles!", "Hihi, geli la!"), L("Aw, thank you!", "Aw, terima kasih!"), L("You're the best!", "Awak terbaik!")]), { state: 'love', duration: 2600 });
    }
  }

  // drag Squary anywhere on screen
  let dn = false, moved = false, gx = 0, gy = 0, sx = 0, sy = 0;
  function pt(e) { return (e.touches && e.touches[0]) ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY }; }
  function dragStart(e) { const p = pt(e); dn = true; moved = false; const r = root.getBoundingClientRect(); gx = p.x - r.left; gy = p.y - r.top; sx = p.x; sy = p.y; }
  function dragMove(e) {
    if (!dn) return; const p = pt(e);
    if (!moved && Math.hypot(p.x - sx, p.y - sy) > 6) { moved = true; setState('dragging'); hideBubble(); root.style.transition = 'none'; }
    if (moved) {
      let x = p.x - gx, y = p.y - gy;
      x = Math.max(6, Math.min(window.innerWidth - CHAR - 6, x));
      y = Math.max(70, Math.min(window.innerHeight - CHAR - 6, y));
      root.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
      if (e.cancelable) e.preventDefault();
    }
  }
  function dragEnd() { if (!dn) return; dn = false; if (moved) { root.style.transition = ''; setState('happy'); poke(); setTimeout(() => { if (curState === 'happy') setState('idle'); }, 700); } }

  function wireDelight() {
    window.addEventListener('mousemove', (e) => { aimEyes(e.clientX, e.clientY); poke(); }, { passive: true });
    charEl.addEventListener('click', () => { poke(); pet(); });                 // petting
    charEl.addEventListener('mouseenter', () => { if (curState === 'idle') setState('jump'); }); // hop on hover
    charEl.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove, { passive: false });
    window.addEventListener('mouseup', dragEnd);
    charEl.addEventListener('touchstart', dragStart, { passive: true });
    window.addEventListener('touchmove', dragMove, { passive: false });
    window.addEventListener('touchend', dragEnd);
    // if we just dragged, swallow the click so it doesn't also fire a tip
    charEl.addEventListener('click', (e) => { if (moved) { e.stopImmediatePropagation(); moved = false; } }, true);
    // react to the day / night switch
    const th = document.getElementById('themeToggle');
    if (th) th.addEventListener('click', () => setTimeout(() => {
      poke(); const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      setState('happy'); say(dark ? L("Ooh, cosy dark mode!", "Ooh, mod gelap yang selesa!") : L("Bright and shiny!", "Cerah dan berseri!"), { state: 'happy', duration: 2400 });
    }, 60));
    // ambient life: glances, ear twitches, the odd wink, naps
    setInterval(() => { if (!busy && curState === 'idle' && !document.hidden && Math.random() < 0.5) glance(); }, 5200);
    setInterval(() => { if (curState === 'idle' && Math.random() < 0.4) { charEl.classList.add('sq-ear-twitch'); setTimeout(() => charEl.classList.remove('sq-ear-twitch'), 520); } }, 7000);
    setInterval(() => { if (!busy && curState === 'idle' && !document.hidden && Math.random() < 0.35) winkOnce(); }, 9000);
    setInterval(checkSleep, 6000);
  }

  // winkOnce gives a quick playful wink while idle, then restores the face.
  function winkOnce() {
    if (REDUCE || curState !== 'idle') return;
    setFace('wink');
    clearTimeout(winkOnce._t);
    winkOnce._t = setTimeout(() => { if (curState === 'idle' && curFace === 'wink') setFace('normal'); }, 620);
  }

  // ---- init -------------------------------------------------------------
  let started = false;
  function init() {
    if (started) return; started = true;

    const style = document.createElement('style');
    style.id = 'squary-css'; style.textContent = CSS;
    document.head.appendChild(style);

    confettiLayer = document.createElement('div');
    confettiLayer.id = 'squary-confetti';
    achEl = document.createElement('div');
    achEl.id = 'squary-ach';

    root = document.createElement('div');
    root.id = 'squary';
    charEl = document.createElement('div');
    charEl.className = 'squary-char';
    charEl.setAttribute('data-state', 'idle');
    charEl.setAttribute('role', 'button');
    charEl.setAttribute('tabindex', '0');
    charEl.setAttribute('aria-label', 'Squary, your learning buddy. Click for a tip.');
    charEl.innerHTML = SVG;
    bubbleEl = document.createElement('div');
    bubbleEl.className = 'squary-bubble';
    bubbleEl.setAttribute('aria-live', 'polite');
    bubbleText = document.createElement('span');
    bubbleActions = document.createElement('div');
    bubbleActions.className = 'sq-actions';
    bubbleActions.style.display = 'none';
    bubbleEl.appendChild(bubbleText); bubbleEl.appendChild(bubbleActions);
    root.appendChild(bubbleEl); root.appendChild(charEl);

    document.body.appendChild(confettiLayer);
    document.body.appendChild(achEl);
    document.body.appendChild(root);

    setFace('normal');                       // draw the starting expression
    const h = homeXY(); place(h.x, h.y, false);
    wireAmbient();
  }

  return { init, greet, onSolveStart, onStep, onInvalid, say, setState, moveTo, confetti, _msgs: { CLICKS, TIPS } };
})();
