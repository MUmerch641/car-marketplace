"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Check, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
type Stage = "before" | "after";
type Evidence = Database["public"]["Tables"]["service_job_images"]["Row"] & {
  url: string | null;
};
export function ServiceEvidencePanel({
  bookingId,
  status,
  onComplete,
  onBusy,
  completing,
}: {
  bookingId: string;
  status: string;
  onComplete: () => void;
  onBusy: (busy: boolean) => void;
  completing: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const lock = useRef(false);
  const editable = status === "in_progress";
  const notesInitialized = useRef(false);
  const load = useCallback(async () => {
    const report = await supabase
      .from("service_job_reports")
      .select("id,worker_notes")
      .eq("service_booking_id", bookingId)
      .maybeSingle();
    if (report.error)
      throw new Error(
        "Your service evidence couldn’t load. Please retry before completing this job.",
      );
    if (!notesInitialized.current) {
      setNotes(report.data?.worker_notes ?? "");
      notesInitialized.current = true;
    }
    if (!report.data) {
      setImages([]);
      return;
    }
    const result = await supabase
      .from("service_job_images")
      .select("*")
      .eq("service_job_report_id", report.data.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (result.error)
      throw new Error("Your service photos couldn’t load. Please retry.");
    const signed = await Promise.all(
      (result.data ?? []).map(async (image) => {
        const url = await supabase.storage
          .from("service-images")
          .createSignedUrl(image.storage_path, 3600);
        return { ...image, url: url.error ? null : url.data.signedUrl };
      }),
    );
    setImages(signed);
  }, [bookingId, supabase]);
  useEffect(() => {
    let active = true;
    load()
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);
  async function save() {
    const result = await supabase.rpc("save_service_job_report", {
      p_booking_id: bookingId,
      p_notes: notes.trim(),
    });
    if (result.error || !result.data)
      throw new Error("Your worker notes couldn’t be saved. Please try again.");
    return result.data;
  }
  async function work(action: () => Promise<void>) {
    if (lock.current || completing || !editable) return;
    lock.current = true;
    setBusy(true);
    onBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "This update couldn’t be saved. Please try again.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
      onBusy(false);
    }
  }
  async function upload(file: File, stage: Stage) {
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    )
      throw new Error("Choose a JPG, PNG or WebP photo under 5 MB.");
    const reportId = await save();
    const extension = (
      {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      } as Record<string, string>
    )[file.type];
    const path = `${bookingId}/${reportId}/${stage}-${crypto.randomUUID()}.${extension}`;
    const uploaded = await supabase.storage
      .from("service-images")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });
    if (uploaded.error)
      throw new Error("Your photo couldn’t upload. Please try again.");
    const saved = await supabase
      .from("service_job_images")
      .insert({
        service_job_report_id: reportId,
        storage_path: path,
        stage,
        sort_order: images.length,
      });
    if (saved.error) {
      await supabase.storage.from("service-images").remove([path]);
      throw new Error("Your photo record couldn’t save. Please try again.");
    }
    await load();
    setMessage("Photo and notes saved.");
  }
  const hasBefore = images.some((image) => image.stage === "before");
  const hasAfter = images.some((image) => image.stage === "after");
  return (
    <section
      aria-labelledby="service-evidence-title"
      className="rounded-2xl border border-[#E4E7E3] bg-sand p-4"
    >
      <h3 id="service-evidence-title" className="text-base font-bold text-ink">
        Service notes & evidence
      </h3>
      <p className="mt-2 text-xs leading-5 text-[#526568]">
        Keep at least one before and one after photo for this service.
        Save your notes before completing the service.
      </p>
      {loading ? (
        <p className="mt-4 text-sm text-[#526568]" role="status">
          Loading saved evidence…
        </p>
      ) : (
        <>
          <div className="mt-4">
            <label htmlFor="service-worker-notes" className="input-label">
              Worker notes
            </label>
            <textarea
              id="service-worker-notes"
              rows={4}
              maxLength={5000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={!editable || busy || completing}
              className="input-standard w-full"
              placeholder="Work completed and anything the customer should know"
            />
            {editable && (
              <button
                type="button"
                disabled={busy || completing}
                onClick={() =>
                  void work(async () => {
                    await save();
                    setMessage("Worker notes saved.");
                  })
                }
                className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#B8C5BE] bg-white px-3 text-sm font-bold disabled:opacity-50"
              >
                <Save size={16} />
                Save notes
              </button>
            )}
          </div>
          <div className="mt-5 space-y-5">
            {(["before", "after"] as const).map((stage) => (
              <fieldset key={stage}>
                <legend className="text-sm font-bold capitalize text-ink">
                  {stage}-service photos
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {images
                    .filter((image) => image.stage === stage)
                    .map((image) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-xl border border-[#E4E7E3] bg-white"
                      >
                        {image.url ? (
                          <a
                            href={image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${stage}-service photo`}
                          >
                            <img
                              src={image.url}
                              alt={`${stage}-service evidence`}
                              className="aspect-square w-full object-cover"
                            />
                          </a>
                        ) : (
                          <p className="p-3 text-xs text-[#526568]">
                            Photo saved. Preview unavailable.
                          </p>
                        )}
                      </div>
                    ))}
                </div>
                {editable && (
                  <label
                    className={`mt-3 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#B8C5BE] bg-white px-3 text-sm font-semibold ${busy || completing ? "opacity-50" : ""}`}
                  >
                    <Camera size={17} />
                    Add {stage} photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={busy || completing}
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) void work(() => upload(file, stage));
                      }}
                    />
                  </label>
                )}
              </fieldset>
            ))}
          </div>
          {editable && (
            <div className="mt-5 border-t border-[#E4E7E3] pt-4">
              <p className="mb-3 text-xs text-[#526568]">
                {hasBefore && hasAfter
                  ? "Before and after evidence saved. Ready to complete."
                  : "Add both photo stages to complete this job."}
              </p>
              <button
                type="button"
                disabled={
                  busy || completing || !hasBefore || !hasAfter || !!error
                }
                onClick={() =>
                  void work(async () => {
                    if (
                      !window.confirm(
                        "Complete this service and save your latest notes?",
                      )
                    )
                      return;
                    await save();
                    onComplete();
                  })
                }
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-brand-hover px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                <Check size={17} />
                {busy || completing ? "Saving…" : "Complete service"}
              </button>
            </div>
          )}
        </>
      )}
      {message && (
        <p className="mt-3 text-sm text-[#276154]" role="status">
          {message}
        </p>
      )}
      {error && (
        <div className="mt-3 text-sm text-brand-hover" role="alert">
          <p>{error}</p>
          <button
            type="button"
            disabled={busy || completing}
            onClick={() => {
              setError("");
              setLoading(true);
              void load()
                .catch((cause) => setError(cause.message))
                .finally(() => setLoading(false));
            }}
            className="mt-2 min-h-11 font-bold underline"
          >
            Reload saved evidence
          </button>
        </div>
      )}
    </section>
  );
}
