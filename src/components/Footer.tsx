"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
        <div className="mb-4 flex justify-center gap-6">
          <Link href="/privacy" className="hover:text-blue-700">
            {t("common.privacy")}
          </Link>
          <Link href="/contact" className="hover:text-blue-700">
            {t("common.contact")}
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Norwegian Fjordcruice. All rights reserved.</p>
      </div>
    </footer>
  );
}
