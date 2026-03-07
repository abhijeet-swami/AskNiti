import { Router } from "express";
import handleChat from "../controllers/schemeChat.controller.js";
import attachSession from "../middlewares/session.middleware.js";

const router = Router();

router.post("/chat", attachSession, handleChat);

export default router;
