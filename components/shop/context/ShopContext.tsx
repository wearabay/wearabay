"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import type { StorefrontCategory } from "@/lib/categories";

type ShopContextType = {
  search: string;
  setSearch: (value: string) => void;

  sort: string;
  setSort: (value: string) => void;

  category: string[];
  setCategory: (value: string[]) => void;

  categories: StorefrontCategory[];

  colors: string[];
  setColors: (value: string[]) => void;

  sizes: string[];
  setSizes: (value: string[]) => void;

  clearFilters: () => void;
};

const ShopContext =
  createContext<ShopContextType | null>(null);

type ShopProviderProps = {
  children: ReactNode;
  categories?: StorefrontCategory[];
  initialCategory?: string[];
};

export function ShopProvider({
  children,
  categories = [],
  initialCategory = [],
}: ShopProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const [category, setCategoryState] =
    useState<string[]>(initialCategory);

  const [colors, setColors] = useState<string[]>(
    [],
  );

  const [sizes, setSizes] = useState<string[]>(
    [],
  );

  function setCategory(value: string[]) {
    setCategoryState(value);

    const params = new URLSearchParams(
      window.location.search,
    );

    if (value.length === 0) {
      params.delete("category");
    } else {
      const slugs = value
        .map((name) =>
          categories.find(
            (categoryItem) =>
              categoryItem.name === name,
          )?.slug,
        )
        .filter(
          (slug): slug is string =>
            Boolean(slug),
        );

      if (slugs.length > 0) {
        params.set(
          "category",
          slugs.join(","),
        );
      } else {
        params.delete("category");
      }
    }

    const query = params.toString();

    router.replace(
      query
        ? `${pathname}?${query}`
        : pathname,
      {
        scroll: false,
      },
    );
  }

  function clearFilters() {
    setCategoryState([]);
    setColors([]);
    setSizes([]);

    const params = new URLSearchParams(
      window.location.search,
    );

    params.delete("category");

    const query = params.toString();

    router.replace(
      query
        ? `${pathname}?${query}`
        : pathname,
      {
        scroll: false,
      },
    );
  }

  return (
    <ShopContext.Provider
      value={{
        search,
        setSearch,

        sort,
        setSort,

        category,
        setCategory,

        categories,

        colors,
        setColors,

        sizes,
        setSizes,

        clearFilters,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error(
      "useShop must be used inside ShopProvider",
    );
  }

  return context;
}