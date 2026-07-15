(function() {
  'use strict';

  // ============================================================
  // CONFIG â€” edit these
  // ============================================================
  const CONFIG = {
    WEBHOOK_URL: 'https://n8n.srv1017745.hstgr.cloud/webhook/realtylt-chat',
    BRAND_COLOR: '#1557b0',
    BRAND_COLOR_DARK: '#0d47a1',
    BRAND_NAME: 'Levan Tsiklauri',
    GREETING: "Hey! Looking for a home in Westchester, the Hudson Valley, or anywhere in the city? I can pull live MLS listings, text them to your phone, or get you connected with Levan directly. What are you searching for?",
    INITIAL_CHIPS: ['Show me 3-bed homes under $700k', 'Condos under $1M', 'Talk to Levan'],
    SESSION_KEY: 'realtylt_chat_session',
    HISTORY_KEY: 'realtylt_chat_history',
    HISTORY_LIMIT: 20,
    TYPING_DELAY: 300,
    REQUEST_TIMEOUT: 30000
  };

  // ============================================================
  // GUARD â€” don't double-inject
  // ============================================================
  if (window.__realtyltChatLoaded) return;
  window.__realtyltChatLoaded = true;

  // ============================================================
  // SESSION ID â€” persist across page loads
  // ============================================================
  function uuid() {
    // RFC4122-ish v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getSessionId() {
    try {
      // sessionStorage: new session per tab, persists across navigations within same tab
      let id = sessionStorage.getItem(CONFIG.SESSION_KEY);
      if (!id) {
        id = uuid();
        sessionStorage.setItem(CONFIG.SESSION_KEY, id);
      }
      return id;
    } catch (e) {
      if (!window.__rltSessionId) window.__rltSessionId = uuid();
      return window.__rltSessionId;
    }
  }

  function loadHistory() {
    try {
      const raw = sessionStorage.getItem(CONFIG.HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveHistory(history) {
    try {
      const capped = history.slice(-CONFIG.HISTORY_LIMIT);
      sessionStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(capped));
    } catch (e) { /* ignore */ }
  }

  function clearHistory() {
    try {
      sessionStorage.removeItem(CONFIG.HISTORY_KEY);
      sessionStorage.removeItem(CONFIG.SESSION_KEY);
    } catch (e) {}
  }

  // ============================================================
  // STYLES â€” injected once
  // ============================================================
  const styleId = 'rlt-chat-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .rlt-bubble, .rlt-panel, .rlt-msg, .rlt-chip, .rlt-input, .rlt-send {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-sizing: border-box;
      }
      .rlt-bubble {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${CONFIG.BRAND_COLOR};
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: 999998;
        transition: transform 0.2s, background 0.2s;
        border: none;
      }
      .rlt-bubble:hover { background: ${CONFIG.BRAND_COLOR}; transform: scale(1.06); }
      .rlt-bubble svg { width: 28px; height: 28px; }
      .rlt-bubble-badge {
        position: absolute;
        top: 0px;
        right: 0px;
        width: 12px;
        height: 12px;
        background: #34a853;
        border: 2px solid #fff;
        border-radius: 50%;
      }
      .rlt-panel {
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: 380px;
        height: 600px;
        max-height: calc(100vh - 130px);
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.22);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 999999;
        transform: translateY(calc(100% + 120px));
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        will-change: transform;
        transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, visibility 0s linear 0.32s;
      }
      .rlt-panel.rlt-open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, visibility 0s linear 0s;
      }
      .rlt-header {
        background: ${CONFIG.BRAND_COLOR};
        color: #fff;
        padding: 16px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .rlt-header-title { font-size: 16px; font-weight: 600; line-height: 1.2; }
      .rlt-header-sub { font-size: 12px; opacity: 0.85; margin-top: 2px; }
      .rlt-header-actions { display: flex; gap: 6px; }
      .rlt-header-btn {
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 10px;
        border-radius: 4px;
        opacity: 0.85;
        font-size: 11px;
        min-height: 44px;
        min-width: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .rlt-header-btn:hover { background: rgba(255,255,255,0.15); opacity: 1; }
      .rlt-msgs {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #fafafa;
      }
      .rlt-msg {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 14px;
        line-height: 1.45;
        word-wrap: break-word;
      }
      .rlt-msg-bot { background: #f1f3f4; color: #1f2937; align-self: flex-start; border-bottom-left-radius: 4px; white-space: normal; }
      .rlt-msg-user { background: ${CONFIG.BRAND_COLOR}; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; white-space: pre-wrap; }
      .rlt-msg a { color: inherit; text-decoration: underline; word-break: break-all; }
      .rlt-msg-bot a { color: ${CONFIG.BRAND_COLOR}; }
      .rlt-msg-bot ul { margin: 4px 0 4px 16px; padding: 0; }
      .rlt-msg-bot li { margin: 2px 0; }
      .rlt-msg-bot code { background: #e8eaed; border-radius: 3px; padding: 1px 4px; font-size: 13px; font-family: monospace; }
      .rlt-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 16px 8px;
      }
      .rlt-chip {
        background: #fff;
        border: 1px solid ${CONFIG.BRAND_COLOR};
        color: ${CONFIG.BRAND_COLOR};
        border-radius: 16px;
        padding: 10px 16px;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
      }
      .rlt-chip:hover { background: ${CONFIG.BRAND_COLOR}; color: #fff; }
      .rlt-typing {
        display: inline-flex;
        gap: 4px;
        padding: 12px 14px;
        background: #f1f3f4;
        border-radius: 14px;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      .rlt-typing span {
        width: 6px;
        height: 6px;
        background: #999;
        border-radius: 50%;
        animation: rlt-bounce 1.2s infinite;
      }
      .rlt-typing span:nth-child(2) { animation-delay: 0.15s; }
      .rlt-typing span:nth-child(3) { animation-delay: 0.3s; }
      @keyframes rlt-bounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
        30% { transform: translateY(-4px); opacity: 1; }
      }
      .rlt-input-wrap {
        border-top: 1px solid #e5e7eb;
        padding: 12px;
        display: flex;
        gap: 8px;
        background: #fff;
      }
      .rlt-input {
        flex: 1;
        border: 1px solid #d1d5db;
        border-radius: 20px;
        padding: 10px 14px;
        font-size: 14px;
        resize: none;
        outline: none;
        font-family: inherit;
        max-height: 96px;
        line-height: 1.4;
      }
      .rlt-input:focus { border-color: ${CONFIG.BRAND_COLOR}; }
      .rlt-send {
        background: ${CONFIG.BRAND_COLOR};
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .rlt-send:hover { background: ${CONFIG.BRAND_COLOR_DARK}; }
      .rlt-send:disabled { background: #c5c8cf; cursor: not-allowed; }
      .rlt-send svg { width: 18px; height: 18px; }
      .rlt-footer {
        text-align: center;
        font-size: 11px;
        color: #6b7280;
        padding: 6px 12px;
        background: #fff;
      }
      .rlt-error {
        background: #fef2f2;
        color: #991b1b;
        padding: 10px 14px;
        border-radius: 10px;
        font-size: 13px;
        align-self: stretch;
      }
      @media (max-width: 480px) {
        .rlt-panel {
          bottom: 0;
          right: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          max-height: 100vh;
          max-height: 100dvh;
          border-radius: 0;
          transform: translateY(100%);
        }
        .rlt-input-wrap {
          padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
        }
        .rlt-footer {
          padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
        }
        .rlt-bubble {
          bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          right: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // DOM â€” build widget elements
  // ============================================================
  const bubble = document.createElement('button');
  bubble.className = 'rlt-bubble';
  bubble.setAttribute('aria-label', 'Open RealtyLT chat');
  bubble.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <span class="rlt-bubble-badge"></span>
  `;
  document.body.appendChild(bubble);

  const panel = document.createElement('div');
  panel.className = 'rlt-panel';
  panel.innerHTML = `
    <div class="rlt-header">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;">LT</div>
        <div>
          <div class="rlt-header-title">${CONFIG.BRAND_NAME}</div>
          <div class="rlt-header-sub">RealtyLT Â· RealtorÂ® in NY Â· Live MLS</div>
        </div>
      </div>
      <div class="rlt-header-actions">
        <button class="rlt-header-btn rlt-reset-btn" title="Start a new conversation">Reset</button>
        <button class="rlt-header-btn rlt-close-btn" title="Close" aria-label="Close chat">âœ•</button>
      </div>
    </div>
    <div class="rlt-msgs" id="rlt-msgs"></div>
    <div class="rlt-chips" id="rlt-chips"></div>
    <div class="rlt-input-wrap">
      <textarea class="rlt-input" id="rlt-input" placeholder="Ask about a listing, an area, anything..." rows="1"></textarea>
      <button class="rlt-send" id="rlt-send" aria-label="Send">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
    <div class="rlt-footer">RealtyLT Â· Levan Tsiklauri, RealtorÂ®</div>
  `;
  document.body.appendChild(panel);

  const msgsEl = panel.querySelector('#rlt-msgs');
  const chipsEl = panel.querySelector('#rlt-chips');
  const inputEl = panel.querySelector('#rlt-input');
  const sendEl = panel.querySelector('#rlt-send');
  const closeEl = panel.querySelector('.rlt-close-btn');
  const resetEl = panel.querySelector('.rlt-reset-btn');

  // ============================================================
  // RENDERING
  // ============================================================
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function linkify(text) {
    // Match either an existing href="..." (to skip) or a bare URL (to linkify).
    return text.replace(/href="[^"]*"|(https?:\/\/[^\s<"]+)/g, function(match, rawUrl) {
      if (!rawUrl) return match; // was an href="..." â€” leave it alone
      const trimmed = rawUrl.replace(/[.,;:!?)\]>]+$/, '');
      const trailing = rawUrl.substring(trimmed.length);
      return `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${trimmed}</a>${trailing}`;
    });
  }

  // Render inline markdown on already-HTML-escaped text.
  function renderInline(raw) {
    let s = escapeHtml(raw);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Markdown links [text](url) â€” strip XSS, then insert <a>
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(_, txt, url) {
      const safeUrl = url.replace(/&amp;/g, '&').replace(/^javascript:/i, '');
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${txt}</a>`;
    });
    return linkify(s);
  }

  // Convert bot reply text (with **bold**, - bullets, [text](url)) to safe HTML.
  function renderMarkdown(text) {
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (/^[-*]\s/.test(trimmed)) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += '<li>' + renderInline(trimmed.slice(2)) + '</li>';
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        html += (trimmed === '' ? '' : renderInline(line)) + '<br>';
      }
    }
    if (inList) html += '</ul>';
    return html.replace(/<br>$/, '').replace(/(<br>){3,}/g, '<br><br>');
  }

  function scrollToBottom() {
    requestAnimationFrame(function() { msgsEl.scrollTop = msgsEl.scrollHeight; });
  }

  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = 'rlt-msg ' + (role === 'user' ? 'rlt-msg-user' : 'rlt-msg-bot');
    el.innerHTML = role === 'user' ? linkify(escapeHtml(text)) : renderMarkdown(text);
    msgsEl.appendChild(el);
    scrollToBottom();
  }

  function addError(text) {
    const el = document.createElement('div');
    el.className = 'rlt-error';
    el.textContent = text;
    msgsEl.appendChild(el);
    scrollToBottom();
  }

  let typingEl = null;
  function showTyping() {
    if (typingEl) return;
    typingEl = document.createElement('div');
    typingEl.className = 'rlt-typing';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    msgsEl.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTyping() {
    if (typingEl) { typingEl.remove(); typingEl = null; }
  }

  function renderChips(chips) {
    chipsEl.innerHTML = '';
    if (!chips || !chips.length) return;
    chips.forEach(function(label) {
      const c = document.createElement('button');
      c.className = 'rlt-chip';
      c.textContent = label;
      c.addEventListener('click', function() {
        inputEl.value = label;
        sendMessage();
      });
      chipsEl.appendChild(c);
    });
  }

  function clearChips() { chipsEl.innerHTML = ''; }

  // ============================================================
  // STATE
  // ============================================================
  let history = loadHistory();
  let isSending = false;

  function restoreHistory() {
    msgsEl.innerHTML = '';
    if (history.length === 0) {
      // First-time greeting
      setTimeout(function() {
        addMessage('bot', CONFIG.GREETING);
        renderChips(CONFIG.INITIAL_CHIPS);
      }, 200);
    } else {
      history.forEach(function(m) { addMessage(m.role, m.text); });
    }
  }

  function recordTurn(role, text) {
    history.push({ role, text, at: new Date().toISOString() });
    saveHistory(history);
  }

  // ============================================================
  // API CALL
  // ============================================================
  async function callAgent(message) {
    const controller = new AbortController();
    const timeout = setTimeout(function() { controller.abort(); }, CONFIG.REQUEST_TIMEOUT);

    try {
      const resp = await fetch(CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          message: message,
          userMeta: {
            page: location.pathname,
            referrer: document.referrer || '',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!resp.ok) {
        throw new Error('Server returned ' + resp.status);
      }
      const data = await resp.json();
      return data;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  // ============================================================
  // SEND
  // ============================================================
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isSending) return;
    isSending = true;
    sendEl.disabled = true;
    clearChips();

    addMessage('user', text);
    recordTurn('user', text);
    inputEl.value = '';
    inputEl.style.height = 'auto';
    showTyping();

    try {
      const data = await callAgent(text);
      hideTyping();
      const reply = (data && data.reply) ? data.reply : "Hmm, I didn't catch that â€” try again?";
      addMessage('bot', reply);
      recordTurn('bot', reply);
      renderChips(data && Array.isArray(data.suggestions) ? data.suggestions : []);
    } catch (err) {
      hideTyping();
      const msg = err.name === 'AbortError'
        ? 'That took longer than expected. Try again, or text Levan directly at (917) 905-7923.'
        : 'Something went wrong on my end. Try again, or reach Levan at (917) 905-7923.';
      addError(msg);
      console.error('[RealtyLT chat]', err);
    } finally {
      isSending = false;
      sendEl.disabled = false;
      inputEl.focus();
    }
  }

  // ============================================================
  // EVENT WIRING
  // ============================================================
  bubble.addEventListener('click', function() {
    panel.classList.add('rlt-open');
    bubble.style.display = 'none';
    // Don't auto-focus on touch devices â€” it triggers the keyboard immediately, which is jarring
    if (!window.matchMedia('(pointer: coarse)').matches) {
      setTimeout(function() { inputEl.focus(); }, 350);
    }
  });

  closeEl.addEventListener('click', function() {
    panel.classList.remove('rlt-open');
    panel.style.height = '';
    panel.style.bottom = '';
    bubble.style.display = 'flex';
  });

  // Keep the input bar above the virtual keyboard on iOS Safari.
  // visualViewport.height shrinks when the keyboard opens; window.innerHeight does not.
  if (window.visualViewport) {
    function adjustForKeyboard() {
      if (window.innerWidth > 480 || !panel.classList.contains('rlt-open')) return;
      var vv = window.visualViewport;
      var offsetFromBottom = window.innerHeight - vv.height - vv.offsetTop;
      panel.style.height = vv.height + 'px';
      panel.style.bottom = Math.max(0, offsetFromBottom) + 'px';
    }
    window.visualViewport.addEventListener('resize', adjustForKeyboard);
    window.visualViewport.addEventListener('scroll', adjustForKeyboard);
  }

  resetEl.addEventListener('click', function() {
    if (confirm('Start a fresh conversation? Your current chat will be cleared.')) {
      clearHistory();
      history = [];
      msgsEl.innerHTML = '';
      restoreHistory();
    }
  });

  sendEl.addEventListener('click', sendMessage);

  inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  inputEl.addEventListener('input', function() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 96) + 'px';
  });

  // ============================================================
  // INIT
  // ============================================================
  restoreHistory();

  // Expose minimal API for debugging
  window.RealtyLTChat = {
    open: function() { bubble.click(); },
    close: function() { closeEl.click(); },
    reset: function() { resetEl.click(); },
    getSessionId: getSessionId,
    getHistory: function() { return history.slice(); }
  };
})();
