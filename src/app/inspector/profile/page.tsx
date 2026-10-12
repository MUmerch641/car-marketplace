import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { requireRole } from "@/lib/auth/server";
import { logoutAction } from "@/app/auth/actions";
export default async function InspectorProfilePage() {
  const { user, profile } = await requireRole("inspector");
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/inspector"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#526568]"
      >
        <ArrowLeft size={17} />
        Back to jobs
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">
        Your profile
      </h1>
      <section className="mt-6 rounded-3xl border border-[#E4E7E3] bg-white p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#E3F1EB] text-ink">
            <UserRound size={26} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-ink">
              {profile.full_name || "Shaz inspector"}
            </h2>
            <p className="mt-1 text-sm text-[#526568]">Inspector · Active</p>
          </div>
        </div>
        <dl className="mt-6 space-y-4 border-t border-[#E4E7E3] pt-5">
          <div>
            <dt className="text-xs font-bold text-[#526568]">Email</dt>
            <dd className="mt-1 break-all text-sm text-ink">
              {user.email || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-[#526568]">Phone</dt>
            <dd className="mt-1 text-sm text-ink">
              {profile.phone || "Not provided"}
            </dd>
          </div>
        </dl>
        <p className="mt-6 text-sm leading-6 text-[#526568]">
          Contact the Shaz team if your account details need updating.
        </p>
        <form action={logoutAction}>
          <button className="mt-5 min-h-12 rounded-[14px] border border-[#B8C5BE] px-5 text-sm font-bold text-brand-hover">
            Sign out
          </button>
        </form>
      </section>
    </div>
  );
}
