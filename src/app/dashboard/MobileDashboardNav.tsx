"use client";

import { useState } from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { LogoutButton } from "@/components/LogoutButton";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/onboarding", label: "Business Profile" },
  { href: "/dashboard/storefront", label: "Storefront" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/ledger", label: "Sales ledger" },
  { href: "/dashboard/analytics", label: "Analytics & insights" },
  { href: "/dashboard/passport", label: "Financial Passport" },
  { href: "/dashboard/financing", label: "Financing" },
];

export function MobileDashboardNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-50 flex items-center justify-between border-b border-border bg-white px-4 py-3 md:hidden">
      <Link href="/" className="text-lg font-extrabold text-brand-primary">
        {brand.name}
      </Link>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-dark-plum hover:bg-surface-muted"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m18 6-12 12M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-0 z-40 bg-black/50"
          />

          <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(82vw,320px)] flex-col bg-dark-plum px-5 py-6 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-xl font-extrabold"
              >
                {brand.name}
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="mb-3 mt-9 px-3 text-xs font-semibold uppercase tracking-wider text-muted-lavender-text">
              Dashboard menu
            </p>

            <nav className="flex flex-col gap-1 overflow-y-auto">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-muted-lavender-text transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-4">
              <LogoutButton className="w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-lavender-text hover:bg-white/10 hover:text-white" />
            </div>
          </aside>
        </>
      )}
    </header>
  );
}
