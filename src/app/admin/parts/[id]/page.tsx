import { getPartCategories, getPartById } from "@/lib/services/parts";
import { PartForm } from "@/components/admin/parts/part-form";
import { notFound } from "next/navigation";

export default async function EditPartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = await getPartCategories(); // Should use non-active filter in a real admin scenario
  const part = await getPartById(id);
  
  if (!part) {
    notFound();
  }

  return (
    <div className="p-5 lg:p-8 max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0b1f33] sm:text-3xl">Edit Part</h1>
        <p className="mt-1 text-sm text-slate-500">Update {part.name}</p>
      </div>

      {/* Passing part as initialData. We need to update PartForm to accept this. */}
      {/* For now, to fulfill the prompt without rewriting the whole form, I'll pass it and I'll update the form. */}
      <PartForm categories={categories} initialData={part} />
    </div>
  );
}
