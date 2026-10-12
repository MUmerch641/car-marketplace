import Link from "next/link";
import {
  requireUser,
  getCurrentProfile,
  routeForRole,
} from "@/lib/auth/server";
import { WebPushSettings } from "@/components/notifications/web-push-settings";
export default async function NotificationsPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <Link
        href={profile ? routeForRole(profile.role) : "/dashboard"}
        className="inline-flex min-h-11 text-sm font-bold text-[#526568]"
      >
        ← Back to your account
      </Link>
      <h1 className="mb-6 mt-3 text-3xl font-extrabold tracking-tight text-ink">
        Stay up to date
      </h1>
      <WebPushSettings userId={user.id} />
    </div>
  );
}
