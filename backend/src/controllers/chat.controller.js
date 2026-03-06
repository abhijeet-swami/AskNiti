import processPurposeMessage from "../services/purpose.service.js";
import setMetaData from "../services/metadata.service.js";
import extractCategory from "../services/category.service.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { ApiError } from "../utils/ApiError.util.js";

const handleMessage = asyncHandler(async (req, res) => {
  const session = req.session;
  if (session.stage === 1) {
    if (session.layer === 1) {
      const message = req.body.message;

      if (!message || message.trim() === "") {
        throw new ApiError(400, "Message is required");
      }

      const result = await processPurposeMessage(session.sessionId, message);

      return ApiResponse.ok(
        res,
        { reply: result.reply, intentReady: result.intentReady },
        "Message processed",
      );
    } else if (session.layer === 2) {
      const metadataExists = session.stage1Report.metadata;

      if (!metadataExists.age && !req.body.metadata) {
        return ApiResponse.ok(
          res,
          { reply: null, intentReady: true },
          "Message processed",
        );
      }

      await setMetaData(session._id, req.body?.metadata);
      const data = await extractCategory(session._id);

      return ApiResponse.ok(res, { succus: true });
    } else {
      const data = await extractCategory(session._id);

      return ApiResponse.ok(res, { succus: true });
    }
  }
});

export default handleMessage;
