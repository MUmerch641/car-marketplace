import React from "react";

export type LogoVariant = "dark" | "light";
export type LogoSize = "xs" | "sm" | "md" | "lg";

type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize;
  iconOnly?: boolean;
  showSubLabel?: boolean;
  className?: string;
};

type LogoIconProps = { size?: number; color?: string; accent?: string; className?: string };

const sizes = {
  xs: { icon: 20, word: 15, gap: 6 },
  sm: { icon: 32, word: 25, gap: 9 },
  md: { icon: 42, word: 33, gap: 11 },
  lg: { icon: 54, word: 42, gap: 14 },
};

/** Shaz turbine mark: a moving automotive wheel with a fixed S-shaped hub. */
export function LogoIcon({ size = 36, color = "#FFFFFF", accent = "#E94A3F", className = "" }: LogoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Shaz" className={`shaz-wheel-mark ${className}`}>
      <circle cx="24" cy="24" r="23" fill={accent} />
      <circle cx="24" cy="24" r="20.5" fill="#082A30" stroke={color} strokeWidth="1.25" opacity="0.98" />

      <g className="shaz-wheel-spin">
        <circle cx="24" cy="24" r="17" fill="none" stroke="#F7F4EF" strokeWidth="1.15" opacity="0.75" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <path
            key={angle}
            d="M22.4 20.5 18 9.2c3.8-1.4 8.2-1.4 12 0l-4.4 11.3Z"
            fill="#F7F4EF"
            opacity="0.92"
            transform={`rotate(${angle} 24 24)`}
          />
        ))}
        <circle cx="24" cy="24" r="7.3" fill="none" stroke={accent} strokeWidth="1.4" strokeDasharray="2.2 2.7" />
      </g>

      <circle cx="24" cy="24" r="7" fill={accent} stroke="#F7F4EF" strokeWidth="1.25" />
      <path d="M28.1 19.8h-6.5c-2.2 0-3.5 1.2-3.5 2.8 0 1.6 1.1 2.5 3.2 2.8l3.6.5c1 .2 1.4.5 1.4 1.1 0 .7-.6 1.1-1.7 1.1h-6.3" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ variant = "dark", size = "sm", iconOnly = false, showSubLabel = false, className = "" }: LogoProps) {
  const token = sizes[size];
  const textColor = variant === "dark" ? "#FFFFFF" : "#082A30";
  return (
    <span className={`shaz-logo ${className}`} style={{ display: "inline-flex", alignItems: "center", gap: token.gap, flexShrink: 0, lineHeight: 1 }}>
      <LogoIcon size={token.icon} />
      {!iconOnly && <span style={{ display: "flex", flexDirection: "column" }}><span style={{ color: textColor, fontSize: token.word, fontWeight: 850, letterSpacing: "-.055em", lineHeight: .9 }}>shaz</span>{showSubLabel && size !== "xs" && size !== "sm" && <span style={{ marginTop: 5, color: variant === "dark" ? "rgba(255,255,255,.58)" : "rgba(8,42,48,.58)", fontSize: Math.max(9, Math.round(token.word * .3)), fontWeight: 750, letterSpacing: ".15em", textTransform: "uppercase" }}>cars + care</span>}</span>}
    </span>
  );
}

export default Logo;
