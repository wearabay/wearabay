
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE = "https://rajaongkir.komerce.id/api/v1";
const MAX_WEIGHT_GRAMS = 100_000;

type Destination = {
  id: number;
  label: string;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  zip_code: string;
};

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


function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(kabupaten|kab\.|kota administrasi|kota)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function rajaOngkirRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const apiKey = process.env.RAJAONGKIR_API_KEY;

  if (!apiKey) {
    throw new Error("RAJAONGKIR_API_KEY belum tersedia di server.");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      key: apiKey,
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.meta?.status === "error") {
    throw new Error(
      payload?.meta?.message ??
        `RajaOngkir gagal merespons (${response.status}).`,
    );
  }

  if (!Array.isArray(payload?.data)) {
    throw new Error("Format respons RajaOngkir tidak valid.");
  }

  return payload.data as T;
}


async function findDestination(
  province: string,
  city: string,
  district: string,
  postalCode: string,
): Promise<Destination> {
  const searchTerms = [...new Set([postalCode, district, city].filter(Boolean))];
  let lastSearchError = "";

  for (const term of searchTerms) {
    const query = new URLSearchParams({
      search: term,
      limit: "100",
      offset: "0",
    });

    let results: Destination[];

    try {
      results = await rajaOngkirRequest<Destination[]>(
        `/destination/domestic-destination?${query.toString()}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      // Pencarian tanpa hasil tidak boleh menghentikan pencarian berikutnya.
      if (/not found|tidak ditemukan/i.test(message)) {
        lastSearchError = message;
        continue;
      }

      // Error autentikasi, kuota, atau gangguan API harus tetap terlihat.
      throw error;
    }

    const matches = results.filter((item) => {
      const provinceMatch =
        normalize(item.province_name) === normalize(province);
      const cityMatch =
        normalize(item.city_name) === normalize(city);
      const districtMatch =
        normalize(item.district_name) === normalize(district);
      const postalMatch =
        !postalCode ||
        !item.zip_code ||
        String(item.zip_code).trim() === postalCode;

      return provinceMatch && cityMatch && districtMatch && postalMatch;
    });

    if (matches.length === 1) return matches[0];

    if (matches.length > 1) {
      throw new Error(
        "Alamat tujuan memiliki beberapa kecocokan. Periksa kecamatan dan kode pos.",
      );
    }
  }

  throw new Error(
    `Tujuan pengiriman tidak ditemukan untuk ${district}, ${city}, ${province} (${postalCode}). ${
      lastSearchError ? `Respons pencarian terakhir: ${lastSearchError}` : ""
    }`,
  );
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

    const destination = await findDestination(
      province,
      city,
      district,
      postalCode,
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
