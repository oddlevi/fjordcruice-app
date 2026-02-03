import { NextRequest } from "next/server";
import { streamText, createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { anthropic, AI_MODEL, buildSystemPrompt, MAX_MESSAGE_LENGTH, AI_TIMEOUT_MS } from "@/lib/claude";
import { getTours, type Tour } from "@/lib/tours";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { supportedLanguages, type SupportedLanguage } from "@/lib/validation";

const MONTH_NAMES: Record<SupportedLanguage, string[]> = {
  en: ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  de: ["", "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  fr: ["", "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  es: ["", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
};

function isInSeason(tour: Tour, month: number): boolean {
  const { start, end } = tour.season;
  if (start <= end) return month >= start && month <= end;
  return month >= start || month <= end;
}

function buildFallbackResponse(query: string, tours: Tour[], language: SupportedLanguage): string {
  const q = query.toLowerCase();

  // Find tours matching the query by name, description, highlights, or categories
  const matched = tours.filter((t) => {
    const haystack = [
      t.name,
      t.description,
      ...(t.highlights ?? []),
      ...(t.included ?? []),
      ...t.categories,
      t.slug.replace(/-/g, " "),
    ].join(" ").toLowerCase();
    return q.split(/\s+/).some((word) => word.length > 2 && haystack.includes(word));
  });

  const relevantTours = matched.length > 0 ? matched : tours;
  const currentMonth = new Date().getMonth() + 1;
  const inSeason = relevantTours.filter((t) => isInSeason(t, currentMonth));
  const toShow = inSeason.length > 0 ? inSeason : relevantTours;

  // Check for price/cost questions
  if (/pris|price|cost|kost|cheap|billig|budget|teuer|cher|caro/i.test(q)) {
    const sorted = [...toShow].sort((a, b) => a.price_from - b.price_from);
    const lines = sorted.map((t) => `- **${t.name}**: ${t.price_from} NOK (${t.duration_hours}h)`);
    const intro = language === "en" ? "Here are our tours sorted by price:" :
                  language === "de" ? "Hier sind unsere Touren nach Preis sortiert:" :
                  language === "fr" ? "Voici nos excursions triées par prix :" :
                  "Aquí están nuestros tours ordenados por precio:";
    return `${intro}\n\n${lines.join("\n")}`;
  }

  // Check for duration questions
  if (/lang|long|duration|varighet|tid|time|hour|stund|dauer|durée|duración/i.test(q)) {
    const lines = toShow.map((t) => `- **${t.name}**: ${t.duration_hours} ${language === "en" ? "hours" : language === "de" ? "Stunden" : language === "fr" ? "heures" : "horas"}`);
    const intro = language === "en" ? "Here are the tour durations:" :
                  language === "de" ? "Hier sind die Tourdauern:" :
                  language === "fr" ? "Voici les durées des excursions :" :
                  "Aquí están las duraciones de los tours:";
    return `${intro}\n\n${lines.join("\n")}`;
  }

  // Check for season questions
  if (/sesong|season|when|når|wann|quand|cuándo|month|måned|monat|mois/i.test(q)) {
    const months = MONTH_NAMES[language];
    const lines = toShow.map((t) =>
      `- **${t.name}**: ${months[t.season.start]} – ${months[t.season.end]}`
    );
    const intro = language === "en" ? "Here are the seasons for our tours:" :
                  language === "de" ? "Hier sind die Saisons unserer Touren:" :
                  language === "fr" ? "Voici les saisons de nos excursions :" :
                  "Aquí están las temporadas de nuestros tours:";
    return `${intro}\n\n${lines.join("\n")}`;
  }

  // Default: show matching or all tours with summary
  const showTours = toShow.slice(0, 4);
  const lines = showTours.map((t) => {
    const details = [
      `${t.duration_hours}h`,
      `${t.price_from} NOK`,
      t.difficulty_level,
    ].join(" · ");
    return `- **${t.name}** (${details})\n  ${t.description.slice(0, 120)}${t.description.length > 120 ? "…" : ""}`;
  });

  const intro = language === "en" ? "Here are some tours that might interest you:" :
                language === "de" ? "Hier sind einige Touren, die Sie interessieren könnten:" :
                language === "fr" ? "Voici quelques excursions qui pourraient vous intéresser :" :
                "Aquí hay algunos tours que podrían interesarte:";

  const cta = language === "en" ? "\n\nAsk me about prices, duration, or what's included!" :
              language === "de" ? "\n\nFragen Sie mich nach Preisen, Dauer oder was inbegriffen ist!" :
              language === "fr" ? "\n\nDemandez-moi les prix, la durée ou ce qui est inclus !" :
              "\n\n¡Pregúntame sobre precios, duración o qué está incluido!";

  return `${intro}\n\n${lines.join("\n\n")}${cta}`;
}

export async function POST(request: NextRequest) {
  // Rate limit: 20 per session per hour
  const ip = getClientIp(request);
  const { success } = rateLimit(`chat:${ip}`, 20, 60 * 60 * 1000);
  if (!success) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();

  // useChat sends { messages: [...], session_id, language }
  const language = (supportedLanguages as readonly string[]).includes(body.language)
    ? (body.language as SupportedLanguage)
    : "en";

  const rawMessages = body.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return Response.json(
      { error: "No messages provided." },
      { status: 400 }
    );
  }

  // Extract text from each message (handles both content string and parts array)
  function extractText(msg: Record<string, unknown>): string {
    if (typeof msg.content === "string") return msg.content;
    const parts = msg.parts as Array<{ type: string; text?: string }> | undefined;
    if (Array.isArray(parts)) {
      return parts
        .filter((p) => p.type === "text" && typeof p.text === "string")
        .map((p) => p.text!)
        .join("");
    }
    return "";
  }

  const chatMessages = rawMessages.map((m: Record<string, unknown>) => ({
    role: m.role as "user" | "assistant",
    content: extractText(m),
  }));

  const lastUserMessage = chatMessages.filter((m) => m.role === "user").pop();
  if (!lastUserMessage || lastUserMessage.content.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { error: `Message too long or empty. Maximum ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const tours = await getTours(language);

  function sendFallback() {
    const text = buildFallbackResponse(lastUserMessage!.content, tours, language);
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: "start" });
        writer.write({ type: "text-start", id: "fallback-0" });
        writer.write({ type: "text-delta", delta: text, id: "fallback-0" });
        writer.write({ type: "text-end", id: "fallback-0" });
        writer.write({ type: "finish", finishReason: "stop" });
      },
    });
    return createUIMessageStreamResponse({ stream });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return sendFallback();
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
      season_start: t.season.start,
      season_end: t.season.end,
      meeting_point: t.meeting_point,
      booking_url: t.booking_url,
    })),
    language
  );

  try {
    const result = streamText({
      model: anthropic(AI_MODEL),
      system: systemPrompt,
      messages: chatMessages,
      maxOutputTokens: 500,
      abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });

    return result.toUIMessageStreamResponse();
  } catch {
    return sendFallback();
  }
}
