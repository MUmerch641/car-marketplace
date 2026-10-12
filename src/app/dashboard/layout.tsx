import type { ReactNode } from "react";
import { CustomerAccountNav } from "@/components/dashboard/customer-account-nav";
import { Navbar } from "@/components/layout/navbar";
import { requireUser } from "@/lib/auth/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return (
    <>
      <Navbar />
      <CustomerAccountNav />
      <div className="pb-24 sm:pb-0">{children}</div>
    </>
  );
}
