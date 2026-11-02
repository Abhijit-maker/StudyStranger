let sharedAudioCtx: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioContextClass({ sampleRate: 24000 });
  }
  return sharedAudioCtx;
}

/**
 * Instantly stops any playing PCM/WAV speech audio
 */
export function stopPCM(): void {
  if (activeSource) {
    try {
      activeSource.stop();
    } catch {}
    activeSource = null;
  }
}

/**
 * Plays base64 WAV/PCM audio stream from Gemini TTS
 */
export async function playPCM(base64Data: string, playbackRate: number = 1.0): Promise<void> {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) {
      console.warn("AudioContext not supported");
      return;
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // Stop current audio source before starting new speech chunk
    stopPCM();

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    let audioBuffer: AudioBuffer;
    try {
      // 1. Decodes standard WAV file directly using native decodeAudioData (removes 44-byte clicks/pops)
      // We clone the buffer to avoid issues with transfer of ownership
      const bufferCopy = bytes.buffer.slice(0);
      audioBuffer = await audioCtx.decodeAudioData(bufferCopy);
    } catch (decodeError) {
      console.warn("decodeAudioData failed, falling back to raw PCM parsing:", decodeError);
      
      // 2. Fallback to parsing raw PCM if it wasn't a standard WAV
      const buffer = new Int16Array(bytes.buffer);
      audioBuffer = audioCtx.createBuffer(1, buffer.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        channelData[i] = buffer[i] / 32768.0;
      }
    }

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;
    source.connect(audioCtx.destination);
    
    activeSource = source;
    source.start();

    return new Promise<void>(resolve => {
      source.onended = () => {
        if (activeSource === source) {
          activeSource = null;
        }
        resolve();
      };
    });
  } catch (error) {
    console.error("Error playing audio stream:", error);
  }
}
