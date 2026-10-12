"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  enableBrowserPush,
  optedIn,
  pushOwnerKey,
  supportsWebPush,
} from "@/lib/notifications/web-push";
export function WebPushBootstrap({ userId }: { userId: string | null }) {
  const router = useRouter();
  useEffect(() => {
    if (!supportsWebPush()) return;
    let cancelled = false;
    const update = (event: MessageEvent) => {
      if (userId && event.data?.type === "SHAZ_VISIT_UPDATE") router.refresh();
    };
    navigator.serviceWorker.addEventListener("message", update);
    const run = async () => {
      const owner = localStorage.getItem(pushOwnerKey);
      if (owner && owner !== userId) {
        const registration = await navigator.serviceWorker.getRegistration("/");
        await (
          await registration?.pushManager.getSubscription()
        )?.unsubscribe();
        (await registration?.getNotifications())?.forEach((notification) =>
          notification.close(),
        );
        localStorage.removeItem(pushOwnerKey);
      }
      if (
        !cancelled &&
        userId &&
        optedIn(userId) &&
        Notification.permission === "granted"
      )
        await enableBrowserPush(userId, false);
    };
    void run().catch(() => {
      /* Notification settings offer an explicit retry. No permission prompt on page load. */
    });
    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("message", update);
    };
  }, [userId, router]);
  return null;
}
