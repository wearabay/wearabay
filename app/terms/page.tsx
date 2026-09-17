import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | wearabay",
  description:
    "Terms and Conditions for using the wearabay online store.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-3xl px-6 py-16 md:px-8 md:py-24">
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-neutral-500 transition hover:text-black"
          >
            ← Back to wearabay
          </Link>

          <h1 className="mt-8 text-3xl font-light tracking-tight text-black md:text-4xl">
            Terms & Conditions
          </h1>

          <p className="mt-4 text-sm text-neutral-500">
            Last updated: September 17, 2026
          </p>
        </div>

        <div className="space-y-10 text-sm leading-7 text-neutral-700">
          <section>
            <h2 className="text-lg font-medium text-black">
              Using Our Store
            </h2>

            <p className="mt-3">
              By using the wearabay website, you agree to use the service
              lawfully and to provide accurate information when creating an
              account or placing an order.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">
              Products and Availability
            </h2>

            <p className="mt-3">
              Product information, prices, availability, images, and other
              details may change from time to time. An order is subject to
              product availability and successful processing by wearabay.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">
              Orders and Payment
            </h2>

            <p className="mt-3">
              Customers are responsible for providing accurate contact and
              delivery information. Orders using payment methods that require
              payment verification may remain pending until the required
              payment information or proof has been reviewed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">
              Payment Verification
            </h2>

            <p className="mt-3">
              Where payment proof is required, customers must provide valid
              payment information or proof through the available order
              process. wearabay may review submitted payment proof before
              confirming an order.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">
              Shipping and Delivery
            </h2>

            <p className="mt-3">
              Customers are responsible for ensuring that their delivery
              information is complete and accurate. Delivery timing may depend
              on order processing, courier services, destination, and other
              circumstances outside the direct control of wearabay.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">
              Reviews and Customer Content
            </h2>

            <p className="mt-3">
              Customers may submit reviews where the relevant order and product
              conditions are satisfied. Submitted content must be relevant,
              lawful, and not contain abusive, misleading, or inappropriate
              material.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">
              Changes to These Terms
            </h2>

            <p className="mt-3">
              wearabay may update these Terms & Conditions when necessary to
              reflect changes to the store, services, or operating practices.
              Updated terms will be published on this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">Contact</h2>

            <p className="mt-3">
              If you have questions about these Terms & Conditions, please
              contact us through the wearabay contact page.
            </p>

            <Link
              href="/contact"
              className="mt-4 inline-block underline underline-offset-4 transition hover:text-black"
            >
              Contact wearabay
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}