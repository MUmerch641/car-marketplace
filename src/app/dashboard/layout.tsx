import type { ReactNode } from "react";
import { CustomerAccountNav } from "@/components/dashboard/customer-account-nav";
import { Navbar } from "@/components/layout/navbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <CustomerAccountNav />
      {children}
    </>
  );
}
