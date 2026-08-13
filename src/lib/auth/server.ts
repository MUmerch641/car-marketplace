import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type ProfileRole = Database["public"]["Enums"]["profile_role"];

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: data.claims.sub, email: data.claims.email ?? null };
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("id, full_name, phone, avatar_url, role, staff_status").eq("id", user.id).maybeSingle();
  if (error) throw new Error("Unable to load the current profile.");
  return data;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: ProfileRole) {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== role || (role === "inspector" && profile.staff_status !== "active")) redirect("/dashboard");
  return { user, profile };
}

export function routeForRole(role: ProfileRole) {
  if (role === "admin") return "/admin";
  if (role === "inspector") return "/inspector";
  return "/dashboard";
}
