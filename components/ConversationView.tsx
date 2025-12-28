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

// Dark overlay that dims everything except the highlighted element
function TutorialOverlay() {
  return (
    <div className="fixed inset-0 bg-black/60 z-40 pointer-events-none" />
  );
}

// Tooltip with arrow pointing to element
function TooltipWithArrow({ 
  text, 
  onNext, 
  onSkip
}: { 
  text: string; 
  onNext: () => void; 
  onSkip: () => void;
}) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64">
      <div className="bg-primary-600 text-white px-4 py-3 rounded-xl shadow-2xl relative">
        <p className="text-base font-medium text-center mb-3">{text}</p>
        <div className="flex gap-2 justify-center items-center">
          <button 
            onClick={onSkip} 
            className="text-sm text-white/80 hover:text-white underline"
          >
            Saltar
          </button>
          <button 
            onClick={onNext} 
            className="bg-white text-primary-600 px-4 py-2 rounded-lg font-bold text-base"
          >
            OK ✓
          </button>
        </div>
        {/* Arrow pointing down */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-primary-600" />
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
const TUTORIAL_KEY = "elnietotech_tutorial_v4";

type TutorialStep = "welcome" | "photo" | "speak" | "input" | "listen" | "done";

// Welcome overlay for first-time users
function WelcomeOverlay({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center">
        <div className="text-6xl mb-4">🤗</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Hola!</h2>
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          Sé que la tecnología a veces es difícil. Acá me mandó alguien que te quiere para ayudarte cuando no puede.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onStart}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-xl font-bold text-xl w-full shadow-lg"
          >
            ¡Empezar! 👍
          </button>
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-base underline py-2"
          >
            Ya sé cómo funciona
          </button>
        </div>
      </div>
    </div>
  );
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
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>("done");
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ReturnType<typeof getSpeechRecognition>>(null);

  // Check for first visit and show welcome
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem(TUTORIAL_KEY);
      if (!seen) {
        setHasSeenTutorial(false);
        setTutorialStep("welcome");
      }
    }
  }, []);

  // Start input tutorial when conversation begins (first message sent)
  useEffect(() => {
    if (messages.length === 1 && !hasSeenTutorial && tutorialStep === "done") {
      // User dismissed welcome but hasn't seen full tutorial - show input buttons tutorial
      setTimeout(() => setTutorialStep("photo"), 300);
    }
  }, [messages.length, hasSeenTutorial, tutorialStep]);

  // Show "listen" tutorial on first AI response
  useEffect(() => {
    if (messages.length === 2 && tutorialStep === "done" && !hasSeenTutorial) {
      setTimeout(() => setTutorialStep("listen"), 300);
    }
  }, [messages.length, tutorialStep, hasSeenTutorial]);

  const advanceTutorial = () => {
    if (tutorialStep === "welcome") {
      // After welcome, wait for user to select a device
      setTutorialStep("done");
    } else if (tutorialStep === "photo") {
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

  const startFromWelcome = () => {
    // Just dismiss welcome, tutorial will continue after first message
    setTutorialStep("done");
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

  const isTutorialActive = tutorialStep !== "done" && tutorialStep !== "welcome";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-orange-50 to-green-50">
      {/* Welcome overlay for first-time users */}
      {tutorialStep === "welcome" && (
        <WelcomeOverlay onStart={startFromWelcome} onSkip={skipTutorial} />
      )}

      {/* Dark overlay during tutorial (not for welcome) */}
      {isTutorialActive && <TutorialOverlay />}

      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-4 shadow-lg">
        <h1 className="text-2xl font-bold text-center">
          🤗 El Nieto Tech
        </h1>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 max-w-2xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center">
              <p className="text-xl text-gray-700 mb-4 font-medium">
                ¿En qué te puedo ayudar?
              </p>

              <div className="space-y-3">
                {[
                  { icon: "📱", text: "Celular" },
                  { icon: "💻", text: "Computadora" },
                  { icon: "📺", text: "Televisor" },
                  { icon: "❓", text: "Otro aparato" },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickOption(`Tengo un problema con ${item.text === "Otro aparato" ? "otro aparato" : "el " + item.text.toLowerCase()}`)}
                    className="w-full bg-orange-50 hover:bg-orange-100 active:bg-orange-200 border-2 border-orange-200 hover:border-orange-300 active:border-primary-400 rounded-xl px-5 py-4 flex items-center gap-3 transition-all shadow-md"
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-xl font-medium text-gray-700">{item.text}</span>
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
                className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-sm ${
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
                    className="mt-3 rounded-xl max-w-full"
                  />
                )}

                {msg.icons && msg.icons.length > 0 && (
                  <IconDisplay iconKeys={msg.icons} />
                )}

                {msg.role === "assistant" && (
                  <div className={`relative mt-3 inline-block ${tutorialStep === "listen" && index === 1 ? "z-50" : ""}`}>
                    <button
                      onClick={() => handlePlayMessage(msg.content, index)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold transition-colors border-2 ${
                        isSpeaking === index
                          ? "bg-primary-100 text-primary-700 border-primary-300"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300"
                      }`}
                    >
                      {isSpeaking === index ? "⏹️ Parar" : "🔊 Escuchar"}
                    </button>
                    {tutorialStep === "listen" && index === 1 && (
                      <TooltipWithArrow
                        text="Tocá para escuchar en voz alta"
                        onNext={advanceTutorial}
                        onSkip={skipTutorial}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start mb-3">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" />
                  <div className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      {messages.length > 0 && (
      <footer className="flex-shrink-0 bg-white border-t border-gray-200 p-3">
        <div className="max-w-2xl mx-auto">
          {needsImage && (
            <div className="mb-3 bg-yellow-50 border border-yellow-400 rounded-lg p-3 text-center">
              <p className="text-base font-medium">📸 Sacá una foto para que pueda ayudarte</p>
            </div>
          )}

          {isListening && (
            <div className="mb-3 bg-red-50 border border-red-400 rounded-lg p-3 text-center animate-pulse">
              <p className="text-base font-medium text-red-700">🎤 Hablá ahora...</p>
            </div>
          )}

          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img src={imagePreview} alt="Vista previa" className="max-h-24 rounded-lg" />
              <button
                onClick={() => setImagePreview("")}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg"
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

          {/* Row 1: Photo and Mic buttons */}
          <div className="flex gap-2 mb-2 relative">
            <div className={`relative flex-1 ${tutorialStep === "photo" ? "z-50" : ""}`}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-100 hover:bg-blue-200 active:bg-blue-300 border-2 border-blue-300 px-4 py-3 rounded-xl text-base font-medium flex items-center justify-center gap-2 transition-colors"
              >
                📷 Foto
              </button>
              {tutorialStep === "photo" && (
                <TooltipWithArrow
                  text="Tocá acá para sacar una foto"
                  onNext={advanceTutorial}
                  onSkip={skipTutorial}
                />
              )}
            </div>

            {speechSupported && (
              <div className={`relative flex-1 ${tutorialStep === "speak" ? "z-50" : ""}`}>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-full px-4 py-3 rounded-xl text-base font-medium flex items-center justify-center gap-2 transition-colors border-2 ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse border-red-500"
                      : "bg-green-100 hover:bg-green-200 active:bg-green-300 border-green-300"
                  }`}
                >
                  🎤 {isListening ? "Parar" : "Hablar"}
                </button>
                {tutorialStep === "speak" && (
                  <TooltipWithArrow
                    text="Tocá acá para hablar"
                    onNext={advanceTutorial}
                    onSkip={skipTutorial}
                  />
                )}
              </div>
            )}
          </div>

          {/* Row 2: Text input and send */}
          <div className={`relative ${tutorialStep === "input" ? "z-50" : ""}`}>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Escuchando..." : "Escribí acá..."}
                className="flex-1 min-w-0 px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:border-primary-500 focus:outline-none bg-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !imagePreview)}
                className={`px-5 py-3 rounded-xl text-lg font-bold transition-colors ${
                  isLoading || (!input.trim() && !imagePreview)
                    ? "bg-gray-200 text-gray-400"
                    : "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white"
                }`}
              >
                Enviar
              </button>
            </form>
            {tutorialStep === "input" && (
              <TooltipWithArrow
                text="O escribí tu mensaje acá"
                onNext={advanceTutorial}
                onSkip={skipTutorial}
              />
            )}
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
