import { CharacterType, LiveSessionManager } from "./liveService";
import { playPCM, stopPCM } from "../utils/audioUtils";

export interface VoiceOptions {
  character?: CharacterType;
  rate?: number;
  pitch?: number;
  apiKey?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export interface SpeechRecognitionCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
  onStart?: () => void;
  lang?: string;
}

class VoiceService {
  private activeAudioSource: AudioBufferSourceNode | null = null;
  private isCurrentlySpeaking = false;
  private recognitionInstance: any = null;
  private currentPlaybackRate = 1.04;
  private isVoicePersonaEnabled = true;
  private isStoppingRecognition = false;
  private currentSessionId = 0;
  private activeEndCallback: (() => void) | null = null;

  private splitIntoSentences(text: string): string[] {
    if (!text) return [];
    const matches = text.match(/[^.!?।?;]+[.!?।?;]*|\s*$/g);
    if (!matches) return [text];
    return matches
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  private chunkTextIntoGroups(text: string): string[] {
    const sentences = this.splitIntoSentences(text);
    const chunks: string[] = [];
    let currentChunk = "";

    for (let sentence of sentences) {
      sentence = sentence.trim();
      if (!sentence) continue;

      if (currentChunk && (currentChunk + " " + sentence).length > 190) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk = currentChunk ? currentChunk + " " + sentence : sentence;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    return chunks;
  }

  constructor() {
    if (typeof window !== "undefined") {
      const savedRate = localStorage.getItem("pref_voice_rate");
      if (savedRate) {
        this.currentPlaybackRate = parseFloat(savedRate) || 1.04;
      }
      this.isVoicePersonaEnabled = localStorage.getItem("pref_voice_persona") !== "false";
    }
  }

  public isVoicePersonaActive(): boolean {
    return this.isVoicePersonaEnabled;
  }

  public setVoicePersonaEnabled(enabled: boolean) {
    this.isVoicePersonaEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("pref_voice_persona", enabled.toString());
    }
  }

  public getPlaybackRate(): number {
    return this.currentPlaybackRate;
  }

  public setPlaybackRate(rate: number) {
    this.currentPlaybackRate = rate;
    if (typeof window !== "undefined") {
      localStorage.setItem("pref_voice_rate", rate.toString());
    }
  }

  private getRateForSentiment(text: string): number {
    if (!this.isVoicePersonaEnabled) return this.currentPlaybackRate;
    if (text.includes("[SAD]")) return 0.9;
    if (text.includes("[HAPPY]")) return 1.12;
    return this.currentPlaybackRate;
  }

  public cleanTextForSpeech(raw: string): string {
    if (!raw) return "";
    let clean = raw
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/\$\$[\s\S]*?\$\$/g, " গাণিতিক সমীকরণ ")
      .replace(/\$[^$]*\$/g, " সমীকরণ ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

    clean = clean.replace(/<([^>]+)>/g, (match, tagName) => {
      const tag = tagName.trim().toLowerCase();
      if (
        ["laugh", "gasp", "breath", "cough", "sigh", "giggle", "yawn", "sob", "snicker", "hmm", "ha"].includes(tag)
      ) {
        return `<${tag}>`;
      }
      return " ";
    });

    clean = clean
      .replace(/[*#_~]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[•\-\–\—]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return clean;
  }

  public async speak(text: string, options: VoiceOptions = {}): Promise<void> {
    this.stop();

    const session = ++this.currentSessionId;
    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) return;

    this.isCurrentlySpeaking = true;
    this.activeEndCallback = options.onEnd || null;
    options.onStart?.();

    const chunks = this.chunkTextIntoGroups(cleaned);
    if (chunks.length === 0) {
      this.isCurrentlySpeaking = false;
      this.activeEndCallback = null;
      options.onEnd?.();
      return;
    }

    this.speakQueue(session, chunks, 0, options, null);
  }

  private selectBestNaturalVoice(
    voices: SpeechSynthesisVoice[],
    hasBengali: boolean,
    isFemaleCharacter: boolean
  ): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    if (hasBengali) {
      const bnVoices = voices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith("bn") ||
          v.name.toLowerCase().includes("bengali") ||
          v.name.toLowerCase().includes("bangla")
      );
      if (bnVoices.length > 0) {
        if (isFemaleCharacter) {
          const fem = bnVoices.find((v) => /tanishaa|female|google|natural|nabanita/i.test(v.name));
          if (fem) return fem;
        } else {
          const male = bnVoices.find((v) => /bashkar|pradeep|male|natural/i.test(v.name));
          if (male) return male;
        }
        return bnVoices[0];
      }
    }

    // Natural Indian/Global English fallback
    const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
    if (enVoices.length > 0) {
      if (isFemaleCharacter) {
        const femEn = enVoices.find((v) => /neerja|heera|google.*female|aria|jenny|natural|samantha/i.test(v.name));
        if (femEn) return femEn;
      } else {
        const maleEn = enVoices.find((v) => /prabhat|ravi|guy|christopher|google.*male|natural/i.test(v.name));
        if (maleEn) return maleEn;
      }
      const inVoice = enVoices.find((v) => v.lang.toLowerCase().includes("in"));
      if (inVoice) return inVoice;
      return enVoices[0];
    }

    return voices[0];
  }

