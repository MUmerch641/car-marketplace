"use client";

import { adminUpsertPartCategory } from "@/lib/services/admin-parts";
import { useState } from "react";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CategoryForm({ category }: { category?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const sort_order = parseInt(formData.get("sort_order") as string, 10);
    const is_active = formData.get("is_active") === "true";

    try {
      await adminUpsertPartCategory({
        p_category_id: category ? category.id : null,
        p_name: name,
        p_slug: slug,
        p_description: description,
        p_is_active: is_active,
        p_sort_order: sort_order,
      });
      
      form.reset();
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Name</label>
        <input required name="name" defaultValue={category?.name} className="w-full rounded-lg border p-2 text-sm" placeholder="e.g. Brakes" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Slug</label>
        <input required name="slug" defaultValue={category?.slug} className="w-full rounded-lg border p-2 text-sm" placeholder="e.g. brakes" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
        <textarea name="description" defaultValue={category?.description} className="w-full rounded-lg border p-2 text-sm" rows={2} />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-semibold text-slate-700">Sort Order</label>
          <input required type="number" name="sort_order" defaultValue={category?.sort_order ?? 0} className="w-full rounded-lg border p-2 text-sm" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
          <select name="is_active" defaultValue={category ? String(category.is_active) : "true"} className="w-full rounded-lg border p-2 text-sm bg-white">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
      
      <button 
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-[#0b1f33] py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Category"}
      </button>
    </form>
  );
}
