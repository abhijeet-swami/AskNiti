import Session from "../models/session.model.js";
import buildCategoryPrompt from "../utils/prompts/category.prompt.js";
import callAi from "../services/ai.service.js";

const extractCategory = async (sessionId) => {
  const session = await Session.findById(sessionId);

  const system = buildCategoryPrompt(
    session.extractedPurpose,
    session.stage1Report.metadata,
  );

  const raw = await callAi(system.content);
  const data = JSON.parse(raw);

  session.stage = 2;
  session.layer = 1;
  session.stage1Report.shortDescription = data.shortDescription;
  session.stage1Report.categories = data.categories;
  await session.save();

  return data;
};

export default extractCategory;
