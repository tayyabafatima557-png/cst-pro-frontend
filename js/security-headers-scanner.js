(function () {
  // Your local backend from server.js (port scanner backend)
  const API_BASE = 'http://localhost:4000';

  const urlInput = document.getElementById('shsUrl');
  const btn = document.getElementById('shsBtn');
  const status = document.getElementById('shsStatus');
  const results = document.getElementById('shsResults');
  const gradeEl = document.getElementById('shsGrade');
  const scoreText = document.getElementById('shsScoreText');
  const tbody = document.getElementById('shsTableBody');

  const CHECKS = [
    {
      key: 'strict-transport-security',
      name: 'Strict-Transport-Security (HSTS)',
      weight: 20,
      good: (v) => !!v,
      advice: 'Add e.g. "max-age=63072000; includeSubDomains; preload" to force HTTPS.'
    },
    {
      key: 'content-security-policy',
      name: 'Content-Security-Policy',
      weight: 25,
      good: (v) => !!v,
      advice: 'Define a CSP to restrict script/style/frame sources. Use the CSP Generator tool.'
    },
    {
      key: 'x-frame-options',
      name: 'X-Frame-Options',
      weight: 15,
      good: (v) => !!v && /deny|sameorigin/i.test(v),
      advice: 'Set to "DENY" or "SAMEORIGIN" to prevent clickjacking (or use CSP frame-ancestors).'
    },
    {
      key: 'x-content-type-options',
      name: 'X-Content-Type-Options',
      weight: 15,
      good: (v) => !!v && /nosniff/i.test(v),
      advice: 'Set to "nosniff" to stop MIME-type sniffing attacks.'
    },
    {
      key: 'referrer-policy',
      name: 'Referrer-Policy',
      weight: 10,
      good: (v) => !!v,
      advice: 'Set e.g. "strict-origin-when-cross-origin" to limit referrer leakage.'
    },
    {
      key: 'permissions-policy',
      name: 'Permissions-Policy',
      weight: 10,
      good: (v) => !!v,
      advice: 'Restrict powerful browser features (camera, mic, geolocation) you don\'t use.'
    }
  ];

  function gradeFromScore(pct) {
    if (pct >= 90) return { letter: 'A', color: 'var(--success)' };
    if (pct >= 75) return { letter: 'B', color: 'var(--cyan)' };
    if (pct >= 55) return { letter: 'C', color: '#f5b942' };
    if (pct >= 35) return { letter: 'D', color: '#f57c42' };
    return { letter: 'F', color: 'var(--danger)' };
  }

  function normalizeUrl(raw) {
    if (!/^https?:\/\//i.test(raw)) return 'https://' + raw;
    return raw;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function scan() {
    const raw = urlInput.value.trim();
    if (!raw) {
      status.textContent = '✗ Enter a URL first.';
      status.style.color = 'var(--danger)';
      return;
    }

    const target = normalizeUrl(raw);
    status.textContent = 'Scanning ' + target + ' … (make sure your local backend on port 4000 is running)';
    status.style.color = 'var(--text-dim)';
    results.style.display = 'none';
    tbody.innerHTML = '';

    try {
      const resp = await fetch(API_BASE + '/security-headers?url=' + encodeURIComponent(target));
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Scan failed.');
      }

      const sh = data.securityHeaders || {};

      let earned = 0;
      let total = 0;

      CHECKS.forEach((check) => {
        total += check.weight;
        const value = sh[check.key];
        const passed = check.good(value);
        if (passed) earned += check.weight;

        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid var(--border-glow)';
        row.innerHTML =
          '<td style="padding:0.75rem 1rem;">' + check.name + '</td>' +
          '<td style="padding:0.75rem 1rem;color:' + (passed ? 'var(--success)' : 'var(--danger)') + ';">' +
            (passed ? '✓ Present' : '✗ Missing') + '</td>' +
          '<td style="padding:0.75rem 1rem;color:var(--text-dim);">' +
            (value ? escapeHtml(value) : check.advice) + '</td>';
        tbody.appendChild(row);
      });

      const pct = Math.round((earned / total) * 100);
      const grade = gradeFromScore(pct);
      gradeEl.textContent = grade.letter;
      gradeEl.style.color = grade.color;
      scoreText.textContent = pct + '% of security headers configured (HTTP status ' + data.status + ', final URL: ' + data.finalUrl + ').';

      results.style.display = 'block';
      status.textContent = '✓ Scan complete.';
      status.style.color = 'var(--success)';
    } catch (err) {
      status.textContent = '✗ ' + err.message + ' — is your backend running on http://localhost:4000?';
      status.style.color = 'var(--danger)';
    }
  }

  btn.addEventListener('click', scan);
  urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') scan(); });
})();