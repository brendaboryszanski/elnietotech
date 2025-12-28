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

// Full screen overlay for tutorial
function TutorialOverlay({ 
  text, 
  onNext, 
  onSkip,
  stepNumber,
  totalSteps
}: { 
  text: string; 
  onNext: () => void; 
  onSkip: () => void;
  stepNumber: number;
  totalSteps: number;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="text-5xl mb-4">💡</div>
        <p className="text-xl font-medium text-gray-800 mb-2">{text}</p>
        <p className="text-sm text-gray-500 mb-5">Paso {stepNumber} de {totalSteps}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onNext}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-bold text-lg w-full"
          >
            Entendido ✓
          </button>
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-base underline"
          >
            Saltar tutorial
          </button>
        </div>
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
const TUTORIAL_KEY = "elnietotech_tutorial_v2";

type TutorialStep = "photo" | "speak" | "input" | "listen" | "done";

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
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>("done");
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ReturnType<typeof getSpeechRecognition>>(null);

  // Check for first visit
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem(TUTORIAL_KEY);
      if (!seen) {
        setHasSeenTutorial(false);
      }
    }
  }, []);

  // Start tutorial when conversation begins (first message sent)
  useEffect(() => {
    if (messages.length === 1 && !hasSeenTutorial) {
      // Small delay to let the UI render
      setTimeout(() => setTutorialStep("photo"), 500);
    }
  }, [messages.length, hasSeenTutorial]);

  // Show "listen" tutorial on first AI response
  useEffect(() => {
    if (messages.length === 2 && tutorialStep === "done" && !hasSeenTutorial) {
      setTimeout(() => setTutorialStep("listen"), 500);
    }
  }, [messages.length, tutorialStep, hasSeenTutorial]);

  const advanceTutorial = () => {
    if (tutorialStep === "photo") {
      setTutorialStep("speak");
    } else if (tutorialStep === "speak") {
      setTutorialStep("input");
    } else if (tutorialStep === "input") {
      setTutorialStep("done");
    } else if (tutorialStep === "listen") {
      setTutorialStep("done");
      localStorage.setItem(TUTORIAL_KEY, "true");
      setHasSeenTutorial(true);
    }
  };

  const skipTutorial = () => {
    setTutorialStep("done");
    localStorage.setItem(TUTORIAL_KEY, "true");
    setHasSeenTutorial(true);
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

  // Tutorial step messages
  const tutorialMessages: Record<TutorialStep, string> = {
    photo: "📷 Podés sacar una foto y mandármela para que te ayude mejor",
    speak: "🎤 Si no querés escribir, podés hablarme apretando este botón",
    input: "⌨️ También podés escribir tu mensaje acá y tocar Enviar",
    listen: "🔊 Tocá 'Escuchar' para que te lea mis respuestas en voz alta",
    done: "",
  };

  const tutorialStepNumber: Record<TutorialStep, number> = {
    photo: 1,
    speak: 2,
    input: 3,
    listen: 4,
    done: 0,
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-orange-50 to-green-50">
      {/* Tutorial Overlay */}
      {tutorialStep !== "done" && (
        <TutorialOverlay
          text={tutorialMessages[tutorialStep]}
          onNext={advanceTutorial}
          onSkip={skipTutorial}
          stepNumber={tutorialStepNumber[tutorialStep]}
          totalSteps={4}
        />
      )}

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
                    className="w-full bg-orange-50 hover:bg-orange-100 active:bg-orange-200 border-2 border-orange-200 hover:border-orange-300 active:border-primary-400 rounded-2xl px-6 py-5 flex items-center gap-4 transition-all shadow-md"
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
                    className={`mt-4 flex items-center gap-2 px-5 py-3 rounded-xl text-lg font-semibold transition-colors border-2 shadow-sm ${
                      isSpeaking === index
                        ? "bg-primary-100 text-primary-700 border-primary-300"
                        : "bg-purple-100 text-purple-700 hover:bg-purple-200 active:bg-purple-300 border-purple-300"
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

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Action buttons row - on top */}
          <div className="flex gap-3 justify-center mb-3">
            {/* Camera button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-100 hover:bg-blue-200 active:bg-blue-300 border-2 border-blue-300 px-6 py-3 rounded-xl text-lg flex items-center gap-2 transition-colors shadow-md"
              aria-label="Agregar foto"
            >
              📷 Enviar una foto
            </button>

            {/* Microphone button */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`px-6 py-3 rounded-xl text-lg flex items-center gap-2 transition-colors shadow-md border-2 ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse border-red-500"
                    : "bg-green-100 hover:bg-green-200 active:bg-green-300 border-green-300"
                }`}
                aria-label={isListening ? "Parar" : "Hablar"}
              >
                🎤 {isListening ? "Parar" : "Hablar"}
              </button>
            )}
          </div>

          {/* Input row - below */}
          <div className="relative">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Escuchando..." : "Escribí acá..."}
                className="flex-1 min-w-0 px-4 py-4 border-2 border-gray-300 rounded-2xl text-lg focus:border-primary-500 focus:outline-none"
                disabled={isLoading}
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !imagePreview)}
                className={`px-6 py-4 rounded-2xl text-lg font-bold flex items-center justify-center transition-colors flex-shrink-0 shadow-sm ${
                  isLoading || (!input.trim() && !imagePreview)
                    ? "bg-gray-200 text-gray-400"
                    : "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white"
                }`}
                aria-label="Enviar"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
