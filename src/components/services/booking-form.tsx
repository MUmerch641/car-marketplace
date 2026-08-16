"use client";

import { useEffect, useActionState } from "react";
import { createServiceBookingAction } from "@/app/service-actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { toast } from "@/components/ui/toast";

export function BookingForm({ service }: { service: { id: string; name: string; basePrice: number } }) {
  const [state, action, pending] = useActionState(createServiceBookingAction, {});

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="serviceId" value={service.id} />
      
      {/* Service summary */}
      <div className="rounded-xl border border-brand bg-[#FFF5F4] p-6">
        <p className="font-h4 text-ink">{service.name}</p>
        <p className="mt-2 text-[#667085]">
          From £{service.basePrice.toLocaleString("en-GB")}. Your preferred time is confirmed by our team.
        </p>
      </div>

      {/* Vehicle section */}
      <div>
        <h3 className="font-h3 text-ink">Vehicle details</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field name="carMake" label="Vehicle make" required />
          <Field name="carModel" label="Vehicle model" required />
          <Field name="carRegistration" label="Registration" />
        </div>
      </div>

      {/* Location section */}
      <div>
        <h3 className="font-h3 text-ink">Location</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field name="postcode" label="Postcode" required />
          <Field name="addressLine1" label="Address line 1" required />
          <div className="md:col-span-2">
            <Field name="addressLine2" label="Address line 2 (optional)" />
          </div>
          <Field name="city" label="City" required />
        </div>
      </div>

      {/* Schedule section */}
      <div>
        <h3 className="font-h3 text-ink">Preferred schedule</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field name="preferredDate" label="Preferred date" type="date" required />
          <Field name="preferredTime" label="Preferred time" type="time" required />
        </div>
      </div>

      {/* Notes section */}
      <div>
        <label htmlFor="notes" className="input-label">Additional notes (optional)</label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="input-standard resize-none"
          placeholder="Any specific requirements or information for the worker..."
        />
      </div>

      {/* Error handling */}
      {state.error && <p className="input-error" role="alert">{state.error}</p>}

      {/* Submit button */}
      <SubmitButton
        variant="primary"
        size="lg"
        loadingText="Submitting booking..."
        className="w-full py-3 text.base"
      >
        Request booking
      </SubmitButton>
    </form>
  );
}

function Field({ name, label, required, type = "text" }: { name: string; label: string; required?: boolean; type?: string }) {
  return (
    <div>
      <label htmlFor={name} className="input-label">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        min={type === "date" ? new Date().toISOString().slice(0, 10) : undefined}
        className="input-standard"
      />
    </div>
  );
}
