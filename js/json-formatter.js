(function () {
  const input = document.getElementById('jsonInput');
  const output = document.getElementById('jsonOutput');
  const status = document.getElementById('jsonStatus');

  function format(indent) {
    try {
      const parsed = JSON.parse(input.value);
      output.textContent = JSON.stringify(parsed, null, indent);
      status.textContent = '✓ Valid JSON';
      status.style.color = 'var(--success)';
    } catch (err) {
      output.textContent = '';
      status.textContent = '✗ Invalid JSON — ' + err.message;
      status.style.color = 'var(--danger)';
    }
  }

  document.getElementById('beautifyBtn').addEventListener('click', () => format(2));
  document.getElementById('minifyBtn').addEventListener('click', () => format(0));
})();