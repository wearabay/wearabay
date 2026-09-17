import { createClient } from "@/lib/supabase/server";


/* =========================================================
   TYPES
========================================================= */

export type AdminCustomer = {
  id: string;

  name: string;

  email: string;

  phone: string;

  joinedAt: string;

  orderCount: number;

  totalSpent: number;

  role: string;
};


export type AdminCustomerOrder = {
  id: string;

  orderNumber: string;

  customerEmail: string;

  customerPhone: string;

  total: number;

  status: string;

  paymentStatus: string;

  createdAt: string;
};


export type AdminCustomerDetail = AdminCustomer & {
  orders: AdminCustomerOrder[];
};


type ProfileRow = {
  id: string;

  first_name: string | null;

  last_name: string | null;

  full_name: string | null;

  phone: string | null;

  created_at: string | null;

  role: string | null;
};


type OrderCustomerRow = {
  id: string;

  user_id: string | null;

  order_number: string | null;

  customer_email: string | null;

  customer_phone: string | null;

  total: number | string | null;

  status: string | null;

  payment_status: string | null;

  created_at: string | null;
};


/* =========================================================
   AUTHENTICATED ADMIN
========================================================= */

async function getAuthenticatedAdmin() {

  const supabase =
    await createClient();


  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {

    return {
      supabase,
      user: null,
      isAdmin: false,
    };

  }


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


  return {

    supabase,

    user,

    isAdmin:
      profile?.role ===
      "admin",

  };

}


/* =========================================================
   HELPERS
========================================================= */

function getProfileName(
  profile: ProfileRow
): string {

  const fullName =
    profile.full_name?.trim() ??
    "";


  if (fullName) {
    return fullName;
  }


  const combined =
    [
      profile.first_name,
      profile.last_name,
    ]
      .filter(
        (
          value
        ) =>
          Boolean(
            value?.trim()
          )
      )
      .join(" ")
      .trim();


  if (combined) {
    return combined;
  }


  return "Customer";

}


function mapCustomerOrder(
  order: OrderCustomerRow
): AdminCustomerOrder {

  return {

    id:
      order.id,

    orderNumber:
      order.order_number ??
      "",

    customerEmail:
      order.customer_email?.trim() ??
      "",

    customerPhone:
      order.customer_phone?.trim() ??
      "",

    total:
      Number(
        order.total ??
          0
      ),

    status:
      order.status ??
      "pending",

    paymentStatus:
      order.payment_status ??
      "pending",

    createdAt:
      order.created_at ??
      "",

  };

}


/* =========================================================
   BUILD CUSTOMER
========================================================= */

function buildAdminCustomer(
  profile: ProfileRow,
  orders: OrderCustomerRow[]
): AdminCustomer {

  const profileOrders =
    orders.filter(
      (order) =>
        order.user_id ===
        profile.id
    );


  const sortedOrders =
    [...profileOrders].sort(
      (
        a,
        b
      ) =>
        new Date(
          b.created_at ??
            ""
        ).getTime() -
        new Date(
          a.created_at ??
            ""
        ).getTime()
    );


  const latestOrder =
    sortedOrders[0];


  const totalSpent =
    profileOrders
      .filter(
        (order) =>
          (
            order.status ===
              "completed" ||
            order.status ===
              "delivered"
          ) &&
          order.payment_status ===
            "paid"
      )
      .reduce(
        (
          sum,
          order
        ) =>
          sum +
          Number(
            order.total ??
              0
          ),
        0
      );


  return {

    id:
      profile.id,

    name:
      getProfileName(
        profile
      ),

    email:
      latestOrder?.customer_email?.trim() ??
      "",

    phone:
      profile.phone?.trim() ||
      latestOrder?.customer_phone?.trim() ||
      "",

    joinedAt:
      profile.created_at ??
      "",

    orderCount:
      profileOrders.length,

    totalSpent,

    role:
      profile.role ??
      "customer",

  };

}


/* =========================================================
   GET ADMIN CUSTOMERS
========================================================= */

export async function getAdminCustomers(): Promise<
  AdminCustomer[]
