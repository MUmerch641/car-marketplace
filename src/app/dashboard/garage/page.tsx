import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { AddVehicleSection } from "./add-vehicle-form";
import { RemoveVehicleButton } from "@/components/dashboard/remove-vehicle-button";
import { ActionMenu } from "@/components/ui/action-menu";
import { CarFront } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "My Garage | Shaz",
};

// Helper for formatting casing
const formatWord = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default async function GaragePage() {
  const user = await requireUser();
  const supabase = await createClient();
  
  const { data: garageVehicles } = await supabase
    .from("garage_vehicles")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const vehicles = garageVehicles || [];

  return (
    <main className="bg-[#f7f8fa] py-10 sm:py-16 min-h-screen">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        
        <AddVehicleSection />

        <div className="w-full">
          {vehicles.length > 0 && (
            <h2 className="text-[20px] sm:text-[24px] font-bold text-[#0b1f33] mb-6">Your Vehicles</h2>
          )}
          
          {vehicles.length > 0 ? (
             <div className="flex flex-col gap-4">
               {vehicles.map((vehicle) => (
                 <div key={vehicle.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
                   {/* Visual Area */}
                   <div className="h-16 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-24 relative flex items-center justify-center">
                     <CarFront size={22} className="text-slate-400" strokeWidth={2} />
                   </div>

                   {/* Content Area */}
                   <div className="min-w-0 flex-1">
                     <div className="flex items-center gap-3">
                       <h3 className="truncate text-sm font-semibold text-[#0b1f33]">
                         {vehicle.year} {vehicle.make} {vehicle.model}
                       </h3>
                       {vehicle.registration && (
                         <div className="inline-block shrink-0 rounded border border-yellow-500 bg-[#FACC15] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-900">
                           <span className="mr-1 text-[8px] font-black text-[#003399]">UK</span>{vehicle.registration}
                         </div>
                       )}
                     </div>
                     <p className="mt-1 text-sm text-slate-500">
                       {formatWord(vehicle.fuel_type)}
                       <span className="px-1 text-slate-300">|</span>
                       {formatWord(vehicle.colour)}
                     </p>
                   </div>

                   {/* Actions Area */}
                   <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end border-t border-slate-100 sm:border-0 pt-4 sm:pt-0">
                     <div className="flex items-center gap-3 text-sm font-semibold">
                       <Link href="/services" className="text-slate-700 hover:text-[#0b1f33]">
                         Book Service
                       </Link>
                       <Link href={`/parts?vehicleId=${vehicle.id}`} className="text-[#d92d20] hover:text-[#b42318]">
                         Compatible Parts
                       </Link>
                       <ActionMenu>
                         <RemoveVehicleButton vehicleId={vehicle.id} />
                       </ActionMenu>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          ) : (
            <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-white p-12 sm:p-20 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 shadow-sm border border-slate-100">
                <CarFront size={28} className="text-slate-400" />
              </div>
              <p className="mt-6 text-[18px] font-bold text-[#0b1f33]">No vehicles in your garage yet</p>
              <p className="mt-2.5 text-[15px] text-slate-500 max-w-sm mx-auto leading-relaxed">Add your first vehicle to make future services and inspections quicker.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
