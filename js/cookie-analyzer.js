(function () {
  const input = document.getElementById('cookieInput');
  const btn = document.getElementById('cookieBtn');
  const results = document.getElementById('cookieResults');
  const gradeEl = document.getElementById('cookieGrade');
  const tbody = document.getElementById('cookieTableBody');

  function parseCookie(raw) {
    const parts = raw.split(';').map((p) => p.trim()).filter(Boolean);
    const nameValue = parts.shift() || '';
    const attrs = { name: nameValue.split('=')[0] || '(unnamed)' };
    attrs.secure = false;
    attrs.httponly = false;
    attrs.samesite = null;
    attrs.expires = null;
    attrs.domain = null;
    attrs.path = null;

    parts.forEach((p) => {
      const [k, v] = p.split('=');
      const key = k.trim().toLowerCase();
      if (key === 'secure') attrs.secure = true;
      else if (key === 'httponly') attrs.httponly = true;
      else if (key === 'samesite') attrs.samesite = (v || '').trim();
      else if (key === 'expires') attrs.expires = (v || '').trim();
      else if (key === 'domain') attrs.domain = (v || '').trim();
      else if (key === 'path') attrs.path = (v || '').trim();
    });
    return attrs;
  }

  function analyze() {
    const raw = input.value.trim();
    tbody.innerHTML = '';
    if (!raw) return;

    const c = parseCookie(raw);
    const rows = [];
    let score = 0;
    const maxScore = 3;

    if (c.secure) score++;
    rows.push([
      'Secure',
      c.secure,
      c.secure ? 'Cookie is only sent over HTTPS.' : 'Missing — cookie can be sent over plain HTTP, exposing it to interception.'
    ]);

    if (c.httponly) score++;
    rows.push([
      'HttpOnly',
      c.httponly,
      c.httponly ? 'JavaScript cannot read this cookie.' : 'Missing — client-side JS (and XSS payloads) can read this cookie.'
    ]);

    const sameSiteOk = c.samesite && /lax|strict/i.test(c.samesite);
    if (sameSiteOk) score++;
    rows.push([
      'SameSite',
      c.samesite ? c.samesite : false,
      c.samesite
        ? (/none/i.test(c.samesite)
            ? '"None" allows cross-site sending — only safe if paired with Secure and truly needed.'
            : 'Restricts the cookie from being sent on cross-site requests, mitigating CSRF.')
        : 'Missing — defaults vary by browser; explicitly set Lax or Strict to mitigate CSRF.'
    ]);

    rows.push(['Domain', c.domain || 'not set', c.domain ? 'Scoped to: ' + c.domain : 'Defaults to the exact host that set it (narrower scope, generally fine).']);
    rows.push(['Path', c.path || 'not set', c.path ? 'Scoped to: ' + c.path : 'Defaults to "/" if not set.']);
    rows.push(['Expires', c.expires || 'session', c.expires ? 'Persistent cookie — persists after browser close.' : 'Session cookie — cleared when the browser closes (safer for sensitive tokens).']);

    rows.forEach(([label, status, note]) => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid var(--border-glow)';
      let statusHtml;
      if (typeof status === 'boolean') {
        statusHtml = '<span style="color:' + (status ? 'var(--success)' : 'var(--danger)') + ';">' + (status ? '✓ Yes' : '✗ No') + '</span>';
      } else {
        statusHtml = '<span style="color:var(--text-primary);">' + status + '</span>';
      }
      row.innerHTML =
        '<td style="padding:0.75rem 1rem;">' + label + '</td>' +
        '<td style="padding:0.75rem 1rem;">' + statusHtml + '</td>' +
        '<td style="padding:0.75rem 1rem;color:var(--text-dim);">' + note + '</td>';
      tbody.appendChild(row);
    });

    const pct = Math.round((score / maxScore) * 100);
    let letter = 'F', color = 'var(--danger)';
    if (pct === 100) { letter = 'A'; color = 'var(--success)'; }
    else if (pct >= 66) { letter = 'B'; color = 'var(--cyan)'; }
    else if (pct >= 33) { letter = 'C'; color = '#f5b942'; }

    gradeEl.textContent = letter;
    gradeEl.style.color = color;
    results.style.display = 'block';
  }

  btn.addEventListener('click', analyze);
})();