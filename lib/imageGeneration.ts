import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateImage(prompt: string): Promise<string | null> {
  try {
    // Use Gemini's image generation model (Imagen 3)
    const model = genAI.getGenerativeModel({
      model: "imagen-3.0-generate-002",
    });

    const enhancedPrompt = `Create a simple, clear, high-contrast reference illustration: ${prompt}. 
    Style: Clean, minimal design with a white or light background. Show only the ICON or BUTTON described, 
    not a full screen or interface. Make it large and centered. Use bright, distinct colors. 
    This should be a universal reference image that helps identify an icon or button, 
    not a device-specific screenshot. Simple enough for elderly users to understand.`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;

    // Check if there's an inline image in the response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts;
      if (parts) {
        for (const part of parts) {
          if ("inlineData" in part && part.inlineData) {
            const base64 = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || "image/png";
            return `data:${mimeType};base64,${base64}`;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

