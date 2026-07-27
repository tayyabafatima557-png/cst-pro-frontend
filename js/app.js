/* ============================================
   APP.JS
   Main homepage initializer. Animates the stats
   section counters when they scroll into view.
   ============================================ */

(function () {
  function animateStatCounters() {
    const statEls = document.querySelectorAll('.stat-card h2');
    if (statEls.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const raw = el.textContent.trim();
        const match = raw.match(/^(\d+)(.*)$/); // e.g. "12+" -> 12, "+"

        if (match) {
          const target = parseInt(match[1], 10);
          const suffix = match[2];
          let current = 0;
          const step = Math.max(1, Math.ceil(target / 30));

          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            el.textContent = current + suffix;
          }, 30);
        }
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    statEls.forEach(el => observer.observe(el));
  }

  document.addEventListener('DOMContentLoaded', () => {
    animateStatCounters();
  });
})();