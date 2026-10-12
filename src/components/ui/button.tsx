import Link from "next/link";
import type { ComponentProps } from "react";
type Props = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "outline";
  className?: string;
};
const styles = {
  primary: "bg-brand-hover text-white hover:bg-[#AC302A]",
  secondary: "border border-[#E4E7E3] bg-white text-ink hover:bg-sand",
  outline: "border border-[#B8C5BE] bg-transparent text-ink hover:bg-white",
};
export function Button({
  variant = "primary",
  className = "",
  ...props
}: Props) {
  return (
    <Link
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-5 py-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-hover ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
