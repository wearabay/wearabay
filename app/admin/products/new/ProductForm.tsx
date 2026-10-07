"use client";

import Link from "next/link";
import { useState } from "react";

import type { AdminCategory } from "@/lib/admin-categories";

import { createAdminProductAction } from "../actions";

type Specification = {
  label: string;
  value: string;
};

type ProductStatus = "draft" | "published";

type FulfillmentType =
  | "ready_stock"
  | "pre_order";

type Props = {
  categories: AdminCategory[];
  isSuperAdmin: boolean;
};

export default function ProductForm({
  categories,
  isSuperAdmin,
}: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] =
    useState("");
  const [badge, setBadge] = useState("");
  const [description, setDescription] =
    useState("");

  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>("ready_stock");

  const [preorderReadyDate, setPreorderReadyDate] =
    useState("");

  const [features, setFeatures] = useState(
    ""
  );

  const [specifications, setSpecifications] =
    useState<Specification[]>([
      {
        label: "",
        value: "",
      },
    ]);

  const [sizeGuide, setSizeGuide] =
    useState("");

  const [shippingReturns, setShippingReturns] =
    useState("");

  const [careInstructions, setCareInstructions] =
    useState("");

  const [craftsmanship, setCraftsmanship] =
    useState("");

  const [status, setStatus] = useState<ProductStatus>(
    "draft"
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameChange(
    value: string
  ) {
    setName(value);

    if (!slug) {
      setSlug(generateSlug(value));
    }
  }

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

  function removeSpecification(
    index: number
  ) {
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
        (_, itemIndex) =>
          itemIndex !== index
      );
    });
  }

  function handleFulfillmentChange(
    value: FulfillmentType
  ) {
    if (
      value === "pre_order" &&
      !isSuperAdmin
    ) {
      return;
    }

    setFulfillmentType(value);

    if (value === "ready_stock") {
      setPreorderReadyDate("");
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const trimmedName =
      name.trim();

    const trimmedSlug =
      slug.trim();

    if (!trimmedName) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (!trimmedSlug) {
      setError(
        "Product slug is required."
      );
      return;
    }

    if (!categoryId) {
      setError(
        "Please select a product category."
      );
      return;
    }

    if (
      fulfillmentType === "pre_order" &&
      !preorderReadyDate
    ) {
      setError(
        "Please select the estimated ready-to-ship date for this pre-order product."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanedSpecifications =
        specifications
          .map((item) => ({
            label: item.label.trim(),
            value: item.value.trim(),
          }))
          .filter(
            (item) =>
              item.label !== "" &&
              item.value !== ""
          );

      const cleanedFeatures =
        features
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

      await createAdminProductAction({
        name: trimmedName,

        slug: trimmedSlug,

        categoryId:
          Number(categoryId),

        badge:
          badge.trim() || null,

        description:
          description.trim(),

        features:
          cleanedFeatures,

        specifications:
          cleanedSpecifications,

        sizeGuide:
          sizeGuide.trim(),

        shippingReturns:
          shippingReturns.trim(),

        careInstructions:
          careInstructions.trim(),

        craftsmanship:
          craftsmanship.trim(),

        status,

        fulfillmentType,

        preorderReadyDate:
          fulfillmentType ===
          "pre_order"
            ? preorderReadyDate
            : null,
      });
    } catch (error) {
      setIsSubmitting(false);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create product."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Basic Information */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-base font-medium">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Main information displayed on the
            product page.
          </p>
        </div>

        <div className="space-y-5">
          {/* Name */}

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
                handleNameChange(
                  event.target.value
                )
              }
              placeholder="Luna Abaya"
              className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
              required
            />
          </div>

          {/* Slug */}

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
                setSlug(
                  event.target.value
                )
              }
              placeholder="luna-abaya"
              className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
              required
            />

            <p className="mt-2 text-xs text-neutral-400">
              Used in the product URL.
            </p>
          </div>

          {/* Category + Badge */}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium"
              >
                Category
              </label>

              <select
                id="category"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-neutral-400"
                required
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>

              <Link
                href="/admin/categories/new"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex text-xs font-medium text-neutral-500 transition hover:text-black"
              >
                + Add Category ↗
              </Link>
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
                  setBadge(
                    event.target.value
                  )
                }
                placeholder="NEW"
                className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
              />
            </div>
          </div>

          {/* Description */}

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
                setDescription(
                  event.target.value
                )
              }
              rows={6}
              placeholder="Describe the product..."
              className="w-full resize-y rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
            />
          </div>
        </div>
      </section>

      {/* Fulfillment */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-base font-medium">
            Fulfillment
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
            Choose how this product will be fulfilled. Pre-order products
            can be purchased and paid for before the estimated ready date.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="fulfillmentType"
              className="mb-2 block text-sm font-medium"
            >
              Fulfillment Method
            </label>

            <select
              id="fulfillmentType"
              value={fulfillmentType}
              onChange={(event) =>
                handleFulfillmentChange(
                  event.target
                    .value as FulfillmentType
                )
              }
              className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-neutral-400 sm:max-w-md"
            >
              <option value="ready_stock">
                Ready to Ship
              </option>

              {isSuperAdmin && (
                <option value="pre_order">
                  Pre-Order
                </option>
              )}
            </select>

            {!isSuperAdmin && (
              <p className="mt-2 text-xs text-neutral-400">
                Pre-order settings can only be managed by a Super Admin.
              </p>
            )}
          </div>

          {fulfillmentType ===
            "pre_order" && (
            <div className="max-w-md">
              <label
                htmlFor="preorderReadyDate"
                className="mb-2 block text-sm font-medium"
              >
                Estimated Ready-to-Ship Date
              </label>

              <input
                id="preorderReadyDate"
                type="date"
                value={
                  preorderReadyDate
                }
                onChange={(event) =>
                  setPreorderReadyDate(
                    event.target.value
                  )
                }
                min={
                  new Date()
                    .toISOString()
                    .slice(0, 10)
                }
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-neutral-400"
                required
              />

              <p className="mt-2 text-xs leading-5 text-neutral-400">
                Customers can purchase and pay for this product before
                the ready-to-ship date.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-base font-medium">
            Features
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Enter one feature per line.
          </p>
        </div>

        <textarea
          value={features}
          onChange={(event) =>
            setFeatures(
              event.target.value
            )
          }
          rows={5}
          placeholder={
            "Premium Fabric\nHandmade Finishing\nWorldwide Shipping"
          }
          className="w-full resize-y rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
        />
      </section>

      {/* Specifications */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-medium">
              Specifications
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Add product specifications such as
              material, care, or color.
            </p>
          </div>

          <button
            type="button"
            onClick={addSpecification}
            className="shrink-0 rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium transition hover:border-neutral-400"
          >
            + Add
          </button>
        </div>

        <div className="space-y-3">
          {specifications.map(
            (specification, index) => (
              <div
                key={index}
                className="grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]"
              >
                <input
                  type="text"
                  value={
                    specification.label
                  }
                  onChange={(event) =>
                    updateSpecification(
                      index,
                      "label",
                      event.target.value
                    )
                  }
                  placeholder="Material"
                  className="h-11 rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
                />

                <input
                  type="text"
                  value={
                    specification.value
                  }
                  onChange={(event) =>
                    updateSpecification(
                      index,
                      "value",
                      event.target.value
                    )
                  }
                  placeholder="Premium Nidha"
                  className="h-11 rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeSpecification(
                      index
                    )
                  }
                  className="h-11 rounded-xl border border-neutral-200 px-4 text-xs font-medium text-neutral-500 transition hover:border-neutral-400 hover:text-black"
                >
                  Remove
                </button>
              </div>
            )
          )}
        </div>
      </section>

      {/* Product Detail Content */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-base font-medium">
            Product Detail Content
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Content displayed in the product detail
            accordion. Leave a section empty if it does
            not apply to this product.
          </p>
        </div>

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
                setSizeGuide(
                  event.target.value
                )
              }
              rows={5}
              placeholder="Available in All Size. Please contact us for detailed measurements."
              className="w-full resize-y rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
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
              className="w-full resize-y rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
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
              className="w-full resize-y rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
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
              className="w-full resize-y rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
            />
          </div>
        </div>
      </section>

      {/* Status */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-base font-medium">
            Publishing
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            New products should normally remain
            draft until variants and media are ready.
          </p>
        </div>

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
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-neutral-400 sm:max-w-xs"
          >
            <option value="draft">
              Draft
            </option>

            <option value="published">
              Published
            </option>
          </select>
        </div>
      </section>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {error}
        </div>
      )}

      {/* Actions */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/products"
          className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 px-6 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-black"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Creating..."
            : "Create Product"}
        </button>
      </div>
    </form>
  );
}