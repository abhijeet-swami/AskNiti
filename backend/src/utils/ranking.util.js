import config from "../configs/env.config.js";

const WHO_TO_OCCUPATION = {
  farmer: ["farmer"],
  student: ["student"],
  artisan: ["artisan"],
  fisherman: ["fisherman"],
  laborer: ["laborer"],
  "construction worker": ["laborer", "construction_worker"],
  tribal: ["tribal"],
};

const CasteHierarchy = {
  sc: 4,
  st: 4,
  obc: 3,
  ews: 2,
  general: 1,
  all: 0,
};

const normalize = (arr = []) => arr.map((v) => v.toLowerCase().trim());

const singularize = (word) => {
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
};

const getUserCasteLevel = (caste) => {
  if (!caste) return 0;
  return CasteHierarchy[caste.toLowerCase().trim()] ?? 0;
};

const canUserAccessScheme = (userCaste, schemeCastes) => {
  if (!schemeCastes || schemeCastes.length === 0) return true;
  if (schemeCastes.includes("all")) return true;

  const userLevel = getUserCasteLevel(userCaste);
  if (userLevel === 0) return true;

  const schemeLevels = schemeCastes
    .map((c) => CasteHierarchy[c.toLowerCase()])
    .filter((v) => v != null);

  if (!schemeLevels.length) return true;

  return userLevel >= Math.min(...schemeLevels);
};

const buildExpectedProfiles = (who, caste, subCategories = []) => {
  const profiles = new Set();
  const casteLower = (caste || "").toLowerCase();
  const subCatLower = subCategories.map((s) => s.toLowerCase());

  if (who === "farmer") {
    if (subCatLower.some((s) => s.includes("subsidy")))
      profiles.add("farmer-subsidy");
    if (subCatLower.some((s) => s.includes("loan")))
      profiles.add("farmer-loan");
    if (subCatLower.some((s) => s.includes("insurance")))
      profiles.add("farmer-insurance");
    profiles.add("farmer-welfare");
  }

  if (who === "student") {
    const isScholarship = subCatLower.some(
      (s) => s.includes("scholarship") || s.includes("fellowship"),
    );
    if (casteLower === "sc")
      profiles.add(isScholarship ? "sc-student-scholarship" : "sc-student");
    if (casteLower === "st")
      profiles.add(isScholarship ? "st-student-scholarship" : "st-student");
    if (casteLower === "obc")
      profiles.add(isScholarship ? "obc-student-scholarship" : "obc-student");
    if (casteLower === "ews")
      profiles.add(isScholarship ? "ews-student-scholarship" : "ews-student");
    if (isScholarship) profiles.add("student-scholarship");
    if (subCatLower.some((s) => s.includes("fellowship")))
      profiles.add("research-fellowship");
    profiles.add("student");
  }

  if (who === "women") profiles.add("women-welfare");
  if (who === "senior citizen") {
    profiles.add("pension");
    profiles.add("bpl-senior-pension");
  }
  if (who === "person with disability") {
    profiles.add("pwd-welfare");
    profiles.add("pwd-employment");
  }
  if (who === "construction worker") {
    profiles.add("construction-worker-financial-aid");
    profiles.add("construction-worker-welfare");
  }
  if (who === "widow") {
    profiles.add("pension");
    profiles.add("bpl-pension");
  }
  if (who === "minority") profiles.add("minority-welfare");
  if (who === "entrepreneur" || who === "business")
    profiles.add("entrepreneur-loan");

  return profiles;
};

