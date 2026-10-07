import { redirect } from "next/navigation";

import {
  getAdminUser,
  getSuperAdminUser,
} from "@/lib/admin";
import { getAdminCategories } from "@/lib/admin-categories";

import ProductForm from "./ProductForm";

export default async function NewProductPage() {
  const user = await getAdminUser();

  if (!user) {
    redirect("/login");
  }

  const superAdmin =
    await getSuperAdminUser();

  const categories =
    await getAdminCategories();

  const activeCategories =
    categories.filter(
      (category) =>
        category.isActive
    );

  return (
    <ProductForm
      categories={activeCategories}
      isSuperAdmin={Boolean(superAdmin)}
    />
  );
}