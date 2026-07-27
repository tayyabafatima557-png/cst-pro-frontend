(function () {
  const hostInput = document.getElementById('hostInput');
  const startInput = document.getElementById('startPortInput');
  const endInput = document.getElementById('endPortInput');
  const legalAck = document.getElementById('legalAck');
  const scanBtn = document.getElementById('scanBtn');
  const loading = document.getElementById('scanLoading');
  const resultsBox = document.getElementById('scanResults');
  const resultHost = document.getElementById('resultHost');
  const resultSummary = document.getElementById('resultSummary');
  const resultList = document.getElementById('resultList');
  const errorEl = document.getElementById('scanError');
  const filterOpenOnly = document.getElementById('filterOpenOnly');

  const BACKEND_URL = 'http://localhost:4000/scan';
  let lastResults = [];

  document.getElementById('quickCommon').addEventListener('click', () => {
    startInput.value = 1;
    endInput.value = 1024;
  });

  document.getElementById('quickFull').addEventListener('click', () => {
    startInput.value = 1;
    endInput.value = 65535;
  });

  const STATUS_COLOR = {
    open: 'var(--success)',
    closed: 'var(--text-dim)',
    filtered: 'var(--warning)'
  };

  function renderResults() {
    const filtered = filterOpenOnly.checked
      ? lastResults.filter(r => r.status === 'open')
      : lastResults;

    resultList.innerHTML = filtered.map(r => `
      <div style="display:flex;justify-content:space-between;background:var(--bg-panel-raised);border-radius:6px;padding:0.6rem 1rem;">
        <span>Port ${r.port} <span style="color:var(--text-dim);">(${r.service})</span></span>
        <span style="color:${STATUS_COLOR[r.status]};font-weight:600;">${r.status.toUpperCase()}</span>
      </div>
    `).join('') || '<p style="color:var(--text-dim);">No matching ports.</p>';
  }

  filterOpenOnly.addEventListener('change', renderResults);

  async function runScan() {
    if (!legalAck.checked) {
      errorEl.textContent = 'You must check the authorization box before scanning.';
      return;
    }

    const host = hostInput.value.trim();
    if (!host) {
      errorEl.textContent = 'Enter a target host.';
      return;
    }

    const startPort = startInput.value;
    const endPort = endInput.value;

    errorEl.textContent = '';
    resultsBox.style.display = 'none';
    loading.style.display = 'block';
    scanBtn.disabled = true;

    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, startPort, endPort, acknowledgedLegal: true })
      });

      const data = await res.json();
      loading.style.display = 'none';
      scanBtn.disabled = false;

      if (!res.ok) {
        errorEl.textContent = data.error || 'Scan failed.';
        return;
      }

      lastResults = data.results;
      const openCount = lastResults.filter(r => r.status === 'open').length;

      resultHost.textContent = data.host;
      resultSummary.textContent = `Scanned ${data.totalPorts} ports — ${openCount} open, ${lastResults.length - openCount} closed/filtered.`;
      filterOpenOnly.checked = false;
      renderResults();

      resultsBox.style.display = 'block';
    } catch (err) {
      loading.style.display = 'none';
      scanBtn.disabled = false;
      errorEl.textContent = 'Could not reach the backend. Make sure the Node server is running (npm start in the server/ folder) at http://localhost:4000.';
    }
  }

  scanBtn.addEventListener('click', runScan);
})();