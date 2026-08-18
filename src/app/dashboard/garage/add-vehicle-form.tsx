"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { VehicleLookupResult } from "@/lib/services/vehicle-lookup";
import { lookupVehicleAction, addGarageVehicleAction } from "./actions";
import { useRouter } from "next/navigation";

export function AddVehicleSection() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState("");

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistration(e.target.value.toUpperCase().replace(/\s/g, ''));
  };

  const [vehicle, setVehicle] = useState<VehicleLookupResult | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!registration.trim()) return;
    
    setLoading(true);
    setError(null);
    setVehicle(null);
    
    // Lookup vehicle
    const formData = new FormData();
    formData.append("registration", registration);
    const lookupResult = await lookupVehicleAction(formData);
    
    if (lookupResult?.error) {
      setError(lookupResult.error);
      setLoading(false);
      return;
    }
    
    if (!lookupResult?.data) {
      setError("Vehicle not found.");
      setLoading(false);
      return;
    }

    setVehicle(lookupResult.data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!vehicle) return;
    setLoading(true);
    setError(null);

    // Immediately save it
    const addResult = await addGarageVehicleAction(vehicle);
    
    if (addResult?.error) {
      setError(addResult.error);
      setLoading(false);
    } else {
      setRegistration("");
      setVehicle(null);
      setLoading(false);
      setIsExpanded(false); // Close panel on success
      router.refresh(); 
    }
  };

  const hasValidRegistration = registration.trim().length >= 2;

  // Auto focus input when opened
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isExpanded]);

  return (
    <div className="w-full">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 mb-8 border-b border-slate-200">
        <div>
          <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-[#0b1f33]">My Garage</h1>
          <p className="mt-2 text-[15px] sm:text-[16px] text-slate-500 max-w-xl">Manage your vehicles, services and inspections in one place.</p>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="shrink-0 inline-flex items-center justify-center rounded-xl bg-[#0b1f33] px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-slate-800 shadow-sm"
        >
          {isExpanded ? 'Cancel' : '+ Add Vehicle'}
        </button>
      </header>

      {/* Expandable Add Vehicle Panel */}
      {isExpanded && (
        <div className="mb-10 w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-[18px] font-bold text-[#0b1f33] mb-4">Add a new vehicle</h3>
            
            {!vehicle ? (
              <form onSubmit={handleSubmit} className="w-full max-w-[420px]">
                <label htmlFor="registration" className="block text-[14px] font-medium text-slate-600 mb-2">
                  Enter your UK registration to find your vehicle.
                </label>
                
                <div className="flex flex-col gap-4">
                  <div className="flex h-[52px] sm:h-[56px] w-full items-center overflow-hidden rounded-xl border-2 border-slate-900 bg-[#FACC15] shadow-sm transition-all focus-within:border-[#003399]">
                    <div className="flex h-full w-10 sm:w-12 shrink-0 flex-col items-center justify-end bg-[#003399] pb-1.5">
                      <span className="text-[9px] font-bold leading-none tracking-tighter text-white">UK</span>
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      name="registration"
                      id="registration"
                      required
                      value={registration}
                      onChange={handleRegistrationChange}
                      placeholder="AB12 CDE"
                      className="m-0 w-full flex-1 border-none bg-transparent px-4 py-0 text-[22px] sm:text-[24px] font-bold uppercase tracking-[0.1em] outline-none focus:ring-0 placeholder:text-[#0b1f33]/40 text-slate-900"
                      autoComplete="off"
                      maxLength={10}
                    />
                  </div>
                  
                  {error && (
                    <div className="rounded-xl bg-red-50 p-4 text-[14px] font-semibold text-red-800 border border-red-100">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !hasValidRegistration}
                    className={`flex h-[52px] sm:h-[56px] w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold transition-all ${
                      !hasValidRegistration 
                        ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                        : 'bg-[#0b1f33] text-white hover:bg-slate-800 shadow-sm'
                    } disabled:pointer-events-none`}
                  >
                    {loading && <Loader2 size={18} className="animate-spin text-current" />}
                    {loading ? "Finding vehicle..." : "Find Vehicle"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="w-full max-w-[420px] animate-in fade-in duration-300">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 mb-5">
                  <h4 className="text-[16px] font-bold text-[#0b1f33]">{vehicle.make} {vehicle.model}</h4>
                  <p className="text-[14px] text-slate-500 mt-1">{vehicle.year} · {vehicle.colour} · {vehicle.fuel_type}</p>
                </div>

                {error && (
                  <div className="mb-5 rounded-xl bg-red-50 p-4 text-[14px] font-semibold text-red-800 border border-red-100">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setVehicle(null); setError(null); }}
                    disabled={loading}
                    className="flex h-[48px] w-[100px] items-center justify-center rounded-xl border border-slate-300 bg-white text-[14px] font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="flex h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b1f33] text-[14px] font-bold text-white transition-colors hover:bg-slate-800 shadow-sm disabled:opacity-50"
                  >
                    {loading && <Loader2 size={18} className="animate-spin text-white" />}
                    {loading ? "Saving..." : "Confirm & Save"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
