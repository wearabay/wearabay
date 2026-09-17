import Container from "@/components/ui/Container";

import SuccessClient from "@/components/checkout/SuccessClient";

import { getStoreSettings } from "@/lib/store-settings";


type Props = {
  searchParams: Promise<{
    order?: string;
  }>;
};


export default async function SuccessPage({
  searchParams,
}: Props) {

  const {
    order,
  } = await searchParams;


  const settings =
    await getStoreSettings();


  return (

    <>

      <main>

        <Container className="py-32">

          <SuccessClient
            orderId={order}
            storeName={settings.storeName}
          />

        </Container>

      </main>

    </>

  );

}