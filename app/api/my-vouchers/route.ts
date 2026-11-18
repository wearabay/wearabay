import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

type ClaimRow = {
  id: string;
  voucher_id: string;
  claimed_at: string;
  used_at: string | null;
  order_id: string | null;
};

export async function GET() {
  const sessionClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await sessionClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Silakan login." },
      { status: 401 },
    );
  }

  try {
    // Read the customer's own claims through the privileged server client,
    // then fetch voucher records separately to avoid RLS-blocked nested joins.
    const admin = createAdminClient();
    const { data: claimRows, error: claimsError } = await admin
      .from("customer_vouchers")
      .select("id, voucher_id, claimed_at, used_at, order_id")
      .eq("customer_id", user.id)
      .order("claimed_at", { ascending: false });

    if (claimsError) {
      console.error("my-vouchers claims query failed:", claimsError);
      return NextResponse.json(
        { error: "Gagal memuat klaim voucher." },
        { status: 500 },
      );
    }

    const rows = (claimRows ?? []) as ClaimRow[];
    const voucherIds = [...new Set(rows.map((row) => row.voucher_id))];

    let voucherRows: VoucherRow[] = [];
    if (voucherIds.length > 0) {
      const { data, error: vouchersError } = await admin
        .from("vouchers")
        .select("id, name, code, discount_type, discount_value, max_discount, minimum_subtotal, is_active, starts_at, expires_at")
        .in("id", voucherIds);

      if (vouchersError) {
        console.error("my-vouchers voucher query failed:", vouchersError);
        return NextResponse.json(
          { error: "Gagal memuat detail voucher." },
          { status: 500 },
        );
      }
      voucherRows = (data ?? []) as VoucherRow[];
    }

    const voucherMap = new Map(
      voucherRows.map((voucher) => [voucher.id, voucher]),
    );
    const now = Date.now();

    const claims = [];
    const unavailableClaims = [];
    const claimedVoucherIds: string[] = [];

    for (const claim of rows) {
      const voucher = voucherMap.get(claim.voucher_id);

      // A deleted voucher should disappear completely from the customer's list.
      if (!voucher) continue;

      claimedVoucherIds.push(voucher.id);

      // Already-used vouchers are not selectable or shown as unavailable.
      if (claim.used_at || claim.order_id) continue;

      const reason = !voucher.is_active
        ? "Dinonaktifkan oleh admin."
        : new Date(voucher.starts_at).getTime() > now
          ? "Voucher belum mulai berlaku."
          : voucher.expires_at && new Date(voucher.expires_at).getTime() <= now
            ? "Masa berlaku voucher telah berakhir."
            : null;

      const item = {
        id: claim.id,
        claimed_at: claim.claimed_at,
        voucher,
      };

      if (reason) {
        unavailableClaims.push({ ...item, reason });
      } else {
        claims.push(item);
      }
    }

    return NextResponse.json({
      claims,
      claimedVoucherIds,
      unavailableClaims,
    });
  } catch (error) {
    console.error("my-vouchers endpoint failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat voucher akun." },
      { status: 500 },
    );
  }
}
