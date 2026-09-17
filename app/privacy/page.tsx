import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | wearabay",
  description:
    "Privacy Policy for wearabay and information about how customer data is handled.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-neutral-500">
            Last updated: September 17, 2026
          </p>
        </div>

        <div className="space-y-10 text-sm leading-7 text-neutral-700">
          <section>
            <h2 className="text-lg font-medium text-black">
              Information We Collect
            </h2>

            <p className="mt-3">
              When you use wearabay, we may collect information that you
              provide when creating an account, placing an order, contacting
              us, or submitting a review. This may include your name, email
              address, phone number, shipping address, order information, and
              information you voluntarily provide to us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">
              How We Use Your Information
            </h2>

            <p className="mt-3">
              We use customer information to provide and manage our services,
              process orders, communicate about orders and customer requests,
              maintain account information, and improve the shopping
              experience.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">
              Payment Information
            </h2>

            <p className="mt-3">
              Payment-related information may be collected as necessary to
              process and verify orders. Payment proof uploaded through the
              website is handled as order-related information and is restricted
              according to the access controls of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">
              Information Sharing
            </h2>

            <p className="mt-3">
              We do not use customer information for purposes unrelated to
              operating the store and providing requested services. Information
              may be shared with service providers when necessary to operate
              the website, process orders, provide delivery services, or
              maintain the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">
              Data Security
            </h2>

            <p className="mt-3">
              We take reasonable technical and organizational measures to
              protect customer information. Access to account, order, and
              payment-related information is restricted according to the
              permissions required to operate the store.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">
              Your Account Information
            </h2>

            <p className="mt-3">
              If you have an account with wearabay, you can review and update
              available profile and address information through your account
              area. For privacy-related requests or questions, please contact
              us directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">Contact</h2>

            <p className="mt-3">
              If you have questions about this Privacy Policy or how your
              information is handled, please contact wearabay through our
              contact page.
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