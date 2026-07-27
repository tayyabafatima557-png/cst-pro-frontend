(function () {
  const input = document.getElementById('hashInput');
  const compareA = document.getElementById('hashCompareA');
  const compareB = document.getElementById('hashCompareB');
  const compareResult = document.getElementById('compareResult');

  async function sha(algo, text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest(algo, enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function updateHashes() {
    const text = input.value;
    const rows = document.querySelectorAll('.hash-row');
    if (!text) {
      rows.forEach(r => r.querySelector('input').value = '—');
      return;
    }

    for (const row of rows) {
      const algo = row.dataset.algo;
      const field = row.querySelector('input');
      if (algo === 'MD5') {
        field.value = md5(text); // from blueimp-md5 CDN
      } else {
        field.value = await sha(algo, text);
      }
    }
  }

  input.addEventListener('input', updateHashes);

  document.querySelectorAll('.copy-hash').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.previousElementSibling;
      copyToClipboard(field.value, 'Hash copied');
    });
  });

  function compareHashes() {
    const a = compareA.value.trim().toLowerCase();
    const b = compareB.value.trim().toLowerCase();
    if (!a || !b) {
      compareResult.textContent = 'Enter two hashes to compare.';
      compareResult.style.color = 'var(--text-dim)';
      return;
    }
    if (a === b) {
      compareResult.textContent = '✓ Match — the hashes are identical.';
      compareResult.style.color = 'var(--success)';
    } else {
      compareResult.textContent = '✗ No match — the hashes are different.';
      compareResult.style.color = 'var(--danger)';
    }
  }

  compareA.addEventListener('input', compareHashes);
  compareB.addEventListener('input', compareHashes);
})();