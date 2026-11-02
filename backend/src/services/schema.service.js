
import callAi from "../services/ai.service.js";
import Session from "../models/session.model.js";
import Scheme from "../models/scheme.model.js";
import buildSchemePrompt from "../utils/prompts/schema.prompt.js";
import rankSchemes from "../utils/ranking.util.js";
import { safeParseJSON } from "../utils/parseJson.util.js";
import verify from "../services/verify.service.js";

const genSchema = async (sessionId) => {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  const system = buildSchemePrompt(session.userProfile);

  const raw = await callAi(system.content);

  console.log("AI Raw Response:", raw);

  const data = safeParseJSON(raw);

  if (!data || typeof data !== "object") {
    throw new Error("AI returned invalid JSON");
  }

  if (
    !data.mongoQuery ||
    typeof data.mongoQuery !== "object" ||
    Array.isArray(data.mongoQuery)
  ) {
    throw new Error("AI response missing valid mongoQuery");
  }

  const schemes = await Scheme.find(data.mongoQuery);

  session.searchSpec = {
    beneficiaryProfiles: data.searchSpec?.beneficiaryProfiles ?? [],
    mustHaveTags: data.searchSpec?.mustHaveTags ?? [],
    niceToHaveTags: data.searchSpec?.niceToHaveTags ?? [],
    excludeTags: data.searchSpec?.excludeTags ?? [],
    subCategories: data.searchSpec?.subCategories ?? [],
    categories: data.searchSpec?.categories ?? [],
  };

  await session.save();

  const filterSchemes = rankSchemes(
    schemes,
    session.userProfile,
    session.extractedPurpose,
    session.searchSpec,
  );

  return await verify(filterSchemes, session._id);
};

export default genSchema;