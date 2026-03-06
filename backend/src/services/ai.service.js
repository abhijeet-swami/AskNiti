import config from "../configs/env.config.js";

const callAi = async (
  systemPrompt,
  messages,
  jsonMode = false,
  temperature = 0.2,
) => {
  const body = {
    model: config.ai.model,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature,
  };

  if (jsonMode) body.response_format = { type: "json_object" };

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.ai.api}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const result = await response.json();
  if (!result.choices) throw new Error(JSON.stringify(result));

  return result.choices[0].message.content;
};

export default callAi;
