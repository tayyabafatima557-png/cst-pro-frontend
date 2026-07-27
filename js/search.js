/* ============================================
   SEARCH.JS
   Injects a search box above the tools grid
   (no HTML edit needed) and filters .tool-card
   elements live by title/description text.
   ============================================ */

(function () {
  function injectSearchBox() {
    const toolsSection = document.getElementById('tools');
    const grid = document.querySelector('.tool-grid');
    if (!toolsSection || !grid) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'max-width:500px;margin:0 auto 40px;position:relative;';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'toolSearchInput';
    input.placeholder = 'Search tools… (e.g. "password", "hash", "network")';
    input.setAttribute('aria-label', 'Search tools');
    input.style.cssText = `
      width: 100%;
      padding: 14px 20px;
      border-radius: 40px;
      border: 1px solid rgba(0,212,255,0.25);
      background: rgba(255,255,255,0.05);
      color: white;
      font-size: 15px;
      outline: none;
    `;

    const noResults = document.createElement('p');
    noResults.id = 'noToolResults';
    noResults.textContent = 'No tools match your search.';
    noResults.style.cssText = 'text-align:center;color:#8ca0b3;display:none;margin-top:20px;';

    wrapper.appendChild(input);
    toolsSection.insertBefore(wrapper, grid);
    grid.insertAdjacentElement('afterend', noResults);

    input.addEventListener('input', () => filterTools(input.value));
  }

  function filterTools(query) {
    const q = query.trim().toLowerCase();
    const cards = document.querySelectorAll('.tool-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
      const matches = title.includes(q) || desc.includes(q);
      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    const noResults = document.getElementById('noToolResults');
    if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  document.addEventListener('DOMContentLoaded', injectSearchBox);
})();