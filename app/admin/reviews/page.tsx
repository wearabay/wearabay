import { redirect } from "next/navigation";

import Container from "@/components/ui/Container";

import { getAdminUser } from "@/lib/admin";

import {
  getAdminReviews,
} from "@/lib/admin-reviews";

import ReviewsTable from "./ReviewsTable";


export default async function AdminReviewsPage() {

  const admin =
    await getAdminUser();


  if (!admin) {

    redirect("/account");

  }


  const reviews =
    await getAdminReviews();


  return (

    <main>

      <Container className="py-24">

        <div className="space-y-10">

          {/* =================================================
              HEADER
          ================================================= */}

          <div>

            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-neutral-500
              "
            >
              Administration
            </p>


            <h1
              className="
                mt-3
                text-4xl
                font-light
              "
            >
              Reviews
            </h1>


            <p
              className="
                mt-3
                text-sm
                text-neutral-500
              "
            >
              Review and moderate customer feedback.
            </p>

          </div>


          {/* =================================================
              REVIEW QUEUE
          ================================================= */}

          <section>

            <div
              className="
                mb-5
                flex
                items-center
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    text-neutral-500
                  "
                >
                  Review Queue
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    text-neutral-500
                  "
                >
                  {reviews.length}{" "}
                  {reviews.length === 1
                    ? "review"
                    : "reviews"}
                </p>

              </div>

            </div>


            <ReviewsTable
              reviews={reviews}
            />

          </section>

        </div>

      </Container>

    </main>

  );

}