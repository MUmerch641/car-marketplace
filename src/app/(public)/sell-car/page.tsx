import { requireUser } from "@/lib/auth/server";
import { ListingForm } from "@/components/cars/listing-form";
import { createListingAction } from "@/app/marketplace-actions";
import { PageHero } from "@/components/shared/page-hero";

export default async function SellCarPage() {
  await requireUser();

  return (
    <>
      <PageHero
        eyebrow="Sell your car"
        title="Create your car listing"
        copy="Save a draft first, upload clear photos, then submit it for a quick review."
      />
      <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <div className="card-standard">
          <ListingForm action={createListingAction} />
        </div>
      </section>
    </>
  );
}