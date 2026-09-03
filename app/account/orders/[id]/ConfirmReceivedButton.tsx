"use client";

import {
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  confirmReceivedAction,
} from "./actions";


type Props = {
  orderId:string;
};


export default function ConfirmReceivedButton({
  orderId,
}:Props){


  const [loading,setLoading] =
    useState(false);


  const [message,setMessage] =
    useState("");

  
  const router = useRouter();



  async function handleConfirm(){


    if(
      !confirm(
        "Confirm that you have received this order?"
      )
    ){
      return;
    }


    setLoading(true);


    const result =
      await confirmReceivedAction(
        orderId
      );


    setLoading(false);



    if (!result.success) {
  setMessage(result.message);
  return;
}

router.refresh();


  }



  return (

    <div>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className="
          rounded-full
          bg-black
          px-6
          py-3
          text-xs
          uppercase
          tracking-[0.15em]
          text-white
          disabled:opacity-50
        "
      >

        {
          loading
            ?
            "Confirming..."
            :
            "Confirm Received"
        }

      </button>



      {message && (

        <p
          className="
            mt-3
            text-sm
            text-red-500
          "
        >
          {message}
        </p>

      )}

    </div>

  );

}