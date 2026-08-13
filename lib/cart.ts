export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
};



function getCartKey(
  userId?: string
) {

  if (userId) {

    return `wearing-abaya-user-${userId}-cart`;

  }


  return "wearing-abaya-guest-cart";

}





export function getCart(
  userId?: string
): CartItem[] {


  if (
    typeof window === "undefined"
  ) {

    return [];

  }



  try {


    const data =
      localStorage.getItem(
        getCartKey(userId)
      );



    return data
      ? JSON.parse(data)
      : [];



  } catch {


    return [];

  }


}





export function saveCart(
  cart: CartItem[],
  userId?: string
) {


  if (
    typeof window === "undefined"
  ) {

    return;

  }



  localStorage.setItem(

    getCartKey(userId),

    JSON.stringify(cart)

  );



  window.dispatchEvent(
    new Event("cart-updated")
  );


}





export function addToCart(
  item: CartItem,
  userId?: string
) {


  const cart =
    getCart(userId);



  const existingIndex =
    cart.findIndex(

      (product)=>

        product.id === item.id &&
        product.color === item.color &&
        product.size === item.size

    );



  if (
    existingIndex >= 0
  ) {


    cart[existingIndex].quantity +=
      item.quantity;


  } else {


    cart.push(item);


  }



  saveCart(
    cart,
    userId
  );



  window.dispatchEvent(
    new Event("cart-added")
  );


}





export function clearCart(
  userId?: string
) {


  saveCart(
    [],
    userId
  );


}





export function getCartCount(
  userId?: string
) {


  return getCart(userId)
    .reduce(

      (total,item)=>

        total + item.quantity,

      0

    );


}





export function getCartTotal(
  userId?: string
) {


  return getCart(userId)
    .reduce(

      (total,item)=>

        total +
        item.price *
        item.quantity,

      0

    );


}





export function removeCartItem(
  id:number,
  color?:string,
  size?:string,
  userId?:string
) {


  const updated =
    getCart(userId)
      .filter(

        (item)=>

          !(
            item.id === id &&
            item.color === color &&
            item.size === size
          )

      );



  saveCart(
    updated,
    userId
  );


}





export function updateCartQuantity(
  id:number,
  color:string | undefined,
  size:string | undefined,
  quantity:number,
  userId?:string
) {


  const cart =
    getCart(userId);



  const updated =
    cart.map(

      (item)=>{


        if (

          item.id === id &&
          item.color === color &&
          item.size === size

        ) {


          return {

            ...item,

            quantity:
              Math.max(
                1,
                quantity
              ),

          };


        }



        return item;


      }

    );



  saveCart(
    updated,
    userId
  );


}





export function isInCart(
  id:number,
  color?:string,
  size?:string,
  userId?:string
) {


  return getCart(userId)
    .some(

      (item)=>

        item.id === id &&
        item.color === color &&
        item.size === size

    );


}





export function getCartItem(
  id:number,
  color?:string,
  size?:string,
  userId?:string
) {


  return getCart(userId)
    .find(

      (item)=>

        item.id === id &&
        item.color === color &&
        item.size === size

    );


}





export function subscribeCart(
  callback:()=>void
) {


  if (
    typeof window === "undefined"
  ) {

    return () => {};

  }



  window.addEventListener(
    "cart-updated",
    callback
  );



  return ()=>{


    window.removeEventListener(
      "cart-updated",
      callback
    );


  };


}