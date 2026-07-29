(function () {
  const input = document.getElementById('urlRepInput');
  const btn = document.getElementById('urlRepCheckBtn');
  const loading = document.getElementById('urlRepLoading');
  const errorEl = document.getElementById('urlRepError');
  const resultsBox = document.getElementById('urlRepResults');
  const countEl = document.getElementById('urlRepCount');
  const listEl = document.getElementById('urlRepList');

  async function search() {
    const query = input.value.trim().replace(/^https?:\/\//i, '').split('/')[0];
    if (!query) return;

    errorEl.textContent = '';
    resultsBox.style.display = 'none';
    loading.style.display = 'block';

    try {
      const res = await fetch(`https://urlscan.io/api/v1/search/?q=domain:${encodeURIComponent(query)}&size=10`);
      const data = await res.json();
      loading.style.display = 'none';

      if (!data.results || data.results.length === 0) {
        errorEl.textContent = 'No public scan history found for this domain.';
        return;
      }

      countEl.textContent = `${data.total.toLocaleString()} total public scans — showing ${data.results.length} most recent`;

      listEl.innerHTML = data.results.map(r => {
        const page = r.page || {};
        const date = new Date(r.task.time).toLocaleDateString();
        const malicious = r.verdicts && r.verdicts.overall && r.verdicts.overall.malicious;
        return `
          <div style="background:var(--bg-panel-raised);border-radius:8px;padding:1rem;border-left:3px solid ${malicious ? 'var(--danger)' : 'var(--border-glow)'};">
            <p style="color:var(--cyan);word-break:break-all;font-size:0.9rem;">${page.url || r.task.url}</p>
            <p style="color:var(--text-dim);font-size:0.75rem;margin-top:0.3rem;">Scanned: ${date} ${malicious ? '· <span style="color:var(--danger);">⚠ Flagged malicious</span>' : ''}</p>
            <a href="${r.result}" target="_blank" style="color:var(--cyan);font-size:0.75rem;">View full scan report →</a>
          </div>`;
      }).join('');

      resultsBox.style.display = 'block';
    } catch (err) {
      loading.style.display = 'none';
      errorEl.textContent = 'Could not fetch reputation data — network error.';
    }
  }

  btn.addEventListener('click', search);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(); });
})();