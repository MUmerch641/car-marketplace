export function Badge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "light" | "amber" }) {
  const tones = { green: "bg-[#DCFCE7] text-[#15803D]", light: "bg-white/95 text-[#101828]", amber: "bg-[#FEF3C7] text-[#B45309]" };
  return <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}