const rankSchemes = (
  schemes,
  { who, categories, subCategories, metadata },
  extractedPurpose,
  searchSpec,
) => {
  const { age, gender, caste } = metadata;

  const purposeWords = (extractedPurpose || "")
    .toLowerCase()
    .split(/\s+/)
    .map(singularize)
    .filter((w) => w.length > 3);

  const userOccupations = WHO_TO_OCCUPATION[who] || [];

  const mustSet = new Set(normalize(searchSpec?.mustHaveTags || []));
  const niceSet = new Set(normalize(searchSpec?.niceToHaveTags || []));
  const excludeSet = new Set(normalize(searchSpec?.excludeTags || []));
  const profileSet = new Set([
    ...(searchSpec?.beneficiaryProfiles || []),
    ...buildExpectedProfiles(
      who,
      caste,
      subCategories || searchSpec?.subCategories || [],
    ),
  ]);

  const activeCategories = (
    searchSpec?.categories?.length ? searchSpec.categories : categories || []
  ).filter((c) => c !== "Agriculture, Rural & Environment");

  const activeSubCategories = searchSpec?.subCategories?.length
    ? searchSpec.subCategories
    : subCategories || [];

  return schemes
    .map((scheme) => {
      const ep = scheme.eligibilityParsed || {};
      const schemeCastes = normalize(ep.caste || []);
      const schemeOccupations = normalize(ep.occupation || []);
      const tags = normalize(scheme.tags || []);
      const schemeProfiles = scheme.beneficiary_profile || [];
      const nameLower = (scheme.name || "").toLowerCase();
      const descLower = (scheme.description || "").toLowerCase();

      const hasProfileMatch = schemeProfiles.some((p) => profileSet.has(p));
      if (!hasProfileMatch && tags.some((t) => excludeSet.has(t))) return null;

      if (
        ep.gender &&
        ep.gender !== "all" &&
        gender &&
        ep.gender !== gender.toLowerCase()
      )
        return null;

      if (
        activeCategories.length &&
        !activeCategories.includes(scheme.category)
      )
        return null;

      const schemeStates = ep.states || [];
      if (
        schemeStates.length > 0 &&
        !schemeStates.includes("All India") &&
        scheme.scheme_level !== "central" &&
        !schemeStates.includes(config.userState)
      )
        return null;

      if (!canUserAccessScheme(caste, schemeCastes)) return null;

      let score = 0;

      const profileMatches = schemeProfiles.filter((p) => profileSet.has(p));
      score += profileMatches.length * 30;

      if (activeSubCategories.includes(scheme.sub_category)) score += 20;

      const mustMatches = tags.filter((t) => mustSet.has(t));
      const niceMatches = tags.filter((t) => niceSet.has(t));
      score += mustMatches.length * 15;
      score += niceMatches.length * 8;

      const catIndex = activeCategories.indexOf(scheme.category);
      if (catIndex === 0) score += 12;
      else if (catIndex > 0) score += 6;

      if (scheme.scheme_level === "state" && scheme.state === config.userState)
        score += 10;

      if (
        schemeOccupations.length &&
        !schemeOccupations.includes("all") &&
        userOccupations.some((o) => schemeOccupations.includes(o))
      ) {
        score += 15;
      }

      if (schemeCastes.length && !schemeCastes.includes("all")) {
        const casteLower = (caste || "").toLowerCase();
        const hasSCST =
          schemeCastes.includes("sc") || schemeCastes.includes("st");
        const hasOBC = schemeCastes.includes("obc");
        const hasEWS = schemeCastes.includes("ews");
        if ((casteLower === "sc" || casteLower === "st") && hasSCST)
          score += 12;
        else if (casteLower === "obc" && hasOBC) score += 12;
        else if (casteLower === "ews" && hasEWS) score += 12;
        else score += 3;
      }

      const nameMatches = purposeWords.filter((w) => nameLower.includes(w));
      const descMatches = purposeWords.filter((w) => descLower.includes(w));
      score += Math.min(nameMatches.length * 5, 15);
      score += Math.min(descMatches.length * 3, 10);

      if (ep.isStudent && who === "student") score += 8;

      if (ep.minAge != null && ep.maxAge != null) {
        const band = ep.maxAge - ep.minAge;
        if (band <= 10) score += 7;
        else if (band <= 20) score += 4;
      }

      return { slug: scheme.slug, name: scheme.name, score, scheme };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);
};

export default rankSchemes;
