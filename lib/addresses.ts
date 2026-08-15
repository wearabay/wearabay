import { createClient } from "@/lib/supabase/client";
import type { Address } from "@/types/address";

type AddressRow = {
  id: string;
  user_id: string;
  label: Address["label"];
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  street: string;
  apartment: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

function mapAddress(row: AddressRow): Address {
  return {
    id: row.id,
    label: row.label,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    country: row.country,
    province: row.province,
    city: row.city,
    district: row.district,
    postalCode: row.postal_code,
    street: row.street,
    apartment: row.apartment ?? undefined,
    isDefault: row.is_default,
  };
}

async function getCurrentUserId(): Promise<string> {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  return user.id;
}

export async function getAddresses(): Promise<Address[]> {
  const supabase = createClient();

  const userId = await getCurrentUserId();

  const {
    data,
    error,
  } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", {
      ascending: false,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Failed to load addresses:",
      error
    );

    throw error;
  }

  return (data ?? []).map(
    (row) => mapAddress(row as AddressRow)
  );
}

export async function addAddress(
  address: Address
): Promise<Address> {
  const supabase = createClient();

  const userId = await getCurrentUserId();

  /*
   * Jika ini address pertama, jadikan default.
   *
   * Jika user memilih address ini sebagai default,
   * nonaktifkan default sebelumnya terlebih dahulu
   * agar unique partial index tetap terpenuhi.
   */
  const existing = await getAddresses();

  const isDefault =
    existing.length === 0
      ? true
      : address.isDefault;

  if (isDefault) {
    const {
      error: clearDefaultError,
    } = await supabase
      .from("addresses")
      .update({
        is_default: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("is_default", true);

    if (clearDefaultError) {
      throw clearDefaultError;
    }
  }

  const {
    data,
    error,
  } = await supabase
    .from("addresses")
    .insert({
      id: address.id || crypto.randomUUID(),
      user_id: userId,
      label: address.label,
      first_name: address.firstName,
      last_name: address.lastName,
      phone: address.phone,
      country: address.country,
      province: address.province,
      city: address.city,
      district: address.district,
      postal_code: address.postalCode,
      street: address.street,
      apartment: address.apartment || null,
      is_default: isDefault,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Failed to add address:",
      error
    );

    throw error;
  }

  return mapAddress(data as AddressRow);
}

export async function updateAddress(
  updated: Address
): Promise<Address> {
  const supabase = createClient();

  const userId = await getCurrentUserId();

  /*
   * Jika address yang diedit dijadikan default,
   * lepaskan default lama terlebih dahulu.
   */
  if (updated.isDefault) {
    const {
      error: clearDefaultError,
    } = await supabase
      .from("addresses")
      .update({
        is_default: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("is_default", true)
      .neq("id", updated.id);

    if (clearDefaultError) {
      throw clearDefaultError;
    }
  }

  const {
    data,
    error,
  } = await supabase
    .from("addresses")
    .update({
      label: updated.label,
      first_name: updated.firstName,
      last_name: updated.lastName,
      phone: updated.phone,
      country: updated.country,
      province: updated.province,
      city: updated.city,
      district: updated.district,
      postal_code: updated.postalCode,
      street: updated.street,
      apartment: updated.apartment || null,
      is_default: updated.isDefault,
      updated_at: new Date().toISOString(),
    })
    .eq("id", updated.id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error(
      "Failed to update address:",
      error
    );

    throw error;
  }

  return mapAddress(data as AddressRow);
}

export async function deleteAddress(
  id: string
): Promise<void> {
  const supabase = createClient();

  const userId = await getCurrentUserId();

  const {
    error,
  } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error(
      "Failed to delete address:",
      error
    );

    throw error;
  }
}

export async function setDefaultAddress(
  id: string
): Promise<Address> {
  const supabase = createClient();

  const userId = await getCurrentUserId();

  /*
   * Hapus status default dari address lama.
   */
  const {
    error: clearDefaultError,
  } = await supabase
    .from("addresses")
    .update({
      is_default: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("is_default", true)
    .neq("id", id);

  if (clearDefaultError) {
    throw clearDefaultError;
  }

  /*
   * Jadikan address yang dipilih sebagai default.
   */
  const {
    data,
    error,
  } = await supabase
    .from("addresses")
    .update({
      is_default: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error(
      "Failed to set default address:",
      error
    );

    throw error;
  }

  return mapAddress(data as AddressRow);
}