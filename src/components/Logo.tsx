/**
 * Fengxing Logo Component
 *
 * SVG-based logo with a rotating 5-spoke alloy wheel icon.
 * - Pure SVG — infinitely scalable, always sharp
 * - CSS animation on the wheel (spin-wheel keyframe)
 * - Respects prefers-reduced-motion (stops rotation)
 * - Works on dark (navbar/navy) and light backgrounds
 * - Exported as: <Logo />, <LogoIcon />, <LogoWordmark />
 *
 * Usage:
 *   <Logo />                    — icon + wordmark (default, on dark bg)
 *   <Logo variant="light" />    — on white/light background
 *   <Logo size="sm" />          — navbar size (28px wheel)
 *   <Logo size="lg" />          — hero / marketing size
 *   <LogoIcon size={32} />      — wheel only (favicon, avatar)
 */

import React from "react";

/* ── Types ────────────────────────────────────────────────────────────────── */

export type LogoVariant = "dark" | "light";
export type LogoSize = "xs" | "sm" | "md" | "lg";

interface LogoProps {
  /** "dark" = white icon+text (for navy/dark backgrounds, default)
   *  "light" = navy icon+text (for white/light backgrounds) */
  variant?: LogoVariant;
  /** Preset size tokens */
  size?: LogoSize;
  /** Hide the text wordmark and show icon only */
  iconOnly?: boolean;
  /** Show the "Marketplace" sub-label (only renders on md/lg by default) */
  showSubLabel?: boolean;
  className?: string;
}

interface LogoIconProps {
  /** Icon diameter in px */
  size?: number;
  /** Primary colour of the wheel (spokes, rim) */
  color?: string;
  /** Hub/accent colour */
  accent?: string;
  className?: string;
}

/* ── Size scale ───────────────────────────────────────────────────────────── */

const sizeMap: Record<
  LogoSize,
  { wheel: number; fontSize: number; gap: number }
> = {
  xs: { wheel: 18, fontSize: 12, gap: 5 },
  sm: { wheel: 30, fontSize: 20, gap: 8 },  // navbar
  md: { wheel: 40, fontSize: 27, gap: 11 }, // default
  lg: { wheel: 52, fontSize: 34, gap: 14 }, // hero / marketing
};

/* ── Alloy Wheel SVG ──────────────────────────────────────────────────────── */
/**
 * 5-spoke alloy wheel. Designed to look good both static and spinning.
 *
 * Anatomy:
 *  - Outer rim: thin circle
 *  - Inner rim: slightly inset circle (creates rim depth)
 *  - 5 spokes: rectangular paths rotated 72° apart
 *  - Hub: small central circle with 5 tiny bolt circles
 *  - Red accent ring: thin ring just inside the outer rim
 */
