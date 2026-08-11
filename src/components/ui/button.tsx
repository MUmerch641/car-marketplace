import Link from "next/link";
import type { ComponentProps } from "react";
type Props = ComponentProps<typeof Link> & { variant?: "primary" | "secondary" | "outline"; className?: string };
const styles = { primary: "bg-brand text-white hover:bg-[#B42318]", secondary: "bg-white text-ink hover:bg-[#F5F6F7]", outline: "border border-[#D0D5DD] text-ink hover:border-brand hover:text-brand" };
export function Button({ variant = "primary", className = "", ...props }: Props) { return <Link className={`inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none ${styles[variant]} ${className}`} {...props} />; }
