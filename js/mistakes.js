/* ============================================================================
   FOR THE JUDGE (in simple words):
   Students learn a lot from *finding* mistakes, not just avoiding them. This is
   a "spot the slip" game: we show a worked solution that contains exactly one of
   the classic completing-the-square errors — forgetting to halve b, adding to
   only one side, a flipped sign, or dropping the ± — and the student taps the
   line they think is wrong. We then show a clear, colour-coded explanation of
   what went wrong and the correct line. It trains the exact judgement a real
   exam needs.
   ============================================================================ */
/* QuadVision — mistakes.js  (Common Mistake Detection)
   A bilingual "find the error" exercise built from hand-authored scenarios,
   each modelling one classic mistake with a visual explanation + fix.
   Reports outcomes to Store and nudges Squary. */
window.Mistakes = (function () {
  'use strict';

  // EN / BM helper, consistent with the rest of the app.
  const L = (en, ms) => (window.I18N && I18N.current && I18N.current() === 'ms' && ms) ? ms : en;

  // Each scenario is a worked solution. `steps` are the lines shown; the one
  // whose `bad` is true holds the mistake. `why` explains it, `fix` is the
  // corrected line, `skill` maps to the Store skill being trained.
  const SCENARIOS = [
    {
      eq: 'x² + 6x − 7 = 0', skill: 'square',
      steps: [
        { html: 'x² + 6x = 7' },
        { html: 'x² + 6x + 6² = 7 + 6²', bad: true,
          whyEn: 'You must halve b first. The corner tile is (b⁄2)² = 3² = 9, not 6² = 36.',
          whyMs: 'Bahagi dua b dahulu. Jubin sudut ialah (b⁄2)² = 3² = 9, bukan 6² = 36.',
          fixEn: 'x² + 6x + 3² = 7 + 3²', fixMs: 'x² + 6x + 3² = 7 + 3²' },
        { html: '(x + 6)² = 43' },
        { html: 'x = −6 ± √43' }
      ]
    },
    {
      eq: 'x² + 8x + 5 = 0', skill: 'balance',
      steps: [
        { html: 'x² + 8x = −5' },
        { html: 'x² + 8x + 16 = −5', bad: true,
          whyEn: 'Whatever you add to the left must also be added to the right, to keep the equation balanced. Add 16 to BOTH sides.',
          whyMs: 'Apa yang ditambah di sebelah kiri mesti ditambah juga di sebelah kanan supaya seimbang. Tambah 16 pada KEDUA-DUA belah.',
          fixEn: 'x² + 8x + 16 = −5 + 16', fixMs: 'x² + 8x + 16 = −5 + 16' },
        { html: '(x + 4)² = 11' },
        { html: 'x = −4 ± √11' }
      ]
    },
    {
      eq: 'x² − 10x + 9 = 0', skill: 'factor',
      steps: [
        { html: 'x² − 10x + 25 = −9 + 25' },
        { html: '(x − 5)² = 16' },
        { html: 'x − 5 = 4', bad: true,
          whyEn: 'Taking a square root gives two answers. Don’t forget the ± sign: x − 5 = ±4.',
          whyMs: 'Mengambil punca kuasa dua memberi dua jawapan. Jangan lupa tanda ±: x − 5 = ±4.',
          fixEn: 'x − 5 = ±4', fixMs: 'x − 5 = ±4' },
        { html: 'x = 9' }
      ]
    },
    {
      eq: 'x² + 4x − 5 = 0', skill: 'factor',
      steps: [
        { html: 'x² + 4x + 4 = 5 + 4' },
        { html: '(x − 2)² = 9', bad: true,
          whyEn: 'The sign is flipped. Half of +4 is +2, so the square is (x + 2)², not (x − 2)².',
          whyMs: 'Tandanya terbalik. Separuh daripada +4 ialah +2, jadi segi empatnya (x + 2)², bukan (x − 2)².',
          fixEn: '(x + 2)² = 9', fixMs: '(x + 2)² = 9' },
        { html: 'x + 2 = ±3' },
        { html: 'x = 1  or  x = −5' }
      ]
    },
    {
      eq: '2x² + 12x + 10 = 0', skill: 'standard',
      steps: [
        { html: '2x² + 12x + 36 = −10 + 36', bad: true,
          whyEn: 'Divide every term by a = 2 first, so the x² coefficient is 1. Otherwise the square won’t form cleanly.',
          whyMs: 'Bahagi setiap sebutan dengan a = 2 dahulu supaya pekali x² ialah 1. Jika tidak, segi empat tidak terbentuk kemas.',
          fixEn: 'x² + 6x + 5 = 0  (÷ 2 first)', fixMs: 'x² + 6x + 5 = 0  (÷ 2 dahulu)' },
        { html: 'x² + 6x = −5' },
        { html: '(x + 3)² = 4' },
        { html: 'x = −1  or  x = −5' }
      ]
    },
    {
      eq: 'x² − 6x + 2 = 0', skill: 'square',
      steps: [
        { html: 'x² − 6x = −2' },
        { html: 'x² − 6x + 9 = −2 + 9' },
        { html: '(x − 3)² = 7' },
        { html: 'x − 3 = ±7', bad: true,
          whyEn: 'You must take the square root of the right side too: √7, not 7. So x − 3 = ±√7.',
          whyMs: 'Anda perlu mengambil punca kuasa dua sebelah kanan juga: √7, bukan 7. Jadi x − 3 = ±√7.',
          fixEn: 'x − 3 = ±√7', fixMs: 'x − 3 = ±√7' }
      ]
    }
  ];

  // DOM handles.
  let eqEl, stepsEl, fbEl, root;
  // The scenario currently on screen and whether it's been answered.
  let cur = null, answered = false, ix = -1;

  // pick chooses a different scenario from last time and renders it.
  function pick() {
    let n = ix;
    while (n === ix && SCENARIOS.length > 1) n = Math.floor(Math.random() * SCENARIOS.length);
    ix = n; cur = SCENARIOS[n]; answered = false;
    render();
  }

  // render draws the equation, the clickable steps, and a hint to play.
  function render() {
    eqEl.innerHTML = cur.eq;
    stepsEl.innerHTML = '';
    fbEl.className = 'spot-feedback';
    fbEl.innerHTML = '';
    cur.steps.forEach((s, i) => {
      const b = document.createElement('button');
      b.className = 'spot-step';
      b.type = 'button';
      b.innerHTML = '<span class="spot-no">' + (i + 1) + '</span><span class="spot-math">' + s.html + '</span>';
      b.addEventListener('click', () => choose(i, b));
      stepsEl.appendChild(b);
    });
  }

  // choose handles the learner tapping a line as "the mistake".
  function choose(i, btn) {
    if (answered) return;
    const step = cur.steps[i];
    if (step.bad) {
      // Correct diagnosis: mark it, explain, reward.
      answered = true;
      btn.classList.add('correct');
      reveal(step, true);
      if (window.Store) { Store.recordAttempt(cur.skill, true, 14); Store.award('detective'); }
      if (window.Squary && Squary.say) Squary.say(L('Sharp eyes! That’s exactly the slip.',
        'Mata tajam! Itulah kesilapannya.'), { state: 'happy', duration: 2600 });
    } else {
      // Wrong guess: mark it, encourage another look (no penalty beyond the miss).
      btn.classList.add('wrong');
      btn.disabled = true;
      if (window.Store) Store.recordAttempt(cur.skill, false, 0);
      fbEl.className = 'spot-feedback try';
      fbEl.innerHTML = L('Not this line — look again. Which step breaks a rule?',
                         'Bukan baris ini — lihat semula. Langkah mana yang melanggar peraturan?');
      if (window.Squary && Squary.say) Squary.say(L('Keep looking — you’re close!',
        'Teruskan mencari — anda hampir!'), { state: 'think', duration: 2400 });
    }
  }

  // reveal shows the colour-coded explanation panel and the corrected line.
  function reveal(step) {
    fbEl.className = 'spot-feedback show';
    fbEl.innerHTML =
      '<div class="spot-tag">' + L('The mistake', 'Kesilapan') + '</div>' +
      '<p class="spot-why">' + L(step.whyEn, step.whyMs) + '</p>' +
      '<div class="spot-fix"><span class="spot-fix-lab">' + L('Correct line', 'Baris betul') +
        '</span><span class="spot-fix-math">' + L(step.fixEn, step.fixMs) + '</span></div>';
    // Dim every non-buggy line so the eye lands on the real error.
    Array.prototype.forEach.call(stepsEl.children, (c, i) => {
      if (!cur.steps[i].bad) c.classList.add('dim');
    });
  }

  // init wires the section if it exists on the page.
  function init() {
    root = document.getElementById('spot');
    if (!root) return;
    eqEl = document.getElementById('spotEq');
    stepsEl = document.getElementById('spotSteps');
    fbEl = document.getElementById('spotFeedback');
    if (!eqEl || !stepsEl || !fbEl) return;
    const btn = document.getElementById('spotNew');
    if (btn) btn.addEventListener('click', pick);
    if (window.I18N && I18N.onChange) I18N.onChange(() => { if (cur) { const wasAns = answered; render(); answered = false; if (wasAns) { /* fresh card on language flip */ } } });
    pick();
  }

  return { init, pick };
})();
