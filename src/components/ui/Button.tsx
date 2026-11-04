import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-action-primary text-white hover:bg-action-primary-hover",
  secondary: "bg-action-secondary text-dark-plum hover:bg-action-secondary-hover",
  ghost: "bg-transparent text-brand-primary border border-border hover:bg-surface-muted",
  destructive: "bg-action-destructive text-white hover:bg-action-destructive-hover",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-base px-4 py-2.5 rounded-xl",
  lg: "text-lg px-6 py-3.5 rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          "inline-flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? "…" : children}
      </button>
    );
  }
);
Button.displayName = "Button";
