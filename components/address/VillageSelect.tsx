"use client";

import { useEffect, useState } from "react";

type Destination = {
  id: number;
  label: string;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  zip_code: string;
};

type Props = {
  province: string;
  city: string;
  district: string;
  value: string;
  error?: string;
  onChange: (destination: Destination | null) => void;
};

export default function VillageSelect({
  province,
  city,
  district,
  value,
  error,
  onChange,
}: Props) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setDestinations([]);
      setMessage("");
      if (!province || !city || !district) return;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: district,
          province,
          city,
          district,
        });
        const response = await fetch(`/api/shipping/destinations?${params}`, {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Gagal memuat kelurahan.");
        if (cancelled) return;

        const rows = (payload.destinations ?? []) as Destination[];
        const unique = new Map<number, Destination>();
        for (const row of rows) {
          if (row.subdistrict_name && row.zip_code) unique.set(row.id, row);
        }
        const options = [...unique.values()].sort((a, b) =>
          a.subdistrict_name.localeCompare(b.subdistrict_name, "id")
        );
        setDestinations(options);
        if (!options.length) setMessage("Data kelurahan belum tersedia. Coba lagi nanti.");
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Gagal memuat kelurahan.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [province, city, district]);

  return (
    <div className="space-y-2">
      <label htmlFor="village" className="text-xs uppercase tracking-[0.2em] text-neutral-600">
        Village / Kelurahan
      </label>
      <select
        id="village"
        value={value}
        disabled={!district || loading || destinations.length === 0}
        onChange={(event) => {
          const selected = destinations.find((item) => String(item.id) === event.target.value);
          onChange(selected ?? null);
        }}
        aria-invalid={!!error}
        className={`h-14 w-full rounded-md border bg-white px-5 outline-none transition ${error ? "border-red-400" : "border-neutral-300"} disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 focus:border-black`}
      >
        <option value="">
          {loading ? "Loading villages..." : !district ? "Select District First" : "Select Village / Kelurahan"}
        </option>
        {destinations.map((item) => (
          <option key={item.id} value={String(item.id)}>
            {item.subdistrict_name} — {item.zip_code}
          </option>
        ))}
      </select>
      {message && <p className="text-xs text-neutral-500">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
