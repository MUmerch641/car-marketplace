"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

const orderStatuses = ["draft", "sent", "acknowledged", "ready", "collected", "cancelled"] as const;
type OrderStatus = (typeof orderStatuses)[number];

const permittedTransitions: Record<OrderStatus, OrderStatus[]> = {
  draft: ["sent", "cancelled"],
  sent: ["acknowledged", "cancelled"],
  acknowledged: ["ready", "cancelled"],
  ready: ["collected", "cancelled"],
  collected: [],
  cancelled: [],
};

const text = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

function refreshOperations(bookingId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath(`/dashboard/bookings/${bookingId}`);
}

export async function createSupplierOrderAction(form: FormData) {
  await requireRole("admin");

  const bookingId = text(form, "bookingId");
  const supplierId = text(form, "supplierId");
  if (!isUuid(bookingId) || !isUuid(supplierId)) throw new Error("Choose a valid booking and active supplier.");

  const supabase = await createClient();
  const [{ data: booking }, { data: supplier }, { data: existing }] = await Promise.all([
    supabase.from("service_bookings").select("id,status").eq("id", bookingId).maybeSingle(),
    supabase.from("suppliers").select("id,status").eq("id", supplierId).maybeSingle(),
    supabase.from("supplier_orders").select("id").eq("service_booking_id", bookingId).maybeSingle(),
  ]);

  if (!booking || !["confirmed", "assigned"].includes(booking.status)) {
    throw new Error("Confirm the booking before preparing the supplier collection.");
  }
  if (!supplier || supplier.status !== "active") {
    throw new Error("This supplier is not active yet. Confirm the trade account first.");
  }
  if (existing) throw new Error("This booking already has a supplier order.");

  const { error } = await supabase.from("supplier_orders").insert({
    service_booking_id: bookingId,
    supplier_id: supplierId,
    external_reference: text(form, "externalReference") || null,
    order_notes: text(form, "orderNotes") || null,
    status: "draft",
  });
  if (error) throw new Error("Unable to create the supplier collection. Please try again.");

  refreshOperations(bookingId);
}

export async function updateSupplierOrderAction(form: FormData) {
  await requireRole("admin");

  const bookingId = text(form, "bookingId");
  const orderId = text(form, "orderId");
  const nextStatus = text(form, "status") as OrderStatus;
  if (!isUuid(bookingId) || !isUuid(orderId) || !orderStatuses.includes(nextStatus)) {
    throw new Error("The supplier order details are invalid.");
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("supplier_orders")
    .select("id,service_booking_id,status")
    .eq("id", orderId)
    .eq("service_booking_id", bookingId)
    .maybeSingle();

  if (!order || !orderStatuses.includes(order.status as OrderStatus)) {
    throw new Error("Supplier order not found.");
  }

  const currentStatus = order.status as OrderStatus;
  if (nextStatus !== currentStatus && !permittedTransitions[currentStatus].includes(nextStatus)) {
    throw new Error("That supplier order status cannot be changed in this order.");
  }

  const timestamps = nextStatus === currentStatus ? {} : {
    ...(nextStatus === "sent" ? { sent_at: new Date().toISOString() } : {}),
    ...(nextStatus === "ready" ? { ready_at: new Date().toISOString() } : {}),
    ...(nextStatus === "collected" ? { collected_at: new Date().toISOString() } : {}),
  };

  const { error } = await supabase
    .from("supplier_orders")
    .update({
      status: nextStatus,
      external_reference: text(form, "externalReference") || null,
      order_notes: text(form, "orderNotes") || null,
      ...timestamps,
    })
    .eq("id", orderId)
    .eq("service_booking_id", bookingId);
  if (error) throw new Error("Unable to update the supplier order. Please try again.");

  refreshOperations(bookingId);
}
