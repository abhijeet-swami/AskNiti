const API_BASE = import.meta.env.VITE_API_URL;

const getSessionId = () => localStorage.getItem("x-session-id");
const setSessionId = (id) => {
  if (id) localStorage.setItem("x-session-id", id);
};

let sessionId = getSessionId();
let serverAwake = false;

export const api = {
  async wakeUp() {
    if (serverAwake) return true;

    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      try {
        const res = await fetch(`${API_BASE}/health`, { method: "GET" });
        if (res.ok) {
          serverAwake = true;
          return true;
        }
      } catch (e) {
        console.log(e.message);
      }
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
    }
    return false;
  },

  async sendMessage(message, conversationHistory = null, extras = null) {
    const headers = { "Content-Type": "application/json" };
    if (sessionId) headers["x-session-id"] = sessionId;

    const body = { message };
    if (conversationHistory) body.conversationHistory = conversationHistory;
    if (extras) {
      if (extras.metadata) body.metadata = extras.metadata;
      if (extras.profileAnswers) body.profileAnswers = extras.profileAnswers;
    }

    const res = await fetch(`${API_BASE}/chat/message`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
    });

    const newSessionId = res.headers.get("x-session-id");
    if (newSessionId) {
      sessionId = newSessionId;
      setSessionId(sessionId);
    }

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
  },

  async schemeChat(scheme, message, history, clearHistory = false) {
    const headers = { "Content-Type": "application/json" };
    if (sessionId) headers["x-session-id"] = sessionId;

    const res = await fetch(`${API_BASE}/scheme/chat`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ scheme, message, history, clearHistory }),
    });

    const newSessionId = res.headers.get("x-session-id");
    if (newSessionId) {
      sessionId = newSessionId;
      setSessionId(sessionId);
    }

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
  },

  async eligibilityCheck(schemeSlug, answers) {
    const headers = { "Content-Type": "application/json" };
    if (sessionId) headers["x-session-id"] = sessionId;

    const res = await fetch(`${API_BASE}/eligibility-check`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ schemeSlug, answers }),
    });

    const newSessionId = res.headers.get("x-session-id");
    if (newSessionId) {
      sessionId = newSessionId;
      setSessionId(sessionId);
    }

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
  },

  async textToSpeech(text) {
    const headers = { "Content-Type": "application/json" };
    if (sessionId) headers["x-session-id"] = sessionId;

    const res = await fetch(`${API_BASE}/tts`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ text }),
    });

    const newSessionId = res.headers.get("x-session-id");
    if (newSessionId) {
      sessionId = newSessionId;
      setSessionId(sessionId);
    }

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.blob();
  },
};
