import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
// import { GeminiApiKey } from "../variables";

const GeminiApiKey = process.env.GeminiApiKey;
if (!GeminiApiKey) {
  throw new Error("geminiApiKey is not defined in environment variables.");
}
const genAI = new GoogleGenerativeAI(GeminiApiKey);

const geminiFlash = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function processMessageWithGemini(text: string) {
  if (!text) {
    throw new Error("Text input is required for Gemini processing.");
  }

  const prompt = `Given the text: "${text}", perform the following actions and return the result as a JSON object:
    1. Auto-detect the original language.
    2. Translate the text to English.
    3. Extract any identifiable locations (place, state, country if applicable).
    4. Determine the 'issueType' based on the content (e.g., "flood", "drought", "Erosion", "no issue").

    Ensure the JSON format is exactly:
    {
      "language": "detected language",
      "translatedText": "english translation",
      "location": "extracted full location as a single complete string with all available geographic details",
      "issueType": "categorized issue"
    }
    If no specific location is found, "location" should be an empty string.
    If no specific issue is found, "issueType" should be "no issue".
    Prioritize actual locations over general greetings.`;

  try {
    const result = await geminiFlash.generateContent(prompt);
    const responseText = await result.response.text();

    // Attempt to parse the JSON. Gemini might add markdown or other text.
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    let parsedData;

    if (jsonMatch && jsonMatch[1]) {
      parsedData = JSON.parse(jsonMatch[1]);
    } else {
      // If no markdown block, try parsing directly (might fail if extra text exists)
      parsedData = JSON.parse(responseText);
    }

    return parsedData;
  } catch (error) {
    console.error("Error processing message with Gemini:", error);
    // You might want to return a default structure or re-throw the error
    throw new Error(
      `Failed to process message with Gemini: ${JSON.stringify(error, null, 2)}`
    );
  }
}
