"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Preferences {
  duration: string;
  interests: string[];
  budget: string;
  group_type: string;
  fitness_level: string;
  travel_month: number;
  start_date: string;
}

interface PreferenceFormProps {
  onSubmit: (preferences: Preferences) => void;
  loading?: boolean;
}

const interestOptions = [
  "fjord",
  "northern-lights",
  "food",
  "culture",
  "wildlife",
  "nightlife",
];

export function PreferenceForm({ onSubmit, loading }: PreferenceFormProps) {
  const t = useTranslations("preferences");
  const [preferences, setPreferences] = useState<Preferences>({
    duration: "half-day",
    interests: [],
    budget: "moderate",
    group_type: "couple",
    fitness_level: "easy",
    travel_month: new Date().getMonth() + 1,
    start_date: "",
  });
  const [dateError, setDateError] = useState(false);

  function toggleInterest(interest: string) {
    setPreferences((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : prev.interests.length < 5
        ? [...prev.interests, interest]
        : prev.interests,
    }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!preferences.start_date) {
          setDateError(true);
          return;
        }
        onSubmit(preferences);
      }}
      className="space-y-6"
    >
      <h2 className="text-lg font-semibold text-slate-900">{t("title")}</h2>

      {/* Duration */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {t("duration")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "short", label: t("durationShort") },
            { value: "half-day", label: t("durationHalf") },
            { value: "full-day", label: t("durationFull") },
            { value: "multi-day", label: t("durationMulti") },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPreferences((p) => ({ ...p, duration: opt.value }))}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                preferences.duration === opt.value
                  ? "border-blue-700 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {t("interests")}
        </label>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                preferences.interests.includes(interest)
                  ? "border-blue-700 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {t("budget")}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "budget", label: t("budgetLow") },
            { value: "moderate", label: t("budgetMid") },
            { value: "premium", label: t("budgetHigh") },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPreferences((p) => ({ ...p, budget: opt.value }))}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                preferences.budget === opt.value
                  ? "border-blue-700 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Group type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {t("groupType")}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: "solo", label: t("groupSolo") },
            { value: "couple", label: t("groupCouple") },
            { value: "family", label: t("groupFamily") },
            { value: "group", label: t("groupGroup") },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPreferences((p) => ({ ...p, group_type: opt.value }))}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                preferences.group_type === opt.value
                  ? "border-blue-700 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fitness */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {t("fitness")}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "easy", label: t("fitnessEasy") },
            { value: "moderate", label: t("fitnessMod") },
            { value: "challenging", label: t("fitnessHard") },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPreferences((p) => ({ ...p, fitness_level: opt.value }))}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                preferences.fitness_level === opt.value
                  ? "border-blue-700 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start Date */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {t("startDate")} <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={preferences.start_date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            setPreferences((p) => ({ ...p, start_date: e.target.value }));
            setDateError(false);
          }}
          className={`w-full rounded-lg border px-3 py-2 text-sm ${
            dateError ? "border-red-500 bg-red-50" : "border-slate-200"
          }`}
        />
        {dateError && (
          <p className="mt-1 text-sm text-red-500">{t("selectDateRequired")}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
      >
        {loading ? "..." : t("submit")}
      </button>
    </form>
  );
}
