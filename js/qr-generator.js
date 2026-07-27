(function () {
  const input = document.getElementById('qrInput');
  const generateBtn = document.getElementById('qrGenerateBtn');
  const wrap = document.getElementById('qrCanvasWrap');
  const downloadBtn = document.getElementById('qrDownloadBtn');

  generateBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;

    wrap.innerHTML = '';
    downloadBtn.style.display = 'none';

    if (typeof QRCode === 'undefined') {
      wrap.innerHTML = '<p style="color:var(--danger);">QR library failed to load — check your internet connection or try disabling browser extensions.</p>';
      console.error('QRCode library is undefined — the CDN script tag failed to load.');
      return;
    }

    try {
      // davidshimjs/qrcodejs API — renders into the container div directly
      new QRCode(wrap, {
        text: text,
        width: 260,
        height: 260,
        colorDark: '#00d4ff',
        colorLight: '#0a0e14',
        correctLevel: QRCode.CorrectLevel.H
      });

      downloadBtn.style.display = 'inline-block';
    } catch (err) {
      console.error('QR generation failed:', err);
      wrap.innerHTML = `<p style="color:var(--danger);">Could not generate QR code: ${err.message || err}</p>`;
    }
  });

  downloadBtn.addEventListener('click', () => {
    const canvas = wrap.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
})();