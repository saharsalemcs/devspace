import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

const CUSTOMER_PROTECTED = ["/account", "/checkout"];
const ADMIN_PROTECTED = ["/admin"];

// Helper Function check if the current path need protection (wether the path is relative or absolute => /account/settings or /account => will return true)
function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Helper Function copy the cookies after supabase refreshes the token
function withCookiesFrom(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const { pathname } = request.nextUrl;

  const needsAuth =
    matches(pathname, CUSTOMER_PROTECTED) || matches(pathname, ADMIN_PROTECTED);

  // claims => data in the login cookies
  if (needsAuth && !data?.claims) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withCookiesFrom(response, NextResponse.redirect(loginUrl));
  }

  if (matches(pathname, ADMIN_PROTECTED) && data?.claims) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.claims.sub)
      .single();

    if (profile?.role !== "admin") {
      return withCookiesFrom(
        response,
        NextResponse.redirect(new URL("/", request.url)),
      );
    }
  }

  return response;
}
