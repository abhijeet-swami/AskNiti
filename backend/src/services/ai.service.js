import config from "../configs/env.config.js";
import { GoogleGenAI } from "@google/genai";

const gemini = new GoogleGenAI({
  apiKey: config.ai.api,
});

const callAi = async (
  systemPrompt,
  messages = [],
  jsonMode = false,
  temperature = 0.2,
) => {
  try {
    // Always provide at least one user message
    const contents = messages.length
      ? messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        }))
      : [
          {
            role: "user",
            parts: [
              {
                text: "Follow the system instructions and generate the requested output.",
              },
            ],
          },
        ];

    const response = await gemini.models.generateContent({
      model: config.ai.model,
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature,
        ...(jsonMode && {
          responseMimeType: "application/json",
        }),
      },
    });

    const result = response.text;

    if (!result) {
      throw new Error("Gemini returned an empty response");
    }

    return result;

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error(`AI service failed: ${error.message}`);
  }
};

export default callAi;