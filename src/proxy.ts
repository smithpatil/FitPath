import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./lib/supabase/env";

// Runs before every page in `matcher`. It (1) keeps the login session fresh and
// (2) sends visitors to the right place:
//   logged out + private page  → /login
//   (login and signup pages show a "you are already logged in" choice instead of redirecting)
const PRIVATE = ["/dashboard", "/plan", "/progress", "/settings", "/onboarding", "/coach", "/workout"];

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
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/plan/:path*", "/progress/:path*", "/settings/:path*", "/onboarding/:path*", "/coach/:path*", "/workout/:path*", "/login", "/signup"],
};
