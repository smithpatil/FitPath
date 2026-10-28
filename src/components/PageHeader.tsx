import Icon, { type IconName } from "./Icon";

// The top of a page: a colourful banner with an icon, a small label, the title and one line of help.
export default function PageHeader({
  icon,
  eyebrow,
  title,
  children,
}: {
  icon: IconName;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="on-deep relative overflow-hidden rounded-hero bg-gradient-to-br from-deep via-[#172554] to-accent p-6 text-white sm:p-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-spark/15 blur-3xl" />
      <div className="relative flex items-start gap-4 sm:gap-6">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-spark text-deep sm:h-16 sm:w-16">
          <Icon name={icon} className="h-8 w-8" />
        </span>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-widest text-ice">{eyebrow}</p>
          <h1 className="mt-1 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{title}</h1>
          {children && <p className="mt-3 max-w-2xl text-lg text-ice">{children}</p>}
        </div>
      </div>
    </header>
  );
}
