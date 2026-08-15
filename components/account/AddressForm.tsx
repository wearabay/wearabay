"use client";

import { useEffect, useRef, useState } from "react";

import ProvinceSelect from "@/components/address/ProvinceSelect";
import CitySelect from "@/components/address/CitySelect";
import AddressLabelSelect from "@/components/address/AddressLabelSelect";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import DistrictSelect from "@/components/address/DistrictSelect";

import type { Address } from "@/types/address";

type AddressFormProps = {
  open: boolean;
  initialData?: Address;
  onClose: () => void;
  onSave: (
  address: Address
) => void | Promise<void>;
};

const createEmptyAddress = (): Address => ({
  id: "",

  label: "Home",

  firstName: "",
  lastName: "",

  phone: "",

  country: "Indonesia",

  province: "",
  city: "",
  district: "",

  postalCode: "",

  street: "",
  apartment: "",

  isDefault: false,
});

export default function AddressForm({
  open,
  initialData,
  onClose,
  onSave,
}: AddressFormProps) {

  const modalRef = useRef<HTMLDivElement>(null);

  const [form, setForm] =
    useState<Address>(createEmptyAddress());

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  // -----------------------------
  // Reset Form
  // -----------------------------

  useEffect(() => {

    if (!open) return;

    setForm(
      initialData ?? createEmptyAddress()
    );

    setErrors({});

    requestAnimationFrame(() => {

      modalRef.current?.scrollTo({
        top: 0,
        behavior: "auto",
      });

    });

  }, [
    open,
    initialData,
  ]);

  // -----------------------------
  // Lock Body Scroll
  // -----------------------------

  useEffect(() => {

    if (!open) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };

  }, [open]);

  // -----------------------------
  // ESC Key
  // -----------------------------

  useEffect(() => {

    if (!open) return;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {

      if (event.key === "Escape") {
        onClose();
      }

    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [
    open,
    onClose,
  ]);

  if (!open) return null;

  const updateField = <
    K extends keyof Address
  >(
    key: K,
    value: Address[K]
  ) => {

    setForm((prev) => ({

      ...prev,

      [key]: value,

      ...(key === "province"
        ? {
            city: "",
            district: "",
          }
        : {}),

      ...(key === "city"
        ? {
            district: "",
          }
        : {}),

    }));

    setErrors((prev) => ({

      ...prev,

      [key]: "",

    }));

  };

  const validate = () => {

    const nextErrors:
      Record<string, string> = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName =
        "First name is required";
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName =
        "Last name is required";
    }

    if (!form.phone.trim()) {
      nextErrors.phone =
        "Phone number is required";
    }

    if (!form.province.trim()) {
      nextErrors.province =
        "Province is required";
    }

    if (!form.city.trim()) {
      nextErrors.city =
        "City is required";
    }

    if (!form.district.trim()) {
      nextErrors.district =
        "District is required";
    }

    if (!form.postalCode.trim()) {
      nextErrors.postalCode =
        "Postal code is required";
    }

    if (!form.street.trim()) {
      nextErrors.street =
        "Street address is required";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );

  };

  const handleSave = async () => {

  if (!validate()) return;

  await onSave({
    ...form,
    id: form.id || crypto.randomUUID(),
  });

};

  return (

<div
  className="
    fixed inset-0
    z-[100]
    bg-black/40
    flex
    items-center
    justify-center
    p-4
  "
  onClick={onClose}
>

  <div
    ref={modalRef}
    className="
      w-full
      max-w-2xl
      max-h-[90vh]
      overflow-y-auto
      rounded-3xl
      bg-white
      shadow-xl
    "
    onClick={(e) => e.stopPropagation()}
  >

    {/* Header */}

    <div
      className="
        sticky
        top-0
        z-10
        border-b
        bg-white
        px-6
        py-5
      "
    >

      <h2 className="text-2xl font-semibold">
        {initialData
          ? "Edit Address"
          : "Add Address"}
      </h2>

      <p className="mt-2 text-sm text-neutral-500">
        Save your shipping address for a faster checkout.
      </p>

    </div>

    {/* Body */}

    <div className="space-y-5 p-6">

      <AddressLabelSelect
        value={form.label}
        onChange={(value) =>
          updateField("label", value)
        }
      />

      <div className="grid gap-5 md:grid-cols-2">

        <Input
          id="firstName"
          label="First Name"
          value={form.firstName}
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
          value={form.lastName}
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
        id="phone"
        label="Phone Number"
        value={form.phone}
        error={errors.phone}
        onChange={(e) =>
          updateField(
            "phone",
            e.target.value
          )
        }
      />

      <Input
        label="Country"
        value="Indonesia"
        disabled
      />

      <div
        className="
          grid
          gap-5
          md:grid-cols-3
        "
      >

        <ProvinceSelect
          value={form.province}
          onChange={(value) =>
            updateField(
              "province",
              value
            )
          }
        />

        <CitySelect
          province={form.province}
          value={form.city}
          onChange={(value) =>
            updateField(
              "city",
              value
            )
          }
        />

        <DistrictSelect
  province={form.province}
  city={form.city}
  value={form.district}
  error={errors.district}
  onChange={(value) =>
    updateField(
      "district",
      value
    )
  }
/>

      </div>

      <Input
        label="Postal Code"
        value={form.postalCode}
        error={errors.postalCode}
        onChange={(e) =>
          updateField(
            "postalCode",
            e.target.value
          )
        }
      />

      <Input
        label="Street Address"
        value={form.street}
        error={errors.street}
        onChange={(e) =>
          updateField(
            "street",
            e.target.value
          )
        }
      />

      <Input
        label="Apartment / Suite"
        value={form.apartment ?? ""}
        onChange={(e) =>
          updateField(
            "apartment",
            e.target.value
          )
        }
      />

    </div>



    {/* Footer */}

    <div
className="
sticky
bottom-0
z-20
border-t
bg-white
px-6
py-5
"
>

      <div
className="
flex
flex-col
gap-3
"
>

        <Button
variant="outline"
className="w-full"
onClick={onClose}
>
Cancel
</Button>

<Button
className="w-full"
onClick={handleSave}
>
{initialData
? "Update Address"
: "Save Address"}
</Button>

      </div>

    </div>

  </div>

</div>

  );

}