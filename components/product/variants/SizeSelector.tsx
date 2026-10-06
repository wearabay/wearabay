"use client";

type SizeSelectorProps = {
  sizes: string[];
  selected: string;
  available: Set<string>;
  onChange: (size: string) => void;
};


export default function SizeSelector({
  sizes,
  selected,
  available,
  onChange,
}: SizeSelectorProps) {

  const isSingleSize =
    sizes.length === 1 &&
    sizes[0].toLowerCase() === "all size";


  return (

    <div className="mt-10">

      <p className="mb-5 text-xs uppercase tracking-[0.35em] text-neutral-500">
        Size
      </p>


      {isSingleSize ? (

        <div
          className={`inline-flex rounded-full border px-5 py-2 text-sm ${
            available.has("All Size")
              ? "border-black bg-black text-white"
              : "border-neutral-200 bg-neutral-100 text-neutral-400"
          }`}
        >
          All Size
        </div>

      ) : (

        <div className="flex flex-wrap gap-3">

          {sizes.map(
            (size) => {

              const isAvailable =
                available.has(
                  size
                );

              const isSelected =
                selected === size;


              return (

                <button
                  key={size}
                  type="button"
                  disabled={
                    !isAvailable
                  }
                  onClick={() =>
                    onChange(size)
                  }
                  aria-disabled={
                    !isAvailable
                  }
                  className={`rounded-full border px-5 py-2 text-sm transition-all duration-300 ${
                    !isAvailable
                      ? "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-300"
                      : isSelected
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 hover:border-black"
                  }`}
                >
                  {size}
                </button>

              );

            }
          )}

        </div>

      )}

    </div>

  );

}