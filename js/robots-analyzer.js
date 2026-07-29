(function () {
  const input = document.getElementById('robotsInput');
  const btn = document.getElementById('robotsCheckBtn');
  const loading = document.getElementById('robotsLoading');
  const errorEl = document.getElementById('robotsError');
  const robotsBox = document.getElementById('robotsResults');
  const robotsContent = document.getElementById('robotsContent');
  const disallowedBox = document.getElementById('robotsDisallowed');
  const sitemapBox = document.getElementById('sitemapResults');
  const sitemapCount = document.getElementById('sitemapCount');
  const sitemapList = document.getElementById('sitemapList');

  async function analyze() {
    let domain = input.value.trim().replace(/^https?:\/\//i, '').split('/')[0];
    if (!domain) return;

    errorEl.textContent = '';
    robotsBox.style.display = 'none';
    sitemapBox.style.display = 'none';
    loading.style.display = 'block';

    try {
      const robotsRes = await fetch(`${BACKEND_URL}/fetch-text?url=https://${domain}/robots.txt`);
      const robotsData = await robotsRes.json();
      loading.style.display = 'none';

      if (robotsData.status === 200 && robotsData.text) {
        robotsContent.textContent = robotsData.text;

        const disallowLines = robotsData.text.split('\n')
          .filter(l => l.trim().toLowerCase().startsWith('disallow:'))
          .map(l => l.split(':').slice(1).join(':').trim())
          .filter(l => l.length > 0);

        if (disallowLines.length > 0) {
          disallowedBox.innerHTML = `
            <p class="eyebrow" style="margin-bottom:0.6rem;">Disallowed paths (${disallowLines.length}) — worth investigating manually</p>
            <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
              ${disallowLines.map(p => `<code style="background:var(--bg-panel-raised);padding:0.3rem 0.6rem;border-radius:4px;color:var(--warning);font-size:0.8rem;">${p}</code>`).join('')}
            </div>`;
        } else {
          disallowedBox.innerHTML = `<p style="color:var(--text-dim);">No Disallow rules found.</p>`;
        }
        robotsBox.style.display = 'block';
      } else {
        robotsContent.textContent = 'No robots.txt found (or inaccessible).';
        disallowedBox.innerHTML = '';
        robotsBox.style.display = 'block';
      }

      // Try sitemap.xml
      const sitemapRes = await fetch(`${BACKEND_URL}/fetch-text?url=https://${domain}/sitemap.xml`);
      const sitemapData = await sitemapRes.json();

      if (sitemapData.status === 200 && sitemapData.text) {
        const urlMatches = [...sitemapData.text.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
        sitemapCount.textContent = `sitemap.xml — ${urlMatches.length} URLs found`;
        sitemapList.innerHTML = urlMatches.slice(0, 200).map(u => `
          <div style="padding:0.4rem 0.7rem;background:var(--bg-panel-raised);border-radius:4px;color:var(--cyan);word-break:break-all;">${u}</div>
        `).join('') || '<p style="color:var(--text-dim);">Sitemap found but no URLs parsed (may be a sitemap index file).</p>';
        sitemapBox.style.display = 'block';
      }
    } catch (err) {
      loading.style.display = 'none';
      errorEl.textContent = 'Could not reach the backend.';
    }
  }

  btn.addEventListener('click', analyze);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') analyze(); });
})();