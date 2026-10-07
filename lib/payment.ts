export type BankAccount = {
  bank: "BCA" | "Mandiri";
  accountNumber: string;
  accountName: string;
  logoUrl: string;
};

/* BANK TRANSFER */
export const BANK_TRANSFER_DETAILS: BankAccount[] = [
  {
    bank: "Mandiri",
    accountNumber: "1120009967725",
    accountName: "Abubakar Danial",
    logoUrl:
      "https://www.bankmandiri.co.id/documents/20143/44881086/ag-branding-logo-1.png/842d8cf8-b7fb-3014-9620-21f0f88d8377?t=1623309819034",
  },
  {
    bank: "BCA",
    accountNumber: "3820198203",
    accountName: "Abubakar Danial",
    logoUrl:
      "https://www.bca.co.id/-/media/Feature/Card/List-Card/Tentang-BCA/Brand-Assets/Logo-BCA/Logo-BCA_Biru.png",
  },
];

/* PAYMENT METHOD FORMATTER */
export function formatPaymentMethod(payment: string) {
  const value = payment.toLowerCase().trim();

  switch (value) {
    case "bank":
    case "bank_transfer":
    case "bank transfer":
      return {
        title: "Bank Transfer",
        detail: "BCA",
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