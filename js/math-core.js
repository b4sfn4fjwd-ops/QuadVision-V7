/* ============================================================================
   FOR THE JUDGE (in simple words):
   This file is the "brain" that does the actual algebra. You give it the three
   numbers a, b and c. It works out the answers (the roots), checks how many
   answers there are (the discriminant), finds the lowest/highest point of the
   curve (the vertex), and writes out the neat step-by-step "completing the
   square" working. It only does maths — it never touches the screen.
   ============================================================================ */
/* QuadVision — math-core.js
   Pure math: solving, exact surd/fraction simplification, and the
   step-by-step "completing the square" walkthrough.
   No DOM here. Everything returns plain data / HTML strings. */
window.MathCore = (function () {
  'use strict';

  // EPS is used to handle tiny rounding errors (0.000000001)
  const EPS = 1e-9;
  // isInt checks if a number is basically an integer (ignoring tiny floating point errors)
  const isInt = (x) => Number.isFinite(x) && Math.abs(x - Math.round(x)) < EPS;

  // gcd finds the greatest common divisor (used to simplify fractions)
  function gcd(a, b) {
    // Make both numbers positive and round them
    a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
    // Keep swapping and dividing until b becomes 0
    while (b) { [a, b] = [b, a % b]; }
    // Return the result (at least 1)
    return a || 1;
  }

  // simplifyFraction reduces a fraction n/d to its simplest form (like 4/6 → 2/3)
  function simplifyFraction(n, d) {
    // If denominator is 0, return as-is (prevent division by zero)
    if (d === 0) return [n, 0];
    // If denominator is negative, flip both signs so denominator is always positive
    if (d < 0) { n = -n; d = -d; }
    // If both are integers, divide both by their greatest common divisor
    if (isInt(n) && isInt(d)) { const g = gcd(n, d); return [Math.round(n) / g, Math.round(d) / g]; }
    // If they're not integers, return them unchanged
    return [n, d];
  }

  // simplifySqrt breaks down a square root into simpler form. For example: √12 = 2√3
  function simplifySqrt(n) {
    // Round the input to the nearest integer
    n = Math.round(n);
    // Negative numbers have no real square root, so return [0, 0]
    if (n < 0) return [0, 0];
    // k will be the coefficient outside the root, m will be the number inside
    let k = 1, m = n;
    // Loop through all possible divisors
    for (let i = 2; i * i <= m; i++) {
      // If i² divides m evenly, extract it out front
      while (m % (i * i) === 0) { m /= (i * i); k *= i; }
    }
    // Return as [coefficient, value_under_root], e.g., [2, 3] for 2√3
    return [k, m];
  }

  // num converts a number to a nicely formatted string (rounded to 3 decimal places by default)
  function num(x, dp = 3) {
    // If it's not a real number, show a dash
    if (!Number.isFinite(x)) return '—';
    // If it's basically an integer, show it without decimals
    if (isInt(x)) return String(Math.round(x));
    // Otherwise, format to dp decimal places and remove trailing zeros
    let s = x.toFixed(dp).replace(/\.?0+$/, '');
    return s;
  }

  // ---- HTML fragments ----- These create fancy math symbols for display on the page

  // frac creates a nice-looking fraction (numerator over denominator)
  function frac(n, d) {
    // If denominator is 1, just show the numerator
    if (d === 1) return num(n);
    // Otherwise create stacked HTML: number/denominator
    return `<span class="mfrac"><span class="mnum">${num(n)}</span><span class="mden">${num(d)}</span></span>`;
  }

  // surd creates a square root symbol. For example: surd(2, 3) displays as 2√3
  function surd(k, m) {
    // If we're taking the square root of 1, just show the coefficient
    if (m === 1) return num(k);
    // If coefficient is 1, don't show it (just show √)
    const coef = (k === 1) ? '' : num(k);
    // Create HTML with the square root symbol and the number inside
    return `${coef}<span class="msqrt">√<span class="mrad">${num(m)}</span></span>`;
  }

  // term formats a single part of an equation like "3x" or "−5"
  function term(coef, suffix, lead) {
    // If coefficient is basically 0 and this isn't the leading term, skip it
    if (Math.abs(coef) < EPS && !lead) return '';
    // Get the absolute value (ignore the sign for now)
    const a = Math.abs(coef);
    // If coefficient is 1 and has a suffix (like x), don't show the 1
    const mag = (a === 1 && suffix) ? '' : num(a);
    // For the first term, no + sign needed. For later terms, add + or −
    if (lead) return `${coef < 0 ? '−' : ''}${mag}${suffix}`;
    return ` ${coef < 0 ? '−' : '+'} ${mag}${suffix}`;
  }

  // ---- Solver ----- The core math engine: solves quadratic equations

  // solve is the main function that solves ax² + bx + c = 0 and returns all the important info
  function solve(a, b, c) {
    // Convert inputs to numbers in case they came in as strings
    a = +a; b = +b; c = +c;
    // Create a result object and check if all inputs are real numbers
    const r = { a, b, c, valid: [a, b, c].every(Number.isFinite) };
    // If any input is invalid (NaN, Infinity), return early
    if (!r.valid) return r;

    // Special case: if a is 0, it's not actually a quadratic equation
    if (Math.abs(a) < EPS) {
      r.degenerate = true;
      // If b is also 0, check if c is 0 (true for all x) or not (no solution)
      if (Math.abs(b) < EPS) { r.type = Math.abs(c) < EPS ? 'all' : 'none'; return r; }
      // Otherwise it's just a linear equation: bx + c = 0
      r.type = 'linear'; r.roots = [-c / b]; return r;
    }

    // Calculate the discriminant (D = b² − 4ac)
    // This tells us how many solutions exist
    const D = b * b - 4 * a * c;
    r.D = D;

    // Find the vertex (turning point) of the parabola
    r.vertexX = -b / (2 * a);  // x-coordinate of vertex
    r.vertexY = a * r.vertexX * r.vertexX + b * r.vertexX + c;  // y-coordinate
    r.axis = r.vertexX;  // The axis of symmetry is a vertical line at the vertex x

    // For vertex form: a(x + p)² + k
    r.p = b / (2 * a);
    r.k = r.vertexY;

    // Check if parabola opens upward (a > 0) or downward (a < 0)
    r.opens = a > 0 ? 'up' : 'down';

    // Determine how many real roots exist based on the discriminant
    if (D > EPS) {
      // Two different real roots
      const s = Math.sqrt(D);
      r.type = 'two';
      // Use quadratic formula: x = (-b ± √D) / 2a
      r.roots = [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((m, n) => m - n);
    } else if (D > -EPS) {
      // One repeated root (discriminant is basically 0)
      r.type = 'double';
      r.roots = [-b / (2 * a)];
    } else {
      // Complex roots (no real solutions, discriminant is negative)
      r.type = 'complex';
      r.roots = [{ re: -b / (2 * a), im: -Math.sqrt(-D) / (2 * Math.abs(a)) },
                 { re: -b / (2 * a), im: Math.sqrt(-D) / (2 * Math.abs(a)) }];
    }
    return r;
  }

  // exactRoots shows the exact answer as fractions and square roots (when a,b,c are integers)
  function exactRoots(a, b, c) {
    // Only works if a, b, c are all integers and a is not 0
    if (!(isInt(a) && isInt(b) && isInt(c)) || a === 0) return null;

    // Calculate discriminant
    const D = b * b - 4 * a * c;
    const denom = 2 * a;

    // If discriminant is non-negative, we have real roots
    if (D >= 0) {
      const [k, m] = simplifySqrt(D);
      // If the square root simplifies to a whole number, roots are rational
      if (m === 1) {
        const [n1, d1] = simplifyFraction(-b - k, denom);
        const [n2, d2] = simplifyFraction(-b + k, denom);
        // If there's only one root, show it
        if (k === 0) return { html: frac(n1, d1) };
        // Otherwise show both roots as fractions
        return { html: `${frac(n1, d1)},&nbsp; ${frac(n2, d2)}` };
      }
      // If we can't simplify to a rational, show as (-b ± k√m) / (2a)
      const g = gcd(gcd(b, k), denom) * (denom < 0 ? -1 : 1);
      const bb = -b / Math.abs(g), kk = k / Math.abs(g), dd = denom / Math.abs(g);
      const core = `${bb === 0 ? '' : num(bb) + ' '}± ${surd(kk, m)}`;
      // Put it all over a common denominator if needed
      return { html: dd === 1 ? core : `<span class="mfrac"><span class="mnum">${core}</span><span class="mden">${num(dd)}</span></span>` };
    }

    // For negative discriminant, roots are complex
    const [k, m] = simplifySqrt(-D);
    const g = Math.abs(gcd(gcd(b, k), denom));
    const bb = -b / g, kk = k / g, dd = Math.abs(denom) / g;
    // Format: real_part ± imaginary_part·i
    const real = dd === 1 ? num(bb) : frac(bb, dd);
    const imag = dd === 1 ? `${surd(kk, m)}` : `<span class="mfrac"><span class="mnum">${surd(kk, m)}</span><span class="mden">${num(dd)}</span></span>`;
    return { complex: true, html: `${real} ± ${imag}<em>i</em>` };
  }

  // ---- Walkthrough steps ---------------------------------------------
  // Returns array of { key, title:{en,ms}, note:{en,ms}, math (HTML), phase }
  // L = localized micro labels {or, repeated, exact, noReal}
  function buildSteps(a, b, c, L) {
    L = L || { or: 'or', repeated: 'repeated root', exact: 'exact:', noReal: 'No real value squares to a negative — the roots are complex.' };
    const steps = [];
    const T = (en, ms) => ({ en, ms });
    const B = b / a, K = c / a, p = b / (2 * a), pSq = p * p, rhs = pSq - K;

    // line: x² + Bx + C
    const quadLine = `${term(a, 'x²', true)}${term(b, 'x')}${term(c, '')} = 0`;
    steps.push({
      key: 'write', phase: 'intro',
      title: T('Write it in standard form', 'Tulis dalam bentuk piawai'),
      note: T('Identify a, b and c from ax² + bx + c = 0.',
              'Kenal pasti a, b dan c daripada ax² + bx + c = 0.'),
      math: `<div class="meq">${quadLine}</div>
             <div class="msub">a = ${num(a)},&nbsp; b = ${num(b)},&nbsp; c = ${num(c)}</div>`
    });

    if (Math.abs(a - 1) > EPS) {
      steps.push({
        key: 'divide', phase: 'intro',
        title: T('Make the x² coefficient 1', 'Jadikan pekali x² bersamaan 1'),
        note: T(`Divide every term by a = ${num(a)} so the square starts from a clean x².`,
                `Bahagi setiap sebutan dengan a = ${num(a)} supaya bermula dengan x² tulen.`),
        math: `<div class="meq">${term(1, 'x²', true)}${term(B, 'x')}${term(K, '')} = 0</div>`
      });
    }

    steps.push({
      key: 'move', phase: 'tiles1',
      title: T('Move the constant aside', 'Pindahkan pemalar'),
      note: T('Keep the x terms together — picture x² as a square and the x term as a strip beside it.',
              'Kumpulkan sebutan x — bayangkan x² sebagai segi empat sama dan sebutan x sebagai jalur di sebelahnya.'),
      math: `<div class="meq">${term(1, 'x²', true)}${term(B, 'x')} = ${num(-K)}</div>`
    });

    steps.push({
      key: 'halve', phase: 'tiles2',
      title: T('Halve the middle number', 'Bahagi dua nombor tengah'),
      note: T(`Take half of ${num(B)} to get ${num(p)}. Cut the strip in two and move half underneath.`,
              `Ambil separuh daripada ${num(B)} iaitu ${num(p)}. Potong jalur kepada dua dan alih separuh ke bawah.`),
      math: `<div class="meq"><span class="mfrac"><span class="mnum">${num(B)}</span><span class="mden">2</span></span> = ${num(p)}</div>`
    });

    steps.push({
      key: 'complete', phase: 'tiles3',
      title: T('Complete the square', 'Sempurnakan kuasa dua'),
      note: T(`Add the missing corner (${num(p)})² = ${num(pSq)} to both sides. The L-shape becomes a full square.`,
              `Tambah sudut yang hilang (${num(p)})² = ${num(pSq)} pada kedua-dua belah. Bentuk L menjadi segi empat penuh.`),
      math: `<div class="meq">${term(1, 'x²', true)}${term(B, 'x')} + ${num(pSq)} = ${num(-K)} + ${num(pSq)}</div>
             <div class="meq mhi">(x ${p < 0 ? '−' : '+'} ${num(Math.abs(p))})² = ${num(rhs)}</div>`
    });

    steps.push({
      key: 'root', phase: 'tiles4',
      title: T('Square-root both sides', 'Punca kuasa dua kedua-dua belah'),
      note: T('The square has side (x + b⁄2a). Taking the root undoes the square — remember the ± .',
              'Sisi segi empat ialah (x + b⁄2a). Punca kuasa dua membatalkan kuasa dua — ingat tanda ± .'),
      math: rhs >= 0
        ? `<div class="meq">x ${p < 0 ? '−' : '+'} ${num(Math.abs(p))} = ± √${num(rhs)}</div>`
        : `<div class="meq">x ${p < 0 ? '−' : '+'} ${num(Math.abs(p))} = ± √(${num(rhs)})</div>
           <div class="msub">${L.noReal}</div>`
    });

    // final
    const res = solve(a, b, c);
    const ex = exactRoots(a, b, c);
    let finalMath;
    if (res.type === 'two') {
      finalMath = `<div class="meq">x = ${num(res.roots[0])}&nbsp; ${L.or}&nbsp; x = ${num(res.roots[1])}</div>`;
      if (ex) finalMath += `<div class="msub">${L.exact} ${ex.html}</div>`;
    } else if (res.type === 'double') {
      finalMath = `<div class="meq">x = ${num(res.roots[0])} &nbsp;(${L.repeated})</div>`;
      if (ex) finalMath += `<div class="msub">${L.exact} ${ex.html}</div>`;
    } else {
      const r = res.roots[1];
      finalMath = `<div class="meq">x = ${num(r.re)} ± ${num(Math.abs(r.im))}<em>i</em></div>`;
      if (ex) finalMath += `<div class="msub">${L.exact} ${ex.html}</div>`;
    }
    steps.push({
      key: 'solve', phase: 'solved',
      title: T('Read off the solutions', 'Baca penyelesaian'),
      note: T('These x-values are exactly where the parabola meets the x-axis.',
              'Nilai x ini ialah tempat parabola menyentuh paksi-x.'),
      math: finalMath
    });

    return steps;
  }

  return { solve, exactRoots, buildSteps, simplifyFraction, simplifySqrt, num, frac, surd, isInt };
})();
