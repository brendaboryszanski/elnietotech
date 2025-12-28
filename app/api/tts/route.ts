import { NextRequest, NextResponse } from "next/server";

// Google Cloud Text-to-Speech API endpoint
const TTS_API_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Call Google Cloud TTS API
    const response = await fetch(`${TTS_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: "es-US", // Latin American Spanish
          name: "es-US-Neural2-A", // High-quality neural voice (female)
          // Other options:
          // "es-US-Neural2-B" - male
          // "es-US-Neural2-C" - male
          // "es-US-Wavenet-A" - female wavenet
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.9, // Slightly slower for elderly users
          pitch: 0, // Natural pitch
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Google TTS API error:", response.status, errorData);
      
      // If it's an API error, return appropriate response
      if (response.status === 403) {
        return NextResponse.json(
          { error: "TTS API not enabled. Enable it at: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com" },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: "TTS API error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return the audio content (base64 encoded MP3)
    return NextResponse.json({
      audioContent: data.audioContent,
    });

  } catch (error) {
    console.error("Error in /api/tts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

