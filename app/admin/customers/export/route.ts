import { getAdminCustomers } from "@/lib/admin-customers";


function escapeCsvValue(
  value: unknown
): string {

  const text =
    value === null ||
    value === undefined
      ? ""
      : String(value);

  return `"${text.replaceAll('"', '""')}"`;

}


function formatDate(
  value: string
): string {

  if (!value) {
    return "";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }


  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

}


function formatPrice(
  value: number
): string {

  return new Intl.NumberFormat(
    "id-ID",
    {
      maximumFractionDigits: 0,
    }
  ).format(
    value
  );

}


export async function GET() {

  const customers =
    await getAdminCustomers();


  const headers = [
    "Customer ID",
    "Name",
    "Email",
    "Phone",
    "Joined",
    "Role",
    "Total Orders",
    "Total Spent",
  ];


  const rows =
    customers.map(
      (customer) => [

        customer.id,

        customer.name,

        customer.email,

        customer.phone,

        formatDate(
          customer.joinedAt
        ),

        customer.role,

        customer.orderCount,

        formatPrice(
          customer.totalSpent
        ),

      ]
    );


  const csv = [
    headers,
    ...rows,
  ]
    .map(
      (row) =>
        row
          .map(
            escapeCsvValue
          )
          .join(",")
    )
    .join("\r\n");


  const bom =
    "\uFEFF";


  return new Response(
    bom + csv,
    {
      status: 200,

      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",

        "Content-Disposition":
          'attachment; filename="wearabay-customers.csv"',
      },

    }
  );

}