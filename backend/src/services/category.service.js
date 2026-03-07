import Session from "../models/session.model.js";
import buildCategoryPrompt from "../utils/prompts/category.prompt.js";
import callAi from "../services/ai.service.js";
import { safeParseJSON } from "../utils/parseJson.util.js";

const extractCategory = async (sessionId) => {
  const session = await Session.findById(sessionId);

  const system = buildCategoryPrompt(
    session.extractedPurpose,
    session.userProfile.metadata,
  );

  try {
    const raw = await callAi(system.content);
    const data = safeParseJSON(raw);

    session.stage = 2;
    session.layer = 1;
    session.userProfile.shortDescription = data.shortDescription;
    session.userProfile.categories = data.categories ?? [];
    session.userProfile.subCategories = data.subCategories ?? [];
    await session.save();

    return data;
  } catch (error) {
    console.error("Category extraction error:", error);
    session.stage = 2;
    session.layer = 1;
    await session.save();
    return { shortDescription: null, categories: [], subCategories: [] };
  }
};

export default extractCategory;
