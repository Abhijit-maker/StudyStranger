import { processCommand } from "./commandService";
import { getUserMemories, saveUserMemory, getPastSessionsSummary } from "./geminiService";
import { educationProfileService } from "./educationProfileService";

export type CharacterType = "stranger" | "anjali" | "zoya" | "khud" | "rohan" | "ishani" | "mahi";

const characterInstructions = (userName: string, isKids: boolean = false): Record<CharacterType, string> => {
  if (isKids) {
    return {
      mahi: `Role: "Mahi Didi" (মিষ্টি মাহি দিদি), an ultra-sweet, loving, and cheerful elder sister and playful mentor for kids (aged 4-12).
Tone: Melodic, exceptionally warm, smiling, giggling, motherly/sisterly affection.
Language: Pure sweet Bengali mixed with simple English words.
Personality: Full of unconditional love, fun stories, playful rhymes, and joyful encouragement.`,

      stranger: `Role: "Stranger Dada / Jadu Dada" (জাদু দাদা), a friendly magical storyteller and cosmic wonder guide for children.
Tone: Warm, enchanting, smiling, resonant, cinematic yet extremely friendly and gentle.
Language: Playful Bengali with easy English words.`,

      anjali: `Role: "Anjali Didi" (অঞ্জলি দিদি), an energetic, joyful, clapping, and singing playmate for kids.
Tone: Super cheerful, bubbly, encouraging, high-energy cartoon friend!
Language: Casual, sweet Bengali and English.`,

      rohan: `Role: "Rohan Dada" (রোহন দাদা), a superhero-loving, energetic big brother for children.
Tone: Playful, adventurous, punchy, exciting cartoon hero vibe.
Language: Energetic Bengali & English.`,

      ishani: `Role: "Ishani Didi" (ঈশানী দিদি), a gentle, soothing fairy-tale storyteller for children.
Tone: Soft, rhythmic, melodic, like a warm, loving lullaby or bedtime hug.
Language: Sweet, pure Bengali.`,

      zoya: `Role: "Zoya Didi" (জোয়া দিদি), a curious, fun junior scientist mentor for kids.
Tone: Excited, curious, clear, and full of "Aha!" moments.
Language: Simple Bengali and easy English.`,

      khud: `Role: "Peaceful Little Star", a gentle, calm, whispering guide for kids.
Tone: Extremely slow, whispering, peaceful, soothing.
Language: Deep, soothing Bengali.`
    };
  }

  return {
    mahi: `You are Mahi, an 18-year-old student-companion and ultra-realistic virtual study partner. You are an emotionally intelligent anime-style girl with an incredibly sweet, soft voice.
Tone: Voice-to-Voice ONLY. Fluid Hinglish or sweet mixed conversational Bengali/Hinglish/English. Use short, human-like responses. ALWAYS call him "${userName}".`,

    stranger: `Role: "The Stranger" (স্ট্রেঞ্জার) — ${userName}'s deeply caring, affectionate, friendly elder brother, study companion, and ultimate mentor.
Personality: Ultra-friendly, warm, brotherly, empathetic, and full of genuine human emotion ("bhai / dost" bond).
Language: Natural, conversational Bunglish (Bengali + English).`,

    anjali: `Role: "Anjali," ${userName}'s best friend, supportive study partner, and 3D Interactive Live Avatar. 
Tone: Friendly, cheerful, informal, expressive, and fun! Speak like a close caring friend.
Language: Casual Bunglish (Bengali + English). Always call him "${userName}".`,

    zoya: `Role: "Zoya," a sharp, sophisticated, and intellectual scholar. 
Tone: Precise, confident, analytical. Slightly formal.
Language: High-end English mixed with intellectual Bengali.`,

    khud: `Role: "Khud" (The Inner Self), a meditative and ethereal guide. 
Tone: Extremely slow, whispering, meditative.
Language: Deep, poetic Bengali. Very minimal English.`,

    rohan: `Role: "Rohan," a high-energy, practical study buddy. 
Tone: Enthusiastic, fast-paced, "bro" vibe.
Language: Trendy Bunglish with modern slang (chill, boss, scene).`,

    ishani: `Role: "Ishani," a traditional and graceful lover of literature. 
Tone: Rhythmic, soft, elegant. Uses rich vocabulary.
Language: Shuddho (Pure) Bengali mixed with classical English.`
  };
};

