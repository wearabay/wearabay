import Link from "next/link";

export const dynamic = "force-dynamic";

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
  starts_at: string;
  expires_at: string | null;
};

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

export default async function VouchersPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vouchers: Voucher[] = [];
  // The client fetches the public list so the claim button can update without navigation.
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-20 sm:px-8">
      <Link href="/" className="text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900">← Wearabay</Link>
      <header className="mt-10 max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Member benefits</p>
        <h1 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">Voucher untuk kamu</h1>
        <p className="mt-4 text-sm leading-6 text-neutral-500">Klaim voucher yang tersedia, lalu pilih saat checkout. Setiap voucher hanya bisa diklaim dan digunakan satu kali per akun.</p>
      </header>
      <VoucherList />
    </main>
  );
}

function VoucherList() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:col-span-2 lg:col-span-3">
        <p className="text-sm text-neutral-500">Voucher tersedia dimuat langsung dari toko.</p>
        <VoucherListClient />
      </div>
    </div>
  );
}

function VoucherListClient() {
  return (
    <div data-voucher-list="true">
      <p className="mt-3 text-sm text-neutral-500">Aktifkan JavaScript untuk melihat dan mengklaim voucher.</p>
    </div>
  );
}
