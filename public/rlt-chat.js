(function() {
  'use strict';

  // ============================================================
  // CONFIG - edit these
  // ============================================================
  const CONFIG = {
    // CUTOVER 2026-08-20 (owner's call: "make it our own chat and fully test in production").
    // The CRM's own agent speaks the widget's exact contract (proven by the CRM's
    // chat-compat-harness against this very function). Rollback = put the n8n line back:
    // 'https://n8n.srv1017745.hstgr.cloud/webhook/realtylt-chat' — the workflow stays
    // published and untouched. The vercel host is deliberate: app.realtylt.com DNS still
    // points at the old server.
    WEBHOOK_URL: 'https://realtylt-crm-web.vercel.app/api/chat/agent',
    // The CRM mints the session id and a signed ownership token here (C1, 2026-08-24). Asking
    // for the id server-side — instead of minting one in the browser — is what stops a stranger
    // who guesses a session id from reading the conversation back through the assistant.
    SESSION_URL: 'https://realtylt-crm-web.vercel.app/api/chat/session',
    // TAKEOVER DELIVERY (2026-08-26). When Levan presses Take over in the CRM and types, the
    // reply is a chat_logs row with sender='agent' and nothing carried it here — measured on
    // prod, row 220, never rendered. This is where we ask for his replies while the panel is
    // open. Needs the ownership token, so a widget in the no-token fallback simply never polls.
    POLL_URL: 'https://realtylt-crm-web.vercel.app/api/chat/messages',
    POLL_INTERVAL: 10000,
    BRAND_COLOR: '#1557b0',
    BRAND_COLOR_DARK: '#0d47a1',
    BRAND_NAME: 'Levan Tsiklauri',
    GREETING: "Hey! Looking for a home in Westchester, the Hudson Valley, or anywhere in the city? I can pull live MLS listings and get you connected with Levan directly. What are you searching for?",
    INITIAL_CHIPS: ['Show me 3-bed homes under $700k', 'Condos under $1M', 'Talk to Levan'],
    // THE OTHER OPENING (2026-08-27). The same widget now runs on realtylt.com/ai, where the
    // visitor did not come to look at houses. Greeting them with Westchester listings is the
    // wrong assistant wearing the right coat. Chosen by detectPersona() below; the two lines
    // above are untouched and still open every conversation on every other page.
    AI_GREETING: "Hey! I'm the assistant on RealtyLT's AI side. I can walk you through what we build, chat assistants, voice agents, automations, and what would actually be worth doing first for your business. What do you do?",
    AI_CHIPS: ['What could AI automate for me?', 'How do voice agents work?', 'Book a call with Levan'],
    SESSION_KEY: 'realtylt_chat_session',
    HISTORY_KEY: 'realtylt_chat_history',
    HISTORY_LIMIT: 20,
    TYPING_DELAY: 300,
    REQUEST_TIMEOUT: 30000
  };

  // THE THREE URLS, AND ONLY THOSE, may be pointed somewhere else by a page that sets
  // window.RLT_CHAT_CONFIG before this script loads. That is how the CRM's harness drives this
  // exact file against a local server instead of a shipped copy that has drifted from it.
  // Production sets nothing and gets the constants above; nothing else is overridable, so a
  // stray global on a live page cannot rebrand or restyle the widget.
  if (window.RLT_CHAT_CONFIG) {
    ['WEBHOOK_URL', 'SESSION_URL', 'POLL_URL'].forEach(function(key) {
      const value = window.RLT_CHAT_CONFIG[key];
      if (typeof value === 'string' && value) CONFIG[key] = value;
    });
  }

  // ============================================================
  // GUARD - don't double-inject
  // ============================================================
  if (window.__realtyltChatLoaded) return;
  window.__realtyltChatLoaded = true;

  // ============================================================
  // SESSION - server-minted id + ownership token (C1, 2026-08-24)
  // ============================================================
  // The CRM mints the session id and signs a token that proves THIS browser owns the
  // conversation. We ask for both once (SESSION_URL), carry the token on every turn
  // (x-rlt-chat-token), and refresh it from each reply. Guessing someone's session id no
  // longer buys their transcript: without the token the CRM answers statelessly.
  //
  // GRACEFUL FALLBACK. If the CRM has no signing key yet, or the mint call fails, we fall back
  // to a locally-minted id with no token. The assistant still answers — just without memory
  // across turns — which is exactly how this widget behaved before tokens existed. So this is
  // safe to ship ahead of the CRM's CHAT_SESSION_SECRET; it upgrades itself the moment that
  // key is set.
  function uuid() {
    // RFC4122-ish v4 - only used when the server mint is unavailable.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ============================================================
  // PERSONA - which of the two assistants this conversation belongs to
  // ============================================================
  // THE OWNER, 2026-08-27: on realtylt.com/ai the widget must stop asking about homes and be
  // the AI-services assistant instead. The page is the only thing that knows, so the page tells
  // the server, in `userMeta.context`.
  //
  // IT IS A HINT AND THE SERVER TREATS IT AS ONE. It picks a prompt, a tool set, a greeting and
  // a lead stamp. It changes nothing about the origin allowlist, the session token, the rate
  // limit or any gate - a browser that lies about it gets a different tone and FEWER tools.
  // (crm: apps/web/lib/chat/persona.ts carries the full reasoning.)
  //
  // IT STICKS TO THE CONVERSATION, NOT TO THE PAGE. Stored beside the session id, so a visitor
  // who starts on /ai and then wanders onto the main site keeps the assistant they started
  // with. A conversation begun anywhere else is real-estate, exactly as it always was.
  function detectPersona() {
    try {
      // `/ai`, `/ai/anything` - and NOT `/air-conditioning`, which is what a bare startsWith
      // would have matched.
      if (/^\/ai(?:\/|$)/.test(location.pathname || '')) return 'aipage';
      // The AI page's own Vercel deployments: realtylt-ai-page.vercel.app and the per-deploy
      // hash urls under the same project, both of which the CRM's origin allowlist knows.
      if (/^realtylt-ai-page(?:[-.])/.test(location.hostname || '')) return 'aipage';
    } catch (e) { /* exotic environment: fall through to the default */ }
    return 'realestate';
  }

  // ============================================================
  // PORTAL IDENTITY - the visitor who is already signed in
  // ============================================================
  // A client signed in to realtylt.com has been chatting as an anonymous stranger: greeted cold
  // and asked for a name and number the CRM already has. This carries their Supabase ACCESS
  // TOKEN to the chat routes so the server can verify who they are (crm: lib/chat/portal.ts,
  // migration 0241). We send a TOKEN and never a name: a name in a request body is a claim, and
  // a claim about who you are is exactly the thing that must not be believed.
  //
  // WHERE THE SESSION ACTUALLY LIVES, verified against the installed dependency rather than
  // assumed: this site uses @supabase/ssr 0.5.2 (lib/supabase/client.ts, createBrowserClient),
  // which stores the session in a COOKIE and not in localStorage. Its format, from the package's
  // own chunker.js and cookies.js:
  //
  //   name     sb-<projectref>-auth-token, or sb-<projectref>-auth-token.0, .1 ... when the
  //            url-encoded value exceeds 3180 characters (combineChunks joins them in order,
  //            preferring the unsuffixed cookie when it exists).
  //   value    the session JSON, optionally prefixed "base64-" and base64url-encoded.
  //
  // localStorage is read too, because plain supabase-js writes there under the same key name,
  // and window.RLT_PORTAL_TOKEN is read first so a page that would rather hand the token over
  // explicitly can, without this file having to keep up with a storage format.
  //
  // EVERY FAILURE IS SILENT AND MEANS "ANONYMOUS". Not signed in, signed in with an expired
  // token, a storage format we do not recognise: all of them are an ordinary visitor, which is
  // what this widget has always served.
  function b64urlDecode(value) {
    const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  // The access token out of a stored supabase session, whatever shape it was stored in.
  function accessTokenFrom(raw) {
    if (!raw) return null;
    let text = raw;
    if (text.indexOf('base64-') === 0) text = b64urlDecode(text.slice(7));
    const parsed = JSON.parse(text);
    // The object is the current shape; the array is what older clients wrote, access token first.
    const token = Array.isArray(parsed) ? parsed[0] : parsed && parsed.access_token;
    return typeof token === 'string' && token ? token : null;
  }

  const AUTH_COOKIE = /^sb-.+-auth-token$/;

  function tokenFromCookies() {
    const jar = {};
    (document.cookie || '').split(';').forEach(function(part) {
      const eq = part.indexOf('=');
      if (eq < 0) return;
      const name = part.slice(0, eq).trim();
      try { jar[name] = decodeURIComponent(part.slice(eq + 1)); }
      catch (e) { /* a value that will not decode is not one supabase wrote */ }
    });
    // Base names first, then chunk sets, exactly as combineChunks resolves them.
    const bases = Object.keys(jar).map(function(n) { return n.replace(/\.\d+$/, ''); });
    for (const base of bases) {
      if (!AUTH_COOKIE.test(base)) continue;
      let raw = jar[base];
      if (!raw) {
        const parts = [];
        for (let i = 0; jar[base + '.' + i] !== undefined; i++) parts.push(jar[base + '.' + i]);
        raw = parts.join('');
      }
      try {
        const token = accessTokenFrom(raw);
        if (token) return token;
      } catch (e) { /* not a session we understand */ }
    }
    return null;
  }

  function tokenFromLocalStorage() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !AUTH_COOKIE.test(key)) continue;
      try {
        const token = accessTokenFrom(localStorage.getItem(key));
        if (token) return token;
      } catch (e) { /* not a session we understand */ }
    }
    return null;
  }

  function readPortalToken() {
    try {
      if (typeof window.RLT_PORTAL_TOKEN === 'string' && window.RLT_PORTAL_TOKEN) {
        return window.RLT_PORTAL_TOKEN;
      }
    } catch (e) { /* fall through */ }
    try { const c = tokenFromCookies(); if (c) return c; } catch (e) { /* fall through */ }
    try { const l = tokenFromLocalStorage(); if (l) return l; } catch (e) { /* private mode */ }
    return null;
  }

  // The header the CRM reads it from. A bearer credential belongs in a header, never in a body.
  const PORTAL_HEADER = 'x-rlt-portal-token';

  function withPortalToken(headers) {
    const token = readPortalToken();
    if (token) headers[PORTAL_HEADER] = token;
    return headers;
  }

  // { id, token, cursor, persona } for this tab. Held in memory and mirrored to sessionStorage.
  let _session = null;

  function readStoredSession() {
    try {
      const raw = sessionStorage.getItem(CONFIG.SESSION_KEY);
      if (!raw) return null;
      // JSON is the current shape; a bare string is a session id from an older widget.
      if (raw.charAt(0) === '{') {
        const o = JSON.parse(raw);
        if (o && o.id) return { id: o.id, token: o.token || null, cursor: o.cursor || 0, persona: o.persona || null };
        return null;
      }
      return { id: raw, token: null, cursor: 0, persona: null };
    } catch (e) { return null; }
  }

  function writeStoredSession(s) {
    // FOUR FIELDS, NAMED. `displayName` is deliberately not one of them: a name written to
    // storage would outlive the sign-out that took it away, and the only thing it is for is the
    // opening line of a conversation that has not started yet.
    try {
      sessionStorage.setItem(
        CONFIG.SESSION_KEY,
        JSON.stringify({ id: s.id, token: s.token || null, cursor: s.cursor || 0, persona: s.persona || null })
      );
    } catch (e) { /* private mode: memory-only for this tab */ }
  }

  // Resolve the session once, then reuse it. Asks the CRM to mint an id + token; falls back to
  // a local id if that is unavailable.
  async function ensureSession() {
    if (_session && _session.id) return _session;
    const stored = readStoredSession();
    if (stored) {
      // A session stored by an older copy of this file carries no persona. Stamp it from
      // wherever the visitor is standing now rather than leaving it null: an unstamped session
      // would re-detect on every page and stop being sticky, which is the point of storing it.
      if (!stored.persona) { stored.persona = detectPersona(); writeStoredSession(stored); }
      _session = stored;
      return _session;
    }
    // THE PORTAL TOKEN RIDES HERE TOO, so a signed-in client can be greeted by name in the
    // opening line rather than being recognised only on reply number two.
    //
    // AND THE SAME PREFLIGHT PROBLEM APPLIES, with a quieter cost. A CRM whose
    // Access-Control-Allow-Headers does not name `x-rlt-portal-token` makes the browser block
    // this request, and the fallback below mints a LOCAL id with no ownership token, which the
    // CRM then answers statelessly: no memory across turns and no take-over polling. That is a
    // worse conversation than an anonymous one, for the one visitor we know the most about. So
    // this asks a second time without the header before it gives up on the server entirely.
    const mint = async (withoutPortalToken) => {
      const headers = { 'Content-Type': 'application/json' };
      if (!withoutPortalToken) withPortalToken(headers);
      return fetch(CONFIG.SESSION_URL, { method: 'POST', headers: headers, body: '{}' });
    };
    try {
      let resp;
      try {
        resp = await mint(false);
      } catch (e) {
        if (!readPortalToken()) throw e;
        resp = await mint(true);
      }
      if (resp.ok) {
        const d = await resp.json();
        if (d && d.sessionId) {
          _session = { id: d.sessionId, token: d.token || null, cursor: 0, persona: detectPersona() };
          writeStoredSession(_session);
          // Memory only, and only for this conversation's first line. The server decided it,
          // from a token it verified; nothing here asserts who anybody is.
          _session.displayName = (d && typeof d.displayName === 'string' && d.displayName) || null;
          return _session;
        }
      }
    } catch (e) { /* fall through to a local id */ }
    _session = { id: uuid(), token: null, cursor: 0, persona: detectPersona() };
    writeStoredSession(_session);
    return _session;
  }

  // The persona this conversation belongs to: the one it was opened with when we have it, and
  // otherwise the page under the visitor's feet. Safe to call before ensureSession has run,
  // which the greeting does.
  function currentPersona() {
    if (_session && _session.persona) return _session.persona;
    const stored = readStoredSession();
    if (stored && stored.persona) return stored.persona;
    return detectPersona();
  }

  // Each agent reply carries a fresh token; keep the newest so the session stays owned.
  function updateToken(token) {
    if (token && _session) { _session.token = token; writeStoredSession(_session); }
  }

  // How far through the transcript we have been shown Levan's replies. Persisted with the
  // session so a page reload does not replay everything he already said.
  function updateCursor(cursor) {
    if (typeof cursor === 'number' && _session && cursor > (_session.cursor || 0)) {
      _session.cursor = cursor;
      writeStoredSession(_session);
    }
  }

  function getSessionId() {
    if (_session && _session.id) return _session.id;
    const s = readStoredSession();
    return s ? s.id : null;
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
    // Drop the in-memory session too, so Reset genuinely starts a new conversation (a fresh
    // server-minted id) rather than re-using the one held in this closure.
    _session = null;
  }

  // ============================================================
  // STYLES - injected once
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
        border-radius: 8px;
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
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.45;
        word-wrap: break-word;
      }
      .rlt-msg-bot { background: #f1f3f4; color: #1f2937; align-self: flex-start; border-bottom-left-radius: 4px; white-space: normal; }
      /* A reply Levan typed himself in the CRM. Same bubble, tinted and tagged, so it is
         obvious at a glance which words are his and which are the assistant's. */
      .rlt-msg-agent { background: #eaf1fb; box-shadow: inset 3px 0 0 ${CONFIG.BRAND_COLOR}; }
      .rlt-agent-tag {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: ${CONFIG.BRAND_COLOR_DARK};
        margin-bottom: 4px;
      }
      /* WHO IS ON THE OTHER END, at the moment it changes. The tag above says whose words a
         bubble is; this says when the person arrived and when they left. Deliberately not a
         bubble: it is the room telling you something, not somebody speaking. Centred, quiet,
         and short enough to stay one line at 390px. */
      .rlt-msg-system {
        align-self: center;
        max-width: 92%;
        background: none;
        padding: 2px 0;
        font-size: 12px;
        line-height: 1.35;
        color: #6b7280;
        text-align: center;
      }
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
        border-radius: 16px;
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
        border-radius: 9999px;
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
        border-radius: 8px;
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
        /* iOS zooms the page in when a sub-16px field takes focus and never zooms back out —
           in a full-screen chat panel that leaves the composer half off-screen. */
        .rlt-input {
          font-size: 16px;
        }
        .rlt-footer {
          padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
        }
        .rlt-bubble {
          bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          right: 16px;
        }
        /* PHONE ONLY: stay out of the first viewport. Measured 2026-07-30 at 390x844, the
           launcher sat ON a real control on six routes — a form field in /selling's hero
           (1710px²), a link on /blog and a county CTA on /top-areas buried under the whole
           60x60 circle (3600px²), an input on /portal, "See Home Value" in the home hero.
           A phone has no room to move it to, so it waits instead: nothing floats over the
           first impression, and it fades in as soon as the visitor starts reading. Desktop
           is untouched (it has the margin to spare). */
        .rlt-bubble--tucked {
          opacity: 0;
          pointer-events: none;
          transform: translateY(10px) scale(0.9);
        }
      }
      @media (max-width: 480px) and (prefers-reduced-motion: no-preference) {
        .rlt-bubble { transition: transform 0.25s ease, opacity 0.25s ease, background 0.2s; }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // DOM - build widget elements
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

  // The launcher is tucked away until the visitor has scrolled clear of the first viewport.
  // The class is toggled at every width; only the phone stylesheet acts on it, so desktop
  // behaviour is unchanged. Once the panel has been opened the launcher stays put — by then
  // the visitor has asked for it, and having it vanish under them would be worse than an overlap.
  let bubbleSummoned = false;
  const TUCK_UNTIL = () => Math.round(window.innerHeight * 0.6);
  const syncBubble = () => {
    if (bubbleSummoned) return;
    bubble.classList.toggle('rlt-bubble--tucked', window.scrollY < TUCK_UNTIL());
  };
  bubble.classList.add('rlt-bubble--tucked');
  window.addEventListener('scroll', syncBubble, { passive: true });
  window.addEventListener('resize', syncBubble, { passive: true });
  syncBubble();

  const panel = document.createElement('div');
  panel.className = 'rlt-panel';
  panel.innerHTML = `
    <div class="rlt-header">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;">LT</div>
        <div>
          <div class="rlt-header-title">${CONFIG.BRAND_NAME}</div>
          <div class="rlt-header-sub">RealtyLT · REALTOR® in NY · Live MLS</div>
        </div>
      </div>
      <div class="rlt-header-actions">
        <button class="rlt-header-btn rlt-reset-btn" title="Start a new conversation">Reset</button>
        <button class="rlt-header-btn rlt-close-btn" title="Close" aria-label="Close chat">✕</button>
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
    <div class="rlt-footer">RealtyLT · Levan Tsiklauri, REALTOR®</div>
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
      if (!rawUrl) return match; // was an href="..." - leave it alone
      const trimmed = rawUrl.replace(/[.,;:!?)\]>]+$/, '');
      const trailing = rawUrl.substring(trimmed.length);
      return `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${trimmed}</a>${trailing}`;
    });
  }

  // A URL a chat bubble may link to. Anything else becomes an inert '#'.
  //
  // MEASURED 2026-08-26, driving this file in a real browser: the previous version stripped a
  // LEADING "javascript:" and unescaped "&amp;" first, and five payloads walked straight past
  // it into a rendered href — " javascript:…", "\tjavascript:…" (a browser strips whitespace
  // and control characters when it parses a URL, so those are the same scheme to it),
  // "&#106;avascript:…" (the &amp; unescape handed the entity back so the attribute parser
  // could decode it), "data:text/html,<script>…" and "vbscript:…". A denylist of one scheme was
  // never going to hold; this is an allowlist, and it is checked against the value with those
  // characters already removed.
  //
  // The &amp; unescape is gone with it. Leaving "&amp;" in an href is the CORRECT encoding —
  // the attribute parser turns it back into "&" — so undoing it bought nothing and cost the
  // entity bypass above.
  function safeHref(url) {
    // eslint-disable-next-line no-control-regex
    const cleaned = String(url).replace(/[\u0000-\u0020\u00a0\u2028\u2029]+/g, '');
    if (/^(?:https?:|mailto:|tel:)/i.test(cleaned)) return cleaned;
    // A PROTOCOL-RELATIVE url is NOT a relative url. Measured 2026-08-26 (review round):
    // "[go](//evil.example.com/x)" passed the leading-slash rule below and rendered as an
    // ordinary-looking link inside the branded panel that resolves to https://evil.example.com/x.
    // It is not script execution, so the allowlist above was never wrong — but the visitor is
    // being sent off-site by text the model (or an MLS remark, or a typed agent reply) supplied,
    // which is a phishing surface we hand out for free. One leading slash is a path; two is a host.
    if (/^\/\//.test(cleaned)) return '#';
    // Relative and same-page links: a path, a query, a fragment, or a bare filename.
    if (/^[/#?]/.test(cleaned) || /^[\w.-]+(?:[/?#]|$)/.test(cleaned)) return cleaned;
    return '#';
  }

  // Render inline markdown on already-HTML-escaped text.
  function renderInline(raw) {
    let s = escapeHtml(raw);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Markdown links [text](url). The text is already escaped; the URL goes through the
    // scheme allowlist above. This path now carries three kinds of text a visitor can shape -
    // the model's own reply, a tool result quoting an MLS remark, and (from 2026-08-26) a
    // reply typed by a person in the CRM - so it is not the place for a denylist.
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(_, txt, url) {
      return `<a href="${safeHref(url)}" target="_blank" rel="noopener noreferrer">${txt}</a>`;
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

  // role: 'user' | 'bot' | 'agent'. 'agent' is a real person (Levan) typing in the CRM after
  // Take over; it is rendered as a bot-side bubble with his name on it so the visitor is never
  // left guessing whether they are still talking to the assistant.
  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = 'rlt-msg ' + (role === 'user' ? 'rlt-msg-user' : 'rlt-msg-bot')
      + (role === 'agent' ? ' rlt-msg-agent' : '');
    const body = role === 'user' ? linkify(escapeHtml(text)) : renderMarkdown(text);
    el.innerHTML = role === 'agent'
      ? '<span class="rlt-agent-tag">' + escapeHtml(CONFIG.BRAND_NAME.split(' ')[0]) + ' · live</span>' + body
      : body;
    msgsEl.appendChild(el);
    scrollToBottom();
  }

  // A line from the ROOM, not from anybody in it: "Levan has joined the chat", "You're back
  // with the assistant". textContent, never innerHTML - the only strings that reach it are the
  // two literals below, and it stays that way.
  function addSystemLine(text) {
    const el = document.createElement('div');
    el.className = 'rlt-msg rlt-msg-system';
    el.setAttribute('data-testid', 'rlt-system-line');
    el.textContent = text;
    msgsEl.appendChild(el);
    scrollToBottom();
  }

  /*
   * WHOSE CHAT IS THIS RIGHT NOW.
   *
   * The owner, 2026-08-26: "I don't see if I speak with agent or Levan... will it show I'm live
   * and it's me not AI". His bubbles already carry a "Levan - live" tag; what was missing is the
   * MOMENT. A visitor with the panel open sees nothing happen when he presses Take over, and
   * nothing at all when he hands a conversation back without typing.
   *
   * `null` means we have not been told yet. The FIRST answer only records the state and says
   * nothing: a visitor opening a panel on a conversation he already had would otherwise be told
   * he "has joined" something he joined ten minutes ago. Only a CHANGE is worth a line.
   */
  let _paused = null;
  function notePausedState(paused) {
    if (typeof paused !== 'boolean') return;
    if (_paused === null) { _paused = paused; return; }
    if (paused === _paused) return;
    _paused = paused;
    addSystemLine(paused
      ? CONFIG.BRAND_NAME.split(' ')[0] + ' has joined the chat'
      : "You're back with the assistant");
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
      // First-time greeting. Three of them now: the AI page opens a different conversation, and
      // a signed-in client is greeted by name instead of being asked who they are. Everyone
      // else gets the original two lines on the original timing, unchanged.
      let greeted = false;
      const greetOnce = function() {
        if (greeted) return;
        greeted = true;
        const ai = currentPersona() === 'aipage';
        const name = (_session && _session.displayName) || '';
        addMessage(
          'bot',
          name
            ? (ai
                ? 'Welcome back, ' + name + '. What can I help you with on the AI side today?'
                : 'Welcome back, ' + name + '. Want to pick up where you left off, or shall I pull something new from the MLS?')
            : (ai ? CONFIG.AI_GREETING : CONFIG.GREETING)
        );
        renderChips(ai ? CONFIG.AI_CHIPS : CONFIG.INITIAL_CHIPS);
      };
      if (readPortalToken()) {
        // ONLY FOR A SIGNED-IN CLIENT. Asking the CRM who they are means minting the session
        // now rather than on their first message, and doing that for every page view on
        // realtylt.com would be a POST nobody asked for. The 1500ms cap is there so a slow or
        // failed mint never leaves somebody looking at an empty panel.
        setTimeout(greetOnce, 1500);
        ensureSession().then(greetOnce, greetOnce);
      } else {
        setTimeout(greetOnce, 200);
      }
    } else {
      history.forEach(function(m) { addMessage(m.role, m.text); });
    }
  }

  function recordTurn(role, text) {
    history.push({ role, text, at: new Date().toISOString() });
    saveHistory(history);
  }

  // ============================================================
  // TAKEOVER RELAY - hearing Levan when he takes the conversation over
  // ============================================================
  // He presses Take over in the CRM, types, and it lands in chat_logs as sender='agent'. Until
  // 2026-08-26 nothing brought it here: measured on prod, his reply (row 220) was never
  // rendered and the visitor's next message came back as the same static "he'll reply shortly"
  // notice. Two paths now carry it - this poll while the panel is open, and the paused reply to
  // the visitor's own next message - and BOTH funnel through renderAgentMessages, so a race
  // between them shows his sentence once rather than twice.
  const seenAgentIds = new Set();
  let pollTimer = null;

  function renderAgentMessages(list) {
    if (!Array.isArray(list) || !list.length) return 0;
    let shown = 0;
    list.forEach(function(m) {
      if (!m || typeof m.text !== 'string' || !m.text.trim()) return;
      const id = typeof m.id === 'number' ? m.id : null;
      if (id !== null) {
        if (seenAgentIds.has(id)) return;
        seenAgentIds.add(id);
      }
      addMessage('agent', m.text);
      recordTurn('agent', m.text);
      if (id !== null) updateCursor(id);
      shown += 1;
    });
    return shown;
  }

  async function pollAgentMessages() {
    // No token means the CRM cannot tell this conversation is ours and answers 401 by design,
    // so there is nothing to ask for - the no-token fallback simply never polls. A panel nobody
    // has open, or a tab in the background, is not worth a request either.
    if (isSending || !_session || !_session.id || !_session.token) return;
    if (!panel.classList.contains('rlt-open')) return;
    if (document.visibilityState === 'hidden') return;
    try {
      const url = CONFIG.POLL_URL
        + '?sessionId=' + encodeURIComponent(_session.id)
        + '&since=' + encodeURIComponent(_session.cursor || 0);
      const resp = await fetch(url, { headers: { 'x-rlt-chat-token': _session.token } });
      // 401 and 429 are answers, not failures worth a console line every ten seconds.
      if (!resp.ok) return;
      const data = await resp.json();
      // BEFORE his words, so "Levan has joined the chat" sits above the reply it explains.
      // An older CRM that does not send `paused` simply leaves this untouched.
      notePausedState(data && data.paused);
      const shown = renderAgentMessages(data && data.messages);
      updateCursor(data && data.cursor);
      // A person just answered, so the chips the assistant offered before he arrived are stale.
      if (shown) clearChips();
    } catch (e) { /* offline or suspending: the next tick tries again */ }
  }

  function startPolling() {
    if (pollTimer) return;
    pollTimer = setInterval(pollAgentMessages, CONFIG.POLL_INTERVAL);
    pollAgentMessages();
  }

  function stopPolling() {
    if (!pollTimer) return;
    clearInterval(pollTimer);
    pollTimer = null;
  }

  // Coming back to the tab should show his reply immediately, not up to ten seconds later.
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') pollAgentMessages();
  });

  // ============================================================
  // API CALL
  // ============================================================
  // A CUSTOM HEADER IS A PROMISE THE OTHER END HAS TO HAVE KEPT.
  //
  // `x-rlt-portal-token` triggers a CORS PREFLIGHT, and a CRM whose
  // Access-Control-Allow-Headers does not list it makes the browser BLOCK the request entirely.
  // Not a 4xx we could read: blocked, as a TypeError, before anything is sent. Measured against
  // the live CRM on 2026-08-27, whose preflight answers "Content-Type, x-rlt-chat-token".
  //
  // This file and the CRM deploy from different repositories on different days, so "they will
  // ship together" is not a thing either of them can promise. So the widget carries its own
  // answer: if a turn fails outright AND it was carrying the portal header, it goes again
  // without it. The visitor loses the by-name greeting on an old CRM and keeps their
  // conversation, which is the right way round.
  //
  // ONLY ON A REQUEST THAT NEVER LANDED. A timeout (AbortError) is not a rejected header, and
  // retrying one would double a thirty-second wait in front of somebody already waiting.
  async function postTurn(message, opts) {
    const controller = new AbortController();
    const timeout = setTimeout(function() { controller.abort(); }, CONFIG.REQUEST_TIMEOUT);
    try {
      const sess = await ensureSession();
      const headers = { 'Content-Type': 'application/json' };
      // The token proves ownership of this session; without it the CRM answers statelessly.
      if (sess.token) headers['x-rlt-chat-token'] = sess.token;
      // And, independently, who the person is when they are signed in to the portal. Two
      // credentials, two gates: this one never opens a conversation and that one never proves
      // an identity. Re-read every turn, so signing out mid-conversation takes effect at once.
      if (!opts || !opts.withoutPortalToken) withPortalToken(headers);

      const resp = await fetch(CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          sessionId: sess.id,
          message: message,
          userMeta: {
            page: location.pathname,
            // WHICH ASSISTANT THIS CONVERSATION BELONGS TO (2026-08-27). `page` alone could
            // not answer it: it changes as the visitor navigates, and the conversation does
            // not. Sent on every turn so the server never has to remember.
            context: sess.persona || detectPersona(),
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
      // The reply carries a refreshed token; keep the newest so the session stays owned.
      if (data && data.sessionToken) updateToken(data.sessionToken);
      return data;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  async function callAgent(message) {
    const carriedPortalToken = Boolean(readPortalToken());
    try {
      return await postTurn(message);
    } catch (err) {
      const abandoned = err && (err.name === 'AbortError' || /Server returned/.test(String(err.message)));
      if (!carriedPortalToken || abandoned) throw err;
      // The header is the only thing that could have been refused before the request left.
      return await postTurn(message, { withoutPortalToken: true });
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
      // He answered while we were typing. His words ARE the reply to this turn - the response
      // also repeats them in `reply` so an older copy of this widget still shows them, which is
      // exactly why they must not be printed twice here.
      const relayed = renderAgentMessages(data && data.agentMessages);
      updateCursor(data && data.cursor);
      if (relayed) {
        clearChips();
      } else {
        const reply = (data && data.reply) ? data.reply : "Hmm, I didn't catch that. Try again?";
        addMessage('bot', reply);
        recordTurn('bot', reply);
        renderChips(data && Array.isArray(data.suggestions) ? data.suggestions : []);
      }
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
    // Asked for once, always available after: never tuck it away again this visit.
    bubbleSummoned = true;
    bubble.classList.remove('rlt-bubble--tucked');
    panel.classList.add('rlt-open');
    bubble.style.display = 'none';
    // Don't auto-focus on touch devices - it triggers the keyboard immediately, which is jarring
    if (!window.matchMedia('(pointer: coarse)').matches) {
      setTimeout(function() { inputEl.focus(); }, 350);
    }
    startPolling();
  });

  closeEl.addEventListener('click', function() {
    panel.classList.remove('rlt-open');
    panel.style.height = '';
    panel.style.bottom = '';
    bubble.style.display = 'flex';
    stopPolling();
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
      // The poll timer is left running on purpose: clearHistory() drops the session, the poll
      // no-ops without one, and it picks the new conversation up the moment one is minted.
      clearHistory();
      seenAgentIds.clear();
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
    getHistory: function() { return history.slice(); },
    // The relay, for a harness (and for diagnosing a takeover that did not arrive).
    pollNow: pollAgentMessages,
    getCursor: function() { return _session ? (_session.cursor || 0) : 0; }
  };
})();
