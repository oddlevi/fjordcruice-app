"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Tour } from "@/lib/tours";

export function TourCard({ tour }: { tour: Tour }) {
  const t = useTranslations();

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group block rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-[16/9] overflow-hidden rounded-t-xl bg-slate-200">
        {tour.image_url ? (
          <div
            className="h-full w-full bg-cover bg-center transition-transform group-hover:scale-105"
            style={{ backgroundImage: `url(${tour.image_url})` }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            {tour.name}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="mb-1 font-semibold text-slate-900 group-hover:text-blue-700">
          {tour.name}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-slate-600">
          {tour.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {tour.duration_hours} {t("common.hours")}
          </span>
          <span className="font-medium text-blue-700">
            {t("common.from")} {tour.price_from} NOK
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {tour.categories.map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
