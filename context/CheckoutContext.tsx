
"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

export type ShippingSelection = {
  courier: string;
  courierCode: "jne" | "jnt" | "cod";
  service: string;
  description: string;
  price: number;
  etd: string;
  destinationId: number;
  destinationLabel: string;
  weightGrams: number;
};

type Contact = {
  email: string;
  phone: string;
  marketing: boolean;
};

type Address = {
  firstName: string;
  lastName: string;
  company: string;
  country: string;
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  street: string;
  apartment: string;
};

export type CheckoutErrors = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  street?: string;
  apartment?: string;
};

type CheckoutContextType = {
  contact: Contact;
  address: Address;
  delivery: string;
  payment: string;
  shippingSelection: ShippingSelection | null;
  errors: CheckoutErrors;
  validateCheckout: () => boolean;

  setContact: React.Dispatch<React.SetStateAction<Contact>>;
  setAddress: React.Dispatch<React.SetStateAction<Address>>;
  setDelivery: React.Dispatch<React.SetStateAction<string>>;
  setPayment: React.Dispatch<React.SetStateAction<string>>;
  setShippingSelection: React.Dispatch<
    React.SetStateAction<ShippingSelection | null>
  >;
  setErrors: React.Dispatch<React.SetStateAction<CheckoutErrors>>;
  resetCheckout: () => void;
};

const defaultContact: Contact = {
  email: "",
  phone: "",
  marketing: false,
};

const defaultAddress: Address = {
  firstName: "",
  lastName: "",
  company: "",
  country: "Indonesia",
  province: "",
  city: "",
  district: "",
  village: "",
  postalCode: "",
  street: "",
  apartment: "",
};

const CheckoutContext =
  createContext<CheckoutContextType | null>(null);

export function CheckoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contact, setContact] =
    useState<Contact>(defaultContact);

  const [address, setAddress] =
    useState<Address>(defaultAddress);

  // Pilihan kurir disimpan sebagai courierCode:service.
  // Tidak ada ongkir gratis atau harga dummy.
  const [delivery, setDelivery] = useState("");

  const [shippingSelection, setShippingSelection] =
    useState<ShippingSelection | null>(null);

  const [payment, setPayment] = useState("bank");

  const [errors, setErrors] =
    useState<CheckoutErrors>({});

  function resetCheckout() {
    setContact(defaultContact);
    setAddress(defaultAddress);
    setDelivery("");
    setShippingSelection(null);
    setPayment("bank");
    setErrors({});
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone: string) {
    return /^(\+62|62|0)8[1-9][0-9]{7,10}$/.test(
      phone.replace(/\s/g, ""),
    );
  }

  function validateCheckout() {
    const newErrors: CheckoutErrors = {};

    if (!contact.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!validateEmail(contact.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!contact.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!validatePhone(contact.phone)) {
      newErrors.phone =
        "Please enter a valid Indonesian phone number.";
    }

    if (!address.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!address.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!address.province.trim()) {
      newErrors.province = "Province is required.";
    }

    if (!address.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!address.district.trim()) {
      newErrors.district = "District is required.";
    }

    if (delivery !== "cod_ongkir" && !address.village.trim()) {
      newErrors.postalCode = "Pilih kelurahan untuk mengisi kode pos otomatis.";
    }

    if (!address.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required.";
    }

    if (!address.street.trim()) {
      newErrors.street = "Street address is required.";
    }

    if (!delivery || !shippingSelection) {
      newErrors.country =
        "Please select an available shipping service.";
    } else if (
      (delivery === "cod_ongkir" && shippingSelection.courierCode !== "cod") ||
      (delivery !== "cod_ongkir" && `${shippingSelection.courierCode}:${shippingSelection.service}` !== delivery)
    ) {
      newErrors.country =
        "Shipping selection is invalid. Please select a service again.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  return (
    <CheckoutContext.Provider
      value={{
        contact,
        address,
        delivery,
        payment,
        shippingSelection,
        errors,
        validateCheckout,
        setContact,
        setAddress,
        setDelivery,
        setPayment,
        setShippingSelection,
        setErrors,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error(
      "useCheckout must be used inside CheckoutProvider",
    );
  }

  return context;
}
