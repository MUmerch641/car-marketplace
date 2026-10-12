import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShazCompanion } from "@/components/shaz/companion";
export function HeroSection() {
  return (
    <section className="overflow-hidden bg-sand">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:py-14 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-brand-hover">
            <span className="h-2 w-2 rounded-full bg-brand" />
            Mobile oil &amp; filter change
          </p>
          <h1 className="mt-4 max-w-xl text-[2.75rem] font-extrabold leading-[1.08] tracking-[-.045em] text-ink sm:text-6xl">
            Car care on
            <br />
            your terms<span className="text-brand">.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#526568]">
            Your car stays where it is. We bring the oil and filter change to
            your home or work, with a clear quote before you pay.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="#find-your-car">
              Service my car
              <ArrowRight size={17} />
            </Button>
            <Button href="/verification" variant="outline">
              Inspect a car
            </Button>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#526568]">
            {["Matched to your car", "Full quote first", "We come to you"].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#276154]" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
        <div className="relative rounded-[32px] border border-[#E4E7E3] bg-[#FBF8F4] px-5 pb-5 pt-6 sm:px-8">
          <div className="absolute left-1/2 top-8 h-52 w-52 -translate-x-1/2 rounded-full bg-[#E3F1EB] sm:h-64 sm:w-64" />
          <Image
            src="/shaz/service-helper.png"
            alt="Shaz mobile car care illustration"
            width={700}
            height={520}
            priority
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="relative mx-auto h-56 w-full object-contain sm:h-72"
          />
          <div className="relative flex items-center gap-4 rounded-2xl border border-[#E4E7E3] bg-white p-4">
            <ShazCompanion size={62} />
            <div>
              <p className="text-sm font-bold text-ink">
                Let’s take care of your car
              </p>
              <p className="mt-1 text-xs leading-5 text-[#526568]">
                Start with your registration. Shaz takes it from there.
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#276154]">
                <MapPin size={12} />
                At home or work
              </span>
            </div>
          </div>
          <Link
            href="/services"
            className="relative mt-3 block text-center text-xs font-semibold text-[#526568] underline underline-offset-4"
          >
            See what your service includes
          </Link>
        </div>
      </div>
    </section>
  );
}
