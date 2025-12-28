"use client";

import { useState } from "react";
import ConversationView from "@/components/ConversationView";
import type { ConversationMessage, AnalysisResponse } from "@/types";

export default function Home() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [needsImage, setNeedsImage] = useState(false);
  const [error, setError] = useState("");

  const handleSendMessage = async (message: string, image?: string) => {
    // Add user message to conversation
    const userMessage: ConversationMessage = {
      role: "user",
      content: message,
      image,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError("");
    setNeedsImage(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          image,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Error processing message: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`
        );
      }

      const result = await response.json() as AnalysisResponse & { generatedImage?: string };

      // Add AI response to conversation
      const aiMessage: ConversationMessage = {
        role: "assistant",
        content: result.reply,
        generatedImage: result.generatedImage,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setNeedsImage(result.needsImage || false);
    } catch (err) {
      console.error("Error:", err);
      setError("No se pudo procesar tu mensaje. Por favor, intenta de nuevo.");

      // Remove the user message that failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ConversationView
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        needsImage={needsImage}
      />

      {error && (
        <div className="fixed bottom-6 left-6 right-6 bg-danger text-white px-6 py-4 rounded-lg shadow-lg text-center z-50">
          <p className="text-lg">{error}</p>
          <button onClick={() => setError("")} className="mt-2 underline">
            Cerrar
          </button>
        </div>
      )}
    </>
  );
}
