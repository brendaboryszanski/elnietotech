"use client";

import { useState, useEffect } from "react";
import ConversationView from "@/components/ConversationView";
import type { ConversationMessage } from "@/types";

// User-facing messages in Spanish
const USER_MESSAGES = {
  rateLimitError: "El servicio está muy ocupado en este momento.",
  generalError: "No se pudo procesar tu mensaje. Por favor, intentá de nuevo.",
  connectionError: "No se pudo conectar. Revisá tu conexión a internet.",
  retryCountdown: (seconds: number) => `Podés volver a intentar en ${seconds} segundos`,
  close: "Cerrar",
};

interface ErrorState {
  message: string;
  retryAfter?: number;
}

export default function Home() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [needsImage, setNeedsImage] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for rate limit cooldown
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendMessage = async (message: string, image?: string) => {
    // Prevent sending while in cooldown
    if (countdown > 0) return;

    const userMessage: ConversationMessage = {
      role: "user",
      content: message,
      image,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
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

      const result = await response.json();

      if (!response.ok) {
        // Handle rate limit error
        if (response.status === 429 && result.retryAfter) {
          setError({
            message: USER_MESSAGES.rateLimitError,
            retryAfter: result.retryAfter,
          });
          setCountdown(result.retryAfter);
          setMessages((prev) => prev.slice(0, -1));
          return;
        }

        // Handle other API errors
        setError({
          message: USER_MESSAGES.generalError,
        });
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      const aiMessage: ConversationMessage = {
        role: "assistant",
        content: result.reply,
        icons: result.icons,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setNeedsImage(result.needsImage || false);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError({
        message: USER_MESSAGES.connectionError,
      });
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
        <div className="fixed bottom-20 left-4 right-4 sm:bottom-24 sm:left-6 sm:right-6 bg-red-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-lg text-center z-50">
          <p className="text-base sm:text-lg">{error.message}</p>
          {countdown > 0 && (
            <p className="text-sm sm:text-base mt-1 opacity-90">
              {USER_MESSAGES.retryCountdown(countdown)}
            </p>
          )}
          {!countdown && (
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm underline opacity-80 hover:opacity-100"
            >
              {USER_MESSAGES.close}
            </button>
          )}
        </div>
      )}
    </>
  );
}
