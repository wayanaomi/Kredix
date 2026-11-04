import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { brand } from "@/lib/brand";
import { LogoutButton } from "@/components/LogoutButton";

const NAV = [
  { href: "/admin", label: "SME accounts" },
  { href: "/admin/referrals", label: "Referrals" },
  { href: "/admin/audit", label: "Audit log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="flex items-center justify-between border-b border-border bg-dark-plum px-6 py-4 text-white">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-extrabold">
            {brand.name} Admin
          </Link>
          <nav className="flex gap-4 text-sm">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-muted-lavender-text hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <LogoutButton className="text-sm font-medium text-muted-lavender-text hover:text-white" />
      </header>
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
