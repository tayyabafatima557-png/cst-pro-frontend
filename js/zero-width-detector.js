(function () {
  const input = document.getElementById('zwInput');
  const scanBtn = document.getElementById('zwScanBtn');
  const cleanBtn = document.getElementById('zwCleanBtn');
  const resultsBox = document.getElementById('zwResults');
  const summaryEl = document.getElementById('zwSummary');
  const breakdownEl = document.getElementById('zwBreakdown');

  const ZERO_WIDTH_CHARS = {
    '\u200B': 'Zero Width Space',
    '\u200C': 'Zero Width Non-Joiner',
    '\u200D': 'Zero Width Joiner',
    '\uFEFF': 'Zero Width No-Break Space (BOM)',
    '\u2060': 'Word Joiner',
    '\u180E': 'Mongolian Vowel Separator',
    '\u200E': 'Left-to-Right Mark',
    '\u200F': 'Right-to-Left Mark',
    '\u2062': 'Invisible Times',
    '\u2063': 'Invisible Separator',
    '\u2064': 'Invisible Plus'
  };

  function scan() {
    const text = input.value;
    const found = {};
    let total = 0;

    for (const char of text) {
      if (ZERO_WIDTH_CHARS[char]) {
        found[char] = (found[char] || 0) + 1;
        total++;
      }
    }

    resultsBox.style.display = 'block';

    if (total === 0) {
      summaryEl.innerHTML = `<p style="color:var(--success);font-size:1.1rem;">✅ No hidden zero-width characters detected.</p>`;
      breakdownEl.innerHTML = '';
      return;
    }

    summaryEl.innerHTML = `<p style="color:var(--danger);font-size:1.1rem;font-weight:700;">⚠️ ${total} hidden character${total !== 1 ? 's' : ''} found</p><p style="color:var(--text-dim);font-size:0.85rem;margin-top:0.3rem;">This text may contain a hidden watermark, tracking fingerprint, or steganographic payload.</p>`;

    breakdownEl.innerHTML = Object.entries(found).map(([char, count]) => `
      <div style="display:flex;justify-content:space-between;background:var(--bg-panel-raised);border-radius:6px;padding:0.6rem 1rem;">
        <span style="color:var(--cyan);">${ZERO_WIDTH_CHARS[char]}</span>
        <span style="color:var(--warning);">×${count} <code style="color:var(--text-dim);">(U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})</code></span>
      </div>
    `).join('');
  }

  function copyClean() {
    let cleaned = input.value;
    for (const char of Object.keys(ZERO_WIDTH_CHARS)) {
      cleaned = cleaned.split(char).join('');
    }
    navigator.clipboard.writeText(cleaned).then(() => {
      cleanBtn.textContent = 'Copied!';
      setTimeout(() => { cleanBtn.textContent = 'Copy Cleaned Text'; }, 1500);
    });
  }

  scanBtn.addEventListener('click', scan);
  cleanBtn.addEventListener('click', copyClean);
})();