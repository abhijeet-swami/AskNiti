import mongoose from "mongoose";

const { Schema, model } = mongoose;

const questionSchema = new Schema(
  {
    title: { type: String },
    qualifyingAnswer: { type: String },
  },
  { _id: false },
);

const eligibilityParsedSchema = new Schema(
  {
    minAge: { type: Number, default: null },
    maxAge: { type: Number, default: null },
    gender: { type: String, enum: ["all", "male", "female"], default: "all" },
    states: [{ type: String }],
    caste: [{ type: String }],
    maxIncomeLPA: { type: Number, default: null },
    employmentStatus: [{ type: String }],
    residence: {
      type: String,
      enum: ["urban", "rural", "both"],
      default: "both",
    },
    isBPL: { type: Boolean, default: false },
    isPWD: { type: Boolean, default: false },
    isMinority: { type: Boolean, default: false },
    isStudent: { type: Boolean, default: false },
    isGovernmentEmployee: { type: Boolean, default: false },
    occupation: [{ type: String }],
    questions: [questionSchema],
  },
  { _id: false },
);

const schemeSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    schemeType: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String }],
    description: { type: String },
    details: { type: String },
    benefits: { type: String },
    eligibility: { type: String },
    exclusions: { type: String, default: null },
    howToApply: { type: String },
    documents: { type: String },
    faq: { type: String },
    source: { type: String, trim: true },
    hasRulesData: { type: Boolean, default: false },
    eligibilityParsed: { type: eligibilityParsedSchema },
  },
  {
    timestamps: true,
  },
);

schemeSchema.index({ state: 1, category: 1 });
schemeSchema.index({ tags: 1 });
schemeSchema.index({ "eligibilityParsed.states": 1 });

const Scheme = model("Scheme", schemeSchema);

export default Scheme;
