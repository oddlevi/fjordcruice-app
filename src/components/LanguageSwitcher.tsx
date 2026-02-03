"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";

const languages = [
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
  { code: "fr", label: "FR" },
  { code: "es", label: "ES" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => router.replace(pathname, { locale: lang.code })}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            locale === lang.code
              ? "bg-blue-700 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
