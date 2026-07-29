(function () {
  const buttons = document.querySelectorAll('.category-filter-btn');
  const cards = document.querySelectorAll('.tool-card');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active-filter'));
      btn.classList.add('active-filter');

      const cat = btn.dataset.category;
      cards.forEach((card) => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();