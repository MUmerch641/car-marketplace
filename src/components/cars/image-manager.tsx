"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ImageRow = {
  id: string;
  storage_path: string;
  sort_order: number;
  is_primary: boolean;
  url: string | null;
};

function uploadMessage(error: { message?: string; statusCode?: string }) {
  const detail = (error.message ?? "").toLowerCase();
  if (error.statusCode === "413" || detail.includes("too large") || detail.includes("file size")) return "This image is too large. Choose an image smaller than 10MB.";
  if (error.statusCode === "415" || detail.includes("mime") || detail.includes("content type") || detail.includes("format")) return "That image format is not supported. Use a JPEG, PNG or WebP image.";
  if (error.statusCode === "401" || detail.includes("jwt") || detail.includes("session") || detail.includes("not authenticated")) return "Your session has expired. Please sign in again, then retry the upload.";
  return "We could not upload that image. Please try again.";
}

export function ImageManager({ carId, userId, images }: { carId: string; userId: string; images: ImageRow[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    if (images.length + selected.length > 12) return setMessage("A listing can contain up to 12 images.");
    if (selected.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) return setMessage("Use JPEG, PNG or WebP images.");
    if (selected.some((file) => file.size > 10 * 1024 * 1024)) return setMessage("This image is too large. Choose images smaller than 10MB.");

    setPending(true);
    setMessage(null);
    const supabase = createClient();
    let uploaded = 0;
    let failed = false;

    for (const [index, file] of selected.entries()) {
      const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
      const path = `${userId}/${carId}/${crypto.randomUUID()}.${extension}`;
      const { error: storageError } = await supabase.storage.from("car-images").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

      if (storageError) {
        console.error("Car image upload failed", { storageError, file: { type: file.type, size: file.size } });
        setMessage(uploadMessage(storageError));
        failed = true;
        break;
      }

      const { error: recordError } = await supabase.from("car_images").insert({
        car_id: carId,
        storage_path: path,
        sort_order: images.length + index,
        is_primary: images.length === 0 && index === 0,
      });

      if (recordError) {
        await supabase.storage.from("car-images").remove([path]);
        setMessage("The image uploaded but could not be attached to this listing. It was removed safely; please try again.");
        failed = true;
        break;
      }
      uploaded += 1;
    }

    if (uploaded && !failed) setMessage(`${uploaded} image${uploaded === 1 ? "" : "s"} uploaded.`);
    setPending(false);
    router.refresh();
  }

  async function remove(image: ImageRow) {
    setPending(true);
    setMessage(null);
    const supabase = createClient();
    const { error: storageError } = await supabase.storage.from("car-images").remove([image.storage_path]);
    if (storageError) setMessage("We could not remove that image. Please try again.");
    else {
      const { error } = await supabase.from("car_images").delete().eq("id", image.id);
      if (error) setMessage("The file was removed but its listing record could not be updated. Please contact support.");
    }
    setPending(false);
    router.refresh();
  }

  async function makePrimary(image: ImageRow) {
    setPending(true);
    setMessage(null);
    const { error } = await createClient().rpc("set_primary_car_image", { p_image_id: image.id });
    if (error) setMessage("We could not set the primary image. Please try again.");
    setPending(false);
    router.refresh();
  }

  async function move(image: ImageRow, direction: "up" | "down") {
    setPending(true);
    setMessage(null);
    const { error } = await createClient().rpc("move_car_image", { p_image_id: image.id, p_direction: direction });
    if (error) setMessage("We could not reorder that image. Please try again.");
    setPending(false);
    router.refresh();
  }

  return (
    <section aria-labelledby="listing-photos-heading">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#d92d20]">Step 2 of 3</p>
          <h2 id="listing-photos-heading" className="mt-1 text-2xl font-bold text-[#0b1f33]">Add photos</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{images.length} / 12 uploaded. Your first photo is used as the main listing image.</p>
        </div>
        <label className="inline-flex w-fit cursor-pointer items-center rounded-lg bg-[#d92d20] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b42318]">
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={pending} onChange={(event) => upload(event.target.files)} />
          <ImagePlus size={17} className="mr-2" /> {pending ? "Uploading…" : "Upload photos"}
        </label>
      </div>

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">Photo guidance</p>
        <p className="mt-1 leading-6">Add clear exterior, interior, dashboard and tyre photos. Use good daylight, avoid screenshots, and make your strongest exterior image the primary photo.</p>
      </div>

      {message && <p role="status" className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${message.includes("uploaded") ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{message}</p>}

      {images.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <article key={image.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {image.url ? <div className="relative aspect-[4/3]"><Image src={image.url} alt={`Vehicle photo ${index + 1}`} fill unoptimized className="object-cover" /></div> : <div className="grid aspect-[4/3] place-items-center bg-slate-100 text-sm text-slate-500">Image unavailable</div>}
              <div className="flex items-center justify-between gap-2 p-3 text-xs font-semibold">
                {image.is_primary ? <span className="inline-flex items-center gap-1 text-emerald-700"><Star size={14} fill="currentColor" /> Primary photo</span> : <button disabled={pending} onClick={() => makePrimary(image)} className="text-[#d92d20] hover:text-[#b42318]">Make primary</button>}
                <div className="flex items-center gap-1 text-slate-600">
                  <button aria-label="Move photo earlier" disabled={pending || index === 0} onClick={() => move(image, "up")} className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={15} /></button>
                  <button aria-label="Move photo later" disabled={pending || index === images.length - 1} onClick={() => move(image, "down")} className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={15} /></button>
                  <button aria-label="Delete photo" disabled={pending} onClick={() => remove(image)} className="rounded p-1 text-red-700 hover:bg-red-50 disabled:opacity-30"><Trash2 size={15} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <ImagePlus className="mx-auto text-slate-400" size={28} />
          <p className="mt-3 text-sm font-semibold text-[#0b1f33]">No photos uploaded yet</p>
          <p className="mt-1 text-sm text-slate-600">Add at least one photo before you can submit this listing for review.</p>
        </div>
      )}
    </section>
  );
}
