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
    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

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

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error(`AI service failed: ${error.message}`);
  }
};

export default callAi;