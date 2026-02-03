import { z } from "zod";

export const supportedLanguages = ["en", "de", "fr", "es"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const recommendSchema = z.object({
  language: z.enum(supportedLanguages),
  preferences: z.object({
    duration: z.enum(["short", "half-day", "full-day", "multi-day"]),
    interests: z.array(z.string()).max(5),
    budget: z.enum(["budget", "moderate", "premium"]),
    group_type: z.enum(["solo", "couple", "family", "group"]),
    fitness_level: z.enum(["easy", "moderate", "challenging"]),
    travel_month: z.number().min(1).max(12),
  }),
});

export const chatSchema = z.object({
  session_id: z.string().uuid(),
  message: z.string().min(1).max(500),
  language: z.enum(supportedLanguages),
});

export const toursQuerySchema = z.object({
  lang: z.enum(supportedLanguages),
  category: z.string().optional(),
  duration_min: z.coerce.number().optional(),
  duration_max: z.coerce.number().optional(),
  price_max: z.coerce.number().optional(),
  sort: z.enum(["price", "duration", "name"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const analyticsEventSchema = z.object({
  event: z.enum([
    "ai_session_started",
    "ai_session_completed",
    "booking_clicked",
    "language_changed",
    "tour_viewed",
  ]),
  data: z.record(z.string(), z.string()).optional(),
});
