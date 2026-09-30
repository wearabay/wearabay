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

  const response =
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
    "/admin",
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
   * Unauthenticated users cannot access
   * protected account or admin routes.
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


  /*
   * Admin Workspace guard.
   *
   * The proxy checks the user's profile role
   * before the Admin page is allowed to render.
   *
   * Customer accounts are redirected to /account
   * before AdminShell can be displayed.
   */

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith(
      "/admin/"
    );


  if (
    isAdminRoute &&
    claimsData?.claims
  ) {

    const {
      data: profile,
      error: profileError,
    } =
      await supabase
        .from("profiles")
        .select("role")
        .eq(
          "id",
          claimsData.claims.sub
        )
        .maybeSingle();


    const isAdmin =
      !profileError &&
      (
        profile?.role === "admin" ||
        profile?.role === "super_admin"
      );


    if (!isAdmin) {

      return NextResponse.redirect(
        new URL(
          "/account",
          request.url
        )
      );

    }

  }


  return response;

}