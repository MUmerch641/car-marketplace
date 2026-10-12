"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  CarFront,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Droplets,
  MapPin,
  Search,
} from "lucide-react";
import {
  createServiceBookingAction,
  findOilForVehicleAction,
  type OilFinderState,
} from "@/app/service-actions";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  PARKING_LOCATIONS,
  type ParkingLocation,
} from "@/lib/services/parking";
import { ShazGuide } from "@/components/shaz/guide";
import { ShazCompanion } from "@/components/shaz/companion";
import { VisitTimePicker } from "./visit-time-picker";
import {
  isVisitSlotAvailable,
  visitDateLabel,
} from "@/lib/services/visit-schedule";
import { toast } from "@/components/ui/toast";

type Props = {
  service: { id: string; name: string; basePrice: number };
  initialRegistration?: string;
  initialOilId?: string;
  customerId: string;
  savedCars?: Array<{
    id: string;
    make: string;
    model: string;
    registration: string | null;
  }>;
};

type BookingDraft = {
  visitType: "home" | "work";
  oilProductId: string | null;
  postcode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  preferredDate: string;
  preferredTime: string;
  parkingLocation: ParkingLocation | "";
  levelSurfaceAccess: "yes" | "no" | "";
  parkingAccessNotes: string;
  notes: string;
};

const initialDraft: BookingDraft = {
  visitType: "home",
  oilProductId: null,
  postcode: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  preferredDate: "",
  preferredTime: "",
  parkingLocation: "",
  levelSurfaceAccess: "",
  parkingAccessNotes: "",
  notes: "",
};

