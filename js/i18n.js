/* ============================================================================
   FOR THE JUDGE (in simple words):
   This is the translator. It holds every piece of text in BOTH English and
   Bahasa Melayu. Anything on the page marked with data-i18n="..." gets its
   words from here, so one tap on the EN/BM switch changes the whole site.
   ============================================================================ */
/* QuadVision — i18n.js
   Bilingual strings (English / Bahasa Melayu) + a tiny apply engine.
   Mark elements with data-i18n="key" (textContent) or
   data-i18n-ph="key" (placeholder). */
window.I18N = (function () {
  'use strict';

  const DICT = {
    en: {
      nav_solve: 'Solve', nav_learn: 'Learn', nav_scan: 'Scan', nav_team: 'Team',
      tagline: 'See the square behind the equation',
      hero_title: 'Quadratics you can actually <em>see</em>',
      hero_lede: 'Type a quadratic and watch it solved step by step — with the real square forming, tile by tile, beside its parabola.',
      hx_chip: 'Interactive mathematics, made visible',
      hx_title: 'See Mathematics <em>Come Alive</em>',
      hx_lede: 'Transform abstract quadratic equations into interactive geometric experiences. Learn the Completing the Square method through visualization, animation, and exploration — not memorization.',
      hx_cta1: 'Visualize My First Equation',
      hx_cta2: 'Watch Live Demo',
      hx_demo_cap: 'Live — solving x² + 6x + 5, on repeat',
      sv_eyebrow: 'Your turn',
      sv_title: 'Type any quadratic. Watch it become a square.',
      j_eyebrow: 'The journey',
      j_title: 'From Equation to Understanding',
      j_1: 'Equation Input', j_2: 'Visual Breakdown', j_3: 'Complete the Square',
      j_4: 'Transform to Vertex Form', j_5: 'Discover the Graph', j_6: 'Master the Concept',
      meet_t: 'Meet Squary — your guide',
      meet_1: '“Hi! I’m Squary.”',
      meet_2: '“I’ll help you see mathematics in a completely different way.”',
      meet_3: '“Let’s complete our first square together.”',
      hl_eyebrow: 'Learn by seeing', hl_title: 'A new way to learn mathematics.',
      hl_1_t: 'Visualize', hl_1_d: 'Watch algebra transform into geometry through beautiful animated square construction.',
      hl_2_t: 'Two languages', hl_2_d: 'Every step reads in English and Bahasa Melayu, switchable any time.',
      hl_3_t: 'Guided, step by step', hl_3_d: 'Play it like a story, or move through each step at your own pace.',
      lab_a: 'a', lab_b: 'b', lab_c: 'c',
      visualise: 'Visualise', reset: 'Reset', try_example: 'Try an example',
      eq_preview: 'Your equation',
      sum_title: 'Solution',
      sum_disc: 'Discriminant', sum_roots: 'Roots', sum_vertex: 'Vertex', sum_axis: 'Axis of symmetry',
      sum_vform: 'Vertex form', sum_sform: 'Standard form',
      roots_two: 'Two real roots', roots_double: 'One repeated root', roots_complex: 'No real roots (complex)',
      roots_linear: 'Linear — one root', roots_none: 'No solution', roots_all: 'True for every x',
      studio_title: 'The square, forming',
      studio_sub: 'Completing the square, shown as area.',
      graph_title: 'On the graph',
      graph_sub: 'Where the curve meets the x-axis.',
      step_of: 'Step',
      play: 'Play', pause: 'Pause', prev: 'Back', next: 'Next',
      or: 'or', repeated: 'repeated root', exact: 'exact:',
      noReal: 'No real value squares to a negative — so the roots are complex.',
      legend_sq: 'x² square', legend_strip: 'half-strips (b⁄2 · x)', legend_corner: 'added corner (b⁄2)²',
      scan_title: 'Scan a question',
      scan_sub: 'Point your camera at a printed quadratic, or upload a photo. QuadVision reads it and fills a, b and c for you.',
      scan_upload: 'Upload photo', scan_camera: 'Use camera', scan_reading: 'Reading the image…',
      scan_found: 'Found this equation', scan_use: 'Use these values', scan_retry: 'Try another photo',
      scan_seen: 'Text detected', scan_none: 'No quadratic spotted. Try a clearer, straight-on photo — or type the numbers in.',
      scan_tip: 'Tip: clear printed text like 2x² + 3x − 5 = 0 works best.',
      learn_title: 'Why completing the square works',
      learn_p1: 'Every quadratic ax² + bx + c hides a perfect square. The x² term is a literal square of side x. The bx term is a strip of width b you can split in half and wrap around two sides of that square.',
      learn_p2: 'Wrapping leaves one empty corner. Fill it with a small (b⁄2)² square and the whole shape becomes a clean square of side (x + b⁄2). That single idea turns any quadratic into (x + b⁄2)² = a number — and from there, x is one square-root away.',
      learn_p3: 'It is also where the quadratic formula comes from: do this with letters instead of numbers and x = (−b ± √(b² − 4ac)) ⁄ 2a falls straight out.',
      team_title: 'The team', team_sub: 'Introduce to our team',
      role_lecturer: 'Supervising lecturer', role_leader: 'Team leader', role_member: 'Member',
      foot_built: 'QuadVision · Inovasi Lestari ke Arah Pendidikan Terbilang',
      foot_made: 'A learning tool for completing the square.',
      placeholder_name: 'Name',
      nav_play: 'Play', nav_apps: 'Real life',
      spot_eyebrow: 'Mistake detective', spot_title: 'Spot the slip',
      spot_sub: 'Every line looks right at a glance. Find the one that breaks a rule — then see exactly why.',
      spot_new: 'Another one',
      play_eyebrow: 'Play', play_title: 'Play the quadratics game',
      play_sub: 'Pick one of three quadratic games and practise — all built right into the page.',
      hud_time: 'Time', hud_score: 'Score',
      apps_eyebrow: 'Where it lives', apps_title: 'Quadratics in the real world',
      apps_sub: 'Move the slider and watch a real object — a ball, a rocket, a bridge — move along its parabola. The vertex and roots mean something here.',
      apps_play: 'Play motion', apps_pause: 'Pause'
    },
    ms: {
      nav_solve: 'Selesai', nav_learn: 'Pelajari', nav_scan: 'Imbas', nav_team: 'Kumpulan',
      tagline: 'Lihat segi empat di sebalik persamaan',
      hero_title: 'Kuasa dua yang boleh anda <em>lihat</em>',
      hero_lede: 'Taip persamaan kuasa dua dan lihat ia diselesaikan langkah demi langkah — dengan segi empat sebenar terbentuk, jubin demi jubin, di sebelah parabolanya.',
      hx_chip: 'Matematik interaktif, boleh dilihat',
      hx_title: 'Lihat Matematik <em>Menjadi Hidup</em>',
      hx_lede: 'Ubah persamaan kuadratik abstrak menjadi pengalaman geometri interaktif. Kuasai kaedah Penyempurnaan Kuasa Dua melalui visualisasi, animasi dan penerokaan — bukan hafalan.',
      hx_cta1: 'Visualkan Persamaan Pertama Saya',
      hx_cta2: 'Tonton Demo Langsung',
      hx_demo_cap: 'Langsung — menyelesaikan x² + 6x + 5, berulang',
      sv_eyebrow: 'Giliran anda',
      sv_title: 'Taip mana-mana kuadratik. Lihat ia menjadi segi empat.',
      j_eyebrow: 'Perjalanan',
      j_title: 'Daripada Persamaan kepada Kefahaman',
      j_1: 'Masukkan Persamaan', j_2: 'Pecahan Visual', j_3: 'Sempurnakan Kuasa Dua',
      j_4: 'Tukar ke Bentuk Verteks', j_5: 'Teroka Graf', j_6: 'Kuasai Konsep',
      meet_t: 'Kenali Squary — pemandu anda',
      meet_1: '“Hai! Saya Squary.”',
      meet_2: '“Saya akan bantu anda melihat matematik dengan cara yang berbeza.”',
      meet_3: '“Jom sempurnakan kuasa dua pertama kita bersama.”',
      hl_eyebrow: 'Belajar melalui penglihatan', hl_title: 'Cara baharu mempelajari matematik.',
      hl_1_t: 'Visualkan', hl_1_d: 'Saksikan algebra bertukar menjadi geometri melalui pembinaan segi empat beranimasi yang indah.',
      hl_2_t: 'Dua bahasa', hl_2_d: 'Setiap langkah dalam Bahasa Inggeris dan Bahasa Melayu, boleh tukar bila-bila masa.',
      hl_3_t: 'Berpandu, langkah demi langkah', hl_3_d: 'Mainkan seperti cerita, atau ikut setiap langkah mengikut kemampuan anda.',
      lab_a: 'a', lab_b: 'b', lab_c: 'c',
      visualise: 'Visualkan', reset: 'Set semula', try_example: 'Cuba contoh',
      eq_preview: 'Persamaan anda',
      sum_title: 'Penyelesaian',
      sum_disc: 'Pembeza', sum_roots: 'Punca', sum_vertex: 'Verteks', sum_axis: 'Paksi simetri',
      sum_vform: 'Bentuk verteks', sum_sform: 'Bentuk piawai',
      roots_two: 'Dua punca nyata', roots_double: 'Satu punca berulang', roots_complex: 'Tiada punca nyata (kompleks)',
      roots_linear: 'Linear — satu punca', roots_none: 'Tiada penyelesaian', roots_all: 'Benar untuk setiap x',
      studio_title: 'Segi empat sedang terbentuk',
      studio_sub: 'Menyempurnakan kuasa dua, ditunjukkan sebagai luas.',
      graph_title: 'Pada graf',
      graph_sub: 'Tempat lengkung menyentuh paksi-x.',
      step_of: 'Langkah',
      play: 'Main', pause: 'Jeda', prev: 'Undur', next: 'Seterusnya',
      or: 'atau', repeated: 'punca berulang', exact: 'tepat:',
      noReal: 'Tiada nilai nyata yang kuasa duanya negatif — jadi puncanya kompleks.',
      legend_sq: 'segi empat x²', legend_strip: 'jalur separuh (b⁄2 · x)', legend_corner: 'sudut ditambah (b⁄2)²',
      scan_title: 'Imbas soalan',
      scan_sub: 'Halakan kamera ke persamaan kuasa dua bercetak, atau muat naik foto. QuadVision membacanya dan mengisi a, b dan c untuk anda.',
      scan_upload: 'Muat naik foto', scan_camera: 'Guna kamera', scan_reading: 'Sedang membaca imej…',
      scan_found: 'Persamaan dijumpai', scan_use: 'Guna nilai ini', scan_retry: 'Cuba foto lain',
      scan_seen: 'Teks dikesan', scan_none: 'Tiada kuasa dua dikesan. Cuba foto yang lebih jelas dan lurus — atau taip nombornya.',
      scan_tip: 'Petua: teks bercetak jelas seperti 2x² + 3x − 5 = 0 paling sesuai.',
      learn_title: 'Mengapa menyempurnakan kuasa dua berkesan',
      learn_p1: 'Setiap kuasa dua ax² + bx + c menyembunyikan satu segi empat sama sempurna. Sebutan x² ialah segi empat bersisi x. Sebutan bx pula jalur berlebar b yang boleh dibahagi dua dan dililit pada dua sisi segi empat itu.',
      learn_p2: 'Lilitan itu meninggalkan satu sudut kosong. Isikan dengan segi empat kecil (b⁄2)² dan keseluruhan bentuk menjadi segi empat kemas bersisi (x + b⁄2). Idea tunggal ini menukar mana-mana kuasa dua kepada (x + b⁄2)² = satu nombor — dan dari situ, x hanya sepunca kuasa dua jauhnya.',
      learn_p3: 'Di sinilah juga asal rumus kuasa dua: lakukan ini dengan huruf dan bukan nombor, maka x = (−b ± √(b² − 4ac)) ⁄ 2a terhasil terus.',
      team_title: 'Kumpulan kami', team_sub: 'Dibina untuk KMJ Innovation Expo 2026 · Subtema PdP',
      role_lecturer: 'Pensyarah pembimbing', role_leader: 'Ketua kumpulan', role_member: 'Ahli',
      foot_built: 'QuadVision · Inovasi Lestari ke Arah Pendidikan Terbilang',
      foot_made: 'Alat pembelajaran untuk menyempurnakan kuasa dua.',
      placeholder_name: 'Nama',
      nav_play: 'Main', nav_apps: 'Dunia nyata',
      spot_eyebrow: 'Detektif kesilapan', spot_title: 'Kesan kesilapan',
      spot_sub: 'Setiap baris nampak betul pada pandangan pertama. Cari yang melanggar peraturan — kemudian lihat sebabnya.',
      spot_new: 'Satu lagi',
      play_eyebrow: 'Main', play_title: 'Main permainan kuasa dua',
      play_sub: 'Pilih satu daripada tiga permainan kuasa dua dan berlatih — semua dibina dalam halaman.',
      hud_time: 'Masa', hud_score: 'Markah',
      apps_eyebrow: 'Di mana ia wujud', apps_title: 'Kuasa dua dalam dunia sebenar',
      apps_sub: 'Gerakkan gelangsar dan lihat objek sebenar — bola, roket, jambatan — bergerak di sepanjang parabolanya. Verteks dan punca bermakna di sini.',
      apps_play: 'Main gerakan', apps_pause: 'Jeda'
    }
  };

  // lang stores the current language setting (en = English, ms = Bahasa Melayu)
  let lang = 'en';
  // subs holds callback functions that run when the language changes
  const subs = [];

  // t (translate) looks up a key in the dictionary for the current language
  // Falls back to English if the key isn't found in the current language
  function t(key) { return (DICT[lang] && DICT[lang][key]) || (DICT.en[key]) || key; }

  // apply updates all text on the page to show the current language
  function apply(root) {
    // Update all elements with data-i18n attribute (these hold content)
    (root || document).querySelectorAll('[data-i18n]').forEach((el) => {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    // Update all elements with data-i18n-ph attribute (these are placeholders in input fields)
    (root || document).querySelectorAll('[data-i18n-ph]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    // Set the HTML lang attribute so screen readers know the language
    document.documentElement.lang = lang === 'ms' ? 'ms' : 'en';
  }

  // set changes the language to English or Malay and updates everything
  function set(next) {
    // Set to the requested language (default to English if invalid)
    lang = (next === 'ms') ? 'ms' : 'en';
    // Save the choice to browser storage so it persists on reload
    try { localStorage.setItem('qv-lang', lang); } catch (e) {}
    // Update all text on the page
    apply(document);
    // Call all subscribers (functions that need to know about the language change)
    subs.forEach((fn) => fn(lang));
  }

  // init runs once on page load to restore the saved language preference
  function init() {
    // Try to get the saved language from browser storage
    let saved = null;
    try { saved = localStorage.getItem('qv-lang'); } catch (e) {}
    // Default to English unless Malay was explicitly saved
    lang = saved === 'ms' ? 'ms' : 'en';
    // Update the page text
    apply(document);
  }

  // onChange registers a callback function to run when language changes
  function onChange(fn) { subs.push(fn); }
  // current returns the current language code
  function current() { return lang; }
  // labels returns commonly-used translated labels for the math steps
  function labels() { return { or: t('or'), repeated: t('repeated'), exact: t('exact'), noReal: t('noReal') }; }

  return { init, set, apply, t, onChange, current, labels };
})();
