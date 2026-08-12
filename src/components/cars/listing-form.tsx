"use client";

import { useActionState } from "react";

type State = { error?: string; success?: string };
const initial: State = {};

export function ListingForm({
  action,
  car,
}: {
  action: (form: FormData) => Promise<State | void>;
  car?: Record<string, string | number | boolean | null>;
}) {
  const [state, formAction, pending] = useActionState(
    async (_state: State, form: FormData) => (await action(form)) ?? {},
    initial
  );

  const value = (name: string) => car?.[name] ?? "";

  return (
    <form action={formAction} className="grid gap-6 md:grid-cols-2">
      {/* Vehicle identity */}
      <div>
        <h3 className="font-h3 text-ink">Vehicle identity</h3>
        <div className="mt-4 grid gap-4">
          <Field name="make" label="Make" value={value("make")} required />
          <Field name="model" label="Model" value={value("model")} required />
          <Field name="variant" label="Variant" value={value("variant")} />
          <Field name="year" label="Year" value={value("year")} required type="number" />
        </div>
      </div>

      {/* Pricing and specs */}
      <div>
        <h3 className="font-h3 text-ink">Pricing and specs</h3>
        <div className="mt-4 grid gap-4">
          <Field name="price" label="Price (£)" value={value("price")} required type="number" />
          <Field name="mileage" label="Mileage (miles)" value={value("mileage")} required type="number" />
          <Select
            name="fuel"
            label="Fuel type"
            value={value("fuel_type")}
            options={[
              ["", "Select fuel type"],
              ["petrol", "Petrol"],
              ["diesel", "Diesel"],
              ["hybrid", "Hybrid"],
              ["plug_in_hybrid", "Plug-in hybrid"],
              ["electric", "Electric"],
            ]}
          />
          <Select
            name="transmission"
            label="Transmission"
            value={value("transmission")}
            options={[
              ["", "Select transmission"],
              ["manual", "Manual"],
              ["automatic", "Automatic"],
              ["semi_automatic", "Semi-automatic"],
            ]}
          />
          <Field name="bodyType" label="Body type" value={value("body_type")} />
          <Field name="engineSize" label="Engine size (L)" value={value("engine_size")} type="number" />
          <Field name="colour" label="Colour" value={value("colour")} />
          <Field name="registration" label="Registration" value={value("registration")} />
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="font-h3 text-ink">Location</h3>
        <div className="mt-4 grid gap-4">
          <Field name="city" label="City" value={value("city")} required />
          <Field name="postcode" label="Postcode" value={value("postcode")} required />
        </div>
      </div>

      {/* Vehicle details */}
      <div>
        <h3 className="font-h3 text-ink">Vehicle details</h3>
        <div className="mt-4 grid gap-4">
          <Field
            name="motExpiry"
            label="MOT expiry"
            value={value("mot_expiry")}
            type="date"
          />
          <Select
            name="serviceHistory"
            label="Service history"
            value={value("service_history")}
            options={[
              ["", "Unknown"],
              ["full", "Full service history"],
              ["part", "Partial service history"],
              ["none", "No service history"],
            ]}
          />
          <Select
            name="ulezCompliant"
            label="ULEZ (seller stated)"
            value={value("ulez_compliant") === true ? "yes" : value("ulez_compliant") === false ? "no" : ""}
            options={[
              ["", "Not stated"],
              ["yes", "Compliant"],
              ["no", "Not compliant"],
            ]}
          />
        </div>
      </div>

      {/* Description */}
      <div className="md:col-span-2">
        <label htmlFor="description" className="input-label">Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue={String(value("description") ?? "")}
          required
          minLength={20}
          rows={6}
          placeholder="Describe the car's condition, features, and any known issues..."
          className="input-standard resize-none"
        />
        <p className="input-hint">Minimum 20 characters</p>
      </div>

      {/* Error and success states */}
      {state.error && <p className="md:col-span-2 input-error" role="alert">{state.error}</p>}
      {state.success && <p className="md:col-span-2 input-success" role="status">{state.success}</p>}

      {/* Submit */}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full py-3"
        >
          {pending ? "Saving…" : car ? "Save listing" : "Create draft listing"}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  value,
  required,
  type = "text",
}: {
  name: string;
  label: string;
  value: string | number | boolean | null;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="input-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={String(value ?? "")}
        required={required}
        className="input-standard"
      />
    </div>
  );
}

function Select({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string | number | boolean | null;
  options: string[][];
}) {
  return (
    <div>
      <label htmlFor={name} className="input-label">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={String(value ?? "")}
        className="input-standard"
      >
        {options.map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}