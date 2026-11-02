import fs from "fs";
import path from "path";
import os from "os";
import { GoogleGenAI, Modality } from "@google/genai";
import { TelegramFormatter } from "../services/telegramFormatter.ts";
export function registerTelegramBotService(deps: any) {
  const { app, getActiveTelegramBotToken, getBestGeminiApiKey, userApiKeyMap, saveUserKeysToDisk, linkedTelegramUsers, saveLinkedUsersToDisk, linkTokenMap, telegramAppPinMap, getCustomApiKeyForUser, generateAIAnswer } = deps;
  // Reset & Force Restart 24/7 Long Polling
  app.post("/api/telegram/reset-polling", async (req: any, res: any) => {
    try {
      const botToken = getActiveTelegramBotToken();
      if (!botToken) {
        return res.status(400).json({ success: false, error: "Bot token not configured" });
      }

      // Delete webhook with drop_pending_updates=false so updates can be received via polling
      const resp = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook?drop_pending_updates=false`, {
        method: "POST"
      });
      const data = await resp.json();

      lastUpdateId = 0;
      isPolling = false;
      startTelegramPolling();

      res.json({
        success: true,
        message: "24/7 Polling Engine successfully reset and active!",
        telegramResponse: data
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- 24/7 High-Reliability Telegram Bot Engine ---
  const runtimeDataDir = process.env.RUNTIME_DATA_DIR || path.join(os.tmpdir(), "studystranger-runtime-data");
  const TELEGRAM_STATE_FILE = path.join(runtimeDataDir, "telegram_poller_state.json");
  let lastUpdateId = 0;
  const processedUpdates = new Set<number>();
  const processedMsgKeys = new Set<string>();
  const inFlightMessages = new Set<string>();
  const userLastQueryMap = new Map<number | string, string>();

  // Ensure runtime directory exists and load persisted poller state
  try {
    if (!fs.existsSync(runtimeDataDir)) {
      fs.mkdirSync(runtimeDataDir, { recursive: true });
    }
    if (fs.existsSync(TELEGRAM_STATE_FILE)) {
      const stateData = JSON.parse(fs.readFileSync(TELEGRAM_STATE_FILE, "utf-8"));
      if (typeof stateData.lastUpdateId === "number") {
        lastUpdateId = stateData.lastUpdateId;
      }
      if (Array.isArray(stateData.processedMsgKeys)) {
        stateData.processedMsgKeys.forEach((k: string) => processedMsgKeys.add(k));
      }
      if (Array.isArray(stateData.processedUpdates)) {
        stateData.processedUpdates.forEach((u: number) => processedUpdates.add(u));
      }
      console.log(`[Telegram State] Loaded lastUpdateId=${lastUpdateId}, ${processedMsgKeys.size} processed msg keys.`);
    }
  } catch (stateErr) {
    console.warn("[Telegram State] Could not load state file:", stateErr);
  }

  const saveTelegramState = () => {
    try {
      const stateData = {
        lastUpdateId,
        processedMsgKeys: Array.from(processedMsgKeys).slice(-3000),
        processedUpdates: Array.from(processedUpdates).slice(-3000),
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(TELEGRAM_STATE_FILE, JSON.stringify(stateData, null, 2), "utf-8");
    } catch (saveErr) {
      // Ignored
    }
  };

  setInterval(() => {
    saveTelegramState();
  }, 5 * 60 * 1000);

  // Dynamic Class 12 WBCHSE Quiz Bank
  const class12QuizBank = [
    {
      q: "Q. মানব শুক্রাণুর (Human Sperm) কোন অংশে মাইটোকন্ড্রিয়া থাকে?",
      options: [
        { text: "A) Head (শীর্ষদেশ)", correct: false },
        { text: "B) Midpiece (মধ্যভাগ)", correct: true },
        { text: "C) Tail (পুচ্ছ)", correct: false },
        { text: "D) Acrosome (অ্যাক্রোজোম)", correct: false }
      ],
      explanation: "মানব শুক্রাণুর মধ্যভাগে (Midpiece) মাইটোকন্ড্রিয়া সর্পিলভাবে সজ্জিত থাকে যা সাঁতার কাটার প্রয়োজনীয় শক্তি (ATP) জোগায়।"
    },
    {
      q: "Q. DNA অণুতে গুয়ানিন (G) ও সাইটোসিন (C)-এর মধ্যে কয়টি হাইড্রোজেন বন্ধন থাকে?",
      options: [
        { text: "A) ১টি", correct: false },
        { text: "B) ২টি", correct: false },
        { text: "C) ৩টি", correct: true },
        { text: "D) ৪টি", correct: false }
      ],
      explanation: "DNA-তে Adenine=Thymine (২টি হাইড্রোজেন বন্ড) এবং Guanine≡Cytosine (৩টি হাইড্রোজেন বন্ড) থাকে।"
    },
    {
      q: "Q. 'The Bet' গল্পে ব্যাঙ্কার ও উকিলের মধ্যে কত টাকার বাজি হয়েছিল?",
      options: [
        { text: "A) ১ মিলিয়ন রুবল", correct: false },
        { text: "B) ২ মিলিয়ন রুবল", correct: true },
        { text: "C) ৫ মিলিয়ন রুবল", correct: false },
        { text: "D) ১০ হাজার রুবল", correct: false }
      ],
      explanation: "আন্তন চেখভের 'The Bet' গল্পে ২ মিলিয়ন রুবলের বিনিময়ে ১৫ বছরের নির্জন কারাবাসের বাজি ধরা হয়েছিল।"
    },
    {
      q: "Q. প্রভাত কুমার মুখোপাধ্যায়ের 'আদিরিনী' গল্পে জয়রাম মুখুজ্জে কত টাকায় হাতিটি কিনেছিলেন?",
      options: [
        { text: "A) ১০০০ টাকা", correct: false },
        { text: "B) ২০০০ টাকা", correct: true },
        { text: "C) ৫০০ টাকা", correct: false },
        { text: "D) ৫০০০ টাকা", correct: false }
      ],
      explanation: "জয়রাম মুখুজ্জে আদিরিনীকে ২০০০ টাকায় নিলাম থেকে কিনে এনেছিলেন।"
    },
    {
      q: "Q. ডিম্বাণুর জোনা পেলুসিডার কোন রিসেপ্টরে শুক্রাণু যুক্ত হয়?",
      options: [
        { text: "A) ZP1", correct: false },
        { text: "B) ZP2", correct: false },
        { text: "C) ZP3", correct: true },
        { text: "D) ZP4", correct: false }
      ],
      explanation: "নিষেক প্রক্রিয়ায় শুক্রাণু জোনা পেলুসিডার ZP3 (Zona Pellucida Glycoprotein 3) রিসেপ্টরে আবদ্ধ হয়ে অ্যাক্রোজোম বিক্রিয়া ঘটায়।"
    },
    {
      q: "Q. মেনস্ট্রুয়াল সাইকেলের কততম দিনে LH Surge ঘটে এবং ওভুলেশন হয়?",
      options: [
        { text: "A) ১ম দিনে", correct: false },
        { text: "B) ৭ম দিনে", correct: false },
        { text: "C) ১৪তম দিনে", correct: true },
        { text: "D) ২৮তম দিনে", correct: false }
      ],
      explanation: "২৮ দিনের স্বাভাবিক চক্রে ১৪তম দিনে Luteinizing Hormone (LH)-এর মাত্রা সর্বোচ্চ শিখরে পৌঁছায় (LH surge), ফলে ডিম্বপাত ঘটে।"
    }
  ];

  // Helper: Answer Telegram callback queries immediately so buttons never hang
  const answerCallbackQuery = async (botToken: string, callbackQueryId: string, text?: string) => {
    if (!botToken || !callbackQueryId) return;
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text || "",
          show_alert: false
        })
      });
    } catch (err) {
      // Ignored
    }
  };

  // --- Telegram Update Processor (Guaranteed Error-Free & 24/7 Resilience) ---
  const processTelegramUpdate = async (update: any) => {
    if (!update) return;

    // 1. Strict Update ID Deduplication
    if (update.update_id) {
      if (processedUpdates.has(update.update_id)) return;
      processedUpdates.add(update.update_id);
    }

    // 2. Strict Message & Callback Key Deduplication
    const msgObj = update.message || update.edited_message || update.channel_post;
    let msgKey: string | null = null;
    if (msgObj) {
      msgKey = `msg_${msgObj.chat?.id}_${msgObj.message_id}`;
    } else if (update.callback_query) {
      msgKey = `cq_${update.callback_query.id}`;
    }

    if (msgKey) {
      if (processedMsgKeys.has(msgKey) || inFlightMessages.has(msgKey)) {
        console.log(`[Telegram Guard] Prevented duplicate execution for key: ${msgKey}`);
        return;
      }
      inFlightMessages.add(msgKey);
      processedMsgKeys.add(msgKey);
      saveTelegramState();
    }

    try {
      const botToken = getActiveTelegramBotToken();
      if (!botToken) return;

      const webAppUrl = process.env.APP_URL || "https://ais-pre-tdzujvdptn6cxeu3npeoqg-181332496386.asia-southeast1.run.app";

      // Robust Message Sender: Splits if >3900 chars, handles parse errors with plain-text fallback
      const sendMsg = async (chatId: number | string, text: string, reply_markup?: any) => {
        if (!chatId || !text) return;
        
        // Chunk message if extremely long
        const chunks: string[] = [];
        if (text.length > 3800) {
          let remaining = text;
          while (remaining.length > 0) {
            chunks.push(remaining.substring(0, 3800));
            remaining = remaining.substring(3800);
          }
        } else {
          chunks.push(text);
        }

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const isLast = i === chunks.length - 1;
          const markupToSend = isLast ? reply_markup : undefined;

          try {
            const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: chunk,
                parse_mode: "HTML",
                reply_markup: markupToSend
              })
            });
            const resJson: any = await resp.json();
            
            // Only fallback to plain text if Telegram failed strictly because of HTML entity parsing
            if (!resJson.ok && resJson.description && /parse|entity|tag/i.test(resJson.description)) {
              const plain = chunk.replace(/<[^>]*>?/gm, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: plain,
                  reply_markup: markupToSend
                })
              });
            }
          } catch (err: any) {
            console.error("[Telegram sendMsg] Network error:", err.message);
          }
        }
      };

      const sendAction = async (chatId: number | string, action: string = "typing") => {
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, action })
          });
        } catch {
          // Ignored
        }
      };

      // 1. Handle Messages (Text, Slash Commands, Photos)
      if (msgObj) {
        const msg = msgObj;
        const chatId = msg.chat?.id;
        const text = (msg.text || msg.caption || "").trim();

        // Handle Photo Submissions (Supports QR Code Auto-Scan & Instant AI Math/Academic Visual Solver)
        if (msg.photo && msg.photo.length > 0) {
          await sendAction(chatId, "typing");

          let qrScanSuccess = false;
          let base64Img = "";
          try {
            // Get highest resolution photo sent by user
            const highestPhoto = msg.photo[msg.photo.length - 1];
            const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${highestPhoto.file_id}`);
            const fileData: any = await fileRes.json();

            if (fileData.ok && fileData.result?.file_path) {
              const filePath = fileData.result.file_path;
              const imgRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
              const arrayBuffer = await imgRes.arrayBuffer();
              base64Img = Buffer.from(arrayBuffer).toString("base64");

              // Send photo to Google Gemini Vision to check for QR Code / Linking Token first
              const visionKey = getBestGeminiApiKey();
              if (visionKey) {
                const ai = new GoogleGenAI({
                  apiKey: visionKey,
                  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
                });

                const visionRes = await ai.models.generateContent({
                  model: "gemini-3.6-flash",
                  contents: {
                    parts: [
                      {
                        inlineData: {
                          mimeType: "image/jpeg",
                          data: base64Img
                        }
                      },
                      {
                        text: "Examine this image carefully. Is it a QR code or image containing a linking token starting with 'ST-' (e.g. ST-X1Y2Z3) or a 6-digit PIN? Extract and return ONLY the token or PIN string itself (e.g. ST-A1B2C3 or 849201). If no token or QR code is present, reply ONLY 'NONE'."
                      }
                    ]
                  }
                });

                const extractedText = (visionRes.text || "").trim();

                // Find matching ST- token or 6-digit PIN in extracted output
                const tokenMatch = extractedText.match(/ST-[A-Za-z0-9]+/i) || extractedText.match(/\b\d{6}\b/);
                const foundTokenStr = tokenMatch ? tokenMatch[0].toUpperCase() : null;

                if (foundTokenStr) {
                  // Check linkTokenMap (Web generated QR token)
                  let matchedKey = "";
                  for (const key of linkTokenMap.keys()) {
                    if (key.toUpperCase() === foundTokenStr || key.toUpperCase() === "ST-" + foundTokenStr || foundTokenStr.includes(key.toUpperCase())) {
                      matchedKey = key;
                      break;
                    }
                  }

                  if (matchedKey && linkTokenMap.has(matchedKey)) {
                    const linkData = linkTokenMap.get(matchedKey)!;
                    if (Date.now() <= linkData.expiresAt) {
                      linkTokenMap.delete(matchedKey);
                      linkedTelegramUsers.set(String(chatId), {
                        firebaseUid: linkData.firebaseUid,
                        displayName: linkData.displayName,
                        linkedAt: new Date().toISOString(),
                        username: msg.from?.username,
                        telegramId: chatId
                      });
                      saveLinkedUsersToDisk();
                      qrScanSuccess = true;
                      await sendMsg(
                        chatId,
                        `🎉 <b>QR CODE সফলভাবে স্ক্যান হয়েছে!</b>\n\nস্বাগতম <b>${linkData.displayName}</b>! আপনার Telegram (@${msg.from?.username || chatId}) সফলভাবে Study Stranger Web App-এর সাথে যুক্ত হয়েছে। 🚀`
                      );
                      return;
                    } else {
                      linkTokenMap.delete(matchedKey);
                      await sendMsg(chatId, "❌ <b>QR Code মেয়াাদোত্তীর্ণ!</b>\nএই QR Code-এর ১০ মিনিটের সময়সীমা শেষ হয়ে গেছে। দয়া করে Web App থেকে নতুন QR কোড ডাউনলোড করে পাঠান।");
                      return;
                    }
                  }

                  // Check telegramAppPinMap
                  let matchedPinKey = "";
                  for (const key of telegramAppPinMap.keys()) {
                    if (key.toUpperCase() === foundTokenStr) {
                      matchedPinKey = key;
                      break;
                    }
                  }

                  if (matchedPinKey && telegramAppPinMap.has(matchedPinKey)) {
                    const pinData = telegramAppPinMap.get(matchedPinKey)!;
                    telegramAppPinMap.delete(matchedPinKey);
                    linkedTelegramUsers.set(String(chatId), {
                      firebaseUid: "guest_" + chatId,
                      displayName: msg.from?.first_name || "Student",
                      linkedAt: new Date().toISOString(),
                      username: msg.from?.username,
                      telegramId: chatId
                    });
                    saveLinkedUsersToDisk();
                    qrScanSuccess = true;
                    await sendMsg(
                      chatId,
                      `🎉 <b>PIN কোড সফলভাবে যুক্ত হয়েছে!</b>\n\nআপনার Telegram অ্যাকাউন্ট সফলভাবে কানেক্ট করা হলো। 🚀`
                    );
                    return;
                  }
                }
              }
            }
          } catch (scanErr: any) {
            console.warn("[Telegram Photo Scan Error]:", scanErr.message);
          }

          // If not QR code, solve as an academic/visual problem using Gemini Vision
          if (!qrScanSuccess && base64Img) {
            try {
              await sendAction(chatId, "typing");
              const userCaption = (msg.caption || "").trim();
              const visionPrompt = `You are Study Stranger AI, an expert academic tutor for WBCHSE Class 12 (Biology, Math, Physics, Chemistry, Bengali, English).
Examine this image sent by the student. ${userCaption ? `User note: "${userCaption}".` : ""}
Task:
1. Identify and transcribe the mathematical equation, diagram, or question clearly.
2. Provide a thorough, step-by-step master solution in warm, encouraging Bengali (বাংলা) / Banglish / English.
3. Write all formulas and equations with clean mathematical notations ($$...$$).
4. Clearly highlight the final answer.`;

              const visionKey = getBestGeminiApiKey();
              if (visionKey) {
                const ai = new GoogleGenAI({
                  apiKey: visionKey,
                  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
                });

                const solveRes = await ai.models.generateContent({
                  model: "gemini-3.6-flash",
                  contents: {
                    parts: [
                      {
                        inlineData: {
                          mimeType: "image/jpeg",
                          data: base64Img
                        }
                      },
                      { text: visionPrompt }
                    ]
                  }
                });

                const solutionText = solveRes.text?.trim() || "";
                if (solutionText) {
                  const formattedSol = TelegramFormatter.toTelegramHtml(solutionText);
                  const replyHtml = `📸 <b>ছবি থেকে প্রশ্নের সমাধান (Visual Problem Solved):</b>\n\n${formattedSol}`;
                  const keyboard = {
                    inline_keyboard: [
                      [{ text: "🎙️ Direct 1:1 Live Call", callback_data: "menu_live_call" }],
                      [{ text: "🧠 Practice Related Quiz", callback_data: "menu_quiz" }, { text: "🏠 Main Menu", callback_data: "menu_home" }]
                    ]
                  };
                  await sendMsg(chatId, replyHtml, keyboard);
                  return;
                }
              }
            } catch (solveErr: any) {
              console.error("[Telegram Vision Solve Error]:", solveErr.message);
            }

            const fallbackPhotoReply = `📸 <b>ছবি প্রাপ্ত হয়েছে!</b>\n\nছবিটি প্রসেস করার পর স্পষ্ট প্রশ্নের টেক্সট বা সূত্র থাকলে সাথে লিখে পাঠান (যেমন: <i>'এই অংকটি করে দাও'</i>), আমি সাথে সাথে নির্ভুল সমাধান তৈরি করে দেব!`;
            await sendMsg(chatId, fallbackPhotoReply);
            return;
          }
        }

        // Handle Voice Notes & Audio Messages (Direct voice input from student!)
        if (msg.voice || msg.audio) {
          await sendAction(chatId, "record_voice");
          try {
            const voiceObj = msg.voice || msg.audio;
            const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${voiceObj.file_id}`);
            const fileData: any = await fileRes.json();

            if (fileData.ok && fileData.result?.file_path) {
              const filePath = fileData.result.file_path;
              const audioRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
              const audioBuffer = await audioRes.arrayBuffer();
              const base64Audio = Buffer.from(audioBuffer).toString("base64");
              const mimeType = msg.voice ? "audio/ogg" : (voiceObj.mime_type || "audio/mp3");

              const voicePrompt = `You are Study Stranger AI, an ultra-smart, warm, and friendly academic companion for student Abhijit (অভিজিৎ).
Listen to this voice message sent by the student.
1. Understand the question or greeting spoken in Bengali / Banglish / English.
2. Provide a warm, friendly, detailed and clear answer.
3. If it's a math or science question, explain the concepts and formulas step-by-step.`;

              const effectiveKey = getBestGeminiApiKey();
              if (effectiveKey) {
                const ai = new GoogleGenAI({
                  apiKey: effectiveKey,
                  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
                });

                const voiceResponse = await ai.models.generateContent({
                  model: "gemini-3.6-flash",
                  contents: {
                    parts: [
                      {
                        inlineData: {
                          mimeType: mimeType.includes("ogg") ? "audio/ogg" : "audio/mp3",
                          data: base64Audio
                        }
                      },
                      { text: voicePrompt }
                    ]
                  }
                });

                const answerText = voiceResponse.text?.trim() || "";
                if (answerText) {
                  const formattedVoiceAns = TelegramFormatter.toTelegramHtml(answerText);
                  const voiceReplyHtml = `🎙️ <b>ভয়েস মেসেজের উত্তর (Voice Query Answered):</b>\n\n${formattedVoiceAns}`;
                  
                  const voiceButtons = {
                    inline_keyboard: [
                      [{ text: "📞 Direct 1:1 Live Talk (সরাসরি লাইভ কথা বলুন)", callback_data: "menu_live_call" }],
                      [{ text: "🧠 Practice Quiz", callback_data: "menu_quiz" }, { text: "🏠 Main Menu", callback_data: "menu_home" }]
                    ]
                  };
                  await sendMsg(chatId, voiceReplyHtml, voiceButtons);
                  return;
                }
              }
            }
          } catch (voiceErr: any) {
            console.error("[Telegram Voice Error]:", voiceErr.message);
            await sendMsg(chatId, `🎙️ <b>ভয়েস মেসেজ প্রাপ্ত হয়েছে!</b>\n\nদুঃখিত, ভয়েস অডিও প্রসেসিংয়ে সাময়িক সমস্যা হয়েছিল। দয়া করে আরেকবার ভয়েস পাঠান অথবা সরাসরি লিখে বলুন! 🚀`);
            return;
          }
        }

        // Handle /start command
        if (text.startsWith("/start")) {
          const parts = text.split(/\s+/);
          let linkArg = parts[1]?.trim();

          if (linkArg) {
            let matchedToken = linkArg;
            if (!linkTokenMap.has(matchedToken)) {
              for (const key of linkTokenMap.keys()) {
                if (key.toLowerCase() === linkArg.toLowerCase()) {
                  matchedToken = key;
                  break;
                }
              }
            }

            if (linkTokenMap.has(matchedToken)) {
              const linkData = linkTokenMap.get(matchedToken)!;
              if (Date.now() > linkData.expiresAt) {
                linkTokenMap.delete(matchedToken);
                await sendMsg(chatId, "❌ <b>Link token expired.</b>\nদয়া করে Study Stranger Web App থেকে নতুন কানেক্ট লিঙ্ক তৈরি করুন।");
              } else {
                linkTokenMap.delete(matchedToken);
                linkedTelegramUsers.set(String(chatId), {
                  firebaseUid: linkData.firebaseUid,
                  displayName: linkData.displayName,
                  linkedAt: new Date().toISOString(),
                  username: msg.from?.username,
                  telegramId: chatId
                });
                saveLinkedUsersToDisk();
                await sendMsg(
                  chatId, 
                  `🎉 <b>অ্যাকাউন্ট সফলভাবে কানেক্ট হয়েছে!</b>\n\nস্বাগতম <b>${linkData.displayName}</b>! আপনার Telegram (@${msg.from?.username || chatId}) এখন Study Stranger Web অ্যাকাউন্টের সাথে সম্পূর্ণ যুক্ত। আপনার সমস্ত প্রগ্রেস ও নোটস এখানে সিঙ্ক থাকবে।`
                );
              }
            }
          }

          const welcomeHtml = `🎓 <b>STUDY STRANGER AI (WBCHSE Class 12)</b>\n\n` +
            `স্বাগতম! আমি অভিজিৎ-এর ব্যক্তিগত AI পড়াশোনার বন্ধু।\n\n` +
            `💬 <b>পড়াশোনার ডাউট বা প্রশ্ন থাকলে সরাসরি মেসেজ করো, আমি উত্তর দেব।</b>\n\n` +
            `⚙️ <b>ওয়েব অ্যাপ কানেক্ট বা সেটিংসের জন্য নিচের বাটনে ক্লিক করো।</b>`;

          const keyboard = {
            inline_keyboard: [
              [
                { text: "⚙️ Settings & Connect", callback_data: "menu_settings" }
              ],
              [
                { text: "🚀 Open Web App", web_app: { url: webAppUrl } }
              ]
            ]
          };

          await sendMsg(chatId, welcomeHtml, keyboard);
          return;
        }

        // Handle /settings or /menu command
        if (text.startsWith("/settings") || text.startsWith("/menu")) {
          const telIdStr = String(chatId);
          const isUserLinked = linkedTelegramUsers.has(telIdStr);
          const linkedInfo = linkedTelegramUsers.get(telIdStr);
          const existingUserKey = getCustomApiKeyForUser(chatId);

          const settingsHtml = `⚙️ <b>STUDY STRANGER SETTINGS & CONNECT</b>\n\n` +
            `• <b>কানেকশন স্ট্যাটাস:</b> ${isUserLinked ? `✅ Connected (<b>${linkedInfo?.displayName}</b>)` : "❌ Not Connected"}\n` +
            `• <b>Gemini:</b> ${existingUserKey ? `✅ Custom Key` : "⚡ Standard (Fast)"}\n\n` +
            `<i>নিচের প্রয়োজনীয় অপশনটি নির্বাচন করুন:</i>`;

          const keyboard = {
            inline_keyboard: [
              [
                isUserLinked 
                  ? { text: "❌ Disconnect Account", callback_data: "menu_unlink" }
                  : { text: "🔗 Get Connect PIN", callback_data: "menu_connect" }
              ],
              [
                { text: "🔑 Custom Gemini Key", callback_data: "menu_keys" },
                { text: "🚀 Open Web App", web_app: { url: webAppUrl } }
              ],
              [
                { text: "💬 Back to Chat", callback_data: "menu_home" }
              ]
            ]
          };

          await sendMsg(chatId, settingsHtml, keyboard);
          return;
        }

        // Handle /live or /call or /voice command (Direct 1:1 Live Voice Conversation)
        if (text.startsWith("/live") || text.startsWith("/call") || text.startsWith("/voice")) {
          const liveCallHtml = `🎙️ <b>STUDY STRANGER DIRECT 1:1 LIVE TALK</b>\n\n` +
            `অভিজিৎ, তুমি এখন সরাসরি Study Stranger AI-এর সাথে রিয়েল-টাইমে লাইভ কথা বলতে পারবে!\n\n` +
            `✨ <b>লাইভ ভয়েস ফিচারের সুবিধা:</b>\n` +
            `• 🗣️ বাংলায় মুখে ডাউট বা প্রশ্ন জিজ্ঞাসা করো\n` +
            `• ⚡ কোনো টাইপিং ছাড়া সাথে সাথে লাইভ ভয়েস রিপ্লাই শোনো\n` +
            `• 📐 অঙ্ক, বায়োলজি ও ফিজিক্সের জটিল বিষয় মুখে মুখে বুঝে নাও\n\n` +
            `<i>নিচের <b>'🎙️ Start 1:1 Live Voice'</b> বাটনে ক্লিক করলেই সরাসরি ভয়েস রুম শুরু হয়ে যাবে:</i>`;

          const liveCallKeyboard = {
            inline_keyboard: [
              [
                { text: "🎙️ Start 1:1 Live Voice (সরাসরি লাইভ কথা বলুন)", web_app: { url: `${webAppUrl}?open=live_board` } }
              ],
              [
                { text: "🌐 Open in Browser", url: `${webAppUrl}?open=live_board` }
              ],
              [
                { text: "🏠 Main Menu", callback_data: "menu_home" }
              ]
            ]
          };

          await sendMsg(chatId, liveCallHtml, liveCallKeyboard);
          return;
        }

        // Handle /help or /support command
        if (text.startsWith("/help") || text.startsWith("/support")) {
          const telIdStr = String(chatId);
          const isUserLinked = linkedTelegramUsers.has(telIdStr);
          const linkedInfo = linkedTelegramUsers.get(telIdStr);
          const studentUsername = msg.from?.username ? `@${msg.from.username}` : (linkedInfo?.username ? `@${linkedInfo.username}` : "Student");

          const helpHtml = `💡 <b>STUDY STRANGER AI — সমস্ত কমান্ড ও হেল্প গাইড</b>\n\n` +
            `👤 <b>আপনার টেলিগ্রাম ইউজারনেম:</b> <code>${studentUsername}</code>\n` +
            `🤖 <b>অফিসিয়াল টেলিগ্রাম সাপোর্ট:</b> <code>@Studystranger_bot</code>\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `⚡ <b>প্রয়োজনীয় সমস্ত কমান্ড ও ব্যবহার:</b>\n\n` +
            `• 🎙️ <b>/live অথবা /call</b> — সরাসরি ১:১ লাইভ কথা বলুন (লগইন ছাড়াই কথা বলা যাবে)।\n` +
            `• 📸 <b>ছবি পাঠান</b> — অঙ্কের খাতা বা বইয়ের ছবি পাঠালেই স্টেপ-বাই-স্টেপ সমাধান তৈরি হবে।\n` +
            `• 🗣️ <b>ভয়েস মেসেজ</b> — মুখে বাংলায় প্রশ্ন রেকর্ড করে পাঠান, AI সাথে সাথে উত্তর দেবে।\n` +
            `• 🔑 <b>/connect</b> — ৬-ডিজিটের অ্যাপ কানেক্ট পিন কোড তৈরি (১০ মিনিট মেয়াদ)।\n` +
            `• 🧠 <b>/quiz</b> — ক্লাস ১২ বায়োলজি, বাংলা ও ইংরেজি MCQ কুইজ।\n` +
            `• 🎯 <b>/chapter [অধ্যায়]</b> — নির্দিষ্ট চ্যাপ্টারের পরীক্ষা উপযোগী প্রশ্ন জেনারেট।\n` +
            `• 📚 <b>/materials বা /notes</b> — সম্পূর্ণ বিষয়ের রিভিশন নোটস ও ফর্মুলা শিট।\n` +
            `• 📊 <b>/progress</b> — পড়াশোনার স্ট্রিক, XP এবং নির্ভুলতা রিপোর্ট।\n` +
            `• 🔐 <b>/key [API_KEY]</b> — কাস্টম গুগল জেমিনাই কী যুক্ত করুন।\n` +
            `• ⚙️ <b>/settings</b> — সংযোগ স্ট্যাটাস ও সেটিংস মেনু।\n` +
            `• ❌ <b>/unlink</b> — টেলিগ্রাম অ্যাকাউন্ট ডিসকানেক্ট।\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💬 <i>যেকোনো সহায়তার জন্য নিচে বাটনে ক্লিক করুন:</i>`;

          const keyboard = {
            inline_keyboard: [
              [
                { text: "🎙️ 1:1 Live Call (লগইন ছাড়া কথা বলুন)", web_app: { url: `${webAppUrl}?open=live_board` } }
              ],
              [
                { text: "🧠 Practice Quiz", callback_data: "menu_quiz" },
                { text: "📚 Study Notes", callback_data: "menu_materials" }
              ],
              [
                { text: "⚙️ Settings & Connect", callback_data: "menu_settings" },
                { text: "💬 Chat", callback_data: "menu_home" }
              ]
            ]
          };
          await sendMsg(chatId, helpHtml, keyboard);
          return;
        }

        // Handle /status or /info command
        if (text.startsWith("/status") || text.startsWith("/info")) {
          const telIdStr = String(chatId);
          const isUserLinked = linkedTelegramUsers.has(telIdStr);
          const linkedInfo = linkedTelegramUsers.get(telIdStr);
          const existingUserKey = getCustomApiKeyForUser(chatId);

          const statusHtml = `📊 <b>STUDY STRANGER TELEGRAM CONNECTION STATUS</b>\n\n` +
            `• <b>Connection Status:</b> ${isUserLinked ? "✅ <b>CONNECTED & SYNCED</b>" : "❌ <b>NOT CONNECTED</b>"}\n` +
            (isUserLinked ? `• <b>Linked Student:</b> <code>${linkedInfo?.displayName}</code>\n` : "") +
            `• <b>Telegram Chat ID:</b> <code>${chatId}</code>\n` +
            `• <b>Telegram User:</b> @${msg.from?.username || chatId}\n` +
            `• <b>Gemini API Key:</b> ${existingUserKey ? `✅ Custom Key Active (<code>${existingUserKey.substring(0, 8)}...</code>)` : "⚡ System Default Key Active"}\n\n` +
            (isUserLinked 
              ? `<i>আপনার টেলিগ্রাম ও ওয়েব অ্যাপের সমস্ত ডাটা লাইভ সিঙ্ক রয়েছে।</i>` 
              : `<i>অ্যাপের সাথে সিঙ্ক করতে /connect ব্যবহার করুন।</i>`);

          const keyboard = {
            inline_keyboard: [
              isUserLinked 
                ? [{ text: "❌ Disconnect Account", callback_data: "menu_unlink" }] 
                : [{ text: "🔗 Get Connect PIN", callback_data: "menu_connect" }],
              [{ text: "⚙️ Settings", callback_data: "menu_settings" }, { text: "💬 Chat", callback_data: "menu_home" }]
            ]
          };

          await sendMsg(chatId, statusHtml, keyboard);
          return;
        }

        // Handle /connect or /code command
        if (text.startsWith("/connect") || text.startsWith("/code") || text.startsWith("/pin")) {
          const now = Date.now();
          let existingPin: string | null = null;
          let existingPinData: { chatId: string | number; username?: string; firstName?: string; expiresAt: number } | null = null;

          // Check if an active, non-expired PIN already exists for this Telegram chat
          for (const [p, pData] of telegramAppPinMap.entries()) {
            if (String(pData.chatId) === String(chatId) && pData.expiresAt > now) {
              existingPin = p;
              existingPinData = pData;
              break;
            }
          }

          let pinCode = existingPin;
          let expiresAt = existingPinData ? existingPinData.expiresAt : now + 10 * 60 * 1000;

          if (!pinCode) {
            pinCode = Math.floor(100000 + Math.random() * 900000).toString();
            expiresAt = now + 10 * 60 * 1000; // 10 minutes
            telegramAppPinMap.set(pinCode, {
              chatId,
              username: msg.from?.username,
              firstName: msg.from?.first_name,
              expiresAt
            });
          }

          const minsLeft = Math.max(1, Math.ceil((expiresAt - now) / 60000));

          const pinHtml = `🔗 <b>STUDY STRANGER APP CONNECT PIN</b>\n\n` +
            `🔑 <b>আপনার ৬-ডিজিটের কানেক্ট কোড:</b>\n` +
            `<code><b>${pinCode}</b></code>\n\n` +
            `📍 <b>কানেক্ট করার ৩টি সহজ ধাপ:</b>\n` +
            `1️⃣ Study Stranger Web App ওপেন করুন।\n` +
            `2️⃣ <b>Telegram Portal</b> ট্যাবে যান।\n` +
            `3️⃣ <b>'Enter 6-Digit PIN'</b> ফিল্ডে <code><b>${pinCode}</b></code> বসিয়ে <b>Verify & Link</b> এ ক্লিক করুন!\n\n` +
            `⏰ <i>এই পিনটির সময়সীমা অবশিষ্ট: ${minsLeft} মিনিট (10 Minutes Expiry).</i>`;

          const keyboard = {
            inline_keyboard: [
              [{ text: "🚀 Open App & Connect", web_app: { url: webAppUrl } }],
              [{ text: "🏠 Main Menu", callback_data: "menu_home" }]
            ]
          };

          await sendMsg(chatId, pinHtml, keyboard);
          return;
        }

        // Handle /chapter command
        if (text.startsWith("/chapter") || text.startsWith("/generate") || text.startsWith("/ch")) {
          const rawParam = text.replace(/^\/(chapter|generate|ch)\s*/i, "").trim();

          if (!rawParam) {
            const chapSelectHtml = `🎯 <b>Chapter-Wise WBCHSE Question Generator</b>\n\nযে চ্যাপ্টারের প্রশ্ন তৈরি করতে চান সেটি বেছে নিন অথবা টাইপ করুন (যেমন: <i>/chapter Biology Unit 1</i>):\n\n• 🧬 <b>Biology:</b> Unit I (Reproduction) / Unit II (Genetics & Evolution)\n• 📖 <b>Bengali A:</b> আদিরিনী, বাঙ্গালা ভাষা, ধর্ম, দিগ্বিজয়ের রূপকথা\n• ✍️ <b>English B:</b> Strong Roots, The Night Train at Deoli, The Bet, Ulysses`;
            const keyboard = {
              inline_keyboard: [
                [{ text: "🧬 Bio Unit 1: Reproduction", callback_data: "chap_bio1" }, { text: "🧬 Bio Unit 2: Genetics", callback_data: "chap_bio2" }],
                [{ text: "📖 Bengali: আদিরিনী / ভাষা", callback_data: "chap_ben" }, { text: "✍️ English: Strong Roots / The Bet", callback_data: "chap_eng" }],
                [{ text: "🏠 Main Menu", callback_data: "menu_home" }]
              ]
            };
            await sendMsg(chatId, chapSelectHtml, keyboard);
            return;
          }

          // Chapter specified
          await sendAction(chatId, "typing");
          try {
            const prompt = `Create a high quality WBCHSE Class 12 MCQ question in Bengali/English for chapter: '${rawParam}'. Format with 4 clear options A, B, C, D and provide correct answer and short 2-line explanation.`;
            const qAnswer = await generateAIAnswer(prompt, chatId);
            const qHtml = `🎯 <b>Chapter Question Generator: ${rawParam.toUpperCase()}</b>\n\n${qAnswer}`;
            const keyboard = {
              inline_keyboard: [
                [{ text: "⚡ Generate Another Question", callback_data: "menu_chapter" }],
                [{ text: "🏠 Main Menu", callback_data: "menu_home" }]
              ]
            };
            await sendMsg(chatId, qHtml, keyboard);
          } catch (err: any) {
            await sendMsg(chatId, `⚠️ <b>Question Generator Error:</b> ${err.message}`);
          }
          return;
        }

        // Handle /keys or /key or /apikey command
        if (text.startsWith("/keys") || text.startsWith("/key") || text.startsWith("/apikey")) {
          const parts = text.split(/\s+/);
          const providedKey = parts.length > 1 ? parts[1].trim() : "";

          if (providedKey && (providedKey.startsWith("AIza") || providedKey.length >= 15)) {
            userApiKeyMap.set(String(chatId), providedKey);
            const linkedInfo = linkedTelegramUsers.get(String(chatId));
            if (linkedInfo && linkedInfo.firebaseUid) {
              userApiKeyMap.set(linkedInfo.firebaseUid, providedKey);
            }
            saveUserKeysToDisk();

            const successMsg = `🔑 <b>Gemini API Key Activated!</b>\n\n` +
              `আপনার Gemini API Key টি এই টেলিগ্রাম অ্যাকাউন্টের সাথে যুক্ত ও সংরক্ষিত হয়েছে (Key: <code>${providedKey.substring(0, 8)}...</code>)।\n\n` +
              `এখন থেকে আপনার সমস্ত পড়াশোনার প্রশ্নের উত্তর সরাসরি আপনার কাস্টম কী দিয়ে প্রক্রিয়াকরণ করা হবে। 🚀`;
            const keyboard = { inline_keyboard: [[{ text: "🤖 Try AI Tutor", callback_data: "menu_ai" }, { text: "🏠 Main Menu", callback_data: "menu_home" }]] };
            await sendMsg(chatId, successMsg, keyboard);
            return;
          }

          const existingUserKey = getCustomApiKeyForUser(chatId);
          const isUserLinked = linkedTelegramUsers.has(String(chatId));
          const linkedInfo = linkedTelegramUsers.get(String(chatId));

          const keysHtml = `🔑 <b>ACCOUNT & API KEY STATUS</b>\n\n` +
            `• <b>Linked Web Account:</b> ${isUserLinked ? `✅ ${linkedInfo?.displayName}` : "❌ Not Linked"}\n` +
            `• <b>Telegram ID:</b> <code>${chatId}</code>\n` +
            `• <b>API Key Status:</b> ${existingUserKey ? `✅ Custom Key Active (<code>${existingUserKey.substring(0, 8)}...</code>)` : "⚡ Default System Key Active"}\n` +
            `• <b>AI Model Status:</b> Google Gemini 3.8 Flash AI Active\n\n` +
            `<b>কাস্টম Gemini API Key কীভাবে যুক্ত করবেন?</b>\n` +
            `টাইপ করুন: <code>/key YOUR_GEMINI_API_KEY</code>\n` +
            `<i>উদাহরণ: <code>/key AIzaSyB123...</code></i>\n\n` +
            `<i>অথবা Web App-এর Telegram Portal / Settings থেকে এপিআই কী সেভ করলেই তা স্বয়ংক্রিয়ভাবে বটের সাথে সিঙ্ক হয়ে যাবে! 🚀</i>`;

          const keyboard = {
            inline_keyboard: [
              isUserLinked ? [{ text: "❌ Unlink Account", callback_data: "menu_unlink" }] : [{ text: "🔗 Connect Web App", callback_data: "menu_connect" }],
              [{ text: "🏠 Main Menu", callback_data: "menu_home" }]
            ]
          };
          await sendMsg(chatId, keysHtml, keyboard);
          return;
        }

        // Handle /unlink command
        if (text.startsWith("/unlink")) {
          const telIdStr = String(chatId);
          if (linkedTelegramUsers.has(telIdStr)) {
            linkedTelegramUsers.delete(telIdStr);
            saveLinkedUsersToDisk();
            await sendMsg(chatId, "✅ <b>আপনার Telegram অ্যাকাউন্টটি Study Stranger Web App থেকে ডিসকানেক্ট করা হয়েছে।</b>\nপুনরায় কানেক্ট করতে /connect টাইপ করুন।");
          } else {
            await sendMsg(chatId, "ℹ️ আপনার অ্যাকাউন্টটি বর্তমানে কোনো Web App-এর সাথে যুক্ত নেই। যুক্ত করতে /connect টাইপ করুন।");
          }
          return;
        }

        // Handle /quiz command
        if (text.startsWith("/quiz")) {
          const randomQ = class12QuizBank[Math.floor(Math.random() * class12QuizBank.length)];
          const quizHtml = `🧠 <b>WBCHSE Class 12 AI Quiz</b>\n\n<b>${randomQ.q}</b>\n\n` +
            randomQ.options.map(o => o.text).join("\n");
          
          const keyboard = {
            inline_keyboard: [
              [
                { text: randomQ.options[0].text.split(" ")[0], callback_data: randomQ.options[0].correct ? "qz_c_1" : "qz_w_1" },
                { text: randomQ.options[1].text.split(" ")[0], callback_data: randomQ.options[1].correct ? "qz_c_1" : "qz_w_1" }
              ],
              [
                { text: randomQ.options[2].text.split(" ")[0], callback_data: randomQ.options[2].correct ? "qz_c_1" : "qz_w_1" },
                { text: randomQ.options[3].text.split(" ")[0], callback_data: randomQ.options[3].correct ? "qz_c_1" : "qz_w_1" }
              ],
              [{ text: "⚡ Next Question", callback_data: "menu_quiz" }, { text: "🏠 Home", callback_data: "menu_home" }]
            ]
          };
          await sendMsg(chatId, quizHtml, keyboard);
          return;
        }

        // Handle /materials or /notes
        if (text.startsWith("/materials") || text.startsWith("/notes")) {
          const matHtml = `📚 <b>Study Materials Library (WBCHSE Sem 3)</b>\n\nSelect a subject to view revision notes & formula sheets:\n\n• 🧬 <b>Biology:</b> Reproduction, Genetics & Evolution\n• 📖 <b>Bengali A:</b> আদিরিনী, বাঙ্গালা ভাষা, ধর্ম, দিগ্বিজয়ের রূপকথা\n• ✍️ <b>English B:</b> The Bet, Strong Roots, The Night Train at Deoli, Ulysses, Riders to the Sea`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🧬 Biology Notes", callback_data: "mat_bio" }, { text: "📖 Bengali A", callback_data: "mat_ben" }],
              [{ text: "✍️ English B", callback_data: "mat_eng" }, { text: "🏠 Home", callback_data: "menu_home" }]
            ]
          };
          await sendMsg(chatId, matHtml, keyboard);
          return;
        }

        // Handle /progress
        if (text.startsWith("/progress") || text.startsWith("/stats")) {
          const progHtml = `📊 <b>STUDY STRANGER LIVE PROGRESS</b>\n\n🔥 <b>Current Streak:</b> 7 Days\n⭐ <b>XP Points:</b> 1,450 | 🏆 <b>Level:</b> 6\n📚 <b>Questions Solved:</b> 128\n🎯 <b>Overall Accuracy:</b> 86%\n\n✅ <b>Strong Areas:</b> Biology Reproduction, Mendel Genetics\n⚠️ <b>Needs Revision:</b> Molecular Basis of Inheritance (SSB, TATA Box)\n\n<i>Telegram এবং Web ডাটা সম্পূর্ণ সিঙ্ক রয়েছে! 🚀</i>`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🧠 Practice Quiz", callback_data: "menu_quiz" }],
              [{ text: "🏠 Home", callback_data: "menu_home" }]
            ]
          };
          await sendMsg(chatId, progHtml, keyboard);
          return;
        }

        // Handle /webapp or /open
        if (text.startsWith("/webapp") || text.startsWith("/open")) {
          const launchHtml = `🚀 <b>Study Stranger Web Application</b>\n\nসরাসরি ব্রাউজারে বা টেলিগ্রাম মিনি অ্যাপ হিসেবে ওপেন করতে নিচের বাটনে ক্লিক করুন:`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🚀 Open Web App", web_app: { url: webAppUrl } }],
              [{ text: "🌐 Open in Browser", url: webAppUrl }]
            ]
          };
          await sendMsg(chatId, launchHtml, keyboard);
          return;
        }

        // Handle /link
        if (text.startsWith("/link")) {
          const linkHelp = `🔗 <b>Connect Web App</b>\n\n1. Open Study Stranger on your browser/phone.\n2. Go to the <b>Telegram Portal</b> tab.\n3. Click <b>'Connect to Telegram'</b>.\n4. Click the link to instantly link your account!`;
          const keyboard = {
            inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "menu_home" }]]
          };
          await sendMsg(chatId, linkHelp, keyboard);
          return;
        }

        // Auto-detect pasted Gemini API Key (e.g. user sends key directly without /key prefix)
        const cleanTrimmedKey = text.trim();
        if ((cleanTrimmedKey.startsWith("AIzaSy") || (cleanTrimmedKey.startsWith("AIza") && cleanTrimmedKey.length >= 25)) && !cleanTrimmedKey.includes(" ")) {
          userApiKeyMap.set(String(chatId), cleanTrimmedKey);
          const linkedInfo = linkedTelegramUsers.get(String(chatId));
          if (linkedInfo && linkedInfo.firebaseUid) {
            userApiKeyMap.set(linkedInfo.firebaseUid, cleanTrimmedKey);
          }
          saveUserKeysToDisk();

          const successMsg = `🔑 <b>Gemini API Key সংরক্ষিত ও সক্রিয় হয়েছে!</b>\n\n` +
            `আপনার এপিআই কী: <code>${cleanTrimmedKey.substring(0, 8)}...</code> সফলভাবে এই অ্যাকাউন্টের সাথে যুক্ত হয়েছে।\n\n` +
            `এখন Study Stranger AI সম্পূর্ণভাবে লাইভ Google Gemini AI দিয়ে আপনার সমস্ত পড়াশোনার প্রশ্নের উত্তর দেবে! 🚀`;
          const keyboard = { inline_keyboard: [[{ text: "🤖 Ask AI Tutor", callback_data: "menu_ai" }, { text: "🏠 Main Menu", callback_data: "menu_home" }]] };
          await sendMsg(chatId, successMsg, keyboard);
          return;
        }

        // Handle regular text AI queries (24/7 AI Tutor & Normal Chat)
        let queryPrompt = text;
        if (queryPrompt.startsWith("/ai")) {
          queryPrompt = queryPrompt.replace(/^\/ai\s*/i, "").trim() || "What is the key syllabus for Class 12 WBCHSE Biology?";
        }

        if (queryPrompt) {
          userLastQueryMap.set(chatId, queryPrompt);

          // Meta AI style continuous typing indicator
          let typingActive = true;
          const typingInterval = setInterval(() => {
            if (typingActive) {
              sendAction(chatId, "typing").catch(() => {});
            }
          }, 3500);
          sendAction(chatId, "typing").catch(() => {});

          try {
            const aiReply = await generateAIAnswer(queryPrompt, chatId);
            typingActive = false;
            clearInterval(typingInterval);

            // Clean direct response without repetitive spam buttons (just like Meta AI)
            await sendMsg(chatId, aiReply);
          } catch (aiErr: any) {
            typingActive = false;
            clearInterval(typingInterval);
            console.error("[Telegram AI Chat Error]:", aiErr.message);
            await sendMsg(chatId, `⚠️ <b>Study Stranger AI:</b>\n\nদুঃখিত, সংযোগ সাময়িক ব্যস্ত ছিল। আবার একটু বলুন!`);
          }
          return;
        }
      }

      // 2. Handle Callback Queries (Inline Button clicks)
      if (update.callback_query) {
        const cq = update.callback_query;
        const data = cq.data;
        const chatId = cq.message?.chat?.id;

        // Immediate acknowledgment to remove Telegram loading spinner
        await answerCallbackQuery(botToken, cq.id);

        if (!chatId) return;

        if (data === "menu_home") {
          const welcomeHtml = `🎓 <b>STUDY STRANGER AI (WBCHSE Class 12)</b>\n\n` +
            `স্বাগতম! আমি অভিজিৎ-এর ব্যক্তিগত AI পড়াশোনার বন্ধু।\n\n` +
            `💬 <b>পড়াশোনার ডাউট বা প্রশ্ন থাকলে সরাসরি মেসেজ করো, আমি উত্তর দেব।</b>\n\n` +
            `⚙️ <b>ওয়েব অ্যাপ কানেক্ট বা সেটিংসের জন্য নিচের বাটনে ক্লিক করো।</b>`;

          const keyboard = {
            inline_keyboard: [
              [
                { text: "⚙️ Settings & Connect", callback_data: "menu_settings" }
              ],
              [
                { text: "🚀 Open Web App", web_app: { url: webAppUrl } }
              ]
            ]
          };
          await sendMsg(chatId, welcomeHtml, keyboard);
        } else if (data === "menu_settings") {
          const telIdStr = String(chatId);
          const isUserLinked = linkedTelegramUsers.has(telIdStr);
          const linkedInfo = linkedTelegramUsers.get(telIdStr);
          const existingUserKey = getCustomApiKeyForUser(chatId);

          const settingsHtml = `⚙️ <b>STUDY STRANGER SETTINGS & CONNECT</b>\n\n` +
            `• <b>কানেকশন স্ট্যাটাস:</b> ${isUserLinked ? `✅ Connected (<b>${linkedInfo?.displayName}</b>)` : "❌ Not Connected"}\n` +
            `• <b>Gemini:</b> ${existingUserKey ? `✅ Custom Key` : "⚡ Standard (Fast)"}\n\n` +
            `<i>নিচের প্রয়োজনীয় অপশনটি নির্বাচন করুন:</i>`;

          const keyboard = {
            inline_keyboard: [
              [
                isUserLinked 
                  ? { text: "❌ Disconnect Account", callback_data: "menu_unlink" }
                  : { text: "🔗 Get Connect PIN", callback_data: "menu_connect" }
              ],
              [
                { text: "🔑 Custom Gemini Key", callback_data: "menu_keys" },
                { text: "🚀 Open Web App", web_app: { url: webAppUrl } }
              ],
              [
                { text: "💬 Back to Chat", callback_data: "menu_home" }
              ]
            ]
          };
          await sendMsg(chatId, settingsHtml, keyboard);
        } else if (data === "menu_status") {
          const telIdStr = String(chatId);
          const isUserLinked = linkedTelegramUsers.has(telIdStr);
          const linkedInfo = linkedTelegramUsers.get(telIdStr);
          const existingUserKey = getCustomApiKeyForUser(chatId);

          const statusHtml = `📊 <b>LIVE CONNECTION STATUS</b>\n\n` +
            `• <b>Status:</b> ${isUserLinked ? "✅ <b>Connected & Synced</b>" : "❌ <b>Not Connected</b>"}\n` +
            (isUserLinked ? `• <b>Linked Web User:</b> <code>${linkedInfo?.displayName}</code>\n` : "") +
            `• <b>Telegram ID:</b> <code>${chatId}</code>\n` +
            `• <b>AI Engine:</b> ${existingUserKey ? "✅ Custom Key Active" : "⚡ System Default Key Active"}\n\n` +
            (isUserLinked 
              ? `<i>আপনার টেলিগ্রাম ও ওয়েব অ্যাপের সমস্ত ডাটা লাইভ সিঙ্ক রয়েছে।</i>` 
              : `<i>অ্যাপের সাথে সিঙ্ক করতে 'Get Connect PIN' অপশন ব্যবহার করুন।</i>`);

          const keyboard = {
            inline_keyboard: [
              [
                isUserLinked 
                  ? { text: "❌ Disconnect", callback_data: "menu_unlink" } 
                  : { text: "🔗 Get Connect PIN", callback_data: "menu_connect" }
              ],
              [{ text: "⚙️ Settings", callback_data: "menu_settings" }, { text: "💬 Chat", callback_data: "menu_home" }]
            ]
          };
          await sendMsg(chatId, statusHtml, keyboard);
        } else if (data === "menu_keys") {
          const existingUserKey = getCustomApiKeyForUser(chatId);
          const isUserLinked = linkedTelegramUsers.has(String(chatId));

          const keysHtml = `🔑 <b>CUSTOM GEMINI API KEY</b>\n\n` +
            `• <b>Current Key:</b> ${existingUserKey ? `✅ Active (<code>${existingUserKey.substring(0, 8)}...</code>)` : "⚡ System Default Key"}\n\n` +
            `<b>কীভাবে কাস্টম কী যুক্ত করবেন?</b>\n` +
            `টাইপ করুন: <code>/key YOUR_GEMINI_API_KEY</code>\n\n` +
            `<i>অথবা Study Stranger Web App-এর Settings থেকে এপিআই কী সেট করলে তা স্বয়ংক্রিয়ভাবে এখানে সিঙ্ক হয়ে যাবে।</i>`;

          const keyboard = {
            inline_keyboard: [
              [{ text: "⚙️ Settings", callback_data: "menu_settings" }, { text: "💬 Chat", callback_data: "menu_home" }]
            ]
          };
          await sendMsg(chatId, keysHtml, keyboard);
        } else if (data === "menu_ai") {
          await sendMsg(chatId, "💬 <b>Chat Mode:</b>\n\nপড়াশোনার যেকোনো প্রশ্ন বা ডাউট এখানে সরাসরি বাংলায় বা ইংরেজিতে লিখুন।", {
            inline_keyboard: [[{ text: "⚙️ Settings", callback_data: "menu_settings" }]]
          });
        } else if (data === "menu_materials") {
          const matHtml = `📚 <b>Study Notes Library (WBCHSE Class 12)</b>\n\nকোন বিষয়ের নোটস দেখতে চান নির্বাচন করুন:\n\n• 🧬 Biology Unit 1 & 2\n• 📖 Bengali A\n• ✍️ English B`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🧬 Biology", callback_data: "mat_bio" }, { text: "📖 Bengali A", callback_data: "mat_ben" }],
              [{ text: "✍️ English B", callback_data: "mat_eng" }, { text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, matHtml, keyboard);
        } else if (data === "mat_bio") {
          const bioHtml = `🧬 <b>Class 12 Biology Quick Notes (WBCHSE)</b>\n\n<b>Unit I: Reproduction</b>\n• <i>Microsporogenesis:</i> মাইক্রোস্পোর মাদার সেল (2n) থেকে মিয়োসিস দ্বারা ৪টি পরাগরেণু (n) গঠন।\n• <i>Fertilization:</i> ফ্যালোপিয়ান নালীর অ্যাম্পুলা অংশে ঘটে; শুক্রাণু ZP3 রিসেপ্টরে যুক্ত হয়।\n• <i>LH Surge:</i> ১৪তম দিনে ঘটে যা ওভুলেশনের জন্য দায়ী।\n• <i>STDs:</i> সিফিলিস (<i>Treponema pallidum</i>), এইডস (HIV), ক্ল্যামাইডিয়া।\n\n<b>Unit II: Genetics & Evolution</b>\n• <i>DNA Base Pairs:</i> A=T (২টি বন্ড), G≡C (৩টি বন্ড)।\n• <i>Replication:</i> SSB প্রোটিন আনওয়াইন্ডেড স্ট্র্যান্ডকে স্থিতিশীল রাখে।\n• <i>Transcription:</i> RNA পলিমারেজ TATA Box প্রমোটার চিহ্নিত করে।`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🧠 Practice Biology Quiz", callback_data: "menu_quiz" }],
              [{ text: "📚 Other Subjects", callback_data: "menu_materials" }, { text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, bioHtml, keyboard);
        } else if (data === "mat_ben") {
          const benHtml = `📖 <b>বাংলা এ (উচ্চমাধ্যমিক) সারসংক্ষেপ</b>\n\n<b>গল্প/প্রবন্ধ:</b>\n• <i>আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়):</i> জয়রাম মুখুজ্জে ২০০০ টাকায় হস্তিনী আদিরিনীকে কিনেছিলেন। মানবিক স্নেহ ও সামাজিক বাস্তবতার গল্প।\n• <i>বাঙ্গালা ভাষা (স্বামী বিবেকানন্দ):</i> মুখের ভাষা ও সাহিত্যের ভাষার মেলবন্ধন এবং আধুনিক শিক্ষার প্রয়োজনীয়তা।\n\n<b>কবিতা:</b>\n• <i>ধর্ম (শ্রীজাত):</i> প্রাতিষ্ঠানিক ধর্মের চেয়ে মানুষের মানবধর্ম শ্রেষ্ঠ।\n• <i>দিগ্বিজয়ের রূপকথা (নবনীতা দেবসেন):</i> ভেতরের ভয় জয় করে এগিয়ে চলার রূপক।`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "📚 Other Subjects", callback_data: "menu_materials" }, { text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, benHtml, keyboard);
        } else if (data === "mat_eng") {
          const engHtml = `✍️ <b>English B Revision Notes</b>\n\n<b>Prose:</b>\n• <i>The Bet (Anton Chekhov):</i> 2 Million Rubles wager for 15 years of solitary confinement; debate between capital punishment & life imprisonment.\n• <i>Strong Roots (APJ Abdul Kalam):</i> Spiritual upbringing in Rameswaram with father Jainulabdeen.\n• <i>The Night Train at Deoli (Ruskin Bond):</i> Nostalgic encounter with the basket-selling girl.\n\n<b>Verse:</b>\n• <i>Ulysses (Tennyson):</i> "To strive, to seek, to find, and not to yield."\n• <i>Riders to the Sea (J.M. Synge):</i> Tragedy of Maurya losing her sons to the sea.`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "📚 Other Subjects", callback_data: "menu_materials" }, { text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, engHtml, keyboard);
        } else if (data === "menu_quiz") {
          const randomQ = class12QuizBank[Math.floor(Math.random() * class12QuizBank.length)];
          const quizHtml = `🧠 <b>WBCHSE Class 12 Quiz</b>\n\n<b>${randomQ.q}</b>\n\n` +
            randomQ.options.map(o => o.text).join("\n");
          
          const keyboard = {
            inline_keyboard: [
              [
                { text: randomQ.options[0].text.split(" ")[0], callback_data: randomQ.options[0].correct ? "qz_c_1" : "qz_w_1" },
                { text: randomQ.options[1].text.split(" ")[0], callback_data: randomQ.options[1].correct ? "qz_c_1" : "qz_w_1" }
              ],
              [
                { text: randomQ.options[2].text.split(" ")[0], callback_data: randomQ.options[2].correct ? "qz_c_1" : "qz_w_1" },
                { text: randomQ.options[3].text.split(" ")[0], callback_data: randomQ.options[3].correct ? "qz_c_1" : "qz_w_1" }
              ],
              [{ text: "⚡ Next Question", callback_data: "menu_quiz" }, { text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, quizHtml, keyboard);
        } else if (data === "qz_c_1" || data === "qz_correct") {
          await sendMsg(chatId, "🎉 <b>দারুণ! সঠিক উত্তর! (+10 XP)</b>", {
            inline_keyboard: [[{ text: "⚡ Next Question", callback_data: "menu_quiz" }, { text: "⚙️ Settings", callback_data: "menu_settings" }]]
          });
        } else if (data === "qz_w_1" || data === "qz_wrong") {
          await sendMsg(chatId, "❌ <b>ভুল উত্তর!</b>\n\nসঠিক তথ্যটি জেনে নিয়ে পরের প্রশ্নে এগিয়ে যাও।", {
            inline_keyboard: [[{ text: "🔄 Try Another", callback_data: "menu_quiz" }, { text: "📚 Study Notes", callback_data: "menu_materials" }]]
          });
        } else if (data === "ai_simp") {
          await sendAction(chatId, "typing");
          const lastQuery = userLastQueryMap.get(chatId) || "WBCHSE Class 12 Syllabus";
          const simplified = await generateAIAnswer(`Explain '${lastQuery}' in very simple terms for a Class 12 student with everyday examples and easy Bengali/English explanation.`, chatId);
          await sendMsg(chatId, `💡 <b>সহজ ভাষায় ব্যাখ্যা:</b>\n\n${simplified}`, {
            inline_keyboard: [[{ text: "⚙️ Settings", callback_data: "menu_settings" }, { text: "💬 Chat", callback_data: "menu_home" }]]
          });
        } else if (data === "ai_det") {
          await sendAction(chatId, "typing");
          const lastQuery = userLastQueryMap.get(chatId) || "WBCHSE Class 12 Syllabus";
          const detailed = await generateAIAnswer(`Provide a complete 5-mark structured WBCHSE examination standard answer for '${lastQuery}' with headings, points, and diagram guidelines.`, chatId);
          await sendMsg(chatId, `📖 <b>পরীক্ষার বিস্তারিত সমাধান (৫ নম্বরের মান):</b>\n\n${detailed}`, {
            inline_keyboard: [[{ text: "⚙️ Settings", callback_data: "menu_settings" }, { text: "💬 Chat", callback_data: "menu_home" }]]
          });
        } else if (data === "menu_link" || data === "menu_connect") {
          const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = Date.now() + 10 * 60 * 1000;

          telegramAppPinMap.set(pinCode, {
            chatId,
            username: cq.from?.username,
            firstName: cq.from?.first_name,
            expiresAt
          });

          const pinHtml = `🔗 <b>STUDY STRANGER APP CONNECT PIN</b>\n\n` +
            `🔑 <b>আপনার ৬-ডিজিটের কানেক্ট কোড:</b>\n` +
            `<code><b>${pinCode}</b></code>\n\n` +
            `📍 <b>কানেক্ট করার ৩টি সহজ ধাপ:</b>\n` +
            `1️⃣ Study Stranger Web App ওপেন করুন।\n` +
            `2️⃣ <b>Telegram Portal</b> ট্যাবে যান।\n` +
            `3️⃣ <b>'Enter 6-Digit PIN'</b> বক্সে <code><b>${pinCode}</b></code> বসিয়ে <b>Verify & Link</b> এ ক্লিক করুন!\n\n` +
            `⏰ <i>এই পিনটি আগামী ১০ মিনিট পর্যন্ত সচল থাকবে।</i>`;

          const keyboard = {
            inline_keyboard: [
              [{ text: "🚀 Open Web App & Link", web_app: { url: webAppUrl } }],
              [{ text: "⚙️ Settings", callback_data: "menu_settings" }, { text: "💬 Chat", callback_data: "menu_home" }]
            ]
          };

          await sendMsg(chatId, pinHtml, keyboard);
        } else if (data === "menu_chapter") {
          const chapSelectHtml = `🎯 <b>Chapter Practice</b>\n\nযে চ্যাপ্টারের প্রশ্ন করতে চাও সিলেক্ট করো:\n\n• 🧬 <b>Biology Unit 1 & 2</b>\n• 📖 <b>Bengali A</b>\n• ✍️ <b>English B</b>`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🧬 Bio Unit 1", callback_data: "chap_bio1" }, { text: "🧬 Bio Unit 2", callback_data: "chap_bio2" }],
              [{ text: "📖 Bengali A", callback_data: "chap_ben" }, { text: "✍️ English B", callback_data: "chap_eng" }],
              [{ text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, chapSelectHtml, keyboard);
        } else if (data.startsWith("chap_")) {
          await sendAction(chatId, "typing");
          let subjectTopic = "Biology Unit 1 Reproduction";
          if (data === "chap_bio2") subjectTopic = "Biology Unit 2 Genetics and Evolution";
          else if (data === "chap_ben") subjectTopic = "Bengali A Adarini and Language";
          else if (data === "chap_eng") subjectTopic = "English B Strong Roots and The Bet";

          try {
            const prompt = `Create a high quality WBCHSE Class 12 MCQ question in Bengali/English for subject: '${subjectTopic}'. Format with 4 clear options A, B, C, D and provide correct answer and short explanation.`;
            const qAnswer = await generateAIAnswer(prompt, chatId);
            const qHtml = `🎯 <b>Chapter Practice: ${subjectTopic}</b>\n\n${qAnswer}`;
            const keyboard = {
              inline_keyboard: [
                [{ text: "⚡ Next Question", callback_data: data }],
                [{ text: "⚙️ Settings", callback_data: "menu_settings" }]
              ]
            };
            await sendMsg(chatId, qHtml, keyboard);
          } catch (err: any) {
            await sendMsg(chatId, `⚠️ <b>Question Error:</b> ${err.message}`);
          }
        } else if (data === "menu_unlink") {
          const telIdStr = String(chatId);
          linkedTelegramUsers.delete(telIdStr);
          saveLinkedUsersToDisk();
          await sendMsg(chatId, "✅ <b>আপনার Telegram অ্যাকাউন্টটি Web App থেকে ডিসকানেক্ট করা হয়েছে।</b>\nপুনরায় কানেক্ট করতে /connect বাটন চাপুন।", {
            inline_keyboard: [[{ text: "🔗 Connect Web App", callback_data: "menu_connect" }], [{ text: "⚙️ Settings", callback_data: "menu_settings" }]]
          });
        } else if (data === "menu_progress") {
          const progHtml = `📊 <b>MY PROGRESS REPORT</b>\n\n🔥 <b>Streak:</b> 7 Days\n⭐ <b>XP:</b> 1,450 | 🏆 <b>Level:</b> 6\n📚 <b>Questions Solved:</b> 128\n🎯 <b>Accuracy:</b> 86%\n\n<i>Study Stranger Web ও Telegram ডাটা সিঙ্কড রয়েছে! 🚀</i>`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "🧠 Practice Quiz", callback_data: "menu_quiz" }],
              [{ text: "⚙️ Settings", callback_data: "menu_settings" }]
            ]
          };
          await sendMsg(chatId, progHtml, keyboard);
        } else if (data === "menu_live_call") {
          const liveCallHtml = `🎙️ <b>DIRECT 1:1 LIVE TALK WITH STUDY STRANGER</b>\n\n` +
            `অভিজিৎ, তুমি এখন সরাসরি Study Stranger AI-এর সাথে রিয়েল-টাইমে লাইভ কথা বলতে পারবে!\n\n` +
            `• 🗣️ কোনো টাইপিং ছাড়া মুখে বাংলায় বা ইংরেজিতে ডাউট জিজ্ঞাসা করো\n` +
            `• ⚡ নিমেষেই লাইভ ভয়েসে উত্তর শোনো\n` +
            `• 📐 সম্পূর্ণ ইন্টারঅ্যাক্টিভ লাইভ সেশন\n\n` +
            `<i>নিচের <b>'🎙️ Start 1:1 Live Call'</b> বাটনে ট্যাপ করো:</i>`;

          const keyboard = {
            inline_keyboard: [
              [
                { text: "🎙️ Start 1:1 Live Call (সরাসরি লাইভ কথা বলুন)", web_app: { url: `${webAppUrl}?open=live_board` } }
              ],
              [
                { text: "🌐 Open in Browser", url: `${webAppUrl}?open=live_board` }
              ],
              [
                { text: "🏠 Main Menu", callback_data: "menu_home" }
              ]
            ]
          };
          await sendMsg(chatId, liveCallHtml, keyboard);
        }
      }
    } catch (err: any) {
      console.error("[Telegram Processor 24/7] Error:", err.message);
    } finally {
      if (msgKey) {
        inFlightMessages.delete(msgKey);
      }
    }
  };

  // --- Telegram Webhook Endpoint ---
  app.post("/telegram/webhook", async (req: any, res: any) => {
    res.status(200).send("OK");
    try {
      const update = req.body;
      if (update) {
        await processTelegramUpdate(update);
      }
    } catch (err: any) {
      console.error("[Telegram Webhook] Error:", err.message);
    }
  });

  // --- Telegram 24/7 Long-Polling Engine with Auto-Conflict Recovery ---
  let isPolling = false;

  const startTelegramPolling = () => {
    const botToken = getActiveTelegramBotToken();
    if (!botToken) return;

    console.log("[Telegram Poller] Initializing 24/7 active engine...");

    // Clear any conflicting webhooks at startup to guarantee getUpdates works
    fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook?drop_pending_updates=false`, { method: "POST" })
      .catch(() => {});

    // If lastUpdateId is 0 (first startup without saved state), fetch latest update to skip historical queue
    if (lastUpdateId === 0) {
      fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=-1`)
        .then(r => r.json())
        .then((d: any) => {
          if (d.ok && Array.isArray(d.result) && d.result.length > 0) {
            lastUpdateId = d.result[d.result.length - 1].update_id;
            saveTelegramState();
            console.log(`[Telegram Poller] Initialized offset to latest update_id: ${lastUpdateId}`);
          }
        })
        .catch(() => {});
    }

    const poll = async () => {
      if (isPolling) return;
      isPolling = true;
      try {
        const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=15`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data: any = await res.json();
          if (data.ok && Array.isArray(data.result)) {
            for (const update of data.result) {
              if (update.update_id > lastUpdateId) {
                lastUpdateId = update.update_id;
                saveTelegramState();
              }
              try {
                console.log(`[Telegram Poller] Processing update ${update.update_id}`);
                await processTelegramUpdate(update);
              } catch (procErr: any) {
                console.error(`[Telegram Poller Error] Update ${update.update_id} failed:`, procErr.message);
              }
            }
          }
        } else if (res.status === 409) {
          // 409 Conflict: webhook is set, clear webhook immediately
          console.warn("[Telegram Poller] Conflict detected, resetting webhook...");
          await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook?drop_pending_updates=false`, { method: "POST" }).catch(() => {});
        }
      } catch (pollErr: any) {
        // Network timeout or drop, proceed to next iteration
      } finally {
        isPolling = false;
        setTimeout(poll, 400);
      }
    };

    poll();
  };

  startTelegramPolling();

}