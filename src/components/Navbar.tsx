"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Max 5 items, always visible (no hidden menu).
const links = [
  { href: "/dashboard", label: "Today" },
  { href: "/plan", label: "Plan" },
  { href: "/progress", label: "Progress" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="border-b border-gray-200">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3"
      >
        <Link href="/" className="text-xl font-bold text-accent">
          FitPath
        </Link>
        <ul className="flex flex-wrap gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-full px-4 py-2 text-base font-medium ${
                    active ? "bg-accent text-white" : "text-ink hover:bg-accent-soft"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
