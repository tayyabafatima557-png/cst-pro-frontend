(function () {
  const fileInput = document.getElementById('fileInput');
  const selectBtn = document.getElementById('fileSelectBtn');
  const fileName = document.getElementById('fileName');
  const loading = document.getElementById('fileLoading');
  const resultsBox = document.getElementById('fileResults');
  const grid = document.getElementById('fileHashGrid');

  selectBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    fileName.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    resultsBox.style.display = 'none';
    loading.style.display = 'block';

    const buffer = await file.arrayBuffer();

    const algorithms = ['SHA-1', 'SHA-256', 'SHA-512'];
    const hashes = await Promise.all(algorithms.map(async algo => {
      const hashBuffer = await crypto.subtle.digest(algo, buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }));

    loading.style.display = 'none';

    grid.innerHTML = algorithms.map((algo, i) => `
      <div>
        <p class="eyebrow" style="margin-bottom:0.4rem;">${algo}</p>
        <div class="output-row">
          <input type="text" readonly value="${hashes[i]}" class="password-display" style="font-size:0.8rem;">
          <button class="btn-cyber" onclick="navigator.clipboard.writeText('${hashes[i]}')">Copy</button>
        </div>
      </div>
    `).join('');

    resultsBox.style.display = 'block';
  });
})();