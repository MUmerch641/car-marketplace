"use client";
import { useEffect, useState } from "react";
import {
  ukNow,
  isVisitSlotAvailable,
  visitDateLabel,
} from "@/lib/services/visit-schedule";
export function VisitTimePicker({
  date,
  time,
  onDate,
  onTime,
}: {
  date: string;
  time: string;
  onDate: (value: string) => void;
  onTime: (value: string) => void;
}) {
  const [today, setToday] = useState("");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setToday(ukNow().date);
    const timer = setInterval(() => {
      setToday(ukNow().date);
      setTick((value) => value + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  const dates = today
    ? Array.from({ length: 21 }, (_, i) => {
        const day = new Date(`${today}T12:00:00Z`);
        day.setUTCDate(day.getUTCDate() + i);
        return day.toISOString().slice(0, 10);
      })
    : [];
  const periods = [
    { label: "Morning", slots: ["08:00", "09:00", "10:00", "11:00"] },
    {
      label: "Afternoon",
      slots: ["12:00", "13:00", "14:00", "15:00", "16:00"],
    },
    { label: "Evening", slots: ["17:00", "18:00"] },
  ];
  return (
    <div className="space-y-5" data-clock={tick}>
      <div>
        <label htmlFor="preferredDate" className="input-label">
          Preferred date <span className="text-brand-hover">*</span>
        </label>
        <div
          className="mb-3 flex snap-x gap-2 overflow-x-auto pb-2"
          aria-label="Quick date choices"
        >
          {dates.map((value, index) => (
            <button
              key={value}
              type="button"
              aria-pressed={date === value}
              onClick={() => {
                onDate(value);
                if (time && !isVisitSlotAvailable(value, time)) onTime("");
              }}
              className={`min-h-18 min-w-18 shrink-0 snap-start rounded-2xl border px-3 py-2 text-center ${date === value ? "border-ink bg-ink text-white" : "border-[#E4E7E3] bg-white text-ink"}`}
            >
              <span className="block text-[11px] font-semibold">
                {index === 0
                  ? "Today"
                  : new Intl.DateTimeFormat("en-GB", {
                      weekday: "short",
                      timeZone: "Europe/London",
                    }).format(new Date(`${value}T12:00:00Z`))}
              </span>
              <span className="mt-1 block text-lg font-bold">
                {Number(value.slice(-2))}
              </span>
              <span className="block text-[10px]">
                {new Intl.DateTimeFormat("en-GB", {
                  month: "short",
                  timeZone: "Europe/London",
                }).format(new Date(`${value}T12:00:00Z`))}
              </span>
            </button>
          ))}
        </div>
        <input
          id="preferredDate"
          name="preferredDate"
          type="date"
          min={today || undefined}
          required
          value={date}
          onChange={(event) => {
            onDate(event.target.value);
            if (time && !isVisitSlotAvailable(event.target.value, time))
              onTime("");
          }}
          className="input-standard w-full"
        />
        <p className="mt-2 text-xs text-[#526568]">
          {date ? visitDateLabel(date) : "Choose a day that suits you"}
        </p>
      </div>
      <fieldset>
        <legend className="input-label">
          Preferred time <span className="text-brand-hover">*</span>
        </legend>
        <p className="mb-3 text-xs leading-5 text-[#526568]">
          All times are UK time. Choose at least two hours ahead. Shaz confirms
          availability with your quote.
        </p>
        <div className="space-y-4">
          {periods.map((period) => (
            <div key={period.label}>
              <p className="mb-2 text-xs font-bold text-[#526568]">
                {period.label}
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {period.slots.map((value) => {
                  const available = !!date && isVisitSlotAvailable(date, value);
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!available}
                      aria-pressed={time === value}
                      onClick={() => onTime(value)}
                      className={`min-h-12 rounded-xl border text-sm font-semibold disabled:opacity-35 ${time === value ? "border-ink bg-ink text-white" : "border-[#E4E7E3] bg-white text-ink"}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <input name="preferredTime" type="hidden" value={time} />
      </fieldset>
    </div>
  );
}
