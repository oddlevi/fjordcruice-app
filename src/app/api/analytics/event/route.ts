import { NextRequest, NextResponse } from "next/server";
import { analyticsEventSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid event data" },
      { status: 400 }
    );
  }

  // For MVP: log to console. In production, send to Plausible or store in Supabase.
  console.log("[analytics]", parsed.data.event, parsed.data.data ?? {});

  return NextResponse.json({ ok: true });
}
