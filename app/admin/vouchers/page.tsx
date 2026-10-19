import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createVoucherAction } from "./actions";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

export default async function AdminVouchersPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/account");

  const supabase = createAdminClient();
  const { data: vouchers, error } = await supabase
    .from("vouchers")
    .select("id, name, code, discount_type, discount_value, max_discount, minimum_subtotal, quantity, claimed_count, starts_at, expires_at, is_active, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="space-y-8 pt-2 lg:pt-8">
      <header>
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Administration</p>
        <h1 className="mt-2 text-3xl font-light tracking-tight sm:text-4xl">Vouchers</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">Buat voucher yang bisa diklaim pelanggan. Kuota menentukan jumlah klaim total yang tersedia.</p>
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-medium">Buat voucher</h2>
        <form action={createVoucherAction} className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm">Nama voucher<input required name="name" maxLength={120} className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3" placeholder="Voucher pelanggan baru" /></label>
          <label className="text-sm">Kode voucher<input required name="code" maxLength={40} pattern="[A-Za-z0-9_-]{3,40}" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 uppercase" placeholder="WELCOME10" /></label>
          <label className="text-sm">Jenis diskon<select required name="discount_type" className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-3"><option value="percentage">Persentase (%)</option><option value="fixed">Potongan nominal (Rp)</option></select></label>
          <label className="text-sm">Nilai diskon<input required name="discount_value" type="number" min="1" step="0.01" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3" /></label>
          <label className="text-sm">Maksimum diskon (opsional)<input name="max_discount" type="number" min="1" step="1" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3" /></label>
          <label className="text-sm">Minimum belanja (Rp)<input name="minimum_subtotal" type="number" min="0" step="1" defaultValue="0" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3" /></label>
          <label className="text-sm">Kuota klaim<input required name="quantity" type="number" min="1" max="100000" step="1" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3" /></label>
          <label className="text-sm">Mulai (opsional)<input name="starts_at" type="datetime-local" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3" /></label>
          <label className="text-sm">Berakhir (opsional)<input name="expires_at" type="datetime-local" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3" /></label>
          <div className="sm:col-span-2 xl:col-span-3"><button className="rounded-xl bg-neutral-900 px-5 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white hover:bg-black">Simpan voucher</button></div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-5"><h2 className="text-lg font-medium">Voucher terdaftar</h2></div>
        {error ? <p className="p-5 text-sm text-red-700">Gagal memuat data voucher. Pastikan migration sudah dijalankan.</p> : !vouchers?.length ? <p className="p-5 text-sm text-neutral-500">Belum ada voucher.</p> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-stone-50 text-xs text-neutral-500"><tr><th className="p-4">Voucher</th><th className="p-4">Diskon</th><th className="p-4">Minimum</th><th className="p-4">Klaim</th><th className="p-4">Periode</th><th className="p-4">Status</th></tr></thead>
            <tbody>{vouchers.map((voucher) => <tr key={voucher.id} className="border-t border-stone-100">
              <td className="p-4"><p className="font-medium">{voucher.name}</p><p className="mt-1 text-xs text-neutral-500">{voucher.code}</p></td>
              <td className="p-4">{voucher.discount_type === "percentage" ? `${voucher.discount_value}%${voucher.max_discount ? ` (maks. ${money(Number(voucher.max_discount))})` : ""}` : money(Number(voucher.discount_value))}</td>
              <td className="p-4">{money(Number(voucher.minimum_subtotal))}</td>
              <td className="p-4 tabular-nums">{voucher.claimed_count} / {voucher.quantity}</td>
              <td className="p-4 text-xs text-neutral-500">{new Date(voucher.starts_at).toLocaleDateString("id-ID")}<br />{voucher.expires_at ? `s/d ${new Date(voucher.expires_at).toLocaleDateString("id-ID")}` : "Tanpa kedaluwarsa"}</td>
              <td className="p-4">{voucher.is_active && voucher.claimed_count < voucher.quantity ? "Aktif" : "Habis / nonaktif"}</td>
            </tr>)}</tbody>
          </table></div>
        )}
      </section>
    </main>
  );
}
