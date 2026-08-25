/* =============================================================================
   Trimy Fire Tech — premium interaction driver
   Drives scroll reveals and the sticky-header state. Vanilla JS, no deps,
   no jQuery. Degrades gracefully: if anything is unsupported the page simply
   renders fully visible.
   ========================================================================== */
(function () {
	'use strict';

	var reduceMotion = window.matchMedia &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------------------------------------------------------------------
	   Scroll reveal
	   --------------------------------------------------------------------- */
	function initReveals() {
		var targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
		if (!targets.length) return;

		// No IntersectionObserver (or reduced motion): show everything at once.
		if (reduceMotion || !('IntersectionObserver' in window)) {
			for (var i = 0; i < targets.length; i++) {
				targets[i].classList.add('is-visible');
			}
			return;
		}

		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target); // reveal once, then stop watching
			});
		}, {
			root: null,
			rootMargin: '0px 0px -12% 0px',
			threshold: 0.12
		});

		for (var j = 0; j < targets.length; j++) {
			observer.observe(targets[j]);
		}
	}

	/* ---------------------------------------------------------------------
	   Header shadow once scrolled
	   --------------------------------------------------------------------- */
	function initHeader() {
		var header = document.getElementById('header');
		if (!header) return;

		var ticking = false;

		function update() {
			header.classList.toggle('trimy-scrolled', window.pageYOffset > 60);
			ticking = false;
		}

		window.addEventListener('scroll', function () {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(update);
		}, { passive: true });

		update();
	}

	function init() {
		initReveals();
		initHeader();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
