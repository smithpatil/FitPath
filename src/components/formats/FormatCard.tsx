import Image from "next/image";
import Icon from "@/components/Icon";
import { FORMAT_INFO, type Format } from "@/lib/formats";
import { PHOTOS } from "@/lib/photos";

// The colour wash for the setup banner. The text always sits on a dark background, so contrast is safe.
export const WASH: Record<Format, string> = {
  gym: "from-accent via-[#7c2d12] to-deep",
  strength: "from-[#1d4ed8] via-[#1e3a8a] to-deep",
  yoga: "from-[#6d28d9] via-[#3b1d78] to-deep",
};

// One workout-style card: a photo, three benefits, the title, how long, a short description and a button.
// The whole card is clickable (the button stretches over it) and works with the keyboard.
export default function FormatCard({ format, current, onChoose }: { format: Format; current?: boolean; onChoose: () => void }) {
  const info = FORMAT_INFO[format];
  return (
    <article className="on-deep group relative flex flex-col overflow-hidden rounded-hero bg-deep text-white shadow-lift ring-1 ring-black/5 transition-transform hover:-translate-y-1">
      <div className="relative h-60 bg-deep sm:h-64">
        <Image src={PHOTOS[format].src} alt="" fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep via-deep/20 to-transparent" />
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
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-base font-extrabold uppercase tracking-wider text-deep transition-colors after:absolute after:inset-0 after:content-[''] hover:bg-ice"
        >
          Choose {info.title}
          <Icon name="arrow-right" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}
