
"use client";

import { useEffect, useState } from "react";

type Props = {
  expiresAt: string | null;
  paymentStatus: string;
  orderStatus: string;
  compact?: boolean;
};

function formatRemaining(milliseconds: number) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function PaymentCountdown({
  expiresAt,
  paymentStatus,
  orderStatus,
  compact = false,
}: Props) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  if (
    !expiresAt ||
    paymentStatus !== "pending" ||
    orderStatus === "cancelled" ||
    orderStatus === "paid" ||
    orderStatus === "processing" ||
    orderStatus === "shipped" ||
    orderStatus === "delivered" ||
    orderStatus === "completed"
  ) {
    return null;
  }

  const containerClass = `rounded-xl border border-amber-200 bg-amber-50 ${
    compact ? "px-2.5 py-2" : "px-3 py-2.5"
  }`;

  const headingClass = `font-medium text-amber-950 ${
    compact ? "text-xs" : "text-sm"
  }`;

  const timerClass = `mt-1 font-mono font-semibold tracking-wider text-amber-950 ${
    compact ? "text-lg" : "text-xl"
  }`;

  const descriptionClass = `mt-1 text-xs leading-4 text-amber-900 ${
    compact ? "hidden" : ""
  }`;

  // Prevent hydration mismatch between server and browser.
  if (now === null) {
    return (
      <div className={containerClass}>
        <p className={headingClass}>
          Selesaikan pembayaran dalam
        </p>

        <p className={timerClass}>
          --:--:--
        </p>

        <p className={descriptionClass}>
          Bukti transfer atau konfirmasi WhatsApp tetap menunggu persetujuan admin.
        </p>
      </div>
    );
  }

  const remaining = new Date(expiresAt).getTime() - now;
  const expired = remaining <= 0;

  return (
    <div className={containerClass}>
      <p className={headingClass}>
        {expired
          ? "Waktu pembayaran habis"
          : "Selesaikan pembayaran dalam"}
      </p>

      <p
        aria-live="polite"
        className={timerClass}
      >
        {formatRemaining(remaining)}
      </p>

      <p className={descriptionClass}>
        {expired
          ? "Pesanan menunggu proses pembatalan otomatis. Konfirmasi atau unggah bukti tidak menggantikan persetujuan admin."
          : "Bukti transfer atau konfirmasi WhatsApp tetap menunggu persetujuan admin."}
      </p>
    </div>
  );
}
