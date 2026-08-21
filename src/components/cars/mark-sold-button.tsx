"use client";

import { useTransition, useState } from "react";
import { markSoldAction } from "@/app/marketplace-actions";

export function MarkSoldButton({ carId }: { carId: string }) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <>
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setErrorMsg(null);
          startTransition(async () => {
            const res = await markSoldAction(carId);
            if (res?.error) {
              setErrorMsg(res.error);
            }
          });
        }} 
        disabled={isPending}
        className="block w-full px-4 py-2.5 text-left text-[14px] font-semibold text-[#039855] transition-colors hover:bg-emerald-50 disabled:opacity-50"
      >
        {isPending ? "Marking sold..." : "Mark Sold"}
      </button>
      {errorMsg && (
        <div className="px-4 pb-2 text-xs font-semibold text-red-600">
          {errorMsg}
        </div>
      )}
    </>
  );
}
