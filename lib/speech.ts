export class TextToSpeech {
  private synthesis: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private isPaused = false;
  private argentinianVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis;
      this.loadArgentinianVoice();
    }
  }

  private loadArgentinianVoice() {
    const findVoice = () => {
      const voices = this.synthesis?.getVoices() || [];

      // Priority order for Spanish voices (prefer Latin American/Argentinian)
      const preferredVoices = [
        "es-AR", // Argentinian Spanish
        "es-419", // Latin American Spanish
        "es-MX", // Mexican Spanish (closer to Latin American)
        "es-US", // US Spanish
      ];

      for (const lang of preferredVoices) {
        const voice = voices.find((v) => v.lang.startsWith(lang));
        if (voice) {
          this.argentinianVoice = voice;
          return;
        }
      }

      // Fallback: any Spanish voice that is NOT es-ES (Spain)
      const latinVoice = voices.find(
        (v) => v.lang.startsWith("es") && !v.lang.startsWith("es-ES")
      );
      if (latinVoice) {
        this.argentinianVoice = latinVoice;
      }
    };

    // Voices may load asynchronously
    if (this.synthesis?.getVoices().length) {
      findVoice();
    } else {
      this.synthesis?.addEventListener("voiceschanged", findVoice);
    }
  }

  isAvailable(): boolean {
    return this.synthesis !== null;
  }

  speak(text: string, onEnd?: () => void) {
    if (!this.synthesis) {
      console.warn("Text-to-speech not available");
      return;
    }

    // Cancel any previous speech
    this.stop();

    this.utterance = new SpeechSynthesisUtterance(text);

    // Use Argentinian/Latin American voice if available
    if (this.argentinianVoice) {
      this.utterance.voice = this.argentinianVoice;
      this.utterance.lang = this.argentinianVoice.lang;
    } else {
      this.utterance.lang = "es-AR";
    }

    this.utterance.rate = 0.8; // Reduced speed for elderly users
    this.utterance.pitch = 1;
    this.utterance.volume = 1;

    if (onEnd) {
      this.utterance.onend = onEnd;
    }

    this.synthesis.speak(this.utterance);
    this.isPaused = false;
  }

  speakSteps(problem: string, steps: string[], onEnd?: () => void) {
    if (!this.synthesis) {
      console.warn("Text-to-speech not available");
      return;
    }

    // Build full text with pauses
    let fullText = `El problema es: ${problem}. `;
    fullText += "Ahora le voy a explicar cómo solucionarlo. ";

    steps.forEach((step, index) => {
      // Clean "Paso X:" from the beginning if exists
      const cleanStep = step.replace(/^Paso \d+:\s*/i, "");
      fullText += `Paso ${index + 1}. ${cleanStep}. `;
      // Add pauses between steps
      if (index < steps.length - 1) {
        fullText += "... "; // Natural pauses help comprehension
      }
    });

    this.speak(fullText, onEnd);
  }

  pause() {
    if (this.synthesis && !this.isPaused) {
      this.synthesis.pause();
      this.isPaused = true;
    }
  }

  resume() {
    if (this.synthesis && this.isPaused) {
      this.synthesis.resume();
      this.isPaused = false;
    }
  }

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isPaused = false;
    }
  }

  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }
}

// Singleton instance
let ttsInstance: TextToSpeech | null = null;

export function getTextToSpeech(): TextToSpeech {
  if (!ttsInstance) {
    ttsInstance = new TextToSpeech();
  }
  return ttsInstance;
}
