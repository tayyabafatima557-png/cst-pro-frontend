(function () {
  const input = document.getElementById('whoisInput');
  const btn = document.getElementById('whoisLookupBtn');
  const resultsBox = document.getElementById('whoisResults');
  const grid = document.getElementById('whoisResultGrid');
  const loading = document.getElementById('whoisLoading');
  const errorEl = document.getElementById('whoisError');

  async function lookup() {
    const domain = input.value.trim();
    if (!domain) return;

    errorEl.textContent = '';
    resultsBox.style.display = 'none';
    loading.style.display = 'block';

    try {
      // rdap.org auto-routes to the correct registry RDAP server — free, no key, CORS-friendly
      const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
      if (!res.ok) throw new Error('Domain not found or RDAP lookup failed.');
      const data = await res.json();
      loading.style.display = 'none';

      const registrar = data.entities?.find(e => e.roles?.includes('registrar'));
      const registrarName = registrar?.vcardArray?.[1]?.find(f => f[0] === 'fn')?.[3] || 'Unknown';

      const events = data.events || [];
      const getEvent = (action) => events.find(e => e.eventAction === action)?.eventDate;

      const fields = [
        ['Domain', data.ldhName || domain],
        ['Registrar', registrarName],
        ['Status', (data.status || []).join(', ') || '—'],
        ['Registered', getEvent('registration') || '—'],
        ['Last Changed', getEvent('last changed') || '—'],
        ['Expires', getEvent('expiration') || '—'],
        ['Nameservers', (data.nameservers || []).map(ns => ns.ldhName).join(', ') || '—']
      ];

      grid.innerHTML = fields.map(([label, value]) => `
        <div style="display:flex;justify-content:space-between;gap:1rem;border-bottom:1px solid var(--border-glow);padding-bottom:0.6rem;">
          <span class="eyebrow">${label}</span>
          <span style="color:var(--cyan);text-align:right;">${value}</span>
        </div>
      `).join('');

      resultsBox.style.display = 'block';
    } catch (err) {
      loading.style.display = 'none';
      errorEl.textContent = 'Lookup failed — domain may not exist, or the registry does not expose RDAP data.';
    }
  }

  btn.addEventListener('click', lookup);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') lookup(); });
})();