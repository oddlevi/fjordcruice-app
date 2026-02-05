"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const links = [
    { href: "/", label: t("home") },
    { href: "/tours", label: t("tours") },
    { href: "/calendar", label: t("calendar") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-blue-900">
          Arctic Expeditions
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-blue-700 ${
                pathname === link.href
                  ? "text-blue-700"
                  : "text-slate-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
