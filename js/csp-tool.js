(function () {
  // ---------- shared tab logic ----------
  const tabGenBtn = document.getElementById('tabGenBtn');
  const tabAnaBtn = document.getElementById('tabAnaBtn');
  const genPanel = document.getElementById('cspGenPanel');
  const anaPanel = document.getElementById('cspAnaPanel');

  function showGen() {
    genPanel.style.display = 'block';
    anaPanel.style.display = 'none';
    tabGenBtn.style.opacity = '1';
    tabAnaBtn.style.opacity = '0.55';
  }
  function showAna() {
    genPanel.style.display = 'none';
    anaPanel.style.display = 'block';
    tabGenBtn.style.opacity = '0.55';
    tabAnaBtn.style.opacity = '1';
  }
  tabGenBtn.addEventListener('click', showGen);
  tabAnaBtn.addEventListener('click', showAna);

  // ---------- GENERATOR ----------
  const DIRECTIVES = [
    { key: 'default-src', label: 'default-src', hint: "Fallback for all fetch types" },
    { key: 'script-src', label: 'script-src', hint: 'Allowed JavaScript sources' },
    { key: 'style-src', label: 'style-src', hint: 'Allowed CSS sources' },
    { key: 'img-src', label: 'img-src', hint: 'Allowed image sources' },
    { key: 'font-src', label: 'font-src', hint: 'Allowed font sources' },
    { key: 'connect-src', label: 'connect-src', hint: 'Allowed fetch/XHR/WebSocket targets' },
    { key: 'frame-ancestors', label: 'frame-ancestors', hint: "Who can iframe this site (clickjacking defense)" },
    { key: 'object-src', label: 'object-src', hint: "Flash/plugins — recommend 'none'" },
    { key: 'base-uri', label: 'base-uri', hint: "Restrict <base> tag — recommend 'self'" },
    { key: 'form-action', label: 'form-action', hint: 'Where forms may submit to' }
  ];

  const listEl = document.getElementById('cspDirectiveList');
  const outputEl = document.getElementById('cspOutput');
  const copyBtn = document.getElementById('cspCopyBtn');

  DIRECTIVES.forEach((d) => {
    const row = document.createElement('div');
    row.innerHTML =
      '<label style="display:block;font-family:var(--font-mono);font-size:0.8rem;color:var(--text-dim);margin-bottom:0.3rem;">' +
        d.label + ' <span style="opacity:0.6;">— ' + d.hint + '</span></label>' +
      '<input data-key="' + d.key + '" type="text" placeholder="e.g. \'self\' https://cdn.example.com" ' +
        'style="width:100%;background:var(--bg-panel-raised);border:1px solid var(--border-glow);border-radius:8px;color:var(--text-primary);font-family:var(--font-mono);font-size:0.85rem;padding:0.6rem 0.8rem;">';
    listEl.appendChild(row);
  });

  function buildPolicy() {
    const inputs = listEl.querySelectorAll('input[data-key]');
    const parts = [];
    inputs.forEach((inp) => {
      const val = inp.value.trim();
      if (val) parts.push(inp.dataset.key + ' ' + val);
    });
    outputEl.textContent = parts.length
      ? 'Content-Security-Policy: ' + parts.join('; ') + ';'
      : '—';
  }

  listEl.addEventListener('input', buildPolicy);

  copyBtn.addEventListener('click', () => {
    const text = outputEl.textContent;
    if (text === '—') return;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copied ✓';
      setTimeout(() => (copyBtn.textContent = 'Copy Header Line'), 1500);
    });
  });

  // ---------- ANALYZER ----------
  const anaInput = document.getElementById('cspAnaInput');
  const anaBtn = document.getElementById('cspAnaBtn');
  const anaResults = document.getElementById('cspAnaResults');

  function analyze() {
    const raw = anaInput.value.trim();
    anaResults.innerHTML = '';
    if (!raw) return;

    const findings = [];
    const directives = {};
    raw.split(';').forEach((chunk) => {
      const trimmed = chunk.trim();
      if (!trimmed) return;
      const [key, ...rest] = trimmed.split(/\s+/);
      directives[key.toLowerCase()] = rest.join(' ');
    });

    if (!directives['default-src']) {
      findings.push(['medium', 'No default-src set — undefined fetch types fall back to allowing everything.']);
    }
    ['script-src', 'style-src'].forEach((d) => {
      const v = directives[d] || '';
      if (v.includes("'unsafe-inline'")) {
        findings.push(['high', d + " allows 'unsafe-inline' — inline <script>/<style> can run, defeating most XSS protection."]);
      }
      if (v.includes("'unsafe-eval'")) {
        findings.push(['high', d + " allows 'unsafe-eval' — eval()/new Function() can run untrusted code."]);
      }
      if (/\*/.test(v) && !v.includes('*.')) {
        findings.push(['high', d + ' uses a bare wildcard "*" — any origin can serve this content type.']);
      }
    });
    if (!directives['frame-ancestors']) {
      findings.push(['medium', 'No frame-ancestors directive — add it (or X-Frame-Options) to prevent clickjacking.']);
    }
    if (!directives['object-src']) {
      findings.push(['low', "No object-src set — consider object-src 'none' to block legacy plugin content."]);
    }
    if (!directives['base-uri']) {
      findings.push(['low', "No base-uri set — consider base-uri 'self' to stop <base> tag hijacking."]);
    }
    if (directives['script-src'] && directives['script-src'].includes('http:')) {
      findings.push(['medium', 'script-src allows plain http: — mixed content risk on an HTTPS page.']);
    }

    if (findings.length === 0) {
      findings.push(['ok', 'No obvious weaknesses found in the directives checked.']);
    }

    const colors = { high: 'var(--danger)', medium: '#f5b942', low: 'var(--cyan)', ok: 'var(--success)' };
    findings.forEach(([sev, msg]) => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid var(--border-glow)';
      row.innerHTML =
        '<td style="padding:0.75rem 1rem;color:' + colors[sev] + ';text-transform:uppercase;">' + sev + '</td>' +
        '<td style="padding:0.75rem 1rem;color:var(--text-dim);">' + msg + '</td>';
      anaResults.appendChild(row);
    });
  }

  anaBtn.addEventListener('click', analyze);
})();