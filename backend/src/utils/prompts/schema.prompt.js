const ALL_CATEGORIES = [
  "Banking,Financial Services and Insurance",
  "Business & Entrepreneurship",
  "Education & Learning",
  "Health & Wellness",
  "Science, IT & Communications",
  "Skills & Employment",
  "Social welfare & Empowerment",
  "Transport & Infrastructure",
  "Utility & Sanitation",
  "Women and Child",
];

const ALL_SUB_CATEGORIES = [
  "Scholarship",
  "Fellowship",
  "Pension",
  "Subsidy",
  "Loan/Credit",
  "Insurance",
  "Skill Training",
  "Employment",
  "Financial Assistance",
  "Healthcare",
  "Housing",
  "General Welfare",
];

const ALL_BENEFICIARY_PROFILES = [
  "sc-student-scholarship",
  "st-student-scholarship",
  "obc-student-scholarship",
  "ews-student-scholarship",
  "student-scholarship",
  "sc-student",
  "st-student",
  "obc-student",
  "ews-student",
  "student",
  "research-fellowship",
  "farmer-subsidy",
  "farmer-loan",
  "farmer-insurance",
  "farmer-welfare",
  "women-welfare",
  "girl-student",
  "bpl-senior-pension",
  "bpl-pension",
  "bpl-welfare",
  "pension",
  "pwd-welfare",
  "pwd-employment",
  "minority-welfare",
  "construction-worker-financial-aid",
  "construction-worker-welfare",
  "entrepreneur-loan",
  "general-welfare",
];

const ALL_DB_TAGS = [
  "accident insurance",
  "agriculture",
  "animal husbandry",
  "artisans",
  "banking",
  "below poverty line",
  "bpl",
  "business",
  "cash prize",
  "cattle farming",
  "construction worker",
  "counselling",
  "death insurance",
  "direct benefit transfer",
  "dropout",
  "education",
  "employment",
  "entrepreneur",
  "entrepreneurship",
  "farm tools",
  "farmer",
  "fellowship",
  "financial assistance",
  "girl child",
  "goat farming",
  "grant",
  "health insurance",
  "higher education",
  "incentive",
  "insurance",
  "interest subvention",
  "labor",
  "livestock",
  "loan",
  "minority",
  "old age",
  "pension",
  "person with disability",
  "poultry farming",
  "research",
  "rural development",
  "scholarship",
  "self employment",
  "skill development",
  "social welfare",
  "startup",
  "student",
  "subsidy",
  "training",
  "transgender",
  "vocational training",
  "widow",
  "women",
  "youth",
];

