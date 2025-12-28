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

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error processing message";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
