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
const sizes = {
  xs: { icon: 22, word: 17 },
  sm: { icon: 34, word: 26 },
  md: { icon: 44, word: 34 },
  lg: { icon: 56, word: 42 },
};
export function LogoIcon({
  size = 36,
  color = "#F7F4EF",
  accent = "#082A30",
  className = "",
}: {
  size?: number;
  color?: string;
  accent?: string;
  className?: string;
}) {
  return (
    <svg
      width={size * 0.75}
      height={size}
      viewBox="14 2 72 96"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M50 4C50 4 16 42 16 62C16 81 31 96 50 96C69 96 84 81 84 62C84 42 50 4 50 4Z"
        fill={accent}
      />
      <path
        d="M30 52C32 42 38 33 44 25"
        fill="none"
        stroke="#7FDBCA"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".35"
      />
      <path
        d="M62.5 51C60.5 46.5 56 44.5 50 44.5C43.5 44.5 38 48 38 54C38 60.5 44 62.5 50 64.5C56.5 66.5 62.5 69 62.5 76C62.5 83 57 87 50 87C44 87 39.5 84.5 37.5 80"
        fill="none"
        stroke={color}
        strokeWidth="9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function Logo({
  variant = "dark",
  size = "sm",
  iconOnly = false,
  showSubLabel = false,
  className = "",
}: LogoProps) {
  const token = sizes[size];
  const light = variant === "dark";
  return (
    <span
      aria-label="Shaz"
      className={`inline-flex shrink-0 items-center gap-2.5 leading-none ${className}`}
    >
      <LogoIcon
        size={token.icon}
        accent={light ? "#F7F4EF" : "#082A30"}
        color={light ? "#082A30" : "#F7F4EF"}
      />
      {!iconOnly && (
        <span style={{ color: light ? "#F7F4EF" : "#082A30" }}>
          <span
            style={{ fontSize: token.word }}
            className="block font-extrabold tracking-[-.055em]"
          >
            shaz
          </span>
          {showSubLabel && (
            <span className="mt-1 block text-[10px] font-semibold tracking-wider opacity-70">
              CAR CARE
            </span>
          )}
        </span>
      )}
    </span>
  );
}
export default Logo;
