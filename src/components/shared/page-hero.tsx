import AnimatedContent from "@/components/AnimatedContent";
import BlurText from "@/components/BlurText";

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
    <section className="bg-sand py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Eyebrow + headline */}
        <AnimatedContent distance={18} duration={0.55}>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">
            {eyebrow}
          </p>
          <BlurText
            text={title}
            animateBy="words"
            delay={70}
            stepDuration={0.25}
            className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl"
          />
        </AnimatedContent>

        {/* Supporting copy — slightly delayed */}
        <AnimatedContent distance={14} duration={0.6} delay={0.3}>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#607069]">{copy}</p>
        </AnimatedContent>
      </div>
    </section>
  );
}
