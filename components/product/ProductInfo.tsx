"use client";

import {
  useState,
  useRef,
  useEffect,
} from "react";

import StickyAddToBag from "./StickyAddToBag";

import type { Product } from "@/types/product";

import { formatPrice } from "@/lib/currency";

import Badge from "@/components/ui/Badge";
import Divider from "@/components/ui/Divider";

import ProductVariant from "./variants/ProductVariant";

import {
  useCart
} from "@/context/CartContext";



type ProductInfoProps = {
  product: Product;
};



export default function ProductInfo({
  product,
}: ProductInfoProps) {


  const {
    addItem
  } = useCart();




  const [selectedColor, setSelectedColor] =
    useState(
      product.colors?.[0] ?? ""
    );



  const addToBagRef =
    useRef<HTMLButtonElement>(null);



  const [showSticky, setShowSticky] =
    useState(false);




  const [selectedSize, setSelectedSize] =
    useState(
      product.sizes?.[0] ?? ""
    );



  const [quantity, setQuantity] =
    useState(1);





  const increaseQuantity = () => {

    if(
      quantity <
      (product.stock ?? 99)
    ){

      setQuantity(
        prev => prev + 1
      );

    }

  };





  const decreaseQuantity = () => {

    if(quantity > 1){

      setQuantity(
        prev => prev - 1
      );

    }

  };





  const handleAddToCart = () => {


    addItem({

      id: product.id,

      name: product.name,

      price: product.price,

      image: product.image,

      quantity,

      color: selectedColor,

      size: selectedSize,

    });



    window.dispatchEvent(
      new Event("cart-open")
    );


  };







  useEffect(()=>{


    if(!addToBagRef.current)
      return;



    const observer =
      new IntersectionObserver(

        ([entry])=>{

          setShowSticky(
            !entry.isIntersecting
          );

        },

        {
          threshold:0.1,
        }

      );



    observer.observe(
      addToBagRef.current
    );



    return ()=>{

      observer.disconnect();

    };


  },[]);







  return (

    <div>


      {/* Category */}

      <p className="
        text-sm
        uppercase
        tracking-[0.3em]
        text-gray-500
      ">

        {product.category}

      </p>





      {/* Badge */}

      {product.badge && (

        <div className="mt-4">

          <Badge>

            {product.badge}

          </Badge>

        </div>

      )}







      {/* Title */}

      <h1 className="
        mt-4
        text-5xl
        font-light
      ">

        {product.name}

      </h1>







      {/* Price */}

      <p className="
        mt-6
        text-2xl
      ">

        {formatPrice(product.price)}

      </p>






      <Divider className="my-10" />







      {/* Description */}

      <p className="
        leading-8
        text-gray-600
      ">

        {product.description}

      </p>







      {/* Features */}

      <div className="
        mt-10
        space-y-3
        text-sm
        text-neutral-600
      ">

        {product.features.map(
          (feature)=>(
            <p key={feature}>
              ✓ {feature}
            </p>
          )
        )}

      </div>







      {/* Variant */}

      <ProductVariant


        addToBagRef={addToBagRef}


        product={product}


        selectedColor={selectedColor}


        onColorChange={setSelectedColor}


        selectedSize={selectedSize}


        onSizeChange={setSelectedSize}


        quantity={quantity}


        onIncrease={increaseQuantity}


        onDecrease={decreaseQuantity}


        onAddToCart={handleAddToCart}


      />







      {/* Sticky Add To Bag */}

      <StickyAddToBag

        visible={showSticky}


        name={product.name}


        price={product.price}


        onAddToCart={handleAddToCart}


      />



    </div>

  );

}