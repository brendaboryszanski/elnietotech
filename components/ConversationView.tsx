"use client";

import { useState, useRef, useEffect } from "react";
import { getTextToSpeech } from "@/lib/speech";
import type { ConversationMessage } from "@/types";

interface ConversationViewProps {
  messages: ConversationMessage[];
  onSendMessage: (message: string, image?: string) => void;
  isLoading: boolean;
  needsImage: boolean;
}

export default function ConversationView({
  messages,
  onSendMessage,
  isLoading,
  needsImage,
}: ConversationViewProps) {
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !imagePreview) return;

    onSendMessage(input.trim(), imagePreview);
    setInput("");
    setImagePreview("");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, seleccioná una imagen válida");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePlayMessage = (text: string, index: number) => {
    const tts = getTextToSpeech();
    if (isSpeaking === index) {
      tts.stop();
      setIsSpeaking(null);
    } else {
      setIsSpeaking(index);
      tts.speak(text, () => setIsSpeaking(null));
    }
  };

  const handleQuickOption = (text: string) => {
    onSendMessage(text);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-orange-50 to-green-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-4 shadow-lg">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
          🤗 El Nieto Tech
        </h1>
      </header>

      {/* Messages Area - scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-3 py-4 sm:px-4 sm:py-6 max-w-2xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center">
              <p className="text-xl sm:text-2xl text-gray-700 mb-4 sm:mb-6">
                ¿En qué te puedo ayudar?
              </p>

              <div className="space-y-2 sm:space-y-3">
                {[
                  { icon: "📱", text: "Celular" },
                  { icon: "💻", text: "Computadora" },
                  { icon: "📺", text: "Televisor" },
                  { icon: "❓", text: "Otro aparato" },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickOption(`Tengo un problema con ${item.text === "Otro aparato" ? "otro aparato" : "el " + item.text.toLowerCase()}`)}
                    className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 border-2 border-gray-200 hover:border-primary-300 rounded-xl px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 sm:gap-4 transition-all shadow-sm"
                  >
                    <span className="text-2xl sm:text-3xl">{item.icon}</span>
                    <span className="text-lg sm:text-xl font-medium text-gray-700">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary-500 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Imagen enviada"
                    className="mt-3 rounded-xl max-w-full"
                  />
                )}

                {msg.generatedImage && (
                  <div className="mt-3">
                    <img
                      src={msg.generatedImage}
                      alt="Imagen de referencia"
                      className="rounded-xl max-w-full border border-gray-200"
                    />
                  </div>
                )}

                {msg.role === "assistant" && (
                  <button
                    onClick={() => handlePlayMessage(msg.content, index)}
                    className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                      isSpeaking === index
                        ? "bg-primary-100 text-primary-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {isSpeaking === index ? "⏹️ Parar" : "🔊 Escuchar"}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start mb-3">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-shrink-0 bg-white border-t border-gray-200 p-3 sm:p-4">
        <div className="max-w-2xl mx-auto">
          {needsImage && (
            <div className="mb-2 sm:mb-3 bg-yellow-50 border border-yellow-300 rounded-lg p-2 sm:p-3 text-center">
              <p className="text-sm sm:text-base">📸 Sacá una foto para que pueda ayudarte</p>
            </div>
          )}

          {imagePreview && (
            <div className="mb-2 sm:mb-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Vista previa"
                className="max-h-20 sm:max-h-24 rounded-lg"
              />
              <button
                onClick={() => setImagePreview("")}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 p-3 rounded-lg text-xl sm:text-2xl transition-colors flex-shrink-0"
              aria-label="Agregar foto"
            >
              📷
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu mensaje..."
              className="flex-1 min-w-0 px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg text-base sm:text-lg focus:border-primary-400 focus:outline-none"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !imagePreview)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold transition-colors flex-shrink-0 ${
                isLoading || (!input.trim() && !imagePreview)
                  ? "bg-gray-200 text-gray-400"
                  : "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white"
              }`}
            >
              Enviar
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
