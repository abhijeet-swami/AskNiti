import { Router } from "express";
import handleMessage from "../controllers/chat.controller.js";
import attachSession from "../middlewares/session.middleware.js";

const router = Router();

router.post("/message", attachSession, handleMessage);

export default router;
