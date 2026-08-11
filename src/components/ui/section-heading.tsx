import { Button } from "./button";
export function SectionHeading({ eyebrow, title, copy, link }: { eyebrow?: string; title: string; copy?: string; link?: { href: string; label: string } }) {
  return <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div className="max-w-2xl"><p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-brand">{eyebrow}</p><h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>{copy && <p className="mt-3 text-base leading-7 text-[#64736d]">{copy}</p>}</div>{link && <Button href={link.href} variant="outline" className="shrink-0">{link.label} <span className="ml-2">→</span></Button>}</div>;
}
