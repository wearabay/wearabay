import { createClient } from "@/lib/supabase/server";


export type OrderHistoryItem = {

  id: string;

  type: string;

  oldValue: string | null;

  newValue: string | null;

  note: string | null;

  createdAt: string;

};


/* =========================================================
   CREATE ORDER HISTORY
========================================================= */

export async function createOrderHistory(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  orderId: string,
  type: string,
  oldValue?: string | null,
  newValue?: string | null,
  note?: string | null
) {

  const {
    error,
  } =
    await supabase

      .from(
        "order_status_history"
      )

      .insert({

        order_id:
          orderId,

        type,

        old_value:
          oldValue ?? null,

        new_value:
          newValue ?? null,

        note:
          note ?? null,

      });


  if (error) {

    throw error;

  }

}


/* =========================================================
   GET ORDER HISTORY
========================================================= */

export async function getOrderHistory(
  orderId: string
): Promise<OrderHistoryItem[]> {

  const supabase =
    await createClient();


  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {

    return [];

  }


  const {
    data: order,
    error: orderError,
  } =
    await supabase

      .from("orders")

      .select(
        "id,user_id"
      )

      .eq(
        "id",
        orderId
      )

      .maybeSingle();


  if (orderError) {

    throw orderError;

  }


  if (!order) {

    return [];

  }


  /* =======================================================
     CUSTOMER / ADMIN ACCESS
  ======================================================= */

  const {
    data: profile,
  } =
    await supabase

      .from("profiles")

      .select("role")

      .eq(
        "id",
        user.id
      )

      .maybeSingle();


  const isAdmin =
    profile?.role === "admin";


  if (
    !isAdmin &&
    order.user_id !== user.id
  ) {

    return [];

  }


  /* =======================================================
     LOAD HISTORY
  ======================================================= */

  const {
    data,
    error,
  } =
    await supabase

      .from(
        "order_status_history"
      )

      .select(`
        id,
        type,
        old_value,
        new_value,
        note,
        created_at
      `)

      .eq(
        "order_id",
        orderId
      )

      .order(
        "created_at",
        {
          ascending: true,
        }
      );


  if (error) {

    throw error;

  }


  return (
    data ?? []
  ).map(
    (item) => ({

      id:
        item.id,

      type:
        item.type,

      oldValue:
        item.old_value,

      newValue:
        item.new_value,

      note:
        item.note,

      createdAt:
        item.created_at,

    })
  );

}