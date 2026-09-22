"use client";

import { useActionState } from "react";

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

function Field({
  id,
  label,
  description,
  children,
}: {
  id?: string;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 border-b border-stone-200 py-6 last:border-b-0 md:grid-cols-[180px_minmax(0,1fr)] md:gap-8">
      <div>
        <label
          htmlFor={id}
          className="text-[10px] uppercase tracking-[0.18em] text-neutral-500"
        >
          {label}
        </label>

        {description && (
          <p className="mt-2 text-xs leading-5 text-neutral-400">
            {description}
          </p>
        )}
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  );
}

const inputClassName = `
  w-full
  rounded-xl
  border
  border-stone-200
  bg-stone-50
  px-4
  py-3
  text-sm
  text-neutral-900
  outline-none
  transition
  placeholder:text-neutral-400
  focus:border-neutral-900
  focus:bg-white
`;

const textareaClassName = `
  w-full
  resize-y
  rounded-xl
  border
  border-stone-200
  bg-stone-50
  px-4
  py-3
  text-sm
  leading-6
  text-neutral-900
  outline-none
  transition
  placeholder:text-neutral-400
  focus:border-neutral-900
  focus:bg-white
`;

export default function SettingsForm({
  initialSettings,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    saveStoreSettings,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* STORE INFORMATION */}

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
            Store Information
          </p>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Information used across the storefront.
          </p>
        </div>

        <div className="px-5 sm:px-6">
          <Field id="storeName" label="Store Name">
            <input
              id="storeName"
              name="storeName"
              type="text"
              defaultValue={initialSettings.storeName}
              required
              className={inputClassName}
            />
          </Field>

          <Field id="tagline" label="Tagline">
            <input
              id="tagline"
              name="tagline"
              type="text"
              defaultValue={initialSettings.tagline}
              className={inputClassName}
            />
          </Field>

          <Field id="storeEmail" label="Store Email">
            <input
              id="storeEmail"
              name="storeEmail"
              type="email"
              defaultValue={initialSettings.storeEmail}
              required
              className={inputClassName}
            />
          </Field>

          <Field
            id="whatsapp"
            label="WhatsApp"
            description="Use the international phone number format."
          >
            <input
              id="whatsapp"
              name="whatsapp"
              type="text"
              inputMode="tel"
              defaultValue={initialSettings.whatsapp}
              placeholder="628123456789"
              className={inputClassName}
            />
          </Field>

          <Field id="instagram" label="Instagram">
            <input
              id="instagram"
              name="instagram"
              type="url"
              defaultValue={initialSettings.instagram}
              placeholder="https://instagram.com/..."
              className={inputClassName}
            />
          </Field>

          <Field id="tiktok" label="TikTok">
            <input
              id="tiktok"
              name="tiktok"
              type="url"
              defaultValue={initialSettings.tiktok}
              placeholder="https://tiktok.com/@..."
              className={inputClassName}
            />
          </Field>
        </div>
      </section>

      {/* STOREFRONT */}

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
            Storefront
          </p>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Control selected messaging displayed on the storefront.
          </p>
        </div>

        <div className="px-5 sm:px-6">
          <Field id="announcement" label="Announcement">
            <textarea
              id="announcement"
              name="announcement"
              defaultValue={initialSettings.announcement}
              rows={4}
              placeholder="Example: Free shipping on orders over Rp1.500.000"
              className={textareaClassName}
            />
          </Field>

          <div className="grid gap-3 border-b border-stone-200 py-6 md:grid-cols-[180px_minmax(0,1fr)] md:gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                Announcement Status
              </p>

              <p className="mt-2 text-xs leading-5 text-neutral-400">
                Control whether the announcement appears on the storefront.
              </p>
            </div>

            <label className="flex min-h-11 items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-neutral-700 transition has-[:focus-visible]:border-neutral-900">
              <input
                name="announcementEnabled"
                type="checkbox"
                defaultChecked={initialSettings.announcementEnabled}
                className="h-4 w-4 accent-neutral-900"
              />

              <span>Show announcement on storefront</span>
            </label>
          </div>

          <Field id="footerText" label="Footer Text">
            <textarea
              id="footerText"
              name="footerText"
              defaultValue={initialSettings.footerText}
              rows={4}
              placeholder="Optional footer message"
              className={textareaClassName}
            />
          </Field>
        </div>
      </section>

      {/* SAVE */}

      <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
        <div aria-live="polite" className="min-h-5 min-w-0">
          {state.message && (
            <p
              className={[
                "text-sm",
                state.success ? "text-neutral-700" : "text-red-600",
              ].join(" ")}
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
            min-h-11
            w-full
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
            sm:w-auto
          "
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}