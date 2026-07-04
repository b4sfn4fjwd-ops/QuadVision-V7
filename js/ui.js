/* ============================================================================
   ui.js  —  small "polish" layer (added for the professional / Apple-style look)

   PLAIN ENGLISH:
   This file does two gentle visual things. It has NO effect on the maths.
     1) "Scroll reveal" — cards and headings fade and slide up softly the first
        time they scroll into view (like the Apple product pages).
     2) "Active nav" — the menu link for the section you're currently looking at
        gets highlighted as you scroll.
   It uses the browser's built-in IntersectionObserver (a tool that tells us when
   an element enters the screen). No external libraries. If the visitor prefers
   reduced motion, everything just appears instantly with no animation.
   ========================================================================== */
(function () {
  'use strict';

  // Check if the user prefers reduced motion (for accessibility)
  // This respects system settings from people who have motion sensitivity
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ready runs a function once the DOM is fully loaded
  function ready(fn) {
    // If DOM is already loaded, run immediately
    if (document.readyState !== 'loading') fn();
    // Otherwise wait for DOMContentLoaded
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    /* ---- 1) Scroll reveal ----- Cards and headings fade in as you scroll down */
    // Pick all the elements we want to animate
    var selector = '.sec-head, .solver, .panel, .hl-card, .scan-card, .scan-side, .learn-card, .team-card, .member, .demo-card, .j-track, .j-step, .mascot-card';
    var items = Array.prototype.slice.call(document.querySelectorAll(selector));
    // Add "reveal" class to all of them so CSS can hide them initially
    items.forEach(function (el) { el.classList.add('reveal'); });

    if (reduce || !('IntersectionObserver' in window)) {
      // If user prefers no motion or browser is too old, just show everything immediately
      items.forEach(function (el) { el.classList.add('in'); });
    } else {
      // Use IntersectionObserver to watch when elements enter the viewport
      var io = new IntersectionObserver(function (entries) {
        // When an element enters the screen
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            // Add "in" class to trigger the fade-up animation
            e.target.classList.add('in');
            // Stop observing this element (animation only happens once)
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

      // Add a stagger effect: each group of 4 cards animates in sequence
      items.forEach(function (el, i) {
        el.style.setProperty('--rd', (i % 4) * 60 + 'ms');  // Set animation delay via CSS variable
        io.observe(el);  // Start watching this element
      });
    }

    /* ---- 1b) Top bar lift ----- the bar gains a shadow + solidifies once the
       page is scrolled, so it "floats" above the content (Apple-style). */
    var bar = document.querySelector('.topbar');
    if (bar) {
      var onScroll = function () { bar.classList.toggle('scrolled', window.scrollY > 8); };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---- 1c) Scroll progress ----- a slim gradient line under the top bar that
       fills left-to-right as you read down the page. */
    var prog = document.createElement('div');
    prog.id = 'scrollProgress';
    prog.setAttribute('aria-hidden', 'true');
    document.body.appendChild(prog);
    var onProg = function () {
      var doc = document.documentElement;
      var max = Math.max(1, doc.scrollHeight - window.innerHeight);
      prog.style.width = Math.min(100, (window.scrollY / max) * 100) + '%';
    };
    onProg();
    window.addEventListener('scroll', onProg, { passive: true });
    window.addEventListener('resize', onProg);

    /* ---- 1d) Landing hero CTAs ----- "Visualize My First Equation" preloads
       x²+6x+5 and fires the real visualiser; "Watch Live Demo" replays the
       hero's self-solving demonstration with a soft ping. */
    var hs = document.getElementById('btnHeroStart');
    if (hs) hs.addEventListener('click', function () {
      var a = document.getElementById('inA'), b = document.getElementById('inB'), cc = document.getElementById('inC');
      if (a && b && cc) {
        a.value = 1; b.value = 6; cc.value = 5;
        try { b.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) { }
      }
      var bv = document.getElementById('btnVisualise');
      if (bv) bv.click();
    });
    var hd = document.getElementById('btnHeroDemo');
    if (hd) hd.addEventListener('click', function () {
      try { if (window.LiveDemo && LiveDemo.replay) LiveDemo.replay(); } catch (e) { }
      var card = document.getElementById('demoCard');
      if (card) {
        card.classList.remove('pulse'); void card.offsetWidth; card.classList.add('pulse');
        if (card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    /* ---- 1e) Meet Squary ----- when the section scrolls in, the real mascot
       walks over to his dock and speaks the three welcome lines (timed to the
       bubbles fading in). Never breaks the page if the mascot is absent. */
    var meetSec = document.getElementById('meet');
    if (meetSec && 'IntersectionObserver' in window) {
      var met = false;
      var mio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting || met) return;
          met = true; mio.disconnect();
          try {
            if (!window.Squary || reduce) return;
            var t = function (k, fb) { try { return (window.I18N && I18N.t(k)) || fb; } catch (x) { return fb; } };
            Squary.moveTo('#squaryDock', { side: 'left', then: 'wave' });
            setTimeout(function () { try { Squary.say(t('meet_1', 'Hi! I\u2019m Squary.'), { state: 'wave', hold: 2100 }); } catch (x) { } }, 1150);
            setTimeout(function () { try { Squary.say(t('meet_2', 'I\u2019ll help you see mathematics in a completely different way.'), { state: 'happy', hold: 2300 }); } catch (x) { } }, 3350);
            setTimeout(function () { try { Squary.say(t('meet_3', 'Let\u2019s complete our first square together.'), { state: 'happy', hold: 2600 }); } catch (x) { } }, 5750);
          } catch (e2) { }
        });
      }, { threshold: 0.4 });
      mio.observe(meetSec);
    }

    /* ---- 2) Active nav link ----- Highlight which section you're currently viewing */
    // Get all nav links that point to sections
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
    // Create a map connecting each link to its corresponding section
    var map = {};
    links.forEach(function (a) {
      // Extract the section ID from the link's href
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      // Store the link and section together
      if (sec) map[id] = { a: a, s: sec };
    });
    var ids = Object.keys(map);

    // Watch which section is in the middle of the screen
    if (ids.length && 'IntersectionObserver' in window) {
      var nav = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            // When a section is visible, highlight its corresponding nav link
            ids.forEach(function (id) {
              // Add "active" class only to the link for the current section
              map[id].a.classList.toggle('active', id === e.target.id);
            });
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });  // Watch for sections in the middle of screen
      // Start watching each section
      ids.forEach(function (id) { nav.observe(map[id].s); });
    }
  });
})();
