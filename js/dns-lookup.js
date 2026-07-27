(function () {
  const input = document.getElementById('dnsInput');
  const btn = document.getElementById('dnsLookupBtn');
  const resultsBox = document.getElementById('dnsResults');
  const list = document.getElementById('dnsResultList');
  const loading = document.getElementById('dnsLoading');
  const errorEl = document.getElementById('dnsError');
  const modeButtons = document.querySelectorAll('.mode-btn');

  let recordType = 'A';

  modeButtons.forEach(b => {
    b.addEventListener('click', () => {
      modeButtons.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      recordType = b.dataset.type;
      if (input.value.trim()) lookup();
    });
  });

  const RECORD_TYPES = { A: 1, AAAA: 28, MX: 15, TXT: 16, NS: 2 };

  async function lookup() {
    const domain = input.value.trim();
    if (!domain) return;

    errorEl.textContent = '';
    resultsBox.style.display = 'none';
    loading.style.display = 'block';

    try {
      // Cloudflare DNS-over-HTTPS — free, CORS-enabled, no API key needed
      const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${RECORD_TYPES[recordType]}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/dns-json' } });
      const data = await res.json();
      loading.style.display = 'none';

      if (!data.Answer || data.Answer.length === 0) {
        errorEl.textContent = `No ${recordType} records found for ${domain}.`;
        return;
      }

      list.innerHTML = data.Answer.map(rec => `
        <li style="background:var(--bg-panel-raised);border-radius:8px;padding:0.7rem 1rem;">
          <span class="eyebrow">${recordType}</span> &nbsp;
          <span style="color:var(--cyan);">${rec.data}</span>
          <span style="color:var(--text-dim);"> — TTL ${rec.TTL}s</span>
        </li>
      `).join('');

      resultsBox.style.display = 'block';
    } catch (err) {
      loading.style.display = 'none';
      errorEl.textContent = 'Network error — could not reach DNS-over-HTTPS resolver.';
    }
  }

  btn.addEventListener('click', lookup);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') lookup(); });
})();