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
      className="block w-full px-4 py-2.5 text-left text-[14px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50"
    >
      {isPending ? "Removing..." : "Remove vehicle"}
    </button>
  );
}
