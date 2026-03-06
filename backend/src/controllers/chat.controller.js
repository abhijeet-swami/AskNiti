import processPurposeMessage from "../services/purpose.service.js";
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
      const metadata = session.stage1Report.metadata;

      if (!metadata.age) {
        return ApiResponse.ok(
          res,
          { reply: null, intentReady: true },
          "Message processed",
        );
      }

      return ApiError.ok(res, { status: true });
    }
  }
});

export default handleMessage;
