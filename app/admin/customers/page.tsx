import { redirect } from "next/navigation";

import Container from "@/components/ui/Container";

import { getAdminUser } from "@/lib/admin";

import {
  getAdminCustomers,
} from "@/lib/admin-customers";

import CustomersTable from "./CustomersTable";


export default async function AdminCustomersPage() {

  const admin =
    await getAdminUser();


  if (!admin) {

    redirect("/account");

  }


  const customers =
    await getAdminCustomers();


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
              Customers
            </h1>


            <p
              className="
                mt-3
                text-sm
                text-neutral-500
              "
            >
              View customer accounts and order activity.
            </p>

          </div>


          {/* =================================================
              CUSTOMER LIST
          ================================================= */}

          <section>

            <div
              className="
                mb-5
                flex
                items-center
                justify-between
                gap-6
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
                  Customer Directory
                </p>


                <p
                  className="
                    mt-2
                    text-sm
                    text-neutral-500
                  "
                >
                  {customers.length}{" "}
                  {customers.length === 1
                    ? "customer"
                    : "customers"}
                </p>

              </div>


              <a
                href="/admin/customers/export"
                className="
                  shrink-0
                  rounded-full
                  border
                  border-neutral-300
                  px-5
                  py-2.5
                  text-xs
                  uppercase
                  tracking-[0.18em]
                  text-neutral-700
                  transition
                  hover:border-neutral-900
                  hover:text-neutral-900
                "
              >
                Export Customers
              </a>

            </div>


            <CustomersTable
              customers={
                customers
              }
            />

          </section>

        </div>

      </Container>

    </main>

  );

}