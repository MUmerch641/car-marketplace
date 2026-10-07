import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Shaz collects, uses, stores, and shares information in the Shaz app and website.",
};

const updated = "7 October 2026";

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#E4E7EC] pt-8">
      <h2 className="text-xl font-bold tracking-tight text-[#082A30] sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-7 text-[#475467]">
        {children}
      </div>
    </section>
  );
}

function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#F7F4EF] px-5 py-12 sm:py-16">
      <article className="mx-auto max-w-4xl rounded-3xl border border-[#E4E7EC] bg-white px-6 py-9 shadow-sm sm:px-10 sm:py-12">
        <header className="pb-8">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#C73830]">
            Shaz app and website
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#082A30] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-[#667085]">Last updated: {updated}</p>
          <p className="mt-5 text-lg leading-8 text-[#475467]">
            This policy explains how Shaz handles personal information when you
            use the Shaz mobile app or website, contact us, book a service,
            request a vehicle inspection, or use the car marketplace.
          </p>
        </header>

        <div className="space-y-8">
          <PolicySection title="Who is responsible for your information?">
            <p>
              Shaz operates the Shaz app and website and is responsible for the
              personal information described in this policy. For privacy
              questions or requests, email{" "}
              <a
                className="font-semibold text-[#C73830] underline underline-offset-4"
                href="mailto:support@shaz.co.uk"
              >
                support@shaz.co.uk
              </a>
              .
            </p>
          </PolicySection>

          <PolicySection title="Information we collect">
            <p>Depending on how you use Shaz, we may collect:</p>
            <PolicyList
              items={[
                "Account and contact details such as your name, email address, telephone number, and account role. Supabase Auth handles your sign-in credentials; Shaz does not receive your plain-text password.",
                "Vehicle details such as registration number, make, model, year, colour, fuel type, mileage, and other details you save or enter.",
                "Service and inspection details such as the service you request, vehicle information, your service address and postcode, preferred appointment date and time, notes, inspection requests, and reports.",
                "Marketplace information such as vehicle descriptions, specifications, price, mileage, location, photographs, and seller contact details you choose to provide.",
                "Payment records such as the amount, booking reference, payment status, refund status, and Stripe transaction identifiers. Stripe processes card details in its payment flow; Shaz receives the information needed to confirm and manage the payment.",
                "If you allow app notifications, a push token and basic device details such as platform are stored so we can send service and account notifications to that device.",
                "Information you send to customer support and limited technical information needed to keep accounts and services secure and working.",
              ]}
            />
            <p>
              You enter the address or location details used for a service or
              vehicle listing. The app does not use device GPS or background
              location tracking for these features.
            </p>
          </PolicySection>

          <PolicySection title="How we use information">
            <PolicyList
              items={[
                "Create and secure your account and provide the features you request.",
                "Arrange services and inspections, contact you about bookings, and share relevant job details with the Shaz team or the person assigned to carry out the work.",
                "Look up vehicle details when you submit a UK registration number, and help you manage your vehicles and listings.",
                "Show approved marketplace listings to other users. Details and photos in a published listing are visible to people browsing the marketplace; seller contact details may be shown when a buyer uses the contact feature.",
                "Take and reconcile payments, handle payment questions, and process refunds where applicable.",
                "Send service, account, and security notifications, respond to support requests, prevent misuse, and meet legal obligations.",
              ]}
            />
            <p>
              We do not use the information described here for interest-based
              advertising or sell it to data brokers.
            </p>
          </PolicySection>

          <PolicySection title="When we share information">
            <p>
              We share only the information needed for the purposes above with:
            </p>
            <PolicyList
              items={[
                "Supabase, which provides account authentication, database, file storage, and backend services for the app and website.",
                "Stripe, which processes payments. Stripe handles card details in its payment flow; Shaz stores payment references and status needed to manage bookings.",
                "The UK vehicle-data provider accessed through RapidAPI. When you request a lookup, your vehicle registration is sent to that provider so it can return vehicle details.",
                "Expo and, where applicable, Apple and Google, which route push notifications to devices that have allowed notifications.",
                "Resend, which may deliver booking or marketplace emails sent through the website.",
                "Shaz staff, assigned service providers, inspectors, and other users, where needed to deliver a service or where you choose to publish a listing or reveal seller contact details.",
              ]}
            />
            <p>
              These providers process information under their own terms and
              privacy notices. We may also disclose information when required by
              law, to protect people or Shaz, or to resolve a dispute.
            </p>
          </PolicySection>

          <PolicySection title="Where information is processed">
            <p>
              Our service providers may process information in the UK or other
              countries. Where data protection law requires safeguards for an
              international transfer, we use an appropriate transfer mechanism
              for that transfer.
            </p>
          </PolicySection>

          <PolicySection title="How long we keep information">
            <p>
              We keep account information while your account is active and for
              as long as needed to provide the services you request. We may
              retain booking, payment, inspection, support, and security records
              for longer where needed for accounting, legal obligations,
              disputes, or fraud prevention. We remove or de-identify
              information when it is no longer needed for these purposes.
            </p>
            <p>
              To request account deletion or ask about a particular record,
              email us from the email address associated with your Shaz account
              at{" "}
              <a
                className="font-semibold text-[#C73830] underline underline-offset-4"
                href="mailto:support@shaz.co.uk?subject=Shaz%20account%20deletion%20request"
              >
                support@shaz.co.uk
              </a>
              . We may need to verify your request. Some records may need to be
              retained where the law requires it or where they are needed to
              establish or defend a legal claim.
            </p>
          </PolicySection>

          <PolicySection title="Your choices and rights">
            <p>
              You can update some account, vehicle, and listing details in the
              app or website. You can turn off push notifications in your
              device settings. Depending on where you live and the law that
              applies, you may also have rights to access, correct, delete, or
              receive a copy of your information, restrict or object to some
              processing, and withdraw consent where processing is based on
              consent.
            </p>
            <p>
              Contact us at{" "}
              <a
                className="font-semibold text-[#C73830] underline underline-offset-4"
                href="mailto:support@shaz.co.uk"
              >
                support@shaz.co.uk
              </a>{" "}
              to exercise a right or raise a concern. If you are in the UK, you
              may also complain to the Information Commissioner&apos;s Office.
            </p>
          </PolicySection>

          <PolicySection title="Security">
            <p>
              We use account authentication, access controls, and encrypted
              connections to help protect information. No internet service can
              guarantee that information will always be completely secure, so
              please keep your sign-in details private and contact us if you
              think your account has been used without permission.
            </p>
          </PolicySection>

          <PolicySection title="Website cookies">
            <p>
              The website may use essential session cookies to keep you signed
              in and provide account features. We do not use advertising or
              analytics cookies in the current Shaz website code.
            </p>
          </PolicySection>

          <PolicySection title="Changes to this policy">
            <p>
              We may update this policy as Shaz changes or when legal
              requirements change. We will update the date at the top of this
              page when we publish a revised version.
            </p>
          </PolicySection>

          <PolicySection title="Contact Shaz">
            <p>
              For questions, privacy requests, or account-deletion requests,
              email{" "}
              <a
                className="font-semibold text-[#C73830] underline underline-offset-4"
                href="mailto:support@shaz.co.uk"
              >
                support@shaz.co.uk
              </a>
              .
            </p>
          </PolicySection>
        </div>
      </article>
    </main>
  );
}
