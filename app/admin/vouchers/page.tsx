import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createVoucherAction, updateVoucherAction, toggleVoucherAction, deleteVoucherAction } from "./actions";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

export default async function AdminVouchersPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/account");

  type VoucherRow = {
    id: string;
    name: string;
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    max_discount: number | null;
    minimum_subtotal: number;
    quantity: number;
    claimed_count: number;
    starts_at: string;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
  };

  let vouchers: VoucherRow[] = [];
  let loadError = false;

  try {
    const supabase = createAdminClient();
    const result = await supabase
      .from("vouchers")
      .select("id, name, code, discount_type, discount_value, max_discount, minimum_subtotal, quantity, claimed_count, starts_at, expires_at, is_active, created_at")
      .order("created_at", { ascending: false });

    if (result.error) {
      console.error("Admin vouchers query failed:", result.error);
      loadError = true;
    } else {
      vouchers = (result.data ?? []) as VoucherRow[];
    }
  } catch (error) {
    console.error("Admin vouchers page failed:", error);
    loadError = true;
  }

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
        {loadError ? <p className="p-5 text-sm text-red-700">Data voucher belum dapat dimuat. Periksa konfigurasi Supabase dan jalankan migration voucher jika belum diterapkan.</p> : !vouchers.length ? <p className="p-5 text-sm text-neutral-500">Belum ada voucher.</p> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-stone-50 text-xs text-neutral-500"><tr><th className="p-4">Voucher</th><th className="p-4">Diskon</th><th className="p-4">Minimum</th><th className="p-4">Klaim</th><th className="p-4">Periode</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
            <tbody>{vouchers.map((voucher) => <tr key={voucher.id} className="border-t border-stone-100">
              <td className="p-4"><p className="font-medium">{voucher.name}</p><p className="mt-1 text-xs text-neutral-500">{voucher.code}</p></td>
              <td className="p-4">{voucher.discount_type === "percentage" ? `${voucher.discount_value}%${voucher.max_discount ? ` (maks. ${money(Number(voucher.max_discount))})` : ""}` : money(Number(voucher.discount_value))}</td>
              <td className="p-4">{money(Number(voucher.minimum_subtotal))}</td>
              <td className="p-4 tabular-nums">{voucher.claimed_count} / {voucher.quantity}</td>
              <td className="p-4 text-xs text-neutral-500">{new Date(voucher.starts_at).toLocaleDateString("id-ID")}<br />{voucher.expires_at ? `s/d ${new Date(voucher.expires_at).toLocaleDateString("id-ID")}` : "Tanpa kedaluwarsa"}</td>
              <td className="p-4">{voucher.is_active && voucher.claimed_count < voucher.quantity ? "Aktif" : "Habis / nonaktif"}</td>
              <td className="p-4">
                <div className="flex min-w-[180px] flex-col gap-2">
                  <details className="group">
                    <summary className="cursor-pointer text-xs font-medium underline underline-offset-4">Edit voucher</summary>
                    <form action={updateVoucherAction} className="mt-3 grid min-w-[230px] gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                      <input type="hidden" name="id" value={voucher.id} />
                      <label className="text-xs">Nama<input required name="name" defaultValue={voucher.name} maxLength={120} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2" /></label>
                      <label className="text-xs">Kode<input required name="code" defaultValue={voucher.code} maxLength={40} pattern="[A-Za-z0-9_-]{3,40}" className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2 uppercase" /></label>
                      <label className="text-xs">Jenis diskon<select name="discount_type" defaultValue={voucher.discount_type} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2"><option value="percentage">Persentase (%)</option><option value="fixed">Nominal (Rp)</option></select></label>
                      <label className="text-xs">Nilai diskon<input required name="discount_value" type="number" min="1" step="0.01" defaultValue={voucher.discount_value} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2" /></label>
                      <label className="text-xs">Maksimum diskon<input name="max_discount" type="number" min="1" defaultValue={voucher.max_discount ?? ""} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2" /></label>
                      <label className="text-xs">Minimum belanja<input required name="minimum_subtotal" type="number" min="0" defaultValue={voucher.minimum_subtotal} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2" /></label>
                      <label className="text-xs">Kuota klaim<input required name="quantity" type="number" min="1" max="100000" defaultValue={voucher.quantity} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2" /></label>
                      <label className="text-xs">Mulai<input name="starts_at" type="datetime-local" defaultValue={new Date(voucher.starts_at).toISOString().slice(0,16)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2" /></label>
                      <label className="text-xs">Berakhir<input name="expires_at" type="datetime-local" defaultValue={voucher.expires_at ? new Date(voucher.expires_at).toISOString().slice(0,16) : ""} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2" /></label>
                      <button className="rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white">Simpan perubahan</button>
                    </form>
                  </details>
                  <form action={toggleVoucherAction}>
                    <input type="hidden" name="id" value={voucher.id} />
                    <input type="hidden" name="is_active" value={String(!voucher.is_active)} />
                    <button className="text-left text-xs underline underline-offset-4">{voucher.is_active ? "Nonaktifkan" : "Aktifkan"}</button>
                  </form>
                  {voucher.claimed_count === 0 ? <form action={deleteVoucherAction}>
                    <input type="hidden" name="id" value={voucher.id} />
                    <button className="text-left text-xs text-red-700 underline underline-offset-4">Hapus voucher</button>
                  </form> : <p className="text-[11px] text-neutral-400">Tidak dapat dihapus: sudah diklaim</p>}
                </div>
              </td>
            </tr>)}</tbody>
          </table></div>
        )}
      </section>
    </main>
  );
}
