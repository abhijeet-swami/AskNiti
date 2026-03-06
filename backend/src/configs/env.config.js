import dotenv from "dotenv";

dotenv.config();

const config = {
  frontendUri: process.env.FRONTEND_URL,
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGODB_URL,
  ai: {
    api: process.env.AI_API,
    model: process.env.AI_MODEL,
  },
};

export default config;
