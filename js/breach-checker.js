(function () {
  const input = document.getElementById('breachInput');
  const btn = document.getElementById('breachCheckBtn');
  const loading = document.getElementById('breachLoading');
  const errorEl = document.getElementById('breachError');
  const resultBox = document.getElementById('breachResult');
  const resultContent = document.getElementById('breachResultContent');

  async function sha1(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  async function checkBreach() {
    const password = input.value;
    if (!password) return;

    errorEl.textContent = '';
    resultBox.style.display = 'none';
    loading.style.display = 'block';

    try {
      const fullHash = await sha1(password);
      const prefix = fullHash.slice(0, 5);
      const suffix = fullHash.slice(5);

      const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await res.text();
      loading.style.display = 'none';

      const lines = text.split('\n');
      let count = 0;
      for (const line of lines) {
        const [lineSuffix, lineCount] = line.trim().split(':');
        if (lineSuffix === suffix) {
          count = parseInt(lineCount, 10);
          break;
        }
      }

      if (count > 0) {
        resultContent.innerHTML = `
          <p style="font-size:2.5rem;">⚠️</p>
          <p style="color:var(--danger);font-size:1.3rem;font-weight:700;font-family:var(--font-display);">Password Found in ${count.toLocaleString()} Breaches</p>
          <p style="color:var(--text-dim);margin-top:0.5rem;">This password is known to attackers. Change it immediately wherever it's used.</p>
        `;
      } else {
        resultContent.innerHTML = `
          <p style="font-size:2.5rem;">✅</p>
          <p style="color:var(--success);font-size:1.3rem;font-weight:700;font-family:var(--font-display);">Not Found in Known Breaches</p>
          <p style="color:var(--text-dim);margin-top:0.5rem;">This password doesn't appear in the Pwned Passwords dataset — but that alone doesn't guarantee it's strong.</p>
        `;
      }
      resultBox.style.display = 'block';
    } catch (err) {
      loading.style.display = 'none';
      errorEl.textContent = 'Could not check password — network error.';
    }
  }

  btn.addEventListener('click', checkBreach);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkBreach(); });
})();