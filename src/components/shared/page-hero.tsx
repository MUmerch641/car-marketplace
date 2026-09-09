import AnimatedContent from "@/components/AnimatedContent";

export function PageHero({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#082A30]/10 bg-sand py-16 sm:py-20">
      <div className="shaz-page-orbit pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border-[52px] border-[#E94A3F]/8" />
      <div className="absolute inset-y-0 left-0 w-1.5 bg-brand" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <AnimatedContent distance={24} duration={0.78} threshold={0.05}>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-.035em] text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#52686b]">{copy}</p>
        </AnimatedContent>
      </div>
    </section>
  );
}
