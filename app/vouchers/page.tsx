import Link from "next/link";
import VoucherListClient from "./VoucherListClient";

export const dynamic = "force-dynamic";

export default function VouchersPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-20 sm:px-8">
      <Link href="/" className="text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900">← Wearabay</Link>
      <header className="mt-10 max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Member benefits</p>
        <h1 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">Voucher untuk kamu</h1>
        <p className="mt-4 text-sm leading-6 text-neutral-500">Klaim voucher yang tersedia, lalu pilih saat checkout. Setiap voucher hanya bisa diklaim dan digunakan satu kali per akun.</p>
      </header>
      <VoucherListClient />
    </main>
  );
}
