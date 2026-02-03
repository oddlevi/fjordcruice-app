import { NextRequest } from "next/server";
import { streamText } from "ai";
import { anthropic, AI_MODEL, buildSystemPrompt, AI_TIMEOUT_MS } from "@/lib/claude";
import { recommendSchema } from "@/lib/validation";
import { getTours, type Tour } from "@/lib/tours";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

interface Preferences {
  duration: string;
  interests: string[];
  budget: string;
  group_type: string;
  fitness_level: string;
  travel_month: number;
}

function isInSeason(tour: Tour, month: number): boolean {
  const { start, end } = tour.season;
  if (start <= end) return month >= start && month <= end;
  return month >= start || month <= end;
}

function matchBudget(tour: Tour, budget: string): boolean {
  if (budget === "budget") return tour.price_from <= 600;
  if (budget === "moderate") return tour.price_from <= 1000;
  return true;
}

function scoreTour(tour: Tour, prefs: Preferences, tourCategories: string[]): number {
  let score = 0;
  if (isInSeason(tour, prefs.travel_month)) score += 10;
  if (matchBudget(tour, prefs.budget)) score += 5;
  if (prefs.fitness_level === "easy" && tour.difficulty_level === "easy") score += 3;
  if (prefs.fitness_level === "moderate") score += 2;
  const matchingInterests = prefs.interests.filter((i) => tourCategories.includes(i));
  score += matchingInterests.length * 4;
  if (prefs.duration === "short" && tour.duration_hours <= 3) score += 3;
  if (prefs.duration === "half-day" && tour.duration_hours >= 3 && tour.duration_hours <= 5) score += 3;
  if (prefs.duration === "full-day" && tour.duration_hours >= 5) score += 3;
  return score;
}

function buildFallbackPlan(tours: Tour[], prefs: Preferences) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { mockTourCategories } = require("@/lib/mock-data");

  const scored = tours
    .filter((t) => isInSeason(t, prefs.travel_month))
    .map((t) => ({
      tour: t,
      score: scoreTour(t, prefs, mockTourCategories[t.slug] ?? []),
    }))
    .sort((a, b) => b.score - a.score);

  let recommended = scored.slice(0, 3).map((s) => s.tour);
  if (recommended.length === 0) {
    recommended = tours.slice(0, 3);
  }

  const timeSlots = ["10:00", "14:00", "19:00"];

  return {
    type: "plan" as const,
    month: prefs.travel_month,
    tours: recommended.map((tour, i) => ({
      time: timeSlots[i] ?? `${10 + i * 4}:00`,
      slug: tour.slug,
      name: tour.name,
      description: tour.description,
      image_url: tour.image_url,
      duration_hours: tour.duration_hours,
      price_from: tour.price_from,
      difficulty_level: tour.difficulty_level,
      meeting_point: tour.meeting_point ?? "Fridtjof Nansens plass, Tromsø",
      highlights: tour.highlights ?? [],
      included: tour.included ?? [],
      booking_url: tour.booking_url,
      categories: tour.categories,
    })),
  };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`recommend:${ip}`, 5, 10 * 60 * 1000);
  if (!success) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();

  const parsed = recommendSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { language, preferences } = parsed.data;

  const tours = await getTours(language);
  if (tours.length === 0) {
    return Response.json({ error: "No tours available" }, { status: 503 });
  }

  // Check if API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      buildFallbackPlan(tours, preferences),
      { status: 200 }
    );
  }

  const systemPrompt = buildSystemPrompt(
    tours.map((t) => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
      duration_hours: t.duration_hours,
      price_from: t.price_from,
      difficulty_level: t.difficulty_level,
      highlights: t.highlights,
      included: t.included,
      season_start: t.season?.start,
      season_end: t.season?.end,
      booking_url: t.booking_url,
      meeting_point: t.meeting_point,
    })),
    language
  );

  const monthNames = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const userMessage = `Create a day plan for me in Tromsø with these preferences:
- Duration preference: ${preferences.duration}
- Interests: ${preferences.interests.join(", ") || "open to everything"}
- Budget: ${preferences.budget}
- Group type: ${preferences.group_type}
- Fitness level: ${preferences.fitness_level}
- Travel month: ${monthNames[preferences.travel_month]} (month ${preferences.travel_month})

Please recommend 1-3 tours that fit my preferences, organized as a day plan with specific times, meeting points, and booking links. Explain why each tour is a good fit for me.`;

  try {
    const result = streamText({
      model: anthropic(AI_MODEL),
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      maxOutputTokens: 1500,
      abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });

    return result.toTextStreamResponse();
  } catch {
    return Response.json(
      buildFallbackPlan(tours, preferences),
      { status: 200 }
    );
  }
}
