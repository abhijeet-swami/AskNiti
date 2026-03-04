import dotenv from "dotenv";

dotenv.config();

const config = {
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGODB_URL,
};

export default config;
