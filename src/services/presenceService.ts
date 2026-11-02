/**
 * Real-Time Active User Presence & Heartbeat Service
 * Tracks accurate live logged-in students across tabs, devices, and sessions
 */

import { auth, db } from "../firebase";
import { doc, setDoc, onSnapshot, collection } from "firebase/firestore";

export interface ActiveUserSession {
  uid: string;
  displayName: string;
  email: string;
  currentRoute: string;
  lastSeen: number; // Unix timestamp
  isOnline: boolean;
  userAgent?: string;
  deviceType?: "mobile" | "desktop" | "tablet";
}

class PresenceTracker {
  private heartbeatInterval: any = null;
  private isInitialized = false;

  private getDeviceType(): "mobile" | "desktop" | "tablet" {
    if (typeof window === "undefined") return "desktop";
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad/i.test(ua)) return "tablet";
    if (/mobile|android|iphone/i.test(ua)) return "mobile";
    return "desktop";
  }

  public startHeartbeat() {
    if (this.isInitialized || typeof window === "undefined") return;
    this.isInitialized = true;

    // Send immediate heartbeat on start
    this.sendHeartbeat();

    // Send heartbeat every 15 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 15000);

    // Track route changes
    window.addEventListener("popstate", () => this.sendHeartbeat());

    // Handle tab visibility and unload
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.sendHeartbeat();
      }
    });

    window.addEventListener("beforeunload", () => {
      this.sendOfflineBeacon();
    });
  }

  public async sendHeartbeat() {
    try {
      const fbUser = auth.currentUser;
      const localName =
        fbUser?.displayName ||
        localStorage.getItem("currentUserName") ||
        localStorage.getItem("currentUserDisplayName") ||
        "Student";
      const localEmail =
        fbUser?.email || localStorage.getItem("currentUserEmail") || "";
      const uid =
        fbUser?.uid ||
        localStorage.getItem("currentUserUid") ||
        sessionStorage.getItem("ss-auth-uid") ||
        "guest_" + (typeof window !== "undefined" ? window.location.host : "user");

      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "/app";

      const payload = {
        uid,
        displayName: localName,
        email: localEmail,
        currentRoute: currentPath,
        lastSeen: Date.now(),
        isOnline: true,
        deviceType: this.getDeviceType()
      };

      // 1. Send to server-side heartbeat endpoint
      fetch("/api/presence/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(() => {});

      // 2. Also write to Firestore users collection if user is logged in
      if (fbUser?.uid) {
        setDoc(
          doc(db, "users", fbUser.uid),
          {
            isOnline: true,
            lastActive: new Date().toISOString(),
            currentRoute: currentPath,
            lastSeenTimestamp: Date.now()
          },
          { merge: true }
        ).catch(() => {});
      }
    } catch (e) {
      // Ignore heartbeat errors silently
    }
  }

  public sendOfflineBeacon() {
    try {
      const fbUser = auth.currentUser;
      const uid =
        fbUser?.uid ||
        localStorage.getItem("currentUserUid") ||
        sessionStorage.getItem("ss-auth-uid");
      if (!uid) return;

      const data = JSON.stringify({ uid, isOnline: false });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/presence/offline", data);
      }
    } catch (e) {}
  }

  public stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.isInitialized = false;
  }
}

export const presenceTracker = new PresenceTracker();