export function LogoIcon({
  size = 36,
  color = "#FFFFFF",
  accent = "#D92D20",
  className = "",
}: LogoIconProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = cx; // full radius

  // Geometry ratios (all relative to radius)
  const outerRimR = r - 0.5;           // outer rim ring
  const innerRimR = r * 0.84;          // inner rim (creates rim depth feel)
  const accentRingR = r * 0.89;        // red accent ring radius
  const spokeW = r * 0.11;             // spoke width
  const spokeInner = r * 0.22;         // spoke starts at hub edge
  const spokeOuter = innerRimR - r * 0.04; // spoke ends just inside inner rim
  const hubR = r * 0.2;                // hub radius
  const hubInnerR = r * 0.1;           // hub hole
  const boltR = r * 0.04;             // lug bolt radius
  const boltDist = r * 0.145;          // bolt distance from centre

  // 5 spoke angles — rotated 18° so one spoke points up-left for visual interest
  const spokeAngles = [90, 162, 234, 306, 18];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={`fengxing-wheel ${className}`}
      aria-hidden="true"
      style={{ overflow: "visible", flexShrink: 0 }}
    >
      {/* ── Outer rim ─────────────────────────────────────────── */}
      <circle
        cx={cx}
        cy={cy}
        r={outerRimR}
        fill="none"
        stroke={color}
        strokeWidth={r * 0.055}
        strokeLinecap="round"
      />

      {/* ── Red accent ring ────────────────────────────────────── */}
      <circle
        cx={cx}
        cy={cy}
        r={accentRingR}
        fill="none"
        stroke={accent}
        strokeWidth={r * 0.025}
        opacity={0.9}
      />

      {/* ── Inner rim ring ─────────────────────────────────────── */}
      <circle
        cx={cx}
        cy={cy}
        r={innerRimR}
        fill="none"
        stroke={color}
        strokeWidth={r * 0.03}
        opacity={0.45}
      />

      {/* ── 5 Spokes ──────────────────────────────────────────── */}
      <g>
        {spokeAngles.map((angleDeg, i) => {
          const angleRad = (angleDeg * Math.PI) / 180;
          const cos = Math.cos(angleRad);
          const sin = Math.sin(angleRad);

          // Spoke rectangle corners (along the spoke axis)
          // We draw as a rotated rect from inner to outer
          const x1 = cx + cos * spokeInner;
          const y1 = cy + sin * spokeInner;
          const x2 = cx + cos * spokeOuter;
          const y2 = cy + sin * spokeOuter;

          // Perpendicular direction
          const perpX = -sin;
          const perpY = cos;
          const hw = spokeW / 2;

          const points = [
            [x1 + perpX * (hw * 1.4), y1 + perpY * (hw * 1.4)], // inner-left (wider)
            [x1 - perpX * (hw * 1.4), y1 - perpY * (hw * 1.4)], // inner-right
            [x2 - perpX * (hw * 0.5), y2 - perpY * (hw * 0.5)], // outer-right (narrower, tapered)
            [x2 + perpX * (hw * 0.5), y2 + perpY * (hw * 0.5)], // outer-left
          ]
            .map((p) => p.map((v) => v.toFixed(3)).join(","))
            .join(" ");

          return (
            <polygon
              key={i}
              points={points}
              fill={color}
              opacity={0.95}
            />
          );
        })}
      </g>

      {/* ── Hub disc ──────────────────────────────────────────── */}
      <circle cx={cx} cy={cy} r={hubR} fill={color} opacity={0.95} />

      {/* ── 5 Lug bolts ───────────────────────────────────────── */}
      {spokeAngles.map((angleDeg, i) => {
        const angleRad = (angleDeg * Math.PI) / 180;
        return (
          <circle
            key={i}
            cx={cx + Math.cos(angleRad) * boltDist}
            cy={cy + Math.sin(angleRad) * boltDist}
            r={boltR}
            fill="none"
            stroke={color}
            strokeWidth={r * 0.025}
            opacity={0.5}
          />
        );
      })}

      {/* ── Hub centre hole ───────────────────────────────────── */}
      <circle
        cx={cx}
        cy={cy}
        r={hubInnerR}
        fill="none"
        stroke={color}
        strokeWidth={r * 0.025}
        opacity={0.5}
      />
    </svg>
  );
}

/* ── Main Logo ────────────────────────────────────────────────────────────── */

export function Logo({
  variant = "dark",
  size = "sm",
  iconOnly = false,
  showSubLabel = false,
  className = "",
}: LogoProps) {
  const isDark = variant === "dark";
  const wheelColor = isDark ? "#FFFFFF" : "#0B1F33";
  const textColor = isDark ? "#FFFFFF" : "#0B1F33";
  const accentColor = "#D92D20";

  const { wheel, fontSize, gap } = sizeMap[size];

  return (
    <span
      className={`fengxing-logo ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${gap}px`,
        lineHeight: 1,
        flexShrink: 0,
        textDecoration: "none",
      }}
    >
      {/* Rotating wheel wrapper */}
      <span className="fengxing-wheel-wrapper" aria-hidden="true">
        <LogoIcon size={wheel} color={wheelColor} accent={accentColor} />
      </span>

      {/* Wordmark */}
      {!iconOnly && (
        <span
          className="fengxing-wordmark"
          style={{
            display: "inline-flex",
            flexDirection: "column",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', 'Outfit', system-ui, sans-serif",
              fontSize: `${fontSize}px`,
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: textColor,
              lineHeight: 1,
            }}
          >
            feng
            <span style={{ color: accentColor }}>xing</span>
          </span>
          {/* Sub-label — only when explicitly requested on md/lg */}
          {showSubLabel && size !== "xs" && size !== "sm" && (
            <span
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: `${Math.round(fontSize * 0.32)}px`,
                fontWeight: 600,
                letterSpacing: "0.14em",
                color: isDark ? "rgba(255,255,255,0.45)" : "rgba(11,31,51,0.45)",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              Marketplace
            </span>
          )}
        </span>
      )}
    </span>
  );
}

export default Logo;
