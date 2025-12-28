"use client";

import { useState, useRef, useEffect } from "react";
import { getTextToSpeech } from "@/lib/speech";
import { ICON_BANK } from "@/lib/iconBank";
import type { ConversationMessage } from "@/types";

// Component to render icons from the icon bank
function IconDisplay({ iconKeys }: { iconKeys: string[] }) {
  if (!iconKeys || iconKeys.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-4 p-4 bg-gray-50 rounded-xl">
      {iconKeys.map((key, i) => {
        const iconDef = ICON_BANK[key];
        if (!iconDef) return null;
        const IconComponent = iconDef.icon;
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm min-w-[80px]"
          >
            <IconComponent className="w-12 h-12 text-primary-600" strokeWidth={1.5} />
            <span className="text-sm text-gray-600 text-center font-medium">{iconDef.description}</span>
          </div>
        );
      })}
    </div>
  );
}

// Tutorial overlay for first-time users
function TutorialOverlay({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      emoji: "👋",
      title: "¡Bienvenido!",
      text: "Soy tu ayudante para resolver problemas con la tecnología.",
    },
    {
      emoji: "👆",
      title: "Elegí una opción",
      text: "Tocá el botón del aparato que te está dando problemas.",
    },
    {
      emoji: "🎤",
      title: "Podés hablar",
      text: "Tocá el micrófono para dictarme tu problema en vez de escribir.",
    },
    {
      emoji: "🔊",
      title: "Te leo las respuestas",
      text: "Tocá 'Escuchar' para que te lea en voz alta.",
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-6xl mb-4">{currentStep.emoji}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{currentStep.title}</h2>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">{currentStep.text}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === step ? "bg-primary-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            if (isLast) {
              onClose();
            } else {
              setStep(step + 1);
            }
          }}
          className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white text-xl font-bold py-4 px-8 rounded-2xl transition-colors"
        >
          {isLast ? "¡Empezar!" : "Siguiente →"}
        </button>

        {!isLast && (
          <button
            onClick={onClose}
            className="mt-4 text-gray-500 underline text-base"
          >
            Saltar tutorial
          </button>
        )}
      </div>
    </div>
  );
}

interface ConversationViewProps {
  messages: ConversationMessage[];
  onSendMessage: (message: string, image?: string) => void;
  isLoading: boolean;
  needsImage: boolean;
}

// Speech Recognition types for browser compatibility
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

// Check if speech recognition is available
const getSpeechRecognition = (): SpeechRecognitionInstance | null => {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
  return SpeechRecognition ? new SpeechRecognition() : null;
};

// Check if this is the first visit
const TUTORIAL_KEY = "elnietotech_tutorial_seen";

export default function ConversationView({
  messages,
  onSendMessage,
  isLoading,
  needsImage,
}: ConversationViewProps) {
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ReturnType<typeof getSpeechRecognition>>(null);

  // Check for first visit and show tutorial
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeenTutorial = localStorage.getItem(TUTORIAL_KEY);
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_KEY, "true");
  };

  // Check for speech recognition support on mount
  useEffect(() => {
    const recognition = getSpeechRecognition();
    if (recognition) {
      setSpeechSupported(true);
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "es-AR";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results;
        let transcript = "";
        for (let i = 0; i < results.length; i++) {
          transcript += results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !imagePreview) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

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

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-orange-50 to-green-50">
      {/* Tutorial overlay */}
      {showTutorial && <TutorialOverlay onClose={closeTutorial} />}

      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-5 shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">
          🤗 El Nieto Tech
        </h1>
      </header>

      {/* Messages Area - scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 max-w-2xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center">
              <p className="text-2xl text-gray-700 mb-6 font-medium">
                ¿En qué te puedo ayudar?
              </p>

              <div className="space-y-4">
                {[
                  { icon: "📱", text: "Celular" },
                  { icon: "💻", text: "Computadora" },
                  { icon: "📺", text: "Televisor" },
                  { icon: "❓", text: "Otro aparato" },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickOption(`Tengo un problema con ${item.text === "Otro aparato" ? "otro aparato" : "el " + item.text.toLowerCase()}`)}
                    className="w-full bg-white hover:bg-gray-50 active:bg-orange-50 border-2 border-gray-200 active:border-primary-400 rounded-2xl px-6 py-5 flex items-center gap-4 transition-all shadow-sm"
                  >
                    <span className="text-4xl">{item.icon}</span>
                    <span className="text-2xl font-medium text-gray-700">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl px-5 py-4 shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary-500 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Imagen enviada"
                    className="mt-4 rounded-xl max-w-full"
                  />
                )}

                {msg.icons && msg.icons.length > 0 && (
                  <IconDisplay iconKeys={msg.icons} />
                )}

                {msg.role === "assistant" && (
                  <button
                    onClick={() => handlePlayMessage(msg.content, index)}
                    className={`mt-4 flex items-center gap-2 px-5 py-3 rounded-xl text-lg font-semibold transition-colors ${
                      isSpeaking === index
                        ? "bg-primary-100 text-primary-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
                    }`}
                  >
                    {isSpeaking === index ? "⏹️ Parar" : "🔊 Escuchar"}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area - Only show after conversation starts */}
      {messages.length > 0 && (
      <footer className="flex-shrink-0 bg-white border-t-2 border-gray-200 p-4">
        <div className="max-w-2xl mx-auto">
          {needsImage && (
            <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 text-center">
              <p className="text-lg font-medium">📸 Sacá una foto para que pueda ayudarte</p>
            </div>
          )}

          {isListening && (
            <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-xl p-4 text-center animate-pulse">
              <p className="text-lg font-medium text-red-700">🎤 Hablá ahora...</p>
            </div>
          )}

          {imagePreview && (
            <div className="mb-4 relative inline-block">
              <img
                src={imagePreview}
                alt="Vista previa"
                className="max-h-28 rounded-xl"
              />
              <button
                onClick={() => setImagePreview("")}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-lg"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Camera button - larger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 w-16 h-16 rounded-2xl text-3xl flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
              aria-label="Agregar foto"
            >
              📷
            </button>

            {/* Microphone button - larger */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`w-16 h-16 rounded-2xl text-3xl flex items-center justify-center transition-colors flex-shrink-0 shadow-sm ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
                }`}
                aria-label={isListening ? "Parar" : "Hablar"}
              >
                🎤
              </button>
            )}

            {/* Text input - grows to fill */}
            <form onSubmit={handleSubmit} className="flex-1 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Escuchando..." : "Escribí acá..."}
                className="flex-1 min-w-0 px-4 py-4 border-2 border-gray-300 rounded-2xl text-lg focus:border-primary-500 focus:outline-none"
                disabled={isLoading}
              />

              {/* Send button - larger with icon */}
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !imagePreview)}
                className={`w-16 h-16 rounded-2xl text-2xl flex items-center justify-center transition-colors flex-shrink-0 shadow-sm ${
                  isLoading || (!input.trim() && !imagePreview)
                    ? "bg-gray-200 text-gray-400"
                    : "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white"
                }`}
                aria-label="Enviar"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
