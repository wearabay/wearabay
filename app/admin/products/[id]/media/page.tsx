import { notFound, redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { getAdminProductById } from "@/lib/admin-products";
import { getAdminProductMedia } from "@/lib/admin-media";

import MediaPageClient from "./MediaPageClient";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductMediaPage({
  params,
}: Props) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login");
  }

  const { id } = await params;
  const productId = Number(id);

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    notFound();
  }

  const product =
    await getAdminProductById(productId);

  if (!product) {
    notFound();
  }

  const {
    media,
    variants,
  } =
    await getAdminProductMedia(
      productId
    );

  return (
    <MediaPageClient
      product={{
        id: product.id,
        name: product.name,
      }}
      media={media}
      variants={variants}
    />
  );
}