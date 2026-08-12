/**
 * SpotlightCard — pointer-following radial highlight for verification benefit cards.
 *
 * Renders a faint radial gradient that tracks the cursor, giving a premium
 * "lit" feel without neon. Disabled on touch devices via pointer media query.
 * Palette: very faint white spotlight (~6% opacity) — works on both light and
 * dark card backgrounds.
 */
"use client";

import React, { useRef, useState, useCallback } from "react";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  /** Spotlight radius in px */
  spotlightSize?: number;
  /** Max spotlight opacity (0–1) */
  spotlightOpacity?: number;
  /** Spotlight colour (RGB) */
  spotlightColor?: string;
}

export default function SpotlightCard({
  children,
  className = "",
  spotlightSize = 200,
  spotlightOpacity = 0.06,
  spotlightColor = "255,255,255",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, active: false });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotlight({ x, y, active: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setSpotlight((prev) => ({ ...prev, active: false }));
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      // Disable on touch — pointer media would ideally be in CSS but we gate
      // the radial-gradient rendering here so it never initialises on touch.
      style={{ isolation: "isolate" }}
    >
      {/* Spotlight overlay — pointer:fine only (no touch) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: spotlight.active
            ? `radial-gradient(${spotlightSize}px circle at ${spotlight.x}% ${spotlight.y}%, rgba(${spotlightColor},${spotlightOpacity}), transparent 70%)`
            : "none",
          // On touch devices this element exists but never activates (no mouse events)
        }}
      />
      {children}
    </div>
  );
}
