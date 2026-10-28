import ButtonLink from "@/components/Button";
import Image from "next/image";
import Icon from "@/components/Icon";
import { FORMAT_INFO, type Format } from "@/lib/formats";
import { itemWord } from "@/lib/labels";
import { PHOTOS } from "@/lib/photos";

export type HeroProps =
  | { kind: "workout"; format: Format; weekday: string; focus: string; exerciseCount: number; minutes: number; doneCount: number; startHref: string | null }
  | { kind: "rest"; format: Format; weekday: string; next: string }
  | { kind: "empty"; format: Format };

// Where each photo is cropped so the person stays in view.
const FOCUS: Record<Format, string> = { gym: "object-[center_20%]", strength: "object-[center_25%]", yoga: "object-[center_55%]" };

// The big photo panel at the top of the home page: what to do today.
export default function Hero(props: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="on-deep relative overflow-hidden rounded-hero bg-gradient-to-br from-deep via-[#163027] to-accent text-white"
    >
      <Image src={PHOTOS[props.format].src} alt="" fill priority sizes="(min-width: 1024px) 1000px, 100vw" className={`object-cover ${FOCUS[props.format]}`} />
      <div aria-hidden="true" className="absolute inset-0 max-md:bg-deep/80 md:bg-gradient-to-r md:from-deep md:from-30% md:via-deep/65 md:via-50% md:to-transparent" />
      <div className="relative grid items-center gap-6 p-6 sm:p-10 md:min-h-[22rem] md:grid-cols-[1.3fr_0.7fr]">
        <div>
          {props.kind === "workout" && (
            <>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-ice ring-1 ring-white/20">
                <Icon name="bolt" className="h-4 w-4 text-spark" /> {props.weekday} · {FORMAT_INFO[props.format].title}
              </p>
              <h1 id="hero-title" className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                {props.focus}
              </h1>
              <ul className="mt-5 flex flex-wrap gap-2 text-base font-semibold">
                <Chip icon="dumbbell">{props.exerciseCount} {itemWord(props.format)}</Chip>
                <Chip icon="clock">about {props.minutes} min</Chip>
                <Chip icon="check" highlight={props.doneCount === props.exerciseCount}>
                  {props.doneCount === props.exerciseCount ? "All done" : `${props.doneCount} of ${props.exerciseCount} done`}
                </Chip>
              </ul>
              <div className="mt-8">
                {props.startHref ? (
                  <ButtonLink href={props.startHref} variant="spark" arrow>
                    {props.format === "yoga" ? "Start session" : "Start workout"}
                  </ButtonLink>
                ) : (
                  <p className="text-xl font-extrabold text-spark">Great work today! Rate how it felt below.</p>
                )}
              </div>
            </>
          )}
          {props.kind === "rest" && (
            <>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-ice ring-1 ring-white/20">
                <Icon name="moon" className="h-4 w-4 text-spark" /> {props.weekday} · {FORMAT_INFO[props.format].title} · Rest day
              </p>
              <h1 id="hero-title" className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Rest up.
                <br />
                <span className="text-spark">You&apos;re getting stronger.</span>
              </h1>
              <p className="mt-4 max-w-md text-lg text-ice">{props.next}</p>
              <div className="mt-8">
                <ButtonLink href="/plan" variant="light" arrow>
                  See my weekly plan
                </ButtonLink>
              </div>
            </>
          )}
          {props.kind === "empty" && (
            <>
              <h1 id="hero-title" className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                We couldn&apos;t build a plan yet
              </h1>
              <p className="mt-4 max-w-md text-lg text-ice">Try changing your equipment or sore areas and we&apos;ll have another go.</p>
              <div className="mt-8">
                <ButtonLink href="/onboarding" variant="spark" arrow>
                  Change my workout
                </ButtonLink>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Chip({ children, icon, highlight }: { children: React.ReactNode; icon: "dumbbell" | "clock" | "check"; highlight?: boolean }) {
  return (
    <li className={`flex items-center gap-2 rounded-full px-4 py-1.5 ring-1 ${highlight ? "bg-spark text-deep ring-spark" : "bg-white/10 text-white ring-white/20"}`}>
      <Icon name={icon} className={`h-4 w-4 ${highlight ? "text-deep" : "text-spark"}`} />
      {children}
    </li>
  );
}
