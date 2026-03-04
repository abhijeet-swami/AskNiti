import mongoose from "mongoose";
import config from "./env.config.js";

const dbConnect = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Database connected");
  } catch (error) {
    console.error("Failed to connect to database", error.message);
    process.exit(1);
  }
};

export default dbConnect;
