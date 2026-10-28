"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

// A small, always-visible button that opens the coach page (a normal page, not a pop-up).
// On phones it sits above the bottom tab bar.
export default function CoachButton() {
  const pathname = usePathname();
  if (pathname === "/coach") return null;
  return (
    <Link
      href="/coach"
      className="fixed bottom-24 right-4 z-20 flex items-center gap-2 rounded-full bg-deep px-5 py-3 text-base font-bold text-white shadow-lift transition-colors hover:bg-accent-dark sm:bottom-6 sm:right-6"
    >
      <Icon name="chat" className="h-5 w-5 text-spark" />
      Ask the coach
    </Link>
  );
}
