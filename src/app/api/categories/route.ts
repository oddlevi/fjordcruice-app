import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { mockCategories } from "@/lib/mock-data";
import { supportedLanguages, type SupportedLanguage } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`categories:${ip}`, 60, 60 * 1000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const lang = request.nextUrl.searchParams.get("lang") as SupportedLanguage;

  if (!lang || !supportedLanguages.includes(lang)) {
    return NextResponse.json({ error: "Missing or invalid lang parameter" }, { status: 400 });
  }

  if (USE_MOCK) {
    const categories = mockCategories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.translations[lang as keyof typeof c.translations] ?? c.translations.en,
    }));
    return NextResponse.json(
      { categories },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } }
    );
  }

  const { data, error } = await getSupabase()
    .from("categories")
    .select("id, slug, category_translations!inner(name)")
    .eq("category_translations.language", lang);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }

  const categories = (data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: (c.category_translations as { name: string }[])[0]?.name ?? c.slug,
  }));

  return NextResponse.json(
    { categories },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } }
  );
}
