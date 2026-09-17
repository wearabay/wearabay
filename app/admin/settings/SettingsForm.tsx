"use client";

import {
  useActionState,
} from "react";

import {
  saveStoreSettings,
  type SaveSettingsState,
} from "./actions";


type Props = {
  initialSettings: {
    storeName: string;
    tagline: string;
    storeEmail: string;
    whatsapp: string;
    instagram: string;
    tiktok: string;
    announcement: string;
    announcementEnabled: boolean;
    footerText: string;
  };
};


const initialState: SaveSettingsState = {
  success: false,
  message: "",
};


export default function SettingsForm({
  initialSettings,
}: Props) {

  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    saveStoreSettings,
    initialState,
  );


  return (

    <form
      action={formAction}
      className="space-y-16"
    >

      {/* =================================================
          STORE INFORMATION
      ================================================= */}

      <section>

        <div className="mb-6">

          <p
            className="
              text-xs
              uppercase
              tracking-[0.3em]
              text-neutral-500
            "
          >
            Store Information
          </p>


          <p
            className="
              mt-2
              text-sm
              text-neutral-500
            "
          >
            Information used across the storefront.
          </p>

        </div>


        <div
          className="
            border-y
            border-neutral-200
          "
        >

          {/* Store Name */}

          <div
            className="
              grid
              gap-3
              border-b
              border-neutral-200
              py-6
              md:grid-cols-[180px_1fr]
              md:gap-8
            "
          >

            <label
              htmlFor="storeName"
              className="
                text-xs
                uppercase
                tracking-[0.18em]
                text-neutral-500
              "
            >
              Store Name
            </label>


            <input
              id="storeName"
              name="storeName"
              type="text"
              defaultValue={initialSettings.storeName}
              required
              className="
                w-full
                border-0
                border-b
                border-neutral-300
                bg-transparent
                px-0
                py-2
                text-sm
                text-neutral-900
                outline-none
                transition
                focus:border-neutral-900
              "
            />

          </div>


          {/* Tagline */}

          <div
            className="
              grid
              gap-3
              border-b
              border-neutral-200
              py-6
              md:grid-cols-[180px_1fr]
              md:gap-8
            "
          >

            <label
              htmlFor="tagline"
              className="
                text-xs
                uppercase
                tracking-[0.18em]
                text-neutral-500
              "
            >
              Tagline
            </label>


            <input
              id="tagline"
              name="tagline"
              type="text"
              defaultValue={initialSettings.tagline}
              className="
                w-full
                border-0
                border-b
                border-neutral-300
                bg-transparent
                px-0
                py-2
                text-sm
                text-neutral-900
                outline-none
                transition
                focus:border-neutral-900
              "
            />

          </div>


          {/* Email */}

          <div
            className="
              grid
              gap-3
              border-b
              border-neutral-200
              py-6
              md:grid-cols-[180px_1fr]
              md:gap-8
            "
          >

            <label
              htmlFor="storeEmail"
              className="
                text-xs
                uppercase
                tracking-[0.18em]
                text-neutral-500
              "
            >
              Store Email
            </label>


            <input
              id="storeEmail"
              name="storeEmail"
              type="email"
              defaultValue={initialSettings.storeEmail}
              required
              className="
                w-full
                border-0
                border-b
                border-neutral-300
                bg-transparent
                px-0
                py-2
                text-sm
                text-neutral-900
                outline-none
                transition
                focus:border-neutral-900
              "
            />

          </div>


          {/* WhatsApp */}

          <div
            className="
              grid
              gap-3
              border-b
              border-neutral-200
              py-6
              md:grid-cols-[180px_1fr]
              md:gap-8
            "
          >

            <label
              htmlFor="whatsapp"
              className="
                text-xs
                uppercase
                tracking-[0.18em]
                text-neutral-500
              "
            >
              WhatsApp
            </label>


            <input
              id="whatsapp"
              name="whatsapp"
              type="text"
              inputMode="tel"
              defaultValue={initialSettings.whatsapp}
              placeholder="628123456789"
              className="
                w-full
                border-0
                border-b
                border-neutral-300
                bg-transparent
                px-0
                py-2
                text-sm
                text-neutral-900
                outline-none
                transition
                focus:border-neutral-900
              "
            />

          </div>


          {/* Instagram */}

          <div
            className="
              grid
              gap-3
              border-b
              border-neutral-200
              py-6
              md:grid-cols-[180px_1fr]
              md:gap-8
            "
          >

            <label
              htmlFor="instagram"
              className="
                text-xs
                uppercase
                tracking-[0.18em]
                text-neutral-500
              "
            >
              Instagram
            </label>


            <input
              id="instagram"
              name="instagram"
              type="url"
              defaultValue={initialSettings.instagram}
              placeholder="https://instagram.com/..."
              className="
                w-full
                border-0
                border-b
                border-neutral-300
                bg-transparent
                px-0
                py-2
                text-sm
                text-neutral-900
                outline-none
                transition
                focus:border-neutral-900
              "
            />

          </div>


          {/* TikTok */}

          <div
            className="
              grid
              gap-3
              py-6
              md:grid-cols-[180px_1fr]
              md:gap-8
            "
          >

            <label
              htmlFor="tiktok"
              className="
                text-xs
                uppercase
                tracking-[0.18em]
                text-neutral-500
              "
            >
              TikTok
            </label>


            <input
              id="tiktok"
              name="tiktok"
              type="url"
              defaultValue={initialSettings.tiktok}
              placeholder="https://tiktok.com/@..."
              className="
                w-full
                border-0
                border-b
                border-neutral-300
                bg-transparent
                px-0
                py-2
                text-sm
                text-neutral-900
                outline-none
                transition
                focus:border-neutral-900
              "
            />

          </div>

        </div>

      </section>


      {/* =================================================
          STOREFRONT
      ================================================= */}

      <section>

        <div className="mb-6">

          <p
            className="
              text-xs
              uppercase
              tracking-[0.3em]
              text-neutral-500
            "
          >
            Storefront
          </p>


          <p
            className="
              mt-2
              text-sm
              text-neutral-500
            "
          >
            Control selected messaging displayed on the storefront.
          </p>

        </div>


        <div
          className="
            border-y
            border-neutral-200
          "
        >

          {/* Announcement */}

          <div
            className="
              grid
              gap-3
              border-b
              border-neutral-200
              py-6
              md:grid-cols-[180px_1fr]
              md:gap-8
            "
          >

            <label
              htmlFor="announcement"
              className="
                text-xs
                uppercase
                tracking-[0.18em]
                text-neutral-500
              "
            >
              Announcement
            </label>


            <textarea
              id="announcement"
              name="announcement"
              defaultValue={initialSettings.announcement}
              rows={3}
              placeholder="Example: Free shipping on orders over Rp1.500.000"
              className="
                w-full
                resize-y
                border
                border-neutral-300
                bg-transparent
                px-4
                py-3
                text-sm
                text-neutral-900
                outline-none
                transition
                focus:border-neutral-900
              "
            />

          </div>


          {/* Announcement Enabled */}

          <div
            className="
              grid
              gap-4
              border-b
              border-neutral-200
              py-6
              md:grid-cols-[180px_1fr]
              md:gap-8
            "
          >

            <p
              className="
                text-xs
                uppercase
                tracking-[0.18em]
                text-neutral-500
              "
            >
              Announcement Status
            </p>


            <label
              className="
                flex
                items-center
                gap-3
                text-sm
                text-neutral-700
              "
            >

              <input
                name="announcementEnabled"
                type="checkbox"
                defaultChecked={
                  initialSettings.announcementEnabled
                }
                className="
                  h-4
                  w-4
                  accent-neutral-900
                "
              />


              <span>
                Show announcement on storefront
              </span>

            </label>

          </div>


          {/* Footer Text */}

          <div
            className="
              grid
              gap-3
              py-6
              md:grid-cols-[180px_1fr]
              md:gap-8
            "
          >

            <label
              htmlFor="footerText"
              className="
                text-xs
                uppercase
                tracking-[0.18em]
                text-neutral-500
              "
            >
              Footer Text
            </label>


            <textarea
              id="footerText"
              name="footerText"
              defaultValue={initialSettings.footerText}
              rows={3}
              placeholder="Optional footer message"
              className="
                w-full
                resize-y
                border
                border-neutral-300
                bg-transparent
                px-4
                py-3
                text-sm
                text-neutral-900
                outline-none
                transition
                focus:border-neutral-900
              "
            />

          </div>

        </div>

      </section>


      {/* =================================================
          SAVE
      ================================================= */}

      <div
        className="
          flex
          flex-col
          gap-4
          border-t
          border-neutral-200
          pt-8
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div
          aria-live="polite"
          className="min-h-5"
        >

          {state.message && (

            <p
              className={`
                text-sm
                ${
                  state.success
                    ? "text-neutral-700"
                    : "text-red-600"
                }
              `}
            >
              {state.message}
            </p>

          )}

        </div>


        <button
          type="submit"
          disabled={isPending}
          className="
            inline-flex
            items-center
            justify-center
            rounded-full
            bg-neutral-900
            px-7
            py-3
            text-xs
            uppercase
            tracking-[0.18em]
            text-white
            transition
            hover:bg-neutral-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {isPending
            ? "Saving..."
            : "Save Changes"}
        </button>

      </div>

    </form>

  );

}