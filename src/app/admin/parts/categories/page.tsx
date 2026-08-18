import { getPartCategories } from "@/lib/services/parts";
import { CategoryForm } from "./category-form";

export default async function AdminCategoriesPage() {
  const categories = await getPartCategories(); // This currently filters by active, wait!

  return (
    <div className="p-5 lg:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0b1f33] sm:text-3xl">Part Categories</h1>
        <p className="mt-1 text-sm text-slate-500">Manage product categories for the marketplace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
           <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
             <h2 className="font-bold text-[#0b1f33] mb-4">Add new category</h2>
             <CategoryForm />
           </div>
        </div>
        
        <div className="md:col-span-2">
           <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm text-slate-600">
               <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                 <tr>
                   <th className="px-5 py-3 font-semibold">Name</th>
                   <th className="px-5 py-3 font-semibold">Slug</th>
                   <th className="px-5 py-3 font-semibold">Order</th>
                   <th className="px-5 py-3 font-semibold">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {categories.map((cat) => (
                   <tr key={cat.id} className="hover:bg-slate-50">
                     <td className="px-5 py-3 font-semibold text-[#0b1f33]">{cat.name}</td>
                     <td className="px-5 py-3 font-mono text-xs">{cat.slug}</td>
                     <td className="px-5 py-3">{cat.sort_order}</td>
                     <td className="px-5 py-3">
                       {cat.is_active ? "Active" : "Inactive"}
                     </td>
                   </tr>
                 ))}
                 {categories.length === 0 && (
                   <tr>
                     <td colSpan={4} className="p-4 text-center text-slate-500">No categories found.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}
