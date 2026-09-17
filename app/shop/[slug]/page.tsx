import { notFound } from "next/navigation";

import ReviewList from "@/components/product/reviews/ReviewList";

import { getProducts } from "@/lib/products";
import { getProductReviews } from "@/lib/reviews";

import Container from "@/components/ui/Container";

import ProductGallery from "@/components/product/gallery/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductDetails from "@/components/product/ProductDetails";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductTracker from "@/components/product/ProductTracker";
import RecentlyViewed from "@/components/cart/RecentlyViewed";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetail({
  params,
}: Props) {
  const { slug } = await params;

  const products = await getProducts();

  const product = products.find(
    (item) => item.slug === slug
  );

  if (!product) {
    notFound();
  }

  const reviews = await getProductReviews(product.id);

  return (
    <>
      <ProductTracker
        slug={product.slug}
      />

      <main className="py-24">
        <Container>
          <div className="grid items-start gap-16 lg:grid-cols-2">
            <ProductGallery
              images={product.images}
              name={product.name}
            />

            <div className="self-start">
              <div className="sticky top-28">
                <ProductInfo
                  product={product}
                />
              </div>
            </div>
          </div>

          {/* Product Details */}

          <div className="mt-2 grid gap-16 lg:grid-cols-2">
            <div />

            <div>
              <ProductDetails
                product={product}
              />

              <ReviewList
                productId={product.id}
                reviews={reviews}
              />
            </div>
          </div>

          {/* Recently Viewed */}

          <RecentlyViewed
            products={products}
            currentSlug={product.slug}
          />

          {/* Related Products */}

          <RelatedProducts
            currentSlug={product.slug}
          />
        </Container>
      </main>
    </>
  );
}