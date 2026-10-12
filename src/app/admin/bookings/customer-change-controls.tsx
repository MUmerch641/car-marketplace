"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ChangeRequest = { id:string;action:string;new_date:string|null;new_time:string|null;reason:string|null;status:string };
export function CustomerChangeControls({ bookingId }: { bookingId:string }) {
  const supabase=useMemo(()=>createClient(),[]);
  const router=useRouter();
  const [requests,setRequests]=useState<ChangeRequest[]>([]);
  const [busy,setBusy]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [failed,setFailed]=useState(false);
  const refresh = useCallback(() => {
    return supabase.functions.invoke("shaz-booking-change", { body: { action: "admin-status", bookingId } })
      .then(({ data, error }) => {
        if (error || !data) { setFailed(true); return; }
        setFailed(false); setRequests(data.requests ?? []);
      })
      .catch(() => setFailed(true));
  }, [bookingId, supabase]);
  useEffect(() => { void refresh(); }, [refresh]);
  async function review(requestId:string,approve:boolean) {
    if (busy) return;
    setBusy(requestId);setMessage("");
    try {
      const { data,error }=await supabase.functions.invoke("shaz-booking-change",{ body:{ action:"admin-review",bookingId,requestId,approve } });
      if (error) throw new Error("Unable to review this request. Refresh the service desk and try again.");
      setMessage(data.message);await refresh();router.refresh();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to review request."); }
    finally { setBusy(null); }
  }
  if (!requests.length && !failed) return null;
  return <section className="border-t border-slate-200 p-5 sm:p-6"><h3 className="font-bold text-[#082A30]">Customer visit changes</h3>
    {failed ? <button type="button" onClick={()=>void refresh()} className="mt-2 text-sm underline">Unable to load changes. Retry</button> : null}
    {requests.map(request=><div key={request.id} className="mt-3 rounded-xl bg-[#F7F4EF] p-4 text-sm"><p className="font-semibold">{request.action === "reschedule" ? "Requested date change" : "Cancellation / refund review"} · {request.status.replaceAll("_"," ")}</p>
      {request.new_date ? <p className="mt-1">{request.new_date} · {request.new_time?.slice(0,5)} · UK time</p> : null}
      {request.reason ? <p className="mt-2 text-slate-600">{request.reason}</p> : null}
      {request.action === "reschedule" && request.status === "requested" ? <><p className="mt-2 text-slate-600">Confirm availability before approving. The existing quote and payments are retained.</p><div className="mt-3 flex flex-wrap gap-3"><button disabled={busy!==null} type="button" onClick={()=>void review(request.id,true)} className="rounded-lg bg-[#082A30] px-4 py-3 font-semibold text-white disabled:opacity-50">Confirm new appointment</button><button disabled={busy!==null} type="button" onClick={()=>void review(request.id,false)} className="rounded-lg border border-slate-300 px-4 py-3 font-semibold disabled:opacity-50">Keep existing appointment</button></div></> : null}
      {request.action === "cancel" && request.status === "review_required" ? <p className="mt-2 text-slate-600">Review the payment and confirmed refund in Stripe before closing this case.</p> : null}
    </div>)}
    {message ? <p role="status" className="mt-3 text-sm">{message}</p> : null}
  </section>;
}
