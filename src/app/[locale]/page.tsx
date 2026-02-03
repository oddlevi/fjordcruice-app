import { useTranslations } from "next-intl";
import { AiChatLazy } from "@/components/AiChatLazy";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900">{t("hero")}</h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          {t("subtitle")}
        </p>
      </div>
      <AiChatLazy />
    </div>
  );
}
