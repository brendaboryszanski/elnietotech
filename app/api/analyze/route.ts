import { NextRequest, NextResponse } from "next/server";
import { analyzeConversation } from "@/lib/ai";
import { generateImage } from "@/lib/imageGeneration";
import type { AnalysisRequest, AnalysisResponse } from "@/types";

interface AnalysisResponseWithGeneratedImage extends AnalysisResponse {
  generatedImage?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();

    // Validations
    if (!body.message || !body.message.trim()) {
      return NextResponse.json(
        { error: "Message not provided" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.conversationHistory)) {
      return NextResponse.json(
        { error: "Conversation history must be an array" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Call Gemini AI to process the conversation
    const result = await analyzeConversation(body);

    // If AI wants to generate an image, do it
    const response: AnalysisResponseWithGeneratedImage = { ...result };
    if (result.generateImage) {
      const generatedImage = await generateImage(result.generateImage);
      if (generatedImage) {
        response.generatedImage = generatedImage;
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in /api/analyze:", error);

    const errorString = error instanceof Error ? error.message : String(error);

    // Check for rate limit error (429)
    if (errorString.includes("429") || errorString.includes("Too Many Requests") || errorString.includes("quota")) {
      // Try to extract retry time from error message
      const retryMatch = errorString.match(/retry in (\d+\.?\d*)/i);
      const retrySeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;

      return NextResponse.json({
        error: "rate_limit",
        retryAfter: retrySeconds,
      }, { status: 429 });
    }

    return NextResponse.json({
      error: "general",
    }, { status: 500 });
  }
}
