/* Signed House Plans — main.js
   WP: enqueue as 'shp-main' (in_footer: true) in functions.php */
(function () {
  'use strict';

  // Mobile navigation toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 820 && nav.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  // FAQ category links: scroll to the section (all sections stay visible)
  // and highlight the category currently in view.
  var faqLinks = document.querySelectorAll('[data-faq-filter]');
  var faqGroups = document.querySelectorAll('[data-faq-group]');

  if (faqLinks.length && faqGroups.length) {
    var OFFSET = 140; // sticky header + breathing room
    var lockUntil = 0;

    var setActive = function (key) {
      for (var k = 0; k < faqLinks.length; k++) {
        var active = faqLinks[k].getAttribute('data-faq-filter') === key;
        faqLinks[k].classList.toggle('is-active', active);
        if (active) { faqLinks[k].setAttribute('aria-current', 'true'); }
        else { faqLinks[k].removeAttribute('aria-current'); }
      }
    };

    var currentGroup = function () {
      var key = 'all';
      for (var g = 0; g < faqGroups.length; g++) {
        if (faqGroups[g].getBoundingClientRect().top - OFFSET <= 1) {
          key = faqGroups[g].getAttribute('data-faq-group');
        }
      }
      // At the very bottom, the last group may never reach the offset line
      if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 2) {
        key = faqGroups[faqGroups.length - 1].getAttribute('data-faq-group');
      }
      return key;
    };

    for (var f = 0; f < faqLinks.length; f++) {
      faqLinks[f].addEventListener('click', function (e) {
        var key = this.getAttribute('data-faq-filter');
        var target = document.getElementById(key === 'all' ? 'faq-all' : key);
        if (!target) { return; }
        e.preventDefault();
        setActive(key);
        lockUntil = Date.now() + 900; // keep clicked item active while smooth-scrolling
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', key === 'all' ? window.location.pathname : '#' + key);
        }
      });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) { return; }
      ticking = true;
      window.requestAnimationFrame(function () {
        if (Date.now() > lockUntil) { setActive(currentGroup()); }
        ticking = false;
      });
    }, { passive: true });

    // Deep links from other pages, e.g. faq.html#permitting
    var hashKey = window.location.hash.slice(1);
    if (hashKey && document.querySelector('[data-faq-group="' + hashKey + '"]')) {
      setActive(hashKey);
      lockUntil = Date.now() + 600;
    }
  }

  // Contact form: client-side required-field check (server handling comes from the WP form plugin)
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var status = contactForm.querySelector('.form-status');
    contactForm.addEventListener('submit', function (e) {
      var fields = contactForm.querySelectorAll('[required]');
      var firstBad = null;
      for (var c = 0; c < fields.length; c++) {
        var bad = !fields[c].checkValidity();
        fields[c].classList.toggle('is-invalid', bad);
        fields[c].setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad && !firstBad) { firstBad = fields[c]; }
      }
      if (firstBad) {
        e.preventDefault();
        if (status) { status.textContent = 'Please complete the required fields marked with *.'; }
        firstBad.focus();
      } else if (status) {
        status.textContent = '';
      }
    });
    contactForm.addEventListener('input', function (e) {
      if (e.target.classList.contains('is-invalid') && e.target.checkValidity()) {
        e.target.classList.remove('is-invalid');
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }

  // Footer year
  var years = document.querySelectorAll('.js-year');
  for (var i = 0; i < years.length; i++) {
    years[i].textContent = String(new Date().getFullYear());
  }
})();
