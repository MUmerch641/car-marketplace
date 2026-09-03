import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, ChevronRight, Pencil, Upload } from "lucide-react";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/cars/listing-form";
import { ImageManager } from "@/components/cars/image-manager";
import { submitListingAction, updateListingAction, updateActiveListingAction } from "@/app/marketplace-actions";

type Step = "details" | "photos" | "review";

function Progress({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "details", label: "Vehicle details" },
    { key: "photos", label: "Photos" },
    { key: "review", label: "Review & submit" },
  ];
  const active = steps.findIndex((item) => item.key === step);
  return <ol className="grid gap-2 sm:grid-cols-3" aria-label="Listing progress">{steps.map((item, index) => <li key={item.key} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${index < active ? "bg-emerald-50 font-semibold text-emerald-800" : index === active ? "bg-red-50 font-semibold text-[#b42318]" : "bg-slate-100 text-slate-500"}`}>{index < active ? <Check size={16} /> : <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-xs">{index + 1}</span>} {item.label}{index === active && <span className="ml-auto text-xs font-medium">Current</span>}</li>)}</ol>;
}

export default async function EditCarPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ step?: string; created?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const requestedStep = query.step;
  const step: Step = requestedStep === "details" || requestedStep === "review" ? requestedStep : "photos";
  const supabase = await createClient();
  const { data: car } = await supabase.from("cars").select("*, car_images(id,storage_path,sort_order,is_primary)").eq("id", id).maybeSingle();

  if (!car) notFound();
  if (!['draft', 'rejected', 'active'].includes(car.status)) return <main className="mx-auto max-w-3xl px-5 py-12"><h1 className="text-2xl font-bold">This listing cannot be edited right now.</h1><p className="mt-2 text-[#667085]">Pending, sold and archived listings are locked.</p></main>;

  const images = await Promise.all((car.car_images ?? []).sort((a, b) => a.sort_order - b.sort_order).map(async (image) => {
    const { data } = await supabase.storage.from("car-images").createSignedUrl(image.storage_path, 600);
    return { ...image, url: data?.signedUrl ?? null };
  }));
  const isActive = car.status === "active";
  const action = isActive ? updateActiveListingAction.bind(null, car.id) : updateListingAction.bind(null, car.id);
  const vehicleName = `${car.make} ${car.model}`;

  return (
    <main className="bg-[#f7f8fa] py-7 sm:py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="border-b border-slate-200 pb-5">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#d92d20]">Sell your car</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0b1f33]">{car.year} {vehicleName}</h1>
          <p className="mt-2 text-sm text-slate-600">Complete your listing, then send it to Shaz for review.</p>
        </header>

        <div className="mt-5"><Progress step={step} /></div>

        {query.created === "1" && step === "photos" && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900"><p className="font-semibold">Draft saved</p><p className="mt-1 text-sm">Now add photos of your {vehicleName} to continue.</p></div>}
        {car.rejection_reason && <p className="mt-5 rounded-xl border-l-4 border-[#d92d20] bg-red-50 p-4 text-sm text-red-800">Review feedback: {car.rejection_reason}</p>}

        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {step === "details" && <><div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-5"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#d92d20]">Step 1 of 3</p><h2 className="mt-1 text-2xl font-bold text-[#0b1f33]">Vehicle details</h2><p className="mt-1 text-sm text-slate-600">Update the information buyers will see.</p></div><Link href={`/dashboard/cars/${car.id}/edit?step=photos`} className="text-sm font-semibold text-[#d92d20]">Back to photos</Link></div><ListingForm action={action} car={car as unknown as Record<string, string |number | boolean | null>} isActive={isActive} /></>}

          {step === "photos" && <><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href={`/dashboard/cars/${car.id}/edit?step=details`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-[#0b1f33]"><Pencil size={15} /> Edit vehicle details</Link>{images.length > 0 && <Link href={`/dashboard/cars/${car.id}/edit?step=review`} className="inline-flex items-center rounded-lg bg-[#0b1f33] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#173553]">Review listing <ChevronRight size={16} className="ml-1" /></Link>}</div><ImageManager carId={car.id} userId={user.id} images={images} />{images.length > 0 && <div className="mt-6 flex justify-end border-t border-slate-200 pt-5"><Link href={`/dashboard/cars/${car.id}/edit?step=review`} className="inline-flex items-center rounded-lg bg-[#0b1f33] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#173553]">Review listing <ChevronRight size={16} className="ml-1" /></Link></div>}</>}

          {step === "review" && <div><div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#d92d20]">Step 3 of 3</p><h2 className="mt-1 text-2xl font-bold text-[#0b1f33]">Review your listing</h2><p className="mt-1 text-sm text-slate-600">Check the important details before submitting to Shaz.</p></div><Link href={`/dashboard/cars/${car.id}/edit?step=photos`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#d92d20]"><Upload size={15} /> Edit photos</Link></div>{images.length ? <><div className="mt-5 grid gap-5 sm:grid-cols-[180px_1fr]"><div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">{images[0].url && <ImageManagerPreview url={images[0].url} />}</div><dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm"><div><dt className="text-slate-500">Vehicle</dt><dd className="mt-1 font-semibold text-[#0b1f33]">{car.year} {vehicleName}{car.variant ? ` ${car.variant}` : ""}</dd></div><div><dt className="text-slate-500">Price</dt><dd className="mt-1 font-semibold text-[#0b1f33]">£{Number(car.price).toLocaleString("en-GB")}</dd></div><div><dt className="text-slate-500">Mileage</dt><dd className="mt-1 font-semibold text-[#0b1f33]">{Number(car.mileage).toLocaleString("en-GB")} miles</dd></div><div><dt className="text-slate-500">Photos</dt><dd className="mt-1 font-semibold text-[#0b1f33]">{images.length} uploaded</dd></div><div><dt className="text-slate-500">Location</dt><dd className="mt-1 font-semibold text-[#0b1f33]">{car.city}, {car.postcode}</dd></div><div><dt className="text-slate-500">Status</dt><dd className="mt-1 font-semibold text-[#0b1f33] capitalize">{car.status}</dd></div></dl></div><div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between"><Link href={`/dashboard/cars/${car.id}/edit?step=details`} className="text-sm font-semibold text-slate-700">Edit vehicle details</Link>{!isActive && <form action={async () => { "use server"; await submitListingAction(car.id); }}><button type="submit" className="rounded-lg bg-[#d92d20] px-5 py-3 text-sm font-semibold text-white hover:bg-[#b42318]">Submit for review</button></form>}</div></> : <div className="py-8"><p className="font-semibold text-[#0b1f33]">Add at least one photo before submitting.</p><Link href={`/dashboard/cars/${car.id}/edit?step=photos`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#d92d20]">Add photos <ChevronRight size={15} /></Link></div>}</div>}
        </section>
      </div>
    </main>
  );
}

function ImageManagerPreview({ url }: { url: string }) {
  return <Image src={url} alt="Primary listing photo" fill unoptimized className="object-cover" />;
}
