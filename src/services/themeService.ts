export interface AppTheme {
  id: string;
  name: string;
  banglaName: string;
  description: string;
  category: "classic" | "modern" | "zen" | "luxury";
  accentColor: string;
  secondaryColor: string;
  previewBg: string;
  previewCard: string;
  glowColor: string;
  badge: string;
}

export const APP_THEMES: AppTheme[] = [
  {
    id: "medkarma",
    name: "Med Karma Enterprise (Navy & Cyan)",
    banglaName: "মেড কার্মা এন্টারপ্রাইজ (নেভি ও সায়ান)",
    description: "প্রফেশনাল আরসিএম ও মেডিকেল এআই স্টাইল — ডিপ ওশানিক নেভি ক্যানভাস, ক্রিস্প সায়ান গ্লো এবং আল্ট্রা-ক্লিন আধুনিক ইন্টারফেস।",
    category: "modern",
    accentColor: "#0EA5E9",
    secondaryColor: "#10B981",
    previewBg: "linear-gradient(135deg, #0B1528 0%, #030816 100%)",
    previewCard: "#0F1E36",
    glowColor: "rgba(14, 165, 233, 0.45)",
    badge: "🏆 মেড কার্মা স্পেশাল"
  },
  {
    id: "smart_notes",
    name: "Smart Notes & Study AI (Neo-Violet)",
    banglaName: "স্মার্ট নোটস ও স্টাডি এআই (নিও-ভায়োলেট)",
    description: "রেফারেন্স ইউআই অনুসারে আধুনিক ল্যাভেন্ডার ফ্রস্টেড গ্লাস, ভাইব্রেন্ট নিয়ন পার্পল, সায়ান এবং থ্রিডি এআই ম্যাসহিত ডিজাইন।",
    category: "modern",
    accentColor: "#8B5CF6",
    secondaryColor: "#EC4899",
    previewBg: "linear-gradient(135deg, #1E1035 0%, #0D061A 100%)",
    previewCard: "#261545",
    glowColor: "rgba(139, 92, 246, 0.45)",
    badge: "⭐ ট্রেন্ডিং ইউআই"
  },
  {
    id: "cyber_emerald",
    name: "AI Learn Cyber Emerald",
    banglaName: "এআই লার্ন সাইবার এমারেল্ড",
    description: "ফিউচারিস্টিক ডার্ক মোড — ডিপ অবসিবিয়ান, নিয়ন এমারেল্ড গ্লো এবং থ্রিডি রোবট কম্প্যানিয়ন।",
    category: "modern",
    accentColor: "#10B981",
    secondaryColor: "#06B6D4",
    previewBg: "linear-gradient(135deg, #061A14 0%, #030D0A 100%)",
    previewCard: "#0B291F",
    glowColor: "rgba(16, 185, 129, 0.4)",
    badge: "সাইবার গ্রিন"
  },
  {
    id: "astra",
    name: "GPT-6 Astra Premium",
    banglaName: "অ্যাস্ট্রা প্রো প্রিমিয়াম (GPT-6)",
    description: "Ultra-sleek luxury dark mode powered by Astra AI geometry, starlight silver accents, and infinite black canvas.",
    category: "luxury",
    accentColor: "#F5F5F5",
    secondaryColor: "#333333",
    previewBg: "linear-gradient(135deg, #050505 0%, #000000 100%)",
    previewCard: "#111111",
    glowColor: "rgba(255, 255, 255, 0.15)",
    badge: "PRO PREMIUM"
  },
  {
    id: "classic",
    name: "Classic Bengal Saffron",
    banglaName: "ডিফল্ট ক্লাসিকাল (বেঙ্গল স্যাফরন)",
    description: "আসল ডিফল্ট লুক — প্রাণবন্ত স্যাফরন কমলা, স্লিক স্লেট এবং হাই-কনট্রাস্ট একাডেমি ডিজাইন।",
    category: "classic",
    accentColor: "#FF7A30",
    secondaryColor: "#ea580c",
    previewBg: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
    previewCard: "#292524",
    glowColor: "rgba(255, 122, 48, 0.35)",
    badge: "মূল ডিফল্ট"
  },
  {
    id: "cyber",
    name: "Cyber Neon Matrix",
    banglaName: "সাইবার নিয়ন অরোরা",
    description: "ফিউচারিস্টিক হাই-টেক স্টাডি ল্যাব — ডিপ অবসিবিয়ান ব্ল্যাক, ইলেকট্রিক সায়ান ও নিয়ন পার্পল হাইলাইটস।",
    category: "modern",
    accentColor: "#06b6d4",
    secondaryColor: "#8b5cf6",
    previewBg: "linear-gradient(135deg, #090d16 0%, #04060a 100%)",
    previewCard: "#0f172a",
    glowColor: "rgba(6, 182, 212, 0.4)",
    badge: "ফিউচারিস্টিক"
  },
  {
    id: "royal",
    name: "Royal Velvet Gold",
    banglaName: "রাজকীয় অ্যাম্বার ও স্বর্ণালী",
    description: "রয়্যাল লাক্সারি গোল্ডেন শেডস, ওয়ার্ম কফি টোন এবং স্কলারলি প্রেস্টিজিয়াস থিম।",
    category: "luxury",
    accentColor: "#f59e0b",
    secondaryColor: "#d97706",
    previewBg: "linear-gradient(135deg, #1c1306 0%, #0d0903 100%)",
    previewCard: "#33220c",
    glowColor: "rgba(245, 158, 11, 0.4)",
    badge: "প্রিমিয়াম"
  },
  {
    id: "ocean",
    name: "Deep Oceanic Midnight",
    banglaName: "গভীর সমুদ্র ও নীলিম",
    description: "শান্ত গভীর সাগরের মতো রয়্যাল ব্লু ও কোবাল্ট কালার — গভীর মনোযোগ ও ফোকাসের জন্য সেরা।",
    category: "modern",
    accentColor: "#3b82f6",
    secondaryColor: "#2563eb",
    previewBg: "linear-gradient(135deg, #07132c 0%, #030814 100%)",
    previewCard: "#172554",
    glowColor: "rgba(59, 130, 246, 0.35)",
    badge: "ডিপ ফোকাস"
  }
];

