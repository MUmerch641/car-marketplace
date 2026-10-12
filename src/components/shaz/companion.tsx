"use client";
import { useEffect, useRef, useState } from "react";
export type CompanionMood = "guide" | "success" | "attention";
function Arm() {
  return (
    <>
      <rect x="3" y="1" width="18" height="32" rx="9" fill="#082A30" />
      <path d="M5 23h14v8H5z" fill="#24585C" />
      <rect x="6" y="30" width="12" height="13" rx="6" fill="#DCA27D" />
      <path
        d="M5 39q-2-3-4 0v7q1 8 11 8 9 0 9-8v-6q0-5-4-5H9q-4 0-4 4"
        fill="#FFF9ED"
        stroke="#D5DCD3"
        strokeWidth="1.2"
      />
      <path
        d="M9 38v7m5-7v7"
        stroke="#D5DCD3"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </>
  );
}
/** Optional decoration; booking guidance is always also shown as readable text. */
export function ShazCompanion({
  mood = "guide",
  reactionKey = "",
  size = 68,
}: {
  mood?: CompanionMood;
  reactionKey?: string | number;
  size?: number;
}) {
  const [tap, setTap] = useState(0);
  const [talk, setTalk] = useState(false);
  const [awake, setAwake] = useState(false);
  const frame = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let visible = false;
    const sync = () =>
      setAwake(visible && document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    if (frame.current) observer.observe(frame.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  useEffect(() => {
    if (!talk) return;
    const timer = setTimeout(() => setTalk(false), 2300);
    return () => clearTimeout(timer);
  }, [talk, tap]);
  return (
    <button
      type="button"
      ref={frame}
      aria-label="Say hello to the Shaz helper"
      onClick={() => {
        setTap((value) => value + 1);
        setTalk(true);
      }}
      className="shaz-companion relative shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      style={{ width: size, height: (size * 148) / 128 }}
      data-mood={mood}
      data-awake={awake}
    >
      {talk && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 w-36 -translate-x-1/2 rounded-2xl bg-ink px-3 py-2 text-xs font-semibold text-white shadow-lg"
        >
          {mood === "success"
            ? "Looking good!"
            : mood === "attention"
              ? "Let's sort this together"
              : "Your car is in good hands"}
        </span>
      )}
      <svg
        key={`${mood}-${reactionKey}-${tap}`}
        width="100%"
        height="100%"
        viewBox="0 0 128 148"
        aria-hidden="true"
      >
        <ellipse cx="64" cy="143" rx="31" ry="4" fill="#082A30" opacity=".09" />
        <g className="shaz-puppet-figure">
          <path
            d="M39 120h22v17H38q-8 7-15 2v-5zM67 120h22l16 14v5q-12 5-17-2H67z"
            fill="#082A30"
          />
          <path
            d="M40 67h48q14 10 12 27l-9 34H37l-9-34q-2-17 12-27"
            fill="#082A30"
          />
          <path d="M51 70h26l-13 17z" fill="#DCA27D" />
          <path
            d="m40 72 14 21 10-6 10 6 14-21"
            fill="none"
            stroke="#24585C"
            strokeWidth="3"
          />
          <rect x="48" y="103" width="32" height="20" rx="5" fill="#24585C" />
          <path
            d="M59 112h10"
            stroke="#7FDBCA"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <g transform="translate(16 80)">
            <g className="shaz-puppet-arm-left">
              <Arm />
            </g>
          </g>
          <g transform="translate(88 80)">
            <g className="shaz-puppet-arm-right">
              <Arm />
            </g>
          </g>
          <g transform="translate(26 0)">
            <g className="shaz-puppet-head">
              <ellipse cx="10" cy="45" rx="6" ry="9" fill="#DCA27D" />
              <ellipse cx="66" cy="45" rx="6" ry="9" fill="#DCA27D" />
              <rect
                x="12"
                y="17"
                width="52"
                height="52"
                rx="23"
                fill="#DCA27D"
              />
              <path
                d="M12 38V24q0-14 26-14t26 14v15l-7-10q-9 1-19-6-11 8-20 6z"
                fill="#352921"
              />
              <path d="M12 18Q14 2 38 2t26 16v8H12z" fill="#E94A3F" />
              <path d="M9 23q28-10 57 0l2 8q-30-7-60 0z" fill="#C73830" />
              <path
                d="M39 6q11 2 13 12"
                fill="none"
                stroke="#F67A6D"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M20 35q5-3 10-1m16 0q5-2 10 1"
                fill="none"
                stroke="#352921"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <g className="shaz-puppet-eyes">
                <circle cx="25" cy="42" r="3.2" fill="#352921" />
                <circle cx="51" cy="42" r="3.2" fill="#352921" />
                <circle cx="26" cy="41" r=".9" fill="#FFF9ED" />
                <circle cx="52" cy="41" r=".9" fill="#FFF9ED" />
              </g>
              <path
                d="M14 48q7 13 24 14 17-1 24-14v10q-3 17-24 17T14 58z"
                fill="#352921"
              />
              <path
                d="M34 40v8q4 3 8 0"
                fill="none"
                stroke="#C98A64"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M27 55q11 10 22 0"
                fill="#FFF9ED"
                stroke="#352921"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M25 52q7-4 13 0 6-4 13 0"
                fill="none"
                stroke="#352921"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
      </svg>
    </button>
  );
}
