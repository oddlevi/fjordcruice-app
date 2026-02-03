import { NextRequest, NextResponse } from "next/server";
import { getTourBySlug } from "@/lib/tours";
import { supportedLanguages, type SupportedLanguage } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const lang = request.nextUrl.searchParams.get("lang") as SupportedLanguage;

  if (!lang || !supportedLanguages.includes(lang)) {
    return NextResponse.json({ error: "Missing or invalid lang parameter" }, { status: 400 });
  }

  const tour = await getTourBySlug(slug, lang);

  if (!tour) {
    return NextResponse.json({ error: "Tour not found" }, { status: 404 });
  }

  return NextResponse.json(
    { tour },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
