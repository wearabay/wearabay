"use client";

import Link from "next/link";


type Props = {

  name: string;

  email: string;

};



const menu = [
  {
    title: "My Orders",
    description:
      "Track and manage your purchases.",
    href: "/account/orders",
  },

  {
    title: "Profile",
    description:
      "Manage your personal information.",
    href: "/account/profile",
  },

  {
    title: "Addresses",
    description:
      "Save your shipping addresses.",
    href: "/account/addresses",
  },

  {
    title: "Wishlist",
    description:
      "Your favorite collections.",
    href: "/wishlist",
  },
];



export default function AccountDashboard({
  name,
  email,
}: Props) {


  return (

    <div>


      <div className="mb-12">


        <p
          className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-neutral-500
          "
        >
          My Account
        </p>



        <h1
          className="
            mt-3
            text-4xl
            font-light
          "
        >

          Welcome Back, {name}

        </h1>



        <p className="mt-3 text-sm text-neutral-500">

          {email}

        </p>



      </div>




      <div
        className="
          grid
          gap-6
          md:grid-cols-2
        "
      >

        {menu.map((item)=>(

          <Link
            key={item.title}
            href={item.href}
            className="
              rounded-2xl
              border
              border-stone-200
              p-8
              transition
              hover:border-black
            "
          >

            <h2
              className="
                text-xl
                font-light
              "
            >
              {item.title}
            </h2>


            <p
              className="
                mt-3
                text-sm
                leading-6
                text-neutral-500
              "
            >
              {item.description}
            </p>


          </Link>

        ))}


      </div>


    </div>

  );

}