// lib/services/species-chat.ts
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

let openai: OpenAI | null = null;
if (apiKey) {
  openai = new OpenAI({ apiKey });
} else {
  console.warn("⚠️ OPENAI_API_KEY is missing. The chatbot will not work without it.");
}

export async function generateResponse(message: string): Promise<string> {
  if (!openai) {
    return "⚠️ The chatbot is not configured properly (missing API key). Please contact the administrator.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // lightweight + fast
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that ONLY answers questions about animals and species (habitat, diet, conservation status, speed, etc.). If asked something unrelated, politely say you can only answer animal-related queries.",
        },
        { role: "user", content: message },
      ],
      max_tokens: 250,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() ?? "I’m not sure about that one.";
  } catch (error) {
    console.error("Chatbot error:", error);
    return "⚠️ Sorry, I had trouble generating a response. Please try again.";
  }
}
