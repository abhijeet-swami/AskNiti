import handleSchemeChat from "../services/schemeChat.service.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { ApiError } from "../utils/ApiError.util.js";

const handleChat = asyncHandler(async (req, res) => {
  const session = req.session;
  const { message, scheme, clearHistory } = req.body;

  if (!message || typeof message !== "string") {
    throw new ApiError(400, "Message is required");
  }

  if (!scheme) {
    throw new ApiError(400, "Scheme details are required");
  }

  const sanitizedMessage = message.slice(0, 2000).trim();

  if (clearHistory === true) {
    session.schemeChatHistory = [];
    await session.save();
  }

  const result = await handleSchemeChat(
    session._id,
    scheme,
    sanitizedMessage
  );

  return ApiResponse.ok(
    res,
    { reply: result.reply, history: result.history },
    "Chat response received"
  );
});

export default handleChat;
