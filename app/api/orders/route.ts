import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findRajaDestination, rajaOngkirRequest } from "@/lib/rajaongkir";
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
    if (
      !selection ||
      !["jne", "jnt"].includes(selection.courierCode) ||
      !Number.isInteger(Number(selection.destinationId)) ||
      Number(selection.destinationId) <= 0 ||
      !String(selection.service ?? "").trim()
    ) {
      return fail("Pilihan pengiriman tidak valid.");
    }
    const originId = process.env.RAJAONGKIR_ORIGIN_ID;
    if (!originId || !/^\d+$/.test(originId)) {
      return fail("RAJAONGKIR_ORIGIN_ID belum dikonfigurasi.", 503);
    }
    // Ambil berat dari database; jangan percaya berat dari browser.
    const admin = createAdminClient();
    const productIds = [...new Set(items.map((item) => Number(item.id)))];
    const { data: products, error: productError } = await admin
      .from("products")
      .select("id, weight_grams, packed_weight_grams")
      .in("id", productIds)
      .eq("status", "published");
    if (productError) {
      console.error("Product lookup failed:", productError);
      return fail("Gagal memeriksa produk.", 500);
    }
    if (!products || products.length !== productIds.length) {
      return fail("Ada produk yang tidak tersedia.");
    }
    const productMap = new Map(
      products.map((product) => [Number(product.id), product]),
    );
    let weightGrams = 0;
    for (const item of items) {
      const product = productMap.get(Number(item.id));
      const unitWeight = Number(
        product?.packed_weight_grams ?? product?.weight_grams,
      );
      if (!Number.isFinite(unitWeight) || unitWeight <= 0) {
        return fail(`Berat produk ${item.id} belum valid.`);
      }
      weightGrams += Math.ceil(unitWeight) * Number(item.quantity);
    }
    weightGrams = Math.ceil(weightGrams);
    if (weightGrams <= 0 || weightGrams > MAX_WEIGHT_GRAMS) {
      return fail("Berat paket di luar batas layanan pengiriman.");
    }
    // Cocokkan ulang alamat dengan data tujuan RajaOngkir.
    const destination = await findRajaDestination(
      String(address.province).trim(),
      String(address.city).trim(),
      String(address.district).trim(),
      String(address.postalCode).trim(),
    );
    if (destination.id !== Number(selection.destinationId)) {
      return fail("Tujuan pengiriman berubah. Pilih layanan lagi.");
    }
    // Hitung ulang tarif di server dan cari layanan yang dipilih.
    const courierCode = selection.courierCode as "jne" | "jnt";
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
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: rateBody.toString(),
    });
    const rate = rates.find(
      (row) =>
        row.service?.trim() === String(selection.service).trim() &&
        Number.isFinite(Number(row.cost)) &&
        Number(row.cost) >= 0,
    );
    if (!rate) {
      return fail(
        "Tarif pilihan sudah tidak tersedia. Pilih layanan pengiriman lagi.",
        422,
      );
    }
    const courierName =
      String(rate.name ?? (courierCode === "jne" ? "JNE" : "J&T"));
    const expectedDelivery = `${courierCode}:${rate.service!.trim()}`;
    if (delivery !== expectedDelivery) {
      return fail("Pilihan pengiriman tidak cocok.");
    }
    // RPC ini harus dibuat melalui migrasi SQL sebelum endpoint diaktifkan.
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
        p_shipping_fee: Number(rate.cost),
        p_shipping_courier: courierCode,
        p_shipping_service: rate.service!.trim(),
        p_shipping_destination_id: destination.id,
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