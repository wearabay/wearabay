export interface Product {
  id: number;

  slug: string;
  name: string;

  price: number;

  image: string;
  images: string[];

  category: string;
  badge?: string;

  features: string[];

  description: string;

  specifications: {
    label: string;
    value: string;
  }[];

  sizeGuide: string;
  shippingReturns: string;
  careInstructions: string;
  craftsmanship: string;

  colors: string[];
  sizes: string[];

  stock: number;
}