  private async speakQueue(
    sessionId: number,
    chunks: string[],
    index: number,
    options: VoiceOptions,
    preFetchedAudio: string | null = null
  ): Promise<void> {
    if (sessionId !== this.currentSessionId) return;
    if (index >= chunks.length) {
      this.isCurrentlySpeaking = false;
      this.activeEndCallback = null;
      options.onEnd?.();
      return;
    }

    const currentText = chunks[index];
    let audioBase64 = preFetchedAudio;

    const effectiveApiKey =
      options.apiKey ||
      (typeof window !== "undefined"
        ? localStorage.getItem("gemini_api_key") ||
          localStorage.getItem("custom_gemini_api_key") ||
          localStorage.getItem("ss-gemini-key") ||
          ""
        : "");

    const charId = options.character || (typeof window !== "undefined" ? (localStorage.getItem("pref_voice_character") as CharacterType) : undefined) || "anjali";

    if (!audioBase64) {
      try {
        const res = await fetch("/api/ai/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: currentText,
            character: charId,
            apiKey: effectiveApiKey || undefined,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.audioBase64) {
            audioBase64 = data.audioBase64;
          }
        }
      } catch (err) {
        console.warn("[VoiceService] Chunk synthesis fallback to natural Web Speech");
      }
    }

    if (sessionId !== this.currentSessionId) return;

    let nextFetchPromise: Promise<string | null> | null = null;
    if (index + 1 < chunks.length) {
      const nextText = chunks[index + 1];
      nextFetchPromise = (async () => {
        try {
          const res = await fetch("/api/ai/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: nextText,
              character: charId,
              apiKey: effectiveApiKey || undefined,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.audioBase64) {
              return data.audioBase64;
            }
          }
        } catch {}
        return null;
      })();
    }

    if (audioBase64) {
      try {
        const rate = options.rate || this.getRateForSentiment(currentText);
        await playPCM(audioBase64, rate);
      } catch (playErr) {
        console.error("[VoiceService] playPCM error:", playErr);
      }
    } else {
      await new Promise<void>((resolve) => {
        if (sessionId !== this.currentSessionId) {
          resolve();
          return;
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(currentText);
          const isFemale = ["anjali", "mahi", "zoya", "ishani"].includes(charId);
          const hasBengali = /[\u0980-\u09FF]/.test(currentText);

          // Natural conversational cadence & pitch (never robotic)
          utterance.rate = Math.max(0.88, Math.min(1.25, (options.rate || this.currentPlaybackRate) * 0.98));
          utterance.pitch =
            options.pitch ||
            (charId === "mahi"
              ? 1.12
              : charId === "anjali"
              ? 1.08
              : charId === "rohan"
              ? 1.02
              : charId === "stranger"
              ? 0.96
              : 1.0);

          const voices = window.speechSynthesis.getVoices();
          const chosenVoice = this.selectBestNaturalVoice(voices, hasBengali, isFemale);
          if (chosenVoice) {
            utterance.voice = chosenVoice;
            utterance.lang = chosenVoice.lang;
          } else {
            utterance.lang = hasBengali ? "bn-IN" : "en-IN";
          }

          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        } else {
          resolve();
        }
      });
    }

    if (sessionId !== this.currentSessionId) return;

    const nextAudio = nextFetchPromise ? await nextFetchPromise : null;
    this.speakQueue(sessionId, chunks, index + 1, options, nextAudio);
  }

  /**
   * Immediately stops ALL active TTS, PCM streams, SpeechRecognition, and LiveSessionManager sessions.
   */
  public stop(): void {
    this.currentSessionId++;
    this.isCurrentlySpeaking = false;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    stopPCM();

    if (this.activeAudioSource) {
      try {
        this.activeAudioSource.stop();
      } catch {}
      this.activeAudioSource = null;
    }

    this.stopRecognition();

    try {
      LiveSessionManager.stopAll();
    } catch {}

    if (this.activeEndCallback) {
      const cb = this.activeEndCallback;
      this.activeEndCallback = null;
      try {
        cb();
      } catch {}
    }
  }

  public isSpeaking(): boolean {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      return this.isCurrentlySpeaking || window.speechSynthesis.speaking;
    }
    return this.isCurrentlySpeaking;
  }

  public isRecognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public startRecognition(callbacks: SpeechRecognitionCallbacks): () => void {
    if (!this.isRecognitionSupported()) {
      callbacks.onError?.(new Error("Speech recognition not supported on this browser."));
      return () => {};
    }

    this.stopRecognition();
    this.isStoppingRecognition = false;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    this.recognitionInstance = recognition;

    const prefLang = typeof window !== "undefined" ? localStorage.getItem("pref_app_language") : null;
    recognition.lang =
      callbacks.lang ||
      (prefLang === "en" ? "en-IN" : "bn-IN");
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      callbacks.onStart?.();
    };

    recognition.onresult = (event: any) => {
      if (this.isStoppingRecognition) return;
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        callbacks.onResult(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        callbacks.onResult(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        callbacks.onError?.(event);
      }
    };

    recognition.onend = () => {
      if (!this.isStoppingRecognition && this.recognitionInstance === recognition) {
        try {
          recognition.start();
          return;
        } catch {}
      }
      if (this.recognitionInstance === recognition) {
        this.recognitionInstance = null;
      }
      callbacks.onEnd?.();
    };

    try {
      recognition.start();
    } catch (startErr) {
      console.warn("[VoiceService] Error starting recognition:", startErr);
    }

    return () => {
      this.stopRecognition();
    };
  }

  public stopRecognition(): void {
    this.isStoppingRecognition = true;
    if (this.recognitionInstance) {
      const inst = this.recognitionInstance;
      this.recognitionInstance = null;
      try {
        inst.abort?.();
      } catch {}
      try {
        inst.stop?.();
      } catch {}
    }
  }
}

export const voiceService = new VoiceService();
