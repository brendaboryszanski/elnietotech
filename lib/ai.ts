import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisRequest, AnalysisResponse } from "@/types";
import { SYSTEM_PROMPT } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeConversation(
  request: AnalysisRequest
): Promise<AnalysisResponse> {
  const { message, image, conversationHistory } = request;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Build conversation history
    const parts = [];

    // Add conversation history
    for (const msg of conversationHistory) {
      if (msg.role === "user") {
        if (msg.image) {
          // User message with image
          const base64Data = msg.image.includes(",")
            ? msg.image.split(",")[1]
            : msg.image;
          const mimeType = msg.image.includes("image/png")
            ? "image/png"
            : "image/jpeg";

          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          });
        }
        parts.push({ text: `Usuario: ${msg.content}` });
      } else {
        parts.push({ text: `Asistente: ${msg.content}` });
      }
    }

    // Add current message
    if (image) {
      const base64Data = image.includes(",") ? image.split(",")[1] : image;
      const mimeType = image.includes("image/png")
        ? "image/png"
        : "image/jpeg";

      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      });
    }
    parts.push({ text: `Usuario: ${message}` });

    const result = await model.generateContent(parts);
    const response = await result.response;
    const responseText = response.text();

    // Try to parse JSON with multiple strategies
    const parseResponse = (text: string): AnalysisResponse | null => {
      try {
        const parsed = JSON.parse(text.trim());
        if (parsed.reply) {
          return parsed as AnalysisResponse;
        }
      } catch {
        // Parsing failed, try next strategy
      }
      return null;
    };

    // Strategy 1: Try parsing as-is
    let parsed = parseResponse(responseText);
    if (parsed) return parsed;

    // Strategy 2: Extract from ```json ... ``` code block
    const jsonCodeBlock = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonCodeBlock) {
      parsed = parseResponse(jsonCodeBlock[1]);
      if (parsed) return parsed;
    }

    // Strategy 3: Extract from ``` ... ``` code block (without json tag)
    const codeBlock = responseText.match(/```\s*([\s\S]*?)\s*```/);
    if (codeBlock) {
      parsed = parseResponse(codeBlock[1]);
      if (parsed) return parsed;
    }

    // Strategy 4: Find JSON object in text { ... }
    const jsonObject = responseText.match(/\{[\s\S]*"reply"[\s\S]*\}/);
    if (jsonObject) {
      parsed = parseResponse(jsonObject[0]);
      if (parsed) return parsed;
    }

    console.error("Could not parse JSON from Gemini response:", responseText);

    // Fallback: try to extract reply from malformed JSON-like text
    const replyMatch = responseText.match(/"reply"\s*:\s*"([^"]+)"/);
    if (replyMatch) {
      return {
        reply: replyMatch[1],
        needsImage: false,
        isSolution: false,
      };
    }

    // Last resort: return cleaned text (remove JSON artifacts)
    const cleanedText = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .replace(/^\s*\{\s*"reply"\s*:\s*"/m, "")
      .replace(/",?\s*"needsImage"[\s\S]*$/m, "")
      .trim();

    return {
      reply: cleanedText || "No pude procesar la respuesta. ¿Podés repetir?",
      needsImage: false,
      isSolution: false,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Re-throw the original error so route.ts can detect rate limits
    throw error;
  }
}
