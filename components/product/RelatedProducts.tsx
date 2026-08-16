import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import ProductCard from "./ProductCard";

import { getProducts } from "@/lib/products";


type RelatedProductsProps = {
  currentSlug: string;
};


export default async function RelatedProducts({
  currentSlug,
}: RelatedProductsProps) {

  const products = await getProducts();


  const currentProduct = products.find(
    (product) =>
      product.slug === currentSlug
  );


  if (!currentProduct) {
    return null;
  }


  const sameCategory = products.filter(
    (product) =>
      product.slug !== currentSlug &&
      product.category === currentProduct.category
  );


  const otherProducts = products.filter(
    (product) =>
      product.slug !== currentSlug &&
      product.category !== currentProduct.category
  );


  const relatedProducts = [
    ...sameCategory,
    ...otherProducts,
  ].slice(0, 4);


  return (
    <section className="py-24">

      <Container>

        <SectionTitle
          eyebrow="You May Also Like"
          title="Related Products"
        />


        <div className="
          mt-16
          grid
          grid-cols-2
          gap-8
          lg:grid-cols-4
        ">

          {relatedProducts.map(
            (product) => (

              <ProductCard
                key={product.id}
                product={product}
              />

            )
          )}

        </div>

      </Container>

    </section>
  );
}