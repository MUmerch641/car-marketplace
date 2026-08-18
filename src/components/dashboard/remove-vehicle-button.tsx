"use client";

import { useTransition } from "react";
import { removeGarageVehicleAction } from "@/app/dashboard/garage/actions";

export function RemoveVehicleButton({ vehicleId }: { vehicleId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    if (window.confirm("Are you sure you want to remove this vehicle from your garage?")) {
      startTransition(async () => {
        await removeGarageVehicleAction(vehicleId);
      });
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleRemove}
      disabled={isPending}
      className="inline-flex h-8 items-center justify-center text-[13px] font-bold text-slate-400 transition-colors hover:text-red-600 disabled:pointer-events-none disabled:opacity-50"
    >
      {isPending ? "Removing..." : "Remove vehicle"}
    </button>
  );
}