class ThemeService {
  private currentThemeId: string = "medkarma";
  private listeners: ((theme: AppTheme) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_ui_theme");
      if (saved && APP_THEMES.some(t => t.id === saved)) {
        this.currentThemeId = saved;
      }
      this.applyTheme(this.currentThemeId);
    }
  }

  public getTheme(): AppTheme {
    return APP_THEMES.find(t => t.id === this.currentThemeId) || APP_THEMES[0];
  }

  public getThemeId(): string {
    return this.currentThemeId;
  }

  public setTheme(themeId: string) {
    const target = APP_THEMES.find(t => t.id === themeId);
    if (!target) return;

    this.currentThemeId = themeId;
    if (typeof window !== "undefined") {
      localStorage.setItem("app_ui_theme", themeId);
      this.applyTheme(themeId);
    }
    this.listeners.forEach(cb => cb(target));
  }

  private applyTheme(themeId: string) {
    if (typeof document === "undefined") return;
    const theme = APP_THEMES.find(t => t.id === themeId) || APP_THEMES[0];
    const root = document.documentElement;

    root.style.setProperty("--app-theme-accent", theme.accentColor);
    root.style.setProperty("--app-theme-secondary", theme.secondaryColor);
    root.style.setProperty("--app-theme-glow", theme.glowColor);
    root.style.setProperty("--app-theme-bg", theme.previewBg);
    root.style.setProperty("--app-theme-card", theme.previewCard);
  }

  public subscribe(listener: (theme: AppTheme) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const themeService = new ThemeService();
