"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCart,
  saveCart,
  loadCart,
  addToCart,
  removeCartItem,
  updateCartQuantity,
  clearCart as clearCartStorage,
  type CartItem,
} from "@/lib/cart";

import { useAuthUser } from "@/hooks/useAuthUser";


type CartContextType = {

  items: CartItem[];

  count: number;

  subtotal: number;

  refreshCart: () => void;

  addItem: (
    item: CartItem
  ) => Promise<void>;

  removeItem: (
    id: number,
    color?: string,
    size?: string
  ) => Promise<void>;

  updateQuantity: (
    id: number,
    color: string | undefined,
    size: string | undefined,
    quantity: number
  ) => Promise<void>;

  clearCart: () => Promise<void>;

};


const CartContext =
  createContext<CartContextType | null>(
    null
  );


export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const {
    user,
    loading: authLoading,
  } = useAuthUser();


  const [
    items,
    setItems,
  ] = useState<CartItem[]>([]);


  /*
   * Refresh local cache
   */

  const refreshCart =
    useCallback(() => {

      setItems(
        getCart(
          user?.id
        )
      );

    }, [
      user?.id,
    ]);


  /*
   * Load cart when auth state
   * changes.
   */

  useEffect(() => {

    if (
      authLoading
    ) {
      return;
    }


    let cancelled = false;


    async function load() {

      /*
       * Guest
       */

      if (!user) {

        const guestCart =
          getCart();


        if (
          !cancelled
        ) {

          setItems(
            guestCart
          );

        }

        return;

      }


      /*
       * Logged-in user
       *
       * Load from Supabase.
       */

try {

  const remoteCart =
    await loadCart(
      user.id
    );


  if (!cancelled) {

    setItems(
      remoteCart
    );

  }

} catch(error){

  console.error(
    "Failed loading cart:",
    error
  );


  if (!cancelled) {

    setItems(
      getCart(
        user.id
      )
    );

  }

}

    }


    load();


    return () => {

      cancelled = true;

    };

  }, [
    user?.id,
    authLoading,
  ]);


  /*
   * Listen for external
   * cart changes.
   */

  useEffect(() => {

    const update = () => {

      refreshCart();

    };


    window.addEventListener(
      "cart-updated",
      update
    );


    return () => {

      window.removeEventListener(
        "cart-updated",
        update
      );

    };

  }, [
    refreshCart,
  ]);


  /*
   * Add item
   */

  const addItem =
    async (
      item: CartItem
    ) => {

      const updated =
        await addToCart(
          item,
          user?.id
        );


      setItems(
        updated
      );

    };


  /*
   * Remove item
   */

  const removeItem =
    async (
      id: number,
      color?: string,
      size?: string
    ) => {

      await removeCartItem(
        id,
        color,
        size,
        user?.id
      );


      setItems(
        getCart(
          user?.id
        )
      );

    };


  /*
   * Update quantity
   */

  const updateQuantity =
    async (
      id: number,
      color:
        | string
        | undefined,
      size:
        | string
        | undefined,
      quantity: number
    ) => {

      await updateCartQuantity(
        id,
        color,
        size,
        quantity,
        user?.id
      );


      setItems(
        getCart(
          user?.id
        )
      );

    };


  /*
   * Clear cart
   */

  const clearCart =
    async () => {

      await clearCartStorage(
        user?.id
      );


      setItems([]);

    };


  /*
   * Count
   */

  const count =
    useMemo(
      () =>
        items.reduce(
          (
            sum,
            item
          ) =>
            sum +
            item.quantity,
          0
        ),
      [items]
    );


  /*
   * Subtotal
   */

  const subtotal =
    useMemo(
      () =>
        items.reduce(
          (
            sum,
            item
          ) =>
            sum +
            item.price *
              item.quantity,
          0
        ),
      [items]
    );


  return (

    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        refreshCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >

      {children}

    </CartContext.Provider>

  );

}


export function useCart() {

  const context =
    useContext(
      CartContext
    );


  if (!context) {

    throw new Error(
      "useCart must be used inside CartProvider"
    );

  }


  return context;

}