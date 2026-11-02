import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "katex/dist/katex.min.css";

// Register Service Worker for PWA / Chrome 3-dot Install & Shortcut creation & Notifications
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("Study Stranger PWA Service Worker Registered:", reg.scope);
      })
      .catch((err) => {
        console.warn("PWA Service Worker Registration Failed:", err);
      });
  });
}

createRoot(document.getElementById("root")!).render(
    <App />
);
