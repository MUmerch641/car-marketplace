import { Mail, ArrowRight, Phone, MapPin } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { ShazGuide } from "@/components/shaz/guide";
import { Button } from "@/components/ui/button";
import { contact } from "@/lib/brand";
export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Help & support"
        title="We’re here to help"
        copy="Questions about your car, a visit or an inspection? Keep your booking reference handy so we can find the right details."
      />
      <main className="mx-auto max-w-3xl space-y-5 px-5 py-8 sm:py-10">
        <ShazGuide title="Is this about a visit?">
          Your booking shows payment progress, change options and any available
          refund information.
        </ShazGuide>
        <div className="flex flex-wrap gap-3">
          <Button href="/dashboard/bookings">
            Open my visits
            <ArrowRight size={16} />
          </Button>
          <Button href="/help" variant="outline">
            Read common questions
          </Button>
        </div>
        <section className="rounded-3xl border border-[#E4E7E3] bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#FFF5F4] text-brand-hover">
              <Mail size={23} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Email Shaz</h2>
              <p className="mt-2 text-sm leading-6 text-[#526568]">
                Include your booking reference and vehicle registration when
                asking about a visit.
              </p>
              <a
                href={`mailto:${contact.email}`}
                className="mt-3 inline-flex min-h-11 break-all text-sm font-bold text-brand-hover underline underline-offset-4"
              >
                {contact.email}
              </a>
            </div>
          </div>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#E4E7E3] bg-white p-6">
            <Phone size={22} className="text-brand-hover" />
            <h2 className="mt-4 text-base font-bold text-ink">Call Shaz</h2>
            <a
              href={`tel:${contact.phoneHref}`}
              className="mt-2 inline-flex min-h-11 text-sm font-semibold text-brand-hover"
            >
              {contact.phone}
            </a>
          </div>
          <div className="rounded-3xl border border-[#E4E7E3] bg-white p-6">
            <MapPin size={22} className="text-brand-hover" />
            <h2 className="mt-4 text-base font-bold text-ink">Our office</h2>
            <p className="mt-3 text-sm leading-6 text-[#526568]">
              {contact.address}
            </p>
          </div>
        </section>
        {contact.isPlaceholder && (
          <p className="text-xs leading-5 text-[#526568]">
            Contact details are placeholders for this preview.
          </p>
        )}
      </main>
    </>
  );
}
