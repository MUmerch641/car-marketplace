"use client";

import Image from "next/image";
import { useState } from "react";

export function CarGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const image = images[selected];

  if (!image) return <div className="grid aspect-[4/3] place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">Images are not available for this listing.</div>;

  return (
    <section aria-label="Vehicle photographs">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
        <Image src={image} alt={`${title} — photo ${selected + 1}`} fill unoptimized priority className="object-cover" />
      </div>
      {images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{images.map((thumbnail, index) => <button key={thumbnail} type="button" onClick={() => setSelected(index)} aria-label={`Show photo ${index + 1}`} aria-pressed={index === selected} className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-md border-2 ${index === selected ? "border-[#d92d20]" : "border-transparent hover:border-slate-300"}`}><Image src={thumbnail} alt="" fill unoptimized className="object-cover" /></button>)}</div>}
    </section>
  );
}
