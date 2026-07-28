(function () {
  const input = document.getElementById('subdomainInput');
  const btn = document.getElementById('subdomainSearchBtn');
  const loading = document.getElementById('subdomainLoading');
  const errorEl = document.getElementById('subdomainError');
  const resultsBox = document.getElementById('subdomainResults');
  const countEl = document.getElementById('subdomainCount');
  const listEl = document.getElementById('subdomainList');

  async function findSubdomains() {
    const domain = input.value.trim().replace(/^https?:\/\//i, '').split('/')[0];
    if (!domain) return;

    errorEl.textContent = '';
    resultsBox.style.display = 'none';
    loading.style.display = 'block';

    try {
      const res = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`);
      if (!res.ok) throw new Error('crt.sh request failed');
      const data = await res.json();
      loading.style.display = 'none';

      if (!data || data.length === 0) {
        errorEl.textContent = 'No certificate records found for this domain.';
        return;
      }

      // Extract unique subdomains from name_value fields
      const subdomainSet = new Set();
      data.forEach(entry => {
        const names = entry.name_value.split('\n');
        names.forEach(name => {
          const clean = name.trim().toLowerCase();
          if (clean.endsWith(domain.toLowerCase()) && !clean.startsWith('*.')) {
            subdomainSet.add(clean);
          }
        });
      });

      const subdomains = Array.from(subdomainSet).sort();

      countEl.textContent = `${subdomains.length} unique subdomain${subdomains.length !== 1 ? 's' : ''} found`;
      listEl.innerHTML = subdomains.map(sub => `
        <div style="padding:0.5rem 0.8rem;background:var(--bg-panel-raised);border-radius:6px;word-break:break-all;color:var(--cyan);">${sub}</div>
      `).join('');
      resultsBox.style.display = 'block';
    } catch (err) {
      loading.style.display = 'none';
      errorEl.textContent = 'Could not fetch subdomains — network error or invalid domain.';
    }
  }

  btn.addEventListener('click', findSubdomains);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') findSubdomains(); });
})();