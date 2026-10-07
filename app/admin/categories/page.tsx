import Link from "next/link";

import {
  getAdminCategories,
} from "@/lib/admin-categories";

import {
  getAdminUser,
  isSuperAdminRole,
} from "@/lib/admin";

import CategoryActions from "./CategoryActions";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(new Date(value));
}

export default async function AdminCategoriesPage() {
  const admin = await getAdminUser();

  if (!admin) {
    return null;
  }

  const categories =
    await getAdminCategories();

  const canManage =
    isSuperAdminRole(admin.role);

  const activeCount =
    categories.filter(
      (category) =>
        category.isActive,
    ).length;

  const assignedProductCount =
    categories.reduce(
      (total, category) =>
        total + category.productCount,
      0,
    );

  return (
    <div className="space-y-8">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            Catalog
          </p>

          <h1 className="mt-2 text-3xl font-light tracking-tight">
            Categories
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Manage the product categories used
            across the Wearabay storefront.
          </p>
        </div>

        {canManage && (
          <Link
            href="/admin/categories/new"
            className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Add Category
          </Link>
        )}
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Total Categories
          </p>

          <p className="mt-2 text-3xl font-light">
            {categories.length}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Active
          </p>

          <p className="mt-2 text-3xl font-light">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Products Assigned
          </p>

          <p className="mt-2 text-3xl font-light">
            {assignedProductCount}
          </p>
        </div>
      </div>

      {/* =================================================
          CATEGORY DIRECTORY
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="border-b border-stone-300 bg-stone-50/70 px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-medium">
                Category Directory
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Categories are shared by product
                entry, storefront filters, and
                collections.
              </p>
            </div>

            {!canManage && (
              <span className="hidden rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs text-neutral-500 sm:inline-flex">
                View Only
              </span>
            )}
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium">
              No categories yet
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Create your first category to start
              organizing products.
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP
            ================================================= */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-stone-300 bg-stone-50 text-left text-xs uppercase tracking-wider text-neutral-500">
                    <th className="px-6 py-4 font-medium">
                      Category
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Products
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Updated
                    </th>

                    <th className="px-6 py-4 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map(
                    (category) => (
                      <tr
                        key={category.id}
                        className="border-b border-stone-200 transition last:border-b-0 hover:bg-stone-50/70"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-300 bg-stone-50">
                              {category.coverImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={
                                    category.coverImage
                                  }
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                                  No Image
                                </span>
                              )}
                            </div>

                            <div>
                              <p className="font-medium">
                                {category.name}
                              </p>

                              <p className="mt-1 text-xs text-neutral-500">
                                /{category.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="font-medium">
                            {category.productCount}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={
                              category.isActive
                                ? "inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700"
                                : "inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500"
                            }
                          >
                            {category.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-neutral-500">
                          {formatDate(
                            category.updatedAt,
                          )}
                        </td>

                        <td className="px-6 py-5 text-right">
                          {canManage ? (
                            <CategoryActions
                              category={category}
                            />
                          ) : (
                            <span className="text-xs text-neutral-400">
                              View Only
                            </span>
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE
            ================================================= */}

            <div className="space-y-3 bg-stone-50/50 p-3 md:hidden">
              {categories.map(
                (category) => (
                  <article
                    key={category.id}
                    className="overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-300 bg-stone-50">
                          {category.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={
                                category.coverImage
                              }
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                              No Image
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">
                                {category.name}
                              </p>

                              <p className="mt-1 text-xs text-neutral-500">
                                /{category.slug}
                              </p>
                            </div>

                            <span
                              className={
                                category.isActive
                                  ? "shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700"
                                  : "shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500"
                              }
                            >
                              {category.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-stone-200 bg-stone-50/60 px-5 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                            Products
                          </p>

                          <p className="mt-1 font-medium">
                            {category.productCount}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                            Updated
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {formatDate(
                              category.updatedAt,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {canManage && (
                      <div className="border-t border-stone-200 px-5 py-4">
                        <CategoryActions
                          category={category}
                          mobile
                        />
                      </div>
                    )}
                  </article>
                ),
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}