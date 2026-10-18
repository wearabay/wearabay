import "server-only";
import { unstable_cache } from "next/cache";

const API_BASE = "https://rajaongkir.komerce.id/api/v1";
const DESTINATION_CACHE_SECONDS = 6 * 60 * 60;

export type RajaDestination = {
  id: number;
  label: string;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  zip_code: string;
};

export function normalizeRegion(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(kabupaten|kab\.|kota administrasi|kota)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchRajaOngkir<T>(
  path: string,
  apiKey: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: { key: apiKey, Accept: "application/json", ...(init?.headers ?? {}) },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.meta?.status === "error") {
    throw new Error(payload?.meta?.message ?? `RajaOngkir gagal merespons (${response.status}).`);
  }
  if (!Array.isArray(payload?.data)) throw new Error("Format respons RajaOngkir tidak valid.");
  return payload.data as T;
}

// Next.js Data Cache: persistent across requests and shared between server
// instances when the deployment platform provides a shared Next.js cache.
const getCachedDestinations = unstable_cache(
  async (path: string, apiKey: string) =>
    fetchRajaOngkir<RajaDestination[]>(path, apiKey),
  ["rajaongkir-destination-search-v1"],
  { revalidate: DESTINATION_CACHE_SECONDS, tags: ["rajaongkir-destinations"] },
);

export async function rajaOngkirRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const apiKey = process.env.RAJAONGKIR_API_KEY;
  if (!apiKey) throw new Error("RAJAONGKIR_API_KEY belum dikonfigurasi.");

  // Only cache destination GET searches. Courier calculations must always be fresh.
  if (!init?.method || init.method.toUpperCase() === "GET") {
    if (path.startsWith("/destination/domestic-destination?")) {
      return (await getCachedDestinations(path, apiKey)) as T;
    }
  }

  return fetchRajaOngkir<T>(path, apiKey, init);
}

export async function searchDestinations(search: string): Promise<RajaDestination[]> {
  const query = new URLSearchParams({ search: search.trim(), limit: "100", offset: "0" });
  return rajaOngkirRequest<RajaDestination[]>(`/destination/domestic-destination?${query.toString()}`);
}

export async function findRajaDestination(
  province: string,
  city: string,
  district: string,
  postalCode: string,
  selectedDestinationId?: number,
): Promise<RajaDestination> {
  const terms = [...new Set([selectedDestinationId ? district : postalCode, district, city].filter(Boolean))];
  for (const term of terms) {
    const results = await searchDestinations(term);
    const matches = results.filter((row) =>
      normalizeRegion(row.province_name) === normalizeRegion(province) &&
      normalizeRegion(row.city_name) === normalizeRegion(city) &&
      normalizeRegion(row.district_name) === normalizeRegion(district) &&
      (!selectedDestinationId || Number(row.id) === selectedDestinationId) &&
      (!postalCode || !row.zip_code || String(row.zip_code).trim() === postalCode.trim())
    );
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) throw new Error("Tujuan pengiriman tidak unik. Pilih kelurahan dan kode pos yang benar.");
  }
  throw new Error(`Tujuan pengiriman tidak ditemukan untuk ${district}, ${city}, ${province} (${postalCode}).`);
}
