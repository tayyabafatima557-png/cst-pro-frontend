(function () {
  const input = document.getElementById('headerInput');
  const btn = document.getElementById('analyzeHeaderBtn');
  const errorEl = document.getElementById('headerError');
  const authBox = document.getElementById('authResults');
  const authGrid = document.getElementById('authGrid');
  const hopBox = document.getElementById('hopResults');
  const hopList = document.getElementById('hopList');

  function badge(label, pass) {
    const color = pass === true ? 'var(--success)' : pass === false ? 'var(--danger)' : 'var(--warning)';
    const text = pass === true ? '✓ PASS' : pass === false ? '✗ FAIL' : '— NOT FOUND';
    return `
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-glow);padding-bottom:0.6rem;">
        <span style="color:var(--text-dim);">${label}</span>
        <span style="color:${color};font-weight:600;">${text}</span>
      </div>`;
  }

  function analyze() {
    const raw = input.value;
    errorEl.textContent = '';
    authBox.style.display = 'none';
    hopBox.style.display = 'none';

    if (!raw.trim()) {
      errorEl.textContent = 'Paste some email headers first.';
      return;
    }

    // Authentication-Results parsing
    const authResultsMatch = raw.match(/Authentication-Results:.*(?:\n[ \t].*)*/i);
    const authText = authResultsMatch ? authResultsMatch[0] : '';

    const spfMatch = authText.match(/spf=(\w+)/i);
    const dkimMatch = authText.match(/dkim=(\w+)/i);
    const dmarcMatch = authText.match(/dmarc=(\w+)/i);

    const spfPass = spfMatch ? spfMatch[1].toLowerCase() === 'pass' : null;
    const dkimPass = dkimMatch ? dkimMatch[1].toLowerCase() === 'pass' : null;
    const dmarcPass = dmarcMatch ? dmarcMatch[1].toLowerCase() === 'pass' : null;

    authGrid.innerHTML = badge('SPF', spfPass) + badge('DKIM', dkimPass) + badge('DMARC', dmarcPass);
    authBox.style.display = 'block';

    // Received headers — delivery path, in reverse order (last hop first in raw headers)
    const receivedMatches = [...raw.matchAll(/^Received:.*(?:\n[ \t].*)*/gim)];

    if (receivedMatches.length === 0) {
      hopList.innerHTML = '<p style="color:var(--text-dim);">No "Received" headers found — this may not be a complete raw header set.</p>';
      hopBox.style.display = 'block';
      return;
    }

    // Reverse so hop 1 = origin (oldest), last hop = final delivery
    const hops = receivedMatches.map(m => m[0]).reverse();

    const hopHtml = hops.map((hop, i) => {
      const fromMatch = hop.match(/from\s+([^\s;]+(?:\s+\([^)]+\))?)/i);
      const byMatch = hop.match(/by\s+([^\s;]+)/i);
      const dateMatch = hop.match(/;\s*(.+)$/m);

      return `
        <div style="background:var(--bg-panel-raised);border-radius:8px;padding:0.8rem 1rem;">
          <p style="color:var(--cyan);font-weight:600;margin-bottom:0.4rem;">Hop ${i + 1}</p>
          <p><span style="color:var(--text-dim);">From:</span> ${fromMatch ? fromMatch[1] : 'unknown'}</p>
          <p><span style="color:var(--text-dim);">By:</span> ${byMatch ? byMatch[1] : 'unknown'}</p>
          ${dateMatch ? `<p><span style="color:var(--text-dim);">Timestamp:</span> ${dateMatch[1].trim()}</p>` : ''}
        </div>`;
    }).join('');

    hopList.innerHTML = hopHtml;
    hopBox.style.display = 'block';
  }

  btn.addEventListener('click', analyze);
})();