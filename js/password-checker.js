(function () {
  const input = document.getElementById('pwInput');
  const toggleBtn = document.getElementById('toggleVisibility');
  const fill = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  const suggestions = document.getElementById('suggestionsList');

  toggleBtn.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  input.addEventListener('input', () => analyze(input.value));

  function analyze(pw) {
    if (!pw) {
      fill.style.width = '0%';
      fill.className = 'strength-meter-fill';
      label.textContent = 'Strength: —';
      suggestions.innerHTML = '<li>Start typing a password above to see suggestions.</li>';
      return;
    }

    const entropy = calculateEntropy(pw); // from tools.js
    let pct, cls, text;

    if (entropy < 40) { pct = 30; cls = 'strength-weak'; text = 'Weak'; }
    else if (entropy < 65) { pct = 65; cls = 'strength-medium'; text = 'Medium'; }
    else { pct = 100; cls = 'strength-strong'; text = 'Strong'; }

    fill.style.width = pct + '%';
    fill.className = 'strength-meter-fill ' + cls;
    label.textContent = `Strength: ${text} (${Math.round(entropy)} bits)`;

    const tips = [];
    if (pw.length < 12) tips.push('Use at least 12 characters — longer passwords resist brute-force attacks far better than complex short ones.');
    if (!/[A-Z]/.test(pw)) tips.push('Add an uppercase letter.');
    if (!/[a-z]/.test(pw)) tips.push('Add a lowercase letter.');
    if (!/[0-9]/.test(pw)) tips.push('Add a number.');
    if (!/[^A-Za-z0-9]/.test(pw)) tips.push('Add a symbol (e.g. !@#$%).');
    if (/(.)\1{2,}/.test(pw)) tips.push('Avoid repeating the same character 3+ times in a row.');
    if (/^(123|abc|password|qwerty)/i.test(pw)) tips.push('Avoid common patterns like "123", "abc", or "password".');
    if (tips.length === 0) tips.push('This password looks strong. No further changes needed.');

    suggestions.innerHTML = tips.map(t => `<li>• ${t}</li>`).join('');
  }
})();