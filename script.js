'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Header scroll + logo přechod ── */
const header    = $('#header');
const heroLogo  = document.getElementById('hero-logo');

/* Práh: logo se přesune do nav jakmile uživatel scrollne o ~80px */
const SCROLL_THRESHOLD = 80;

function updateHeader() {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;

    /* Tmavý header při scrollu */
    header.classList.toggle('scrolled', scrolled);

    /* Hero logo: zmizí při scrollu */
    if (heroLogo) heroLogo.classList.toggle('fade-out', scrolled);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* ── Mobile nav ── */
const navToggle = $('#nav-toggle');
const mainNav   = $('#main-nav');

navToggle.addEventListener('click', () => {
    const open = navToggle.classList.toggle('open');
    mainNav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
});

$$('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

/* ── Scroll reveal (stagger siblings) ── */
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el       = entry.target;
        const siblings = $$('.reveal', el.parentElement);
        const idx      = siblings.indexOf(el);

        setTimeout(() => el.classList.add('visible'), idx * 90);
        revealObs.unobserve(el);
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

$$('.reveal').forEach(el => revealObs.observe(el));

/* ── Gallery image error fallback ── */
$$('.gallery-item img').forEach(img => {
    img.addEventListener('error', () => {
        img.style.display = 'none';
    });
});

/* ── About image error fallback ── */
const aboutImg = $('.about-img-wrap img');
if (aboutImg) {
    aboutImg.addEventListener('error', () => {
        aboutImg.style.display = 'none';
    });
}

/* ── O nás slideshow (5s interval) ── */
(function () {
    const slideshow = document.getElementById('about-slideshow');
    if (!slideshow) return;

    const slides = $$('.slide', slideshow);
    const dots   = $$('.dot',  slideshow);
    let current  = 0;
    let timer;

    function goTo(idx) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (idx + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    function startTimer() {
        timer = setInterval(() => goTo(current + 1), 5000);
    }

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            clearInterval(timer);
            goTo(i);
            startTimer();
        });
    });

    startTimer();
})();

/* ── Video reels: play/pause based on visibility ── */
$$('video[autoplay]').forEach(video => {
    video.addEventListener('error', () => {
        /* Show placeholder if video fails */
        const placeholder = video.nextElementSibling;
        if (placeholder && placeholder.classList.contains('reel-placeholder')) {
            placeholder.style.display = 'flex';
        }
    });

    const videoObs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    }, { threshold: 0.3 });

    videoObs.observe(video);
});

/* ── Contact form ── */
const form       = $('#contact-form');
const formStatus = $('#form-status');

if (form && formStatus) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        formStatus.textContent = '';
        formStatus.className   = 'form-status';

        const name    = form.elements['name'].value.trim();
        const email   = form.elements['email'].value.trim();
        const message = form.elements['message'].value.trim();

        if (!name || !email || !message) {
            formStatus.textContent = 'Vyplňte prosím všechna povinná pole.';
            formStatus.classList.add('error');
            return;
        }

        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailOk) {
            formStatus.textContent = 'Zadejte platnou e-mailovou adresu.';
            formStatus.classList.add('error');
            return;
        }

        /*
         * Zde napojte formulář na váš backend, Formspree nebo Netlify Forms.
         * Příklad Formspree: nastavte action="https://formspree.io/f/VÁŠE_ID"
         * a odeberte e.preventDefault().
         */
        formStatus.textContent = 'Děkujeme! Ozveme se vám co nejdříve. 🎉';
        formStatus.classList.add('success');
        form.reset();
    });
}

/* ── Footer year ── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
