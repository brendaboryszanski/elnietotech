export class TextToSpeech {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private fallbackSynthesis: SpeechSynthesis | null = null;
  private fallbackVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      // Setup fallback browser TTS
      if ("speechSynthesis" in window) {
        this.fallbackSynthesis = window.speechSynthesis;
        this.loadFallbackVoice();
      }
    }
  }

  private loadFallbackVoice() {
    const findVoice = () => {
      const voices = this.fallbackSynthesis?.getVoices() || [];
      const preferredLangs = ["es-AR", "es-419", "es-MX", "es-US"];
      
      for (const lang of preferredLangs) {
        const voice = voices.find((v) => v.lang === lang);
        if (voice) {
          this.fallbackVoice = voice;
          return;
        }
      }
      
      // Fallback to any Spanish voice
      const spanishVoice = voices.find((v) => v.lang.startsWith("es"));
      if (spanishVoice) {
        this.fallbackVoice = spanishVoice;
      }
    };

    if (this.fallbackSynthesis?.getVoices().length) {
      findVoice();
    } else {
      this.fallbackSynthesis?.addEventListener("voiceschanged", findVoice);
    }
  }

  isAvailable(): boolean {
    return typeof window !== "undefined";
  }

  async speak(text: string, onEnd?: () => void) {
    // Stop any current audio
    this.stop();

    try {
      // Try Google Cloud TTS first
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Convert base64 to audio
        const audioData = `data:audio/mp3;base64,${data.audioContent}`;
        this.audio = new Audio(audioData);
        this.isPlaying = true;

        this.audio.onended = () => {
          this.isPlaying = false;
          onEnd?.();
        };

        this.audio.onerror = () => {
          console.error("Audio playback error, falling back to browser TTS");
          this.isPlaying = false;
          this.speakWithBrowserTTS(text, onEnd);
        };

        await this.audio.play();
        return;
      }

      // If API fails, fallback to browser TTS
      console.warn("Cloud TTS failed, using browser fallback");
      this.speakWithBrowserTTS(text, onEnd);

    } catch (error) {
      console.error("TTS error:", error);
      // Fallback to browser TTS
      this.speakWithBrowserTTS(text, onEnd);
    }
  }

  private speakWithBrowserTTS(text: string, onEnd?: () => void) {
    if (!this.fallbackSynthesis) {
      console.warn("No TTS available");
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.fallbackVoice) {
      utterance.voice = this.fallbackVoice;
      utterance.lang = this.fallbackVoice.lang;
    } else {
      utterance.lang = "es-AR";
    }

    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.fallbackSynthesis.speak(utterance);
  }

  stop() {
    // Stop cloud audio
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    this.isPlaying = false;

    // Stop browser TTS
    if (this.fallbackSynthesis) {
      this.fallbackSynthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.isPlaying || (this.fallbackSynthesis?.speaking ?? false);
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
