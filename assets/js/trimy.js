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
			if (window.innerWidth > 1024) { setOpen(false); closeAllGroups(); }
		});

		/* submenu accordions. Desktop opens them on hover and focus through CSS
		   alone, so this only has to drive the mobile panel. */
		var groups = nav.querySelectorAll('[data-navgrp]');
		function closeAllGroups() {
			Array.prototype.forEach.call(groups, function (g) {
				g.classList.remove('is-open');
				var b = g.querySelector('.navgrp__t');
				if (b) b.setAttribute('aria-expanded', 'false');
			});
		}
		Array.prototype.forEach.call(groups, function (g) {
			var btn = g.querySelector('.navgrp__t');
			if (!btn) return;
			btn.addEventListener('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				var open = !g.classList.contains('is-open');
				closeAllGroups();
				g.classList.toggle('is-open', open);
				btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			});
		});
		// a section containing the current page starts expanded on mobile
		Array.prototype.forEach.call(groups, function (g) {
			if (g.hasAttribute('data-insection') && window.innerWidth <= 1024) {
				g.classList.add('is-open');
				var b = g.querySelector('.navgrp__t');
				if (b) b.setAttribute('aria-expanded', 'true');
			}
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

	/* ---------- enquiry form -> WhatsApp ----------
	   Fire systems work (installation, maintenance, faults) goes to the
	   Fire Systems line. Everything else, including Bomba renewals and
	   equipment, goes to the Products and General line.                 */
	var FIRE_SYSTEMS = '60127799808', GENERAL = '601155597808';
	var ENQUIRY_EMAIL = 'enquiry@trimyfire.com.my';
	var SYSTEMS_WORK = [
		'New installation or system upgrade',
		'Scheduled maintenance contract',
		'Fault, breakdown or failed inspection'
	];
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

			var status = document.getElementById('form-status');
			var missing = [['f-name', name], ['f-phone', phone], ['f-message', message]]
				.filter(function (f) { return !f[1]; }).map(function (f) { return f[0]; });
			['f-name', 'f-phone', 'f-message'].forEach(function (id) {
				var f = document.getElementById(id);
				if (f) f.setAttribute('aria-invalid', missing.indexOf(id) > -1 ? 'true' : 'false');
			});
			if (missing.length) {
				if (status) {
					status.textContent = 'Please fill in your name, phone and a short description.';
					status.style.color = '#C4341F';
				}
				var first = document.getElementById(missing[0]);
				if (first) first.focus();
				return;
			}
			var body = 'Enquiry from trimyfire.com.my\n\n' +
				'Name: ' + name + '\n' +
				'Phone: ' + phone + '\n' +
				(company ? 'Company: ' + company + '\n' : '') +
				(type ? 'Type of work: ' + type + '\n' : '') +
				'\nDetails:\n' + message;
			var byEmail = e.submitter && e.submitter.value === 'email';
			if (byEmail) {
				// mailto needs no server; the visitor's own mail app sends it
				window.location.href = 'mailto:' + ENQUIRY_EMAIL +
					'?subject=' + encodeURIComponent('Website enquiry' + (type ? ': ' + type : '')) +
					'&body=' + encodeURIComponent(body);
				if (status) {
					status.textContent = 'Your email app should open with the message ready. Press send to reach us. If nothing opened, write to ' + ENQUIRY_EMAIL + '.';
					status.style.color = '';
				}
				return;
			}
			var line = SYSTEMS_WORK.indexOf(type) > -1 ? FIRE_SYSTEMS : GENERAL;
			window.open('https://wa.me/' + line + '?text=' + encodeURIComponent(body), '_blank', 'noopener');
			if (status) {
				status.textContent = 'WhatsApp has opened with your message. Press send in WhatsApp to reach us.';
				status.style.color = '';
			}
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

	/* ---------- gallery arrows ----------
	   Horizontal galleries hid most of their photos from mouse users.   */
	function initGalleries() {
		var chev = function (d) {
			return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="' +
				(d < 0 ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7') +
				'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
		};
		document.querySelectorAll('.gal').forEach(function (gal, n) {
			if (!gal.id) gal.id = 'gal-' + (n + 1);
			var bar = document.createElement('div');
			bar.className = 'gal__ctrl';
			bar.innerHTML =
				'<button type="button" class="gal__btn" data-dir="-1" aria-controls="' + gal.id + '" aria-label="Previous photos">' + chev(-1) + '</button>' +
				'<button type="button" class="gal__btn" data-dir="1" aria-controls="' + gal.id + '" aria-label="Next photos">' + chev(1) + '</button>';
			gal.parentNode.insertBefore(bar, gal);
			var btns = bar.querySelectorAll('button');
			var sync = function () {
				var overflow = gal.scrollWidth > gal.clientWidth + 4;
				bar.hidden = !overflow;
				btns[0].disabled = gal.scrollLeft < 4;
				btns[1].disabled = gal.scrollLeft + gal.clientWidth >= gal.scrollWidth - 4;
			};
			btns.forEach(function (b) {
				b.addEventListener('click', function () {
					gal.scrollBy({ left: +b.getAttribute('data-dir') * gal.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' });
				});
			});
			gal.addEventListener('scroll', sync, { passive: true });
			gal.addEventListener('load', sync, true);   // lazy photos widen the strip as they arrive
			window.addEventListener('resize', sync);
			window.addEventListener('load', sync);
			sync();
		});
	}

	function init() {
		initNav(); initHeader(); initReveal(); initForm(); initCounters(); initVideo(); initGalleries();
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
})();
