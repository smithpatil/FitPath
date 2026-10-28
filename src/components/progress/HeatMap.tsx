import Link from "next/link";
import Icon from "@/components/Icon";
import type { MonthGrid } from "@/lib/stats";

const LEVEL_STYLE = [
  "bg-gray-100 text-muted", // no workout
  "bg-orange-200 text-deep", // a little
  "bg-orange-500 text-deep", // a good day
  "bg-accent text-white", // a big day
];
const HEAD = ["M", "T", "W", "T", "F", "S", "S"];

// A month calendar where every day you trained is coloured in. Previous and next month are plain links.
export default function HeatMap({ grid, prevHref, nextHref, todayIso }: { grid: MonthGrid; prevHref: string; nextHref: string | null; todayIso: string }) {
  const nav = "flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-200 transition-colors hover:border-accent hover:text-accent";
  return (
    <div className="rounded-card bg-white p-4 shadow-card ring-1 ring-gray-100 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Link href={prevHref} aria-label="Previous month" className={nav}>
          <Icon name="arrow-right" className="h-5 w-5 rotate-180" />
        </Link>
        <div className="text-center">
          <p className="text-xl font-extrabold">{grid.label}</p>
          <p className="text-base text-muted">
            {grid.activeDays} {grid.activeDays === 1 ? "day" : "days"} trained
          </p>
        </div>
        {nextHref ? (
          <Link href={nextHref} aria-label="Next month" className={nav}>
            <Icon name="arrow-right" className="h-5 w-5" />
          </Link>
        ) : (
          <span className="h-11 w-11" aria-hidden="true" />
        )}
      </div>

      <div className="mx-auto mt-5 max-w-md">
        <div className="grid grid-cols-7 gap-1.5 text-center text-sm font-extrabold text-muted sm:gap-2" aria-hidden="true">
          {HEAD.map((h, i) => (
            <span key={i}>{h}</span>
          ))}
        </div>
        <ul className="mt-2 grid grid-cols-7 gap-1.5 sm:gap-2">
          {grid.weeks.flat().map((cell, i) =>
            cell ? (
              <li
                key={cell.iso}
                aria-label={`${cell.day} ${grid.label.split(" ")[0]}: ${cell.count === 0 ? "no workout" : `${cell.count} ${cell.count === 1 ? "exercise" : "exercises"} done`}${cell.iso === todayIso ? " (today)" : ""}`}
                className={`flex aspect-square items-center justify-center rounded-lg text-sm font-bold sm:text-base ${LEVEL_STYLE[cell.level]} ${
                  cell.iso === todayIso ? "ring-2 ring-spark ring-offset-2" : ""
                }`}
              >
                {cell.day}
              </li>
            ) : (
              <li key={`blank-${i}`} aria-hidden="true" />
            ),
          )}
        </ul>

        <div className="mt-4 flex items-center justify-end gap-2 text-sm text-muted" aria-hidden="true">
          Less
          {LEVEL_STYLE.map((s, i) => (
            <span key={i} className={`h-4 w-4 rounded ${s.split(" ")[0]}`} />
          ))}
          More
        </div>
      </div>
    </div>
  );
}
