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
    // published and untouched. REBRANDED 2026-08-28: app.realtylt.com now points at the CRM's
    // Vercel deployment (DNS cut over on launch day), so the visitor-facing host is ours;
    // realtylt-crm-web.vercel.app still answers and remains the rollback host.
    WEBHOOK_URL: 'https://app.realtylt.com/api/chat/agent',
    // The CRM mints the session id and a signed ownership token here (C1, 2026-08-24). Asking
    // for the id server-side — instead of minting one in the browser — is what stops a stranger
    // who guesses a session id from reading the conversation back through the assistant.
    SESSION_URL: 'https://app.realtylt.com/api/chat/session',
    // TAKEOVER DELIVERY (2026-08-26). When Levan presses Take over in the CRM and types, the
    // reply is a chat_logs row with sender='agent' and nothing carried it here — measured on
    // prod, row 220, never rendered. This is where we ask for his replies while the panel is
    // open. Needs the ownership token, so a widget in the no-token fallback simply never polls.
    POLL_URL: 'https://app.realtylt.com/api/chat/messages',
    POLL_INTERVAL: 10000,
    // CLICK TO TALK (2026-08-27). Two routes, and the split IS the security design. The first
    // mints a Gemini Live token whose model, persona and TOOL LIST are locked server-side, so the
    // socket this browser then opens straight to Google cannot be widened by anything on this
    // page. The second is the only door back: every tool the model asks for runs on the CRM, and
    // the spoken transcript is written into the same conversation as the typed one.
    VOICE_TOKEN_URL: 'https://app.realtylt.com/api/chat/voice-token',
    VOICE_TURN_URL: 'https://app.realtylt.com/api/chat/voice-turn',
    // DARK LAUNCH (2026-08-27, the owner's call). This file is a static script, so a build-time
    // env never reaches it; the switch is this one word. 'dark' ships the whole voice feature
    // present but unoffered — the button stays hidden even on a browser that could run it —
    // while ?rltvoice=1 or a stored 'rlt-voice' still reveals it, which is how voice gets proven
    // on the real site before a visitor ever meets it. 'on' offers it to every capable browser.
    // It gates one boolean in voiceSupported() and nothing else, so the lit path and the dark
    // path are the same code.
    VOICE_LAUNCH: 'on',
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
    // THE THIRD THING THE PERSONA HAS TO SWAP. The greeting and the chips changed for /ai and
    // the INPUT did not, so the box under an AI-services conversation went on reading "Ask
    // about a listing, an area, anything..." That is the one line the visitor is looking at
    // while deciding what to type, which makes it the worst of the three to leave behind.
    PLACEHOLDER: 'Ask about a listing, an area, anything...',
    AI_PLACEHOLDER: 'Ask about a service, an automation, anything...',
    SESSION_KEY: 'realtylt_chat_session',
    HISTORY_KEY: 'realtylt_chat_history',
    HISTORY_LIMIT: 20,
    TYPING_DELAY: 300,
    REQUEST_TIMEOUT: 30000
  };

  // THE ENDPOINT URLS, AND ONLY THOSE, may be pointed somewhere else by a page that sets
  // window.RLT_CHAT_CONFIG before this script loads. That is how the CRM's harness drives this
  // exact file against a local server instead of a shipped copy that has drifted from it.
  // Production sets nothing and gets the constants above; nothing else is overridable, so a
  // stray global on a live page cannot rebrand or restyle the widget.
  //
  // THE VOICE URLS ARE ON THE SAME SHORT LIST AND NOTHING ELSE ABOUT VOICE IS. A page cannot
  // choose the model, the voice, the persona or the tool set: those live inside the token the
  // CRM mints and are not fields this file has.
  if (window.RLT_CHAT_CONFIG) {
    ['WEBHOOK_URL', 'SESSION_URL', 'POLL_URL', 'VOICE_TOKEN_URL', 'VOICE_TURN_URL'].forEach(function(key) {
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
        height: 660px;
        max-height: calc(100vh - 120px);
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
        flex-shrink: 0;
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
        /* min-height:0 lets the message list be the ONE region that gives and takes height: it grows
           to fill a taller panel and scrolls when full, while the chips, composer and voice strip
           below keep their own height instead of squeezing the conversation. */
        min-height: 0;
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
        flex-shrink: 0;
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
        flex-shrink: 0;
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
      /* THE MIC TOOK 50px OFF THE COMPOSER, and the placeholder is what paid.
         Measured against the unmodified file (08-compare-baseline.mjs): at 390 the input went
         314px -> 266px, and "Ask about a listing, an area, anything..." stopped fitting on one
         line — a rows="1" textarea then shows a clipped second line, which reads as a broken box.
         One line, ellipsised, is the honest way to show a label that does not fit. It also fixes
         the same clipping the panel already had at 320 BEFORE this change. Typing is untouched:
         this styles the placeholder, never the value. */
      .rlt-input::placeholder {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
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
      /* ── CLICK TO TALK ────────────────────────────────────────────────────────────────────
         The mic sits to the LEFT of the composer, opposite Send, so the row reads talk / type /
         send and neither button is the odd one out. Same 44px target as Send, same radius, and
         it borrows the panel's own blue rather than introducing a colour. */
      .rlt-mic {
        background: #fff;
        color: ${CONFIG.BRAND_COLOR};
        border: 1px solid #d1d5db;
        border-radius: 9999px;
        min-width: 44px;
        height: 44px;
        padding: 0 14px;
        gap: 7px;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
      }
      .rlt-mic[data-available="1"] { display: flex; }
      /* The word beside the glyph is what turns a symbol into an invitation to talk. It rides on
         desktop, where the composer has the room; the phone stylesheet drops it back to a circle. */
      .rlt-mic-text { font-size: 13px; font-weight: 600; line-height: 1; }
      .rlt-mic:hover { border-color: ${CONFIG.BRAND_COLOR}; background: #f4f8fd; }
      .rlt-mic:focus-visible { outline: 2px solid ${CONFIG.BRAND_COLOR_DARK}; outline-offset: 2px; }
      .rlt-mic:disabled { color: #9ca3af; border-color: #e5e7eb; cursor: not-allowed; background: #fff; }
      .rlt-mic svg { width: 18px; height: 18px; }
      /* Live: the button IS the stop control, so it has to stop looking like an invitation. */
      .rlt-mic.rlt-mic-live {
        background: ${CONFIG.BRAND_COLOR};
        border-color: ${CONFIG.BRAND_COLOR};
        color: #fff;
      }
      .rlt-mic.rlt-mic-live:hover { background: ${CONFIG.BRAND_COLOR_DARK}; }

      /* THE STATE STRIP. The owner asked to SEE the talking state, so this is a row and not a
         tooltip: a label that names what is happening plus three bars that move with the real
         microphone level, which is the part that reads as alive rather than as a spinner. */
      .rlt-voice {
        display: none;
        align-items: center;
        gap: 10px;
        padding: 8px 16px;
        border-top: 1px solid #e5e7eb;
        background: #f7f9fc;
        font-size: 12px;
        color: #374151;
        flex-shrink: 0;
      }
      .rlt-voice[data-on="1"] { display: flex; }
      .rlt-voice-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .rlt-voice-meter { display: flex; align-items: flex-end; gap: 3px; height: 16px; flex-shrink: 0; }
      .rlt-voice-meter i {
        display: block;
        width: 3px;
        height: 4px;
        border-radius: 9999px;
        background: ${CONFIG.BRAND_COLOR};
        transform-origin: bottom;
        transform: scaleY(1);
        transition: transform 0.08s linear;
      }
      .rlt-voice-end {
        background: none;
        border: none;
        color: ${CONFIG.BRAND_COLOR_DARK};
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 6px 8px;
        border-radius: 8px;
        min-height: 32px;
        flex-shrink: 0;
      }
      .rlt-voice-end:hover { background: rgba(21,87,176,0.08); }
      .rlt-voice-end:focus-visible { outline: 2px solid ${CONFIG.BRAND_COLOR_DARK}; outline-offset: 1px; }
      /* A bubble still being spoken. Quiet, so a finished line and a forming one are not the
         same weight, and the visitor can tell which words are settled. */
      .rlt-msg-live { opacity: 0.7; }
      .rlt-footer {
        text-align: center;
        font-size: 11px;
        color: #6b7280;
        padding: 6px 12px;
        background: #fff;
        flex-shrink: 0;
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
      /* THE METER IS THE ONLY THING HERE THAT MOVES, so it is the only thing to turn off. The
         label still names the state, so somebody who has asked for less motion loses the
         animation and none of the information. */
      @media (prefers-reduced-motion: reduce) {
        .rlt-voice-meter i { transition: none; transform: scaleY(1) !important; }
        .rlt-mic { transition: none; }
      }
      /* 390px and down: the composer is mic + input + send on one row, and the input is the
         thing that gives way. The state strip's label ellipsises rather than wrapping the row
         onto two lines under a keyboard that has already eaten half the screen. */
      @media (max-width: 480px) {
        .rlt-input-wrap { gap: 6px; }
        .rlt-input { min-width: 0; }
        /* The composer is tight on a phone, so the mic gives back the "Talk" word and returns to a
           44px circle. The glyph plus the state strip carry the meaning where the row cannot. */
        .rlt-mic { padding: 0; width: 44px; min-width: 44px; }
        .rlt-mic-text { display: none; }
        /* 40px, not 49. Measured at 390x844 with the keyboard up: every row above the composer is
           taken straight out of the conversation, and this one is a label. The End control keeps
           its own comfortable target by growing its hit area rather than the strip. */
        .rlt-voice { padding: 4px 12px; gap: 8px; }
        .rlt-voice-end { min-height: 30px; padding: 4px 8px; }
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
    <div class="rlt-voice" id="rlt-voice" role="status" aria-live="polite" data-testid="rlt-voice-strip">
      <span class="rlt-voice-meter" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="rlt-voice-label" id="rlt-voice-label"></span>
      <button class="rlt-voice-end" id="rlt-voice-end" type="button">Back to chat</button>
    </div>
    <div class="rlt-input-wrap">
      <button class="rlt-mic" id="rlt-mic" type="button" aria-label="Talk to the assistant" title="Talk to the assistant instead of typing">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
        </svg>
        <span class="rlt-mic-text" aria-hidden="true">Talk</span>
      </button>
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
  // The markup ships the real-estate placeholder, so this file still says something sensible if
  // the line below never runs. Set from currentPersona() rather than from the path, for the same
  // reason the greeting is: the persona sticks to the CONVERSATION, so somebody who started on
  // /ai and wandered onto the main site keeps the assistant, the chips and now the prompt they
  // started with.
  if (inputEl) inputEl.placeholder = currentPersona() === 'aipage' ? CONFIG.AI_PLACEHOLDER : CONFIG.PLACEHOLDER;
  const sendEl = panel.querySelector('#rlt-send');
  const closeEl = panel.querySelector('.rlt-close-btn');
  const resetEl = panel.querySelector('.rlt-reset-btn');
  const micEl = panel.querySelector('#rlt-mic');
  const micTextEl = panel.querySelector('.rlt-mic-text');
  const voiceStripEl = panel.querySelector('#rlt-voice');
  const voiceLabelEl = panel.querySelector('#rlt-voice-label');
  const voiceEndEl = panel.querySelector('#rlt-voice-end');
  const voiceBarsEl = voiceStripEl ? voiceStripEl.querySelectorAll('.rlt-voice-meter i') : [];

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
    // TYPING ENDS THE CALL, because two assistants answering the same person at once is worse
    // than either. A visitor who reaches for the keyboard mid-call has chosen the other channel —
    // usually to spell an address the microphone kept mishearing — so the call is hung up first
    // and the typed turn answers on its own. The spoken part of the conversation is already in
    // the thread by then; `endVoice` flushes on the way out.
    if (voice.state !== 'off') endVoice();
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
  // CLICK TO TALK - a Gemini Live session, in this panel, in this conversation
  // ============================================================
  //
  // THE SHAPE, AND WHY THE SOCKET IS IN THE BROWSER. The CRM runs on Vercel, where a function is
  // a request and a response; a live audio session is a socket held open for minutes. So the CRM
  // does not proxy the audio. It mints a CONSTRAINED ephemeral token — model, persona, tool list
  // and both transcriptions locked into the token itself — and this file opens the socket to
  // Google directly with it. Nothing on this page can widen that token: the setup message we send
  // below is IGNORED by the server, which is the whole point of the constraint (proven against the
  // live API in the CRM's scripts/voice-0827/02-lock-holds.mjs, where the same attack against an
  // UNCONSTRAINED token succeeded).
  //
  // WHAT STILL GOES THROUGH THE CRM. Every tool the model asks for, and the transcript. A voice
  // conversation captures a lead, texts listings and asks Levan to call through exactly the same
  // server-side tools a typed one does, and lands in the same chat_logs rows — so Take over, the
  // lead, and the transcript all show one conversation rather than a chat with a gap in it.
  //
  // THREE THINGS MAKE IT FEEL LIKE A PERSON. Gemini's own voice-activity detection decides when
  // the visitor has started and stopped (there is no push-to-talk here); the slow tools are
  // declared NON_BLOCKING server-side so the assistant keeps talking while a search runs instead
  // of going silent; and barge-in stops playback THE MOMENT THE MICROPHONE HEARS THE VISITOR
  // rather than waiting for the network to say so. That last one is local, and it is the
  // difference between interrupting a person and interrupting a recording.

  const VOICE_INPUT_RATE = 16000;
  const VOICE_OUTPUT_RATE = 24000;
  // ~43ms of audio per frame at 48kHz. Small enough that barge-in is imperceptible, large enough
  // that the socket is not doing a send per animation frame.
  const VOICE_FRAME = 2048;
  /*
   * BARGE-IN IS MEASURED AGAINST THE ROOM, NOT AGAINST A CONSTANT.
   *
   * The first version compared the microphone's RMS to a fixed 0.045 and the browser drive caught
   * it being a coin flip: one run cut the assistant off, the next ran 55 seconds and 622 audio
   * chunks and never fired once. A fixed number cannot be right, because what reaches here depends
   * on the microphone, the room and the browser's own automatic gain — the same person speaking at
   * the same volume lands anywhere across an order of magnitude.
   *
   * So the widget learns the floor while nobody is talking and treats a MULTIPLE of it as speech.
   * The absolute minimum stops a silent studio microphone from turning its own noise into a
   * barge-in; the multiple is what makes a quiet laptop mic work at all.
   *
   * Echo cancellation is requested on the stream, so the assistant's own voice coming back through
   * the speakers is not what lifts this.
   */
  // RETUNED 2026-08-28 after a live call: someone talking NEARBY the visitor read as the visitor
  // barging in, and the assistant cut itself off mid-reply. The multiple asks for a clearly
  // direct voice; four frames (~170ms at 48kHz) ask for a sustained one, so a burst of background
  // chatter no longer empties the playback queue. A visitor genuinely interrupting speaks AT the
  // microphone and clears both within a couple of syllables.
  const VOICE_BARGE_MULTIPLE = 4.0;
  const VOICE_BARGE_FLOOR = 0.012;
  const VOICE_BARGE_FRAMES = 4;
  // How quickly the learned floor follows the room. Slow on the way up so one cough does not
  // raise the bar; quick on the way down so a room that goes quiet is heard again.
  const VOICE_FLOOR_RISE = 0.02;
  const VOICE_FLOOR_FALL = 0.2;
  // THE RECONNECT BUDGET (2026-08-28, the "line dropped a few times on its own" fix). A dropped
  // socket now reconnects and CONTINUES — see startVoice — but only this many times per call,
  // and only when the dying connection had lived long enough to count as established. A socket
  // that dies younger than VOICE_STABLE_MS is a connection-level refusal (bad handle, model
  // config, network), and retrying those in a loop is how a widget melts a rate limit.
  const VOICE_MAX_RECONNECTS = 4;
  const VOICE_STABLE_MS = 8000;

  const voice = {
    available: false,
    state: 'off',
    ws: null,
    ctx: null,
    stream: null,
    processor: null,
    source: null,
    playHead: 0,
    playing: [],
    loudFrames: 0,
    /** The room's own level, learned from quiet frames. Seeded high enough that the first frames
     *  of a call cannot barge on nothing while it is still settling. */
    noiseFloor: 0.01,
    heard: '',
    said: '',
    liveUser: null,
    liveBot: null,
    receipts: [],
    expiryTimer: null,
    stopping: false,
    lastError: null,
    /*
     * THE CALL'S MEMORY ACROSS SOCKETS (2026-08-28). Google sends resumption handles while a
     * Live session runs; carrying the latest one back to the CRM on the next mint makes the new
     * socket CONTINUE that session — same conversation, nothing re-asked — instead of starting a
     * stranger. Kept across endVoice on purpose, so tapping the mic again after a drop or the
     * 15-minute cap picks the same conversation back up; cleared only by Reset, because a fresh
     * conversation must not inherit a dead call's context.
     */
    resumeHandle: null,
    // Per-call reconnect budget and the in-flight latch that stops two reconnects racing.
    reconnects: 0,
    reconnecting: false,
    // The audio contract from the current token, read by the mic pump on every frame.
    mimeType: null,
    /*
     * THE CONVERSATION THIS CALL BELONGS TO, captured when it starts.
     *
     * NOT re-resolved per request, and that is a correctness fix rather than a saving. `endVoice`
     * flushes the last spoken turn and does not await it — it cannot, it is called from a click
     * handler — and Reset calls `endVoice()` and then immediately drops the session. An
     * `ensureSession()` inside that in-flight flush would therefore run AFTER the session was
     * dropped, MINT A NEW ONE, and write the tail of the old conversation into a brand new one.
     *
     * The token is captured with it and staleness is not a problem: a session token is an HMAC
     * with a 30-day life and nothing revokes it, so the one this call started with still verifies
     * even if a typed turn refreshed it in the meantime.
     */
    sessionId: null,
    sessionToken: null,
    persona: null,
    // Counters, for a harness and for diagnosing a call that went quiet. A voice bug is invisible
    // from the outside — "nothing happened" looks identical whether the microphone never opened,
    // the audio never left, or the model chose not to answer — so the widget keeps the three
    // numbers that tell those apart. They are counts, never content.
    stats: {
      framesSent: 0,
      bytesSent: 0,
      messagesIn: 0,
      audioChunks: 0,
      // How many times LOCAL barge-in cut the assistant off, and how many times the server told
      // us afterwards that it had noticed. The gap between the two is the feature.
      barges: 0,
      serverInterrupts: 0,
      // Completed spoken exchanges written into the thread.
      turns: 0,
      // Sockets that dropped and were picked back up without ending the call.
      reconnects: 0,
      // The two numbers that make a barge-in that did not happen diagnosable instead of a mystery.
      peakRms: 0,
      floor: 0,
      closeCode: null,
      closeReason: ''
    }
  };

  // The dark-launch gate (CONFIG.VOICE_LAUNCH). While the flag reads 'dark' the only visitors
  // invited are the ones who asked: ?rltvoice=1 on the URL, or 'rlt-voice' set to '1' in this
  // browser's storage. Storage is read inside its own try because a browser with cookies
  // blocked throws on the getter itself, and a thrown error there must read as "not invited"
  // rather than take the panel down with it. Flip the constant to 'on' and this returns true
  // for everybody, which is the whole difference between dark and lit.
  function voiceInvited() {
    if (CONFIG.VOICE_LAUNCH !== 'dark') return true;
    try {
      if (/[?&]rltvoice=1(?:&|$)/.test(location.search || '')) return true;
    } catch (e) { /* exotic environment: fall through to the stored opt-in */ }
    try {
      return localStorage.getItem('rlt-voice') === '1';
    } catch (e) { return false; }
  }

  // Voice needs a socket, a microphone and Web Audio. A browser missing any of the three simply
  // never sees the button — an offer with nothing behind it is worse than no offer.
  function voiceSupported() {
    try {
      return Boolean(
        voiceInvited() &&
        window.WebSocket &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia &&
        (window.AudioContext || window.webkitAudioContext)
      );
    } catch (e) { return false; }
  }

  // Hudson is the voice assistant, and naming him is the whole point of the strip: a visitor should
  // never wonder whether a person or a machine is on the line, or who. Listening and speaking carry
  // his name because those are the states a live call sits in.
  const VOICE_LABELS = {
    connecting: 'Connecting to Hudson…',
    listening: 'Talking with Hudson · listening',
    speaking: 'Talking with Hudson · speaking',
    working: 'Hudson is working on that…',
    ending: 'Ending…'
  };

  function setVoiceState(state, note) {
    voice.state = state;
    const on = state !== 'off';
    if (voiceStripEl) voiceStripEl.setAttribute('data-on', on ? '1' : '0');
    if (voiceStripEl) voiceStripEl.setAttribute('data-state', state);
    if (voiceLabelEl) voiceLabelEl.textContent = note || VOICE_LABELS[state] || '';
    if (micEl) {
      micEl.classList.toggle('rlt-mic-live', on);
      micEl.setAttribute('aria-label', on ? 'Stop talking' : 'Talk to the assistant');
      micEl.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    // The word on the button follows the state: an invitation when idle, a plain "Live" once the
    // call is up, so the filled mic is not the only thing saying the microphone is open.
    if (micTextEl) micTextEl.textContent = on ? 'Live' : 'Talk';
    if (!on) setVoiceLevel(0);
  }

  // Three bars that follow the real microphone level. Cheap, and it is what makes the strip read
  // as a live microphone rather than as a spinner with a label.
  function setVoiceLevel(rms) {
    if (!voiceBarsEl || !voiceBarsEl.length) return;
    const base = Math.min(1, rms * 12);
    for (let i = 0; i < voiceBarsEl.length; i += 1) {
      const scale = 1 + base * (i === 1 ? 3.2 : 2.1) * (0.7 + Math.random() * 0.3);
      voiceBarsEl[i].style.transform = 'scaleY(' + scale.toFixed(2) + ')';
    }
  }

  // A bubble that is still being spoken. Created on the first word and finalised at the end of the
  // turn, so the visitor watches the sentence arrive instead of waiting for it.
  function liveBubble(which, text) {
    const key = which === 'user' ? 'liveUser' : 'liveBot';
    if (!text) return;
    if (!voice[key]) {
      const el = document.createElement('div');
      el.className = 'rlt-msg ' + (which === 'user' ? 'rlt-msg-user' : 'rlt-msg-bot') + ' rlt-msg-live';
      el.setAttribute('data-testid', 'rlt-voice-live-' + which);
      msgsEl.appendChild(el);
      voice[key] = el;
    }
    voice[key].textContent = text;
    scrollToBottom();
  }

  function clearLiveBubbles() {
    ['liveUser', 'liveBot'].forEach(function(key) {
      if (voice[key]) { voice[key].remove(); voice[key] = null; }
    });
  }

  // ---- audio out ------------------------------------------------------------------------------
  // The model sends 24kHz PCM16. Web Audio resamples an AudioBuffer declared at 24000 to whatever
  // the output device runs at, so one context serves both directions.
  function playChunk(base64) {
    if (!voice.ctx || voice.stopping) return;
    let bytes;
    try {
      const bin = atob(base64);
      bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    } catch (e) { return; }
    const pcm = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    if (!pcm.length) return;
    const buffer = voice.ctx.createBuffer(1, pcm.length, VOICE_OUTPUT_RATE);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i += 1) channel[i] = pcm[i] / 32768;
    const src = voice.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(voice.ctx.destination);
    // A small floor keeps the first chunk from being scheduled in the past on a slow first frame.
    voice.playHead = Math.max(voice.playHead, voice.ctx.currentTime + 0.06);
    src.start(voice.playHead);
    voice.playHead += buffer.duration;
    voice.playing.push(src);
    src.onended = function() {
      const at = voice.playing.indexOf(src);
      if (at >= 0) voice.playing.splice(at, 1);
      if (!voice.playing.length && voice.state === 'speaking') setVoiceState('listening');
    };
    if (voice.state !== 'speaking') setVoiceState('speaking');
  }

  // BARGE-IN, THE LOCAL HALF. The server also sends `interrupted`, and it arrives a beat later —
  // by which time the visitor has already talked over half a sentence they can still hear. This is
  // the half that makes it feel like interrupting a person.
  function stopPlayback() {
    voice.playing.forEach(function(src) { try { src.stop(); } catch (e) { /* already ended */ } });
    voice.playing = [];
    voice.playHead = 0;
  }

  // ---- the transcript -------------------------------------------------------------------------
  // One spoken exchange, into the same conversation the typed messages live in. Posted to the CRM
  // so it lands in chat_logs, and rendered here so the visitor keeps a written record of a spoken
  // conversation — which is what makes scrolling back after a call worth anything.
  async function flushSpokenTurn() {
    const heard = voice.heard.trim();
    const said = voice.said.trim();
    voice.heard = '';
    voice.said = '';
    clearLiveBubbles();
    if (!heard && !said) return;
    if (heard) { addMessage('user', heard); recordTurn('user', heard); }
    if (said) { addMessage('bot', said); recordTurn('bot', said); }
    voice.stats.turns += 1;
    try {
      const data = await voicePost({ spoken: { visitor: heard, assistant: said } });
      // The CRM answers with whether a human has the conversation, the same way the typed path
      // learns it, so a takeover that lands mid-call still says so in the panel.
      if (data && typeof data.paused === 'boolean') notePausedState(data.paused);
    } catch (e) { /* a lost transcript must never end the call */ }
  }

  // The one door back to the CRM. Carries the ownership token and the receipts the CRM signed for
  // every tool it has run this session — that is how a stateless route knows what really happened
  // without taking this browser's word for it.
  async function voicePost(body) {
    // The session this CALL belongs to, never whatever the widget's session is by the time the
    // request goes out. See the note on `voice.sessionId`.
    if (!voice.sessionId) throw new Error('voice: no session');
    const headers = { 'Content-Type': 'application/json' };
    if (voice.sessionToken) headers['x-rlt-chat-token'] = voice.sessionToken;
    const resp = await fetch(CONFIG.VOICE_TURN_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(Object.assign({
        sessionId: voice.sessionId,
        receipts: voice.receipts.slice(-20),
        userMeta: { page: location.pathname, context: voice.persona || detectPersona() }
      }, body))
    });
    if (!resp.ok) throw new Error('voice-turn ' + resp.status);
    const data = await resp.json();
    if (data && Array.isArray(data.receipts) && data.receipts.length) {
      voice.receipts = voice.receipts.concat(data.receipts).slice(-20);
    }
    return data;
  }

  // ---- tools ----------------------------------------------------------------------------------
  // The model asks; the CRM acts. Nothing is executed here, and nothing here can add a tool: the
  // declarations live in the token. A relay that fails still gets an answer back to the model,
  // because a socket waiting on a response that never comes is a conversation that has died.
  async function relayToolCalls(calls) {
    setVoiceState('working');
    let responses;
    try {
      const data = await voicePost({
        calls: calls.map(function(c) { return { id: c.id || '', name: c.name, args: c.args || {} }; }),
        // What the visitor has said so far THIS turn. The search tool falls back to the visitor's
        // own words when the model omits sale-or-rent, and a tool call arrives before the
        // transcript does — without this the spoken path quietly loses a backstop the typed path
        // has. It is context for a tool, never a recorded message.
        heard: voice.heard.slice(-2000)
      });
      responses = (data && data.responses) || [];
    } catch (e) {
      responses = calls.map(function(c) {
        return {
          id: c.id || '',
          name: c.name,
          response: {
            status: 'error',
            succeeded: false,
            message: 'That did not go through.',
            say_instead: 'Tell them plainly it did not work and offer to put them in touch with Levan.'
          }
        };
      });
    }
    voiceSend({ toolResponse: { functionResponses: responses } });
    if (voice.state === 'working') setVoiceState(voice.playing.length ? 'speaking' : 'listening');
  }

  function voiceSend(obj) {
    if (voice.ws && voice.ws.readyState === 1) {
      try { voice.ws.send(JSON.stringify(obj)); } catch (e) { /* socket closed under us */ }
    }
  }

  // ---- minting and reconnecting ---------------------------------------------------------------
  // THE MEMORY FIX (2026-08-28). The launch-day bug: every socket drop used to end the call, and
  // a re-tap minted a model with no idea what was said — it re-asked the owner his number ten
  // times in one conversation. Two mechanisms close it, both running through mintVoiceSession:
  //
  //   the HANDLE — Google sends sessionResumptionUpdate tickets while a session runs; handing
  //     the latest back to the CRM makes the next socket CONTINUE that session, memory and all.
  //     It rides in this request because the constrained socket ignores the browser's own setup
  //     message: the CRM bakes it into the setup the token itself carries.
  //   the SEED — when there is no handle worth presenting (first call, expired, refused), the
  //     CRM returns the recent conversation — typed turns included — and setupComplete below
  //     hands it to the fresh session as clientContent before the visitor speaks.

  async function mintVoiceSession() {
    try {
      return await mintVoiceOnce();
    } catch (err) {
      if (!voice.resumeHandle) throw err;
      // A stale handle can be refused at MINT time, not only at connect. The handle is
      // disposable; the call is not: drop it and mint clean, once.
      voice.resumeHandle = null;
      return mintVoiceOnce();
    }
  }

  async function mintVoiceOnce() {
    if (!voice.sessionId) throw new Error('voice: no session');
    const headers = { 'Content-Type': 'application/json' };
    if (voice.sessionToken) headers['x-rlt-chat-token'] = voice.sessionToken;
    const viaHandle = Boolean(voice.resumeHandle);
    const body = {
      sessionId: voice.sessionId,
      userMeta: { page: location.pathname, context: voice.persona || detectPersona() }
    };
    if (viaHandle) body.resumeHandle = voice.resumeHandle;
    const resp = await fetch(CONFIG.VOICE_TOKEN_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error('voice-token ' + resp.status);
    const token = await resp.json();
    if (!token || !token.token || !token.wsUrl) throw new Error('voice-token empty');
    // Whether THIS token was minted around a resumption handle decides two things downstream:
    // whether the fresh session needs the seed, and who gets blamed if the socket dies young.
    token.viaHandle = viaHandle;
    voice.mimeType = token.inputMimeType || ('audio/pcm;rate=' + VOICE_INPUT_RATE);
    return token;
  }

  // A drop is no longer a hang-up. Mint a fresh token and open a new socket over the SAME
  // microphone and audio graph: the visitor hears a beat of quiet, not "the line dropped", and
  // the model remembers the conversation either way — the handle resumes the session itself, and
  // a fresh session gets the CRM's transcript. Budgeted, because a socket that cannot stay up is
  // not a socket worth dialing forever.
  async function reconnectVoice() {
    if (voice.stopping || voice.state === 'off' || voice.reconnecting) return;
    if (voice.reconnects >= VOICE_MAX_RECONNECTS) {
      endVoice('The line dropped. Tap the microphone to pick it back up.');
      return;
    }
    voice.reconnecting = true;
    voice.reconnects += 1;
    voice.stats.reconnects += 1;
    if (voice.expiryTimer) { clearTimeout(voice.expiryTimer); voice.expiryTimer = null; }
    const old = voice.ws;
    voice.ws = null;
    if (old) { old.onclose = null; try { old.close(); } catch (e) { /* already closing */ } }
    stopPlayback();
    setVoiceState('connecting', 'Reconnecting…');
    // Whatever was heard or said before the drop is part of the conversation — and AWAITED here,
    // unlike the hang-up path, so a fresh session's seed can include the turn that just died.
    try { await flushSpokenTurn(); } catch (e) { /* a lost transcript must not block the retry */ }
    let token;
    try {
      token = await mintVoiceSession();
    } catch (err) {
      voice.reconnecting = false;
      endVoice('The line dropped. Tap the microphone to pick it back up.');
      return;
    }
    if (voice.stopping || voice.state === 'off') { voice.reconnecting = false; return; }
    openVoiceSocket(token);
    voice.reconnecting = false;
  }

  // One socket for one minted token: handlers, the seed, and the token's own clock. Split out of
  // startVoice so a reconnect reuses the microphone pipeline — onaudioprocess reads voice.ws on
  // every frame, so the new socket picks the mic up the moment it is assigned.
  function openVoiceSocket(token) {
    const ws = new WebSocket(token.wsUrl + '?access_token=' + encodeURIComponent(token.token));
    const openedAt = Date.now();
    voice.ws = ws;

    ws.onopen = function() {
      // The protocol requires a setup message. Ours is IGNORED: the token carries the real one,
      // and that is exactly the property that makes handing this token to a browser safe. It is
      // sent minimal on purpose, so nobody reading this file later mistakes it for configuration.
      voiceSend({ setup: {} });
      setVoiceState('listening');
    };

    ws.onmessage = async function(ev) {
      let raw;
      try {
        raw = typeof ev.data === 'string' ? ev.data : await ev.data.text();
      } catch (e) { return; }
      let msg;
      try { msg = JSON.parse(raw); } catch (e) { return; }
      voice.stats.messagesIn += 1;

      if (msg.setupComplete) {
        // A session no handle could resume starts blank; hand it the conversation so far before
        // the visitor speaks. turnComplete false: this is context, not a prompt to answer.
        if (!token.viaHandle && Array.isArray(token.history) && token.history.length) {
          voiceSend({
            clientContent: {
              turns: token.history.map(function(t) {
                return { role: t.role === 'model' ? 'model' : 'user', parts: [{ text: String(t.text || '') }] };
              }),
              turnComplete: false
            }
          });
        }
        setVoiceState('listening');
        return;
      }

      // Google's "come back as this session" ticket, refreshed while the call runs. The latest
      // one is what a reconnect — or the visitor's next tap on the mic — hands back to the CRM.
      if (msg.sessionResumptionUpdate) {
        const u = msg.sessionResumptionUpdate;
        if (u.resumable && u.newHandle) voice.resumeHandle = u.newHandle;
        return;
      }

      if (msg.toolCall && msg.toolCall.functionCalls && msg.toolCall.functionCalls.length) {
        relayToolCalls(msg.toolCall.functionCalls);
        return;
      }
      // The server's polite goodbye, sent before it closes a long connection. Reconnecting NOW —
      // with the handle it has been feeding us — is the difference between a seamless continue
      // and the visitor hearing the line die.
      if (msg.goAway) { reconnectVoice(); return; }

      const sc = msg.serverContent;
      if (!sc) return;
      if (sc.interrupted) { voice.stats.serverInterrupts += 1; stopPlayback(); setVoiceState('listening'); }
      if (sc.inputTranscription && sc.inputTranscription.text) {
        voice.heard += sc.inputTranscription.text;
        liveBubble('user', voice.heard.trim());
      }
      if (sc.outputTranscription && sc.outputTranscription.text) {
        voice.said += sc.outputTranscription.text;
        liveBubble('bot', voice.said.trim());
      }
      const parts = (sc.modelTurn && sc.modelTurn.parts) || [];
      for (let i = 0; i < parts.length; i += 1) {
        if (parts[i].inlineData && parts[i].inlineData.data) {
          voice.stats.audioChunks += 1;
          playChunk(parts[i].inlineData.data);
        }
      }
      if (sc.turnComplete) flushSpokenTurn();
    };

    ws.onerror = function() { voice.lastError = 'socket'; };
    ws.onclose = function(ev) {
      // An older socket closing late must never touch the call that replaced it.
      if (voice.ws !== ws) return;
      voice.stats.closeCode = ev && ev.code;
      voice.stats.closeReason = String((ev && ev.reason) || '').slice(0, 200);
      if (voice.state === 'off' || voice.stopping) return;
      if (Date.now() - openedAt < VOICE_STABLE_MS) {
        // The connection never established. If it carried a resumption handle, the handle is the
        // prime suspect — expired, or naming a session Google no longer holds — so drop it and
        // let the reconnect start clean, seeded from the CRM transcript instead. A CLEAN start
        // dying this young is a refusal (the 1007/1011 class), and retrying refusals is a loop.
        if (token.viaHandle) {
          voice.resumeHandle = null;
          reconnectVoice();
        } else {
          endVoice('The line dropped. Tap the microphone to pick it back up.');
        }
        return;
      }
      reconnectVoice();
    };

    // The token's own clock, honoured here so a session ends with a sentence rather than with a
    // socket closing under the visitor mid-word. The resumption handle survives endVoice, so the
    // next tap picks this same conversation back up.
    if (voice.expiryTimer) clearTimeout(voice.expiryTimer);
    const remaining = (token.expiresAt || 0) - Date.now();
    if (remaining > 0) {
      voice.expiryTimer = setTimeout(function() {
        endVoice("That's as long as one call runs. Tap the microphone to carry on.");
      }, remaining);
    }
  }

  // ---- the session ----------------------------------------------------------------------------
  async function startVoice() {
    if (voice.state !== 'off') return;
    voice.stopping = false;
    voice.lastError = null;
    // A fresh call gets a fresh reconnect budget. The resumption handle is deliberately NOT
    // reset here: if the last call dropped or hit the 15-minute cap, this tap continues it.
    voice.reconnects = 0;
    voice.reconnecting = false;
    // The browser's permission bubble is about to appear over the getUserMedia call below. Naming it
    // first turns an abrupt system prompt into an expected step, so the visitor knows to say yes.
    setVoiceState('connecting', 'Allow microphone access when your browser asks');

    // THE MICROPHONE FIRST, and deliberately before the token. Asking the CRM to mint a
    // fifteen-minute Gemini session and only then discovering the visitor has the mic blocked
    // spends money on a conversation that cannot happen.
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          // Without this the model hears itself through the speakers and interrupts its own
          // sentence. It is also what lets the barge-in threshold below be a fixed number.
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
    } catch (err) {
      setVoiceState('off');
      voice.lastError = (err && err.name) || 'mic';
      // Three different noes, and the visitor can act on two of them. A blocked mic gets the exact
      // way back in: the lock icon in the address bar is where Chrome hides the permission it just
      // denied, and typing keeps working meanwhile so the conversation is not lost either way.
      addSystemLine(
        err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')
          ? 'I could not get to your microphone. To talk, allow it from the lock icon in your address bar, then tap Talk again. Or keep typing and I will answer right here.'
          : err && err.name === 'NotFoundError'
            ? 'I could not find a microphone on this device. Keep typing and I will answer here.'
            : 'The microphone did not start. Keep typing and I will answer here.'
      );
      return;
    }
    // Permission is granted and the bubble is gone; replace the "allow the mic" cue with the real
    // connecting state so the strip does not keep asking for something the visitor already gave.
    setVoiceState('connecting');

    let token;
    try {
      const sess = await ensureSession();
      // Captured here and used for the whole call, transcript flush included.
      voice.sessionId = sess.id;
      voice.sessionToken = sess.token || null;
      voice.persona = sess.persona || detectPersona();
      token = await mintVoiceSession();
    } catch (err) {
      stream.getTracks().forEach(function(t) { t.stop(); });
      voice.sessionId = null;
      voice.sessionToken = null;
      setVoiceState('off');
      voice.lastError = 'token';
      addSystemLine('Talking is not available right now. Keep typing and I will answer here.');
      return;
    }

    voice.stream = stream;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    voice.ctx = new Ctx();
    // Safari starts a context suspended until a gesture; the mic click IS the gesture.
    if (voice.ctx.state === 'suspended') { try { await voice.ctx.resume(); } catch (e) { /* best effort */ } }

    /*
     * ScriptProcessorNode, DELIBERATELY, and not AudioWorklet.
     *
     * A worklet needs `audioWorklet.addModule(url)`, and in a single-file widget dropped onto a
     * third-party page that url has to be a blob:. Whether a blob: script loads is decided by the
     * HOST PAGE's Content-Security-Policy, which this file does not control and cannot detect
     * before failing. ScriptProcessorNode is deprecated and needs no url, no worker and no policy
     * cooperation, and at 2048 frames it costs a few hundred microseconds of main thread every
     * 43ms. A deprecated API that runs everywhere beats a modern one that silently does not.
     */
    voice.source = voice.ctx.createMediaStreamSource(stream);
    voice.processor = voice.ctx.createScriptProcessor(VOICE_FRAME, 1, 1);
    const ratio = voice.ctx.sampleRate / VOICE_INPUT_RATE;
    voice.processor.onaudioprocess = function(ev) {
      if (!voice.ws || voice.ws.readyState !== 1 || voice.stopping) return;
      const input = ev.inputBuffer.getChannelData(0);

      let sum = 0;
      for (let i = 0; i < input.length; i += 1) sum += input[i] * input[i];
      const rms = Math.sqrt(sum / input.length);
      setVoiceLevel(rms);

      // BARGE-IN, LOCAL. Two frames above the room's own floor while the assistant is talking, and
      // the playback queue is emptied at once. The server's own `interrupted` arrives later and
      // does the same thing again, harmlessly.
      const threshold = Math.max(VOICE_BARGE_FLOOR, voice.noiseFloor * VOICE_BARGE_MULTIPLE);
      if (rms > threshold) {
        voice.loudFrames += 1;
        if (voice.loudFrames >= VOICE_BARGE_FRAMES && voice.playing.length) {
          voice.stats.barges += 1;
          stopPlayback();
          setVoiceState('listening');
        }
      } else {
        voice.loudFrames = 0;
        // The floor is learned from QUIET frames only. Learning it from speech would teach the
        // widget that the visitor's voice is the background, which is the failure mode this whole
        // adaptive scheme exists to avoid.
        const rate = rms > voice.noiseFloor ? VOICE_FLOOR_RISE : VOICE_FLOOR_FALL;
        voice.noiseFloor = voice.noiseFloor + (rms - voice.noiseFloor) * rate;
      }
      if (rms > voice.stats.peakRms) voice.stats.peakRms = Math.round(rms * 1000) / 1000;
      voice.stats.floor = Math.round(threshold * 1000) / 1000;

      // Downsample to 16kHz by averaging each source window rather than picking one sample from
      // it: a bare nearest-neighbour decimation aliases speech badly and the transcription is what
      // pays for it.
      const outLength = Math.floor(input.length / ratio);
      const pcm = new Int16Array(outLength);
      for (let i = 0; i < outLength; i += 1) {
        const start = Math.floor(i * ratio);
        const end = Math.min(input.length, Math.floor((i + 1) * ratio));
        let acc = 0;
        let n = 0;
        for (let j = start; j < end; j += 1) { acc += input[j]; n += 1; }
        const v = n ? acc / n : 0;
        pcm[i] = Math.max(-1, Math.min(1, v)) * 32767;
      }
      let bin = '';
      const bytes = new Uint8Array(pcm.buffer);
      for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
      voice.stats.framesSent += 1;
      voice.stats.bytesSent += bytes.length;
      voiceSend({
        realtimeInput: {
          // voice.mimeType, not a closure over one token: the socket under this microphone can
          // be the second or third of the call by now, and each mint refreshes the contract.
          audio: { data: btoa(bin), mimeType: voice.mimeType || ('audio/pcm;rate=' + VOICE_INPUT_RATE) }
        }
      });
    };
    voice.source.connect(voice.processor);
    // A ScriptProcessorNode only fires while it is connected to the destination. The gain is zero
    // so the visitor never hears their own microphone played back at them.
    const mute = voice.ctx.createGain();
    mute.gain.value = 0;
    voice.processor.connect(mute);
    mute.connect(voice.ctx.destination);

    openVoiceSocket(token);
    clearChips();
  }

  function endVoice(note) {
    if (voice.state === 'off') return;
    voice.stopping = true;
    if (voice.expiryTimer) { clearTimeout(voice.expiryTimer); voice.expiryTimer = null; }
    stopPlayback();
    // Whatever was said before the hang-up is still part of the conversation.
    flushSpokenTurn();
    if (voice.processor) { try { voice.processor.disconnect(); } catch (e) {} voice.processor.onaudioprocess = null; }
    if (voice.source) { try { voice.source.disconnect(); } catch (e) {} }
    if (voice.stream) voice.stream.getTracks().forEach(function(t) { try { t.stop(); } catch (e) {} });
    if (voice.ws) { try { voice.ws.close(); } catch (e) {} }
    if (voice.ctx) { try { voice.ctx.close(); } catch (e) {} }
    voice.ws = null; voice.ctx = null; voice.stream = null; voice.processor = null; voice.source = null;
    voice.loudFrames = 0;
    voice.noiseFloor = 0.01;
    voice.reconnecting = false;
    // voice.resumeHandle deliberately SURVIVES the hang-up: the next tap on the mic continues
    // this conversation. Only Reset clears it, because only Reset means "start me over".
    // AFTER the flush, never before. `flushSpokenTurn` runs synchronously as far as its first
    // await, and `voicePost` reads this on its own first line, so the id is already captured by
    // the time we get here — and clearing it now stops any later stray call posting into a
    // conversation that has ended.
    voice.sessionId = null;
    voice.sessionToken = null;
    setVoiceState('off');
    if (note) addSystemLine(note);
  }

  function toggleVoice() {
    if (voice.state === 'off') startVoice();
    else endVoice();
  }

  // The button only appears where it can actually work. Everywhere else the panel is exactly the
  // panel it was, which is the right way for a capability nobody was promised to be absent.
  voice.available = voiceSupported();
  if (micEl) micEl.setAttribute('data-available', voice.available ? '1' : '0');

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
    // A live microphone behind a closed panel is the worst thing this widget could leave running.
    endVoice();
  });

  // ONE CLICK, ONE TOGGLE — and the guard is not decoration. `startVoice` awaits a permission
  // prompt and then a mint, which is long enough for an impatient visitor to click three more
  // times; without this each click would start its own microphone and its own socket.
  let micBusy = false;
  if (micEl) {
    micEl.addEventListener('click', async function() {
      if (micBusy) return;
      micBusy = true;
      micEl.disabled = true;
      try { await toggleVoice(); } finally { micBusy = false; micEl.disabled = false; }
    });
  }
  if (voiceEndEl) voiceEndEl.addEventListener('click', function() { endVoice(); });

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
      // Reset drops the session, and a live socket is bound to the OLD one. Hanging up first is
      // what stops a spoken turn being written into a conversation that no longer exists.
      endVoice();
      voice.receipts = [];
      // A fresh conversation must not inherit a dead call's context: the resumption handle would
      // carry the OLD conversation's memory into the one the visitor just asked to start over.
      voice.resumeHandle = null;
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
    getCursor: function() { return _session ? (_session.cursor || 0) : 0; },
    // The voice half, for the same reason: a harness has to be able to start a call, read the
    // state the visitor is looking at, and hang up. Read-only apart from the two verbs — nothing
    // here can choose a model, a persona or a tool.
    voice: {
      start: function() { return startVoice(); },
      stop: function(note) { return endVoice(note); },
      available: function() { return voice.available; },
      state: function() { return voice.state; },
      label: function() { return voiceLabelEl ? voiceLabelEl.textContent : ''; },
      lastError: function() { return voice.lastError; },
      playing: function() { return voice.playing.length; },
      receipts: function() { return voice.receipts.length; },
      stats: function() { return Object.assign({}, voice.stats); }
    }
  };
})();
