import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={clsx("block text-sm font-medium text-text-primary mb-1.5", className)} {...props} />;
}

const fieldBase =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-text-primary placeholder:text-text-secondary/60 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(fieldBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(fieldBase, className)} {...props} />;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-state-error">{message}</p>;
}

export function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-sm text-text-secondary">{children}</p>;
}
