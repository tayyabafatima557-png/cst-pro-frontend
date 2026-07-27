(function () {
  const input = document.getElementById('jwtInput');
  const headerOut = document.getElementById('jwtHeader');
  const payloadOut = document.getElementById('jwtPayload');
  const status = document.getElementById('jwtStatus');

  function base64UrlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return decodeURIComponent(escape(atob(base64)));
  }

  function decode() {
    const token = input.value.trim();
    if (!token) {
      headerOut.textContent = '—';
      payloadOut.textContent = '—';
      status.textContent = '';
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      status.textContent = '✗ Not a valid JWT — expected 3 dot-separated parts.';
      status.style.color = 'var(--danger)';
      headerOut.textContent = '—';
      payloadOut.textContent = '—';
      return;
    }

    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      headerOut.textContent = JSON.stringify(header, null, 2);
      payloadOut.textContent = JSON.stringify(payload, null, 2);
      status.textContent = '✓ Decoded successfully. Signature was not verified.';
      status.style.color = 'var(--success)';
    } catch (err) {
      status.textContent = '✗ Could not decode — ' + err.message;
      status.style.color = 'var(--danger)';
    }
  }

  input.addEventListener('input', decode);
})();