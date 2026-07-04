# QuadVision

A bilingual (English / Bahasa Melayu) learning tool that solves quadratic
equations step by step and shows the **real square forming, tile by tile**,
beside the parabola. Built for the **KMJ Innovation Expo 2026 (KIE 2026)**,
PdP subtheme.

The point isn't just the answer — it's *seeing* why completing the square
works, as area.

## Features

- **Live solver** — type `a`, `b`, `c` and get roots, discriminant, vertex and
  axis of symmetry instantly.
- **The tile studio** — an animated "completing the square" canvas: the `x²`
  square, the half-strips wrapping around it, and the corner `(b⁄2)²` that
  finishes the square. This is the signature.
- **Parabola grapher** — the curve is drawn progressively, with roots, vertex
  and y-intercept marked.
- **Step-by-step walkthrough** — play/pause, step dots, prev/next, arrow keys
  and spacebar.
- **Photo scan** — point a camera or upload a photo of a printed quadratic; it
  reads the equation (OCR) and fills `a`, `b`, `c` for you.
- **English ⇄ Bahasa Melayu** toggle, remembered between visits.
- Responsive, keyboard-accessible, and respects reduced-motion.

### Updating after deploy
Just push changes to `main` — Pages rebuilds automatically.

## File layout

```
index.html            structure + all element IDs and i18n hooks
css/styles.css         pastel theme, canvas variables, math typography
js/math-core.js        pure math: solve, exact surd/fraction forms, step builder
js/i18n.js             EN/BM dictionary + apply engine
js/visualizer.js       the algebra-tile "completing the square" animation
js/grapher.js          the parabola plot
js/scanner.js          photo OCR + equation parser (loads Tesseract.js on demand)
js/app.js              wiring: inputs, walkthrough player, scan, language
assets/                logo, favicons, team placeholders
```

## Notes

- The scanner downloads the OCR engine (Tesseract.js) the first time you scan,
  so that first scan needs an internet connection.
- Clear, straight-on printed text scans best (e.g. `2x² + 3x − 5 = 0`).
