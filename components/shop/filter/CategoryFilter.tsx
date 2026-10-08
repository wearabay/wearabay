"use client";

import { useShop } from "../context/ShopContext";

export default function CategoryFilter() {
  const {
    category,
    setCategory,
    categories,
  } = useShop();

  function toggleCategory(name: string) {
    if (category.includes(name)) {
      setCategory(
        category.filter(
          (item) => item !== name,
        ),
      );
    } else {
      setCategory([
        ...category,
        name,
      ]);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((item) => {
        const active =
          category.includes(item.name);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              toggleCategory(item.name)
            }
            className={`
              rounded-full
              border
              px-5
              py-2
              text-sm
              transition
              ${
                active
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 hover:bg-black hover:text-white"
              }
            `}
          >
            {item.name}
          </button>
        );
      })}
    </div>
  );
}