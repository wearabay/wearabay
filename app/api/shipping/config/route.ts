import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json(
    { automaticShippingEnabled: settings.automaticShippingEnabled },
    { headers: { "Cache-Control": "no-store" } },
  );
}
