import { createClient } from "@/lib/supabase/server";

import type { Order } from "@/lib/order";

import {
  mapOrder,
} from "@/lib/order";


export async function getOrderByIdServer(
  id: string
): Promise<Order | undefined> {


  const supabase =
    await createClient();


  const {
    data:{
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {
    return undefined;
  }


  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .select(`
        *,
        order_items (*)
      `)

      .eq(
        "id",
        id
      )

      .eq(
        "user_id",
        user.id
      )

      .maybeSingle();



  if (error) {
    throw error;
  }


  if (!data) {
    return undefined;
  }


  return mapOrder(data);

}