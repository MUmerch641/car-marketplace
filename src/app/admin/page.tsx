import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function AdminPage() {
  const s = await createClient();
  const [
    { count: active },
    { count: cars },
    { count: bookings },
    { count: verification },
    { data: audit },
  ] = await Promise.all([
    s.from("cars").select("id", { count: "exact", head: true }).eq("status", "active"),
    s.from("cars").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    s.from("service_bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    s.from("verification_requests").select("id", { count: "exact", head: true }).in("status", ["pending", "report_submitted"]),
    s.from("admin_audit_logs").select("action,entity_type,created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  const cards: [string, number | null][] = [
    ["Active cars", active],
    ["Cars awaiting review", cars],
    ["Bookings awaiting confirmation", bookings],
    ["Verification actions", verification],
  ];

  return (
    <main className="p-5 lg:p-8">
      <SectionHeading title="Operations overview" />

      {/* Metric cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, n]) => (
          <div key={String(label)} className="card-standard p-6">
            <p className="text-sm text-[#667085]">{label}</p>
            <p className="mt-3 font-h1 text-ink">{n ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Needs attention */}
      <SectionHeading
        title="Needs attention"
        link={{ href: "/admin", label: "View all" }}
      />
      
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/cars"
          className="card-standard p-6 hover:border-brand hover:shadow-md transition-all"
        >
          <p className="font-h2 text-ink">{cars ?? 0}</p>
          <p className="text-sm text-[#667085]">cars awaiting moderation</p>
        </Link>
        <Link
          href="/admin/bookings?status=pending"
          className="card-standard p-6 hover:border-brand hover:shadow-md transition-all"
        >
          <p className="font-h2 text-ink">{bookings ?? 0}</p>
          <p className="text-sm text-[#667085]">bookings awaiting confirmation</p>
        </Link>
        <Link
          href="/admin/verifications"
          className="card-standard p-6 hover:border-brand hover:shadow-md transition-all"
        >
          <p className="font-h2 text-ink">{verification ?? 0}</p>
          <p className="text-sm text-[#667085]">verification actions</p>
        </Link>
      </div>

      {/* Recent activity */}
      <SectionHeading
        title="Recent admin activity"
        link={{ href: "/admin", label: "View all" }}
      />
      
      <div className="mt-6 overflow-hidden rounded-xl border border-[#E4E7EC] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9FAFB] text-[#667085]">
              <tr>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Entity</th>
                <th className="px-6 py-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {audit?.length ? (
                audit.map((x, i) => (
                  <tr key={i} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4 font-medium text-ink">{x.action.replaceAll("_", " ")}</td>
                    <td className="px-6 py-4 text-[#667085]">{x.entity_type}</td>
                    <td className="px-6 py-4 text-[#667085]">
                      {new Date(x.created_at).toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-[#667085]">
                    No recent admin activity.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}