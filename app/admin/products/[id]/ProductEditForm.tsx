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

type ProductStatus =
  | "draft"
  | "published"
  | "archived";

export default function ProductEditForm({
  product,
}: Props) {
  const [name, setName] =
    useState(product.name);

  const [slug, setSlug] =
    useState(product.slug);

  const [category, setCategory] =
    useState(product.category);

  const [badge, setBadge] =
    useState(product.badge ?? "");

  const [description, setDescription] =
    useState(product.description);

  const [features, setFeatures] =
    useState(
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

  const [status, setStatus] =
    useState<ProductStatus>(
      product.status
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

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

    setIsSubmitting(true);

    try {
      const cleanedFeatures =
        features
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

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

      await updateAdminProductAction(
        product.id,
        {
          name: trimmedName,
          slug: trimmedSlug,
          category: category.trim(),
          badge:
            badge.trim() || null,
          description:
            description.trim(),
          features:
            cleanedFeatures,
          specifications:
            cleanedSpecifications,
          status,
        }
      );

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
                setName(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
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
                setSlug(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
              required
            />

            <p className="mt-2 text-xs text-neutral-400">
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
                  setCategory(
                    event.target.value
                  )
                }
                placeholder="Abaya"
                className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
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
                  setBadge(
                    event.target.value
                  )
                }
                placeholder="NEW"
                className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
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
                setDescription(
                  event.target.value
                )
              }
              rows={6}
              className="w-full resize-y rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
            />
          </div>
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
              Add product specifications.
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

      {/* Publishing */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-base font-medium">
            Publishing
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Control whether this product is visible
            on the storefront.
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

            <option value="archived">
              Archived
            </option>
          </select>
        </div>
      </section>

      {/* Product Resources */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-base font-medium">
          Product Resources
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Variants and media will be managed separately.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/admin/products/${product.id}/variants`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-neutral-200 px-5 text-xs font-medium transition hover:border-neutral-400"
          >
            Manage Variants
          </Link>

          <Link
            href={`/admin/products/${product.id}/media`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-neutral-200 px-5 text-xs font-medium transition hover:border-neutral-400"
          >
            Manage Media
          </Link>
        </div>
      </section>

      {/* Feedback */}

      {error && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {error}
        </div>
      )}

      {success && !error && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          Product updated successfully.
        </div>
      )}

      {/* Actions */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/products"
          className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 px-6 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-black"
        >
          Back to Products
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}