import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { ShazGuide } from "@/components/shaz/guide";
import { Button } from "@/components/ui/button";
export const metadata: Metadata = { title: "Help & support" };
const questions = [
  {
    title: "When do I pay?",
    copy: "Shaz confirms your appointment and full quote first. Review the parts and service costs, then pay the full amount before your visit. Your booking shows your payment status.",
  },
  {
    title: "What service can I book?",
    copy: "Arrange an oil and filter change at your home or workplace. Available services and starting prices are shown before you request a visit.",
  },
  {
    title: "Can I change or cancel a visit?",
    copy: "Open your booking and check your change options. That screen shows the deadline, available options and refund treatment for your booking. If online changes are unavailable, contact Shaz using the link on your booking.",
  },
  {
    title: "What if my car isn’t found?",
    copy: "Check the registration and try again. In the booking journey, you can also enter the make and model yourself. Shaz checks the correct parts before confirming your quote.",
  },
  {
    title: "Where can the service take place?",
    copy: "Tell us where the car will be parked and whether the surface is level with room around the vehicle. Add any parking or access instructions. Shaz checks suitability before confirming your appointment.",
  },
];
export default function HelpPage() {
  return (
    <>
      <PageHero
        eyebrow="Here when you need us"
        title="A little help, when you need it"
        copy="Clear answers for your next step."
      />
      <main className="mx-auto max-w-3xl space-y-6 px-5 py-8 sm:py-10">
        <div className="space-y-3">
          {questions.map((question, i) => (
            <details
              key={question.title}
              open={i === 0}
              className="group rounded-2xl border border-[#E4E7E3] bg-white px-5"
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-bold text-ink">
                {question.title}
                <span
                  aria-hidden="true"
                  className="text-xl font-normal text-[#526568] group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 text-sm leading-7 text-[#526568]">
                {question.copy}
              </p>
            </details>
          ))}
        </div>
        <ShazGuide title="Help with a particular visit?">
          Your booking keeps its payment status and change options together.
          Open the visit for the right next step.
        </ShazGuide>
        <div className="flex flex-wrap gap-3">
          <Button href="/dashboard/bookings">Go to my visits</Button>
          <Button href="/contact" variant="outline">
            Contact Shaz
          </Button>
          <Button href="/privacy-policy" variant="outline">
            Privacy policy
          </Button>
        </div>
      </main>
    </>
  );
}
