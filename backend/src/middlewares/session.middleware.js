import { v4 as uuidv4 } from "uuid";
import Session from "../models/session.model.js";

const attachSession = async (req, res, next) => {
  try {
    const sessionId = req.headers["x-session-id"];

    if (!sessionId) {
      return await createNewSession(req, res, next);
    }

    const existingSession = await Session.findOne({ sessionId });

    if (!existingSession) {
      return await createNewSession(req, res, next);
    }

    existingSession.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12);
    await existingSession.save();

    req.session = existingSession;
    return next();
  } catch (error) {
    next(error);
  }
};

const createNewSession = async (req, res, next) => {
  try {
    const newSession = await Session.create({
      sessionId: uuidv4(),
      stage: 1,
      layer: 1,
      status: "active",
      conversationHistory: [],
    });

    req.session = newSession;
    res.setHeader("x-session-id", newSession.sessionId);
    return next();
  } catch (error) {
    next(error);
  }
};

export default attachSession;