const steps = ["Car", "Visit", "Review"];
const postcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export function BookingForm({
  service,
  initialRegistration = "",
  initialOilId = "",
  customerId,
  savedCars = [],
}: Props) {
  const [lookup, lookupAction, lookupPending] = useActionState(
    findOilForVehicleAction,
    { registration: initialRegistration } as OilFinderState,
  );
  const [bookingState, bookingAction, bookingPending] = useActionState(
    createServiceBookingAction,
    {},
  );
  const [registration, setRegistration] = useState(initialRegistration);
  const [draft, setDraft] = useState(initialDraft);
  const [step, setStep] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [manual, setManual] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [restored, setRestored] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const lookupForm = useRef<HTMLFormElement>(null);
  const submissionLock = useRef(false);
  useEffect(() => {
    if (!bookingPending && bookingState.error) submissionLock.current = false;
  }, [bookingPending, bookingState]);
  const autoLookupDone = useRef(false);
  const draftKey = `shaz:booking:${customerId}:${service.id}`;
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (
          saved &&
          typeof saved === "object" &&
          saved.version === 1 &&
          typeof saved.savedAt === "number" &&
          Date.now() - saved.savedAt < 14 * 86400000
        ) {
          const safe = { ...initialDraft };
          for (const key of Object.keys(safe) as Array<keyof BookingDraft>) {
            if (typeof saved.draft?.[key] === "string")
              (safe as Record<string, unknown>)[key] = saved.draft[key];
          }
          safe.visitType = safe.visitType === "work" ? "work" : "home";
          safe.parkingLocation = PARKING_LOCATIONS.some(
            (option) => option.value === safe.parkingLocation,
          )
            ? safe.parkingLocation
            : "";
          safe.levelSurfaceAccess = ["yes", "no"].includes(
            safe.levelSurfaceAccess,
          )
            ? safe.levelSurfaceAccess
            : "";
          setDraft(safe);
          if (!initialRegistration && typeof saved.registration === "string")
            setRegistration(saved.registration.slice(0, 16));
          if (!initialRegistration && saved.manual === true) {
            setManual(true);
            setMake(
              typeof saved.make === "string" ? saved.make.slice(0, 100) : "",
            );
            setModel(
              typeof saved.model === "string" ? saved.model.slice(0, 100) : "",
            );
          }
          setRestored(true);
        }
      }
    } catch {
      /* Booking remains usable if browser storage is unavailable. */
    }
    setDraftReady(true);
  }, [draftKey, initialRegistration]);
  useEffect(() => {
    if (!draftReady) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          registration,
          manual,
          make,
          model,
          draft,
        }),
      );
    } catch {
      /* Optional draft storage. */
    }
  }, [draftKey, draftReady, registration, manual, make, model, draft]);
  useEffect(() => {
    if (!draftReady || autoLookupDone.current || manual || !registration.trim())
      return;
    autoLookupDone.current = true;
    lookupForm.current?.requestSubmit();
  }, [draftReady, manual, registration]);
  const journey = useRef<HTMLDivElement>(null);
  const verifiedVehicle =
    !!lookup.vehicle &&
    !lookupPending &&
    registration.toUpperCase().replace(/[^A-Z0-9]/g, "") ===
      lookup.vehicle.registration;

  const canUseVehicle = manual
    ? !!make.trim() && !!model.trim()
    : verifiedVehicle;
  const vehicle = manual
    ? {
        make: make.trim(),
        model: model.trim(),
        registration: registration.toUpperCase().replace(/[^A-Z0-9]/g, ""),
        year: 0,
        fuel_type: "",
        engine_capacity_cc: null,
      }
    : lookup.vehicle;
  useEffect(() => {
    if (bookingState?.error) toast.error(bookingState.error);
  }, [bookingState?.error]);

  const selectedOil = manual
    ? undefined
    : draft.oilProductId === null
      ? lookup.recommendations?.find((oil) => oil.id === initialOilId)
      : lookup.recommendations?.find((oil) => oil.id === draft.oilProductId);

  function move(next: number) {
    setValidationError("");
    setStep(next);
    requestAnimationFrame(() => {
      journey.current?.scrollIntoView({ block: "start", behavior: "auto" });
      journey.current
        ?.querySelector<HTMLElement>(
          `#${["vehicle", "visit", "review"][next]}-step-heading`,
        )
        ?.focus({ preventScroll: true });
    });
  }

  function update<K extends keyof BookingDraft>(
    key: K,
    value: BookingDraft[K],
  ) {
    setValidationError("");
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function validateVisit() {
    if (
      !draft.postcode.trim() ||
      !postcodePattern.test(draft.postcode.trim())
    ) {
      journey.current?.querySelector<HTMLInputElement>("#postcode")?.focus();
      setValidationError("Enter a valid UK postcode.");
      return false;
    }
    if (!draft.addressLine1.trim() || !draft.city.trim()) {
      journey.current
        ?.querySelector<HTMLInputElement>(
          !draft.addressLine1.trim() ? "#addressLine1" : "#city",
        )
        ?.focus();
      setValidationError("Add the service address and city.");
      return false;
    }
    if (!draft.preferredDate || !draft.preferredTime) {
      setValidationError("Choose a preferred date and time.");
      return false;
    }
    if (!isVisitSlotAvailable(draft.preferredDate, draft.preferredTime)) {
      setValidationError("Choose a time at least two hours from now.");
      return false;
    }
    if (!draft.parkingLocation || !draft.levelSurfaceAccess) {
      setValidationError(
        "Tell us where the car will be parked and whether the surface is level.",
      );
      return false;
    }
    if (draft.parkingLocation === "other" && !draft.parkingAccessNotes.trim()) {
      setValidationError("Tell us where the mechanic can park.");
      return false;
    }
    setValidationError("");
    return true;
  }

  function continueFromVisit() {
    if (validateVisit()) move(2);
  }

  const serviceCost = Number(service.basePrice);
  const oilCost = Number(selectedOil?.price ?? 0);

  return (
    <div ref={journey} className="scroll-mt-24 space-y-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#526568]">{service.name}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
            {
              [
                "Let’s meet your car",
                "Your visit, your way",
                "Looking good? Let’s review",
              ][step]
            }
          </h1>
        </div>
        <ShazCompanion
          mood={
            validationError || bookingState.error
              ? "attention"
              : step === 0 && canUseVehicle
                ? "success"
                : "guide"
          }
          reactionKey={`${step}-${canUseVehicle}`}
          size={64}
        />
      </div>
      {restored && (
        <p className="text-xs text-[#526568]" role="status">
          Your saved details are back. Confirm your car to continue.
        </p>
      )}
      <ol aria-label="Booking steps" className="grid grid-cols-3 gap-2">
        {steps.map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? "step" : undefined}
            className="min-w-0"
          >
            <div
              className={`h-1.5 rounded-full ${index <= step ? "bg-brand-hover" : "bg-slate-200"}`}
            />
            <p
              className={`mt-2 text-xs font-semibold ${index === step ? "text-[#E94A3F]" : "text-slate-500"}`}
            >
              {index + 1}. {label}
            </p>
          </li>
        ))}
      </ol>

      <section
        hidden={step !== 0}
        aria-labelledby="vehicle-step-heading"
        className="space-y-4"
      >
        <StepHeading
          number="1"
          title="Find your vehicle"
          id="vehicle-step-heading"
        />
        <div className="flex items-center gap-3 rounded-2xl bg-sand p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E3F1EB] text-[#17614B]">
            <Droplets size={21} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">{service.name}</p>
            <p className="mt-1 text-xs text-[#526568]">
              From £{serviceCost.toFixed(2)} · Full quote confirmed by Shaz
            </p>
          </div>
        </div>
        {savedCars.length > 0 && (
          <fieldset>
            <legend className="input-label">Your saved cars</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {savedCars
                .filter((car) => car.registration)
                .map((car) => (
                  <button
                    key={car.id}
                    type="button"
                    disabled={lookupPending}
                    aria-pressed={registration === car.registration}
                    onClick={() => {
                      autoLookupDone.current = false;
                      setManual(false);
                      setRegistration(car.registration!);
                      update("oilProductId", null);
                      setValidationError("");
                      requestAnimationFrame(() => {
                        if (car.registration === registration)
                          lookupForm.current?.requestSubmit();
                      });
                    }}
                    className={`flex min-h-16 items-center gap-3 rounded-2xl border p-3 text-left ${registration === car.registration ? "border-ink bg-sand" : "border-[#E4E7E3] bg-white"}`}
                  >
                    <CarFront size={20} className="shrink-0 text-[#526568]" />
                    <span>
                      <span className="block text-sm font-bold text-ink">
                        {car.make} {car.model}
                      </span>
                      <span className="mt-1 block text-xs font-semibold text-[#526568]">
                        {car.registration}
                      </span>
                    </span>
                  </button>
                ))}
            </div>
          </fieldset>
        )}

        <p className="text-sm text-slate-500">
          Enter your registration and we’ll check the vehicle for your oil and
          filter change.
        </p>
        <form
          ref={lookupForm}
          action={lookupAction}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex min-h-14 flex-1 items-center overflow-hidden rounded-xl border border-slate-300 bg-[#F7F4EF] shadow-sm transition focus-within:border-[#E94A3F] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
            <span
              className="grid h-8 w-12 shrink-0 place-items-center border-r border-slate-300 text-[#082A30]"
              aria-hidden="true"
            >
              <CarFront size={18} strokeWidth={2.25} />
            </span>
            <input
              name="registration"
              required={!manual}
              maxLength={16}
              value={registration}
              onChange={(event) => {
                autoLookupDone.current = true;
                setRegistration(event.target.value.toUpperCase());
                update("oilProductId", null);
              }}
              placeholder="e.g. AB12 CDE"
              autoComplete="off"
              aria-label="Vehicle registration"
              className="min-w-0 flex-1 bg-transparent px-4 text-[15px] font-semibold uppercase tracking-[.12em] text-[#082A30] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 sm:text-base"
            />
          </div>
          <button
            type="submit"
            disabled={manual || lookupPending || !registration.trim()}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#082A30] px-5 text-sm font-bold text-white hover:bg-[#132F49] disabled:opacity-60"
          >
            <Search size={16} />
            {lookupPending ? "Checking…" : "Find vehicle"}
          </button>
        </form>
        {!manual && lookup.error && (
          <p
            className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700"
            role="alert"
          >
            {lookup.error}
          </p>
        )}
        {!manual && verifiedVehicle && lookup.vehicle && (
          <div
            className="flex items-center gap-4 rounded-xl bg-[#F7F4EF] p-5"
            aria-live="polite"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#082A30] text-white">
              <CarFront size={21} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
                Vehicle confirmed
              </p>
              <p className="mt-1 font-bold text-[#082A30]">
                {lookup.vehicle.year || ""} {lookup.vehicle.make}{" "}
                {lookup.vehicle.model}
              </p>
              <p className="mt-1 text-sm capitalize text-slate-600">
                {lookup.vehicle.fuel_type.replaceAll("_", " ")}
                {lookup.vehicle.engine_capacity_cc
                  ? ` · ${lookup.vehicle.engine_capacity_cc}cc`
                  : ""}
              </p>
              <p className="mt-1 text-xs font-semibold tracking-wider text-slate-500">
                {lookup.vehicle.registration}
              </p>
            </div>
            <CheckCircle2
              size={20}
              className="ml-auto shrink-0 text-emerald-600"
            />
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            setManual((value) => !value);
            setValidationError("");
          }}
          className="min-h-11 text-sm font-bold text-brand-hover underline underline-offset-4"
        >
          {manual
            ? "Use registration lookup instead"
            : "Enter make and model yourself"}
        </button>
        {manual && (
          <div className="space-y-3">
            <p className="text-sm leading-6 text-[#526568]">
              Add your car’s details. Shaz will check them and confirm the
              correct parts with your quote.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                name="manualMake"
                label="Make"
                required
                value={make}
                onChange={setMake}
                placeholder="Toyota"
                maxLength={100}
              />
              <Field
                name="manualModel"
                label="Model"
                required
                value={model}
                onChange={setModel}
                placeholder="Yaris"
                maxLength={100}
              />
            </div>
          </div>
        )}
        <button
          type="button"
          disabled={!canUseVehicle}
          onClick={() => move(1)}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-brand-hover px-5 font-bold text-white hover:bg-[#AC302A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue <ChevronRight size={18} />
        </button>
      </section>

      {step > 0 && vehicle && (
        <div className="flex items-center gap-3 rounded-2xl bg-sand p-4">
          <CarFront size={20} className="shrink-0 text-[#526568]" />
          <div className="flex-1">
            <p className="text-sm font-bold text-ink">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="mt-1 text-xs text-[#526568]">
              {vehicle.registration || "Details entered manually"}
            </p>
          </div>
          <button
            type="button"
            disabled={bookingPending}
            onClick={() => move(0)}
            className="min-h-11 text-xs font-bold text-brand-hover"
          >
            Change car
          </button>
        </div>
      )}
      {vehicle && (
        <form
          action={bookingAction}
          hidden={step === 0}
          noValidate
          onSubmit={(event) => {
            if (bookingPending || submissionLock.current) {
              event.preventDefault();
              return;
            }
            if (!canUseVehicle) {
              event.preventDefault();
              move(0);
              setValidationError(
                "Find and confirm your vehicle before continuing.",
              );
              return;
            }
            if (step !== 2) {
              event.preventDefault();
              if (step === 1) continueFromVisit();
              return;
            }
            if (!validateVisit()) {
              event.preventDefault();
              setStep(1);
              requestAnimationFrame(() => {
                journey.current?.scrollIntoView({
                  block: "start",
                  behavior: "auto",
                });
                journey.current
                  ?.querySelector<HTMLElement>("#visit-step-heading")
                  ?.focus({ preventScroll: true });
              });
              return;
            }
            submissionLock.current = true;
          }}
          className="space-y-6"
        >
          <fieldset disabled={bookingPending} className="contents">
            <input type="hidden" name="serviceId" value={service.id} />
            <input
              type="hidden"
              name="carRegistration"
              value={vehicle.registration}
            />
            <input
              type="hidden"
              name="vehicleEntryMode"
              value={manual ? "manual" : "lookup"}
            />
            <input type="hidden" name="carMake" value={vehicle.make} />
            <input type="hidden" name="carModel" value={vehicle.model} />
            <input
              type="hidden"
              name="oilProductId"
              value={selectedOil?.id ?? ""}
            />
            <input type="hidden" name="visitType" value={draft.visitType} />

            <section
              hidden={step !== 1}
              aria-labelledby="visit-step-heading"
              className="space-y-5"
            >
              <StepHeading
                number="2"
                title="Arrange your visit"
                id="visit-step-heading"
              />
              <fieldset>
                <legend className="font-semibold text-[#082A30]">
                  Where should Shaz visit?
                </legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  {(["home", "work"] as const).map((place) => (
                    <label
                      key={place}
                      className="flex min-h-12 min-w-28 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 has-[:checked]:border-[#E94A3F] has-[:checked]:bg-[#FFF7F6]"
                    >
                      <input
                        type="radio"
                        name="visitTypeChoice"
                        value={place}
                        checked={draft.visitType === place}
                        onChange={() => update("visitType", place)}
                        className="accent-[#E94A3F]"
                      />
                      <span className="text-sm font-medium capitalize text-[#082A30]">
                        {place}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  name="postcode"
                  label="Postcode"
                  required
                  value={draft.postcode}
                  onChange={(value) => update("postcode", value.toUpperCase())}
                  placeholder="SW1A 1AA"
                />
                <Field
                  name="addressLine1"
                  label="Address line 1"
                  required
                  value={draft.addressLine1}
                  onChange={(value) => update("addressLine1", value)}
                  placeholder="House number and street"
                />
                <Field
                  name="addressLine2"
                  label="Address line 2"
                  value={draft.addressLine2}
                  onChange={(value) => update("addressLine2", value)}
                  placeholder="Flat or building (optional)"
                />
                <Field
                  name="city"
                  label="City"
                  required
                  value={draft.city}
                  onChange={(value) => update("city", value)}
                  placeholder="London"
                />
              </div>
              <div className="rounded-2xl border border-[#E4E7E3] bg-[#FBF8F4] p-4 sm:p-5">
                <VisitTimePicker
                  date={draft.preferredDate}
                  time={draft.preferredTime}
                  onDate={(value) => update("preferredDate", value)}
                  onTime={(value) => update("preferredTime", value)}
                />
              </div>

              <fieldset>
                <legend className="font-semibold text-[#082A30]">
                  Where will the vehicle be parked?
                </legend>
                <p className="mt-1 text-sm text-slate-500">
                  Please make sure you have permission to park there.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PARKING_LOCATIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 has-[:checked]:border-[#E94A3F] has-[:checked]:bg-[#FFF7F6]"
                    >
                      <input
                        type="radio"
                        name="parkingChoice"
                        value={option.value}
                        checked={draft.parkingLocation === option.value}
                        onChange={() => update("parkingLocation", option.value)}
                        className="accent-[#E94A3F]"
                      />
                      <span className="text-sm font-medium text-[#082A30]">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="parkingLocation"
                  value={draft.parkingLocation}
                />
              </fieldset>

              <fieldset>
                <legend className="font-semibold text-[#082A30]">
                  Is it a level surface with room around the vehicle?
                </legend>
                <p className="mt-1 text-sm text-slate-500">
                  The mechanic may need to use a jack and work around the car.
                </p>
                <div className="mt-3 flex gap-3">
                  {(["yes", "no"] as const).map((answer) => (
                    <label
                      key={answer}
                      className="flex min-h-12 min-w-24 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 has-[:checked]:border-[#E94A3F] has-[:checked]:bg-[#FFF7F6]"
                    >
                      <input
                        type="radio"
                        name="levelSurfaceChoice"
                        value={answer}
                        checked={draft.levelSurfaceAccess === answer}
                        onChange={() => update("levelSurfaceAccess", answer)}
                        className="accent-[#E94A3F]"
                      />
                      <span className="text-sm font-medium capitalize text-[#082A30]">
                        {answer}
                      </span>
                    </label>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="levelSurfaceAccess"
                  value={draft.levelSurfaceAccess}
                />
              </fieldset>

              <Field
                name="parkingAccessNotes"
                label={
                  draft.parkingLocation === "other"
                    ? "Where can the mechanic park?"
                    : "Parking or access instructions"
                }
                required={draft.parkingLocation === "other"}
                value={draft.parkingAccessNotes}
                onChange={(value) => update("parkingAccessNotes", value)}
                placeholder={
                  draft.parkingLocation === "other"
                    ? "Tell us where the vehicle will be parked"
                    : "For example, a gate code or where to find the space"
                }
                maxLength={1000}
                multiline
              />
              <label htmlFor="notes" className="block">
                <span className="input-label">
                  Anything else the mechanic should know?{" "}
                  <span className="font-normal text-slate-500">(optional)</span>
                </span>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={draft.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  maxLength={2000}
                  className="input-standard w-full resize-y"
                  placeholder="Add other details about your visit"
                />
              </label>
              {validationError && (
                <p
                  className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700"
                  role="alert"
                >
                  {validationError}
                </p>
              )}
              <StepNavigation
                onBack={() => move(0)}
                onContinue={continueFromVisit}
              />
            </section>

            <section
              hidden={step !== 2}
              aria-labelledby="review-step-heading"
              className="space-y-5"
            >
              <StepHeading
                number="3"
                title="Review your request"
                id="review-step-heading"
              />
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="flex items-center gap-2 font-bold text-[#082A30]">
                  <CarFront size={18} /> Vehicle
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {vehicle.year || ""} {vehicle.make} {vehicle.model}
                  {vehicle.registration ? ` · ${vehicle.registration}` : ""}
                </p>
                <h3 className="mt-5 flex items-center gap-2 font-bold text-[#082A30]">
                  <Droplets size={18} /> Service and parts
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {service.name}
                  {selectedOil
                    ? ` · ${selectedOil.brand} ${selectedOil.name} (${selectedOil.viscosityGrade})`
                    : " · Oil to be confirmed by Shaz"}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#082A30]">
                  Current estimate from £
                  {(serviceCost + oilCost).toLocaleString("en-GB")}
                </p>
                <h3 className="mt-5 flex items-center gap-2 font-bold text-[#082A30]">
                  <MapPin size={18} /> Visit
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {[
                    draft.addressLine1,
                    draft.addressLine2,
                    draft.city,
                    draft.postcode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {visitDateLabel(draft.preferredDate)} · {draft.preferredTime}{" "}
                  UK time
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  At {draft.visitType} ·{" "}
                  {
                    PARKING_LOCATIONS.find(
                      (option) => option.value === draft.parkingLocation,
                    )?.label
                  }{" "}
                  · Level access: {draft.levelSurfaceAccess}
                </p>
                {draft.parkingAccessNotes && (
                  <p className="mt-1 text-sm text-slate-600">
                    Access notes: {draft.parkingAccessNotes}
                  </p>
                )}
                {draft.notes && (
                  <p className="mt-1 text-sm text-slate-600">
                    Visit notes: {draft.notes}
                  </p>
                )}
              </div>
              <ShazGuide title="What happens next?">
                Shaz confirms your appointment and full quote. You review and
                pay the complete amount before the visit. No payment is taken
                now.
              </ShazGuide>
              {validationError && (
                <p
                  className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700"
                  role="alert"
                >
                  {validationError}
                </p>
              )}
              {bookingState.error && (
                <p
                  className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700"
                  role="alert"
                >
                  {bookingState.error}
                </p>
              )}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => move(1)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 text-sm font-bold text-[#082A30]"
                >
                  <ChevronLeft size={17} /> Edit visit details
                </button>
                <SubmitButton
                  variant="primary"
                  size="lg"
                  loadingText="Submitting booking…"
                  disabled={bookingPending}
                  className="sm:min-w-56"
                >
                  Request my visit
                </SubmitButton>
              </div>
            </section>
          </fieldset>
        </form>
      )}
    </div>
  );
}

function StepHeading({
  number,
  title,
  id,
}: {
  number: string;
  title: string;
  id: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#082A30] text-xs font-bold text-white">
        {number}
      </span>
      <h2 id={id} tabIndex={-1} className="font-h4 text-[#082A30]">
        {title}
      </h2>
    </div>
  );
}

function StepNavigation({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 text-sm font-bold text-[#082A30]"
      >
        <ChevronLeft size={17} /> Back
      </button>
      <button
        type="button"
        onClick={onContinue}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-brand-hover px-5 text-sm font-bold text-white hover:bg-[#AC302A]"
      >
        Continue <ChevronRight size={17} />
      </button>
    </div>
  );
}

function Field({
  name,
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  maxLength,
  multiline = false,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  maxLength?: number;
  multiline?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="input-label">
        {label}
        {required ? <span className="text-[#E94A3F]"> *</span> : null}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          required={required}
          maxLength={maxLength}
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="input-standard w-full resize-y"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          min={min}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="input-standard w-full"
        />
      )}
    </div>
  );
}
