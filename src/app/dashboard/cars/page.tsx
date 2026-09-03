import Link from "next/link";
import { ArrowRight, CarFront, CheckCircle2 } from "lucide-react";
import { getMyCars } from "@/lib/marketplace/cars";
import { MarkSoldButton } from "@/components/cars/mark-sold-button";
import { ActionMenu } from "@/components/ui/action-menu";

export const metadata = {
  title: "My Cars | Shaz",
};

function Status({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    draft: "bg-slate-100 text-slate-700 ring-slate-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
    sold: "bg-blue-50 text-blue-800 ring-blue-200",
    archived: "bg-slate-100 text-slate-600 ring-slate-200",
  };

  const label = status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
      {label}
    </span>
  );
}

export default async function MyCarsPage() {
  const cars = await getMyCars();

  return (
    <main className="bg-[#f7f8fa] py-7 sm:py-9 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0b1f33]">My Cars</h1>
            <p className="mt-2 text-[15px] text-slate-600">Manage the vehicles you have listed on Shaz.</p>
          </div>
          <Link href="/sell-car" className="inline-flex w-fit items-center rounded-lg bg-[#d92d20] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b42318]">
            Sell another car <ArrowRight size={16} className="ml-2" />
          </Link>
        </header>

        <section className="mt-8">
          {cars.length > 0 ? (
            <div className="flex flex-col gap-4">
              {cars.map((car) => (
                <div key={car.id} className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
                  <div className="h-40 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-32 sm:w-48" style={car.image ? { backgroundImage: `url(${car.image})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>
                    {!car.image && <CarFront className="mx-auto mt-12 sm:mt-10 text-slate-400" size={32} />}
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between self-stretch">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {car.registration && (
                            <div className="mb-2 inline-block rounded border border-yellow-500 bg-yellow-400 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-black">
                              {car.registration}
                            </div>
                          )}
                          <h3 className="text-lg font-bold text-[#0b1f33] leading-tight">{car.title}</h3>
                        </div>
                        <Status status={car.status ?? "draft"} />
                      </div>
                      
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                        <span className="font-semibold text-[#0b1f33]">{car.price}</span>
                        <span className="text-slate-300">|</span>
                        <span>{car.mileage}</span>
                        <span className="text-slate-300">|</span>
                        <span>{car.city}</span>
                        
                        {car.verified && (
                          <>
                            <span className="text-slate-300">|</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                              <CheckCircle2 size={14} /> Shaz Verified
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap items-center gap-3 sm:justify-end">
                      {car.status === "active" && (
                        <Link href={`/cars/${car.id}`} className="text-slate-700 hover:text-[#0b1f33] text-sm font-semibold">
                          View
                        </Link>
                      )}
                      
                      {['draft', 'rejected', 'active', 'pending'].includes(car.status ?? "") && (
                        <Link href={`/dashboard/cars/${car.id}/edit`} className="text-[#d92d20] hover:text-[#b42318] text-sm font-semibold">
                          Edit
                        </Link>
                      )}

                      {car.status === "active" && (
                        <ActionMenu>
                          <MarkSoldButton carId={car.id} />
                        </ActionMenu>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                <CarFront size={28} className="text-slate-400" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#0b1f33]">No cars listed yet</h3>
              <p className="mt-2 text-[15px] text-slate-600 max-w-sm">
                You haven&apos;t listed any cars on the marketplace yet. Create your first listing to reach thousands of buyers.
              </p>
              <Link href="/sell-car" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#d92d20] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b42318]">
                Sell a car <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
