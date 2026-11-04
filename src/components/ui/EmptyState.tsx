import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 rounded-2xl border border-dashed border-border bg-surface-muted p-10">
      <p className="text-lg font-semibold text-text-primary">{title}</p>
      <p className="max-w-md text-sm text-text-secondary">{description}</p>
      {action}
    </div>
  );
}
