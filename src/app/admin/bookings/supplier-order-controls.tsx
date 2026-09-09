"use client";

import { useActionState } from "react";
import { CircleAlert, PackageCheck } from "lucide-react";
import { createSupplierOrderAction, updateSupplierOrderAction } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";

type Supplier = { id: string; name: string };
type SupplierOrder = {
  id: string;
  status: string;
  external_reference: string | null;
  order_notes: string | null;
  suppliers: { name: string } | { name: string }[] | null;
};

type Props = {
  bookingId: string;
  bookingStatus: string;
  order: SupplierOrder | null;
  activeSuppliers: Supplier[];
};

type State = { error?: string; success?: string };
const initialState: State = {};

async function createOrder(_: State, form: FormData): Promise<State> {
  try {
    await createSupplierOrderAction(form);
    return { success: "Supplier collection created." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to create supplier collection." };
  }
}

async function updateOrder(_: State, form: FormData): Promise<State> {
  try {
    await updateSupplierOrderAction(form);
    return { success: "Supplier collection updated." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update supplier collection." };
  }
}

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#e94a3f] focus:ring-4 focus:ring-red-100";
const labels: Record<string, string> = {
  draft: "Draft",
  sent: "Sent to supplier",
  acknowledged: "Supplier acknowledged",
  ready: "Ready for collection",
  collected: "Collected",
  cancelled: "Cancelled",
};
const nextStatuses: Record<string, string[]> = {
  draft: ["draft", "sent", "cancelled"],
  sent: ["sent", "acknowledged", "cancelled"],
  acknowledged: ["acknowledged", "ready", "cancelled"],
  ready: ["ready", "collected", "cancelled"],
  collected: ["collected"],
  cancelled: ["cancelled"],
};

export function SupplierOrderControls({ bookingId, bookingStatus, order, activeSuppliers }: Props) {
  const [state, action, pending] = useActionState(order ? updateOrder : createOrder, initialState);
  const canPrepare = ["confirmed", "assigned"].includes(bookingStatus);
  const supplier = order?.suppliers ? (Array.isArray(order.suppliers) ? order.suppliers[0] : order.suppliers) : null;

  if (!order && !canPrepare) {
    return <p className="text-sm leading-6 text-slate-500">Confirm this booking before preparing oil and filter collection.</p>;
  }

  if (!order && !activeSuppliers.length) {
    return <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><CircleAlert className="mt-0.5 shrink-0" size={18} /><p><strong>No active supplier yet.</strong> Open Oil &amp; fitments after the branch confirms Shaz’s trade account, then mark the supplier active.</p></div>;
  }

  return <form action={action} className="space-y-3">
    <input type="hidden" name="bookingId" value={bookingId} />
    {order ? <input type="hidden" name="orderId" value={order.id} /> : <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Supplier</label><select name="supplierId" required className={inputClass}><option value="">Choose active supplier</option>{activeSuppliers.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div>}
    {order && <div className="flex items-center gap-2 text-sm font-semibold text-[#082a30]"><PackageCheck size={17} className="text-[#e94a3f]" />{supplier?.name ?? "Supplier collection"}</div>}
    <div className="grid gap-3 sm:grid-cols-2">
      <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Supplier reference</label><input name="externalReference" defaultValue={order?.external_reference ?? ""} placeholder="Order or collection number" className={inputClass} /></div>
      {order && <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Collection status</label><select name="status" defaultValue={order.status} className={inputClass}>{(nextStatuses[order.status] ?? [order.status]).map((value) => <option value={value} key={value}>{labels[value] ?? value}</option>)}</select></div>}
    </div>
    <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Internal collection notes</label><textarea name="orderNotes" rows={2} defaultValue={order?.order_notes ?? ""} placeholder="Branch, products confirmed, collection instructions…" className={`${inputClass} resize-y`} /></div>
    {state.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.error}</p>}
    {state.success && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{state.success}</p>}
    <SubmitButton loadingText={order ? "Saving…" : "Creating…"} variant={order ? "outline" : "dark"} size="sm" disabled={pending}>{order ? "Save collection update" : "Prepare supplier collection"}</SubmitButton>
  </form>;
}
