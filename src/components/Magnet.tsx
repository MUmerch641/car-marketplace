/**
 * Magnet — gentle magnetic pull effect for primary CTA buttons.
 *
 * Applied to one or two major marketing CTAs only (e.g. "Sell My Car").
 * Max offset is intentionally small (8px) — premium, not aggressive.
 *
 * Disabled on touch devices (pointer:coarse) and when prefers-reduced-motion
 * is active. Uses CSS transform only — no layout properties.
 */
"use client";

import React, { useRef, useCallback, useState } from "react";


interface MagnetProps {
  children: React.ReactNode;
  /** Maximum pixel offset in any direction */
  strength?: number;
  /** Return-to-origin transition duration (ms) */
  returnDuration?: number;
  className?: string;
}

export default function Magnet({
  children,
  strength = 8,
  returnDuration = 350,
  className = "",
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Lazy initialisers read media queries once at mount — avoids setState-in-effect lint error.
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [isPointerFine] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !isPointerFine) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = ((e.clientX - cx) / (rect.width / 2)) * strength;
      const dy = ((e.clientY - cy) / (rect.height / 2)) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = "transform 150ms ease";
    },
    [reducedMotion, isPointerFine, strength]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0px, 0px)";
    el.style.transition = `transform ${returnDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
  }, [returnDuration]);

  return (
    <div
      ref={ref}
      className={`inline-block ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ willChange: "transform" }}
    >
      {children}
    </div>
  );
}
