
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/store-settings";
import { findRajaDestination, rajaOngkirRequest, type RajaDestination } from "@/lib/rajaongkir";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_WEIGHT_GRAMS = 100_000;

type Destination = RajaDestination;

type ShippingService = {
  courier: string;
  courierCode: "jne" | "jnt";
  service: string;
  description: string;
  price: number;
  etd: string;
};

type CartRequestItem = {
  id: number;
  quantity: number;
  color?: string | null;
  size?: string | null;
};


function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getServices(
  originId: string,
  destinationId: number,
  weightGrams: number,
  courierCode: "jne" | "jnt",
): Promise<ShippingService[]> {
  const body = new URLSearchParams({
    origin: originId,
    destination: String(destinationId),
    weight: String(weightGrams),
    courier: courierCode,
  });

  const data = await rajaOngkirRequest<
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
    body: body.toString(),
  });

  return data
    .filter(
      (item) =>
        typeof item.service === "string" &&
        Number.isFinite(Number(item.cost)) &&
        Number(item.cost) >= 0,
    )
    .map((item) => ({
      courier: String(
        item.name ?? (courierCode === "jne" ? "JNE" : "J&T"),
      ),
      courierCode,
      service: item.service!.trim(),
      description: String(item.description ?? ""),
      price: Number(item.cost),
      etd: String(item.etd ?? ""),
    }));
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Silakan login untuk menghitung ongkir.", 401);
    }

    const settings = await getStoreSettings();
    if (!settings.automaticShippingEnabled) {
      return errorResponse("Ongkir otomatis sedang dinonaktifkan oleh admin. Pilih COD ongkir atau hubungi admin.", 503);
    }

    const originId = process.env.RAJAONGKIR_ORIGIN_ID;

    if (!originId || !/^\d+$/.test(originId)) {
      return errorResponse(
        "RAJAONGKIR_ORIGIN_ID belum dikonfigurasi dengan benar.",
        503,
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Request JSON tidak valid.", 400);
    }

    const province = String(body.province ?? "").trim();
    const city = String(body.city ?? "").trim();
    const district = String(body.district ?? "").trim();
    const postalCode = String(body.postalCode ?? "").trim();
    const selectedDestinationId = Number(body.destinationId) || undefined;

    if (!province || !city || !district || !postalCode) {
      return errorResponse(
        "Provinsi, kota, kecamatan, dan kode pos wajib diisi.",
        400,
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return errorResponse("Keranjang belanja kosong.", 400);
    }

    const items = body.items as CartRequestItem[];

    if (
      items.some(
        (item) =>
          !Number.isInteger(Number(item.id)) ||
          Number(item.id) <= 0 ||
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) <= 0 ||
          Number(item.quantity) > 100,
      )
    ) {
      return errorResponse("Data produk atau jumlah barang tidak valid.", 400);
    }

    const productIds = [
      ...new Set(items.map((item) => Number(item.id))),
    ];

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        "id, weight_grams, packed_weight_grams, package_length_cm, package_width_cm, package_height_cm",
      )
      .in("id", productIds)
      .eq("status", "published");

    if (productsError) {
      console.error("Shipping product lookup failed:", productsError);
      return errorResponse("Gagal membaca data berat produk.", 500);
    }

    if (!products || products.length !== productIds.length) {
      return errorResponse(
        "Ada produk yang tidak ditemukan atau tidak tersedia.",
        400,
      );
    }

    const productMap = new Map(
      products.map((product) => [Number(product.id), product]),
    );

    let totalWeight = 0;

    for (const item of items) {
      const product = productMap.get(Number(item.id));

      if (!product) {
        return errorResponse("Produk tidak ditemukan.", 400);
      }

      const unitWeight = Number(
        product.packed_weight_grams ?? product.weight_grams,
      );

      if (!Number.isFinite(unitWeight) || unitWeight <= 0) {
        return errorResponse(
          `Berat produk ID ${item.id} belum diatur dengan benar.`,
          400,
        );
      }

      totalWeight += Math.ceil(unitWeight) * Number(item.quantity);
    }

    const weightGrams = Math.ceil(totalWeight);

    if (weightGrams < 1 || weightGrams > MAX_WEIGHT_GRAMS) {
      return errorResponse(
        "Total berat paket di luar batas layanan pengiriman.",
        400,
      );
    }

    const destination = await findRajaDestination(
      province,
      city,
      district,
      postalCode,
      selectedDestinationId,
    );

    const results = await Promise.allSettled([
      getServices(originId, destination.id, weightGrams, "jne"),
      getServices(originId, destination.id, weightGrams, "jnt"),
    ]);

    const services: ShippingService[] = [];
    const failedCouriers: string[] = [];

    results.forEach((result, index) => {
      const courier = index === 0 ? "JNE" : "J&T";

      if (result.status === "fulfilled") {
        services.push(...result.value);

        if (result.value.length === 0) {
          failedCouriers.push(courier);
        }
      } else {
        failedCouriers.push(courier);
        console.error(`Tarif ${courier} gagal diambil:`, result.reason);
      }
    });

    services.sort((a, b) => a.price - b.price);

    if (services.length === 0) {
      return NextResponse.json(
        {
          error: "Tarif JNE/J&T tidak tersedia untuk alamat ini.",
          failedCouriers,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      destination: {
        id: destination.id,
        label: destination.label,
      },
      weightGrams,
      services,
      failedCouriers,
    });
  } catch (error) {
    console.error("Shipping rate error:", error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Gagal menghitung ongkir.",
      500,
    );
  }
}
