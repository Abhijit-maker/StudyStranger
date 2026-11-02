export function convertBengaliDigits(str: string): string {
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, (m) => bnToEn[m]);
}

export function processCommand(command: string, userName: string = "Abhijit"): {
  action: string;
  url?: string;
  isBrowserAction: boolean;
} {
  const lowerCmd = command.toLowerCase().trim();
  const inputWithEnDigits = convertBengaliDigits(lowerCmd);

  // Match named characters for call commands before standard numbers
  if (lowerCmd.includes("call") || lowerCmd.includes("dial") || lowerCmd.includes("phone") || lowerCmd.includes("কল") || lowerCmd.includes("ফোন")) {
    const names = ["mahi", "stranger", "anjali", "zoya", "khud", "rohan", "ishani"];
    const characterNumbers: Record<string, string> = {
      mahi: "+919007012345",
      stranger: "+15550192834",
      anjali: "+919830155678",
      zoya: "+919433099121",
      khud: "+918888888888",
      rohan: "+919123456789",
      ishani: "+919051065432",
    };

    for (const name of names) {
      if (lowerCmd.includes(name)) {
        return {
          action: `calling:${characterNumbers[name]}`,
          isBrowserAction: false,
        };
      }
    }

    // Bengali direct matching
    if (lowerCmd.includes("মাহি") || lowerCmd.includes("মারী")) {
      return { action: "calling:+919007012345", isBrowserAction: false };
    }
    if (lowerCmd.includes("স্ট্রেঞ্জার") || lowerCmd.includes("স্ট্রেঞ্জার")) {
      return { action: "calling:+15550192834", isBrowserAction: false };
    }
    if (lowerCmd.includes("অঞ্জলি") || lowerCmd.includes("অঞ্জলী")) {
      return { action: "calling:+919830155678", isBrowserAction: false };
    }
    if (lowerCmd.includes("জোয়া") || lowerCmd.includes("জয়া")) {
      return { action: "calling:+919433099121", isBrowserAction: false };
    }
    if (lowerCmd.includes("খুদ") || lowerCmd.includes("নিজের")) {
      return { action: "calling:+918888888888", isBrowserAction: false };
    }
    if (lowerCmd.includes("রোহন") || lowerCmd.includes("রোহান")) {
      return { action: "calling:+919123456789", isBrowserAction: false };
    }
    if (lowerCmd.includes("ঈশানি") || lowerCmd.includes("ইশানি") || lowerCmd.includes("ঈশানী")) {
      return { action: "calling:+919051065432", isBrowserAction: false };
    }
  }

  // Call / Dial: Match "call 9876543210", "phone 9876543210", "dial...", "call koro...", "+91..." 
  const callMatch = inputWithEnDigits.match(/(?:call|dial|phone|phn|call\s+koro|phone\s+koro|phn\s+koro)\s*(?:a\s+)?(?:to\s+)?(\+?\d[\d\s-]{4,14}\d)/i);
  if (callMatch) {
    const rawNumber = callMatch[1].replace(/[\s-]/g, "");
    return {
      action: `calling:${rawNumber}`,
      isBrowserAction: false,
    };
  }

  // General call or contacts intention (e.g., "phone korte chai", "call koro", "open contacts", "ফোন করতে চাই", "কন্টাক্ট দেখতে চাই")
  if (
    lowerCmd.includes("contact") ||
    lowerCmd.includes("কন্টাক্ট") ||
    lowerCmd.includes("ফোন করতে চাই") ||
    lowerCmd.includes("কল করতে চাই") ||
    lowerCmd.includes("কাউকে কল") ||
    lowerCmd.includes("কাউকে ফোন") ||
    lowerCmd.includes("phone korte") ||
    lowerCmd.includes("call korte") ||
    lowerCmd.includes("dial pad") ||
    lowerCmd.includes("ডায়াল প্যাড") ||
    (lowerCmd.includes("ফোন") && (lowerCmd.includes("কর") || lowerCmd.includes("খোল") || lowerCmd.includes("ওপেন"))) ||
    (lowerCmd.includes("কল") && (lowerCmd.includes("কর") || lowerCmd.includes("খোল") || lowerCmd.includes("ওপেন")))
  ) {
    return {
      action: lowerCmd.includes("contact") || lowerCmd.includes("কন্টাক্ট") ? "open_contacts" : "open_phone_action",
      isBrowserAction: false,
    };
  }

  // Natural Question & Quiz Commands in Bengali & English
  if (
    lowerCmd.includes("question generate") || 
    lowerCmd.includes("questions generate") || 
    lowerCmd.includes("mcq generate") || 
    lowerCmd.includes("quiz generate") ||
    lowerCmd.includes("question banao") ||
    lowerCmd.includes("mcq banao") ||
    lowerCmd.includes("quiz banao") ||
    lowerCmd.includes("question dhoro") ||
    lowerCmd.includes("test nao") ||
    lowerCmd.includes("quiz nao") ||
    lowerCmd.includes("প্রশ্ন তৈরি") ||
    lowerCmd.includes("কুইজ তৈরি") ||
    lowerCmd.includes("প্রশ্ন ধরো") ||
    lowerCmd.includes("কুইজ নাও") ||
    lowerCmd.includes("mcq dao") ||
    lowerCmd.includes("question dao")
  ) {
    let topic = "WBCHSE Class 12 Syllabus";
    const topicExtract = lowerCmd
      .replace(/(?:mahi|stranger|rohan|anjali|ishani)/gi, "")
      .replace(/(?:question|questions|mcq|mcqs|quiz|test|probir|porikkha|prosno|proshno|প্রশ্ন|কুইজ|এমসিকিউ)/gi, "")
      .replace(/(?:generate|banao|dhoro|koro|toiri|dao|create|make|chalu|start|open|nao|theke|te|er|on|for|about|amar|ekta|kichu)/gi, "")
      .trim();

    if (topicExtract.length > 2) {
      topic = topicExtract;
    }
    return {
      action: `quiz:${topic}`,
      isBrowserAction: false,
    };
  }

  // Study Tools: "Start flashcards on [topic]" or "Take a quiz on [topic]"
  const flashcardMatch = lowerCmd.match(/^(?:start|show|open)\s+flashcards?\s+(?:on|for|about)?\s*(.+)$/);
  if (flashcardMatch) {
    return {
      action: `flashcards:${flashcardMatch[1].trim()}`,
      isBrowserAction: false,
    };
  }

  const quizMatch = lowerCmd.match(/^(?:start|take|open|make|create|generate)\s+(?:a\s+|some\s+)?(?:quiz|questions?|mcqs?)\s+(?:on|for|about)?\s*(.+)$/);
  if (quizMatch) {
    return {
      action: `quiz:${quizMatch[1].trim()}`,
      isBrowserAction: false,
    };
  }

  // Summary Commands: "Summarize this chapter" or "Give me key points of [topic]"
  const summaryMatch = lowerCmd.match(/^(?:summarize|summary|give\s+me\s+a\s+summary\s+of)\s+(?:this\s+chapter|the\s+chapter|this\s+topic|(.+))$/);
  if (summaryMatch) {
    const topic = summaryMatch[1] ? summaryMatch[1].trim() : "current lesson";
    return {
      action: `summary:${topic}`,
      isBrowserAction: false,
    };
  }

  const keyPointsMatch = lowerCmd.match(/^(?:give\s+me\s+)?(?:the\s+)?key\s+points\s+(?:of|for|about)?\s*(?:this\s+chapter|this\s+topic|(.+))$/);
  if (keyPointsMatch) {
    const topic = keyPointsMatch[1] ? keyPointsMatch[1].trim() : "current lesson";
    return {
      action: `keypoints:${topic}`,
      isBrowserAction: false,
    };
  }

  // Syllabus Command: "Show me the syllabus" or "Open syllabus"
  if (lowerCmd.includes("syllabus") && (lowerCmd.includes("show") || lowerCmd.includes("open") || lowerCmd.includes("view"))) {
    return {
      action: "syllabus:open",
      isBrowserAction: false,
    };
  }

  // Subtitles Toggle: "Hide subtitles" or "Show subtitles"
  if (lowerCmd.includes("subtitle") || lowerCmd.includes("caption") || lowerCmd.includes("lekha")) {
    if (lowerCmd.includes("hide") || lowerCmd.includes("remove") || lowerCmd.includes("hatau") || lowerCmd.includes("bondho")) {
      return {
        action: "subtitles:hide",
        isBrowserAction: false,
      };
    }
    if (lowerCmd.includes("show") || lowerCmd.includes("on") || lowerCmd.includes("chalu")) {
      return {
        action: "subtitles:show",
        isBrowserAction: false,
      };
    }
  }

  // Reels/Shorts: "Show me reels" or "Play shorts"
  if (lowerCmd.includes("reels") || lowerCmd.includes("shorts") || lowerCmd.includes("scroll") || lowerCmd.includes("next")) {
    const isInstagram = lowerCmd.includes("reels") || lowerCmd.includes("instagram");
    const isScroll = lowerCmd.includes("scroll") || lowerCmd.includes("next");
    
    const url = isInstagram 
      ? "https://www.instagram.com/reels/" 
      : "https://www.youtube.com/shorts";
      
    return {
      action: isScroll 
        ? `Scrolling to the next one for you, ${userName}.` 
        : `Sure ${userName}, let's watch some ${isInstagram ? "Instagram Reels" : "YouTube Shorts"} together.`,
      url,
      isBrowserAction: true,
    };
  }

  // General Browsing: "Open [website name]"
  const openMatch = lowerCmd.match(/^open\s+(.+)$/);
  if (
    openMatch &&
    !lowerCmd.includes("youtube") &&
    !lowerCmd.includes("spotify")
  ) {
    let website = openMatch[1].trim().replace(/\s+/g, "");
    if (!website.includes(".")) {
      website += ".com";
    }
    return {
      action: `Opening ${openMatch[1]} for you, ${userName}.`,
      url: `https://www.${website}`,
      isBrowserAction: true,
    };
  }

  // Media Search: "Play [song/video] on YouTube" or just "Play [song/video]"
  const ytMatch = lowerCmd.match(/^play\s+(.+?)(?:\s+on\s+youtube)?$/);
  if (ytMatch) {
    const query = encodeURIComponent(ytMatch[1].trim() + " official video");
    return {
      action: `Playing ${ytMatch[1]} for you, ${userName}. I'm searching for the most relevant video.`,
      url: `https://www.youtube.com/results?search_query=${query}`,
      isBrowserAction: true,
    };
  }

  // Media Search: "Search [query] on Spotify"
  const spotifyMatch = lowerCmd.match(/^search\s+(.+?)\s+on\s+spotify$/);
  if (spotifyMatch) {
    const query = encodeURIComponent(spotifyMatch[1].trim());
    return {
      action: `Searching ${spotifyMatch[1]} on Spotify. Hope you like it, ${userName}.`,
      url: `https://open.spotify.com/search/${query}`,
      isBrowserAction: true,
    };
  }

  // WhatsApp Web: "Send a WhatsApp message to [number] saying [message]"
  const waMatch = lowerCmd.match(
    /^send\s+a\s+whatsapp\s+message\s+to\s+([\d\+\s]+)\s+saying\s+(.+)$/,
  );
  if (waMatch) {
    const number = waMatch[1].replace(/\s+/g, "");
    const message = encodeURIComponent(waMatch[2].trim());
    return {
      action: `Sending your message. Let's hope they reply, ${userName}.`,
      url: `https://web.whatsapp.com/send?phone=${number}&text=${message}`,
      isBrowserAction: true,
    };
  }

  // General Search: "Search for [query]" or just "Search [query]"
  const searchMatch = lowerCmd.match(/^(?:search\s+for|search)\s+(.+)$/);
  if (searchMatch) {
    const query = encodeURIComponent(searchMatch[1].trim());
    return {
      action: `Searching Google for ${searchMatch[1]}, ${userName}.`,
      url: `https://www.google.com/search?q=${query}`,
      isBrowserAction: true,
    };
  }

  // Fallback for direct questions that sound like searches
  if (lowerCmd.startsWith("what is") || lowerCmd.startsWith("how to") || lowerCmd.startsWith("who is")) {
    const query = encodeURIComponent(lowerCmd);
    return {
      action: `Let me search that for you, ${userName}.`,
      url: `https://www.google.com/search?q=${query}`,
      isBrowserAction: true,
    };
  }

  return { action: "", isBrowserAction: false };
}
