import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { brand } from "@/lib/brand";
import { LogoutButton } from "@/components/LogoutButton";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/storefront", label: "Storefront" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/ledger", label: "Sales ledger" },
  { href: "/dashboard/analytics", label: "Analytics & insights" },
  { href: "/dashboard/passport", label: "Financial Passport" },
  { href: "/dashboard/financing", label: "Financing" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.verifiedAt) redirect("/verify");
  if (user.role !== "SME_OWNER") redirect("/");

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-dark-plum px-4 py-6 text-white md:flex">
        <Link href="/" className="px-2 text-xl font-extrabold">
          {brand.name}
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-lavender-text hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <LogoutButton className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-lavender-text hover:bg-white/10 hover:text-white" />
        </div>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 md:hidden">
          <Link href="/" className="text-lg font-extrabold text-brand-primary">
            {brand.name}
          </Link>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
