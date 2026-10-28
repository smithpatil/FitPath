import Link from "next/link";
import Icon from "./Icon";

// Logo: an orange badge with a dumbbell, and the "FitPath" wordmark. `light` is for deep panels.
export default function Logo({ light = false, className = "", href = "/" }: { light?: boolean; className?: string; href?: string }) {
  return (
    <Link href={href} aria-label="FitPath home" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${
          light ? "bg-white text-deep" : "bg-gradient-to-br from-accent to-deep text-white"
        }`}
      >
        <Icon name="dumbbell" className="h-6 w-6" />
      </span>
      <span className={`text-2xl font-extrabold tracking-tight ${light ? "text-white" : "text-deep"}`}>
        Fit<span className={light ? "text-spark" : "text-deep"}>Path</span>
      </span>
    </Link>
  );
}
