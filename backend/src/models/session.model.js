import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stage: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    layer: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    conversationHistory: {
      type: [messageSchema],
      default: [],
    },
    extractedPurpose: {
      type: String,
      default: null,
    },
    stage1Report: {
      shortDescription: { type: String, default: null },
      categories: [String],
      metadata: {
        age: { type: Number, default: null },
        gender: { type: String, default: null },
        caste: { type: String, default: null },
      },
    },
    filteredSlug: {
      type: [String],
      default: [],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 60 * 12),
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  },
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
