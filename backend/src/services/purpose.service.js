import Session from "../models/session.model.js";
import callAi from "./ai.service.js";
import purposePrompt from "../utils/prompts/purpose.prompt.js";

const processPurposeMessage = async (sessionId, userMessage) => {
  const session = await Session.findOne({ sessionId });
  const conversationHistory = session.conversationHistory;

  const system = purposePrompt(conversationHistory);
  const raw = await callAi(system.content, [
    { role: "user", content: userMessage },
  ], true);

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return { reply: raw, intentReady: false };
  }

  if (data.nextQuestion) {
    session.conversationHistory.push(
      { role: "user", content: userMessage },
      { role: "system", content: data.nextQuestion },
    );
    await session.save();
  }

  if (!data.intentReady) {
    return { reply: data.nextQuestion, intentReady: false };
  }

  session.extractedPurpose = data.purpose;
  session.layer = 2;
  await session.save();

  return { reply: data.nextQuestion, intentReady: true };
};

export default processPurposeMessage;
