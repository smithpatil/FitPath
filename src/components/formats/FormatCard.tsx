import Icon from "@/components/Icon";
import { FORMAT_INFO, type Format } from "@/lib/formats";
import FormatArt from "./FormatArt";

// The colour wash behind each illustration. The text always sits on the dark body, so contrast is safe.
export const WASH: Record<Format, string> = {
  gym: "from-accent via-[#0b5d57] to-deep",
  strength: "from-[#a34a0a] via-[#7c3f06] to-deep",
  yoga: "from-[#6d28d9] via-[#3b1d78] to-deep",
};

// One workout-style card: a picture, three benefits, the title, how long, a short description and a button.
// The whole card is clickable (the button stretches over it) and works with the keyboard.
export default function FormatCard({ format, current, onChoose }: { format: Format; current?: boolean; onChoose: () => void }) {
  const info = FORMAT_INFO[format];
  return (
    <article className="on-deep group relative flex flex-col overflow-hidden rounded-hero bg-deep text-white shadow-lift ring-1 ring-black/5 transition-transform hover:-translate-y-1">
      <div className={`relative h-60 bg-gradient-to-b ${WASH[format]} sm:h-64`}>
        <FormatArt format={format} className="absolute inset-0 h-full w-full" />
        {current && (
          <span className="absolute left-4 top-4 rounded-full bg-spark px-3 py-1 text-sm font-extrabold text-deep">Your current style</span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col px-6 pb-6 pt-2">
        <ul className="grid grid-cols-3 gap-2 text-center">
          {info.benefits.map((b) => (
            <li key={b.text} className="flex flex-col items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-spark ring-1 ring-white/25">
                <Icon name={b.icon} className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold leading-tight text-ice">{b.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-end justify-between gap-3">
          <h2 className="text-4xl font-extrabold leading-none tracking-tight">{info.title}</h2>
          <p className="text-right text-sm font-semibold leading-tight text-ice">{info.length}</p>
        </div>
        <p className="mt-3 flex-1 text-base text-ice">{info.description}</p>

        <button
          type="button"
          onClick={onChoose}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-base font-extrabold uppercase tracking-wider text-accent-dark transition-colors after:absolute after:inset-0 after:content-[''] hover:bg-ice"
        >
          Choose {info.title}
          <Icon name="arrow-right" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}
