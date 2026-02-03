import { NextRequest, NextResponse } from "next/server";
import { getTours } from "@/lib/tours";
import { toursQuerySchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`tours:${ip}`, 60, 60 * 1000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);

  const parsed = toursQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { lang, category, duration_min, duration_max, price_max, sort, order } = parsed.data;

  let tours = await getTours(lang);

  if (category) {
    tours = tours.filter((t) => t.categories.includes(category));
  }
  if (duration_min !== undefined) {
    tours = tours.filter((t) => t.duration_hours >= duration_min);
  }
  if (duration_max !== undefined) {
    tours = tours.filter((t) => t.duration_hours <= duration_max);
  }
  if (price_max !== undefined) {
    tours = tours.filter((t) => t.price_from <= price_max);
  }

  if (sort) {
    const dir = order === "desc" ? -1 : 1;
    tours.sort((a, b) => {
      if (sort === "price") return (a.price_from - b.price_from) * dir;
      if (sort === "duration") return (a.duration_hours - b.duration_hours) * dir;
      return a.name.localeCompare(b.name) * dir;
    });
  }

  return NextResponse.json(
    { tours, total: tours.length },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
