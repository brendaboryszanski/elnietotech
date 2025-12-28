export interface AnalysisRequest {
  message: string;
  image?: string;
  conversationHistory: ConversationMessage[];
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  image?: string;
  icons?: string[];
  timestamp: number;
}

export interface AnalysisResponse {
  reply: string;
  needsImage?: boolean;
  isSolution?: boolean;
  solution?: string[];
  icons?: string[];
}
