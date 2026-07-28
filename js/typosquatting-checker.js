(function () {
  const input = document.getElementById('typoInput');
  const btn = document.getElementById('typoCheckBtn');
  const loading = document.getElementById('typoLoading');
  const errorEl = document.getElementById('typoError');
  const resultsBox = document.getElementById('typoResults');
  const countEl = document.getElementById('typoCount');
  const listEl = document.getElementById('typoList');

  const KEYBOARD_ADJACENT = {
    a: 'qsz', b: 'vghn', c: 'xdfv', d: 'serfcx', e: 'wrsdf', f: 'drtgvc',
    g: 'ftyhbv', h: 'gyujnb', i: 'ujko', j: 'huikmn', k: 'jiolm', l: 'kop',
    m: 'njk', n: 'bhjm', o: 'iklp', p: 'ol', q: 'wa', r: 'edft', s: 'awedxz',
    t: 'rfgy', u: 'yhji', v: 'cfgb', w: 'qase', x: 'zsdc', y: 'tghu', z: 'asx'
  };

  function generateVariants(domain) {
    const parts = domain.split('.');
    const name = parts[0];
    const rest = parts.slice(1).join('.');
    const variants = new Set();

    // Character omission
    for (let i = 0; i < name.length; i++) {
      variants.add(name.slice(0, i) + name.slice(i + 1) + '.' + rest);
    }

    // Adjacent character swap
    for (let i = 0; i < name.length - 1; i++) {
      const arr = name.split('');
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      variants.add(arr.join('') + '.' + rest);
    }

    // Adjacent keyboard key substitution
    for (let i = 0; i < name.length; i++) {
      const char = name[i].toLowerCase();
      const adjacent = KEYBOARD_ADJACENT[char] || '';
      for (const sub of adjacent) {
        variants.add(name.slice(0, i) + sub + name.slice(i + 1) + '.' + rest);
      }
    }

    // Character doubling
    for (let i = 0; i < name.length; i++) {
      variants.add(name.slice(0, i + 1) + name[i] + name.slice(i + 1) + '.' + rest);
    }

    // Common TLD swaps
    const tldSwaps = ['com', 'net', 'org', 'co', 'info'];
    tldSwaps.forEach(tld => {
      if (tld !== rest) variants.add(name + '.' + tld);
    });

    variants.delete(domain);
    return Array.from(variants);
  }

  async function checkDns(domain) {
    try {
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
        headers: { 'Accept': 'application/dns-json' }
      });
      const data = await res.json();
      return data.Status === 0 && data.Answer && data.Answer.length > 0;
    } catch {
      return false;
    }
  }

  async function checkAll() {
    const domain = input.value.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    if (!domain || !domain.includes('.')) {
      errorEl.textContent = 'Enter a valid domain, e.g. example.com';
      return;
    }

    errorEl.textContent = '';
    resultsBox.style.display = 'none';
    loading.style.display = 'block';

    const variants = generateVariants(domain).slice(0, 40); // cap to keep it fast
    const registered = [];

    // Check in small batches to avoid hammering the DNS API
    const batchSize = 8;
    for (let i = 0; i < variants.length; i += batchSize) {
      const batch = variants.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(async v => ({ domain: v, isRegistered: await checkDns(v) })));
      results.forEach(r => { if (r.isRegistered) registered.push(r.domain); });
    }

    loading.style.display = 'none';
    countEl.textContent = `Checked ${variants.length} variants — ${registered.length} are registered`;

    if (registered.length === 0) {
      listEl.innerHTML = '<p style="color:var(--success);">None of the common typo variants appear to be registered.</p>';
    } else {
      listEl.innerHTML = registered.map(d => `
        <div style="padding:0.5rem 0.8rem;background:var(--bg-panel-raised);border-radius:6px;color:var(--warning);word-break:break-all;">⚠ ${d}</div>
      `).join('');
    }
    resultsBox.style.display = 'block';
  }

  btn.addEventListener('click', checkAll);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkAll(); });
})();