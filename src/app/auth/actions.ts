"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { routeForRole } from "@/lib/auth/server";

export type AuthFormState = { error?: string; success?: string };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ukPhonePattern = /^(?:\+44\s?|0)(?:\d\s?){9,10}$/;

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function registerAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const fullName = field(formData, "fullName");
  const email = field(formData, "email").toLowerCase();
  const phone = field(formData, "phone");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (fullName.length < 2 || fullName.length > 120) return { error: "Enter your full name." };
  if (!emailPattern.test(email)) return { error: "Enter a valid email address." };
  if (!ukPhonePattern.test(phone)) return { error: "Enter a valid UK phone number." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone }, emailRedirectTo: origin ? `${origin}/auth/callback?next=/dashboard` : undefined },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/dashboard");
  return { success: "Check your email to confirm your account before logging in." };
}

export async function loginAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = field(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!emailPattern.test(email) || !password) return { error: "Enter your email address and password." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Invalid email or password. Please try again." };
  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { error: "We could not load your account. Please try again." };
  }
  const next = String(formData.get("next") ?? "");
  redirect((next.startsWith("/cars/") || next.startsWith("/services/") || next.startsWith("/verification")) && !next.startsWith("//") ? next : routeForRole(profile.role));
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
