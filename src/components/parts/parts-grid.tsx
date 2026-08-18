"use client";

import { PartWithImage, PartCategory } from "@/types/parts.types";
import { PackageX } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PartsGridProps {
  parts: PartWithImage[];
  categories: PartCategory[];
  currentCategory?: string;
}

export function PartsGrid({ parts, categories, currentCategory }: PartsGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCategorySelect = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Categories Sidebar */}
      <aside className="w-full md:w-[260px] shrink-0">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] overflow-hidden sticky top-24">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-[16px] font-bold text-[#0b1f33]">Categories</h3>
          </div>
          <div className="p-2 flex flex-col gap-1">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${
                !currentCategory 
                  ? "bg-slate-100 text-[#0b1f33]" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#0b1f33]"
              }`}
            >
              All Parts
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${
                  currentCategory === cat.id 
                    ? "bg-slate-100 text-[#0b1f33]" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0b1f33]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Grid */}
      <div className="flex-1">
        {parts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 sm:p-20 text-center shadow-sm h-full min-h-[400px]">
             <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 mb-6">
               <PackageX size={28} className="text-slate-400" />
             </div>
             <h3 className="text-[20px] font-bold text-[#0b1f33]">No parts found</h3>
             <p className="mt-2.5 text-[15px] text-slate-500 max-w-sm leading-relaxed">
               We couldn&apos;t find any active parts matching your current selection. 
               If you have a vehicle selected, try clearing it or selecting a different category.
             </p>
             {currentCategory && (
               <button onClick={() => handleCategorySelect(null)} className="mt-6 rounded-xl bg-[#0b1f33] px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-slate-800">
                 Clear filters
               </button>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {parts.map((part) => {
              const inStock = part.stock_quantity > 0;
              const priceGBP = (part.price_pence / 100).toFixed(2);
              
              return (
                <div key={part.id} className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] transition-all hover:border-slate-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)]">
                  {/* Image placeholder / real image */}
                  <div className="aspect-[4/3] w-full bg-slate-50 border-b border-slate-100 flex items-center justify-center relative overflow-hidden">
                    {part.primary_image ? (
                       <img 
                         src={part.primary_image.storage_path} 
                         alt={part.name} 
                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                       />
                    ) : (
                       <PackageX size={48} className="text-slate-300" strokeWidth={1} />
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {inStock ? (
                        <span className="inline-flex items-center rounded-lg bg-green-50 px-2.5 py-1 text-[12px] font-bold text-green-700 ring-1 ring-inset ring-green-600/20 shadow-sm">
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-[12px] font-bold text-slate-600 ring-1 ring-inset ring-slate-500/20 shadow-sm">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">{part.brand}</p>
                      <h3 className="text-[16px] font-bold text-[#0b1f33] leading-snug line-clamp-2">
                        {part.name}
                      </h3>
                    </div>
                    
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                      <span className="text-[20px] font-black tracking-tight text-[#0b1f33]">£{priceGBP}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
