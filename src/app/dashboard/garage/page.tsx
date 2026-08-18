import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { AddVehicleSection } from "./add-vehicle-form";
import { RemoveVehicleButton } from "@/components/dashboard/remove-vehicle-button";
import { CarFront } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "My Garage | Fengxing",
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
             <div className="flex flex-col gap-6">
               {vehicles.map((vehicle) => (
                 <div key={vehicle.id} className="flex flex-col md:flex-row w-full bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:border-slate-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)]">
                   {/* Visual Area */}
                   <div className="w-full md:w-[220px] bg-slate-50 flex items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-slate-100 p-10 md:p-0 min-h-[160px]">
                     <CarFront size={72} className="text-slate-300" strokeWidth={1} />
                   </div>

                   {/* Content Area */}
                   <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                     <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                       <div>
                         <h3 className="text-[22px] sm:text-[26px] font-black text-[#0b1f33] leading-none uppercase tracking-tight">
                           {vehicle.make}
                         </h3>
                         <p className="text-[15px] sm:text-[17px] font-bold text-slate-500 mt-2 uppercase tracking-wide">
                           {vehicle.model}
                         </p>
                         
                         <div className="mt-4 flex items-center gap-2.5 text-[14px] sm:text-[15px] font-medium text-slate-500">
                           <span>{vehicle.year}</span>
                           <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                           <span>{formatWord(vehicle.fuel_type)}</span>
                           <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                           <span>{formatWord(vehicle.colour)}</span>
                         </div>
                       </div>
                       
                       {/* Registration */}
                       <div className="shrink-0">
                         <div className="inline-flex items-center overflow-hidden rounded-md border-2 border-slate-900 bg-[#FACC15] shadow-sm h-[38px] sm:h-[42px]">
                           <div className="flex h-full w-7 sm:w-8 shrink-0 flex-col items-center justify-end bg-[#003399] pb-1">
                             <span className="text-[8px] font-bold leading-none tracking-tighter text-white">UK</span>
                           </div>
                           <div className="px-3.5 text-[16px] sm:text-[18px] font-bold uppercase tracking-widest text-slate-900">
                             {vehicle.registration}
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Actions */}
                     <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
                       <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                         <Link href="/services" className="w-full sm:w-auto rounded-xl bg-[#0b1f33] px-6 py-2.5 text-center text-[14px] font-bold text-white transition-colors hover:bg-slate-800">
                           Book Service
                         </Link>
                         <button type="button" className="w-full sm:w-auto rounded-xl bg-slate-100 px-6 py-2.5 text-center text-[14px] font-bold text-[#0b1f33] transition-colors hover:bg-slate-200">
                           Vehicle Details
                         </button>
                       </div>
                       
                       <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                         <RemoveVehicleButton vehicleId={vehicle.id} />
                       </div>
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
