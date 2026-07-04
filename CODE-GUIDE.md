# QuadVision — Code Guide (for explaining to the judges)

This is a plain-English tour of how QuadVision is built. You don't need to be a
programmer to use it — each part has a simple "what it does" and a short line you
can say out loud to a judge.

---

## 1. What the project is (say this first)

> "QuadVision teaches students how to solve quadratic equations. Our novelty is
> that we **show** the method 'completing the square' as a real picture made of
> tiles — the square is actually built in front of you — instead of just giving
> formulas. It works in English and Bahasa Melayu, has a step-by-step
> walkthrough, a photo-scanner that reads a question from a picture, and a
> friendly bear helper called Squary."

---

## 2. How it's built (the simple version)

It's a website made with the three basic web languages — **HTML** (structure),
**CSS** (the look), and **JavaScript** (the behaviour). No paid tools, no
external frameworks. That keeps it light, free to host, and easy to maintain.

We split the JavaScript into small files, each with one job. Think of it like a
team where everyone has a role:

| File | Its one job (plain words) |
|------|----------------------------|
| `index.html` | The skeleton — what appears on the page. |
| `css/styles.css` | The style — colours, spacing, the Apple-like look, dark mode. |
| `js/math-core.js` | The **brain** — does the actual algebra. |
| `js/visualizer.js` | Draws the **tile picture** (our novelty). |
| `js/grapher.js` | Draws the **graph** (the parabola). |
| `js/i18n.js` | The **translator** — English ⇄ Bahasa Melayu. |
| `js/scanner.js` | The **photo reader** — reads a quadratic from an image. |
| `js/squary.js` | **Squary** the bear helper. |
| `js/app.js` | The **conductor** — connects everything together. |
| `js/ui.js` | Small polish — fade-in-on-scroll and the active menu. |

> Say to the judge: "We separated the code into small files so each part is
> easy to understand, test and improve — the maths is completely separate from
> the drawing and from the design."

---

## 3. File-by-file — what to say

### `index.html` — the skeleton
Lists every part of the page in order: top bar → headline + the a/b/c input
boxes → three highlight cards → the tile studio + graph → photo scan → a short
"why it works" explanation → the team → footer. Every piece of text is tagged so
the translator can swap its language.

### `css/styles.css` — the look
Holds all the colours and spacing in one place at the top (called "tokens"), so
the whole site stays consistent. It defines the soft pastel theme, the
**dark mode**, the frosted "glass" top bar, the iOS-style buttons and toggles,
and the gentle fade-in animations.
> "All our colours are defined once at the top, so the light and dark themes
> stay perfectly matched."

### `js/math-core.js` — the brain
Takes a, b, c and works out: the answers (roots), the discriminant (how many
answers), the vertex (turning point), the axis of symmetry, and the full
step-by-step working. It can even show exact answers with square-root signs and
fractions. **It does pure maths only — it never draws anything.**
> "This is the part a maths teacher would care about — it's the real algebra,
> kept separate so we can trust it."

### `js/visualizer.js` — the tile picture (OUR NOVELTY)
Draws "completing the square" as area. The blue square is x². The green strips
are the bx term, split in half and wrapped around two sides. That leaves an empty
corner — we add a pink (b/2)² square to fill it, and the whole thing becomes one
perfect square. **Seeing the square get completed is the heart of our project.**
> "Most apps just show steps. We show *why* it's called 'completing the square'
> — because you literally complete a square."

### `js/grapher.js` — the graph
Draws the U-shaped parabola for the same equation and marks the roots (where it
crosses the x-axis), the vertex, and the line of symmetry.
> "The graph and the algebra always agree — students see both at once."

### `js/i18n.js` — the translator
Stores every sentence in English and Bahasa Melayu. One tap on EN/BM changes the
entire site instantly, and it remembers your choice for next time.
> "Fully bilingual — important for Malaysian classrooms."

### `js/scanner.js` — the photo reader
Uses OCR (optical character recognition) to read a printed quadratic from a
photo and fill in a, b, c automatically. It understands many ways of writing the
equation (x², x^2, decimals, the = sign on either side).
> "Students can just snap their textbook question instead of typing."

### `js/squary.js` — the bear helper
Squary greets students, explains each step in a speech bubble (both languages),
points at the graph, throws confetti and gives achievements when they solve one.
He's also alive: his **eyes follow the mouse**, you can **pet him** (3 quick
clicks = hearts), **drag him** around the screen, he **naps** if ignored, and he
**reacts when you switch day/night mode**.
> "Squary keeps younger learners engaged and turns practice into something fun."

### `js/app.js` — the conductor
The glue. It reads the a/b/c boxes, asks the brain for the answer, tells the tile
picture and the graph what to draw, runs the Play / Next / Back buttons, handles
the scan, and switches languages.

