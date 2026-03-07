import processPurposeMessage from "../services/purpose.service.js";
import setMetaData from "../services/metadata.service.js";
import extractCategory from "../services/category.service.js";
import genSchema from "../services/schema.service.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { ApiError } from "../utils/ApiError.util.js";

const sanitizeInput = (input) => {
  if (!input || typeof input !== "string") return "";
  return input.slice(0, 2000).trim();
};

const handleMessage = asyncHandler(async (req, res) => {
  const session = req.session;

  if (session.stage === 1) {
    if (session.layer === 1) {
      const message = sanitizeInput(req.body.message);

      if (!message) {
        throw new ApiError(400, "Message is required");
      }

      const result = await processPurposeMessage(session.sessionId, message);

      return ApiResponse.ok(
        res,
        { reply: result.reply, intentReady: result.intentReady },
        "Message processed",
      );
    } else if (session.layer === 2) {
      const metadataExists =
        session.userProfile?.metadata?.age ||
        session.userProfile?.metadata?.gender ||
        session.userProfile?.metadata?.caste;

      if (!metadataExists && !req.body?.metadata) {
        return ApiResponse.ok(
          res,
          { reply: null, intentReady: true },
          "Message processed",
        );
      }

      await setMetaData(session._id, req.body?.metadata);
      await extractCategory(session._id);
      const schemes = await genSchema(session._id);
      return ApiResponse.ok(res, { schemes });
    } else {
      await extractCategory(session._id);
      const schemes = await genSchema(session._id);
      return ApiResponse.ok(res, { schemes });
    }
  } else {
    if (session.layer === 1) {
      const schemes = await genSchema(session._id);
      return ApiResponse.ok(res, { schemes });
    }
  }
});

export default handleMessage;
