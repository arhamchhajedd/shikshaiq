"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegistration registers the ShikshaIQ service worker in client browsers.
 * Safely ignores environments where serviceWorker is not supported (e.g. older browsers, SSR, non-HTTPS dev).
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Listen for new worker installed
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("[ServiceWorker] New version installed and ready.");
            }
          });
        });
      } catch (err) {
        console.warn("[ServiceWorker] Registration ignored or failed:", err);
      }
    };

    // Register after page load so it does not block initial critical path rendering
    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW);
      return () => window.removeEventListener("load", registerSW);
    }
  }, []);

  return null;
}
