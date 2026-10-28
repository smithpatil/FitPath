import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";

const LINKS: { href: string; title: string; text: string; icon: IconName; style: string }[] = [
  { href: "/plan", title: "Weekly plan", text: "Every exercise with how-to notes", icon: "list", style: "on-deep bg-gradient-to-br from-accent to-deep text-white" },
  { href: "/progress", title: "Your progress", text: "Charts, best lifts and weight", icon: "chart", style: "bg-gradient-to-br from-amber-300 to-spark text-deep" },
  { href: "/coach", title: "Ask the coach", text: "Simple answers, any time", icon: "chat", style: "on-deep bg-gradient-to-br from-deep to-[#172554] text-white" },
];

// Three colourful cards that lead to the main areas.
export default function QuickLinks() {
  return (
    <nav aria-label="Quick links">
      <ul className="grid gap-4 sm:grid-cols-3">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={`group flex h-full min-h-40 flex-col justify-between rounded-card p-6 shadow-card transition-transform hover:-translate-y-1 hover:shadow-lift ${l.style}`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <Icon name={l.icon} className="h-6 w-6" />
              </span>
              <span className="mt-6 flex items-end justify-between gap-3">
                <span>
                  <span className="block text-xl font-extrabold leading-tight">{l.title}</span>
                  <span className="mt-1 block text-base opacity-90">{l.text}</span>
                </span>
                <Icon name="arrow-right" className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
