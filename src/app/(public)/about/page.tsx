import Image from "next/image";
import { CheckCircle2, ShieldCheck, HeartHandshake, Zap } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Shaz"
        title="Making car ownership feel less complicated."
        copy="Shaz brings car discovery, verification, and at-home care into one practical experience."
      />

      {/* Mission Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <AnimatedContent direction="horizontal" distance={40} duration={0.8} ease="power2.out">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-[#0B1F33] sm:text-4xl">
                  A marketplace built on transparency and trust.
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#667085]">
                  Buying, selling, and maintaining a car should not require navigating a maze of disconnected services. We are building a practical marketplace around clearer information and helpful, real-world support.
                </p>
                <p className="mt-4 text-lg leading-8 text-[#667085]">
                  Our goal is simple: make it easier to make a good decision about your car, at every stage of ownership. Whether you're searching for your next vehicle or maintaining your current one, we're here to help.
                </p>
              </div>
            </AnimatedContent>

            <AnimatedContent direction="horizontal" reverse distance={40} duration={0.8} delay={0.2} ease="power2.out">
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-xl lg:aspect-[4/3]">
                <Image
                  src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=1200&q=85"
                  alt="Team member handing over car keys"
                  fill
                  className="object-cover"
                />
              </div>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-[#F8F9FA] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <AnimatedContent distance={30} duration={0.6}>
            <div className="flex flex-col justify-center max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[.12em] text-[#D92D20] mb-2">Our Mission</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0B1F33] sm:text-4xl mb-6">
                Redefining the car buying experience.
              </h2>
              <div className="space-y-4 text-lg text-[#667085]">
                <p>
                  At Shaz, we believe buying or selling a car shouldn&apos;t be a stressful ordeal filled with uncertainty. We&apos;ve built a platform that puts transparency and trust at the forefront.
                </p>
              </div>
            </div>
          </AnimatedContent>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatedContent distance={30} duration={0.6} delay={0.1}>
              <SpotlightCard className="h-full rounded-2xl bg-white p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEE4E2]">
                  <ShieldCheck className="h-6 w-6 text-[#D92D20]" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-[#101828]">Radical Transparency</h3>
                <p className="mt-3 text-[#667085]">We provide all the information you need to make informed decisions without hidden fees or surprises.</p>
              </SpotlightCard>
            </AnimatedContent>

            <AnimatedContent distance={30} duration={0.6} delay={0.2}>
              <SpotlightCard className="h-full rounded-2xl bg-white p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEE4E2]">
                  <HeartHandshake className="h-6 w-6 text-[#D92D20]" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-[#101828]">Customer First</h3>
                <p className="mt-3 text-[#667085]">Your peace of mind is our priority. From verification checks to mobile servicing, we design around your convenience.</p>
              </SpotlightCard>
            </AnimatedContent>

            <AnimatedContent distance={30} duration={0.6} delay={0.3}>
              <SpotlightCard className="h-full rounded-2xl bg-white p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEE4E2]">
                  <Zap className="h-6 w-6 text-[#D92D20]" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-[#101828]">Effortless Speed</h3>
                <p className="mt-3 text-[#667085]">We value your time. Our seamless platform allows you to buy, sell, or book services in just a few clicks.</p>
              </SpotlightCard>
            </AnimatedContent>
          </div>
        </div>
      </section>
    </>
  );
}