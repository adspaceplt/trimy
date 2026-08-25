/* =============================================================================
   Trimy Fire Tech — site behaviour
   Vanilla JS, no dependencies. Everything degrades gracefully.
   ========================================================================== */
(function () {
	'use strict';

	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------- mobile navigation ---------- */
	function initNav() {
		var toggle = document.querySelector('.navtoggle');
		var nav = document.querySelector('.nav');
		if (!toggle || !nav) return;

		var scrim = document.createElement('div');
		scrim.className = 'navscrim';
		document.body.appendChild(scrim);

		function setOpen(open) {
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			nav.classList.toggle('is-open', open);
			scrim.classList.toggle('is-open', open);
			document.body.classList.toggle('nav-open', open);
		}

		toggle.addEventListener('click', function () {
			setOpen(toggle.getAttribute('aria-expanded') !== 'true');
		});
		scrim.addEventListener('click', function () { setOpen(false); });
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') setOpen(false);
		});
		nav.addEventListener('click', function (e) {
			if (e.target.tagName === 'A') setOpen(false);
		});
		// reset when resizing back to desktop
		window.addEventListener('resize', function () {
			if (window.innerWidth > 900) setOpen(false);
		});
	}

	/* ---------- sticky header shadow ---------- */
	function initHeader() {
		var hdr = document.querySelector('.hdr');
		if (!hdr) return;
		var ticking = false;
		function update() { hdr.classList.toggle('is-scrolled', window.pageYOffset > 20); ticking = false; }
		window.addEventListener('scroll', function () {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(update);
		}, { passive: true });
		update();
	}

	/* ---------- scroll reveal ---------- */
	function initReveal() {
		var els = document.querySelectorAll('[data-reveal], [data-reveal-group]');
		if (!els.length) return;
		if (reduce || !('IntersectionObserver' in window)) {
			for (var i = 0; i < els.length; i++) els[i].classList.add('is-in');
			return;
		}
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (!en.isIntersecting) return;
				en.target.classList.add('is-in');
				io.unobserve(en.target);
			});
		}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
		for (var j = 0; j < els.length; j++) io.observe(els[j]);
	}

	/* ---------- WhatsApp job router ----------
	   Each [data-job] sends a pre-written enquiry so the first message
	   already says what the job is.                                    */
	function initRouter() {
		var WA = '60127799808';
		document.querySelectorAll('[data-job]').forEach(function (el) {
			el.addEventListener('click', function () {
				var msg = 'Hello Trimy Fire Tech,\n\nEnquiry: ' + el.getAttribute('data-job') +
					'\n\nSite / building:\nLocation:\nWhen you need it:\n\nThank you.';
				window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
			});
		});
	}

	/* ---------- enquiry form -> WhatsApp ---------- */
	function initForm() {
		var form = document.getElementById('enquiry');
		if (!form) return;
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			var val = function (id) {
				var f = document.getElementById(id);
				return f ? f.value.trim() : '';
			};
			var name = val('f-name'), phone = val('f-phone'), company = val('f-company'),
			    type = val('f-type'), message = val('f-message');

			if (!name || !phone || !message) {
				var status = document.getElementById('form-status');
				if (status) {
					status.textContent = 'Please fill in your name, phone and a short description.';
					status.style.color = '#C4341F';
				}
				return;
			}
			var body = 'Enquiry from trimyfire.com.my\n\n' +
				'Name: ' + name + '\n' +
				'Phone: ' + phone + '\n' +
				(company ? 'Company: ' + company + '\n' : '') +
				(type ? 'Type of work: ' + type + '\n' : '') +
				'\nDetails:\n' + message;
			window.open('https://wa.me/60127799808?text=' + encodeURIComponent(body), '_blank', 'noopener');
		});
	}

	/* ---------- animated counters ---------- */
	function initCounters() {
		var els = document.querySelectorAll('[data-count]');
		if (!els.length) return;
		if (reduce || !('IntersectionObserver' in window)) {
			els.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
			return;
		}
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (!en.isIntersecting) return;
				var el = en.target, target = parseInt(el.getAttribute('data-count'), 10), t0 = null;
				function tick(ts) {
					if (!t0) t0 = ts;
					var p = Math.min((ts - t0) / 1400, 1);
					el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
					if (p < 1) requestAnimationFrame(tick);
					else el.textContent = target;
				}
				requestAnimationFrame(tick);
				io.unobserve(el);
			});
		}, { threshold: 0.5 });
		els.forEach(function (el) { io.observe(el); });
	}

	/* ---------- company video: load only on demand ---------- */
	function initVideo() {
		var btn = document.querySelector('.vplay');
		var vid = document.getElementById('company-video');
		if (!btn || !vid) return;

		btn.addEventListener('click', function () {
			btn.hidden = true;
			vid.preload = 'auto';
			vid.controls = true;   // native controls only once playback starts
			var p = vid.play();
			if (p && p.catch) p.catch(function () {
				btn.hidden = false;
				vid.controls = false;
			});
		});
		vid.addEventListener('pause', function () {
			if (vid.currentTime === 0) btn.hidden = false;
		});
	}

	function init() {
		initNav(); initHeader(); initReveal(); initRouter(); initForm(); initCounters(); initVideo();
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
})();
