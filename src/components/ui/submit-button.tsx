"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingText?: string;
  variant?: "primary" | "secondary" | "dark" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function SubmitButton({
  children,
  loadingText,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  let baseStyle = "inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

  let sizeStyle = "px-4 py-2.5 text-xs rounded-xl";
  if (size === "sm") sizeStyle = "px-3 py-1.5 text-xs rounded-lg";
  if (size === "lg") sizeStyle = "px-6 py-3 text-sm rounded-xl";

  let variantStyle = "bg-[#d92d20] text-white hover:bg-red-700 focus:ring-red-500 shadow-sm";
  if (variant === "secondary") variantStyle = "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 focus:ring-slate-400";
  if (variant === "dark") variantStyle = "bg-[#0b1f33] text-white hover:bg-[#163452] focus:ring-[#0b1f33] shadow-sm";
  if (variant === "danger") variantStyle = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm";
  if (variant === "outline") variantStyle = "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus:ring-slate-300 shadow-sm";
  if (variant === "ghost") variantStyle = "text-slate-700 hover:bg-slate-100 focus:ring-slate-200";

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin shrink-0" />
          <span>{loadingText || "Processing..."}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
