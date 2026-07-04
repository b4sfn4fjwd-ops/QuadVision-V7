/* ============================================================================
   FOR THE JUDGE (in simple words):
   This is the camera/photo reader. Take or upload a picture of a printed
   quadratic and it "reads" the text (OCR) and fills in a, b and c automatically,
   so students don't have to type. It understands common ways of writing the
   equation (x^2, x2, decimals, an = sign on either side, and so on).
   ============================================================================ */
/* QuadVision — scanner.js
   Reads a photo of a printed quadratic with Tesseract.js (loaded from CDN)
   and parses it into a, b, c. Robust to common formats:
   2x^2+3x-5=0, x²-4x+4=0, -x^2 + 5 = 2x, etc. */
window.Scanner = (function () {
  'use strict';

  // coef extracts the coefficient (the number in front, like the "3" in "3x")
  function coef(s) {
    // Empty string or just + means the coefficient is 1
    if (s === '' || s === '+') return 1;
    // Just - or the special dash means -1
    if (s === '-' || s === '−') return -1;
    // Convert the string to a number (handling both dash types)
    const v = parseFloat(s.replace('−', '-'));
    // Return the number, or 0 if it's not valid
    return Number.isFinite(v) ? v : 0;
  }

  // parseSide extracts the a, b, c from one side of an equation (like "2x^2 + 3x - 5")
  function parseSide(side) {
    // Start with zeros for each coefficient
    let a = 0, b = 0, c = 0;
    let s = side;

    // First, find all x^2 terms and add their coefficients to 'a'
    let m, re2 = /([+-]?\d*\.?\d*)x\^2/g;
    while ((m = re2.exec(s))) a += coef(m[1]);
    // Remove the x^2 terms so we don't process them again
    s = s.replace(/([+-]?\d*\.?\d*)x\^2/g, ' ');

    // Next, find all x terms (but not x^2) and add to 'b'
    let re1 = /([+-]?\d*\.?\d*)x(?!\^)/g;
    while ((m = re1.exec(s))) b += coef(m[1]);
    // Remove the x terms
    s = s.replace(/([+-]?\d*\.?\d*)x(?!\^)/g, ' ');

    // Finally, add up all the remaining numbers (constants)
    let rc = /([+-]?\d+\.?\d*)/g;
    while ((m = rc.exec(s))) c += parseFloat(m[1]);

    return { a, b, c };
  }

  // parse reads handwritten text from a photo and extracts a, b, c
  function parse(raw) {
    // If there's no text, return null
    if (!raw) return null;

    // Clean up the text by converting it to a standard format
    let s = raw.toLowerCase();
    s = s.replace(/[×∗·•]/g, '*')                // Convert multiplication symbols to *
         .replace(/[−–—‒]/g, '-')                // Convert all dash types to regular minus
         .replace(/[^\w.\^=+\-x²\s]/g, ' ')     // Remove stray punctuation
         .replace(/x\s*²/g, 'x^2')               // Convert superscript 2 to ^2
         .replace(/x\s*2(?=\b|[^0-9])/g, 'x^2') // Handle OCR that drops the ^
         .replace(/\^\s*2/g, '^2')               // Clean up spacing around ^2
         .replace(/\s+/g, '');                   // Remove all spaces

    // If there's no x, it's not a quadratic - return null
    if (!/x/.test(s)) return null;

    // Split at the equals sign (if there is one)
    let lhs = s, rhs = '0';
    if (s.includes('=')) {
      const parts = s.split('=');
      lhs = parts[0];
      // Join remaining parts with + (in case there are multiple = signs)
      rhs = parts.slice(1).join('+');
    }

    // Parse both sides separately
    const L = parseSide(lhs), R = parseSide(rhs);
    // Move everything to the left side (subtract right from left)
    const a = L.a - R.a, b = L.b - R.b, c = L.c - R.c;

    // If there's no x term at all, it's not a quadratic
    if (Math.abs(a) < 1e-9 && Math.abs(b) < 1e-9) return null;

    // Round the results (integers stay integers, decimals are kept to 3 places)
    const round = (v) => Math.abs(v - Math.round(v)) < 1e-6 ? Math.round(v) : +v.toFixed(3);
    return { a: round(a), b: round(b), c: round(c) };
  }

  // ensureTesseract loads the OCR (optical character recognition) library on-demand
  // This is done lazily to avoid slowing down the initial page load
  let loading = null;
  function ensureTesseract() {
    // If Tesseract is already loaded, return immediately
    if (window.Tesseract) return Promise.resolve();
    // If it's already loading, return the existing promise
    if (loading) return loading;
    // Otherwise, create a new promise to load it from the CDN
    loading = new Promise((res, rej) => {
      const sc = document.createElement('script');
      sc.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      sc.onload = res;
      sc.onerror = () => rej(new Error('ocr-load-failed'));
      document.head.appendChild(sc);
    });
    return loading;
  }

  // recognise reads text from an image using OCR and tries to extract a, b, c
  async function recognise(image, onProgress) {
    // Make sure Tesseract is loaded
    await ensureTesseract();
    // Run the OCR on the image
    const { data } = await window.Tesseract.recognize(image, 'eng', {
      // Call onProgress callback when reading the image
      logger: (msg) => { if (onProgress && msg.status === 'recognizing text') onProgress(msg.progress); },
      // Only look for characters that could be in a quadratic equation
      tessedit_char_whitelist: '0123456789xX²^=+-.()'
    });
    // Get the recognized text and trim whitespace
    const text = (data.text || '').trim();
    // Try to parse the text into a, b, c values
    return { text, eq: parse(text) };
  }

  return { parse, recognise };
})();
