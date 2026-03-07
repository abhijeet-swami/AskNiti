import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat.route.js";
import schemeChatRouter from "./routes/schemeChat.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import config from "./configs/env.config.js";

const app = express();

app.use(
  cors({
    origin: config.frontendUri,
    credentials: true,
    exposedHeaders: ["x-session-id"],
  }),
);
app.use(express.json());

const base = "/api/v1";

app.get(`${base}/health`, (req, res) => {
  res.json({ message: true });
});
app.use(`${base}/chat`, chatRouter);
app.use(`${base}/scheme`, schemeChatRouter);

app.use(errorHandler);

export default app;
