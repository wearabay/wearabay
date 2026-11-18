"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createVoucherAction(formData: FormData) {
  const adminUser = await getAdminUser();
  if (!adminUser) throw new Error("Akses admin diperlukan.");

  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const discountType = String(formData.get("discount_type") ?? "");
  const discountValue = Number(formData.get("discount_value"));
  const maxDiscountRaw = String(formData.get("max_discount") ?? "").trim();
  const minimumSubtotal = Number(formData.get("minimum_subtotal") ?? 0);
  const quantity = Number(formData.get("quantity"));
  const startsRaw = String(formData.get("starts_at") ?? "").trim();
  const expiresRaw = String(formData.get("expires_at") ?? "").trim();

  if (!name || name.length > 120) throw new Error("Nama voucher wajib diisi (maksimal 120 karakter).");
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) throw new Error("Kode voucher harus 3–40 karakter: huruf, angka, - atau _.");
  if (!["percentage", "fixed"].includes(discountType)) throw new Error("Jenis diskon tidak valid.");
  if (!Number.isFinite(discountValue) || discountValue <= 0 || (discountType === "percentage" && discountValue > 100)) throw new Error("Nilai diskon tidak valid.");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) throw new Error("Kuota harus bilangan bulat 1–100000.");
  if (!Number.isFinite(minimumSubtotal) || minimumSubtotal < 0) throw new Error("Minimum belanja tidak valid.");
  const maxDiscount = maxDiscountRaw ? Number(maxDiscountRaw) : null;
  if (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount <= 0)) throw new Error("Batas diskon tidak valid.");
  const startsAt = startsRaw ? new Date(startsRaw).toISOString() : new Date().toISOString();
  const expiresAt = expiresRaw ? new Date(expiresRaw).toISOString() : null;
  if (expiresAt && new Date(expiresAt).getTime() <= new Date(startsAt).getTime()) throw new Error("Tanggal berakhir harus setelah tanggal mulai.");

  const supabase = createAdminClient();
  const { error } = await supabase.from("vouchers").insert({
    name,
    code,
    discount_type: discountType,
    discount_value: discountValue,
    max_discount: maxDiscount,
    minimum_subtotal: minimumSubtotal,
    quantity,
    starts_at: startsAt,
    expires_at: expiresAt,
    created_by: adminUser.id,
    is_active: true,
  });
  if (error) {
    console.error("createVoucherAction:", error);
    throw new Error(error.code === "23505" ? "Kode voucher sudah digunakan." : "Voucher gagal dibuat.");
  }
  revalidatePath("/admin/vouchers");
  revalidatePath("/vouchers");
}
