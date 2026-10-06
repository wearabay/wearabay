"use client";

const COLOR_MAP: Record<string, string> = {
  Black: "#111111",
  Mocha: "#8B6F4E",
  Olive: "#6B705C",
  Ivory: "#F5F1E8",
  Beige: "#D9C6A5",
  Brown: "#7A5230",
  White: "#FFFFFF",
  Cream: "#F7F3E9",
  Navy: "#1E3A5F",
  Sage: "#9CAF88",
  "Dusty Rose": "#C98F94",
  "Soft Pink": "#F4D7D7",
};


type ColorSelectorProps = {
  colors: string[];
  selected: string;
  available: Set<string>;
  onChange: (color: string) => void;
};


export default function ColorSelector({
  colors,
  selected,
  available,
  onChange,
}: ColorSelectorProps) {

  return (

    <div className="mt-10">

      <p className="mb-5 text-xs uppercase tracking-[0.35em] text-neutral-500">
        Color
      </p>


      <div className="space-y-4">

        {colors.map(
          (color) => {

            const hex =
              COLOR_MAP[color] ??
              "#999999";

            const isAvailable =
              available.has(
                color
              );

            const isSelected =
              selected === color;


            return (

              <button
                key={color}
                type="button"
                disabled={
                  !isAvailable
                }
                onClick={() =>
                  onChange(color)
                }
                aria-disabled={
                  !isAvailable
                }
                className={`flex items-center gap-4 transition ${
                  !isAvailable
                    ? "cursor-not-allowed opacity-35"
                    : "cursor-pointer"
                }`}
              >

                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                    isSelected &&
                    isAvailable
                      ? "ring-2 ring-black ring-offset-2"
                      : ""
                  }`}
                >

                  <span
                    className="h-5 w-5 rounded-full border border-neutral-300"
                    style={{
                      backgroundColor:
                        hex,
                    }}
                  />

                </span>


                <span
                  className={`transition ${
                    isSelected &&
                    isAvailable
                      ? "font-medium text-black"
                      : "text-neutral-500"
                  }`}
                >
                  {color}
                </span>

              </button>

            );

          }
        )}

      </div>

    </div>

  );

}