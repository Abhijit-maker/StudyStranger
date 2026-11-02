/**
 * Server-Side Real-Time Presence & Live User Session Tracker
 */

export interface ServerUserSession {
  uid: string;
  displayName: string;
  email: string;
  currentRoute: string;
  lastSeen: number;
  isOnline: boolean;
  deviceType?: string;
  ip?: string;
}

const activeSessions = new Map<string, ServerUserSession>();

// Cleanup stale sessions older than 40 seconds every 10 seconds
setInterval(() => {
  const now = Date.now();
  for (const [uid, session] of activeSessions.entries()) {
    if (now - session.lastSeen > 40000) {
      activeSessions.delete(uid);
    }
  }
}, 10000);

export function registerPresenceService(deps: { app: any }) {
  const { app } = deps;

  // 1. Heartbeat from logged-in client
  app.post("/api/presence/heartbeat", (req: any, res: any) => {
    try {
      const { uid, displayName, email, currentRoute, deviceType } = req.body;
      if (!uid) {
        return res.status(400).json({ success: false, error: "uid is required" });
      }

      const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      const cleanIp = Array.isArray(clientIp) ? clientIp[0] : String(clientIp).split(",")[0].trim();

      activeSessions.set(String(uid), {
        uid: String(uid),
        displayName: displayName || "Student (শিক্ষার্থী)",
        email: email || "",
        currentRoute: currentRoute || "/app",
        lastSeen: Date.now(),
        isOnline: true,
        deviceType: deviceType || "desktop",
        ip: cleanIp
      });

      res.json({
        success: true,
        onlineCount: activeSessions.size
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Client going offline / closing window
  app.post("/api/presence/offline", (req: any, res: any) => {
    try {
      const { uid } = req.body;
      if (uid && activeSessions.has(String(uid))) {
        activeSessions.delete(String(uid));
      }
      res.json({ success: true, onlineCount: activeSessions.size });
    } catch (e) {
      res.json({ success: false });
    }
  });

  // 3. Get accurate live online logged-in users for Admin Panel
  app.get("/api/presence/active-users", (req: any, res: any) => {
    try {
      const now = Date.now();
      // Purge sessions older than 40s
      for (const [uid, session] of activeSessions.entries()) {
        if (now - session.lastSeen > 40000) {
          activeSessions.delete(uid);
        }
      }

      const usersList = Array.from(activeSessions.values()).map((s) => ({
        ...s,
        secondsAgo: Math.max(0, Math.floor((now - s.lastSeen) / 1000))
      }));

      // Sort by most recently active
      usersList.sort((a, b) => b.lastSeen - a.lastSeen);

      res.json({
        success: true,
        onlineCount: usersList.length,
        users: usersList,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
