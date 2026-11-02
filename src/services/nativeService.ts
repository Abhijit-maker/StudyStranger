import { registerPlugin, Capacitor } from '@capacitor/core';

export interface StudyHelperPlugin {
  showToast(options: { message: string }): Promise<{ success: boolean }>;
  getDeviceStats(): Promise<{ batteryLevel: number; freeStorageMB: number; isLowStorage: boolean }>;
  triggerHaptic(options: { type: 'success' | 'failure' | 'celebrate' }): Promise<{ vibrated: boolean }>;
}

const StudyHelper = registerPlugin<StudyHelperPlugin>('StudyHelper');

export const isNative = Capacitor.isNativePlatform();

export const nativeService = {
  async showToast(message: string): Promise<boolean> {
    if (isNative) {
      try {
        const result = await StudyHelper.showToast({ message });
        return result.success;
      } catch (e) {
        console.warn('Native Toast failed, falling back to local handler:', e);
        return false;
      }
    } else {
      console.log('[Native Emulator] Toast:', message);
      return true;
    }
  },

  async getDeviceStats(): Promise<{ batteryLevel: number; freeStorageMB: number; isLowStorage: boolean }> {
    if (isNative) {
      try {
        return await StudyHelper.getDeviceStats();
      } catch (e) {
        console.warn('Native Stats failed, returning safe defaults:', e);
        return { batteryLevel: 100, freeStorageMB: 2048, isLowStorage: false };
      }
    } else {
      // Safe, realistic mock values for the web environment
      return { batteryLevel: 95, freeStorageMB: 8192, isLowStorage: false };
    }
  },

  async triggerHaptic(type: 'success' | 'failure' | 'celebrate'): Promise<boolean> {
    if (isNative) {
      try {
        const result = await StudyHelper.triggerHaptic({ type });
        return result.vibrated;
      } catch (e) {
        console.warn('Native Vibrator haptic failed:', e);
        return false;
      }
    } else {
      console.log('[Native Emulator] Haptic triggered:', type);
      try {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          if (type === 'success') navigator.vibrate(100);
          else if (type === 'failure') navigator.vibrate([100, 50, 100]);
          else if (type === 'celebrate') navigator.vibrate([80, 50, 80, 50, 150]);
        }
      } catch {
        // Safe catch for iframe policies
      }
      return true;
    }
  }
};
