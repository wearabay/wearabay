import type {
  CheckoutErrors,
} from "@/context/CheckoutContext";


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
  postalCode: string;
  street: string;
  apartment: string;
};


/*
  EMAIL VALIDATION

  Allowed:
  - gmail.com
  - yahoo.com
  - co.id
  - net
  - org

*/

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const blockedEmailPatterns = [
  "@gmail.con",
  "@yahoo.con",
  "@hotmail.con",
];


/*
  INDONESIA PHONE VALIDATION

  Allowed:
  081234567890
  +6281234567890
  6281234567890

*/

const phoneRegex =
  /^(?:\+62|62|0)8[1-9][0-9]{7,10}$/;



/*
  POSTAL CODE INDONESIA

  Example:
  51111
*/

const postalRegex =
  /^[0-9]{5}$/;




export function validateCheckout(
  contact: Contact,
  address: Address
): CheckoutErrors {


  const errors: CheckoutErrors = {};



  /*
    CONTACT
  */


  // Email

const email =
  contact.email
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .toLowerCase();


if (!email) {

  errors.email =
    "Email is required.";

} else if (
  !emailRegex.test(email)
) {

  errors.email =
    "Please enter a valid email address.";

} else if (
  blockedEmailPatterns.some(
    (item) =>
      email.includes(item)
  )
) {

  errors.email =
    "Please check your email address.";

}



  // Phone

  const cleanPhone =
    contact.phone
      .replace(/\s|-/g, "")
      .trim();



  if (!cleanPhone) {

    errors.phone =
      "Phone number is required.";

  } else if (
    !phoneRegex.test(cleanPhone)
  ) {

    errors.phone =
      "Please enter a valid Indonesian phone number.";

  }




  /*
    SHIPPING ADDRESS
  */


  if (
    !address.firstName.trim()
  ) {

    errors.firstName =
      "First name is required.";

  }



  if (
    !address.lastName.trim()
  ) {

    errors.lastName =
      "Last name is required.";

  }



  if (
    !address.province.trim()
  ) {

    errors.province =
      "Province is required.";

  }



  if (
    !address.city.trim()
  ) {

    errors.city =
      "City is required.";

  }

  if (
  !address.district.trim()
) {

  errors.district =
    "District is required.";

}


  if (
    !address.street.trim()
  ) {

    errors.street =
      "Street address is required.";

  }



  if (
    !address.postalCode.trim()
  ) {

    errors.postalCode =
      "Postal code is required.";

  } else if (
    !postalRegex.test(
      address.postalCode.trim()
    )
  ) {

    errors.postalCode =
      "Please enter a valid postal code.";

  }



  return errors;

}




export function isCheckoutValid(
  contact: Contact,
  address: Address
) {

  return (
    Object.keys(
      validateCheckout(
        contact,
        address
      )
    ).length === 0
  );

}