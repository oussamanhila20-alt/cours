"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaRegister() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden || !deferred) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] rounded-2xl border border-white/20 bg-navy p-4 text-white shadow-xl sm:inset-x-auto sm:left-1/2 sm:w-[min(92vw,28rem)] sm:-translate-x-1/2">
      <p className="text-sm font-semibold">Installer l’application</p>
      <p className="mt-1 text-xs text-white/75">
        Ajoutez Centre Beta à l’écran d’accueil pour l’ouvrir comme une
        app.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="rounded-full bg-cyan-ai px-4 py-2 text-xs font-semibold text-navy"
          onClick={async () => {
            await deferred.prompt();
            setDeferred(null);
            setHidden(true);
          }}
        >
          Installer
        </button>
        <button
          type="button"
          className="rounded-full px-4 py-2 text-xs font-medium text-white/80"
          onClick={() => setHidden(true)}
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
