import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vouchers")
    .select("id, name, code, discount_type, discount_value, max_discount, minimum_subtotal, quantity, claimed_count, starts_at, expires_at")
    .eq("is_active", true)
    .lte("starts_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Gagal memuat voucher." }, { status: 500 });
  const now = Date.now();
  const vouchers = (data ?? []).filter((voucher) =>
    voucher.claimed_count < voucher.quantity &&
    (!voucher.expires_at || new Date(voucher.expires_at).getTime() > now)
  );
  return NextResponse.json({ vouchers });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Login dulu untuk klaim voucher." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const voucherId = body && typeof body.voucherId === "string" ? body.voucherId : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(voucherId)) {
    return NextResponse.json({ error: "Voucher tidak valid." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("claim_customer_voucher", { p_voucher_id: voucherId });
  if (error) {
    const message = error.message.includes("sudah pernah") ? "Kamu sudah pernah mengklaim voucher ini." : "Voucher sudah tidak tersedia atau gagal diklaim.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ claimId: data }, { status: 201 });
}
