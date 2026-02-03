import { mockTours, mockTranslations, mockTourCategories } from "./mock-data";
import type { SupportedLanguage } from "./validation";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL;

async function getSupabaseClient() {
  const { getSupabase } = await import("./supabase");
  return getSupabase();
}

export interface Tour {
  id: string;
  slug: string;
  name: string;
  description: string;
  duration_hours: number;
  price_from: number;
  price_to: number | null;
  difficulty_level: string;
  image_url: string | null;
  booking_url: string | null;
  categories: string[];
  season: { start: number; end: number };
  highlights?: string[];
  included?: string[];
  meeting_point?: string;
}

export async function getTours(language: SupportedLanguage): Promise<Tour[]> {
  if (USE_MOCK) {
    return mockTours.map((t) => {
      const tr = mockTranslations[t.slug]?.[language] ?? mockTranslations[t.slug]?.en;
      return {
        id: t.id,
        slug: t.slug,
        name: tr?.name ?? t.slug,
        description: tr?.description ?? "",
        duration_hours: t.duration_hours,
        price_from: t.price_from,
        price_to: t.price_to,
        difficulty_level: t.difficulty_level,
        image_url: t.image_url,
        booking_url: t.booking_url,
        categories: mockTourCategories[t.slug] ?? [],
        season: { start: t.season_start, end: t.season_end },
        highlights: tr?.highlights,
        included: tr?.included,
        meeting_point: tr?.meeting_point,
      };
    });
  }

  const { data, error } = await (await getSupabaseClient())
    .from("tours")
    .select(`
      *,
      tour_translations!inner(name, description, highlights, included, not_included, meeting_point),
      tour_categories(category_id, categories(slug))
    `)
    .eq("is_active", true)
    .eq("tour_translations.language", language);

  if (error) throw error;

  return (data ?? []).map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.tour_translations[0]?.name ?? t.slug,
    description: t.tour_translations[0]?.description ?? "",
    duration_hours: t.duration_hours,
    price_from: t.price_from,
    price_to: t.price_to,
    difficulty_level: t.difficulty_level,
    image_url: t.image_url,
    booking_url: t.booking_url,
    categories: t.tour_categories?.map((tc: { categories: { slug: string } }) => tc.categories.slug) ?? [],
    season: { start: t.season_start, end: t.season_end },
    highlights: t.tour_translations[0]?.highlights,
    included: t.tour_translations[0]?.included,
    meeting_point: t.tour_translations[0]?.meeting_point,
  }));
}

export async function getTourBySlug(slug: string, language: SupportedLanguage): Promise<Tour | null> {
  if (USE_MOCK) {
    const tours = await getTours(language);
    return tours.find((t) => t.slug === slug) ?? null;
  }

  const { data, error } = await (await getSupabaseClient())
    .from("tours")
    .select(`
      *,
      tour_translations!inner(name, description, highlights, included, not_included, meeting_point),
      tour_categories(category_id, categories(slug))
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("tour_translations.language", language)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: data.tour_translations[0]?.name ?? data.slug,
    description: data.tour_translations[0]?.description ?? "",
    duration_hours: data.duration_hours,
    price_from: data.price_from,
    price_to: data.price_to,
    difficulty_level: data.difficulty_level,
    image_url: data.image_url,
    booking_url: data.booking_url,
    categories: data.tour_categories?.map((tc: { categories: { slug: string } }) => tc.categories.slug) ?? [],
    season: { start: data.season_start, end: data.season_end },
    highlights: data.tour_translations[0]?.highlights,
    included: data.tour_translations[0]?.included,
    meeting_point: data.tour_translations[0]?.meeting_point,
  };
}
