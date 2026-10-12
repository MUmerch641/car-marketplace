import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
const deviceCookie = "shaz-push-subscription";
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json(
      { error: "Sign in to manage notifications." },
      { status: 401 },
    );
  const { data, error } = await supabase.rpc("get_shaz_push_configuration");
  if (error)
    return Response.json(
      { error: "Notifications are unavailable. Please try again." },
      { status: 503 },
    );
  return Response.json(data ?? { publicKey: null }, {
    headers: { "Cache-Control": "no-store" },
  });
}
function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 10000)
    return Response.json({ error: "Invalid subscription." }, { status: 413 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json(
      { error: "Sign in to manage notifications." },
      { status: 401 },
    );
  const sub = await request.json().catch(() => null);
  if (sub?.userId !== user.id)
    return Response.json(
      { error: "Your account changed. Reload and enable notifications again." },
      { status: 409 },
    );
  if (
    typeof sub?.endpoint !== "string" ||
    typeof sub?.keys?.p256dh !== "string" ||
    typeof sub?.keys?.auth !== "string"
  )
    return Response.json({ error: "Invalid subscription." }, { status: 400 });
  const { data, error } = await supabase.rpc("register_web_push_subscription", {
    p_endpoint: sub.endpoint,
    p_p256dh: sub.keys.p256dh,
    p_auth: sub.keys.auth,
  });
  if (error || !data)
    return Response.json(
      { error: "Your notifications could not be enabled. Please try again." },
      { status: 503 },
    );
  (await cookies()).set(deviceCookie, data, {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 86400,
  });
  return Response.json({ enabled: true });
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json(
      { error: "Sign in to manage notifications." },
      { status: 401 },
    );
  const jar = await cookies();
  const id = jar.get(deviceCookie)?.value;
  if (id) {
    const { error } = await supabase.rpc("unregister_web_push_subscription", {
      p_subscription_id: id,
    });
    if (error)
      return Response.json(
        { error: "Could not update your notifications." },
        { status: 503 },
      );
  }
  jar.delete(deviceCookie);
  return Response.json({ enabled: false });
}
