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
    searchSpec: {
      beneficiaryProfiles: [String],
      mustHaveTags: [String],
      niceToHaveTags: [String],
      excludeTags: [String],
      subCategories: [String],
      categories: [String],
    },
    userProfile: {
      who: { type: String, default: null },
      shortDescription: { type: String, default: null },
      categories: [String],
      subCategories: [String],
      metadata: {
        age: { type: Number, default: null },
        gender: { type: String, default: null },
        caste: { type: String, default: null },
        income: { type: Number, default: null },
        isBpl: { type: Boolean, default: false },
        isPwd: { type: Boolean, default: false },
        isMinority: { type: Boolean, default: false },
      },
    },
    schemeChatHistory: {
      type: [{
        role: {
          type: String,
          enum: ["user", "system", "assistant"],
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
      }],
      default: [],
    },
    expiresAt: {
      type: Date,
      expires: 43200,
      default: () => new Date(Date.now() + 1000 * 60 * 60 * 12),
    },
  },
  {
    timestamps: true,
  },
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
