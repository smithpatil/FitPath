import Link from "next/link";
import Icon from "./Icon";

type Variant = "primary" | "outline" | "light" | "spark";

const STYLES: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-dark shadow-sm",
  outline: "border-2 border-accent text-accent hover:bg-accent-soft",
  light: "bg-white text-deep hover:bg-ice shadow-sm", // for deep panels
  spark: "bg-spark text-deep hover:bg-amber-400 shadow-sm", // the energetic main button on deep panels
};

// Big, rounded link-styled button. `arrow` adds a small arrow icon.
export default function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  arrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold transition-colors ${STYLES[variant]}`}
    >
      {children}
      {arrow && <Icon name="arrow-right" className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
    </Link>
  );
}
