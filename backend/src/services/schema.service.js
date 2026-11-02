
import callAi from "../services/ai.service.js";
import Session from "../models/session.model.js";
import Scheme from "../models/scheme.model.js";
import buildSchemePrompt from "../utils/prompts/schema.prompt.js";
import rankSchemes from "../utils/ranking.util.js";
import { safeParseJSON } from "../utils/parseJson.util.js";
import verify from "../services/verify.service.js";

const genSchema = async (sessionId) => {
  // 1. Find session
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  if (!session.userProfile) {
    throw new Error("User profile not found");
  }

  // 2. Generate AI prompt
  const system = buildSchemePrompt(session.userProfile);

  if (!system?.content) {
    throw new Error("Failed to generate scheme prompt");
  }

  // 3. Get AI response
  const raw = await callAi(system.content);

  if (!raw || typeof raw !== "string") {
    throw new Error("AI returned an empty or invalid response");
  }

  console.log("AI Raw Response:", raw);

  // 4. Parse AI response
  const data = safeParseJSON(raw);

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("AI returned invalid JSON");
  }

  // 5. Validate MongoDB query
  if (
    !data.mongoQuery ||
    typeof data.mongoQuery !== "object" ||
    Array.isArray(data.mongoQuery)
  ) {
    throw new Error("AI response is missing a valid mongoQuery");
  }

  // 6. Fetch matching schemes
  const schemes = await Scheme.find(data.mongoQuery);

  // 7. Update search specification
  const searchSpec = data.searchSpec ?? {};

  session.searchSpec = {
    beneficiaryProfiles: Array.isArray(searchSpec.beneficiaryProfiles)
      ? searchSpec.beneficiaryProfiles
      : [],

    mustHaveTags: Array.isArray(searchSpec.mustHaveTags)
      ? searchSpec.mustHaveTags
      : [],

    niceToHaveTags: Array.isArray(searchSpec.niceToHaveTags)
      ? searchSpec.niceToHaveTags
      : [],

    excludeTags: Array.isArray(searchSpec.excludeTags)
      ? searchSpec.excludeTags
      : [],

    subCategories: Array.isArray(searchSpec.subCategories)
      ? searchSpec.subCategories
      : [],

    categories: Array.isArray(searchSpec.categories)
      ? searchSpec.categories
      : [],
  };

  await session.save();

  // 8. Rank schemes
  const filterSchemes = rankSchemes(
    schemes,
    session.userProfile,
    session.extractedPurpose,
    session.searchSpec,
  );

  // 9. Verify schemes
  return await verify(filterSchemes, session._id);
};

export default genSchema;