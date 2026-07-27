/* ============================================
   TOOLS.JS
   Shared helper functions used by multiple tool
   pages (password checker, hash tools, encoders,
   etc). Include this AFTER toolkit-theme.css is
   linked, and BEFORE each tool's own JS file.
   ============================================ */

/* --- Toast notification (expects a #toast element with class .toast-cyber) --- */
let __toastTimeout;
function showToast(message, duration = 2000) {
  const toast = document.getElementById('toast');
  if (!toast) {
    console.warn('showToast: no #toast element found on this page');
    return;
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(__toastTimeout);
  __toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
}

/* --- Copy any string to clipboard, with fallback for older browsers --- */
async function copyToClipboard(text, successMessage = 'Copied to clipboard') {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    showToast(successMessage);
  }
}

/* --- Password/string entropy estimate in bits (shared by generator + checker) --- */
function calculateEntropy(str) {
  if (!str) return 0;
  let poolSize = 0;
  if (/[A-Z]/.test(str)) poolSize += 26;
  if (/[a-z]/.test(str)) poolSize += 26;
  if (/[0-9]/.test(str)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(str)) poolSize += 32;
  if (poolSize === 0) return 0;
  return str.length * Math.log2(poolSize);
}

/* --- Simple loading-state helper: swaps button text + disables it --- */
function setButtonLoading(button, isLoading, loadingText = 'Scanning…') {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

/* --- Scan history stored in localStorage, namespaced per tool --- */
const ToolHistory = {
  key(toolName) { return `cst-history-${toolName}`; },

  add(toolName, entry, max = 10) {
    const list = this.get(toolName);
    list.unshift({ ...entry, timestamp: Date.now() });
    localStorage.setItem(this.key(toolName), JSON.stringify(list.slice(0, max)));
  },

  get(toolName) {
    try {
      return JSON.parse(localStorage.getItem(this.key(toolName))) || [];
    } catch {
      return [];
    }
  },

  clear(toolName) {
    localStorage.removeItem(this.key(toolName));
  }
};