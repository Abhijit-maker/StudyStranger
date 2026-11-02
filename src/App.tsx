import React, { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AppShell from "./pages/AppShell";
import { USER } from "./data.js";
import { auth, onAuthStateChanged } from "./firebase";
import StandalonePdfViewer from "./pages/StandalonePdfViewer";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasAuth, setHasAuth] = useState(false);

  useEffect(() => {
    const localVal = sessionStorage.getItem("ss-auth") || localStorage.getItem("ss-auth") || (localStorage.getItem("isLoggedIn") === "true");
    if (localVal) {
      setHasAuth(true);
      setChecking(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        sessionStorage.setItem("ss-auth", fbUser.displayName || USER.username);
        setHasAuth(true);
      } else {
        setHasAuth(false);
      }
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", fontFamily: "var(--font-sans)" }}>
        <div style={{ textAlign: "center" }}>
          <div className="badge-pill" style={{ marginBottom: 12 }}>⚡ Study Stranger</div>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Opening Studio Tools...</p>
        </div>
      </div>
    );
  }

  if (!hasAuth) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="pro-app-root">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/view-pdf" element={<StandalonePdfViewer />} />
          <Route path="/pdf-view" element={<StandalonePdfViewer />} />
          <Route
            path="/app/*"
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
