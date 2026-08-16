"use client";

import { useState } from "react";
import { Loader2, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";

export function EvidenceManager({
  requestId,
  reportId,
  images,
}: {
  requestId: string;
  reportId: string;
  images: { id: string; storage_path: string; caption: string | null; sort_order: number }[];
}) {
  const [pending, setPending] = useState(false);

  async function upload(fs: FileList | null) {
    if (!fs || fs.length === 0) return;
    const fileList = Array.from(fs);

    if (images.length + fileList.length > 25) {
      toast.error("Maximum 25 evidence images allowed per report.");
      return;
    }

    if (fileList.some((x) => !["image/jpeg", "image/png", "image/webp"].includes(x.type) || x.size > 10485760)) {
      toast.error("Use JPEG, PNG or WebP images under 10MB each.");
      return;
    }

    setPending(true);
    const loadingToast = toast.loading(`Uploading ${fileList.length} photo(s)...`);
    const supabase = createClient();

    try {
      for (const [i, f] of fileList.entries()) {
        const ext = f.type.split("/")[1] === "jpeg" ? "jpg" : f.type.split("/")[1];
        const path = `${requestId}/${reportId}/${crypto.randomUUID()}.${ext}`;

        const { error: storageError } = await supabase.storage.from("inspection-images").upload(path, f, { contentType: f.type });
        if (storageError) {
          toast.error("Failed to upload photo file.");
          break;
        }

        const { error: dbError } = await supabase
          .from("inspection_report_images")
          .insert({ inspection_report_id: reportId, storage_path: path, sort_order: images.length + i });

        if (dbError) {
          await supabase.storage.from("inspection-images").remove([path]);
          toast.error("Failed to save image metadata.");
          break;
        }
      }

      toast.dismiss(loadingToast);
      toast.success("Evidence photo(s) uploaded successfully!");
      setTimeout(() => location.reload(), 800);
    } catch {
      toast.dismiss(loadingToast);
      toast.error("An error occurred during photo upload.");
    } finally {
      setPending(false);
    }
  }

  async function removeImage(img: { id: string; storage_path: string }) {
    setPending(true);
    const loadingToast = toast.loading("Removing evidence photo...");
    const supabase = createClient();

    const { error: storageError } = await supabase.storage.from("inspection-images").remove([img.storage_path]);
    if (storageError) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete photo from storage.");
      setPending(false);
      return;
    }

    const { error: dbError } = await supabase.from("inspection_report_images").delete().eq("id", img.id);
    toast.dismiss(loadingToast);

    if (dbError) {
      toast.error("Photo removed from storage, but database record update failed.");
    } else {
      toast.success("Evidence photo removed.");
      setTimeout(() => location.reload(), 600);
    }
    setPending(false);
  }

  return (
    <section className="mt-6 border-t border-slate-200 pt-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0b1f33]">Inspection Evidence Photos</h3>
          <p className="text-xs text-slate-500">Upload clear photos of vehicle exterior, interior, engine bay, and any defects.</p>
        </div>

        <label
          className={`inline-flex items-center gap-2 rounded-xl bg-[#0b1f33] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer hover:bg-[#163452] ${
            pending ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={pending}
            onChange={(e) => upload(e.target.files)}
          />
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={16} />
              <span>Upload Photos</span>
            </>
          )}
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {images.map((x) => (
            <div key={x.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs">
              <div className="flex items-center gap-2 truncate">
                <ImageIcon size={16} className="text-slate-400 shrink-0" />
                <span className="truncate font-semibold text-slate-700">{x.caption || "Inspection evidence photo"}</span>
              </div>
              <button
                disabled={pending}
                onClick={() => removeImage(x)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
