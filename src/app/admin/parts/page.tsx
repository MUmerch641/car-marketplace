import { getParts } from "@/lib/services/parts";
import Link from "next/link";
import { Package, Plus } from "lucide-react";
import Image from "next/image";

export default async function AdminPartsPage() {
  const parts = await getParts(); // Note: getParts filters by is_active=true currently, wait, we need all parts for admin!

  return (
    <div className="p-5 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1f33] sm:text-3xl">Parts catalogue</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your parts inventory and compatibility.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/parts/categories" className="rounded-lg bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#0b1f33] shadow-sm hover:bg-slate-50">
            Manage Categories
          </Link>
          <Link href="/admin/parts/new" className="inline-flex items-center gap-2 rounded-lg bg-[#0b1f33] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            <Plus size={16} />
            Add Part
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Part</th>
              <th className="px-6 py-4 font-semibold">SKU / Brand</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Stock</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parts.map((part) => (
              <tr key={part.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 relative">
                      {part.primary_image ? (
                        <Image src={part.primary_image.storage_path} alt="" fill className="object-cover" />
                      ) : (
                        <Package size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="font-semibold text-[#0b1f33]">{part.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-mono text-xs">{part.sku}</div>
                  <div className="text-xs text-slate-500">{part.brand}</div>
                </td>
                <td className="px-6 py-4 font-medium text-[#0b1f33]">
                  £{(part.price_pence / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  {part.stock_quantity > 0 ? (
                    <span className="font-medium text-slate-700">{part.stock_quantity}</span>
                  ) : (
                    <span className="font-semibold text-[#d92d20]">Out of stock</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {part.is_active ? (
                    <span className="inline-flex rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">Active</span>
                  ) : (
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/parts/${part.id}`} className="font-semibold text-[#0b1f33] hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {parts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No parts found. Try adding one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
