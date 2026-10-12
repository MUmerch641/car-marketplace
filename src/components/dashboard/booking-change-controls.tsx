"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, MessageSquareText, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ChangeRequest = {
  id: string;
  action: "cancel" | "reschedule";
  new_date: string | null;
  new_time: string | null;
  status: string;
};

type ChangeStatus = {
  canChange: boolean;
  deadline: string | null;
  bookingStatus: string;
  policy: { cutoff_hours: number | null; refund_policy: "full" | "manual_review" | null };
  requests: ChangeRequest[];
};

async function requestChangeStatus(supabase: ReturnType<typeof createClient>, bookingId: string) {
  const { data, error } = await supabase.functions.invoke("shaz-booking-change", { body: { action: "status", bookingId } });
  if (error) {
    if (error.context instanceof Response) {
      const payload = await error.context.json().catch(() => null) as { message?: string } | null;
      if (payload?.message) throw new Error(payload.message);
    }
    throw new Error("Visit changes are unavailable right now. Please contact Shaz.");
  }
  return data as ChangeStatus;
}

export function BookingChangeControls({ bookingId }: { bookingId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [status, setStatus] = useState<ChangeStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadStatus() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      setStatus(await requestChangeStatus(supabase, bookingId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Visit changes are unavailable right now. Please contact Shaz.");
    } finally {
      setLoading(false);
    }
  }

  async function submitChange(action: "cancel" | "reschedule") {
    if (busy || !status?.canChange) return;
    if (action === "reschedule" && (!date || !time)) {
      setError("Choose a new date and time first.");
      return;
    }
    if (action === "cancel" && !window.confirm(status.policy.refund_policy === "full"
      ? "Cancel this visit and request a full refund?"
      : "Cancel this visit? Shaz will review any refund.")) return;

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("shaz-booking-change", {
        body: {
          action,
          bookingId,
          reason,
          ...(action === "reschedule" ? { newDate: date, newTime: time } : {}),
        },
      });
      if (invokeError) {
        if (invokeError.context instanceof Response) {
          const payload = await invokeError.context.json().catch(() => null) as { message?: string } | null;
          if (payload?.message) throw new Error(payload.message);
        }
        throw new Error("Unable to update this visit. Please contact Shaz.");
      }
      setMessage(typeof data?.message === "string" ? data.message : "Your request has been sent to Shaz.");
      setStatus(await requestChangeStatus(supabase, bookingId));
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update this visit. Please contact Shaz.");
    } finally {
      setBusy(false);
    }
  }

  const openDateChange = status?.requests.find((request) => request.action === "reschedule" && request.status === "requested");
  const deadline = status?.deadline
    ? new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(new Date(status.deadline))
    : null;
  const terminal = ["completed", "cancelled"].includes(status?.bookingStatus ?? "");

  return (
    <section className="mt-6 rounded-3xl border border-[#E4E7E3] bg-white p-5 shadow-sm" aria-labelledby="booking-change-heading">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FFF5F4] text-[#E94A3F]"><CalendarClock size={19} /></span>
        <div className="min-w-0 flex-1">
          <h2 id="booking-change-heading" className="font-bold text-[#082A30]">Manage this visit</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Check whether you can cancel or request a different date for your visit.</p>
        </div>
      </div>

      {!status && <button type="button" onClick={() => void loadStatus()} disabled={loading} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-[#082A30] disabled:opacity-60"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />{loading ? "Checking options…" : "Check change options"}</button>}

      {status && <div className="mt-4 space-y-4">
        {deadline && <p className="text-sm text-slate-600">Online change deadline: <span className="font-semibold text-[#082A30]">{deadline}</span></p>}
        {openDateChange && <div className="rounded-xl bg-[#F7F4EF] p-4"><p className="font-semibold text-[#082A30]">Date change waiting for Shaz</p><p className="mt-1 text-sm text-slate-600">Requested {openDateChange.new_date} at {openDateChange.new_time?.slice(0, 5)}. Your current appointment stays in place until it is confirmed.</p></div>}

        {status.canChange ? <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label htmlFor="change-date" className="input-label">New preferred date</label><input id="change-date" type="date" min={ukToday()} value={date} onChange={(event) => setDate(event.target.value)} className="input-standard w-full" /></div>
            <div><label htmlFor="change-time" className="input-label">New preferred time</label><input id="change-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} className="input-standard w-full" /></div>
          </div>
          <div><label htmlFor="change-reason" className="input-label">Reason <span className="font-normal text-slate-500">(optional)</span></label><input id="change-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} className="input-standard w-full" placeholder="Tell us what changed" /></div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => void submitChange("reschedule")} disabled={busy || !!openDateChange} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#082A30] px-4 text-sm font-bold text-white disabled:opacity-50"><CalendarClock size={16} />{busy ? "Sending…" : "Request date change"}</button>
            {status.policy.refund_policy && <button type="button" onClick={() => void submitChange("cancel")} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#C73830] px-4 text-sm font-bold text-[#C73830] disabled:opacity-50">Cancel visit</button>}
          </div>
          <p className="text-sm leading-6 text-slate-600">{status.policy.refund_policy === "full" ? "Eligible cancellations receive a full refund. Stripe confirms the refund status in your booking." : status.policy.refund_policy === "manual_review" ? "Shaz reviews the refund for a paid cancellation." : "Cancellation and refund options are currently handled by Shaz. Contact us before cancelling a paid visit."}</p>
        </> : <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm leading-6 text-slate-700">{terminal ? "For help with this visit, contact Shaz." : "Online changes are not enabled for this visit yet. Contact Shaz to cancel or request a new date."}</div>}

        {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800" role="status">{message}</p>}
        <button type="button" onClick={() => void loadStatus()} disabled={loading || busy} className="text-sm font-semibold text-[#C73830] underline underline-offset-2 disabled:opacity-50">Refresh options</button>
      </div>}

      {error && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900" role="alert">{error} Contact Shaz if you need to change the visit.</p>}
      <a href="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#C73830] hover:underline"><MessageSquareText size={16} /> Contact Shaz</a>
    </section>
  );
}

function ukToday() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
