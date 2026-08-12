import { PageHero } from "@/components/shared/page-hero";
import { ServiceCard } from "@/components/services/service-card";
import AnimatedContent from "@/components/AnimatedContent";
import { getActiveServices } from "@/lib/services/services";
import { CSS_STAGGER } from "@/lib/motion";

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <>
      <PageHero
        eyebrow="Mobile services"
        title="Car care that comes to you"
        copy="No garage visit needed. We send a qualified worker to your location."
      />

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="rounded-2xl border border-[#E4E7EC] bg-[#F9FAFB] p-8">
          <h2 className="font-h3 text-ink">How it works</h2>
          <p className="mt-3 text-[#667085]">
            Book practical car care where your car is parked. No garage visit
            required.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Book online",
                text: "Choose your service, date and time. We'll confirm your appointment.",
              },
              {
                title: "We come to you",
                text: "A qualified worker travels to your location with all necessary equipment.",
              },
              {
                title: "Service completed",
                text: "Your car is ready. Pay securely through the platform.",
              },
              {
                title: "Verified quality",
                text: "All our workers are vetted and experienced in their field.",
              },
            ].map((step, i) => (
              <AnimatedContent
                key={i}
                distance={16}
                duration={0.55}
                delay={i * CSS_STAGGER.step / 1000}
              >
                <div className="rounded-xl border border-[#E4E7EC] bg-white p-6 shadow-sm">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <h3 className="font-h4 text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm text-[#667085]">{step.text}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>

        {services.length ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <AnimatedContent
                key={service.slug}
                distance={22}
                duration={0.65}
                delay={i * CSS_STAGGER.card / 1000}
              >
                <ServiceCard service={service} />
              </AnimatedContent>
            ))}
          </div>
        ) : (
          <AnimatedContent distance={16} duration={0.6}>
            <div className="mt-8 border border-dashed border-[#D0D5DD] p-10 text-center">
              <h2 className="font-h3 text-ink">No services available yet</h2>
              <p className="mt-2 text-[#667085]">Please check back soon.</p>
            </div>
          </AnimatedContent>
        )}
      </section>
    </>
  );
}
