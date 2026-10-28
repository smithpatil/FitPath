"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./Icon";
import Logo from "./Logo";

// Always visible, never hidden in a menu. 4 items.
const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Today", icon: "home" },
  { href: "/plan", label: "Plan", icon: "list" },
  { href: "/progress", label: "Progress", icon: "chart" },
  { href: "/settings", label: "Settings", icon: "sliders" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Top bar: logo, plus the links on larger screens */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo href="/dashboard" />
          <nav aria-label="Main" className="hidden sm:block">
            <ul className="flex gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold transition-colors ${
                      isActive(l.href) ? "bg-accent text-white shadow-sm" : "text-ink hover:bg-accent-soft"
                    }`}
                  >
                    <Icon name={l.icon} className="h-5 w-5" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Phones: app-style tab bar at the bottom */}
      <nav aria-label="Main (mobile)" className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-2 pb-2 pt-2.5 text-sm font-semibold ${isActive(l.href) ? "text-accent" : "text-muted"}`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                    isActive(l.href) ? "bg-accent text-white" : ""
                  }`}
                >
                  <Icon name={l.icon} className="h-5 w-5" />
                </span>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
