export function supportsWebPush() {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}
const preferenceKey = (userId: string) => `shaz:browser-push:${userId}`;
export const pushOwnerKey = "shaz:browser-push-owner";
export function optedIn(userId: string) {
  try {
    return localStorage.getItem(preferenceKey(userId)) === "enabled";
  } catch {
    return false;
  }
}
export function storeOptIn(userId: string, enabled: boolean) {
  try {
    localStorage.setItem(
      preferenceKey(userId),
      enabled ? "enabled" : "disabled",
    );
  } catch {
    /* Optional preference. */
  }
}
export async function pushRegistration() {
  return navigator.serviceWorker.register("/shaz-push-sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
}
async function api(method: string, body?: unknown) {
  const response = await fetch("/api/notifications/push", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.error ??
        "Notification settings could not be saved. Please try again.",
    );
  return data;
}
export async function enableBrowserPush(
  userId: string,
  requestPermission = true,
) {
  if (!supportsWebPush())
    throw new Error(
      "This browser does not support notifications here. On iPhone add Shaz to your Home Screen first.",
    );
  // Permission must be requested directly from the user's tap, before awaiting network work.
  const permission = requestPermission
    ? await Notification.requestPermission()
    : Notification.permission;
  if (permission !== "granted")
    throw new Error(
      "Notifications are blocked. You can allow them in your browser settings.",
    );
  const config = await api("GET");
  if (!config.publicKey)
    throw new Error(
      "Notifications are not available yet. Please try again later.",
    );
  const registration = await pushRegistration();
  await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  const owner = localStorage.getItem(pushOwnerKey);
  if (subscription && owner !== userId) {
    await subscription.unsubscribe();
    subscription = null;
  }
  const padding = "=".repeat((4 - (config.publicKey.length % 4)) % 4);
  const raw = atob(
    (config.publicKey + padding).replace(/-/g, "+").replace(/_/g, "/"),
  );
  const key = Uint8Array.from(raw, (c: string) => c.charCodeAt(0));
  if (subscription) {
    const currentKey = subscription.options.applicationServerKey;
    if (
      !currentKey ||
      new Uint8Array(currentKey).some((byte, index) => byte !== key[index]) ||
      currentKey.byteLength !== key.byteLength
    ) {
      await subscription.unsubscribe();
      subscription = null;
    }
  }
  subscription ??= await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key,
  });
  try {
    await api("POST", { ...subscription.toJSON(), userId });
    storeOptIn(userId, true);
    localStorage.setItem(pushOwnerKey, userId);
  } catch (error) {
    await subscription.unsubscribe();
    throw error;
  }
}
export async function disableBrowserPush(userId: string) {
  storeOptIn(userId, false);
  let error: unknown;
  try {
    await api("DELETE");
  } catch (cause) {
    error = cause;
  }
  const registration = await navigator.serviceWorker.getRegistration("/");
  await (await registration?.pushManager.getSubscription())?.unsubscribe();
  (await registration?.getNotifications())?.forEach((notification) =>
    notification.close(),
  );
  localStorage.removeItem(pushOwnerKey);
  if (error)
    throw new Error(
      "Browser notifications are off. The account update could not be saved; retry when connected.",
    );
}
