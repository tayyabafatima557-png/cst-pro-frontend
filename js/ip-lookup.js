(function () {
  const input = document.getElementById('ipInput');
  const btn = document.getElementById('ipLookupBtn');
  const resultsBox = document.getElementById('ipResults');
  const grid = document.getElementById('ipResultGrid');
  const loading = document.getElementById('ipLoading');
  const errorEl = document.getElementById('ipError');

  const portsBox = document.getElementById('portsResults');
  const portsChips = document.getElementById('portsChipList');
  const tagsChips = document.getElementById('tagsChipList');
  const hostnamesList = document.getElementById('hostnamesList');

  async function lookup() {
    const ip = input.value.trim();
    errorEl.textContent = '';
    resultsBox.style.display = 'none';
    portsBox.style.display = 'none';
    loading.style.display = 'block';

    const url = ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : `https://ipwho.is/`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      loading.style.display = 'none';

      if (data.success === false) {
        errorEl.textContent = 'Lookup failed: ' + (data.message || 'invalid IP address');
        return;
      }

      const fields = [
        ['IP Address', data.ip],
        ['Country', data.country],
        ['Region', data.region],
        ['City', data.city],
        ['ISP', data.connection?.isp],
        ['Organization', data.connection?.org],
        ['Timezone', data.timezone?.id],
        ['Latitude', data.latitude],
        ['Longitude', data.longitude]
      ];

      grid.innerHTML = fields.map(([label, value]) => `
        <div>
          <p class="eyebrow" style="margin-bottom:0.2rem;">${label}</p>
          <p style="color:var(--cyan);">${value ?? '—'}</p>
        </div>
      `).join('');

      resultsBox.style.display = 'block';

      // Passive recon via Shodan InternetDB — free, no key, no active scanning
      lookupInternetDB(data.ip);
    } catch (err) {
      loading.style.display = 'none';
      errorEl.textContent = 'Network error — could not reach lookup service.';
    }
  }

  async function lookupInternetDB(ip) {
    try {
      const res = await fetch(`https://internetdb.shodan.io/${ip}`);
      if (!res.ok) {
        portsBox.style.display = 'none';
        return;
      }
      const data = await res.json();

      portsChips.innerHTML = (data.ports || []).length
        ? data.ports.map(p => `<span class="btn-cyber" style="padding:0.3rem 0.8rem;font-size:0.8rem;cursor:default;">${p}</span>`).join('')
        : '<span style="color:var(--text-dim);font-family:var(--font-mono);font-size:0.85rem;">No open ports found in passive database.</span>';

      tagsChips.innerHTML = (data.tags || [])
        .map(t => `<span style="background:rgba(0,212,255,0.1);color:var(--cyan);border-radius:20px;padding:0.3rem 0.8rem;font-size:0.75rem;font-family:var(--font-mono);">${t}</span>`)
        .join('');

      hostnamesList.textContent = (data.hostnames || []).length
        ? 'Hostnames: ' + data.hostnames.join(', ')
        : '';

      portsBox.style.display = 'block';
    } catch {
      portsBox.style.display = 'none';
    }
  }

  btn.addEventListener('click', lookup);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') lookup(); });
})();