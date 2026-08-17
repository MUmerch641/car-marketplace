import Link from "next/link";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { moderateCarAction } from "@/app/marketplace-actions";

export default async function AdminCarsPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: cars } = await supabase
    .from("cars")
    .select("id,make,model,variant,year,price,city,status,created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#D92D20]">
        Moderation
      </p>
      <h1 className="mt-2 text-3xl font-bold text-[#0B1F33]">All car listings</h1>

      {cars?.length ? (
        <div className="mt-7 space-y-4">
          {cars.map((car) => (
            <article key={car.id} className="rounded-2xl border border-[#E4E7EC] bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-bold text-lg text-[#101828]">
                      {car.year} {car.make} {car.model} {car.variant}
                    </h2>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      car.status === 'active' ? 'bg-[#ECFDF3] text-[#027A48]' :
                      car.status === 'pending_review' ? 'bg-[#FFFAEB] text-[#B54708]' :
                      car.status === 'rejected' ? 'bg-[#FEF3F2] text-[#B42318]' :
                      'bg-[#F2F4F7] text-[#344054]'
                    }`}>
                      {String(car.status).replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 font-semibold text-[#667085]">
                    £{car.price.toLocaleString("en-GB")} · {car.city}
                  </p>
                </div>
                <Link href={`/cars/${car.id}`} className="font-bold text-[#D92D20] hover:underline">
                  View listing
                </Link>
              </div>

              {car.status === "pending_review" && (
                <div className="mt-6 flex flex-wrap gap-3 border-t border-[#F2F4F7] pt-6">
                  <form
                    action={async () => {
                      "use server";
                      await moderateCarAction(car.id, true);
                    }}
                  >
                    <button className="rounded-xl bg-[#039855] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#027A48]">
                      Approve
                    </button>
                  </form>
                  <form
                    action={async (form: FormData) => {
                      "use server";
                      await moderateCarAction(car.id, false, String(form.get("reason") ?? ""));
                    }}
                    className="flex flex-1 gap-2 sm:max-w-md"
                  >
                    <input
                      name="reason"
                      required
                      placeholder="Rejection reason"
                      className="flex-1 rounded-xl border border-[#E4E7EC] bg-[#FAFAFA] px-4 text-sm font-semibold outline-none focus:border-[#D92D20] focus:ring-4 focus:ring-red-50"
                    />
                    <button className="rounded-xl border border-[#D92D20] px-6 py-2.5 text-sm font-bold text-[#D92D20] transition-all hover:bg-red-50">
                      Reject
                    </button>
                  </form>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl border border-dashed border-[#D0D5DD] p-10 text-center text-[#667085]">
          No listings found in the system.
        </div>
      )}
    </main>
  );
}
