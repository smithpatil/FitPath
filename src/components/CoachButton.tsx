"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// A small, always-visible button that opens the coach page (a normal page, not a pop-up).
export default function CoachButton() {
  const pathname = usePathname();
  if (pathname === "/coach") return null;
  return (
    <Link
      href="/coach"
      className="fixed bottom-4 right-4 z-10 rounded-full bg-accent px-5 py-3 text-base font-semibold text-white shadow-lg hover:bg-accent-dark"
    >
      Ask the coach
    </Link>
  );
}
