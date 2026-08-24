export type BankAccount = {

  bank:
    | "BCA"
    | "Mandiri";

  accountNumber:
    string;

  accountName:
    string;

};


/* =========================================================
   BANK TRANSFER
========================================================= */

export const BANK_TRANSFER_DETAILS: BankAccount = {

  bank:
    "BCA",

  accountNumber:
    "0099887766",

  accountName:
    "Wearabay",

};


/* =========================================================
   PAYMENT METHOD FORMATTER
========================================================= */

export function formatPaymentMethod(
  payment: string
) {

  const value =
    payment
      .toLowerCase()
      .trim();


  switch (value) {

    case "bank":

    case "bank_transfer":

    case "bank transfer":

      return {

        title:
          "Bank Transfer",

        detail:
          "BCA",

      };


    case "bca":

      return {

        title:
          "Bank Transfer",

        detail:
          "BCA",

      };


    case "mandiri":

      return {

        title:
          "Bank Transfer",

        detail:
          "Mandiri",

      };


    case "gopay":

      return {

        title:
          "E-Wallet",

        detail:
          "GoPay",

      };


    case "ovo":

      return {

        title:
          "E-Wallet",

        detail:
          "OVO",

      };


    case "dana":

      return {

        title:
          "E-Wallet",

        detail:
          "DANA",

      };


    case "qris":

      return {

        title:
          "QRIS",

        detail:
          "QRIS",

      };


    case "cod":

      return {

        title:
          "Cash On Delivery",

        detail:
          "COD",

      };


    default:

      return {

        title:
          payment,

        detail:
          payment,

      };

  }

}