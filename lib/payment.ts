export function formatPaymentMethod(
  payment: string
) {

  const value =
    payment.toLowerCase();


  switch (value) {


    case "bank":
    case "bank_transfer":

      return {
        title: "Bank Transfer",
        detail: "Bank Transfer",
      };


    case "bca":

      return {
        title: "Bank Transfer",
        detail: "BCA",
      };


    case "mandiri":

      return {
        title: "Bank Transfer",
        detail: "Mandiri",
      };


    case "gopay":

      return {
        title: "E-Wallet",
        detail: "GoPay",
      };


    case "ovo":

      return {
        title: "E-Wallet",
        detail: "OVO",
      };


    case "dana":

      return {
        title: "E-Wallet",
        detail: "DANA",
      };


    case "qris":

      return {
        title: "QRIS",
        detail: "QRIS",
      };


    case "cod":

      return {
        title: "Cash On Delivery",
        detail: "COD",
      };


    default:

      return {
        title: payment,
        detail: payment,
      };

  }

}