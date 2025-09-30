// Numerology app: calls proxy endpoint with user text
const endpoint = 'http://localhost:5050/api/numerology';

const inputEl = document.getElementById('userInput');
const buttonEl = document.getElementById('viewResult');
const resultEl = document.getElementById('result');

buttonEl.addEventListener('click', async () => {
  const text = (inputEl.value || '').trim();
  if (!text) {
    renderError('Please enter your name and date of birth.');
    return;
  }

  setLoading(true);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: text })
    });

    if (!res.ok) {
      const errText = await safeText(res);
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await safeJson(res);
    const display = pickDisplayText(data);
    renderResult(display);
  } catch (e) {
    const msg = e?.message || String(e);
    // Surface common browser CORS issue hint
    const hint = ' If this persists, it may be a CORS restriction on the API.';
    renderError(msg + hint);
  } finally {
    setLoading(false);
  }
});

function pickDisplayText(data) {
  if (data == null) return 'No data received.';
  if (typeof data === 'string') return data;
  // Try common fields; fall back to formatted JSON
  const candidates = ['answer', 'output', 'message', 'result', 'text'];
  for (const key of candidates) {
    if (data[key]) return data[key];
  }
  return JSON.stringify(data, null, 2);
}

async function safeJson(res) {
  const ct = res.headers.get('Content-Type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch {}
  }
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

async function safeText(res) {
  try { return await res.text(); } catch { return 'Unknown error'; }
}

function renderResult(text) {
  resultEl.innerHTML = '';
  const pre = document.createElement('pre');
  pre.textContent = text;
  resultEl.appendChild(pre);
}

function renderError(message) {
  resultEl.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'error';
  div.textContent = message;
  resultEl.appendChild(div);
}

function setLoading(loading) {
  buttonEl.disabled = loading;
  buttonEl.textContent = loading ? 'Loading…' : 'View Result';
}