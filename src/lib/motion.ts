/**
 * Centralised motion tokens for the Shaz animation system.
 *
 * Keep all animation timings sourced from here — never invent ad-hoc values
 * in individual components.
 *
 * Durations are in SECONDS (for GSAP / AnimatedContent).
 * CSS equivalents (ms) live in globals.css as custom properties.
 */

export const DURATION = {
  /** Hover state changes — badge, icon colour */
  micro: 0.15,
  /** Nav underline, chip hover border */
  fast: 0.25,
  /** Button hover lift, card shadow */
  normal: 0.35,
  /** Scroll-triggered section reveals */
  section: 0.7,
  /** Hero image entrance — slightly slower for drama */
  hero: 0.85,
} as const;

export const STAGGER = {
  /** Between consecutive car/service cards */
  card: 0.065,
  /** Between make/manufacturer chips */
  chip: 0.035,
  /** Between verification benefit items */
  benefit: 0.055,
  /** Between how-it-works steps */
  step: 0.12,
} as const;

export const EASE = {
  /** Standard section entrance */
  out: "power3.out",
  /** Softer entrance for large elements */
  smooth: "power2.out",
  /** Magnet return */
  elastic: "power2.out",
} as const;

export const DISTANCE = {
  /** Subtle content reveal */
  small: 20,
  /** Standard section reveal */
  medium: 28,
  /** Hero / split-panel horizontal entries */
  large: 45,
  /** Horizontal split panels */
  xlarge: 50,
} as const;

/** CSS stagger delays in milliseconds (for inline style={{ animationDelay }}) */
export const CSS_STAGGER = {
  card: 60,
  chip: 35,
  benefit: 55,
  step: 110,
} as const;
