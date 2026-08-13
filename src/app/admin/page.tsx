import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Activity, ArrowRight, CalendarClock, CarFront, ClipboardCheck, ShieldCheck } from "lucide-react";
import { AdminPageHeader, AdminStatus } from "@/components/admin/admin-ui";

export default async function AdminPage() {
  const s = await createClient();
  const [
    { count: active },
    { count: cars },
    { count: bookings },
    { count: verification },
    { data: audit },
    { data: carActivity },
    { data: bookingActivity },
    { data: verificationActivity },
  ] = await Promise.all([
    s.from("cars").select("id", { count: "exact", head: true }).eq("status", "active"),
    s.from("cars").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    s.from("service_bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    s.from("verification_requests").select("id", { count: "exact", head: true }).in("status", ["pending", "report_submitted"]),
    s.from("admin_audit_logs").select("action,entity_type,created_at").order("created_at", { ascending: false }).limit(8),
    s.from("cars").select("created_at").gte("created_at", sixMonthsAgo()),
    s.from("service_bookings").select("created_at").gte("created_at", sixMonthsAgo()),
    s.from("verification_requests").select("created_at").gte("created_at", sixMonthsAgo()),
  ]);

  const monthlyActivity = makeMonthlyActivity(carActivity ?? [], bookingActivity ?? [], verificationActivity ?? []);

  const cards = [
    { label: "Live listings", value: active, icon: CarFront, tone: "bg-blue-50 text-blue-700" },
    { label: "Pending moderation", value: cars, icon: ClipboardCheck, tone: "bg-amber-50 text-amber-700" },
    { label: "Bookings to confirm", value: bookings, icon: CalendarClock, tone: "bg-violet-50 text-violet-700" },
    { label: "Verification actions", value: verification, icon: ShieldCheck, tone: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <main className="mx-auto max-w-[1440px] p-5 sm:p-8">
      <AdminPageHeader title="Good to see you" description="Prioritise approvals, bookings, and vehicle inspections from one operational view." />

      {/* Metric cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><p className="text-sm font-semibold text-slate-500">{label}</p><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon size={18} /></span></div>
            <p className="mt-5 text-4xl font-bold tracking-tight text-[#0b1f33]">{value ?? 0}</p>
            <p className="mt-1 text-xs text-slate-400">Current operational total</p>
          </div>
        ))}
      </div>

      <section className="mt-9 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d92d20]">Workload trend</p><h2 className="mt-1 text-xl font-bold text-[#0b1f33]">New operational requests</h2><p className="mt-1 text-sm text-slate-500">Last six months across marketplace and service teams.</p></div><AdminStatus>Last 6 months</AdminStatus></div><ActivityChart data={monthlyActivity} /></div>
        <div className="rounded-2xl border border-slate-200 bg-[#0b1f33] p-5 text-white shadow-sm sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#fda29b]">Queue health</p><h2 className="mt-1 text-xl font-bold">Work needing a decision</h2><div className="mt-7 space-y-5">{[{ label: "Listings", value: cars ?? 0, total: active ?? 0, color: "bg-[#f97066]" }, { label: "Bookings", value: bookings ?? 0, total: 12, color: "bg-[#7fdbca]" }, { label: "Verifications", value: verification ?? 0, total: 12, color: "bg-[#8ab4f8]" }].map(item => <div key={item.label}><div className="flex justify-between text-sm"><span className="font-semibold">{item.label}</span><span className="text-slate-400">{item.value} open</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.min(100, item.value ? Math.max(12, item.value / Math.max(item.total + item.value, 1) * 100) : 0)}%` }} /></div></div>)}</div><p className="mt-8 text-xs leading-5 text-slate-400">Open queues are shown here so the team can act before requests become overdue.</p></div>
      </section>

      <section className="mt-9"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d92d20]">Priority queue</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0b1f33]">Needs your attention</h2></div><Activity className="text-slate-400" size={20} /></div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/cars"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d92d20] hover:shadow-md"
        >
          <AdminStatus tone="amber">Moderation</AdminStatus><p className="mt-5 text-3xl font-bold text-[#0b1f33]">{cars ?? 0}</p><p className="mt-1 text-sm text-slate-500">cars awaiting review</p><span className="mt-5 flex items-center gap-1 text-sm font-bold text-[#d92d20]">Open queue <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
        </Link>
        <Link
          href="/admin/bookings?status=pending"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d92d20] hover:shadow-md"
        >
          <AdminStatus tone="blue">Service desk</AdminStatus><p className="mt-5 text-3xl font-bold text-[#0b1f33]">{bookings ?? 0}</p><p className="mt-1 text-sm text-slate-500">bookings awaiting confirmation</p><span className="mt-5 flex items-center gap-1 text-sm font-bold text-[#d92d20]">Open queue <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
        </Link>
        <Link
          href="/admin/verifications"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d92d20] hover:shadow-md"
        >
          <AdminStatus tone="green">Inspections</AdminStatus><p className="mt-5 text-3xl font-bold text-[#0b1f33]">{verification ?? 0}</p><p className="mt-1 text-sm text-slate-500">verification actions</p><span className="mt-5 flex items-center gap-1 text-sm font-bold text-[#d92d20]">Open queue <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
        </Link>
      </div></section>

      <section className="mt-9"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d92d20]">Audit trail</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0b1f33]">Recent activity</h2></div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Entity</th>
                <th className="px-6 py-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audit?.length ? (
                audit.map((x, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold capitalize text-[#0b1f33]">{x.action.replaceAll("_", " ")}</td>
                    <td className="px-6 py-4"><AdminStatus>{x.entity_type}</AdminStatus></td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(x.created_at).toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    No recent admin activity.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div></section>
    </main>
  );
}

type CreatedRecord = { created_at: string };
function sixMonthsAgo() { const date = new Date(); date.setMonth(date.getMonth() - 5, 1); date.setHours(0, 0, 0, 0); return date.toISOString(); }
function makeMonthlyActivity(cars: CreatedRecord[], bookings: CreatedRecord[], verifications: CreatedRecord[]) {
  const months = Array.from({ length: 6 }, (_, index) => { const date = new Date(); date.setMonth(date.getMonth() - (5 - index), 1); return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString("en-GB", { month: "short" }), cars: 0, bookings: 0, verifications: 0 }; });
  const add = (records: CreatedRecord[], field: "cars" | "bookings" | "verifications") => records.forEach(({ created_at }) => { const date = new Date(created_at); const month = months.find((item) => item.key === `${date.getFullYear()}-${date.getMonth()}`); if (month) month[field]++; });
  add(cars, "cars"); add(bookings, "bookings"); add(verifications, "verifications"); return months;
}
function ActivityChart({ data }: { data: ReturnType<typeof makeMonthlyActivity> }) { const max = Math.max(1, ...data.map((item) => item.cars + item.bookings + item.verifications)); return <div className="mt-7"><div className="flex h-44 items-end gap-3 border-b border-slate-200 pb-0 sm:gap-5">{data.map((item) => <div key={item.key} className="group flex h-full flex-1 items-end justify-center gap-1"><span title={`${item.cars} cars`} className="w-full max-w-5 rounded-t bg-[#d92d20] transition-opacity group-hover:opacity-75" style={{ height: `${item.cars / max * 100}%` }} /><span title={`${item.bookings} bookings`} className="w-full max-w-5 rounded-t bg-[#0b1f33] transition-opacity group-hover:opacity-75" style={{ height: `${item.bookings / max * 100}%` }} /><span title={`${item.verifications} verifications`} className="w-full max-w-5 rounded-t bg-[#7c9cbe] transition-opacity group-hover:opacity-75" style={{ height: `${item.verifications / max * 100}%` }} /></div>)}</div><div className="mt-2 flex gap-3 sm:gap-5">{data.map((item) => <span key={item.key} className="flex-1 text-center text-xs font-medium text-slate-400">{item.label}</span>)}</div><div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500"><span><i className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[#d92d20]" />Listings</span><span><i className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[#0b1f33]" />Bookings</span><span><i className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[#7c9cbe]" />Verifications</span></div></div>; }
