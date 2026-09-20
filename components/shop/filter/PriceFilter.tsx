"use client";

export default function PriceFilter() {
  return (
    <div className="space-y-4">
      <input
        type="range"
        min={500000}
        max={1500000}
        step={50000}
        className="w-full accent-black"
      />

      <div className="flex justify-between text-sm text-neutral-500">
        <span>Rp500K</span>
        <span>Rp1.5M</span>
      </div>
    </div>
  );
}