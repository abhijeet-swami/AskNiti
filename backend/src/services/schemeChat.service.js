import Session from "../models/session.model.js";
import buildSchemeChatPrompt from "../utils/prompts/schemeChat.prompt.js";
import callAi from "../services/ai.service.js";

const handleSchemeChat = async (sessionId, scheme, userMessage) => {
  const session = await Session.findById(sessionId);
  
  if (!session) {
    throw new Error("Session not found");
  }

  let history = session.schemeChatHistory || [];
  
  history.push({ role: "user", content: userMessage });
  
  const systemPrompt = buildSchemeChatPrompt(
    scheme,
    session.userProfile,
    history
  );
  
  const messages = history.map((m) => ({
    role: m.role,
    content: m.content.replace("{USER_MESSAGE}", userMessage),
  }));
  
  const response = await callAi(systemPrompt.content, messages, false, 0.3);
  
  history.push({ role: "assistant", content: response });
  
  if (history.length > 20) {
    history = history.slice(-20);
  }
  
  session.schemeChatHistory = history;
  await session.save();
  
  return { reply: response, history };
};

export default handleSchemeChat;
