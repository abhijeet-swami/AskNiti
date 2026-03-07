import callAi from "../services/ai.service.js";
import buildVerifyPrompt from "../utils/prompts/verify.prompt.js";
import Session from "../models/session.model.js";
import Scheme from "../models/scheme.model.js";
import { safeParseJSON } from "../utils/parseJson.util.js";

const verify = async (filterSchemes, sessionId) => {
  const session = await Session.findById(sessionId);

  if (!filterSchemes?.length) return [];

  const system = buildVerifyPrompt(filterSchemes, session.userProfile);
  const raw = await callAi(system.content);
  const data = safeParseJSON(raw);

  const slugs =
    Array.isArray(data?.slugs) && data.slugs.length
      ? data.slugs
      : filterSchemes
          .slice(0, 5)
          .map((s) => s.slug ?? s.scheme?.slug)
          .filter(Boolean);

  const schemes = await Scheme.find({ slug: { $in: slugs } });
  return schemes;
};

export default verify;
