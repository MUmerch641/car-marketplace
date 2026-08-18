import { getPartCategories, getParts, getCompatiblePartsForVehicle } from "@/lib/services/parts";
import { createClient } from "@/lib/supabase/server";
import { PartsGrid } from "@/components/parts/parts-grid";
import { CarFront, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { PartWithImage } from "@/types/parts.types";

export const metadata = {
  title: "Fengxing Parts | UK Automotive Marketplace",
};

export default async function PartsPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string; category?: string }>;
}) {
  const query = await searchParams;
  const vehicleId = query.vehicleId;
  const categoryId = query.category;
  
  const categories = await getPartCategories();
  
  let parts: PartWithImage[] = [];
  let vehicle = null;

  if (vehicleId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("garage_vehicles")
      .select("*")
      .eq("id", vehicleId)
      .single();
    
    if (data) {
      vehicle = data;
      parts = await getCompatiblePartsForVehicle(vehicleId);
      
      // Still allow filtering by category while in vehicle compatibility mode
      if (categoryId) {
        parts = parts.filter(p => p.category_id === categoryId);
      }
    } else {
      parts = await getParts(categoryId);
    }
  } else {
    parts = await getParts(categoryId);
  }

  return (
    <main className="bg-[#f7f8fa] min-h-screen">
      {/* Vehicle Context Banner */}
      {vehicle && (
        <div className="bg-[#0b1f33] text-white">
          <div className="mx-auto flex max-w-[1400px] flex-col sm:flex-row items-center gap-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <CarFront size={24} className="text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-[14px] font-semibold text-white/70 uppercase tracking-widest mb-1">Guaranteed Fitment for</h2>
              <p className="text-[18px] sm:text-[20px] font-bold">
                {vehicle.make.toUpperCase()} {vehicle.model.toUpperCase()} ({vehicle.year})
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <div className="inline-flex items-center overflow-hidden rounded border border-[#0b1f33] bg-[#FACC15] shadow-sm h-[32px]">
                <div className="flex h-full w-6 shrink-0 flex-col items-center justify-end bg-[#003399] pb-0.5">
                  <span className="text-[7px] font-bold leading-none tracking-tighter text-white">UK</span>
                </div>
                <div className="px-3 text-[14px] font-bold uppercase tracking-widest text-slate-900">
                  {vehicle.registration}
                </div>
              </div>
              <Link href="/parts" className="text-[13px] font-semibold text-white/70 hover:text-white underline underline-offset-2">
                Clear vehicle
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!vehicle && (
           <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-4">
               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#d92d20]/10">
                 <AlertCircle size={24} className="text-[#d92d20]" />
               </div>
               <div>
                 <h2 className="text-[16px] font-bold text-[#0b1f33]">Ensure part fitment</h2>
                 <p className="text-[14px] text-slate-500">Select a vehicle from your garage to only see compatible parts.</p>
               </div>
             </div>
             <Link href="/dashboard/garage" className="shrink-0 rounded-xl bg-[#0b1f33] px-5 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-slate-800">
               Go to My Garage
             </Link>
           </div>
        )}

        <PartsGrid parts={parts} categories={categories} currentCategory={categoryId} />
      </div>
    </main>
  );
}
