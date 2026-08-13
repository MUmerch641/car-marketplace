"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";

type State = { error?: string; success?: string };
const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const phone = /^[+\d][\d\s()-]{5,30}$/;

export async function createStaffAction(_: State, form: FormData): Promise<State> {
  await requireRole("admin");
  const fullName = field(form, "fullName"); const email = field(form, "email").toLowerCase(); const mobile = field(form, "phone"); const temporaryPassword = field(form, "temporaryPassword"); const employeeId = field(form, "employeeId") || null; const status = field(form, "status") === "inactive" ? "inactive" : "active";
  if (!fullName || !/^\S+@\S+\.\S+$/.test(email) || !phone.test(mobile) || temporaryPassword.length < 12) return { error: "Enter a name, valid email and phone, and a temporary password of at least 12 characters." };
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({ email, password: temporaryPassword, email_confirm: true, user_metadata: { full_name: fullName, phone: mobile } });
    if (error || !data.user) return { error: error?.message.includes("already") ? "An account already exists for this email." : "Unable to create the staff account." };
    const { error: profileError } = await admin.from("profiles").update({ full_name: fullName, phone: mobile, employee_id: employeeId, role: "inspector", staff_status: status }).eq("id", data.user.id);
    if (profileError) { await admin.auth.admin.deleteUser(data.user.id); return { error: "Unable to finish staff setup. No account was created." }; }
    if (status === "inactive") await admin.auth.admin.updateUserById(data.user.id, { ban_duration: "876000h" });
    revalidatePath("/admin/staff"); revalidatePath("/admin/verifications"); revalidatePath("/admin/bookings");
    return { success: "Staff account created." };
  } catch { return { error: "Staff account management is not configured. Ask the owner to set SUPABASE_SERVICE_ROLE_KEY on the server." }; }
}

export async function setStaffStatusAction(id: string, enable: boolean): Promise<State> {
  await requireRole("admin");
  try { const admin = createAdminClient(); if (!enable) { const { count, error: assignmentError } = await admin.from("employee_assignments").select("id", { count: "exact", head: true }).eq("employee_id", id).in("status", ["assigned", "accepted", "in_progress"]); if (assignmentError || count) return { error: "Reassign active work before disabling this staff account." }; } const { error } = await admin.from("profiles").update({ staff_status: enable ? "active" : "inactive" }).eq("id", id).eq("role", "inspector"); if (error) return { error: "Unable to update staff status." }; const { error: authError } = await admin.auth.admin.updateUserById(id, { ban_duration: enable ? "none" : "876000h" }); if (authError) return { error: "Staff status was not updated." }; revalidatePath("/admin/staff"); revalidatePath("/admin/verifications"); revalidatePath("/admin/bookings"); return { success: "Staff status updated." }; } catch { return { error: "Staff account management is not configured." }; }
}

export async function resetStaffPasswordAction(id: string, form: FormData): Promise<State> { await requireRole("admin"); const temporaryPassword = field(form, "temporaryPassword"); if (temporaryPassword.length < 12) return { error: "Use a temporary password of at least 12 characters." }; try { const admin = createAdminClient(); const { error } = await admin.auth.admin.updateUserById(id, { password: temporaryPassword }); if (error) return { error: "Unable to reset the password." }; return { success: "Password reset." }; } catch { return { error: "Staff account management is not configured." }; } }

export async function updateStaffDetailsAction(id: string, form: FormData): Promise<State> { await requireRole("admin"); const fullName = field(form, "fullName"); const mobile = field(form, "phone"); const employeeId = field(form, "employeeId") || null; if (!fullName || !phone.test(mobile)) return { error: "Enter a full name and valid phone number." }; try { const admin = createAdminClient(); const { error } = await admin.from("profiles").update({ full_name: fullName, phone: mobile, employee_id: employeeId }).eq("id", id).eq("role", "inspector"); if (error) return { error: "Unable to update staff details." }; revalidatePath("/admin/staff"); revalidatePath("/admin/verifications"); revalidatePath("/admin/bookings"); return { success: "Staff details updated." }; } catch { return { error: "Staff account management is not configured." }; } }
