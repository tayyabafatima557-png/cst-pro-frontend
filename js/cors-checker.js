(function () {
  const API_BASE = 'http://localhost:4000';

  const urlInput = document.getElementById('corsUrl');
  const btn = document.getElementById('corsBtn');
  const status = document.getElementById('corsStatus');
  const results = document.getElementById('corsResults');
  const verdict = document.getElementById('corsVerdict');
  const tbody = document.getElementById('corsTableBody');

  function normalizeUrl(raw) {
    if (!/^https?:\/\//i.test(raw)) return 'https://' + raw;
    return raw;
  }

  async function check() {
    const raw = urlInput.value.trim();
    if (!raw) {
      status.textContent = '✗ Enter a URL first.';
      status.style.color = 'var(--danger)';
      return;
    }
    const target = normalizeUrl(raw);
    status.textContent = 'Checking ' + target + ' … (make sure your local backend on port 4000 is running)';
    status.style.color = 'var(--text-dim)';
    results.style.display = 'none';
    tbody.innerHTML = '';

    try {
      const resp = await fetch(API_BASE + '/security-headers?url=' + encodeURIComponent(target));
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Check failed.');

      const cors = data.corsHeaders || {};
      const allowOrigin = cors['access-control-allow-origin'];
      const allowCreds = cors['access-control-allow-credentials'];

      let verdictText = '✓ No CORS headers found — cross-origin requests are blocked by default.';
      let verdictColor = 'var(--success)';

      if (allowOrigin === '*') {
        if (allowCreds === 'true') {
          verdictText = '⚠ CRITICAL: Allow-Origin "*" combined with Allow-Credentials "true" — browsers should reject this, but a misconfigured server here can expose authenticated data to any origin.';
          verdictColor = 'var(--danger)';
        } else {
          verdictText = '⚠ Allow-Origin is "*" — any website can read public responses from this endpoint.';
          verdictColor = '#f5b942';
        }
      } else if (allowOrigin) {
        verdictText = 'ℹ Allow-Origin is restricted to a specific origin: ' + allowOrigin;
        verdictColor = 'var(--cyan)';
      }

      verdict.textContent = verdictText;
      verdict.style.color = verdictColor;
      verdict.style.fontSize = '1.05rem';

      Object.keys(cors).forEach((key) => {
        const value = cors[key];
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid var(--border-glow)';
        let note = '';
        if (key === 'access-control-allow-origin' && value === '*') note = 'Wildcard — any origin allowed';
        if (key === 'access-control-allow-credentials' && value === 'true') note = 'Cookies/auth allowed cross-origin';
        row.innerHTML =
          '<td style="padding:0.75rem 1rem;">' + key + '</td>' +
          '<td style="padding:0.75rem 1rem;color:' + (value ? 'var(--text-primary)' : 'var(--text-dim)') + ';">' + (value || 'not set') + '</td>' +
          '<td style="padding:0.75rem 1rem;color:var(--text-dim);">' + note + '</td>';
        tbody.appendChild(row);
      });

      results.style.display = 'block';
      status.textContent = '✓ Check complete.';
      status.style.color = 'var(--success)';
    } catch (err) {
      status.textContent = '✗ ' + err.message + ' — is your backend running on http://localhost:4000?';
      status.style.color = 'var(--danger)';
    }
  }

  btn.addEventListener('click', check);
  urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
})();