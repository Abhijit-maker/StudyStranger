// Premium Notification Service for Study Stranger (WBCHSE Class 12 AI Study Companion)

export type NotificationCategory = 
  | 'biology' 
  | 'bengali' 
  | 'english' 
  | 'mock_test' 
  | 'study_streak' 
  | 'mentor' 
  | 'general';

export interface StudyNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  actionUrl: string;
  actionLabel: string;
  timestamp: number;
  read: boolean;
  priority?: 'normal' | 'high';
  icon?: string;
  badge?: string;
  tag?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  frequencyMinutes: number; // e.g. 45 mins
  notifyOnBackground: boolean;
  subjects: {
    biology: boolean;
    bengali: boolean;
    english: boolean;
    mockTest: boolean;
    streaks: boolean;
  };
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted',
  sound: true,
  vibration: true,
  frequencyMinutes: 45,
  notifyOnBackground: true,
  subjects: {
    biology: true,
    bengali: true,
    english: true,
    mockTest: true,
    streaks: true,
  },
};

// WBCHSE Semester 3 authentic syllabus boosters (From project guidelines)
export const SYLLABUS_NOTIFICATION_PRESETS: Omit<StudyNotification, 'id' | 'timestamp' | 'read'>[] = [
  {
    title: '🧬 বায়োলজি বুস্টার: শুক্রাণুর গঠন ও ZP3',
    body: 'শুক্রাণুর Acrosome-এ হ্যায়ালুরোনিডেজ ও ডিম্বাণুর জোনা পেলুসিডার ZP3 রিসেপ্টর মনে আছে? ২ মিনিটের রিভিশন টেস্ট দাও!',
    category: 'biology',
    actionUrl: '/?action=mock_test&subject=biology',
    actionLabel: 'মক টেস্ট শুরু',
    priority: 'high',
    tag: 'wbchse-bio-sperm'
  },
  {
    title: '⚡ বায়োলজি ফ্যাক্ট: LH Surge ও রজঃচক্র',
    body: 'রজঃচক্রের ১৪তম দিনে LH হরমোনের তীব্র ক্ষরণ (LH Surge)-এর ফলে ওভিউলেশন ঘটে। শর্ট কুইজ সমাধান করো!',
    category: 'biology',
    actionUrl: '/?action=mock_test&subject=biology',
    actionLabel: 'কুইজ দাও',
    priority: 'high',
    tag: 'wbchse-bio-menstrual'
  },
  {
    title: '🔬 বায়োলজি রিভিশন: DNA রেপ্লিকেশন ও SSB',
    body: 'ডিএনএ প্রতিলিপিকরণে SSB প্রোটিন ও হেলিকেজের কাজ কি? A=T (২টি হাইড্রোজেন বন্ড), G≡C (৩টি বন্ড)। ঝালিয়ে নাও!',
    category: 'biology',
    actionUrl: '/?action=mock_test&subject=biology',
    actionLabel: 'নোটস দেখো',
    priority: 'normal',
    tag: 'wbchse-bio-dna'
  },
  {
    title: '📖 বাংলা এ রিভিশন: আদিরিনী (প্রভাত কুমার মুখোপাধ্যায়)',
    body: 'জয়রাম মোক্তার কত টাকায় হস্তিনী আদিরিনীকে কিনেছিলেন? (সঠিক উত্তর: ২০০০ টাকা)। এসো কুইজ দিয়ে যাচাই করি!',
    category: 'bengali',
    actionUrl: '/?action=mock_test&subject=bengali',
    actionLabel: 'বাংলা কুইজ',
    priority: 'high',
    tag: 'wbchse-ben-adarini'
  },
  {
    title: '✨ বাংলা এ ফোকাস: বাঙ্গালা ভাষা (স্বামী বিবেকানন্দ)',
    body: 'ভাষা ও জনশিক্ষার ক্ষেত্রে কথ্য ভাষার গুরুত্ব নিয়ে বিবেকানন্দের চিন্তাভাবনা। আজকের একটি রিভিশন প্রশ্ন শেষ করো!',
    category: 'bengali',
    actionUrl: '/?action=mock_test&subject=bengali',
    actionLabel: 'রিভিশন করো',
    priority: 'normal',
    tag: 'wbchse-ben-bhasha'
  },
  {
    title: '🇬🇧 English B: "The Bet" (Anton Chekhov)',
    body: 'What was the wager amount and time in "The Bet"? (2 million rubles for 15 years!). Test your comprehension now.',
    category: 'english',
    actionUrl: '/?action=mock_test&subject=english',
    actionLabel: 'Take Test',
    priority: 'high',
    tag: 'wbchse-eng-the-bet'
  },
  {
    title: '📜 English B: "Ulysses" (Alfred Lord Tennyson)',
    body: '"To strive, to seek, to find, and not to yield." - Master the key lines and MCQs of Ulysses for your Sem 3 board exam.',
    category: 'english',
    actionUrl: '/?action=mock_test&subject=english',
    actionLabel: 'Practice Verse',
    priority: 'normal',
    tag: 'wbchse-eng-ulysses'
  },
  {
    title: '🌲 English B: "Our Casuarina Tree" (Toru Dutt)',
    body: 'Explore nostalgia and nature\'s immortality with Toru Dutt. Solve 5 crucial chapterwise questions.',
    category: 'english',
    actionUrl: '/?action=mock_test&subject=english',
    actionLabel: 'Solve MCQs',
    priority: 'normal',
    tag: 'wbchse-eng-casuarina'
  },
  {
    title: '🔥 স্টাডি স্ট্রিক বুস্টার!',
    body: 'ধারাবাহিক পড়াশোনায় সেরা ফলাফল আসে! আজকের একটি ৫ মিনিটের MCQ মক টেস্ট শেষ করে তোমার স্ট্রিক ধরে রাখো।',
    category: 'study_streak',
    actionUrl: '/?action=mock_test',
    actionLabel: 'স্ট্রিক চালু রাখো',
    priority: 'high',
    tag: 'wbchse-streak-reminder'
  },
  {
    title: '🎙️ অঞ্জলি ও স্ট্রেঞ্জার AI লাইভ রেডি!',
    body: 'Biology বা ইংরেজি নিয়ে মনে কোনো সন্দেহ আছে? মুখে কথা বলে সাথে সাথে ডাউট ক্লিয়ার করে নাও।',
    category: 'mentor',
    actionUrl: '/?action=live_mentor',
    actionLabel: 'কথা বলো',
    priority: 'normal',
    tag: 'wbchse-ai-mentor-ready'
  }
];

