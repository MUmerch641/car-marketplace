"use client";

import { useState, useTransition } from "react";
import { cancelVerificationRequest } from "@/app/verification-actions";

export function CancelInspectionRequest({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  return <div className="mt-6"><button type="button" disabled={pending} onClick={() => { if (!window.confirm("Cancel this inspection request? This cannot be undone.")) return; startTransition(async () => { const result = await cancelVerificationRequest(id); setError(result.error); }); }} className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">{pending ? "Cancelling…" : "Cancel inspection request"}</button>{error && <p className="mt-2 text-sm text-red-700">{error}</p>}</div>;
}
