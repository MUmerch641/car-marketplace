import Link from "next/link";
import { ClipboardCheck, UserPlus, Eye, Check } from "lucide-react";
import { AdminPageHeader, AdminStatus, adminInput, adminSecondaryButton } from "@/components/admin/admin-ui";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { assignVerification, scheduleVerification, verificationAdmin } from "@/app/verification-actions";

const requestedDateTime = (date: string | null, time: string | null) => (date && time ? `${date}T${time}` : "");
const readable = (date: string | null, time: string | null) =>
  date && time
    ? `${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
        new Date(date)
      )} · ${new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).format(
        new Date(`1970-01-01T${time}`)
      )}`
    : "Not provided";

export default async function Page() {
  await requireRole("admin");
  const supabase = await createClient();
  const [{ data: requests }, { data: workers }] = await Promise.all([
    supabase
      .from("verification_requests")
      .select("*,inspection_reports(id),employee_assignments(employee_id,status)")
      .order("created_at", { ascending: false }),
    supabase.rpc("get_admin_staff_directory"),
  ]);

  const activeWorkers = workers?.filter((worker) => worker.staff_status === "active") ?? [];

  return (
    <main className="mx-auto max-w-[1440px] p-5 sm:p-8">
      <AdminPageHeader
        eyebrow="Inspection operations"
        title="Verification requests"
        description="Confirm requests, allocate a qualified inspector, then schedule the vehicle visit."
        action={
          <AdminStatus tone={activeWorkers.length ? "green" : "amber"}>
            {activeWorkers.length} inspectors available
          </AdminStatus>
        }
      />

      {!activeWorkers.length && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-amber-900">No active inspectors are available to assign</p>
            <p className="mt-1 text-sm text-amber-800">
              Create or enable a field worker in Staff Access before assigning this request.
            </p>
          </div>
          <Link href="/admin/staff" className={adminSecondaryButton}>
            <UserPlus size={16} className="mr-2" />
            Manage staff
          </Link>
        </div>
      )}

      <div className="mt-7 space-y-3">
        {requests?.length ? (
          requests.map((request) => (
            <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminStatus
                      tone={
                        request.status === "pending"
                          ? "amber"
                          : request.status === "report_submitted"
                          ? "blue"
                          : request.status === "completed"
                          ? "green"
                          : "slate"
                      }
                    >
                      {request.status.replaceAll("_", " ")}
                    </AdminStatus>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {request.inspection_type === "seller_pre_inspection"
                        ? "Seller pre-inspection"
                        : "Buyer inspection"}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-[#0b1f33]">
                    {request.vehicle_registration} · {request.city}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Requested: {readable(request.preferred_date, request.preferred_time)}
                  </p>
                </div>

                <div className="w-full lg:w-auto flex flex-wrap items-center gap-2">
                  {request.status === "pending" && (
                    <form
                      action={async () => {
                        "use server";
                        await verificationAdmin(request.id, "confirm");
                      }}
                    >
                      <SubmitButton variant="dark" loadingText="Confirming...">
                        <ClipboardCheck size={16} className="mr-2" />
                        Confirm request
                      </SubmitButton>
                    </form>
                  )}

                  {["confirmed", "assigned"].includes(request.status) && (
                    <form
                      action={async (form) => {
                        "use server";
                        await assignVerification(request.id, form);
                      }}
                      className="flex flex-col gap-2 sm:flex-row"
                    >
                      <select
                        name="inspector"
                        required
                        disabled={!activeWorkers.length}
                        defaultValue=""
                        className={`${adminInput} min-w-64`}
                      >
                        <option value="" disabled>
                          {activeWorkers.length ? "Choose an inspector" : "No active inspectors"}
                        </option>
                        {activeWorkers.map((worker) => (
                          <option key={worker.id} value={worker.id}>
                            {worker.full_name || worker.email || "Inspector"} — {worker.email || "Email unavailable"}
                          </option>
                        ))}
                      </select>
                      <SubmitButton variant="dark" loadingText="Assigning..." disabled={!activeWorkers.length}>
                        Assign
                      </SubmitButton>
                    </form>
                  )}

                  {request.status === "assigned" && (
                    <div className="mt-2 space-y-2">
                      <form
                        action={async (form) => {
                          "use server";
                          await scheduleVerification(request.id, form);
                        }}
                      >
                        <input
                          type="hidden"
                          name="scheduledFor"
                          value={requestedDateTime(request.preferred_date, request.preferred_time)}
                        />
                        <SubmitButton
                          variant="secondary"
                          loadingText="Scheduling..."
                          disabled={!requestedDateTime(request.preferred_date, request.preferred_time)}
                        >
                          Confirm requested time
                        </SubmitButton>
                      </form>
                      <details>
                        <summary className="cursor-pointer text-sm font-semibold text-[#d92d20]">Change time</summary>
                        <form
                          action={async (form) => {
                            "use server";
                            await scheduleVerification(request.id, form);
                          }}
                          className="mt-2 flex flex-col gap-2 sm:flex-row"
                        >
                          <input name="scheduledFor" type="datetime-local" required className={adminInput} />
                          <SubmitButton variant="secondary" loadingText="Scheduling...">
                            Schedule changed time
                          </SubmitButton>
                        </form>
                      </details>
                    </div>
                  )}

                  {(request.status === "report_submitted" || request.status === "completed" || request.status === "inspection_in_progress") && (
                    <Link href={`/admin/verifications/${request.id}`} className={adminSecondaryButton}>
                      <Eye size={16} className="mr-1.5" />
                      View Submitted Report
                    </Link>
                  )}

                  {request.status === "report_submitted" && (
                    <form
                      action={async () => {
                        "use server";
                        await verificationAdmin(request.id, "finalise");
                      }}
                    >
                      <SubmitButton variant="dark" loadingText="Finalising...">
                        <Check size={16} className="mr-1.5" />
                        Finalise report
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
            No verification requests yet.
          </div>
        )}
      </div>
    </main>
  );
}
