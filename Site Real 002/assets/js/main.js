/* ============================================================
   KMS Power Solutions — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     UTILITY
  ---------------------------------------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }

  /* ----------------------------------------------------------
     STICKY HEADER — shrink on scroll
  ---------------------------------------------------------- */
  const header = $('#site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        header.classList.add('py-2', 'shadow-2xl');
        header.classList.remove('py-4');
      } else {
        header.classList.remove('py-2', 'shadow-2xl');
        header.classList.add('py-4');
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     MOBILE MENU
  ---------------------------------------------------------- */
  const menuBtn  = $('#menu-btn');
  const mobileMenu = $('#mobile-menu');
  const hamburger  = $('#hamburger');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      if (hamburger) hamburger.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open);
    });

    // Close on link click
    $$('a', mobileMenu).forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        if (hamburger) hamburger.classList.remove('open');
      });
    });
  }

  /* ----------------------------------------------------------
     ACTIVE NAV LINK
  ---------------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('text-maroon', 'nav-active');
    }
  });

  /* ----------------------------------------------------------
     GLOBAL QUOTE MODAL
  ---------------------------------------------------------- */
  const modal      = $('#quoteModal');
  const modalInner = $('#quoteModalInner');
  const openBtns   = $$('[data-modal="quote"]');
  const closeBtns  = $$('[data-modal-close]');

  function openModal() {
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    setTimeout(() => modalInner && modalInner.classList.add('modal-enter'), 10);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    if (modalInner) modalInner.classList.remove('modal-enter');
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  // Close on backdrop click
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  /* ----------------------------------------------------------
     ANIMATED COUNTERS
  ---------------------------------------------------------- */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 16);
  }

  /* ----------------------------------------------------------
     INTERSECTION OBSERVER — fade-in + counters
  ---------------------------------------------------------- */
  const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  $$('.fade-in, .stagger-children').forEach(el => fadeObserver.observe(el));

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  $$('[data-target]').forEach(el => counterObserver.observe(el));

  /* ----------------------------------------------------------
     TESTIMONIAL SLIDER (auto-rotate)
  ---------------------------------------------------------- */
  const testimonialTrack = $('#testimonial-track');
  const testimonialDots  = $$('.testimonial-dot');
  let testimonialIndex = 0;
  let testimonialTimer;

  function goToTestimonial(idx) {
    if (!testimonialTrack) return;
    const cards = $$('.testimonial-card', testimonialTrack);
    testimonialIndex = (idx + cards.length) % cards.length;
    testimonialTrack.style.transform = `translateX(-${testimonialIndex * 100}%)`;
    testimonialDots.forEach((d, i) => {
      d.classList.toggle('bg-maroon', i === testimonialIndex);
      d.classList.toggle('bg-gray-600', i !== testimonialIndex);
    });
  }

  function startTestimonialTimer() {
    clearInterval(testimonialTimer);
    testimonialTimer = setInterval(() => goToTestimonial(testimonialIndex + 1), 5000);
  }

  if (testimonialTrack) {
    testimonialDots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goToTestimonial(i); startTestimonialTimer(); });
    });
    const prevBtn = $('#testimonial-prev');
    const nextBtn = $('#testimonial-next');
    if (prevBtn) prevBtn.addEventListener('click', () => { goToTestimonial(testimonialIndex - 1); startTestimonialTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goToTestimonial(testimonialIndex + 1); startTestimonialTimer(); });
    startTestimonialTimer();
  }

  /* ----------------------------------------------------------
     PRODUCT FILTER (products.html)
  ---------------------------------------------------------- */
  const filterBtns = $$('[data-filter]');
  const productCards = $$('[data-category]');

  if (filterBtns.length && productCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        filterBtns.forEach(b => {
          b.classList.remove('bg-maroon', 'text-white');
          b.classList.add('bg-gray-800', 'text-gray-300');
        });
        btn.classList.add('bg-maroon', 'text-white');
        btn.classList.remove('bg-gray-800', 'text-gray-300');

        productCards.forEach(card => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          if (match) {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
            card.style.display = '';
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => { if (!match) card.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     NETLIFY FORMS — success message
  ---------------------------------------------------------- */
  function handleFormSuccess(form, successId) {
    if (!form) return;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const data = new FormData(form);
      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString()
        });
        if (res.ok) {
          form.style.display = 'none';
          const msg = document.getElementById(successId);
          if (msg) msg.classList.remove('hidden');
        }
      } catch (err) {
        console.error('Form submission error:', err);
      }
    });
  }

  handleFormSuccess($('#quote-form'), 'quote-success');
  handleFormSuccess($('#contact-form'), 'contact-success');

  /* ----------------------------------------------------------
     SCROLL-TO-TOP BUTTON
  ---------------------------------------------------------- */
  const scrollTopBtn = $('#scroll-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('opacity-100', window.scrollY > 400);
      scrollTopBtn.classList.toggle('opacity-0', window.scrollY <= 400);
      scrollTopBtn.classList.toggle('pointer-events-none', window.scrollY <= 400);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

})();
