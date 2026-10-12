/* Push only: no offline cache of accounts, bookings or payment pages. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload;
      try {
        payload = event.data?.json();
      } catch {
        payload = null;
      }
      if (!payload) return;
      const candidate =
        typeof payload.path === "string" ? payload.path : "/notifications";
      const url = new URL(candidate, self.location.origin);
      const path =
        url.origin === self.location.origin &&
        /^\/(dashboard|inspector|admin|notifications)(\/|\?|$)/.test(
          url.pathname + url.search,
        )
          ? url.pathname + url.search
          : "/notifications";
      await self.registration.showNotification(payload.title || "Shaz update", {
        body: payload.body || "Open Shaz to view your update",
        icon: "/shaz/icon.png",
        badge: "/shaz/mark.svg",
        tag: payload.eventId || "shaz-update",
        data: { path },
      });
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      windows.forEach((window) =>
        window.postMessage({ type: "SHAZ_VISIT_UPDATE" }),
      );
    })(),
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const url = new URL(
        event.notification.data?.path || "/notifications",
        self.location.origin,
      );
      if (url.origin !== self.location.origin) return;
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const window of windows) {
        if (new URL(window.url).origin === url.origin && "focus" in window) {
          await window.navigate(url.href);
          return window.focus();
        }
      }
      return self.clients.openWindow(url.href);
    })(),
  );
});