### `js/ui.js` — the polish
Makes cards fade and slide up gently as you scroll (like Apple's product pages),
and highlights the menu item for the section you're viewing.

---

## 4. A 60-second demo script (what to click)

1. **Start:** "Here's a quadratic — x² − 5x + 6." Point at the a/b/c boxes.
2. Press **Visualise**. "Watch the square build itself" — let the tiles animate.
3. Press **Play** on the walkthrough. "It explains each step in words and maths."
4. Point to the **graph**: "the answers are where the curve meets the line."
5. Tap **BM**: "and the whole thing works in Bahasa Melayu."
6. Tap the **photo scan**: "students can scan a question instead of typing."
7. Point at **Squary**: "our helper reacts, celebrates and keeps it fun."
8. Tap **dark mode**: "and it has a polished light and dark theme."

---

## 5. Questions a judge might ask (with simple answers)

- **"Did you build this yourselves?"** → "Yes — plain HTML, CSS and JavaScript,
  split into small files, no paid software."
- **"What's new about it?"** → "We show completing the square as a real picture
  of tiles, so students understand *why*, not just *how*."
- **"Who is it for?"** → "Secondary and matriculation students; it's bilingual
  and works on phones, tablets and computers."
- **"Does it work offline?"** → "Everything works offline except the photo
  scanner, which downloads its reader the first time."
- **"How would a school use it?"** → "Open the link or scan a QR code — no
  install. Teachers can demo it; students practise on their own."

---

## 6. Where to change things

- **Team photos & names:** in `index.html`, the team section — replace the
  images in `assets/team/` and edit each `class="name"`.
- **Text wording / translations:** in `js/i18n.js` (English and Malay together).
- **Colours / theme:** the "design tokens" block at the top of `css/styles.css`.

---

## 7. Latest additions (what's new to mention)

**Welcome / Start screen — `js/intro.js`.** When the site opens, a friendly
overlay greets the judge first and explains, in plain words, what QuadVision is
and how to use it in three steps — instead of dropping straight into the
calculator. Press **"Start exploring"** to enter. It can be reopened any time
from the **"Guide"** button in the top menu, and it's fully bilingual.
> Say: "We start with a short guide so anyone — including a first-time judge —
> immediately understands what the tool does and how to use it."

**The graph is now interactive — `js/grapher.js`.** It's no longer just a
picture: drag your finger/mouse across the curve and a point rides along it
showing the exact (x, y), with crosshair lines to both axes.
> Say: "Students can explore the curve themselves and read any point on it."

**The square is now interactive — `js/visualizer.js`.** Hover (or tap) any tile
in the completed square and it highlights and tells you what that piece's area
means — the x² square, the (b/2)·x strips, or the added (b/2)² corner.

**Real-life examples are richer and hands-on — `js/applications.js`.** The
basketball scene is now a full arena (crowd, spotlights, backboard, glossy
court) and the rocket scene is deep space (nebula, stars, a launch pad and a
glowing landing platform). You can **drag directly on the scene** (up = more
power) as well as use the slider, and the arc reshapes live.
> Say: "Each scene is a real setting, and students can grab it and change the
> launch power to see how the parabola — and the answer — changes."

---

---

---

---

---

## 8. The Play section — two arcade games — `js/games.js`

Two arcade games drawn live on canvas (offline). BOTH make the player do the
maths, and both are tied to our topic — **completing the square**.

**🧱 Tile Forge** — a hands-on **building puzzle** where the player *physically
performs* completing the square. The screen shows a blueprint `x² + bx`. Step by
step you: (1) **cut the `bx` strip in half** — discovering that's `b ÷ 2`;
(2) **drag the two `(b/2)·x` halves** and snap them onto the right and bottom of
the `x·x` block (magnetic slots with satisfying pops); (3) this opens an empty
`(b/2) × (b/2)` **corner**, which you **fill with unit tiles** — discovering it
needs exactly `(b/2)²` of them. The square locks in with a flash and the answer
`(x + b/2)²` (plus the leftover constant) is revealed. Six levels of rising `b`,
a timed star rating, a streak bonus, a cheering bear mascot, and saved best.
> Say: "Our main solver SHOWS the method as moving tiles; this game makes you
> PERFORM it by hand — you split bx, halve it, and fill the corner with (b/2)²
> tiles yourself. You don't pick an answer from a list, you BUILD the square,
> which is exactly what completing the square means."

**🏰 Knight Dungeon** — a **pixel-art** dungeon crawler. The whole scene is
drawn at a low resolution and scaled up with nearest-neighbour (no blurring),
so it has a crisp retro look instead of flat boxes: walls are raised 3-D stone
blocks with lit tops and shadowed sides, floors have stone speckle texture,
plus animated water, flickering torches with glow, gems, a key, chests, slimes,
skulls and a little knight sprite (helmet, plume, shield, sword) that bobs as it
walks. Explore, collect gems and the 🗝 key, and to beat a monster, open a
chest, or unlock the door you must **solve a quadratic** (roots or completing
the square). Three levels, hearts for lives, saved best.
> Say: "It's hand-built pixel art — every wall, torch and the knight is drawn
> pixel-by-pixel in code, no downloaded images, and every monster and the final
> door is unlocked by solving a quadratic."

Both games are bilingual and save your best score.

---

## Tech stack highlight — WebGL & creative coding

QuadVision embeds **three.js** (WebGL engine) and **p5.js** (creative-coding
library) directly inside the single HTML file, so both work fully offline:

- **three.js** renders the hero's real-time 3D field: sixty floating algebra
  tiles in the site's own colours plus a slowly turning wireframe "completed
  square", with depth fog and mouse parallax (`js/threefx.js`).
- **p5.js** draws the sitewide "math constellation": drifting particles that
  link into faint lines, tiny parabola glyphs gliding by, and gentle repulsion
  around the cursor (`js/p5fx.js`).

> Say: "The 3D background is real WebGL via three.js, and the ambient particle
> field is p5.js — both embedded in one offline file. Every effect pauses when
> off-screen or when the visitor prefers reduced motion."
