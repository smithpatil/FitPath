import Link from "next/link";

// Big, rounded link-styled button. "primary" uses the accent colour.
export default function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
}) {
  const base =
    "inline-block rounded-full px-8 py-4 text-lg font-semibold text-center transition-colors";
  const styles =
    variant === "primary"
      ? "bg-accent text-white hover:bg-accent-dark"
      : "border-2 border-accent text-accent hover:bg-accent-soft";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
