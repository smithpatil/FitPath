import Icon, { type IconName } from "@/components/Icon";

export interface Tile {
  icon: IconName;
  label: string;
  value: string;
  note: string;
  /** Colour of the icon badge. */
  tone?: "teal" | "amber";
}

// A grid of big-number tiles: totals, streaks and a style-specific pair.
export default function StatTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {tiles.map((t) => (
        <li key={t.label} className="flex flex-col gap-3 rounded-card bg-white p-4 shadow-card ring-1 ring-gray-100 sm:p-5">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              t.tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-accent-soft text-deep"
            }`}
          >
            <Icon name={t.icon} className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-muted">{t.label}</p>
            <p className="mt-0.5 break-words text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{t.value}</p>
            <p className="mt-0.5 text-base text-muted">{t.note}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
