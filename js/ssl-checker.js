(function () {
  const input = document.getElementById('sslInput');
  const btn = document.getElementById('sslCheckBtn');
  const loading = document.getElementById('sslLoading');
  const errorEl = document.getElementById('sslError');

  const tlsCard = document.getElementById('tlsCard');
  const tlsGrid = document.getElementById('tlsResultGrid');
  const headersCard = document.getElementById('headersCard');
  const headersGrid = document.getElementById('headersResultGrid');
  const redirectCard = document.getElementById('redirectCard');
  const redirectList = document.getElementById('redirectList');

  const BACKEND = 'http://localhost:4000';

  function row(label, value) {
    return `
      <div style="display:flex;justify-content:space-between;gap:1rem;border-bottom:1px solid var(--border-glow);padding-bottom:0.6rem;">
        <span style="color:var(--text-dim);">${label}</span>
        <span style="color:var(--cyan);text-align:right;">${value}</span>
      </div>`;
  }

  async function check() {
    let target = input.value.trim();
    if (!target) return;
    const hostOnly = target.replace(/^https?:\/\//i, '').split('/')[0];

    errorEl.textContent = '';
    tlsCard.style.display = 'none';
    headersCard.style.display = 'none';
    redirectCard.style.display = 'none';
    loading.style.display = 'block';

    try {
      const [tlsRes, headersRes] = await Promise.all([
        fetch(`${BACKEND}/tls-info?host=${encodeURIComponent(hostOnly)}`),
        fetch(`${BACKEND}/security-headers?url=${encodeURIComponent(target)}`)
      ]);

      const tlsData = await tlsRes.json();
      const headersData = await headersRes.json();
      loading.style.display = 'none';

      // TLS card
      if (tlsRes.ok) {
        tlsGrid.innerHTML =
          row('Issued To', tlsData.issuedTo) +
          row('Issuer', tlsData.issuer) +
          row('Valid From', tlsData.validFrom) +
          row('Valid To', tlsData.validTo) +
          row('Protocol', tlsData.protocol) +
          row('Trusted', tlsData.authorized ? '✓ Yes' : `✗ No (${tlsData.authorizationError || 'untrusted'})`);
        tlsCard.style.display = 'block';
      } else {
        tlsGrid.innerHTML = `<p style="color:var(--danger);">${tlsData.error}</p>`;
        tlsCard.style.display = 'block';
      }

      // Headers card
      if (headersRes.ok) {
        const sh = headersData.securityHeaders;
        const headerRows = Object.entries(sh).map(([key, val]) =>
          row(key, val ? `✓ ${val}` : '<span style="color:var(--warning);">missing</span>')
        ).join('');
        headersGrid.innerHTML = row('Server', headersData.server || '—') + row('Status', headersData.status) + headerRows;
        headersCard.style.display = 'block';

        // Redirect chain
        redirectList.innerHTML = headersData.redirectChain.map(hop => `
          <div style="display:flex;gap:0.8rem;background:var(--bg-panel-raised);border-radius:6px;padding:0.6rem 1rem;">
            <span style="color:${hop.status < 300 ? 'var(--success)' : 'var(--warning)'};font-weight:600;">${hop.status}</span>
            <span style="color:var(--text-dim);word-break:break-all;">${hop.url}</span>
          </div>
        `).join('');
        redirectCard.style.display = 'block';
      } else {
        headersGrid.innerHTML = `<p style="color:var(--danger);">${headersData.error}</p>`;
        headersCard.style.display = 'block';
      }
    } catch (err) {
      loading.style.display = 'none';
      errorEl.textContent = 'Could not reach the backend. Make sure the Node server is running (npm start in the server/ folder) at http://localhost:4000.';
    }
  }

  btn.addEventListener('click', check);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
})();