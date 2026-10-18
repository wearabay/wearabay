"use client";
import { useEffect, useMemo, useState } from "react";
import { Truck, RefreshCw, AlertCircle } from "lucide-react";
import {
  useCheckout,
  type ShippingSelection,
} from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";
type ShippingService = {
  courier: string;
  courierCode: "jne" | "jnt";
  service: string;
  description: string;
  price: number;
  etd: string;
};
type ShippingResponse = {
  destination?: {
    id: number;
    label: string;
  };
  weightGrams?: number;
  services?: ShippingService[];
  failedCouriers?: string[];
  error?: string;
};
function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
export default function DeliveryMethod() {
  const {
    address,
    delivery,
    setDelivery,
    shippingSelection,
    setShippingSelection,
  } = useCheckout();
  const { items } = useCart();
  const [services, setServices] = useState<ShippingService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [weightGrams, setWeightGrams] = useState(0);
  const [destination, setDestination] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [failedCouriers, setFailedCouriers] = useState<string[]>([]);
  const addressKey = useMemo(
    () =>
      [
        address.province,
        address.city,
        address.district,
        address.postalCode,
      ].join("|"),
    [
      address.province,
      address.city,
      address.district,
      address.postalCode,
    ],
  );
  const itemsKey = useMemo(
    () =>
      items
        .map((item) =>
          [
            item.id,
            item.quantity,
            item.color ?? "",
            item.size ?? "",
          ].join(":"),
        )
        .sort()
        .join("|"),
    [items],
  );
  const addressComplete = Boolean(
    address.province.trim() &&
      address.city.trim() &&
      address.district.trim() &&
      address.postalCode.trim(),
  );
  useEffect(() => {
    let cancelled = false;
    async function fetchRates() {
      setServices([]);
      setDestination(null);
      setFailedCouriers([]);
      setWeightGrams(0);
      setError("");
      setDelivery("");
      setShippingSelection(null);
      if (!addressComplete) {
        setError(
          "Lengkapi provinsi, kota, kecamatan, dan kode pos untuk melihat ongkir.",
        );
        return;
      }
      if (!items.length) {
        setError("Keranjang belanja masih kosong.");
        return;
      }
      setLoading(true);
      try {
        const response = await fetch("/api/shipping", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            province: address.province,
            city: address.city,
            district: address.district,
            postalCode: address.postalCode,
            items: items.map((item) => ({
              id: item.id,
              quantity: item.quantity,
              color: item.color ?? null,
              size: item.size ?? null,
            })),
          }),
          cache: "no-store",
        });
        const result =
          (await response.json()) as ShippingResponse;
        if (!response.ok) {
          throw new Error(
            result.error ?? "Gagal mengambil tarif pengiriman.",
          );
        }
        if (cancelled) return;
        const actualWeight = Number(result.weightGrams ?? 0);
        if (!Number.isFinite(actualWeight) || actualWeight <= 0) {
          throw new Error(
            "Berat paket tidak valid. Periksa berat produk di database.",
          );
        }
        const available = (result.services ?? []).filter(
          (service) =>
            Number.isFinite(service.price) &&
            service.price >= 0 &&
            (service.courierCode === "jne" ||
              service.courierCode === "jnt"),
        );
        setWeightGrams(actualWeight);
        setServices(available);
        setDestination(result.destination ?? null);
        setFailedCouriers(result.failedCouriers ?? []);
        if (!result.destination) {
          setServices([]);
          setError("Tujuan pengiriman tidak berhasil ditemukan.");
          return;
        }
        if (!available.length) {
          setError("Belum ada tarif pengiriman yang tersedia.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal mengambil tarif pengiriman.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void fetchRates();
    return () => {
      cancelled = true;
    };
  }, [
    addressKey,
    addressComplete,
    itemsKey,
    items.length,
    setDelivery,
    setShippingSelection,
  ]);
  function selectService(service: ShippingService) {
    if (!destination || weightGrams <= 0) return;
    const id = `${service.courierCode}:${service.service}`;
    const selection: ShippingSelection = {
      courier: service.courier,
      courierCode: service.courierCode,
      service: service.service,
      description: service.description,
      price: service.price,
      etd: service.etd,
      destinationId: destination.id,
      destinationLabel: destination.label,
      weightGrams,
    };
    setDelivery(id);
    setShippingSelection(selection);
  }
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="mb-6 flex items-center gap-2">
        <Truck className="h-5 w-5" />
        <h2 className="text-lg font-medium">
          Metode Pengiriman
        </h2>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Mengambil tarif JNE dan J&T...
        </div>
      )}
      {!loading && error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {!loading && services.length > 0 && (
        <>
          {destination && (
            <p className="mb-4 text-xs text-neutral-500">
              Tujuan: {destination.label}
            </p>
          )}
          <div className="space-y-3">
            {services.map((service) => {
              const id = `${service.courierCode}:${service.service}`;
              const selected =
                delivery === id &&
                shippingSelection?.courierCode ===
                  service.courierCode &&
                shippingSelection?.service === service.service;
              return (
                <label
                  key={id}
                  className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition ${
                    selected
                      ? "border-black bg-stone-50"
                      : "border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value={id}
                      checked={selected}
                      onChange={() => selectService(service)}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <p className="font-medium">
                        {service.courier} · {service.service}
                      </p>
                      {service.description && (
                        <p className="mt-1 text-sm text-neutral-500">
                          {service.description}
                        </p>
                      )}
                      {service.etd && (
                        <p className="mt-1 text-xs text-neutral-500">
                          Estimasi: {service.etd}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {formatRupiah(service.price)}
                  </span>
                </label>
              );
            })}
          </div>
          {failedCouriers.length > 0 && (
            <p className="mt-3 text-xs text-neutral-500">
              Tarif belum tersedia untuk:{" "}
              {failedCouriers.join(", ")}.
            </p>
          )}
          {weightGrams > 0 && (
            <p className="mt-3 text-xs text-neutral-500">
              Berat paket: {weightGrams.toLocaleString("id-ID")} gram
            </p>
          )}
        </>
      )}
    </section>
  );
}