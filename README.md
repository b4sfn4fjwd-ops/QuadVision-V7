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

## Run it locally

It's plain HTML/CSS/JS — no build step. Because the scanner loads a script and
browsers restrict that on `file://`, serve it over a tiny local server:

```bash
# from the project folder
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly mostly works, but the photo-scan feature needs
the server.)

## Deploy on GitHub Pages (free public URL)

1. Create a new repository on GitHub, e.g. `quadvision`.
2. Upload **everything in this folder** so `index.html` sits at the repo root:
   ```
   index.html
   css/styles.css
   js/...
   assets/...
   ```
3. In the repo: **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Branch: `main`, folder: `/ (root)`. Save.
6. Wait ~1 minute. Your site appears at:
   `https://<your-username>.github.io/quadvision/`

Put that URL (and a QR code to it) on your poster so judges can try it live.

### Updating after deploy
Just push changes to `main` — Pages rebuilds automatically.

## Replace the team photos

The team section uses placeholder avatars in `assets/team/`. To use real
photos, replace these files (keep the same names, or update the `src` in
`index.html`):

```
assets/team/lecturer.svg   → your lecturer
assets/team/member1.svg    → team leader (Ketua Kumpulan)
assets/team/member2.svg    → member
assets/team/member3.svg    → member
assets/team/member4.svg    → member
assets/team/member5.svg    → member
```

You can drop in `.jpg`/`.png` instead of `.svg`. If you do, update the matching
`<img src="...">` in the **team** section of `index.html`, and edit the names:
each member block has a `<div class="name">` (currently "Name") and a role.
Square photos look best (they're cropped to a square).

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