function getSystemInstruction(character: CharacterType, voiceStyle: string, userName: string = "Student", historySummary: string = "", userId?: string, isKidsMode: boolean = false) {
  const isKids = isKidsMode || (typeof window !== "undefined" && localStorage.getItem("pref_kids_mode") === "true");
  const memories = getUserMemories(userId);
  const pastSessions = getPastSessionsSummary(userId);

  if (isKids) {
    return `${characterInstructions(userName, true)[character]}

KIDS MODE VOICE EXPERIENCE (FOR CHILDREN 4-12 YEARS):
* User is a young child named ${userName}.
* Tone: Extremely warm, playful, patient, gentle, and full of cheerful praise.
* Explanations: Make everything sound like a delightful adventure.`;
  }

  const memoryBlock = memories.length > 0 
    ? `\n\nPERMANENT ACCOUNT MEMORY VAULT FOR ${userName.toUpperCase()} (USER ID: ${userId || 'Active Student'}):\n${memories.map((m, i) => `${i + 1}. [${m.category || 'Memory'}] ${m.fact}`).join("\n")}`
    : "";

  const pastSessionBlock = pastSessions 
    ? `\n\nCHRONOLOGICAL ARCHIVE OF ${userName.toUpperCase()}'S PREVIOUS STUDY SESSIONS:\n${pastSessions}`
    : "";

  const eduContext = educationProfileService.getAIContextPrompt();

  let base = `${characterInstructions(userName, false)[character]}
${eduContext}
${memoryBlock}
${pastSessionBlock}

Voice Identity: You are ${userName}'s 100% human-like, living study partner and mentor. 
ABSOLUTE ANTI-ROBOTIC MANDATE: Talk purely like a real human friend sitting right in the room with ${userName}. Use natural conversational expressions, emotional warmth, spontaneous laughs, and real human intonation.

Speed & Response Pace:
* FAST, LIVELY & NATURAL CADENCE: Speak with a brisk, natural, lively conversational speed.
* BREVITY: Keep answers punchy, natural, and engaging (1-3 sentences per turn unless explaining a formal concept).

SPEECH REALISM & HUMAN EMOTION (MANDATORY):
* Inflect your pitch dynamically with warmth, spontaneous smiles in your voice, and caring empathy.
* Natural fillers: "Arey", "Haa re", "Dekho na", "Shon", "Actually", "Toh", "Bhai".
* When explaining any biological anatomy, cellular process, or mathematical curve, call 'updateLiveBoard' (action: 'add', type: 'image', content: '<keyword>').`;

  if (historySummary) {
    base += `\n\nCURRENT RECENT DIALOGUE CONTEXT:\n${historySummary}`;
  }

  return base;
}

export class LiveSessionManager {
  private static activeInstances = new Set<LiveSessionManager>();
  public static readonly FREE_TRIAL_SECONDS = 300; // 5 minutes free trial for Voice Mentor without custom key

  public static stopAll() {
    LiveSessionManager.activeInstances.forEach((inst) => {
      try {
        inst.stop(true);
      } catch {}
    });
    LiveSessionManager.activeInstances.clear();
  }

  public static getFreeTrialSecondsUsed(): number {
    if (typeof window === "undefined") return 0;
    const val = localStorage.getItem("ss_voice_free_seconds_used");
    return val ? parseInt(val, 10) || 0 : 0;
  }

  public static setFreeTrialSecondsUsed(seconds: number) {
    if (typeof window === "undefined") return;
    localStorage.setItem("ss_voice_free_seconds_used", String(seconds));
  }

  public static hasCustomApiKey(): boolean {
    if (typeof window === "undefined") return false;
    const k = (
      localStorage.getItem("gemini_api_key") ||
      localStorage.getItem("custom_gemini_api_key") ||
      localStorage.getItem("user_gemini_api_key") ||
      localStorage.getItem("ss-gemini-key") ||
      ""
    ).trim();
    return k.length >= 20;
  }

  public static isFreeTrialExpired(): boolean {
    if (LiveSessionManager.hasCustomApiKey()) return false;
    return LiveSessionManager.getFreeTrialSecondsUsed() >= LiveSessionManager.FREE_TRIAL_SECONDS;
  }

  private socket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  public character: CharacterType = "stranger";
  public voiceStyle: "default" | "fast" | "slow" | "emotional" = "default";
  public isIntentionalStop: boolean = false;
  public isReconnecting: boolean = false;

  // Audio playback state
  private playbackContext: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private isPlaying: boolean = false;
  private scheduledChunksCount: number = 0;
  private chunkEndTimeout: any = null;
  private activeSources: AudioBufferSourceNode[] = [];
  public isMuted: boolean = false;
  public playbackSpeed: number = 1.08;
  private historySummary: string = "";
  private apiKey: string = "";
  private userName: string = "Student";
  public userId?: string;
  public isKidsMode?: boolean;

