export default function Loading() {
  return (
    <main
      className="flex min-h-[70vh] items-center justify-center bg-white px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />

        <p className="mt-5 text-[11px] uppercase tracking-[0.3em] text-neutral-500">
          Loading
        </p>
      </div>
    </main>
  );
}