"use client";

import { useEffect, useState } from "react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import {
  useCheckout,
} from "@/context/CheckoutContext";

import ProvinceSelect from "@/components/address/ProvinceSelect";
import CitySelect from "@/components/address/CitySelect";
import DistrictSelect from "@/components/address/DistrictSelect";

import AddressForm from "@/components/account/AddressForm";

import {
  getAddresses,
  addAddress,
  setDefaultAddress,
} from "@/lib/addresses";

import type {
  Address as SavedAddress,
} from "@/types/address";


export default function ShippingAddress() {

  const {
    address,
    errors,
    setAddress,
    setContact,
    setErrors,
  } = useCheckout();


  const [
    savedAddresses,
    setSavedAddresses,
  ] = useState<SavedAddress[]>([]);


  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState<string>("");


  const [
    addressFormOpen,
    setAddressFormOpen,
  ] = useState(false);


  const [
    savingAddress,
    setSavingAddress,
  ] = useState(false);


  async function loadAddresses() {

    try {

      const addresses =
        await getAddresses();

      setSavedAddresses(addresses);

      /*
       * Jika belum ada alamat yang dipilih
       * tetapi ada default address,
       * gunakan default sebagai pilihan checkout.
       */

      if (!selectedAddressId) {

        const defaultAddress =
          addresses.find(
            (item) => item.isDefault
          );

        if (defaultAddress) {

          setSelectedAddressId(
            defaultAddress.id
          );

          useSavedAddress(
            defaultAddress
          );

        }

      }

    } catch (error) {

      console.error(
        "Failed to load checkout addresses:",
        error
      );

    }

  }


  useEffect(() => {

    loadAddresses();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  function updateField(
    field: keyof typeof address,
    value: string
  ) {

    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));


    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

  }


  function useSavedAddress(
    saved: SavedAddress
  ) {

    setSelectedAddressId(
      saved.id
    );


    setAddress((prev) => ({

      ...prev,

      firstName:
        saved.firstName,

      lastName:
        saved.lastName,

      country:
        saved.country,

      province:
        saved.province,

      city:
        saved.city,

      district:
        saved.district,

      postalCode:
        saved.postalCode,

      street:
        saved.street,

      apartment:
        saved.apartment ?? "",

    }));


    setContact((prev) => ({

      ...prev,

      phone:
        saved.phone,

    }));


    setErrors({});

  }


  async function handleSetDefault(
    saved: SavedAddress
  ) {

    try {

      await setDefaultAddress(
        saved.id
      );

      const updatedAddresses =
        await getAddresses();

      setSavedAddresses(
        updatedAddresses
      );

      /*
       * Tetap gunakan alamat tersebut
       * sebagai alamat checkout.
       */

      const updated =
        updatedAddresses.find(
          (item) =>
            item.id === saved.id
        );

      if (updated) {
        useSavedAddress(updated);
      }

    } catch (error) {

      console.error(
        "Failed to set default address:",
        error
      );

    }

  }


  async function handleSaveNewAddress(
    newAddress: SavedAddress
  ) {

    if (savingAddress) return;

    try {

      setSavingAddress(true);

      /*
       * Simpan ke Supabase.
       *
       * Jangan otomatis menjadikannya default.
       * Default hanya berubah jika user memang
       * mengaturnya melalui action "Make default".
       */

      const saved =
        await addAddress({
          ...newAddress,
          isDefault: false,
        });


      /*
       * Refresh daftar address setelah insert.
       */

      const updatedAddresses =
        await getAddresses();

      setSavedAddresses(
        updatedAddresses
      );


      /*
       * Alamat baru langsung digunakan
       * untuk checkout.
       */

      useSavedAddress(saved);


      setAddressFormOpen(false);

    } catch (error) {

      console.error(
        "Failed to save checkout address:",
        error
      );

      window.alert(
        "Failed to save address. Please try again."
      );

    } finally {

      setSavingAddress(false);

    }

  }


  return (

    <>

      <section
        className="
          rounded-2xl
          border
          border-stone-200
          bg-white
          p-6
        "
      >

        <h2
          className="
            mb-6
            text-lg
            font-medium
          "
        >
          Shipping Address
        </h2>


        {savedAddresses.length > 0 && (

          <div className="mb-8 space-y-4">

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >

              <p
                className="
                  text-sm
                  font-medium
                  text-neutral-600
                "
              >
                Saved Addresses
              </p>


              <button
                type="button"
                onClick={() =>
                  setAddressFormOpen(true)
                }
                className="
                  text-sm
                  font-medium
                  underline
                  underline-offset-4
                "
              >
                + Add New Address
              </button>

            </div>


            <div className="grid gap-4">

              {savedAddresses.map(
                (saved) => {

                  const selected =
                    selectedAddressId ===
                    saved.id;

                  return (

                    <div
                      key={saved.id}
                      className={`
                        rounded-2xl
                        border
                        p-5
                        transition
                        ${
                          selected
                            ? "border-black"
                            : "border-stone-200"
                        }
                      `}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          useSavedAddress(
                            saved
                          )
                        }
                        className="
                          w-full
                          text-left
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                        >

                          <p
                            className="
                              font-medium
                            "
                          >
                            {saved.label}
                          </p>


                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            {selected && (

                              <span
                                className="
                                  text-xs
                                  font-medium
                                  uppercase
                                  tracking-wider
                                  text-black
                                "
                              >
                                Selected
                              </span>

                            )}


                            {saved.isDefault && (

                              <span
                                className="
                                  text-xs
                                  uppercase
                                  tracking-wider
                                  text-neutral-500
                                "
                              >
                                Default
                              </span>

                            )}

                          </div>

                        </div>


                        <p
                          className="
                            mt-3
                            text-sm
                            text-neutral-600
                          "
                        >
                          {saved.firstName}{" "}
                          {saved.lastName}
                        </p>


                        <p
                          className="
                            text-sm
                            text-neutral-600
                          "
                        >
                          {saved.province},{" "}
                          {saved.city},{" "}
                          {saved.district}
                        </p>


                        <p
                          className="
                            text-sm
                            text-neutral-500
                          "
                        >
                          {saved.street}
                        </p>

                      </button>


                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          justify-end
                          border-t
                          border-stone-100
                          pt-4
                        "
                      >

                        {!saved.isDefault && (

                          <button
                            type="button"
                            onClick={() =>
                              handleSetDefault(
                                saved
                              )
                            }
                            className="
                              text-sm
                              font-medium
                              underline
                              underline-offset-4
                            "
                          >
                            Make Default
                          </button>

                        )}

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          </div>

        )}


        {savedAddresses.length === 0 && (

          <div className="mb-8">

            <button
              type="button"
              onClick={() =>
                setAddressFormOpen(true)
              }
              className="
                w-full
                rounded-2xl
                border
                border-dashed
                border-stone-300
                p-6
                text-left
                transition
                hover:border-black
              "
            >

              <p className="font-medium">
                + Add New Address
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-neutral-500
                "
              >
                Add a shipping address for
                this order.
              </p>

            </button>

          </div>

        )}


        <div className="space-y-5">


          <div
            className="
              grid
              gap-5
              md:grid-cols-2
            "
          >

            <Input
              id="firstName"
              label="First Name"
              value={address.firstName}
              error={errors.firstName}
              onChange={(e) =>
                updateField(
                  "firstName",
                  e.target.value
                )
              }
            />


            <Input
              id="lastName"
              label="Last Name"
              value={address.lastName}
              error={errors.lastName}
              onChange={(e) =>
                updateField(
                  "lastName",
                  e.target.value
                )
              }
            />

          </div>


          <Input
            label="Company (Optional)"
            value={address.company}
            onChange={(e) =>
              updateField(
                "company",
                e.target.value
              )
            }
          />


          <Input
            label="Country"
            value={address.country}
            readOnly
          />


          <ProvinceSelect
            value={address.province}
            error={errors.province}
            onChange={(value) => {

              updateField(
                "province",
                value
              );

              updateField(
                "city",
                ""
              );

              updateField(
                "district",
                ""
              );

            }}
          />


          <CitySelect
            province={address.province}
            value={address.city}
            error={errors.city}
            onChange={(value) => {

              updateField(
                "city",
                value
              );

              updateField(
                "district",
                ""
              );

            }}
          />


          <DistrictSelect
            province={address.province}
            city={address.city}
            value={address.district}
            error={errors.district}
            onChange={(value) =>
              updateField(
                "district",
                value
              )
            }
          />


          <Input
            id="postalCode"
            label="Postal Code"
            placeholder="51111"
            value={address.postalCode}
            error={errors.postalCode}
            onChange={(e) =>
              updateField(
                "postalCode",
                e.target.value
              )
            }
          />


          <Input
            id="street"
            label="Street Address"
            placeholder="Jl. Example No.123"
            value={address.street}
            error={errors.street}
            onChange={(e) =>
              updateField(
                "street",
                e.target.value
              )
            }
          />


          <Input
            label="Apartment / Suite (Optional)"
            placeholder="Apartment, unit, floor"
            value={address.apartment}
            onChange={(e) =>
              updateField(
                "apartment",
                e.target.value
              )
            }
          />

        </div>

      </section>


      <AddressForm
        open={addressFormOpen}
        onClose={() =>
          setAddressFormOpen(false)
        }
        onSave={handleSaveNewAddress}
      />

    </>

  );

}