/* ============================================
   NAVIGATION.JS
   Smooth scrolling for in-page anchor links,
   active-link highlighting, and a navbar shadow
   that appears on scroll.
   ============================================ */

(function () {
  function enableSmoothScroll() {
    document.querySelectorAll('.navbar a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function addScrollShadow() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
      } else {
        navbar.style.boxShadow = 'none';
      }
    });
  }

  function highlightActiveLink() {
    const links = document.querySelectorAll('.navbar a[href^="#"]');
    const sections = Array.from(links)
      .map(link => document.getElementById(link.getAttribute('href').slice(1)))
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('active-link'));
          const match = document.querySelector(`.navbar a[href="#${entry.target.id}"]`);
          if (match) match.classList.add('active-link');
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(section => observer.observe(section));
  }

  document.addEventListener('DOMContentLoaded', () => {
    enableSmoothScroll();
    addScrollShadow();
    highlightActiveLink();
  });
})();