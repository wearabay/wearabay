"use client";

import Link from "next/link";
import { useState } from "react";

import type { AdminProduct } from "@/lib/admin-products";

import { updateAdminProductAction } from "../actions";

type Props = {
  product: AdminProduct;
};

type Specification = {
  label: string;
  value: string;
};

type ProductStatus = "draft" | "published" | "archived";

const inputClass =
  "h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-neutral-500";

const textareaClass =
  "w-full resize-y rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-neutral-500";

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-medium text-neutral-900">{title}</h2>

      <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
        {description}
      </p>
    </div>
  );
}

export default function ProductEditForm({
  product,
}: Props) {
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [category, setCategory] = useState(product.category);
  const [badge, setBadge] = useState(product.badge ?? "");
  const [description, setDescription] = useState(product.description);

  const [features, setFeatures] = useState(
    product.features.join("\n")
  );

  const [specifications, setSpecifications] =
    useState<Specification[]>(
      product.specifications.length > 0
        ? product.specifications
        : [
            {
              label: "",
              value: "",
            },
          ]
    );

  const [sizeGuide, setSizeGuide] = useState(product.sizeGuide);
  const [shippingReturns, setShippingReturns] = useState(
    product.shippingReturns
  );
  const [careInstructions, setCareInstructions] = useState(
    product.careInstructions
  );
  const [craftsmanship, setCraftsmanship] = useState(
    product.craftsmanship
  );

  const [status, setStatus] = useState<ProductStatus>(
    product.status
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function updateSpecification(
    index: number,
    field: keyof Specification,
    value: string
  ) {
    setSpecifications((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addSpecification() {
    setSpecifications((current) => [
      ...current,
      {
        label: "",
        value: "",
      },
    ]);
  }

  function removeSpecification(index: number) {
    setSpecifications((current) => {
      if (current.length === 1) {
        return [
          {
            label: "",
            value: "",
          },
        ];
      }

      return current.filter(
        (_, itemIndex) => itemIndex !== index
      );
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

    if (!trimmedName) {
      setError("Product name is required.");
      return;
    }

    if (!trimmedSlug) {
      setError("Product slug is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanedFeatures = features
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const cleanedSpecifications = specifications
        .map((item) => ({
          label: item.label.trim(),
          value: item.value.trim(),
        }))
        .filter(
          (item) =>
            item.label !== "" &&
            item.value !== ""
        );

      await updateAdminProductAction(product.id, {
        name: trimmedName,
        slug: trimmedSlug,
        category: category.trim(),
        badge: badge.trim() || null,
        description: description.trim(),
        features: cleanedFeatures,
        specifications: cleanedSpecifications,
        sizeGuide: sizeGuide.trim(),
        shippingReturns: shippingReturns.trim(),
        careInstructions: careInstructions.trim(),
        craftsmanship: craftsmanship.trim(),
        status,
      });

      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update product."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Basic Information */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <SectionHeader
          title="Basic Information"
          description="Main information displayed on the storefront product page."
        />

        <div className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium"
            >
              Product Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              className={inputClass}
              required
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-medium"
            >
              Slug
            </label>

            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(event.target.value)
              }
              className={inputClass}
              required
            />

            <p className="mt-2 break-all text-xs text-neutral-400">
              Product URL: /shop/{slug}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium"
              >
                Category
              </label>

              <input
                id="category"
                type="text"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                placeholder="Abaya"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="badge"
                className="mb-2 block text-sm font-medium"
              >
                Badge
              </label>

              <input
                id="badge"
                type="text"
                value={badge}
                onChange={(event) =>
                  setBadge(event.target.value)
                }
                placeholder="NEW"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={7}
              className={textareaClass}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <SectionHeader
          title="Features"
          description="Enter one product feature per line."
        />

        <textarea
          value={features}
          onChange={(event) =>
            setFeatures(event.target.value)
          }
          rows={6}
          placeholder={
            "Premium Fabric\nHandmade Finishing\nWorldwide Shipping"
          }
          className={textareaClass}
        />
      </section>

      {/* Specifications */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeader
            title="Specifications"
            description="Add structured product specifications such as material, color, or dimensions."
          />

          <button
            type="button"
            onClick={addSpecification}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-stone-200 px-4 text-xs font-medium transition hover:border-neutral-400"
          >
            + Add Specification
          </button>
        </div>

        <div className="space-y-3">
          {specifications.map(
            (specification, index) => (
              <div
                key={index}
                className="rounded-xl border border-stone-100 bg-stone-50/50 p-3 sm:border-0 sm:bg-transparent sm:p-0"
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]">
                  <input
                    type="text"
                    value={specification.label}
                    onChange={(event) =>
                      updateSpecification(
                        index,
                        "label",
                        event.target.value
                      )
                    }
                    placeholder="Material"
                    aria-label={`Specification ${index + 1} label`}
                    className={inputClass}
                  />

                  <input
                    type="text"
                    value={specification.value}
                    onChange={(event) =>
                      updateSpecification(
                        index,
                        "value",
                        event.target.value
                      )
                    }
                    placeholder="Premium Nidha"
                    aria-label={`Specification ${index + 1} value`}
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeSpecification(index)
                    }
                    className="h-11 rounded-xl border border-stone-200 px-4 text-xs font-medium text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-900"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Product Detail Content */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <SectionHeader
          title="Product Detail Content"
          description="Content displayed inside the product detail sections. Leave a section empty when it does not apply."
        />

        <div className="space-y-5">
          <div>
            <label
              htmlFor="sizeGuide"
              className="mb-2 block text-sm font-medium"
            >
              Size Guide
            </label>

            <textarea
              id="sizeGuide"
              value={sizeGuide}
              onChange={(event) =>
                setSizeGuide(event.target.value)
              }
              rows={5}
              placeholder="Available in All Size. Please contact us for detailed measurements."
              className={textareaClass}
            />
          </div>

          <div>
            <label
              htmlFor="shippingReturns"
              className="mb-2 block text-sm font-medium"
            >
              Shipping & Returns
            </label>

            <textarea
              id="shippingReturns"
              value={shippingReturns}
              onChange={(event) =>
                setShippingReturns(
                  event.target.value
                )
              }
              rows={6}
              placeholder={
                "Worldwide shipping available.\nProcessing time: 1–3 business days.\nEstimated delivery: Indonesia 2–5 days, International 5–10 days.\nEasy 7-day return policy."
              }
              className={textareaClass}
            />
          </div>

          <div>
            <label
              htmlFor="careInstructions"
              className="mb-2 block text-sm font-medium"
            >
              Care Instructions
            </label>

            <textarea
              id="careInstructions"
              value={careInstructions}
              onChange={(event) =>
                setCareInstructions(
                  event.target.value
                )
              }
              rows={5}
              placeholder={
                "Dry clean recommended.\nSteam only.\nDo not bleach.\nStore on padded hanger."
              }
              className={textareaClass}
            />
          </div>

          <div>
            <label
              htmlFor="craftsmanship"
              className="mb-2 block text-sm font-medium"
            >
              Craftsmanship
            </label>

            <textarea
              id="craftsmanship"
              value={craftsmanship}
              onChange={(event) =>
                setCraftsmanship(
                  event.target.value
                )
              }
              rows={5}
              placeholder="Describe the craftsmanship, finishing techniques, or production details of this product."
              className={textareaClass}
            />
          </div>
        </div>
      </section>

      {/* Publishing */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <SectionHeader
          title="Publishing"
          description="Control whether this product is visible on the storefront."
        />

        <div className="grid gap-5 sm:grid-cols-[minmax(0,240px)_1fr] sm:items-start">
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as ProductStatus
                )
              }
              className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-neutral-500"
            >
              <option value="draft">Draft</option>
              <option value="published">
                Published
              </option>
              <option value="archived">
                Archived
              </option>
            </select>
          </div>

          <div className="rounded-xl bg-stone-50 px-4 py-3 text-xs leading-5 text-neutral-500">
            Draft products can be prepared before publishing. Archived
            products remain in the admin workspace but are no longer
            treated as published storefront content.
          </div>
        </div>
      </section>

      {/* Product Resources */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <SectionHeader
          title="Product Resources"
          description="Variants and media are managed separately from the main product information."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={`/admin/products/${product.id}/variants`}
            className="group rounded-2xl border border-stone-200 p-4 transition hover:border-neutral-400"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  Manage Variants
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  {product.variantCount}{" "}
                  {product.variantCount === 1
                    ? "variant"
                    : "variants"}
                </p>
              </div>

              <span className="text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-neutral-900">
                →
              </span>
            </div>
          </Link>

          <Link
            href={`/admin/products/${product.id}/media`}
            className="group rounded-2xl border border-stone-200 p-4 transition hover:border-neutral-400"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  Manage Media
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  {product.mediaCount}{" "}
                  {product.mediaCount === 1
                    ? "media item"
                    : "media items"}
                </p>
              </div>

              <span className="text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-neutral-900">
                →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-neutral-700"
        >
          {error}
        </div>
      )}

      {success && !error && (
        <div
          role="status"
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-neutral-700"
        >
          Product updated successfully.
        </div>
      )}

      {/* Actions */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-stone-200 bg-[#FAF9F7]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-2">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/admin/products"
            className="inline-flex h-11 items-center justify-center rounded-full border border-stone-200 bg-white px-6 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
          >
            Back to Products
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-900 px-6 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}