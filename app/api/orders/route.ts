import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findRajaDestination, rajaOngkirRequest } from "@/lib/rajaongkir";
import { getStoreSettings } from "@/lib/store-settings";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_WEIGHT_GRAMS = 100_000;
type Item = {
  id: number;
  quantity: number;
  color?: string | null;
  size?: string | null;
};
function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
export async function POST(request: Request) {
  try {
    // Verifikasi sesi pelanggan menggunakan cookie Supabase.
    const sessionClient = await createClient();
    const {
      data: { user },
      error: authError,
    } = await sessionClient.auth.getUser();
    if (authError || !user) {
      return fail("Silakan login sebelum membuat pesanan.", 401);
    }
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return fail("Request tidak valid.");
    }
    const items = body.items as Item[] | undefined;
    const customer = body.customer;
    const address = body.address;
    const delivery = String(body.delivery ?? "");
    const payment = String(body.payment ?? "");
    const selection = body.shippingSelection;
    if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
      return fail("Daftar produk tidak valid.");
    }
    if (
      items.some(
        (item) =>
          !Number.isInteger(Number(item.id)) ||
          Number(item.id) <= 0 ||
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) <= 0 ||
          Number(item.quantity) > 100 ||
          !item.color ||
          !item.size,
      )
    ) {
      return fail("Produk, jumlah, warna, atau ukuran tidak valid.");
    }
    if (
      !customer?.email ||
      !customer?.phone ||
      !address?.firstName ||
      !address?.lastName ||
      !address?.street ||
      !address?.province ||
      !address?.city ||
      !address?.district ||
      !address?.postalCode ||
      !address?.country ||
      !payment
    ) {
      return fail("Data pelanggan dan alamat belum lengkap.");
    }
    const isCODShipping = delivery === "cod_ongkir";
    let expectedDelivery = "cod_ongkir";
    let courierCode: "jne" | "jnt" | "cod" = "cod";
    let shippingFee = 0;
    let shippingService = "COD_ONGKIR";
    let destinationId: number | null = null;
    let weightGrams = 0;

    if (isCODShipping) {
      if (!selection || selection.courierCode !== "cod" || selection.service !== "COD_ONGKIR") {
        return fail("Pilihan COD ongkir tidak valid.");
      }
      // Ongkir dibayar penerima langsung ke kurir. No RajaOngkir lookup/cost call.
    } else {
      const settings = await getStoreSettings();
      if (!settings.automaticShippingEnabled) {
        return fail("Ongkir otomatis sedang dinonaktifkan. Pilih COD ongkir atau hubungi admin.", 503);
      }
      if (
        !selection ||
        !["jne", "jnt"].includes(selection.courierCode) ||
        !Number.isInteger(Number(selection.destinationId)) ||
        Number(selection.destinationId) <= 0 ||
        !String(selection.service ?? "").trim()
      ) {
        return fail("Pilihan pengiriman tidak valid.");
      }
      const admin = createAdminClient();
      const productIds = [...new Set(items.map((item) => Number(item.id)))];
      const { data: products, error: productsError } = await admin
        .from("products")
        .select("id, weight_grams, packed_weight_grams")
        .in("id", productIds)
        .eq("status", "published");
      if (productsError || !products || products.length !== productIds.length) {
        return fail("Gagal memvalidasi berat produk untuk ongkir.", 400);
      }
      const productMap = new Map(products.map((product) => [Number(product.id), product]));
      for (const item of items) {
        const product = productMap.get(Number(item.id));
        const unitWeight = Number(product?.packed_weight_grams ?? product?.weight_grams);
        if (!Number.isFinite(unitWeight) || unitWeight <= 0) {
          return fail(`Berat produk ID ${item.id} belum diatur dengan benar.`, 400);
        }
        weightGrams += Math.ceil(unitWeight) * Number(item.quantity);
      }
      weightGrams = Math.ceil(weightGrams);
      if (weightGrams < 1 || weightGrams > MAX_WEIGHT_GRAMS) {
        return fail("Total berat paket di luar batas layanan pengiriman.", 400);
      }
      const originId = process.env.RAJAONGKIR_ORIGIN_ID;
      if (!originId || !/^\d+$/.test(originId)) {
        return fail("RAJAONGKIR_ORIGIN_ID belum dikonfigurasi.", 503);
      }
      const destination = await findRajaDestination(
        String(address.province).trim(),
        String(address.city).trim(),
        String(address.district).trim(),
        String(address.postalCode).trim(),
        Number(selection.destinationId),
      );
      if (destination.id !== Number(selection.destinationId)) {
        return fail("Tujuan pengiriman berubah. Pilih layanan lagi.");
      }
      courierCode = selection.courierCode as "jne" | "jnt";
      const rateBody = new URLSearchParams({
        origin: originId,
        destination: String(destination.id),
        weight: String(weightGrams),
        courier: courierCode,
      });
      const rates = await rajaOngkirRequest<
        Array<{
          name?: string;
          service?: string;
          description?: string;
          cost?: number | string;
          etd?: string | number;
        }>
      >("/calculate/domestic-cost", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: rateBody.toString(),
      });
      const rate = rates.find(
        (row) =>
          row.service?.trim() === String(selection.service).trim() &&
          Number.isFinite(Number(row.cost)) &&
          Number(row.cost) >= 0,
      );
      if (!rate) return fail("Tarif pilihan sudah tidak tersedia. Pilih layanan pengiriman lagi.", 422);
      expectedDelivery = `${courierCode}:${rate.service!.trim()}`;
      if (delivery !== expectedDelivery) return fail("Pilihan pengiriman tidak cocok.");
      shippingFee = Number(rate.cost);
      shippingService = rate.service!.trim();
      destinationId = destination.id;
    }
    // COD juga memakai RPC aman; tidak ada lookup ongkir API pada cabang COD.
    const admin = createAdminClient();
    const { data: orderId, error: orderError } = await admin.rpc(
      "create_order_secure",
      {
        p_user_id: user.id,
        p_customer_email: String(customer.email).trim(),
        p_customer_phone: String(customer.phone).trim(),
        p_first_name: String(address.firstName).trim(),
        p_last_name: String(address.lastName).trim(),
        p_country: String(address.country).trim(),
        p_province: String(address.province).trim(),
        p_city: String(address.city).trim(),
        p_postal_code: String(address.postalCode).trim(),
        p_street: String(address.street).trim(),
        p_delivery_method: expectedDelivery,
        p_payment_method: payment,
        p_items: items.map((item) => ({
          id: Number(item.id),
          quantity: Number(item.quantity),
          color: item.color,
          size: item.size,
        })),
        p_shipping_fee: shippingFee,
        p_shipping_courier: courierCode,
        p_shipping_service: shippingService,
        p_shipping_destination_id: destinationId,
        p_shipping_weight_grams: weightGrams,
      },
    );
    if (orderError) {
      console.error("Secure order RPC failed:", orderError);
      return fail("Pesanan gagal dibuat. Periksa data lalu coba lagi.", 400);
    }
    if (!orderId || typeof orderId !== "string") {
      return fail("Database tidak mengembalikan ID pesanan.", 500);
    }
    return NextResponse.json(
      { order: { id: orderId } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create order endpoint failed:", error);
    return fail(
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat membuat pesanan.",
      500,
    );
  }
}