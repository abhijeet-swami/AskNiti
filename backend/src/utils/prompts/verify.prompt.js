const buildVerifyPrompt = (schemes, userProfile) => {
  const { who, metadata, shortDescription } = userProfile;
  const { age, gender, caste, isPwd, isBpl, income } = metadata;

  const schemeList = schemes.map((s) => {
    const scheme = s.scheme || s;
    return {
      slug: scheme.slug,
      name: scheme.name,
      category: scheme.category,
      sub_category: scheme.sub_category,
      scheme_level: scheme.scheme_level,
      state: scheme.state,
      description: scheme.description,
      beneficiary_profile: scheme.beneficiary_profile || [],
      eligibilityParsed: scheme.eligibilityParsed || {},
    };
  });

  return {
    role: "system",
    content: `You are verifying Indian government schemes for a specific user.
Return only the schemes the user genuinely qualifies for.

━━━ USER PROFILE ━━━
Purpose      : ${shortDescription ?? "unknown"}
Who          : ${who ?? "unknown"}
Age          : ${age ?? "unknown"}
Gender       : ${gender ?? "unknown"}
Caste        : ${caste ?? "unknown"}
State        : Rajasthan (central schemes are also applicable)
Income (LPA) : ${income ?? "unknown"}
Is PWD       : ${isPwd ? "yes" : "no"}
Is BPL       : ${isBpl ? "yes" : "no"}

━━━ SCHEMES TO VERIFY ━━━
${JSON.stringify(schemeList, null, 2)}

━━━ ELIGIBILITY FIELDS TO CHECK ━━━

From eligibilityParsed:
  minAge / maxAge     → disqualify if user age is outside range
  gender              → disqualify if mismatch (ignore if "all" or null)
  caste               → disqualify if user caste not in list (ignore if ["all"] or empty)
  maxIncomeLPA        → disqualify if user income exceeds limit (ignore if null or unknown)
  isPWD               → disqualify if true and user is not PWD
  isBPL               → disqualify if true and user is not BPL
  occupation          → disqualify if list is non-empty, does not include "all", and user's who does not match
  states              → disqualify if non-empty and does not include user's state AND scheme_level is not "central"

From top-level fields:
  scheme_level        → "central" schemes are available in all states including Rajasthan
  state               → only matters for scheme_level "state"

━━━ RULES ━━━

• null or ["all"] means no restriction — allow
• If income is unknown → allow
• If age is unknown → allow
• Always trust eligibilityParsed over description text
• Central schemes (scheme_level = "central") are always available in Rajasthan
• Do NOT use beneficiary_profile for disqualification — it is for search only

Return only slugs of qualifying schemes.
Return exactly:
{ "slugs": [] }`,
  };
};

export default buildVerifyPrompt;
