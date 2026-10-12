"use client";
import { Bell, BellOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  disableBrowserPush,
  enableBrowserPush,
  optedIn,
  supportsWebPush,
} from "@/lib/notifications/web-push";
export function WebPushSettings({ userId }: { userId: string }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    setSupported(supportsWebPush());
    if (!supportsWebPush()) return;
    void navigator.serviceWorker
      .getRegistration("/")
      .then(async (registration) => {
        const subscription = await registration?.pushManager.getSubscription();
        setEnabled(
          !!subscription &&
            optedIn(userId) &&
            Notification.permission === "granted",
        );
      })
      .catch(() =>
        setError("We couldn’t read this browser’s settings. Please try again."),
      );
  }, [userId]);
  async function change() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (enabled) {
        await disableBrowserPush(userId);
        setEnabled(false);
        setMessage("Notifications are off on this browser.");
      } else {
        await enableBrowserPush(userId);
        setEnabled(true);
        setMessage("You’ll receive Shaz updates on this browser.");
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Notification settings could not be saved.",
      );
      if (!optedIn(userId)) setEnabled(false);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="rounded-3xl border border-[#E4E7E3] bg-white p-6 sm:p-8">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E3F1EB] text-ink">
        {enabled ? <Bell size={24} /> : <BellOff size={24} />}
      </span>
      <h2 className="mt-4 text-xl font-bold text-ink">
        Updates on this browser
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#526568]">
        Get service quotes payment confirmations appointment changes and job
        updates. You can turn them off here anytime.
      </p>
      {supported === false ? (
        <p className="mt-4 text-sm leading-6 text-[#526568]">
          Notifications aren’t supported here. On iPhone open Shaz in Safari and
          add it to your Home Screen then open the installed Shaz website.
        </p>
      ) : (
        <button
          type="button"
          disabled={busy || supported === null}
          onClick={() => void change()}
          className="mt-5 min-h-12 rounded-[14px] bg-brand-hover px-5 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy
            ? "Saving…"
            : enabled
              ? "Turn off notifications"
              : "Enable notifications"}
        </button>
      )}
      {message && (
        <p className="mt-4 text-sm text-[#276154]" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 text-sm text-brand-hover" role="alert">
          {error}
        </p>
      )}
      <p className="mt-5 text-xs leading-5 text-[#526568]">
        This setting applies to this browser. Mobile app notifications are
        managed separately on each phone.
      </p>
    </section>
  );
}
