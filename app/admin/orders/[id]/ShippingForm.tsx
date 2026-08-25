"use client";

import {
  useEffect,
  useState,
  useTransition,
} from "react";

import {
  updateAdminShippingAction,
} from "./actions";


type Props = {
  orderId: string;

  status: string;

  courier: string | null;

  trackingNumber: string | null;
};


/* =========================================================
   COURIER OPTIONS
========================================================= */

const courierOptions = [
  "J&T",
  "JNE",
  "SiCepat",
  "AnterAja",
  "POS Indonesia",
  "Lainnya",
];


/* =========================================================
   COURIER SELECT
========================================================= */

type CourierSelectProps = {

  value: string;

  options: string[];

  disabled?: boolean;

  open: boolean;

  onToggle: () => void;

  onSelect: (
    value: string
  ) => void;

};


function CourierSelect({
  value,
  options,
  disabled,
  open,
  onToggle,
  onSelect,
}: CourierSelectProps) {

  return (

    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-stone-300
        bg-white
      "
    >

      {/* =================================================
          SELECTED VALUE
      ================================================= */}

      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className="
          flex
          h-12
          w-full
          items-center
          justify-between
          bg-white
          px-4
          text-left
          outline-none
          transition
          hover:bg-stone-50
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >

        <span
          className={`
            transition-all
            ${
              value
                ? `
                  text-[15px]
                  font-bold
                  text-black
                `
                : `
                  text-sm
                  font-normal
                  text-neutral-400
                `
            }
          `}
        >
          {value || "Select courier"}
        </span>


        <span
          className={`
            text-xs
            text-neutral-400
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        >
          ↓
        </span>

      </button>


      {/* =================================================
          INLINE OPTIONS
      ================================================= */}

      {open && (

        <div
          className="
            border-t
            border-stone-200
            bg-white
          "
        >

          {options.map(
            (option) => {

              const selected =
                option === value;


              return (

                <button
                  key={option}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onSelect(option)
                  }
                  className="
                    flex
                    min-h-12
                    w-full
                    items-center
                    justify-between
                    border-b
                    border-stone-100
                    px-4
                    text-left
                    last:border-b-0
                    transition
                    hover:bg-stone-50
                    disabled:cursor-not-allowed
                  "
                >

                  <span
                    className={`
                      transition-all
                      ${
                        selected
                          ? `
                            text-[15px]
                            font-extrabold
                            text-black
                          `
                          : `
                            text-sm
                            font-normal
                            text-neutral-600
                          `
                      }
                    `}
                  >
                    {option}
                  </span>


                  {selected && (

                    <span
                      className="
                        text-base
                        font-extrabold
                        text-black
                      "
                    >
                      ✓
                    </span>

                  )}

                </button>

              );

            }
          )}

        </div>

      )}

    </div>

  );

}


/* =========================================================
   MAIN
========================================================= */

export default function ShippingForm({
  orderId,
  status,
  courier,
  trackingNumber,
}: Props) {


  /* =======================================================
     COURIER STATE
  ======================================================= */

  const [
    selectedCourier,
    setSelectedCourier,
  ] =
    useState<string>(
      courier &&
      courierOptions.includes(courier)
        ? courier
        : courier
          ? "Lainnya"
          : ""
    );


  /* =======================================================
     CUSTOM COURIER
  ======================================================= */

  const [
    customCourier,
    setCustomCourier,
  ] =
    useState<string>(
      courier &&
      !courierOptions.includes(courier)
        ? courier
        : ""
    );


  /* =======================================================
     TRACKING NUMBER
  ======================================================= */

  const [
    currentTrackingNumber,
    setCurrentTrackingNumber,
  ] =
    useState<string>(
      trackingNumber ?? ""
    );


  /* =======================================================
     DROPDOWN
  ======================================================= */

  const [
    courierOpen,
    setCourierOpen,
  ] =
    useState(false);


  /* =======================================================
     TRANSITION
  ======================================================= */

  const [
    isPending,
    startTransition,
  ] =
    useTransition();


  /* =======================================================
     MESSAGE
  ======================================================= */

  const [
    message,
    setMessage,
  ] =
    useState("");


  /* =======================================================
   SHIPPING EDIT RULE

   Shipping information can only be edited
   while order is processing.

   Once shipped, shipping becomes a shipment record
   and cannot be modified from this workflow.
======================================================= */

const canEditShipping =
  status === "processing";


  /* =======================================================
     FINAL COURIER
  ======================================================= */

  const finalCourier =
    selectedCourier === "Lainnya"
      ? customCourier.trim()
      : selectedCourier;


  /* =======================================================
     CAN SUBMIT
  ======================================================= */

  const canSubmit =
    canEditShipping &&
    finalCourier.length > 0 &&
    currentTrackingNumber.trim().length > 0 &&
    !isPending;


  /* =======================================================
     CLOSE DROPDOWN OUTSIDE
  ======================================================= */

  useEffect(() => {

    function handleClickOutside(
      event: MouseEvent
    ) {

      const target =
        event.target as HTMLElement;


      if (
        !target.closest(
          "[data-courier-select]"
        )
      ) {

        setCourierOpen(
          false
        );

      }

    }


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  /* =======================================================
     COURIER SELECT
  ======================================================= */

  function handleCourierSelect(
    value: string
  ) {

    setSelectedCourier(
      value
    );


    setCourierOpen(
      false
    );


    setMessage("");

  }


  /* =======================================================
     SAVE SHIPPING
  ======================================================= */

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (!canSubmit) {

      return;

    }


    setMessage("");


    startTransition(
      async () => {

        try {

          const result =
            await updateAdminShippingAction(
              orderId,
              {
                courier:
                  finalCourier,

                trackingNumber:
                  currentTrackingNumber.trim(),
              }
            );


          if (!result.success) {

            setMessage(
              result.message
            );

            return;

          }


          setMessage(
            "Shipping information saved."
          );

        } catch (error) {

          console.error(
            "Save shipping failed:",
            error
          );


          setMessage(
            "Failed to save shipping information."
          );

        }

      }
    );

  }


  /* =========================================================
     RENDER
  ========================================================= */

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
        Shipping
      </h2>


      <p
        className="
          mb-6
          text-sm
          text-neutral-500
        "
      >
        {status === "processing"
  ? "Add shipping information before marking the order as shipped."
  : status === "shipped"
    ? "Shipping information is locked because the order has been shipped."
    : "Shipping information is locked for this order."
}
      </p>


      <form
        onSubmit={handleSubmit}
        className="
          space-y-6
        "
      >

        {/* =================================================
            COURIER
        ================================================= */}

        <div>

          <label
            className="
              mb-2
              block
              text-xs
              uppercase
              tracking-[0.2em]
              text-neutral-500
            "
          >
            Courier
          </label>


          <div
            data-courier-select
          >

            <CourierSelect

              value={
                selectedCourier
              }

              options={
                courierOptions
              }

              disabled={
                !canEditShipping ||
                isPending
              }

              open={
                courierOpen
              }

              onToggle={() => {

                if (
                  !canEditShipping ||
                  isPending
                ) {

                  return;

                }


                setCourierOpen(
                  (value) =>
                    !value
                );

              }}

              onSelect={
                handleCourierSelect
              }

            />

          </div>

        </div>


        {/* =================================================
            CUSTOM COURIER
        ================================================= */}

        {selectedCourier ===
          "Lainnya" && (

          <div>

            <label
              htmlFor="custom-courier"
              className="
                mb-2
                block
                text-xs
                uppercase
                tracking-[0.2em]
                text-neutral-500
              "
            >
              Courier Name
            </label>


            <input
              id="custom-courier"
              type="text"
              value={
                customCourier
              }
              disabled={
                !canEditShipping ||
                isPending
              }
              onChange={(event) => {

                setCustomCourier(
                  event.target.value
                );

                setMessage("");

              }}
              placeholder="Enter courier name"
              className="
                h-12
                w-full
                rounded-xl
                border
                border-stone-300
                bg-white
                px-4
                text-sm
                outline-none
                focus:border-black
                disabled:cursor-not-allowed
                disabled:bg-stone-50
                disabled:text-neutral-400
              "
            />

          </div>

        )}


        {/* =================================================
            TRACKING NUMBER
        ================================================= */}

        <div>

          <label
            htmlFor="tracking-number"
            className="
              mb-2
              block
              text-xs
              uppercase
              tracking-[0.2em]
              text-neutral-500
            "
          >
            Tracking Number
          </label>


          <input
            id="tracking-number"
            type="text"
            value={
              currentTrackingNumber
            }
            disabled={
              !canEditShipping ||
              isPending
            }
            onChange={(event) => {

              setCurrentTrackingNumber(
                event.target.value
              );

              setMessage("");

            }}
            placeholder="Enter tracking number"
            className="
              h-12
              w-full
              rounded-xl
              border
              border-stone-300
              bg-white
              px-4
              text-sm
              outline-none
              focus:border-black
              disabled:cursor-not-allowed
              disabled:bg-stone-50
              disabled:text-neutral-400
            "
          />

        </div>


        {/* =================================================
            SAVE SHIPPING
        ================================================= */}

        {canEditShipping && (

          <button
            type="submit"
            disabled={
              !canSubmit
            }
            className="
              inline-flex
              h-11
              items-center
              justify-center
              rounded-full
              bg-black
              px-6
              text-xs
              font-medium
              uppercase
              tracking-[0.15em]
              text-white
              transition
              hover:bg-neutral-800
              disabled:cursor-not-allowed
              disabled:bg-stone-300
            "
          >

            {isPending
              ? "Saving..."
              : "Save Shipping"}

          </button>

        )}


        {/* =================================================
            LOCKED
        ================================================= */}

        {!canEditShipping && (

          <p
            className="
              text-sm
              text-neutral-500
            "
          >
            Shipping information is locked because this order is{" "}
            <span className="font-medium">
              {status}
            </span>.
          </p>

        )}


        {/* =================================================
            MESSAGE
        ================================================= */}

        {!isPending &&
          message && (

          <p
            className="
              text-sm
              text-neutral-600
            "
          >
            {message}
          </p>

        )}

      </form>

    </section>

  );

}