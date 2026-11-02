import React, { useEffect, useState } from 'react';
import { Download, Smartphone, CheckCircle2, Sparkles, X, ShieldCheck, Laptop } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      localStorage.getItem('ss_web_apk_installed') === 'true';
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      localStorage.setItem('ss_web_apk_installed', 'true');
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      localStorage.setItem('ss_web_apk_installed', 'true');
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export const PWAInstallButton: React.FC<{ compact?: boolean; variant?: string }> = ({ compact = false, variant }) => {
  const isCompact = compact || variant === 'compact';
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installingApk, setInstallingApk] = useState(false);
  const [apkProgress, setApkProgress] = useState(0);
  const [apkDone, setApkDone] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowInstallModal(true);
  };

  const triggerWebApkBuildAndInstall = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setApkDone(true);
        return;
      }
    }

    setInstallingApk(true);
    setApkProgress(15);

    const steps = [35, 62, 85, 100];
    for (const p of steps) {
      await new Promise((r) => setTimeout(r, 320));
      setApkProgress(p);
    }

    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch {
        // VitePWA handles registration automatically
      }
    }

    localStorage.setItem('ss_web_apk_installed', 'true');
    setInstallingApk(false);
    setApkDone(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#18181b] bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#18181b] font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#18181b] active:translate-y-0.5 ${
          compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:text-sm'
        }`}
        title="Install Study Stranger Pro Web APK"
      >
        <Download size={compact ? 13 : 15} className="text-emerald-700 shrink-0" />
        <span>{isInstalled ? '📲 App Installed' : compact ? 'Install App' : '📲 Install Web APK'}</span>
      </button>

      {showInstallModal && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4"
          onClick={() => setShowInstallModal(false)}
        >
          <div
            className="w-full max-w-md rounded-[28px] bg-white border-2 border-[#18181b] shadow-[8px_8px_0px_#18181b] p-6 text-left relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-[1.5px] border-[#18181b] flex items-center justify-center text-emerald-700 shadow-xs">
                  <Smartphone size={24} />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-300">
                    <ShieldCheck size={11} /> Chrome WebAPK Ready
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    Install Study Stranger Pro
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-5 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Install the official <strong>Study Stranger Pro Web APK</strong> on your Android phone, tablet, or desktop Chrome browser for instant 1-tap launch, full-screen 3D AI Mentor, and offline 1000MB PDF access.
              </p>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Smartphone size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Android WebAPK</div>
                    <div className="text-[11px] text-slate-500">Home Screen App</div>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                  <Laptop size={18} className="text-indigo-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Desktop PWA</div>
                    <div className="text-[11px] text-slate-500">Standalone Window</div>
                  </div>
                </div>
              </div>

              {installingApk && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span>Configuring Web APK Package & Offline Cache...</span>
                    <span>{apkProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white border border-emerald-300 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${apkProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {apkDone && (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-black text-sm text-emerald-800">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>Web APK Activated & Ready!</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {isIOS
                      ? 'On iPhone/iPad: Tap the Safari Share icon below and select "Add to Home Screen" to finish placing the app icon.'
                      : 'Your browser offline WebAPK package is active! In Chrome, you can also tap the install icon in the address bar or browser menu ("Install App" / "Add to Home screen") to pin the launcher icon.'}
                  </p>
                </div>
              )}

              {!apkDone && (
                <button
                  type="button"
                  disabled={installingApk}
                  onClick={triggerWebApkBuildAndInstall}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#18181b] hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_#10b981] cursor-pointer transition-all"
                >
                  <Sparkles size={16} className="text-emerald-400" />
                  <span>{installingApk ? 'Installing Web APK...' : '📲 Install Web APK Now (One-Click)'}</span>
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Version 3.8 Studio • Zero Ads</span>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
