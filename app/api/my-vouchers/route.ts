
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type VoucherRow = {
  id: string;
  name: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount: number | null;
  minimum_subtotal: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
};

type CustomerVoucherRow = {
  id: string;
  claimed_at: string;
  used_at: string | null;
  order_id: string | null;
  vouchers: VoucherRow | VoucherRow[] | null;
};

function getVoucher(row: CustomerVoucherRow): VoucherRow | null {
  return Array.isArray(row.vouchers)
    ? row.vouchers[0] ?? null
    : row.vouchers;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Silakan login." },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("customer_vouchers")
    .select(
      "id, claimed_at, used_at, order_id, vouchers(id, name, code, discount_type, discount_value, max_discount, minimum_subtotal, is_active, starts_at, expires_at)",
    )
    .eq("customer_id", user.id)
    .order("claimed_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Gagal memuat voucher akun." },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as unknown as CustomerVoucherRow[];
  const now = Date.now();

  const claimedVoucherIds = rows
    .map((claim) => getVoucher(claim)?.id)
    .filter((id): id is string => Boolean(id));

  const claims = rows.filter((claim) => {
    if (claim.used_at || claim.order_id) return false;

    const voucher = getVoucher(claim);
    return Boolean(
      voucher?.is_active &&
        new Date(voucher.starts_at).getTime() <= now &&
        (!voucher.expires_at ||
          new Date(voucher.expires_at).getTime() > now),
    );
  });

  return NextResponse.json({ claims, claimedVoucherIds });
}
