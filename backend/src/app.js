import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat.route.js";
import schemeChatRouter from "./routes/schemeChat.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    exposedHeaders: ["x-session-id"],
  }),
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ message: true });
});

const base = "/api/v1";

app.use(`${base}/chat`, chatRouter);
app.use(`${base}/scheme`, schemeChatRouter);

app.use(errorHandler);

export default app;
