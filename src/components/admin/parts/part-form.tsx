"use client";

import { PartCategory, PartVehicleCompatibility } from "@/types/parts.types";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminUpsertPart, adminReplacePartFitments, uploadPartImage, adminAddPartImage } from "@/lib/services/admin-parts";

interface PartFormProps {
  categories: PartCategory[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

export function PartForm({ categories, initialData }: PartFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fitments, setFitments] = useState<any[]>(initialData?.part_vehicle_compatibility || []);

  const addFitment = () => {
    setFitments([...fitments, { make: "", model: "", year_from: null, year_to: null, fuel_type: null, engine_capacity_cc: null, notes: "" }]);
  };

  const removeFitment = (index: number) => {
    setFitments(fitments.filter((_, i) => i !== index));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFitment = (index: number, field: string, value: any) => {
    const newFitments = [...fitments];
    newFitments[index] = { ...newFitments[index], [field]: value };
    setFitments(newFitments);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const sku = formData.get("sku") as string;
      const slug = formData.get("slug") as string;
      const brand = formData.get("brand") as string;
      const description = formData.get("description") as string;
      const category_id = formData.get("category_id") as string;
      const priceGBP = parseFloat(formData.get("price") as string);
      const stock_quantity = parseInt(formData.get("stock_quantity") as string, 10);
      const is_active = formData.get("is_active") === "true";
      
      const price_pence = Math.round(priceGBP * 100);
      const partId = initialData ? initialData.id : crypto.randomUUID();

      // 1. Upsert Part
      await adminUpsertPart({
        p_part_id: partId,
        p_category_id: category_id,
        p_sku: sku,
        p_name: name,
        p_slug: slug,
        p_brand: brand,
        p_description: description,
        p_price_pence: price_pence,
        p_stock_quantity: stock_quantity,
        p_is_active: is_active,
      });

      // 2. Upload Image (if provided)
      const imageFile = formData.get("image") as File;
      if (imageFile && imageFile.size > 0) {
        if (imageFile.size > 10 * 1024 * 1024) throw new Error("Image too large (max 10MB)");
        const fileName = `${Date.now()}-${imageFile.name}`;
        
        const fileData = new FormData();
        fileData.append("file", imageFile);
        
        const uploadResult = await uploadPartImage(fileData, partId, fileName);
        
        await adminAddPartImage({
          p_part_id: partId,
          p_storage_path: uploadResult.path,
          p_sort_order: 1,
          p_alt_text: name
        });
      }

      // 3. Replace Fitments
      await adminReplacePartFitments(partId, fitments);

      router.push("/admin/parts");
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to save part");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24">
      {error && <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-[#0b1f33]">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Part Name</label>
            <input required name="name" defaultValue={initialData?.name} className="w-full rounded-lg border p-2.5 text-sm" placeholder="e.g. Premium Oil Filter" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">SKU</label>
            <input required name="sku" defaultValue={initialData?.sku} className="w-full rounded-lg border p-2.5 text-sm font-mono" placeholder="e.g. FIL-10293" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Brand</label>
            <input required name="brand" defaultValue={initialData?.brand} className="w-full rounded-lg border p-2.5 text-sm" placeholder="e.g. Bosch" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Slug</label>
            <input required name="slug" defaultValue={initialData?.slug} className="w-full rounded-lg border p-2.5 text-sm font-mono" placeholder="premium-oil-filter" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Category</label>
            <select required name="category_id" defaultValue={initialData?.category_id || ""} className="w-full rounded-lg border p-2.5 text-sm bg-white">
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
            <textarea name="description" defaultValue={initialData?.description} className="w-full rounded-lg border p-2.5 text-sm" rows={4} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0b1f33]">Vehicle Compatibility</h2>
          <button type="button" onClick={addFitment} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-[#0b1f33] hover:bg-slate-200">
            <Plus size={16} /> Add Fitment
          </button>
        </div>
        
        {fitments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No vehicle fitments added yet. This part will be universally compatible if none are specified.</p>
        ) : (
          <div className="space-y-4">
            {fitments.map((fitment, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4 relative pr-12">
                <button type="button" onClick={() => removeFitment(index)} className="absolute right-4 top-4 text-slate-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Make</label>
                    <input required value={fitment.make || ""} onChange={(e) => updateFitment(index, "make", e.target.value)} className="w-full rounded-md border p-2 text-sm" placeholder="Vauxhall" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Model</label>
                    <input required value={fitment.model || ""} onChange={(e) => updateFitment(index, "model", e.target.value)} className="w-full rounded-md border p-2 text-sm" placeholder="Astra" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Year From</label>
                    <input type="number" value={fitment.year_from || ""} onChange={(e) => updateFitment(index, "year_from", parseInt(e.target.value) || null)} className="w-full rounded-md border p-2 text-sm" placeholder="2012" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Year To</label>
                    <input type="number" value={fitment.year_to || ""} onChange={(e) => updateFitment(index, "year_to", parseInt(e.target.value) || null)} className="w-full rounded-md border p-2 text-sm" placeholder="2018" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Fuel Type</label>
                    <select value={fitment.fuel_type || ""} onChange={(e) => updateFitment(index, "fuel_type", e.target.value || null)} className="w-full rounded-md border p-2 text-sm bg-white">
                      <option value="">Any</option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="plug_in_hybrid">Plug-in Hybrid</option>
                      <option value="electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Engine CC</label>
                    <input type="number" value={fitment.engine_capacity_cc || ""} onChange={(e) => updateFitment(index, "engine_capacity_cc", parseInt(e.target.value) || null)} className="w-full rounded-md border p-2 text-sm" placeholder="1399" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Notes</label>
                    <input value={fitment.notes || ""} onChange={(e) => updateFitment(index, "notes", e.target.value)} className="w-full rounded-md border p-2 text-sm" placeholder="e.g. For vehicles without start/stop" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-[#0b1f33]">Pricing & Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Price (GBP)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">£</span>
              <input required type="number" step="0.01" min="0" defaultValue={initialData ? (initialData.price_pence / 100).toFixed(2) : ""} name="price" className="w-full rounded-lg border py-2.5 pl-8 pr-3 text-sm" placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Stock Quantity</label>
            <input required type="number" min="0" name="stock_quantity" defaultValue={initialData?.stock_quantity ?? "0"} className="w-full rounded-lg border p-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Status</label>
            <select name="is_active" defaultValue={initialData ? (initialData.is_active ? "true" : "false") : "true"} className="w-full rounded-lg border p-2.5 text-sm bg-white">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-[#0b1f33]">Product Image</h2>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Primary Image (JPEG, PNG, WebP up to 10MB)</label>
          <input type="file" name="image" accept="image/jpeg, image/png, image/webp" className="w-full rounded-lg border p-2.5 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200" />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="rounded-xl bg-[#0b1f33] px-8 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50">
          {loading ? "Saving..." : "Save Part"}
        </button>
      </div>
    </form>
  );
}