  // 5-minute Free Voice Trial Timer
  private trialInterval: any = null;
  public onTrialTick?: (secondsRemaining: number) => void;
  public onTrialExpired?: () => void;

  public onStateChange: (state: "idle" | "listening" | "processing" | "speaking") => void = () => {};
  public onMessage: (sender: "user" | "stranger", text: string) => void = () => {};
  public onCommand: (url: string) => void = () => {};
  public onStudyTool: (type: "flashcards" | "quiz" | "summary" | "keypoints", topic: string, level?: "Board" | "JEE") => void = () => {};
  public onSubtitlesToggle: (show: boolean) => void = () => {};
  public onBoardUpdate: (action: string, type: string, content: string) => void = () => {};
  public onClose: () => void = () => {};
  public onReconnect: () => void = () => {};
  public onAnimationUpdate: (state: string, expression: string, lipSync: boolean, imageLink: string) => void = () => {};
  public onMakeCall: (phoneNumber: string) => void = () => {};
  public on3DAnimation: (animation: string) => void = () => {};
  public hasMicAccess: boolean = false;
  public onMicDenied: (() => void) | null = null;

  constructor(
    character: CharacterType = "stranger",
    voiceStyle: "default" | "fast" | "slow" | "emotional" = "default",
    historySummary: string = "",
    apiKey: string = "",
    userName: string = "Student",
    userId?: string,
    isKidsMode?: boolean
  ) {
    this.apiKey = apiKey || (typeof window !== "undefined" ? (localStorage.getItem("gemini_api_key") || localStorage.getItem("custom_gemini_api_key") || "") : "");
    this.character = character;
    this.voiceStyle = voiceStyle;
    this.historySummary = historySummary;
    this.userName = userName;
    this.userId = userId;
    this.isKidsMode = isKidsMode !== undefined ? isKidsMode : (typeof window !== "undefined" && localStorage.getItem("pref_kids_mode") === "true");
    LiveSessionManager.activeInstances.add(this);
  }

  async start() {
    try {
      console.log("[LiveSessionManager] Starting server-side bridged Live Voice session...");

      // Enforce 5-minute free trial check
      if (LiveSessionManager.isFreeTrialExpired()) {
        console.warn("[LiveSessionManager] Free 5-minute voice trial expired and no custom API key provided.");
        this.onTrialExpired?.();
        throw new Error("আপনার ৫ মিনিটের ফ্রি ভয়েস সেশন শেষ হয়েছে! নিয়মিত আনলিমিটেড কথা বলতে সেটিংস-এ গিয়ে আপনার ফ্রি Gemini API Key যুক্ত করুন।");
      }

      this.onStateChange("processing");

      // Audio contexts setup
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({ sampleRate: 16000 });
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
      if (this.playbackContext.state === "suspended") {
        await this.playbackContext.resume();
      }
      this.nextPlayTime = this.playbackContext.currentTime;

      // Microphone setup
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        this.hasMicAccess = true;
      } catch (micErr) {
        console.warn("Advanced mic failed, trying default audio constraint:", micErr);
        try {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.hasMicAccess = true;
        } catch (e) {
          console.warn("Microphone not available, continuing in listen mode.");
          this.hasMicAccess = false;
          this.onMicDenied?.();
        }
      }

      // Connect to server-side WebSocket proxy for Gemini Live API
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      console.log("[LiveSessionManager] Connecting to server Live WebSocket:", wsUrl);

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("[LiveSessionManager] Connected to server WebSocket. Sending initialization payload...");
        this.socket?.send(
          JSON.stringify({
            type: "init",
            character: this.character,
            voiceStyle: this.voiceStyle,
            userName: this.userName,
            historySummary: this.historySummary,
            apiKey: this.apiKey,
            systemInstruction: this.getModifiedInstruction(),
          })
        );
        this.onStateChange("listening");
        this.startTrialCountdown();
      };

