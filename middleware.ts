import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/middleware";


export async function middleware(
  request: NextRequest
){

  const supabase = createClient(request);


  const {
    data:{
      session
    }
  } = await supabase.auth.getSession();



  const protectedRoutes = [
    "/account",
    "/account/profile",
    "/account/addresses",
    "/account/orders",
  ];



  const isProtected =
    protectedRoutes.some((route)=>
      request.nextUrl.pathname.startsWith(route)
    );



  if(
    isProtected &&
    !session
  ){

    return NextResponse.redirect(
      new URL(
        "/login",
        request.url
      )
    );

  }



  return NextResponse.next();

}



export const config = {

  matcher:[
    "/account/:path*"
  ],

};