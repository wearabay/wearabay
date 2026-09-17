import { siteConfig } from "@/data/settings";


export function whatsappLink(
  message: string,
  whatsapp: string = siteConfig.whatsapp,
) {

  const phone =
    whatsapp.replace(/\D/g, "");


  return `https://wa.me/${phone}?text=${encodeURIComponent(
    message,
  )}`;
}