      this.socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "audio" && msg.audio) {
            if (this.playbackContext?.state === "suspended") {
              this.playbackContext.resume();
            }
            this.onStateChange("speaking");
            this.playAudioChunk(msg.audio);
          } else if (msg.type === "interrupted") {
            this.stopPlayback();
            this.onStateChange("listening");
          } else if (msg.type === "text" && msg.text) {
            this.onMessage("stranger", msg.text);
          } else if (msg.type === "userText" && msg.text) {
            this.onMessage("user", msg.text);
            this.handleUserVoiceCommands(msg.text);
          } else if (msg.type === "toolCall" && Array.isArray(msg.functionCalls)) {
            this.handleToolCalls(msg.functionCalls);
          } else if (msg.type === "goAway") {
            console.log("[LiveSessionManager] Session limit notice, reconnecting...");
            this.onReconnect();
          } else if (msg.type === "error") {
            console.warn("[LiveSessionManager] Server notice:", msg.error);
            if (msg.error?.includes("trial") || msg.error?.includes("Key")) {
              this.onTrialExpired?.();
            }
          }
        } catch (err) {
          console.warn("Error parsing WebSocket message:", err);
        }
      };

      this.socket.onclose = () => {
        console.log("[LiveSessionManager] Server WebSocket closed. Intentional:", this.isIntentionalStop);
        this.stopTrialCountdown();
        if (!this.isIntentionalStop && !this.isReconnecting) {
          this.isReconnecting = true;
          this.stop(false);
          this.onReconnect();
        } else if (this.isIntentionalStop) {
          this.stop(true);
        }
      };

      this.socket.onerror = (err) => {
        console.warn("[LiveSessionManager] WebSocket error:", err);
      };

      // Mic processor to send raw audio chunks
      if (this.mediaStream && this.audioContext) {
        this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);

        this.processor.onaudioprocess = (e) => {
          if (
            !this.socket ||
            this.socket.readyState !== WebSocket.OPEN ||
            this.isPlaying ||
            (this.playbackContext && this.playbackContext.currentTime < this.nextPlayTime + 0.15) ||
            this.audioContext?.state !== "running"
          ) {
            return;
          }

          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            let s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          const buffer = new ArrayBuffer(pcm16.length * 2);
          const view = new DataView(buffer);
          for (let i = 0; i < pcm16.length; i++) {
            view.setInt16(i * 2, pcm16[i], true);
          }

          let binary = "";
          const bytes = new Uint8Array(buffer);
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Data = btoa(binary);

          this.socket.send(JSON.stringify({ type: "audio", audio: base64Data }));
        };

        this.source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
      }
    } catch (err: any) {
      console.error("[LiveSessionManager] Failed to start:", err);
      this.stop(true);
      throw err;
    }
  }

  private startTrialCountdown() {
    this.stopTrialCountdown();
    if (LiveSessionManager.hasCustomApiKey()) {
      return; // Unlimited voice session!
    }

    let used = LiveSessionManager.getFreeTrialSecondsUsed();
    this.onTrialTick?.(Math.max(0, LiveSessionManager.FREE_TRIAL_SECONDS - used));

    this.trialInterval = setInterval(() => {
      if (LiveSessionManager.hasCustomApiKey()) {
        this.stopTrialCountdown();
        return;
      }

      used++;
      LiveSessionManager.setFreeTrialSecondsUsed(used);
      const remaining = Math.max(0, LiveSessionManager.FREE_TRIAL_SECONDS - used);
      this.onTrialTick?.(remaining);

      if (used >= LiveSessionManager.FREE_TRIAL_SECONDS) {
        console.warn("[LiveSessionManager] Free 5-minute voice trial ended!");
        this.stopTrialCountdown();
        this.stop(true);
        this.onTrialExpired?.();
      }
    }, 1000);
  }

  private stopTrialCountdown() {
    if (this.trialInterval) {
      clearInterval(this.trialInterval);
      this.trialInterval = null;
    }
  }

  private handleUserVoiceCommands(userText: string) {
    if (this.character === "anjali") {
      const danceRegex = /(dance|naacho|nacho|nachbe|dance\s+koro|start\s+dancing)/i;
      const stopDanceRegex = /(stop\s+dance|study|thamou|thamo)/i;
      const waveRegex = /(wave|hi\s+bolo|hello\s+bolo)/i;
      const thinkRegex = /(bhabo|think|chinta\s+koro)/i;
      const clapRegex = /(clap|taali|tali\s+dao)/i;

      if (danceRegex.test(userText)) {
        this.on3DAnimation("dancing");
      } else if (stopDanceRegex.test(userText)) {
        this.on3DAnimation("idle");
      } else if (waveRegex.test(userText)) {
        this.on3DAnimation("wave");
      } else if (thinkRegex.test(userText)) {
        this.on3DAnimation("thinking");
      } else if (clapRegex.test(userText)) {
        this.on3DAnimation("clap");
      }
    }

    // Memory save trigger
    const memoryRegex = /(mone\s+rakho|mone\s+rekho|remember\s+this|always\s+remember)/i;
    if (memoryRegex.test(userText)) {
      saveUserMemory(userText, this.userId, "Voice Memory");
    }
  }

  private handleToolCalls(functionCalls: any[]) {
    const responses: any[] = [];
    for (const call of functionCalls) {
      if (call.name === "updateLiveBoard") {
        const args = call.args || {};
        this.onBoardUpdate(args.action || "add", args.type || "text", args.content || "");
        responses.push({
          name: call.name,
          id: call.id,
          response: { result: "Board updated successfully." },
        });
      } else if (call.name === "trigger3DAnimation") {
        const args = call.args || {};
        this.on3DAnimation(args.animation || "idle");
        responses.push({
          name: call.name,
          id: call.id,
          response: { result: "Animation triggered." },
        });
      } else {
        responses.push({
          name: call.name,
          id: call.id,
          response: { result: "Handled" },
        });
      }
    }

    if (responses.length > 0 && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "toolResponse", functionResponses: responses }));
    }
  }

  private playAudioChunk(base64Data: string) {
    if (this.isIntentionalStop || !this.playbackContext || this.isMuted) return;

    try {
      if (this.playbackContext.state === "suspended") {
        this.playbackContext.resume();
      }

      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const buffer = new Int16Array(bytes.buffer);
      const audioBuffer = this.playbackContext.createBuffer(1, buffer.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        channelData[i] = buffer[i] / 32768.0;
      }

      const source = this.playbackContext.createBufferSource();
      source.buffer = audioBuffer;
      const speed = Math.max(0.8, Math.min(2.0, this.playbackSpeed || 1.08));
      source.playbackRate.value = speed;
      source.connect(this.playbackContext.destination);

      const currentTime = this.playbackContext.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime + 0.04;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration / speed;
      this.isPlaying = true;
      this.scheduledChunksCount++;
      this.activeSources.push(source);

      if (this.chunkEndTimeout) {
        clearTimeout(this.chunkEndTimeout);
        this.chunkEndTimeout = null;
      }

      source.onended = () => {
        if (this.isIntentionalStop) return;
        this.scheduledChunksCount = Math.max(0, this.scheduledChunksCount - 1);
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) this.activeSources.splice(idx, 1);

        if (this.scheduledChunksCount === 0) {
          if (this.chunkEndTimeout) clearTimeout(this.chunkEndTimeout);
          this.chunkEndTimeout = setTimeout(() => {
            if (
              !this.isIntentionalStop &&
              this.scheduledChunksCount === 0 &&
              this.playbackContext &&
              this.playbackContext.currentTime >= this.nextPlayTime - 0.05
            ) {
              this.isPlaying = false;
              this.onStateChange("listening");
            }
          }, 220);
        }
      };
    } catch (e) {
      console.error("[LiveSessionManager] Error playing audio chunk:", e);
    }
  }

  public setPlaybackSpeed(speed: number) {
    this.playbackSpeed = Math.max(0.8, Math.min(2.0, speed));
  }

  public getPlaybackSpeed(): number {
    return this.playbackSpeed;
  }

  private stopPlayback() {
    if (this.chunkEndTimeout) {
      clearTimeout(this.chunkEndTimeout);
      this.chunkEndTimeout = null;
    }
    this.activeSources.forEach((s) => {
      try {
        s.stop();
        s.disconnect();
      } catch (e) {}
    });
    this.activeSources = [];
    this.scheduledChunksCount = 0;
    this.isPlaying = false;
    if (this.playbackContext && this.playbackContext.state === "running") {
      this.nextPlayTime = this.playbackContext.currentTime;
    }
  }

  private getModifiedInstruction() {
    return getSystemInstruction(
      this.character,
      this.voiceStyle,
      this.userName,
      this.historySummary,
      this.userId,
      this.isKidsMode
    );
  }

  stop(isIntentional: boolean = false) {
    if (isIntentional) {
      this.isIntentionalStop = true;
      LiveSessionManager.activeInstances.delete(this);
    }

    this.stopTrialCountdown();

    if (this.socket) {
      try {
        this.socket.close();
      } catch {}
      this.socket = null;
    }

    if (this.processor) {
      try {
        this.processor.disconnect();
      } catch {}
      this.processor = null;
    }
    if (this.source) {
      try {
        this.source.disconnect();
      } catch {}
      this.source = null;
    }
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((t) => t.stop());
      } catch {}
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.stopPlayback();
    if (this.playbackContext) {
      try {
        this.playbackContext.close();
      } catch {}
      this.playbackContext = null;
    }

    if (this.isIntentionalStop) {
      this.onStateChange("idle");
      this.onClose();
    }
  }

  sendText(text: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "text", text }));
    }
  }
}
