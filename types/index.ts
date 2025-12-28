export interface AnalysisRequest {
  message: string; // User's message
  image?: string; // Optional base64 image
  conversationHistory: ConversationMessage[];
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  image?: string; // Optional image for user messages
  generatedImage?: string; // AI-generated image to help explain
  timestamp: number;
}

export interface AnalysisResponse {
  reply: string; // AI's response
  needsImage?: boolean; // If AI needs a photo from user
  isSolution?: boolean; // If this is the final solution
  solution?: string[]; // Solution steps if isSolution is true
  generateImage?: string; // Description of image to generate for the user
}

