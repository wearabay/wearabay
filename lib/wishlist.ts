function getWishlistKey(
  userId?: string
) {

  if(userId){

    return `wearing-abaya-user-${userId}-wishlist`;

  }


  return "wearing-abaya-guest-wishlist";

}





export function getWishlist(
  userId?: string
): number[] {


  if(
    typeof window === "undefined"
  ){

    return [];

  }



  try {


    const data =
      localStorage.getItem(
        getWishlistKey(userId)
      );



    return data
      ? JSON.parse(data)
      : [];



  } catch {


    return [];

  }


}





export function saveWishlist(
  ids:number[],
  userId?:string
) {


  if(
    typeof window === "undefined"
  ){

    return;

  }



  localStorage.setItem(

    getWishlistKey(userId),

    JSON.stringify(ids)

  );



  window.dispatchEvent(

    new Event("wishlist-updated")

  );


}





export function isWishlisted(
  id:number,
  userId?:string
) {


  return getWishlist(userId)
    .includes(id);


}





export function toggleWishlist(
  id:number,
  userId?:string
) {


  const list =
    getWishlist(userId);



  let updated:number[];



  if(
    list.includes(id)
  ){


    updated =
      list.filter(
        item => item !== id
      );


  } else {


    updated = [
      ...list,
      id
    ];


  }



  saveWishlist(
    updated,
    userId
  );



  return updated;


}





export function getWishlistCount(
  userId?:string
) {


  return getWishlist(userId)
    .length;


}





export function removeWishlist(
  id:number,
  userId?:string
) {


  const updated =
    getWishlist(userId)
      .filter(
        item => item !== id
      );



  saveWishlist(
    updated,
    userId
  );


}





export function clearWishlist(
  userId?:string
) {


  if(
    typeof window === "undefined"
  ){

    return;

  }



  localStorage.removeItem(

    getWishlistKey(userId)

  );



  window.dispatchEvent(

    new Event("wishlist-updated")

  );


}