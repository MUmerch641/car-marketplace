import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { Logo } from "@/components/Logo";
export function AuthShell({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: React.ReactNode;
}) {
  const login = mode === "login";
  return (
    <main className="bg-sand px-5 py-8 sm:py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-[#E4E7E3] bg-white lg:grid-cols-2">
        <section className="hidden bg-[#E3F1EB] p-9 lg:block">
          <Link href="/" aria-label="Shaz home">
            <Logo variant="light" />
          </Link>
          <h1 className="mt-10 text-3xl font-extrabold leading-tight tracking-tight text-ink">
            {login
              ? "Good to have you back"
              : "A little less hassle for your car"}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#526568]">
            Your cars, visits and payments, all together in your Shaz account.
          </p>
          <Image
            src="/shaz/service-helper.png"
            alt=""
            width={420}
            height={300}
            className="my-5 h-48 w-full object-contain"
          />
          <ul className="space-y-3 text-sm font-semibold text-ink">
            {[
              "Book a service at home or work",
              "Keep your cars in your garage",
              "Follow your visits and inspection reports",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Check size={18} className="shrink-0 text-[#276154]" />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="px-6 py-8 sm:px-10 lg:py-12">
          <div className="mb-6 lg:hidden">
            <Link href="/" aria-label="Shaz home">
              <Logo variant="light" />
            </Link>
          </div>
          <div className="mx-auto max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}
