// A small set of simple line icons (24×24 grid), drawn here so no icon library is needed.
// Icons are decorative by default (aria-hidden); the text next to them carries the meaning.
import type { ReactNode } from "react";

export type IconName =
  | "dumbbell"
  | "flame"
  | "pulse"
  | "calendar"
  | "check"
  | "clock"
  | "target"
  | "bolt"
  | "arrow-right"
  | "play"
  | "chart"
  | "chat"
  | "shield"
  | "timer"
  | "moon"
  | "list"
  | "home"
  | "sliders"
  | "smile"
  | "drop"
  | "heart";

const PATHS: Record<IconName, ReactNode> = {
  dumbbell: (
    <>
      <rect x="2" y="9" width="2" height="6" rx="1" />
      <rect x="4" y="7" width="3" height="10" rx="1.2" />
      <rect x="17" y="7" width="3" height="10" rx="1.2" />
      <rect x="20" y="9" width="2" height="6" rx="1" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </>
  ),
  flame: <path d="M12 3c.4 3.2-3.5 4.6-3.5 8.6 0 1.1.4 2 1 2.7-.1-1.6.8-2.7 2-3.6.2 1.5 1 2.2 1.8 3 .6.7 1.2 1.2 1.2 2.1a4 4 0 1 1-8 0c0-3.8 2.4-5.6 3.2-7.6C10.2 6.6 11.5 5 12 3z" />,
  pulse: <polyline points="2.5 12 7 12 9.5 5.5 14.5 18.5 17 12 21.5 12" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </>
  ),
  check: <polyline points="5 12.5 10 17.5 19 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  "arrow-right": (
    <>
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="13 5 20 12 13 19" />
    </>
  ),
  play: <polygon points="7 4 20 12 7 20 7 4" />,
  chart: (
    <>
      <rect x="4" y="12" width="4" height="8" rx="1" />
      <rect x="10" y="5" width="4" height="15" rx="1" />
      <rect x="16" y="9" width="4" height="11" rx="1" />
    </>
  ),
  chat: <path d="M4 5h16v11H9.5L4 20.5V5z" />,
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3z" />
      <polyline points="8.5 12 11 14.5 15.5 9.5" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <line x1="12" y1="13.5" x2="12" y2="9.5" />
      <line x1="9.5" y1="2.5" x2="14.5" y2="2.5" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  list: (
    <>
      <line x1="9" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="9" y1="18" x2="21" y2="18" />
      <circle cx="4.5" cy="6" r="1" />
      <circle cx="4.5" cy="12" r="1" />
      <circle cx="4.5" cy="18" r="1" />
    </>
  ),
  home: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z" />,
  sliders: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="9" cy="7" r="2.2" fill="currentColor" />
      <circle cx="15" cy="12" r="2.2" fill="currentColor" />
      <circle cx="8" cy="17" r="2.2" fill="currentColor" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14c1 1.6 2.4 2.3 4 2.3s3-.7 4-2.3" />
      <circle cx="9" cy="10" r="0.6" fill="currentColor" />
      <circle cx="15" cy="10" r="0.6" fill="currentColor" />
    </>
  ),
  drop: <path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z" />,
  heart: <path d="M12 20s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.7A4.5 4.5 0 0 1 20 9c0 6.2-8 11-8 11z" />,
};

export default function Icon({ name, className = "h-6 w-6", strokeWidth = 2 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

/** Icon for a muscle group, used on exercise cards. */
export function groupIcon(group: string, yoga = false): IconName {
  if (yoga) return "heart";
  if (group === "cardio") return "pulse";
  if (group === "core") return "target";
  return "dumbbell";
}
