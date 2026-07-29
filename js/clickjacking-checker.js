(function () {
  const API_BASE = 'http://localhost:4000';

  const urlInput = document.getElementById('cjUrl');
  const btn = document.getElementById('cjBtn');
  const status = document.getElementById('cjStatus');
  const results = document.getElementById('cjResults');
  const verdict = document.getElementById('cjVerdict');
  const detail = document.getElementById('cjDetail');
  const frame = document.getElementById('cjFrame');

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
    frame.src = 'about:blank';

    try {
      const resp = await fetch(API_BASE + '/security-headers?url=' + encodeURIComponent(target));
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Check failed.');

      const sh = data.securityHeaders || {};
      const xfo = sh['x-frame-options'];
      const csp = sh['content-security-policy'] || '';
      const hasFrameAncestors = /frame-ancestors/i.test(csp);

      let protectedSite = false;
      let reason = '';

      if (xfo && /deny|sameorigin/i.test(xfo)) {
        protectedSite = true;
        reason = 'X-Frame-Options: ' + xfo;
      } else if (hasFrameAncestors) {
        protectedSite = true;
        const match = csp.match(/frame-ancestors[^;]*/i);
        reason = 'CSP ' + (match ? match[0] : 'frame-ancestors directive found');
      } else {
        reason = 'No X-Frame-Options or CSP frame-ancestors directive found.';
      }

      verdict.textContent = protectedSite ? '🛡 Protected from framing' : '⚠ Potentially vulnerable to clickjacking';
      verdict.style.color = protectedSite ? 'var(--success)' : 'var(--danger)';
      detail.textContent = reason + ' (final URL after redirects: ' + data.finalUrl + ')';

      results.style.display = 'block';
      status.textContent = '✓ Check complete. Loading live embed test below…';
      status.style.color = 'var(--success)';

      // Live embed attempt — the browser itself enforces XFO/CSP here
      frame.src = target;
    } catch (err) {
      status.textContent = '✗ ' + err.message + ' — is your backend running on http://localhost:4000?';
      status.style.color = 'var(--danger)';
    }
  }

  btn.addEventListener('click', check);
  urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
})();