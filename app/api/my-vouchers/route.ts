import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Silakan login." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("customer_vouchers")
    .select("id, claimed_at, used_at, vouchers(id, name, code, discount_type, discount_value, max_discount, minimum_subtotal, is_active, starts_at, expires_at)")
    .eq("customer_id", user.id)
    .is("used_at", null)
    .is("order_id", null)
    .order("claimed_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Gagal memuat voucher akun." }, { status: 500 });
  const now = Date.now();
  const claims = (data ?? []).filter((claim: any) => {
    const voucher = Array.isArray(claim.vouchers) ? claim.vouchers[0] : claim.vouchers;
    return voucher?.is_active && new Date(voucher.starts_at).getTime() <= now &&
      (!voucher.expires_at || new Date(voucher.expires_at).getTime() > now);
  });
  return NextResponse.json({ claims });
}
