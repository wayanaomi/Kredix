import type { HTMLAttributes } from "react";
import clsx from "clsx";

type Tone = "neutral" | "success" | "warning" | "error" | "brand";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-muted text-text-secondary",
  success: "bg-state-success/10 text-state-success",
  warning: "bg-state-warning/10 text-state-warning",
  error: "bg-state-error/10 text-state-error",
  brand: "bg-electric-mint/15 text-dark-plum",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
