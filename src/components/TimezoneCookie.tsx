"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Saves the browser's time zone in a cookie (once) so the server knows what "today" means for you.
export default function TimezoneCookie() {
  const router = useRouter();
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;
    const wanted = `tz=${encodeURIComponent(tz)}`;
    if (document.cookie.split("; ").includes(wanted)) return;
    document.cookie = `${wanted}; path=/; max-age=31536000; samesite=lax`;
    router.refresh(); // re-draw the page now that the server knows the time zone
  }, [router]);
  return null;
}
