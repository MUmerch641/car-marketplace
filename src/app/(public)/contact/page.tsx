import { PageHero } from "@/components/shared/page-hero";
import AnimatedContent from "@/components/AnimatedContent";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="How can we help?"
        copy="Questions about a listing, car verification, or at-home services? We would be glad to hear from you."
      />
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-2xl px-5 lg:px-8">
          <AnimatedContent direction="vertical" distance={40} duration={0.8}>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0B1F33]">Get in touch</h2>
              <p className="mt-4 text-lg text-[#667085]">
                Our team is ready to assist you. Reach out through any of the channels below and we&apos;ll get back to you within 24 hours.
              </p>
            </div>

            <div className="mt-12 flex flex-col gap-8 rounded-3xl border border-[#E4E7EC] bg-white p-8 shadow-xl shadow-black/5 sm:p-10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FEE4E2]">
                  <Mail className="h-6 w-6 text-[#D92D20]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#101828]">Email us</h3>
                  <p className="mt-1 text-[#667085]">For general inquiries and support.</p>
                  <a href="mailto:support@shaz.co.uk" className="mt-2 block font-semibold text-[#D92D20] hover:underline">
                    support@shaz.co.uk
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FEE4E2]">
                  <Phone className="h-6 w-6 text-[#D92D20]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#101828]">Call us</h3>
                  <p className="mt-1 text-[#667085]">Mon-Fri from 9am to 6pm.</p>
                  <a href="tel:+448001234567" className="mt-2 block font-semibold text-[#D92D20] hover:underline">
                    +44 800 123 4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FEE4E2]">
                  <MapPin className="h-6 w-6 text-[#D92D20]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#101828]">Office</h3>
                  <p className="mt-1 text-[#667085]">Come say hello at our HQ.</p>
                  <p className="mt-2 font-semibold text-[#344054]">
                    123 Market Square<br />
                    London, W1D 4AQ<br />
                    United Kingdom
                  </p>
                </div>
              </div>
            </div>
          </AnimatedContent>
        </div>
      </section>
    </>
  );
}
