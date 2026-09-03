"use client";

import { useTransition } from "react";
import { ActionMenu } from "@/components/ui/action-menu";
import {
  deleteCarAction,
  toggleFeaturedAction,
  toggleVerifiedAction,
} from "@/app/marketplace-actions";

export function AdminCarControls({
  carId,
  isFeatured,
  isVerified,
}: {
  carId: string;
  isFeatured: boolean;
  isVerified: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <ActionMenu>
      <button
        onClick={() => {
          startTransition(async () => {
            await toggleFeaturedAction(carId, isFeatured);
          });
        }}
        disabled={isPending}
        className="block w-full px-4 py-2.5 text-left text-[14px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {isFeatured ? "Unfeature Listing" : "Mark as Featured"}
      </button>

      <button
        onClick={() => {
          startTransition(async () => {
            await toggleVerifiedAction(carId, isVerified);
          });
        }}
        disabled={isPending}
        className="block w-full px-4 py-2.5 text-left text-[14px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {isVerified ? "Remove Verification" : "Mark as Verified"}
      </button>

      <div className="my-1 h-px bg-slate-100" />

      <button
        onClick={() => {
          if (confirm("Are you sure you want to permanently delete this listing?")) {
            startTransition(async () => {
              await deleteCarAction(carId, "/admin/cars");
            });
          }
        }}
        disabled={isPending}
        className="block w-full px-4 py-2.5 text-left text-[14px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Delete Listing
      </button>
    </ActionMenu>
  );
}
