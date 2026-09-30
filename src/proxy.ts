import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./lib/supabase/env";

// Runs before every page in `matcher`. It (1) keeps the login session fresh and
// (2) sends visitors to the right place:
//   logged out + private page  → /login
//   logged in  + login/signup  → /dashboard
const PRIVATE = ["/dashboard", "/plan", "/progress", "/maths", "/settings", "/onboarding", "/coach"];
const AUTH_PAGES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() checks the session with Supabase (safer than trusting the cookie alone).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const goTo = (to: string) => NextResponse.redirect(new URL(to, request.url));

  if (!user && PRIVATE.some((p) => path === p || path.startsWith(p + "/"))) return goTo("/login");
  if (user && AUTH_PAGES.includes(path)) return goTo("/dashboard");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/plan/:path*", "/progress/:path*", "/maths/:path*", "/settings/:path*", "/onboarding/:path*", "/coach/:path*", "/login", "/signup"],
};
