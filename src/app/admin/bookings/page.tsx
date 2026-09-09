import Link from "next/link";
import { ClipboardCheck, PackageCheck, Route, UsersRound } from "lucide-react";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { assignWorkerAction, cancelBookingAsAdminAction, confirmBookingAction } from "@/app/service-actions";
import { AdminPageHeader, AdminStatus, adminSecondaryButton } from "@/components/admin/admin-ui";
import { SubmitButton } from "@/components/ui/submit-button";
import { SupplierOrderControls } from "./supplier-order-controls";

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole("admin");
  const { status } = await searchParams;
  const supabase = await createClient();
  const statuses = ["pending", "confirmed", "assigned", "on_the_way", "in_progress", "completed", "cancelled"] as const;
  let query = supabase.from("service_bookings").select("id,customer_id,car_registration,car_make,car_model,vehicle_year,fuel_type,engine_capacity_cc,oil_product_name,oil_viscosity_grade,oil_fitment_status,city,postcode,preferred_date,preferred_time,status,quoted_price,created_at,service_types(name),employee_assignments(employee_id,status,profiles!employee_assignments_employee_id_fkey(full_name)),supplier_orders(id,status,external_reference,order_notes,suppliers(name))").order("preferred_date", { ascending: true }).order("preferred_time", { ascending: true });
  if (typeof status === "string" && (statuses as readonly string[]).includes(status)) query = query.eq("status", status as typeof statuses[number]);
  const [{ data: bookings }, { data: workers }, { data: suppliers }] = await Promise.all([query, supabase.rpc("get_admin_staff_directory"), supabase.from("suppliers").select("id,name,status").order("name")]);
  const activeWorkers = workers?.filter((worker) => worker.staff_status === "active") ?? [];
  const activeSuppliers = suppliers?.filter((supplier) => supplier.status === "active").map(({ id, name }) => ({ id, name })) ?? [];
  const queue = bookings ?? [];
  const pending = queue.filter((booking) => booking.status === "pending").length;
  const awaitingCollection = queue.filter((booking) => ["confirmed", "assigned"].includes(booking.status) && !supplierOrderFor(booking.supplier_orders)).length;
  const readyToCollect = queue.filter((booking) => supplierOrderFor(booking.supplier_orders)?.status === "ready").length;
  const assigned = queue.filter((booking) => ["assigned", "on_the_way", "in_progress"].includes(booking.status)).length;

  return <main className="mx-auto max-w-[1440px] p-5 sm:p-8">
    <AdminPageHeader eyebrow="Oil-change operations" title="Service desk" description="Confirm the visit, prepare the supplier collection, then assign the Shaz worker. Supplier orders remain internal until a trade account is active." action={<AdminStatus tone={activeSuppliers.length ? "green" : "amber"}>{activeSuppliers.length ? `${activeSuppliers.length} active supplier${activeSuppliers.length > 1 ? "s" : ""}` : "Trade supplier pending"}</AdminStatus>} />

    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="To confirm" value={pending} icon={ClipboardCheck} tone="bg-amber-50 text-amber-700" />
      <Metric label="Need supplier prep" value={awaitingCollection} icon={PackageCheck} tone="bg-red-50 text-[#e94a3f]" />
      <Metric label="Ready for collection" value={readyToCollect} icon={Route} tone="bg-violet-50 text-violet-700" />
      <Metric label="Worker in progress" value={assigned} icon={UsersRound} tone="bg-emerald-50 text-emerald-700" />
    </section>

    <nav aria-label="Booking status filters" className="mt-7 flex flex-wrap gap-2">{["all", ...statuses].map((item) => <Link key={item} href={item === "all" ? "/admin/bookings" : `/admin/bookings?status=${item}`} className={`rounded-lg border px-3 py-2 text-sm font-bold capitalize transition ${item === (status ?? "all") ? "border-[#082a30] bg-[#082a30] text-white" : "border-slate-300 bg-white text-slate-700 hover:border-[#e94a3f] hover:text-[#e94a3f]"}`}>{item.replaceAll("_", " ")}</Link>)}</nav>

    {queue.length ? <div className="mt-6 space-y-5">{queue.map((booking) => {
      const assignment = booking.employee_assignments?.find((item) => ["assigned", "accepted", "in_progress"].includes(item.status));
      const supplierOrder = supplierOrderFor(booking.supplier_orders);
      return <article key={booking.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><AdminStatus tone={bookingTone(booking.status)}>{booking.status.replaceAll("_", " ")}</AdminStatus><AdminStatus tone={booking.oil_fitment_status === "verified" ? "green" : "amber"}>{booking.oil_fitment_status === "verified" ? "Oil verified" : "Oil confirmation needed"}</AdminStatus></div><h2 className="mt-3 text-xl font-bold tracking-tight text-[#082a30]">{booking.car_make} {booking.car_model}</h2><p className="mt-1 text-sm text-slate-500">{[booking.vehicle_year, booking.car_registration, booking.fuel_type?.replaceAll("_", " "), booking.engine_capacity_cc ? `${booking.engine_capacity_cc}cc` : null].filter(Boolean).join(" · ")}</p><p className="mt-4 text-sm font-semibold text-[#082a30]">{booking.service_types?.name ?? "Oil & filter change"} · £{Number(booking.quoted_price ?? 0).toLocaleString("en-GB")}</p></div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 lg:min-w-64"><p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Customer preference</p><p className="mt-1 font-bold text-[#082a30]">{formatDate(booking.preferred_date)} · {formatTime(booking.preferred_time)}</p><p className="mt-1">{booking.city}, {booking.postcode}</p><p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">Assigned Shaz worker</p><p className="mt-1 font-semibold text-[#082a30]">{assignment?.profiles?.full_name ?? "Not assigned"}</p></div>
        </div>
        <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#e94a3f]">Service preparation</p><p className="mt-3 text-sm font-semibold text-[#082a30]">Oil: {booking.oil_product_name ? `${booking.oil_product_name}${booking.oil_viscosity_grade ? ` · ${booking.oil_viscosity_grade}` : ""}` : "Manual confirmation with supplier required"}</p><div className="mt-4 flex flex-wrap gap-3">{booking.status === "pending" && <form action={async () => { "use server"; await confirmBookingAction(booking.id); }}><SubmitButton variant="dark" size="sm" loadingText="Confirming…">Confirm booking</SubmitButton></form>}{["confirmed", "assigned"].includes(booking.status) && <form action={async (form) => { "use server"; await assignWorkerAction(booking.id, form); }} className="flex flex-wrap gap-2"><select name="workerId" required defaultValue="" className="min-w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#e94a3f] focus:ring-4 focus:ring-red-100"><option value="" disabled>{activeWorkers.length ? "Choose Shaz worker" : "No active workers"}</option>{activeWorkers.map((worker) => <option key={worker.id} value={worker.id}>{worker.full_name || worker.email || "Field worker"}{worker.email ? ` — ${worker.email}` : ""}</option>)}</select><SubmitButton variant="outline" size="sm" disabled={!activeWorkers.length} loadingText="Assigning…">{assignment ? "Reassign worker" : "Assign worker"}</SubmitButton></form>}{["pending", "confirmed", "assigned"].includes(booking.status) && <form action={async () => { "use server"; await cancelBookingAsAdminAction(booking.id); }}><button className={`${adminSecondaryButton} border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50`}>Cancel booking</button></form>}</div></section>
          <section className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#e94a3f]">Supplier collection</p><div className="mt-3"><SupplierOrderControls bookingId={booking.id} bookingStatus={booking.status} order={supplierOrder} activeSuppliers={activeSuppliers} /></div></section>
        </div>
      </article>;
    })}</div> : <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><ClipboardCheck className="mx-auto text-slate-300" size={34} /><h2 className="mt-4 text-lg font-bold text-[#082a30]">No bookings in this queue</h2><p className="mt-2 text-sm text-slate-500">New mobile oil-change bookings will appear here for the team to prepare.</p></div>}
  </main>;
}

function supplierOrderFor(order: { id: string; status: string; external_reference: string | null; order_notes: string | null; suppliers: { name: string } | null } | null) {
  return order;
}

function bookingTone(status: string): "amber" | "green" | "blue" | "red" | "slate" {
  if (status === "pending") return "amber";
  if (status === "completed") return "green";
  if (status === "cancelled") return "red";
  if (["assigned", "on_the_way", "in_progress"].includes(status)) return "blue";
  return "slate";
}

function formatDate(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)); }
function formatTime(value: string) { return value.slice(0, 5); }

function Metric({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof ClipboardCheck; tone: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><p className="text-sm font-semibold text-slate-500">{label}</p><span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span></div><p className="mt-5 text-4xl font-bold tracking-tight text-[#082a30]">{value}</p><p className="mt-1 text-xs text-slate-400">In this queue</p></div>;
}
