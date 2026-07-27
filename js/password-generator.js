/* ============================================
   PASSWORD GENERATOR
   Uses crypto.getRandomValues (CSPRNG) — never Math.random()
   for anything security-relevant.
   ============================================ */

const CHARSETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`',
  ambiguous: '0O1lI|'
};

const el = (id) => document.getElementById(id);

const lengthSlider   = el('lengthSlider');
const lengthValue     = el('lengthValue');
const optUpper        = el('optUpper');
const optLower        = el('optLower');
const optNumbers      = el('optNumbers');
const optSymbols      = el('optSymbols');
const optExclude      = el('optExcludeAmbiguous');
const generateBtn     = el('generateBtn');
const regenBtn        = el('regenBtn');
const copyBtn         = el('copyBtn');
const passwordOutput  = el('passwordOutput');
const strengthFill    = el('strengthFill');
const strengthLabel   = el('strengthLabel');
const historyList     = el('historyList');
const clearHistoryBtn = el('clearHistoryBtn');
const toast           = el('toast');

let sessionHistory = [];

/* --- Secure random integer in [0, max) using rejection sampling --- */
function secureRandomInt(max) {
  const range = 256 - (256 % max);
  let byte;
  do {
    byte = crypto.getRandomValues(new Uint8Array(1))[0];
  } while (byte >= range);
  return byte % max;
}

function buildCharPool() {
  let pool = '';
  if (optUpper.checked) pool += CHARSETS.upper;
  if (optLower.checked) pool += CHARSETS.lower;
  if (optNumbers.checked) pool += CHARSETS.numbers;
  if (optSymbols.checked) pool += CHARSETS.symbols;

  if (optExclude.checked) {
    pool = pool.split('').filter(c => !CHARSETS.ambiguous.includes(c)).join('');
  }
  return pool;
}

function generatePassword() {
  const pool = buildCharPool();
  const length = parseInt(lengthSlider.value, 10);

  if (!pool) {
    passwordOutput.value = 'Select at least one character type';
    updateStrength('');
    return;
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    result += pool[secureRandomInt(pool.length)];
  }

  passwordOutput.value = result;
  updateStrength(result);
  addToHistory(result);
}

/* --- Strength scoring: entropy-based, not just "has a number" checks --- */
function calculateEntropy(password) {
  if (!password) return 0;
  let poolSize = 0;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 32;
  if (poolSize === 0) return 0;
  return password.length * Math.log2(poolSize);
}

function updateStrength(password) {
  const entropy = calculateEntropy(password);
  let pct, label, cls;

  if (entropy === 0) {
    pct = 0; label = 'Strength: —'; cls = '';
  } else if (entropy < 40) {
    pct = 30; label = 'Strength: Weak'; cls = 'strength-weak';
  } else if (entropy < 65) {
    pct = 65; label = 'Strength: Medium'; cls = 'strength-medium';
  } else {
    pct = 100; label = 'Strength: Strong'; cls = 'strength-strong';
  }

  strengthFill.style.width = pct + '%';
  strengthFill.className = 'strength-meter-fill ' + cls;
  strengthLabel.textContent = label + (entropy ? ` (${Math.round(entropy)} bits)` : '');
}

/* --- Session history (in-memory; not persisted across reloads by design,
       since storing generated passwords in localStorage would be a
       security anti-pattern for a security tool) --- */
function addToHistory(password) {
  sessionHistory.unshift(password);
  sessionHistory = sessionHistory.slice(0, 5);
  renderHistory();
}

function renderHistory() {
  if (sessionHistory.length === 0) {
    historyList.innerHTML = '<li class="history-empty">No passwords generated yet this session.</li>';
    return;
  }
  historyList.innerHTML = sessionHistory
    .map(pw => `<li class="history-item"><span class="mono-value">${maskPassword(pw)}</span></li>`)
    .join('');
}

function maskPassword(pw) {
  if (pw.length <= 4) return pw;
  return pw.slice(0, 2) + '•'.repeat(pw.length - 4) + pw.slice(-2);
}

/* --- Clipboard + toast --- */
async function copyPassword() {
  if (!passwordOutput.value || passwordOutput.value.startsWith('Click') || passwordOutput.value.startsWith('Select')) return;
  try {
    await navigator.clipboard.writeText(passwordOutput.value);
    showToast('Copied to clipboard');
  } catch {
    passwordOutput.select();
    document.execCommand('copy');
    showToast('Copied to clipboard');
  }
}

let toastTimeout;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
}

/* --- Event bindings --- */
lengthSlider.addEventListener('input', () => {
  lengthValue.textContent = lengthSlider.value;
});

generateBtn.addEventListener('click', generatePassword);
regenBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyPassword);

clearHistoryBtn.addEventListener('click', () => {
  sessionHistory = [];
  renderHistory();
});

// Guard: don't let all four charset checkboxes be unchecked
[optUpper, optLower, optNumbers, optSymbols].forEach(cb => {
  cb.addEventListener('change', () => {
    const anyChecked = [optUpper, optLower, optNumbers, optSymbols].some(c => c.checked);
    if (!anyChecked) cb.checked = true; // revert last uncheck
  });
});

// Generate one on load so the page isn't empty
document.addEventListener('DOMContentLoaded', generatePassword);