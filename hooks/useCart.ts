"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCart,
  type CartItem,
} from "@/lib/cart";

import { createClient } from "@/lib/supabase/client";


export default function useCart() {


  const [items,setItems] =
    useState<CartItem[]>([]);


  const [userId,setUserId] =
    useState<string | undefined>();



  useEffect(()=>{


    const supabase =
      createClient();



    async function loadUser(){


      const {
        data:{
          user
        }
      } =
      await supabase.auth.getUser();


      setUserId(
        user?.id
      );


      setItems(
        getCart(user?.id)
      );


    }



    loadUser();



    const {
      data:{
        subscription
      }
    } =
    supabase.auth.onAuthStateChange(
      (
        _event,
        session
      )=>{


        const id =
          session?.user?.id;



        setUserId(id);



        setItems(
          getCart(id)
        );


      }
    );



    const updateCart = ()=>{


      setItems(
        getCart(userId)
      );


    };



    window.addEventListener(
      "cart-updated",
      updateCart
    );



    return ()=>{


      subscription.unsubscribe();


      window.removeEventListener(
        "cart-updated",
        updateCart
      );


    };


  },[userId]);





  const subtotal = useMemo(

    ()=>


      items.reduce(

        (sum,item)=>

          sum +
          item.price *
          item.quantity,

        0

      ),


    [items]

  );





  const count = useMemo(

    ()=>


      items.reduce(

        (sum,item)=>

          sum +
          item.quantity,

        0

      ),


    [items]

  );





  return {

    items,

    subtotal,

    count,

  };

}