// Audio Synthesizer: Crystal Luxury Chime (No external mp3 required)
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // 3-tone harmonic arpeggio (C6, E6, G6) with luxury bell resonance
    const frequencies = [1046.50, 1318.51, 1567.98];
    const delays = [0, 0.08, 0.16];

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delays[index]);

      // Soft envelope
      gain.gain.setValueAtTime(0, now + delays[index]);
      gain.gain.linearRampToValueAtTime(0.2, now + delays[index] + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delays[index] + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delays[index]);
      osc.stop(now + delays[index] + 1.0);
    });

    // Subtle second overtone for sparkle
    const sparkleOsc = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkleOsc.type = 'triangle';
    sparkleOsc.frequency.setValueAtTime(2093, now + 0.16); // C7
    sparkleGain.gain.setValueAtTime(0, now + 0.16);
    sparkleGain.gain.linearRampToValueAtTime(0.08, now + 0.18);
    sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    sparkleOsc.connect(sparkleGain);
    sparkleGain.connect(ctx.destination);
    sparkleOsc.start(now + 0.16);
    sparkleOsc.stop(now + 0.8);
  } catch (err) {
    console.debug('Notification audio chime muted or not supported:', err);
  }
};

class NotificationService {
  private inAppSubscribers: Set<(notification: StudyNotification) => void> = new Set();
  private timerId: number | null = null;
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private history: StudyNotification[] = [];

  constructor() {
    this.loadSettings();
    this.loadHistory();
    this.initPeriodicSchedule();
  }

  // Check if browser supports Web Notifications
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Check if user has explicitly granted notification permissions
  public isPermissionGranted(): boolean {
    return this.isSupported() && Notification.permission === 'granted';
  }

  // Check if permission prompt has already been interacted with
  public hasUserInteractedWithPermission(): boolean {
    if (!this.isSupported()) return true;
    if (Notification.permission !== 'default') return true;
    return localStorage.getItem('pref_notification_prompted') === 'true';
  }

  // Dismiss permission prompt politely without disturbing again
  public dismissPermissionPrompt(): void {
    try {
      localStorage.setItem('pref_notification_prompted', 'true');
    } catch (_) {}
    this.settings.enabled = false;
    this.saveSettings();
  }

