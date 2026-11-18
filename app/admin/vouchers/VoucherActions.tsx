
"use client";

import { useState, useTransition } from "react";
import {
  deleteVoucherAction,
  toggleVoucherAction,
} from "./actions";

type Props = {
  voucherId: string;
  isActive: boolean;
};

export default function VoucherActions({ voucherId, isActive }: Props) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function toggleStatus() {
    startTransition(async () => {
      const result = await toggleVoucherAction(voucherId, !isActive);
      setMessage(result.message);

      if (result.success) {
        window.location.reload();
      }
    });
  }

  function deleteVoucher() {
    const confirmed = window.confirm(
      "Hapus voucher ini secara permanen? Voucher yang memiliki riwayat klaim tidak bisa dihapus.",
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteVoucherAction(voucherId);
      setMessage(result.message);

      if (result.success) {
        window.location.reload();
      }
    });
  }

  return (
    <div className="mt-3 grid gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={toggleStatus}
        className="rounded-lg border border-stone-300 px-3 py-2 text-xs hover:bg-stone-100 disabled:opacity-50"
      >
        {pending
          ? "Memproses..."
          : isActive
            ? "Nonaktifkan voucher"
            : "Aktifkan voucher"}
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={deleteVoucher}
        className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        Hapus voucher
      </button>

      {message && (
        <p role="status" className="text-xs text-neutral-600">
          {message}
        </p>
      )}
    </div>
  );
}