> {

  const {
    supabase,
    user,
    isAdmin,
  } =
    await getAuthenticatedAdmin();


  if (!user || !isAdmin) {
    return [];
  }


  /* -------------------------------------------------------
     GET CUSTOMER PROFILES
  ------------------------------------------------------- */

  const {
    data: profiles,
    error: profilesError,
  } =
    await supabase

      .from("profiles")

      .select(
        `
          id,
          first_name,
          last_name,
          full_name,
          phone,
          created_at,
          role
        `
      )

      .eq(
        "role",
        "customer"
      )

      .order(
        "created_at",
        {
          ascending: false,
        }
      );


  if (profilesError) {

    console.error(
      "getAdminCustomers profiles:",
      profilesError
    );

    return [];

  }


  const customerProfiles =
    (profiles ?? []) as ProfileRow[];


  if (
    customerProfiles.length ===
    0
  ) {

    return [];

  }


  const customerIds =
    customerProfiles.map(
      (profile) =>
        profile.id
    );


  /* -------------------------------------------------------
     GET ORDERS FOR CUSTOMERS
  ------------------------------------------------------- */

  const {
    data: orders,
    error: ordersError,
  } =
    await supabase

      .from("orders")

      .select(
        `
          id,
          user_id,
          order_number,
          customer_email,
          customer_phone,
          total,
          status,
          payment_status,
          created_at
        `
      )

      .in(
        "user_id",
        customerIds
      );


  if (ordersError) {

    console.error(
      "getAdminCustomers orders:",
      ordersError
    );

    return customerProfiles.map(
      (profile) => ({

        id:
          profile.id,

        name:
          getProfileName(
            profile
          ),

        email:
          "",

        phone:
          profile.phone?.trim() ??
          "",

        joinedAt:
          profile.created_at ??
          "",

        orderCount:
          0,

        totalSpent:
          0,

        role:
          profile.role ??
          "customer",

      })
    );

  }


  const customerOrders =
    (orders ?? []) as OrderCustomerRow[];


  return customerProfiles.map(
    (profile) =>
      buildAdminCustomer(
        profile,
        customerOrders
      )
  );

}


/* =========================================================
   GET ADMIN CUSTOMER DETAIL
========================================================= */

export async function getAdminCustomerById(
  customerId: string
): Promise<
  AdminCustomerDetail | null
> {

  const {
    supabase,
    user,
    isAdmin,
  } =
    await getAuthenticatedAdmin();


  if (!user || !isAdmin) {
    return null;
  }


  /* -------------------------------------------------------
     GET CUSTOMER PROFILE
  ------------------------------------------------------- */

  const {
    data: profile,
    error: profileError,
  } =
    await supabase

      .from("profiles")

      .select(
        `
          id,
          first_name,
          last_name,
          full_name,
          phone,
          created_at,
          role
        `
      )

      .eq(
        "id",
        customerId
      )

      .eq(
        "role",
        "customer"
      )

      .maybeSingle();


  if (profileError) {

    console.error(
      "getAdminCustomerById profile:",
      profileError
    );

    return null;

  }


  if (!profile) {
    return null;
  }


  const customerProfile =
    profile as ProfileRow;


  /* -------------------------------------------------------
     GET CUSTOMER ORDERS
  ------------------------------------------------------- */

  const {
    data: orders,
    error: ordersError,
  } =
    await supabase

      .from("orders")

      .select(
        `
          id,
          user_id,
          order_number,
          customer_email,
          customer_phone,
          total,
          status,
          payment_status,
          created_at
        `
      )

      .eq(
        "user_id",
        customerId
      )

      .order(
        "created_at",
        {
          ascending: false,
        }
      );


  if (ordersError) {

    console.error(
      "getAdminCustomerById orders:",
      ordersError
    );

    const customer =
      buildAdminCustomer(
        customerProfile,
        []
      );


    return {

      ...customer,

      orders:
        [],

    };

  }


  const customerOrders =
    (orders ?? []) as OrderCustomerRow[];


  const customer =
    buildAdminCustomer(
      customerProfile,
      customerOrders
    );


  return {

    ...customer,

    orders:
      customerOrders.map(
        mapCustomerOrder
      ),

  };

}