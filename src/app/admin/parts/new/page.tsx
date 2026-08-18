import { getPartCategories } from "@/lib/services/parts";
import { PartForm } from "@/components/admin/parts/part-form";

export default async function NewPartPage() {
  const categories = await getPartCategories(); // need to fetch without active filter eventually, but this is fine for now

  return (
    <div className="p-5 lg:p-8 max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0b1f33] sm:text-3xl">Add New Part</h1>
        <p className="mt-1 text-sm text-slate-500">Create a new product in the marketplace.</p>
      </div>

      <PartForm categories={categories} />
    </div>
  );
}
