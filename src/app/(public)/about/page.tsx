import { PageHero } from "@/components/shared/page-hero";
export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Fengxing"
        title="Making car ownership feel less complicated."
        copy="Fengxing brings car discovery, verification, and at-home care into one practical experience."
      />
      <section className="mx-auto max-w-4xl px-5 py-14 lg:px-8">
        <div className="space-y-7 text-lg leading-8 text-[#667085]">
          <p>
            Buying, selling, and maintaining a car should not require navigating
            a maze of disconnected services. We are building a practical
            marketplace around clearer information and helpful, real-world
            support.
          </p>
          <p>
            Our goal is simple: make it easier to make a good decision about
            your car, at every stage of ownership.
          </p>
        </div>
      </section>
    </>
  );
}