const buildSchemaPrompt = (userProfile) => {
  const VALID_CATEGORIES = new Set([
    "Banking,Financial Services and Insurance",
    "Business & Entrepreneurship",
    "Education & Learning",
    "Health & Wellness",
    "Science, IT & Communications",
    "Skills & Employment",
    "Social welfare & Empowerment",
    "Transport & Infrastructure",
    "Utility & Sanitation",
    "Women and Child",
  ]);

  const { who, shortDescription, subCategories, metadata } = userProfile;
  const categories = (userProfile.categories || []).filter((c) =>
    VALID_CATEGORIES.has(c),
  );
  const { age, gender, caste, isPwd, isBpl } = metadata;

  return {
    role: "system",
    content: `You are a MongoDB query builder for an Indian government schemes database.

Your job is to generate:
1. A MongoDB filter (mongoQuery) to retrieve broad candidate schemes
2. A ranking specification (searchSpec) used for scoring later

Eligibility filtering happens in a later step — keep the query broad.

━━━━━━━━ USER PROFILE ━━━━━━━━

Description   : ${shortDescription ?? "unknown"}
Who           : ${who ?? "unknown"}
Categories    : ${categories?.length ? categories.join(", ") : "unknown"}
Sub-Categories: ${subCategories?.length ? subCategories.join(", ") : "unknown"}
Age           : ${age ?? "unknown"}
Gender        : ${gender ?? "unknown"}
Caste         : ${caste ?? "unknown"}
Is PWD        : ${isPwd === true ? "yes" : "no"}
Is BPL        : ${isBpl === true ? "yes" : "no"}

━━━━━━━━ DATABASE SCHEMA ━━━━━━━━

Each scheme document has these fields:

{
  name                : String,
  description         : String,
  state               : String,        // "Rajasthan" or "Central"
  scheme_level        : String,        // "state" | "central"
  ministry            : String,        // Ministry name or null
  category            : String,        // one of the main categories
  sub_category        : String,        // one of the sub-categories
  tags                : [String],
  beneficiary_profile : [String],      // compound eligibility tags — USE THIS FIRST
  eligibilityParsed   : {
    caste      : [String],
    occupation : [String],
    isStudent  : Boolean,
    isBPL      : Boolean,
    isPWD      : Boolean,
    isMinority : Boolean,
    minAge     : Number,
    maxAge     : Number,
    gender     : String
  }
}

━━━━━━━━ EXACT CATEGORIES ━━━━━━━━

${ALL_CATEGORIES.map((c) => `"${c}"`).join(", ")}

━━━━━━━━ EXACT SUB-CATEGORIES ━━━━━━━━

${ALL_SUB_CATEGORIES.map((s) => `"${s}"`).join(", ")}

━━━━━━━━ EXACT BENEFICIARY PROFILES ━━━━━━━━

These are compound tags combining who the user is + what they need.
Always prefer matching on beneficiary_profile — it is the most accurate filter.

${ALL_BENEFICIARY_PROFILES.map((p) => `"${p}"`).join(", ")}

━━━━━━━━ WHO → BENEFICIARY PROFILE GUIDE ━━━━━━━━

farmer + subsidy/loan/insurance → "farmer-subsidy", "farmer-loan", "farmer-insurance"
farmer (general)                → "farmer-welfare"
student + SC/ST + scholarship   → "sc-student-scholarship", "st-student-scholarship"
student + OBC + scholarship     → "obc-student-scholarship"
student + EWS + scholarship     → "ews-student-scholarship"
student (general scholarship)   → "student-scholarship"
student (no scholarship)        → "student"
research / fellowship           → "research-fellowship"
women                           → "women-welfare"
girl + student                  → "girl-student"
BPL + elderly / pension         → "bpl-senior-pension", "bpl-pension"
BPL (general)                   → "bpl-welfare"
senior citizen / pension        → "pension"
person with disability          → "pwd-welfare", "pwd-employment"
minority                        → "minority-welfare"
construction worker             → "construction-worker-financial-aid", "construction-worker-welfare"

━━━━━━━━ WHO → CATEGORIES GUIDE ━━━━━━━━

farmer (any need)               → "Banking,Financial Services and Insurance", "Business & Entrepreneurship", "Social welfare & Empowerment"
student (scholarship/education) → "Education & Learning", "Social welfare & Empowerment"
women                           → "Women and Child", "Social welfare & Empowerment", "Banking,Financial Services and Insurance"
construction worker / laborer   → "Social welfare & Empowerment", "Skills & Employment"
senior citizen / pension        → "Social welfare & Empowerment"
person with disability          → "Social welfare & Empowerment", "Skills & Employment"
business / entrepreneur         → "entrepreneur-loan", "general-welfare"
minority                        → "Social welfare & Empowerment", "Banking,Financial Services and Insurance"

IMPORTANT: For farmers, ALWAYS include all three categories above. Farmer schemes are spread across multiple categories in the DB — using only 1-2 categories will miss most results.

━━━━━━━━ EXACT TAGS ━━━━━━━━

${ALL_DB_TAGS.map((t) => `"${t}"`).join(", ")}

━━━━━━━━ mongoQuery STRUCTURE ━━━━━━━━

Primary filter: beneficiary_profile (most accurate — always include if applicable)
Secondary filter: sub_category
Tertiary filter: category
Fallback: tags, name/description regex

Preferred structure:

{
  "category": { "$in": ["..."] },
  "sub_category": { "$in": ["..."] },
  "$or": [
    { "beneficiary_profile": { "$in": ["..."] } },
    { "tags": { "$in": ["..."] } },
    { "name": { "$regex": "keyword", "$options": "i" } }
  ]
}

━━━━━━━━ searchSpec RULES ━━━━━━━━

beneficiaryProfiles
Profiles matching the user. Used for ranking boost.

mustHaveTags
Core tags. A scheme must have at least ONE.

niceToHaveTags
Bonus tags that increase score.

excludeTags
Tags clearly unrelated to the user's purpose.

subCategories
Expected sub-category types (used for scoring).

categories
1–3 categories relevant to the user.

━━━━━━━━ OUTPUT FORMAT ━━━━━━━━

{
  "mongoQuery": {
    "category": { "$in": [] },
    "sub_category": { "$in": [] },
    "$or": []
  },
  "searchSpec": {
    "beneficiaryProfiles": [],
    "mustHaveTags": [],
    "niceToHaveTags": [],
    "excludeTags": [],
    "subCategories": [],
    "categories": []
  }
}

━━━━━━━━ RULES ━━━━━━━━

• Do NOT add eligibility filters (age, caste, gender, income) to mongoQuery.
• Only use exact values from the provided lists.
• mustHaveTags and excludeTags must NEVER overlap.
• beneficiaryProfiles and excludeTags must NEVER overlap.
• Be generous in retrieval — ranking will refine later.

Return ONLY the JSON object. No explanation.
`,
  };
};

export default buildSchemaPrompt;
