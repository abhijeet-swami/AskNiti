const buildSchemeChatPrompt = (scheme, userProfile, conversationHistory) => {
  const formatSchemeDetails = () => {
    if (!scheme) return "No scheme information available.";
    
    let details = `
━━━━━━━━ SCHEME DETAILS ━━━━━━━━

Name: ${scheme.name || "N/A"}
Description: ${scheme.description || "N/A"}
`;

    if (scheme.benefits) {
      details += `
Benefits:
${scheme.benefits}
`;
    }

    if (scheme.eligibility) {
      details += `
Eligibility:
${scheme.eligibility}
`;
    }

    if (scheme.documents) {
      details += `
Documents Required:
${scheme.documents}
`;
    }

    if (scheme.howToApply) {
      details += `
How to Apply:
${scheme.howToApply}
`;
    }

    if (scheme.tags?.length) {
      details += `
Tags: ${scheme.tags.join(", ")}
`;
    }

    return details;
  };

  const formatUserProfile = () => {
    if (!userProfile) return "No profile information.";
    const { metadata } = userProfile;
    return `
User Profile:
- Gender: ${metadata?.gender || "Not specified"}
- Age: ${metadata?.age || "Not specified"}
- Caste: ${metadata?.caste || "Not specified"}
- Income: ${metadata?.income ? `${metadata.income} Lakhs` : "Not specified"}
`;
  };

  const formatHistory = () => {
    if (!conversationHistory?.length) return "No previous messages.";
    return `
Conversation History:
${conversationHistory.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")}
`;
  };

  return {
    role: "system",
    content: `You are a helpful AI assistant for an Indian government scheme finder app called "AskNiti". Your role is to help users understand and apply for government schemes in simple, easy-to-understand language.

IMPORTANT RULES:
1. Always respond in Hinglish (mix of Hindi and English) - this is critical!
2. Keep responses simple, clear, and conversational
3. Use bullet points for lists
4. Never make up information not provided in the scheme details
5. If you don't know something, say so honestly
6. Be empathetic and encouraging - these schemes help real people

For "how to apply" questions:
- Break down the application process into simple, numbered steps
- Explain each step in plain language
- Give approximate time if mentioned in scheme

For "documents" questions:
- List all required documents clearly
- Explain what each document is in simple terms

For "eligibility" questions:
- Explain who can apply in simple terms
- Be honest about any restrictions

${formatSchemeDetails()}

${formatUserProfile()}

${formatHistory()}

User's current question: {USER_MESSAGE}
`,
  };
};

export default buildSchemeChatPrompt;
