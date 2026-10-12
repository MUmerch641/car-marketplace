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
    <section className="border-b border-[#E4E7E3] bg-sand py-8 sm:py-11">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[.12em] text-brand-hover">
          {eyebrow}
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#526568]">
          {copy}
        </p>
      </div>
    </section>
  );
}
