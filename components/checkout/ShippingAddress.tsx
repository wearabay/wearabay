"use client";

import { useEffect, useState } from "react";

import Input from "@/components/ui/Input";

import {
  useCheckout,
} from "@/context/CheckoutContext";

import ProvinceSelect from "@/components/address/ProvinceSelect";
import CitySelect from "@/components/address/CitySelect";
import DistrictSelect from "@/components/address/DistrictSelect";

import {
  getAddresses,
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



  useEffect(() => {
  async function loadAddresses() {
    const addresses = await getAddresses();

    setSavedAddresses(addresses);
  }

  loadAddresses();
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





  return (

<section className="
rounded-2xl
border
border-stone-200
bg-white
p-6
">


<h2 className="mb-6 text-lg font-medium">

Shipping Address

</h2>



{savedAddresses.length > 0 && (

<div className="mb-8 space-y-4">


<p className="
text-sm
font-medium
text-neutral-600
">

Saved Addresses

</p>



<div className="grid gap-4">


{savedAddresses.map((saved)=>(


<button

key={saved.id}

type="button"

onClick={() =>
  useSavedAddress(saved)
}

className="
rounded-2xl
border
border-stone-200
p-5
text-left
transition
hover:border-black
"

>


<div className="
flex
items-center
justify-between
gap-3
">


<p className="
font-medium
">

{saved.label}

</p>



{saved.isDefault && (

<span className="
text-xs
uppercase
tracking-wider
text-neutral-500
">

Default

</span>

)}


</div>




<p className="
mt-3
text-sm
text-neutral-600
">

{saved.firstName}{" "}
{saved.lastName}

</p>



<p className="
text-sm
text-neutral-600
">

{saved.province},{" "}
{saved.city},{" "}
{saved.district}

</p>


<p className="
text-sm
text-neutral-500
">

{saved.street}

</p>



</button>


))}


</div>


</div>

)}




<div className="space-y-5">



<div className="
grid
gap-5
md:grid-cols-2
">


<Input

id="firstName"

label="First Name"

value={address.firstName}

error={errors.firstName}

onChange={(e)=>
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

onChange={(e)=>
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

onChange={(e)=>
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

onChange={(value)=>{

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

onChange={(value)=>{

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

onChange={(value)=>

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

onChange={(e)=>

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

onChange={(e)=>

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

onChange={(e)=>

updateField(
 "apartment",
 e.target.value
)

}

/>




</div>


</section>

  );
}