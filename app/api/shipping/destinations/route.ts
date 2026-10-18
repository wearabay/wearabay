import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchDestinations, normalizeRegion } from "@/lib/rajaongkir";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Silakan login untuk memuat data wilayah." }, { status: 401 });
  }

  const url = new URL(request.url);
  const search = (url.searchParams.get("search") ?? "").trim();
  const province = (url.searchParams.get("province") ?? "").trim();
  const city = (url.searchParams.get("city") ?? "").trim();
  const district = (url.searchParams.get("district") ?? "").trim();

  if (search.length < 2) {
    return NextResponse.json({ destinations: [] });
  }

  try {
    const rows = await searchDestinations(search);
    const destinations = rows.filter((row) =>
      (!province || normalizeRegion(row.province_name) === normalizeRegion(province)) &&
      (!city || normalizeRegion(row.city_name) === normalizeRegion(city)) &&
      (!district || normalizeRegion(row.district_name) === normalizeRegion(district))
    );
    return NextResponse.json({ destinations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memuat tujuan pengiriman.";
    const status = /daily limit|quota|limit exceeded/i.test(message) ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
