import { NextRequest, NextResponse } from "next/server";
import { analyzeConversation } from "@/lib/ai";
import type { AnalysisRequest } from "@/types";

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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/analyze:", error);

    // Build error string from all possible sources
    const errorMessage = error instanceof Error ? error.message : "";
    const errorStatus = (error as { status?: number })?.status;
    const errorString = JSON.stringify(error) + " " + errorMessage;

    // Check for rate limit error (429)
    const isRateLimitError =
      errorStatus === 429 ||
      errorMessage.includes("429") ||
      errorMessage.includes("Too Many Requests") ||
      errorMessage.includes("quota") ||
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      errorString.includes("rate");

    if (isRateLimitError) {
      // Try to extract retry time from error message
      const retryMatch = errorMessage.match(/retry in (\d+\.?\d*)/i);
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
