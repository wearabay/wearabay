"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";

import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import EmptyAddress from "./EmptyAddress";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/addresses";

import type { Address } from "@/types/address";

export default function AddressBook() {
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [open, setOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<Address | undefined>();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  async function refreshAddresses() {
    try {
      setError("");

      const data =
        await getAddresses();

      setAddresses(data);

    } catch (error) {
      console.error(
        "Failed to load addresses:",
        error
      );

      setError(
        "Unable to load your addresses. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAddresses();
  }, []);

  const handleAdd = () => {
    setEditing(undefined);
    setOpen(true);
    setError("");
  };

  const handleEdit = (
    address: Address
  ) => {
    setEditing(address);
    setOpen(true);
    setError("");
  };

  const handleDelete = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Delete this address?"
      );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");

      await deleteAddress(id);

      await refreshAddresses();

    } catch (error) {
      console.error(
        "Failed to delete address:",
        error
      );

      setError(
        "Unable to delete this address. Please try again."
      );

    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (
    id: string
  ) => {
    try {
      setSaving(true);
      setError("");

      await setDefaultAddress(id);

      await refreshAddresses();

    } catch (error) {
      console.error(
        "Failed to set default address:",
        error
      );

      setError(
        "Unable to update the default address. Please try again."
      );

    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (
    address: Address
  ) => {
    try {
      setSaving(true);
      setError("");

      if (editing) {
        await updateAddress(address);
      } else {
        await addAddress(address);
      }

      await refreshAddresses();

      setOpen(false);
      setEditing(undefined);

    } catch (error) {
      console.error(
        "Failed to save address:",
        error
      );

      setError(
        "Unable to save your address. Please try again."
      );

    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-2xl font-semibold">
            My Addresses
          </h2>

          <p className="mt-1 text-neutral-500">
            Manage your shipping addresses.
          </p>
        </div>

        <Button
          fullWidth
          className="md:w-auto"
          onClick={handleAdd}
          disabled={loading || saving}
        >
          Add Address
        </Button>

      </div>


      {error && (
        <div className="mb-6 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {error}
        </div>
      )}


      {loading ? (

        <div className="py-12 text-center text-sm text-neutral-500">
          Loading addresses...
        </div>

      ) : addresses.length === 0 ? (

        <EmptyAddress />

      ) : (

        <div className="space-y-6">

          {addresses.map(
            (address) => (

              <AddressCard
                key={address.id}
                address={address}
                onEdit={() =>
                  handleEdit(address)
                }
                onDelete={() =>
                  handleDelete(
                    address.id
                  )
                }
                onSetDefault={() =>
                  handleSetDefault(
                    address.id
                  )
                }
              />

            )
          )}

        </div>

      )}


      <AddressForm
        open={open}
        initialData={editing}
        onClose={() => {

          if (saving) return;

          setOpen(false);
          setEditing(undefined);

        }}
        onSave={handleSave}
      />

    </>
  );
}