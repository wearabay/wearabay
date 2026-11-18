
"use client";

import { useActionState, useEffect, useRef } from "react";
import { updateVoucherAction } from "./actions";

type Props = {
  voucherId: string;
  isActive: boolean;
  children: React.ReactNode;
};

const initialState = { success: false, message: "" };

export default function VoucherEditForm({
  voucherId,
  isActive,
  children,
}: Props) {
  const [state, formAction, pending] = useActionState(
    updateVoucherAction,
    initialState,
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && state.message) {
      formRef.current?.closest("details")?.removeAttribute("open");
    }
  }, [state.success, state.message]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-3 grid gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4"
    >
      <input type="hidden" name="voucher_id" value={voucherId} />

      {children}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_active"
          value="true"
          defaultChecked={isActive}
          className="rounded border-stone-300"
        />
        Voucher aktif
      </label>

      {state.message && (
        <p
          role={state.success ? "status" : "alert"}
          className={`rounded-lg p-3 text-sm ${
            state.success
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-3 text-xs font-medium uppercase tracking-wider text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan perubahan"}
      </button>
    </form>
  );
}
