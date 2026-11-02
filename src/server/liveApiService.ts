import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";

interface LiveApiConfig {
  httpServer: http.Server;
  getBestGeminiApiKey: (preferredKey?: string) => string;
}

export function registerLiveApiService({ httpServer, getBestGeminiApiKey }: LiveApiConfig) {
  const wss = new WebSocketServer({ server: httpServer, path: "/api/live" });

  console.log("[Live API Server] Registered server-side Live API WebSocket at /api/live");

  wss.on("connection", (clientWs: WebSocket) => {
    let sessionPromise: Promise<any> | null = null;
    let liveSession: any = null;
    let isTerminated = false;

    clientWs.on("message", async (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === "init") {
          const {
            character = "stranger",
            apiKey,
            systemInstruction,
          } = msg;

          const keyToUse = getBestGeminiApiKey(apiKey);
          if (!keyToUse) {
            clientWs.send(
              JSON.stringify({
                type: "error",
                error: "No Gemini API Key available on server. Please enter your API key in Settings.",
              })
            );
            return;
          }

          const ai = new GoogleGenAI({
            apiKey: keyToUse,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          // Character Voice mapping
          const voiceMapping: Record<string, string> = {
            stranger: "Fenrir",
            anjali: "Aoede",
            zoya: "Aoede",
            khud: "Charon",
            rohan: "Fenrir",
            ishani: "Aoede",
            mahi: "Aoede",
          };
          const voiceName = voiceMapping[character] || "Aoede";

          sessionPromise = ai.live.connect({
            model: "gemini-3.8-live",
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
              },
              temperature: 0.8,
              systemInstruction:
                systemInstruction ||
                "You are Study Stranger AI, a warm, brilliant academic companion.",
              tools: [
                {
                  functionDeclarations: [
                    {
                      name: "updateLiveBoard",
                      description:
                        "Update the live study board (action: add, clear, replace; type: text or image).",
                      parameters: {
                        type: Type.OBJECT,
                        properties: {
                          action: { type: Type.STRING },
                          type: { type: Type.STRING },
                          content: { type: Type.STRING },
                        },
                        required: ["action", "type", "content"],
                      },
                    },
                    {
                      name: "trigger3DAnimation",
                      description:
                        "Trigger a 3D character animation (idle, talking, dancing, wave, thinking, clap).",
                      parameters: {
                        type: Type.OBJECT,
                        properties: {
                          animation: { type: Type.STRING },
                        },
                        required: ["animation"],
                      },
                    },
                  ],
                },
              ],
            },
            callbacks: {
              onopen: () => {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: "connected" }));
                }
              },
              onmessage: (serverMsg: LiveServerMessage) => {
                if (clientWs.readyState !== WebSocket.OPEN) return;

                // Handle Audio Output
                const audio =
                  serverMsg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audio) {
                  clientWs.send(JSON.stringify({ type: "audio", audio }));
                }

                // Handle Interruption
                if (serverMsg.serverContent?.interrupted) {
                  clientWs.send(JSON.stringify({ type: "interrupted" }));
                }

                // Handle Model Text
                const text =
                  serverMsg.serverContent?.modelTurn?.parts?.[0]?.text;
                if (text) {
                  clientWs.send(JSON.stringify({ type: "text", text }));
                }

                // Handle User Transcript
                const userText = (serverMsg as any).serverContent?.userTurn
                  ?.parts?.[0]?.text;
                if (userText) {
                  clientWs.send(JSON.stringify({ type: "userText", text: userText }));
                }

                // Handle Function Calls
                const functionCalls = serverMsg.toolCall?.functionCalls;
                if (functionCalls && functionCalls.length > 0) {
                  clientWs.send(
                    JSON.stringify({ type: "toolCall", functionCalls })
                  );
                }

                // Handle GoAway
                if ((serverMsg as any).serverContent?.goAway) {
                  clientWs.send(JSON.stringify({ type: "goAway" }));
                }
              },
              onclose: () => {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: "closed" }));
                }
              },
              onerror: (err: any) => {
                console.warn("[Live API WebSocket Error]:", err?.message);
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(
                    JSON.stringify({
                      type: "error",
                      error: err?.message || "Live API session encountered an error",
                    })
                  );
                }
              },
            },
          });

          liveSession = await sessionPromise;
        } else if (msg.type === "audio" && msg.audio) {
          if (liveSession) {
            liveSession.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
            });
          } else if (sessionPromise) {
            sessionPromise
              .then((sess) => {
                sess.sendRealtimeInput({
                  audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
                });
              })
              .catch(() => {});
          }
        } else if (msg.type === "toolResponse" && msg.functionResponses) {
          if (liveSession) {
            liveSession.sendToolResponse({
              functionResponses: msg.functionResponses,
            });
          } else if (sessionPromise) {
            sessionPromise
              .then((sess) => {
                sess.sendToolResponse({
                  functionResponses: msg.functionResponses,
                });
              })
              .catch(() => {});
          }
        }
      } catch (err: any) {
        console.warn("[Live API Message Handler Error]:", err?.message);
      }
    });

    clientWs.on("close", () => {
      isTerminated = true;
      if (liveSession) {
        try {
          liveSession.close();
        } catch {}
      }
    });
  });
}
