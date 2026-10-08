"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getQuickViewProduct,
  closeQuickView,
} from "@/lib/quick-view";

import type { Product } from "@/types/product";

import QuickViewGallery from "./QuickViewGallery";
import QuickViewInfo from "./QuickViewInfo";
import QuickViewActions from "./QuickViewActions";

import { X } from "lucide-react";

export default function QuickViewModal() {
  const [open, setOpen] =
    useState(false);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [
    selectedColor,
    setSelectedColor,
  ] = useState("");

  useEffect(() => {
    const handler = () => {
      const item =
        getQuickViewProduct();

      if (!item) {
        return;
      }

      setProduct(item);

      setSelectedColor(
        item.colors?.[0] ?? "",
      );

      setOpen(true);
    };

    window.addEventListener(
      "quick-view-open",
      handler,
    );

    return () =>
      window.removeEventListener(
        "quick-view-open",
        handler,
      );
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      open ? "hidden" : "";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [open]);

  if (!open || !product) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        overflow-y-auto
        bg-black/20
        backdrop-blur-[2px]
        lg:flex
        lg:items-center
        lg:justify-center
      "
      onClick={() => {
        closeQuickView();
        setOpen(false);
      }}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className="
          mx-auto
          min-h-screen
          w-full
          bg-white
          lg:my-8
          lg:min-h-0
          lg:max-w-6xl
          lg:overflow-hidden
          lg:rounded-3xl
          lg:shadow-2xl
          lg:grid
          lg:grid-cols-2
        "
      >
        {/* LEFT */}

        <div className="p-5 lg:p-8">
          <QuickViewGallery
            key={`${product.id}-${selectedColor}`}
            product={product}
            selectedColor={
              selectedColor
            }
          />
        </div>

        {/* RIGHT */}

        <div
          className="
            relative
            p-5
            lg:max-h-[90vh]
            lg:overflow-y-auto
            lg:p-10
          "
        >
          <button
            type="button"
            aria-label="Close quick view"
            onClick={() => {
              closeQuickView();
              setOpen(false);
            }}
            className="
              absolute
              right-5
              top-[max(1rem,env(safe-area-inset-top))]
              rounded-full
              p-2
              text-neutral-900
              transition
              hover:bg-stone-100
            "
          >
            <X size={22} />
          </button>

          <QuickViewInfo
            product={product}
          />

          <QuickViewActions
            product={product}
            selectedColor={
              selectedColor
            }
            onColorChange={
              setSelectedColor
            }
          />
        </div>
      </div>
    </div>
  );
}