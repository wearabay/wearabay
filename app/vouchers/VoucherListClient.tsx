"use client";

import { useEffect, useState } from "react";

type Voucher = {
  id: string;
  name: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount: number | null;
  minimum_subtotal: number;
  quantity: number;
  claimed_count: number;
  expires_at: string | null;
};

type UnavailableClaim = {
  id: string;
  claimed_at: string;
  voucher: Voucher;
  reason: string;
};

type MyVouchersResponse = {
  claimedVoucherIds?: string[];
  unavailableClaims?: UnavailableClaim[];
};

function money(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function discountLabel(voucher: Voucher) {
  return voucher.discount_type === "percentage"
    ? `${voucher.discount_value}%${voucher.max_discount ? ` (maks. ${money(voucher.max_discount)})` : ""}`
    : money(voucher.discount_value);
}

export default function VoucherListClient() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [unavailableClaims, setUnavailableClaims] = useState<UnavailableClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchVouchers() {
      try {
        const [listResponse, ownResponse] = await Promise.all([
          fetch("/api/vouchers", { cache: "no-store" }),
          fetch("/api/my-vouchers", { cache: "no-store" }),
        ]);

        if (!listResponse.ok) {
          throw new Error("Gagal memuat daftar voucher.");
        }

        const list = (await listResponse.json()) as {
          vouchers?: Voucher[];
        };
        const own: MyVouchersResponse = ownResponse.ok
          ? await ownResponse.json()
          : { claimedVoucherIds: [], unavailableClaims: [] };

        if (cancelled) return;
        setVouchers(list.vouchers ?? []);
        setClaimed(own.claimedVoucherIds ?? []);
        setUnavailableClaims(own.unavailableClaims ?? []);
      } catch {
        if (!cancelled) {
          setMessage("Gagal memuat voucher. Coba muat ulang halaman.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchVouchers();
    return () => {
      cancelled = true;
    };
  }, []);

  async function claim(voucherId: string) {
    setBusy(voucherId);
    setMessage("");

    try {
      const response = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherId }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Voucher gagal diklaim.");
      }

      setClaimed((current) =>
        current.includes(voucherId) ? current : [...current, voucherId],
      );
      setMessage("Voucher berhasil diklaim. Kamu bisa memilihnya saat checkout.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Voucher gagal diklaim.",
      );
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <p className="mt-8 text-sm text-neutral-500">Memuat voucher…</p>;
  }

  if (!vouchers.length && !unavailableClaims.length) {
    return (
      <p className="mt-8 text-sm text-neutral-500">
        Belum ada voucher yang tersedia saat ini.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-12">
      {message && (
        <p role="status" className="rounded-xl bg-stone-100 p-4 text-sm text-neutral-700">
          {message}
        </p>
      )}

      {vouchers.length > 0 && (
        <section>
          <h2 className="mb-5 text-lg font-medium">Voucher tersedia</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vouchers.map((voucher) => {
              const isClaimed = claimed.includes(voucher.id);
              const remaining = Math.max(0, voucher.quantity - voucher.claimed_count);

              return (
                <article key={voucher.id} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Wearabay voucher</p>
                  <h3 className="mt-3 text-xl font-medium">{voucher.name}</h3>
                  <p className="mt-2 text-3xl font-light">{discountLabel(voucher)}</p>
                  <p className="mt-3 text-xs text-neutral-500">Kode {voucher.code}</p>
                  {voucher.minimum_subtotal > 0 && (
                    <p className="mt-2 text-xs text-neutral-500">Min. belanja {money(voucher.minimum_subtotal)}</p>
                  )}
                  {voucher.expires_at && (
                    <p className="mt-2 text-xs text-neutral-500">
                      Berakhir {new Date(voucher.expires_at).toLocaleDateString("id-ID")}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-neutral-500">Sisa kuota: {remaining}</p>
                  <button
                    type="button"
                    disabled={isClaimed || remaining === 0 || busy === voucher.id}
                    onClick={() => void claim(voucher.id)}
                    className="mt-6 rounded-xl bg-neutral-900 px-4 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-300"
                  >
                    {isClaimed ? "Sudah diklaim" : remaining === 0 ? "Kuota habis" : busy === voucher.id ? "Memproses…" : "Klaim voucher"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {unavailableClaims.length > 0 && (
        <section>
          <h2 className="mb-5 text-lg font-medium">Voucher yang tidak tersedia</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unavailableClaims.map((claim) => (
              <article key={claim.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-6 opacity-80">
                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">Voucher tersimpan</p>
                <h3 className="mt-3 text-xl font-medium">{claim.voucher.name}</h3>
                <p className="mt-2 text-2xl font-light">{discountLabel(claim.voucher)}</p>
                <p className="mt-3 text-xs text-neutral-500">Kode {claim.voucher.code}</p>
                <p className="mt-4 rounded-lg bg-white px-3 py-2 text-xs text-neutral-600">{claim.reason}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
