import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { brand } from "@/lib/brand";
import { LogoutButton } from "@/components/LogoutButton";

export default async function LenderLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "LENDER") redirect("/");

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="flex items-center justify-between border-b border-border bg-dark-plum px-6 py-4 text-white">
        <Link href="/lender" className="text-lg font-extrabold">
          {brand.name} Lender Portal
        </Link>
        <LogoutButton className="text-sm font-medium text-muted-lavender-text hover:text-white" />
      </header>
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
