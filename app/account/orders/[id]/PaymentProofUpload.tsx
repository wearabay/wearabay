"use client";

import { useRouter } from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import {
  savePaymentProofAction,
} from "./actions";


type Props = {
  orderId: string;
  paymentProofPath: string | null;
};


const MAX_FILE_SIZE =
  5 * 1024 * 1024;


const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
];


export default function PaymentProofUpload({
  orderId,
  paymentProofPath,
}: Props) {

  const supabase =
    createClient();

  const router =
    useRouter();


  const [file, setFile] =
    useState<File | null>(null);


  const [loading, setLoading] =
    useState(false);


  const [message, setMessage] =
    useState("");


  const [error, setError] =
    useState("");


  const [proofUrl, setProofUrl] =
    useState<string | null>(null);


  const [proofLoading, setProofLoading] =
    useState(false);


  /* =======================================================
     LOAD EXISTING PAYMENT PROOF
  ======================================================= */

  useEffect(() => {

    async function loadPaymentProof() {

      if (!paymentProofPath) {

        setProofUrl(null);

        return;

      }


      setProofLoading(true);


      const {
        data,
        error,
      } =
        await supabase.storage
          .from("payment-proofs")
          .createSignedUrl(
            paymentProofPath,
            60 * 60
          );


      if (error) {

        console.error(
          "Failed to load payment proof:",
          error
        );

        setProofUrl(null);

      } else {

        setProofUrl(
          data.signedUrl
        );

      }


      setProofLoading(false);

    }


    loadPaymentProof();

  }, [
    paymentProofPath,
    supabase,
  ]);


  /* =======================================================
     FILE CHANGE
  ======================================================= */

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    setMessage("");
    setError("");


    const selectedFile =
      event.target.files?.[0] ?? null;


    if (!selectedFile) {

      setFile(null);

      return;

    }


    if (
      !ALLOWED_TYPES.includes(
        selectedFile.type
      )
    ) {

      setFile(null);

      setError(
        "Please upload a JPG or PNG image."
      );

      return;

    }


    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {

      setFile(null);

      setError(
        "File size must be 5 MB or less."
      );

      return;

    }


    setFile(
      selectedFile
    );

  }


  /* =======================================================
     UPLOAD
  ======================================================= */

  async function handleUpload() {

    if (!file) {

      setError(
        "Please select a payment proof first."
      );

      return;

    }


    setLoading(true);
    setMessage("");
    setError("");


    try {

      /* -----------------------------------------------------
         AUTH
      ----------------------------------------------------- */

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();


      if (
        userError ||
        !user
      ) {

        throw new Error(
          "You must be logged in."
        );

      }


      /* -----------------------------------------------------
         FILE NAME
      ----------------------------------------------------- */

      const extension =
        file.type === "image/png"
          ? "png"
          : "jpg";


      const fileName =
        `${crypto.randomUUID()}.${extension}`;


      const path =
        `${user.id}/${orderId}/${fileName}`;


      /* -----------------------------------------------------
         UPLOAD TO STORAGE
      ----------------------------------------------------- */

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from("payment-proofs")
          .upload(
            path,
            file,
            {
              cacheControl:
                "3600",

              contentType:
                file.type,

              upsert:
                false,
            }
          );


      if (uploadError) {

        throw uploadError;

      }


      /* -----------------------------------------------------
         SAVE PATH TO ORDERS
      ----------------------------------------------------- */

      const result =
        await savePaymentProofAction(
          orderId,
          path
        );


      if (!result.success) {

        await supabase.storage
          .from("payment-proofs")
          .remove([
            path,
          ]);


        throw new Error(
          result.message
        );

      }


      /* =====================================================
        REDIRECT TO MY ORDERS
      ===================================================== */

router.push(
  "/account/orders"
);


    } catch (uploadError) {

      console.error(
        "Failed to upload payment proof:",
        uploadError
      );


      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload payment proof."
      );

    } finally {

      setLoading(false);

    }

  }


  return (

    <section
      className="
        rounded-2xl
        border
        border-stone-200
        p-6
      "
    >

      <h2
        className="
          mb-2
          text-lg
          font-medium
        "
      >
        Payment Proof
      </h2>


      <p
        className="
          mb-6
          text-sm
          leading-6
          text-neutral-500
        "
      >
        Upload a clear screenshot or photo
        of your bank transfer receipt.
      </p>


      {/* ===================================================
          EXISTING PAYMENT PROOF
      =================================================== */}

      {paymentProofPath && (

        <div
          className="
            mb-6
            rounded-xl
            border
            border-stone-200
            bg-stone-50
            p-4
          "
        >

          <div
            className="
              mb-4
              flex
              items-center
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  font-medium
                "
              >
                Payment proof uploaded
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-neutral-500
                "
              >
                Your payment proof is waiting
                for verification.
              </p>

            </div>


            <span
              className="
                rounded-full
                border
                border-stone-300
                px-3
                py-1
                text-xs
                uppercase
                tracking-wider
              "
            >
              Pending Review
            </span>

          </div>


          {proofLoading && (

            <div
              className="
                flex
                min-h-40
                items-center
                justify-center
                rounded-lg
                bg-white
                text-sm
                text-neutral-500
              "
            >
              Loading payment proof...
            </div>

          )}


          {!proofLoading && proofUrl && (

            <div className="space-y-4">

              <div
  className="
    overflow-hidden
    rounded-lg
    border
    border-stone-200
    bg-white
    p-3
  "
>

  <img
    src={proofUrl}
    alt="Payment proof"
    className="
      mx-auto
      block
      max-h-[280px]
      max-w-[320px]
      w-auto
      object-contain
    "
  />

</div>


              <a
                href={proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  block
                  text-center
                  text-sm
                  font-medium
                  underline
                  underline-offset-4
                "
              >
                View payment proof
              </a>

            </div>

          )}


          {!proofLoading && !proofUrl && (

            <p
              className="
                text-sm
                text-red-600
              "
            >
              Unable to load payment proof.
            </p>

          )}

        </div>

      )}


{/* ===================================================
    UPLOAD / REPLACE PAYMENT PROOF
=================================================== */}

<div className="space-y-4">

  <label
    htmlFor="payment-proof"
    className="
      flex
      min-h-32
      cursor-pointer
      flex-col
      items-center
      justify-center
      rounded-xl
      border
      border-dashed
      border-stone-300
      px-6
      py-8
      text-center
      transition
      hover:border-black
    "
  >

    <span
      className="
        text-sm
        font-medium
      "
    >
      {file
        ? file.name
        : paymentProofPath
          ? "Choose a new payment proof"
          : "Choose payment proof"}
    </span>


    <span
      className="
        mt-2
        text-xs
        text-neutral-500
      "
    >
      JPG or PNG · Max 5 MB
    </span>


    <input
      id="payment-proof"
      type="file"
      accept="image/jpeg,image/png"
      onChange={
        handleFileChange
      }
      className="hidden"
    />

  </label>


  {error && (

    <p
      className="
        text-sm
        text-red-600
      "
    >
      {error}
    </p>

  )}


  {message && (

    <p
      className="
        text-sm
        text-green-600
      "
    >
      {message}
    </p>

  )}


  <button
    type="button"
    onClick={
      handleUpload
    }
    disabled={
      loading ||
      !file
    }
    className="
      w-full
      rounded-full
      bg-neutral-900
      px-6
      py-4
      text-xs
      font-medium
      uppercase
      tracking-[0.2em]
      text-white
      transition
      hover:bg-black
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
  >

    {loading
      ? "Uploading..."
      : paymentProofPath
        ? "Replace Payment Proof"
        : "Upload Payment Proof"}

  </button>

</div>

    </section>

  );

}