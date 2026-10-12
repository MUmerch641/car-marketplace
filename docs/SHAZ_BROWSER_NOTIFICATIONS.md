# Shaz browser notifications

The website uses the same Shaz Supabase notification outbox as the mobile app: `rjhsgtpkifmfunemvezw`. Customer, inspector and admin accounts can open `/notifications` from the bell/account navigation to enable or disable updates in this browser.

Permission is requested on an explicit Enable tap. Browser push requires a supported browser and HTTPS (localhost is also permitted). On iPhone/iPad, open the website from its Home Screen installation where browser push is supported. Mobile-app notification permission is separate.

## Server configuration

No new private Vercel environment variable is required. Existing Supabase URL/publishable-key settings must point to Shaz. The authenticated `/api/notifications/push` route gets the public VAPID key from Supabase and calls owner-scoped subscription RPCs. POST and DELETE verify the same-origin header.

`/shaz-push-sw.js` handles encrypted push notifications and notification clicks, with paths restricted to Shaz account sections. It refreshes open website data when updates arrive and does not cache private pages. `/manifest.webmanifest` supports installation.

Subscription ownership is tied to the signed-in user. Sign-out unregisters the server subscription; account switching also unsubscribes the old browser endpoint. Network failure during sign-out can delay server cleanup. Browser notifications contain generic update text, and booking/job destinations require access checks.

## Shared backend

The `shaz-push` Edge Function and minute-based dispatcher are deployed to the Shaz project. They cover customer quote, visit, payment/refund and inspection updates, inspector assignment updates and admin request/payment alerts. Delivery retries and expired-token cleanup are handled centrally.

Canonical migrations, worker source and credential instructions are maintained in the [mobile repository's Shaz push guide](https://github.com/MUmerch641/feng-xing-cars/blob/main/docs/SHAZ_PUSH_SETUP.md). Never copy the private VAPID key or Supabase service key into website code or `NEXT_PUBLIC_*` variables.

The public privacy policy includes browser subscription data and notification providers. Compilation has been performed; actual browser delivery requires a signed-in user to enable a subscription and has not been tested by sending a notification during setup.