  // Get current permission status
  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  // Request browser permission
  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      localStorage.setItem('pref_notification_prompted', 'true');
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        this.settings.enabled = true;
        this.saveSettings();
        this.initPeriodicSchedule();
        // Send a single celebratory welcome notification
        this.sendNotification({
          title: '🎉 Study Stranger নোটিফিকেশন সফলভাবে চালু হয়েছে!',
          body: 'এখন থেকে WBCHSE Class 12-এর গুরুত্বপূর্ণ রিভিশন ও টেস্ট রিমাইন্ডার সরাসরি পাবে।',
          category: 'general',
          actionUrl: '/?action=mock_test',
          actionLabel: 'এক্সপ্লোর করো',
          priority: 'high',
          tag: 'welcome-notification'
        });
        return true;
      } else {
        this.settings.enabled = false;
        this.saveSettings();
        return false;
      }
    } catch (err) {
      console.warn('Notification permission error:', err);
      return false;
    }
  }

  // Load Settings from LocalStorage
  public loadSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem('study_stranger_notification_settings');
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (_) {
      this.settings = DEFAULT_SETTINGS;
    }
    return this.settings;
  }

  // Save Settings
  public saveSettings(newSettings?: Partial<NotificationSettings>): void {
    if (newSettings) {
      this.settings = { ...this.settings, ...newSettings };
    }
    try {
      localStorage.setItem('study_stranger_notification_settings', JSON.stringify(this.settings));
    } catch (_) {}
    this.initPeriodicSchedule();
  }

  public getSettings(): NotificationSettings {
    return this.settings;
  }

  // Load History
  public loadHistory(): StudyNotification[] {
    try {
      const saved = localStorage.getItem('study_stranger_notification_history');
      if (saved) {
        this.history = JSON.parse(saved);
      }
    } catch (_) {
      this.history = [];
    }
    return this.history;
  }

  // Save History
  private saveHistory(): void {
    try {
      // Keep up to 40 recent notifications
      const trimmed = this.history.slice(0, 40);
      localStorage.setItem('study_stranger_notification_history', JSON.stringify(trimmed));
    } catch (_) {}
  }

  public getHistory(): StudyNotification[] {
    return this.history;
  }

  public markAsRead(id: string): void {
    this.history = this.history.map(item => item.id === id ? { ...item, read: true } : item);
    this.saveHistory();
  }

  public markAllAsRead(): void {
    this.history = this.history.map(item => ({ ...item, read: true }));
    this.saveHistory();
  }

  public clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  // Subscribe to in-app floating notifications
  public subscribe(callback: (notification: StudyNotification) => void): () => void {
    this.inAppSubscribers.add(callback);
    return () => this.inAppSubscribers.delete(callback);
  }

  // Send a Notification (Dispatches both System Notification & In-App Toast)
  public async sendNotification(
    data: Omit<StudyNotification, 'id' | 'timestamp' | 'read'>
  ): Promise<StudyNotification | null> {
    // Strictly verify that notifications are enabled and permission is granted by user
    if (!this.settings.enabled || !this.isPermissionGranted()) {
      return null;
    }

    const notification: StudyNotification = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      read: false,
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/badge-72.png',
    };

    // 1. Add to in-memory history & persist
    this.history.unshift(notification);
    this.saveHistory();

    // 2. Play subtle chime if enabled
    if (this.settings.sound) {
      playNotificationChime();
    }

    // 3. Mobile Haptic Vibration if enabled
    if (this.settings.vibration && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (_) {}
    }

    // 4. Dispatch to in-app subscribers (Floating Toast)
    this.inAppSubscribers.forEach(cb => {
      try {
        cb(notification);
      } catch (err) {
        console.error('In-app notification subscriber error:', err);
      }
    });

    // 5. Send System/PWA notification via Service Worker or Web Notification API
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        let sentViaSW = false;
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && 'showNotification' in reg) {
            await reg.showNotification(notification.title, {
              body: notification.body,
              icon: notification.icon,
              badge: notification.badge,
              tag: notification.tag || `stranger-${notification.category}`,
              renotify: true,
              data: {
                url: notification.actionUrl,
                notificationId: notification.id,
                category: notification.category
              },
              actions: [
                { action: 'action_test', title: '📝 ' + (notification.actionLabel || 'ওপেন করো') },
                { action: 'action_mentor', title: '🎙️ AI মেন্টর' }
              ]
            } as any);
            sentViaSW = true;
          }
        }

        if (!sentViaSW) {
          const sysNotif = new Notification(notification.title, {
            body: notification.body,
            icon: notification.icon,
            badge: notification.badge,
            tag: notification.tag || `stranger-${notification.category}`
          });
          sysNotif.onclick = () => {
            window.focus();
            if (notification.actionUrl && notification.actionUrl !== '/') {
              window.location.href = notification.actionUrl;
            }
            sysNotif.close();
          };
        }
      } catch (sysErr) {
        console.warn('Failed to dispatch native system notification:', sysErr);
      }
    }

    return notification;
  }

  // Send a random curated syllabus booster notification
  public sendRandomBooster(): Promise<StudyNotification | null> {
    if (!this.settings.enabled || !this.isPermissionGranted()) {
      return Promise.resolve(null);
    }
    const randomIndex = Math.floor(Math.random() * SYLLABUS_NOTIFICATION_PRESETS.length);
    const preset = SYLLABUS_NOTIFICATION_PRESETS[randomIndex];
    return this.sendNotification(preset);
  }

  // Setup periodic smart background study reminders
  private initPeriodicSchedule(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (!this.settings.enabled || !this.isPermissionGranted()) return;

    // Convert frequency to milliseconds (min 15 minutes, default 45 minutes)
    const intervalMs = Math.max(15, this.settings.frequencyMinutes) * 60 * 1000;

    this.timerId = window.setInterval(() => {
      // Check last notification time
      const lastTime = this.history[0]?.timestamp || 0;
      const now = Date.now();
      if (now - lastTime >= intervalMs) {
        // Send a relevant syllabus booster
        this.sendRandomBooster();
      }
    }, Math.min(intervalMs, 300000)); // check every 5 mins or interval
  }
}

// Global Singleton Instance
export const notificationService = new NotificationService();
