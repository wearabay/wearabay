import {
  createServerClient,
} from "@supabase/ssr";

import {
  NextRequest,
  NextResponse,
} from "next/server";


export async function updateSession(
  request: NextRequest
) {

  let response =
    NextResponse.next({
      request,
    });


  const supabase =
    createServerClient(

      process.env.NEXT_PUBLIC_SUPABASE_URL!,

      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

      {
        cookies: {

          getAll() {

            return request.cookies.getAll();

          },


          setAll(
            cookiesToSet
          ) {

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {

                request.cookies.set(
                  name,
                  value
                );


                response.cookies.set(
                  name,
                  value,
                  options
                );

              }
            );

          },

        },

      }
    );


  /*
   * Validate current Supabase auth.
   */

  const {
    data: claimsData,
  } =
    await supabase.auth.getClaims();


  const pathname =
    request.nextUrl.pathname;


  const protectedRoutes = [
    "/account",
    "/account/profile",
    "/account/addresses",
    "/account/orders",
  ];


  const isProtected =
    protectedRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(
          `${route}/`
        )
    );


  /*
   * getClaims() returns:
   *
   * {
   *   claims,
   *   header,
   *   signature
   * }
   *
   * or null.
   */

  if (
    isProtected &&
    !claimsData?.claims
  ) {

    return NextResponse.redirect(
      new URL(
        "/login",
        request.url
      )
    );

  }


  return response;

}