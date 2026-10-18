import "server-only";

const API_BASE = "https://rajaongkir.komerce.id/api/v1";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const destinationCache = new Map<string, { expiresAt: number; data: unknown }>();

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

export async function rajaOngkirRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const apiKey = process.env.RAJAONGKIR_API_KEY;
  if (!apiKey) throw new Error("RAJAONGKIR_API_KEY belum dikonfigurasi.");

  const cacheKey = init?.method === "POST" ? "" : path;
  if (cacheKey) {
    const cached = destinationCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data as T;
    if (cached) destinationCache.delete(cacheKey);
  }

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

  if (cacheKey) {
    destinationCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data: payload.data });
  }
  return payload.data as T;
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
): Promise<RajaDestination> {
  const terms = [...new Set([postalCode, district, city].filter(Boolean))];
  for (const term of terms) {
    const results = await searchDestinations(term);
    const matches = results.filter((row) =>
      normalizeRegion(row.province_name) === normalizeRegion(province) &&
      normalizeRegion(row.city_name) === normalizeRegion(city) &&
      normalizeRegion(row.district_name) === normalizeRegion(district) &&
      (!postalCode || !row.zip_code || String(row.zip_code).trim() === postalCode.trim())
    );
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) throw new Error("Tujuan pengiriman tidak unik. Pilih kelurahan dan kode pos yang benar.");
  }
  throw new Error(`Tujuan pengiriman tidak ditemukan untuk ${district}, ${city}, ${province} (${postalCode}).`);
}
