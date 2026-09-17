import Link from "next/link";

import type {
  AdminCustomer,
} from "@/lib/admin-customers";


type Props = {
  customers: AdminCustomer[];
};


function formatDate(
  value: string
) {

  if (!value) {
    return "—";
  }


  return new Date(
    value
  ).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

}


function formatPrice(
  value: number
) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(
    value
  );

}


export default function CustomersTable({
  customers,
}: Props) {

  if (
    customers.length ===
    0
  ) {

    return (

      <div
        className="
          rounded-2xl
          border
          border-stone-200
          p-10
          text-center
        "
      >

        <p
          className="
            text-sm
            text-neutral-500
          "
        >
          No customers found.
        </p>

      </div>

    );

  }


  return (

    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-stone-200
      "
    >

      {/* =================================================
          DESKTOP TABLE
          XL+ only
      ================================================= */}

      <div className="hidden overflow-x-auto xl:block">

        <table
          className="
            w-full
            min-w-[900px]
            border-collapse
          "
        >

          <thead>

            <tr
              className="
                border-b
                border-stone-200
                text-left
              "
            >

              <th
                className="
                  px-6
                  py-4
                  text-[10px]
                  font-normal
                  uppercase
                  tracking-[0.18em]
                  text-neutral-500
                "
              >
                Customer
              </th>


              <th
                className="
                  px-6
                  py-4
                  text-[10px]
                  font-normal
                  uppercase
                  tracking-[0.18em]
                  text-neutral-500
                "
              >
                Phone
              </th>


              <th
                className="
                  px-6
                  py-4
                  text-[10px]
                  font-normal
                  uppercase
                  tracking-[0.18em]
                  text-neutral-500
                "
              >
                Joined
              </th>


              <th
                className="
                  px-6
                  py-4
                  text-[10px]
                  font-normal
                  uppercase
                  tracking-[0.18em]
                  text-neutral-500
                "
              >
                Orders
              </th>


              <th
                className="
                  px-6
                  py-4
                  text-[10px]
                  font-normal
                  uppercase
                  tracking-[0.18em]
                  text-neutral-500
                "
              >
                Total Spent
              </th>


              <th
                className="
                  px-6
                  py-4
                  text-[10px]
                  font-normal
                  uppercase
                  tracking-[0.18em]
                  text-neutral-500
                "
              >
                Role
              </th>

            </tr>

          </thead>


          <tbody>

            {customers.map(
              (customer) => (

                <tr
                  key={
                    customer.id
                  }
                  className="
                    border-b
                    border-stone-200
                    last:border-b-0
                    transition-colors
                    hover:bg-neutral-50
                  "
                >

                  <td
                    className="
                      px-6
                      py-5
                    "
                  >

                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="
                        block
                        transition
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-medium
                          text-neutral-900
                        "
                      >
                        {
                          customer.name
                        }
                      </p>


                      <p
                        className="
                          mt-1
                          text-xs
                          text-neutral-500
                        "
                      >
                        {
                          customer.email ||
                          "No email available"
                        }
                      </p>

                    </Link>

                  </td>


                  <td
                    className="
                      px-6
                      py-5
                      text-sm
                      text-neutral-600
                    "
                  >

                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="block"
                    >
                      {
                        customer.phone ||
                        "—"
                      }
                    </Link>

                  </td>


                  <td
                    className="
                      px-6
                      py-5
                      text-sm
                      text-neutral-600
                    "
                  >

                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="block"
                    >
                      {formatDate(
                        customer.joinedAt
                      )}
                    </Link>

                  </td>


                  <td
                    className="
                      px-6
                      py-5
                      text-sm
                      text-neutral-600
                    "
                  >

                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="block"
                    >
                      {
                        customer.orderCount
                      }
                    </Link>

                  </td>


                  <td
                    className="
                      px-6
                      py-5
                      text-sm
                      text-neutral-900
                    "
                  >

                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="block"
                    >
                      {formatPrice(
                        customer.totalSpent
                      )}
                    </Link>

                  </td>


                  <td
                    className="
                      px-6
                      py-5
                    "
                  >

                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="block"
                    >

                      <span
                        className="
                          inline-flex
                          rounded-full
                          bg-neutral-100
                          px-3
                          py-1
                          text-[10px]
                          uppercase
                          tracking-[0.15em]
                          text-neutral-600
                        "
                      >
                        {
                          customer.role
                        }
                      </span>

                    </Link>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>


      {/* =================================================
          MOBILE / IPAD CARDS
          BELOW XL
      ================================================= */}

      <div
        className="
          divide-y
          divide-stone-200
          xl:hidden
        "
      >

        {customers.map(
          (customer) => (

            <Link
              key={
                customer.id
              }
              href={`/admin/customers/${customer.id}`}
              className="
                block
                transition-colors
                hover:bg-neutral-50
              "
            >

              <article
                className="
                  p-6
                  sm:p-7
                "
              >

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >

                  <div className="min-w-0">

                    <p
                      className="
                        text-sm
                        font-medium
                        text-neutral-900
                      "
                    >
                      {
                        customer.name
                      }
                    </p>


                    <p
                      className="
                        mt-1
                        break-all
                        text-xs
                        text-neutral-500
                      "
                    >
                      {
                        customer.email ||
                        "No email available"
                      }
                    </p>

                  </div>


                  <span
                    className="
                      shrink-0
                      rounded-full
                      bg-neutral-100
                      px-3
                      py-1
                      text-[10px]
                      uppercase
                      tracking-[0.15em]
                      text-neutral-600
                    "
                  >
                    {
                      customer.role
                    }
                  </span>

                </div>


                <div
                  className="
                    mt-6
                    grid
                    grid-cols-2
                    gap-x-6
                    gap-y-5
                  "
                >

                  <div>

                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.15em]
                        text-neutral-400
                      "
                    >
                      Phone
                    </p>


                    <p
                      className="
                        mt-2
                        text-sm
                        text-neutral-600
                      "
                    >
                      {
                        customer.phone ||
                        "—"
                      }
                    </p>

                  </div>


                  <div>

                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.15em]
                        text-neutral-400
                      "
                    >
                      Joined
                    </p>


                    <p
                      className="
                        mt-2
                        text-sm
                        text-neutral-600
                      "
                    >
                      {formatDate(
                        customer.joinedAt
                      )}
                    </p>

                  </div>


                  <div>

                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.15em]
                        text-neutral-400
                      "
                    >
                      Orders
                    </p>


                    <p
                      className="
                        mt-2
                        text-sm
                        text-neutral-600
                      "
                    >
                      {
                        customer.orderCount
                      }
                    </p>

                  </div>


                  <div>

                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.15em]
                        text-neutral-400
                      "
                    >
                      Total Spent
                    </p>


                    <p
                      className="
                        mt-2
                        text-sm
                        text-neutral-900
                      "
                    >
                      {formatPrice(
                        customer.totalSpent
                      )}
                    </p>

                  </div>

                </div>

              </article>

            </Link>

          )
        )}

      </div>

    </div>

  );

}