import { redirect } from "next/navigation";

import Container from "@/components/ui/Container";

import { getAdminUser } from "@/lib/admin";


export default async function AdminPage() {

  const admin = await getAdminUser();

  if (!admin) {
    redirect("/account");
  }

  return (
    <main>
      <Container className="py-24">

        <div className="space-y-10">

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
              Admin Dashboard
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              Welcome back, {admin.fullName}.
            </p>

          </div>


          <div className="grid gap-6 md:grid-cols-3">

            <div
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >

              <p className="text-xs uppercase tracking-widest text-neutral-500">
                Orders
              </p>

              <p className="mt-3 text-3xl font-light">
                —
              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >

              <p className="text-xs uppercase tracking-widest text-neutral-500">
                Products
              </p>

              <p className="mt-3 text-3xl font-light">
                —
              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >

              <p className="text-xs uppercase tracking-widest text-neutral-500">
                Customers
              </p>

              <p className="mt-3 text-3xl font-light">
                —
              </p>

            </div>

          </div>

        </div>

      </Container>
    </main>
  );
}