(function () {
  const input = document.getElementById('encInput');
  const output = document.getElementById('encOutput');
  const encodeBtn = document.getElementById('encodeBtn');
  const decodeBtn = document.getElementById('decodeBtn');
  const copyBtn = document.getElementById('copyEncBtn');
  const modeButtons = document.querySelectorAll('.mode-btn');

  let mode = 'base64';

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
    });
  });

  function htmlEncode(str) {
    return str.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function htmlDecode(str) {
    const el = document.createElement('textarea');
    el.innerHTML = str;
    return el.value;
  }

  encodeBtn.addEventListener('click', () => {
    const text = input.value;
    try {
      if (mode === 'base64') output.value = btoa(unescape(encodeURIComponent(text)));
      else if (mode === 'url') output.value = encodeURIComponent(text);
      else if (mode === 'html') output.value = htmlEncode(text);
    } catch {
      output.value = 'Error: could not encode input.';
    }
  });

  decodeBtn.addEventListener('click', () => {
    const text = input.value;
    try {
      if (mode === 'base64') output.value = decodeURIComponent(escape(atob(text)));
      else if (mode === 'url') output.value = decodeURIComponent(text);
      else if (mode === 'html') output.value = htmlDecode(text);
    } catch {
      output.value = 'Error: invalid input for decoding.';
    }
  });

  copyBtn.addEventListener('click', () => copyToClipboard(output.value));
})();