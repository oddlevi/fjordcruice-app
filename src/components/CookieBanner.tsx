"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export function CookieBanner() {
  const t = useTranslations("cookie");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <p className="text-sm text-slate-600">{t("message")}</p>
        <div className="flex gap-2">
          <button
            onClick={decline}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            {t("decline")}
          </button>
          <button
            onClick={accept}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
