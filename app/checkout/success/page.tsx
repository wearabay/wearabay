

import Container from "@/components/ui/Container";

import SuccessClient from "@/components/checkout/SuccessClient";


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



  return (

    <>
      


      <main>

        <Container className="py-32">

          <SuccessClient
            orderId={order}
          />

        </Container>

      </main>


      

    </>

  );

}