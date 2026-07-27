/* ============================================
   THEME.JS
   Dark/Light mode toggle.
   Injects a toggle button into the navbar so you
   don't have to edit index.html to add one.
   Preference is saved in localStorage.
   ============================================ */

(function () {
  const STORAGE_KEY = 'cst-theme';

  function applyTheme(theme) {
    document.body.classList.toggle('light-mode', theme === 'light');
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
  }

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  }

  function toggleTheme() {
    const current = getSavedTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  function injectToggleButton() {
    const navbar = document.querySelector('.navbar ul');
    if (!navbar) return;

    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.id = 'themeToggleBtn';
    btn.setAttribute('aria-label', 'Toggle dark or light mode');
    btn.style.cssText = `
      background: rgba(0,212,255,0.08);
      border: 1px solid rgba(0,212,255,0.3);
      color: #00d4ff;
      border-radius: 50%;
      width: 34px;
      height: 34px;
      cursor: pointer;
      font-size: 15px;
      line-height: 1;
    `;
    btn.addEventListener('click', toggleTheme);

    li.appendChild(btn);
    navbar.appendChild(li);
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getSavedTheme());
    injectToggleButton();
  });
})();