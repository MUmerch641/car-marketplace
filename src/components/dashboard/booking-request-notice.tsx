"use client";
import { useEffect } from "react";
import { ShazGuide } from "@/components/shaz/guide";
export function BookingRequestNotice({
  customerId,
  serviceId,
}: {
  customerId: string;
  serviceId: string;
}) {
  useEffect(() => {
    try {
      localStorage.removeItem(`shaz:booking:${customerId}:${serviceId}`);
    } catch {
      /* Optional draft cleanup. */
    }
  }, [customerId, serviceId]);
  return (
    <ShazGuide title="Your request is with Shaz" mood="success">
      Shaz will confirm the appointment and full quote here. No payment has been
      taken.
    </ShazGuide>
  );
}
