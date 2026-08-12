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
        eyebrow="Mobile car services"
        title="We come to you."
        copy="Book practical car care where your car is parked. There is no garage visit required."
      />

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        {services.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="border border-dashed border-[#D0D5DD] p-10 text-center">
              <h2 className="text-xl font-bold">
                No mobile services are available yet
              </h2>
              <p className="mt-2 text-[#667085]">Please check back soon.</p>
            </div>
          </AnimatedContent>
        )}

        <AnimatedContent distance={20} duration={0.65} delay={0.2}>
          <div className="mt-14 grid gap-5 border border-[#E4E7EC] bg-[#F5F6F7] p-7 sm:grid-cols-3">
            <div>
              <h2 className="text-xl font-bold">Why book at home?</h2>
            </div>
            <p className="text-sm leading-6 text-[#667085]">
              No workshop queues or logistics. Choose a preferred time and have
              the work completed where it suits you.
            </p>
            <p className="text-sm leading-6 text-[#667085]">
              A booking request is confirmed by our team before a worker travels
              to you.
            </p>
          </div>
        </AnimatedContent>
      </section>
    </>
  );
}
