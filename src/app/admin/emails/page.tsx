import { requireRole } from "@/lib/auth/server";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { EmailPreviewClient, type TemplateDefinition } from "./email-preview-client";
import {
  renderBookingConfirmationEmail,
  renderWorkerAssignedServiceEmail,
  renderInspectionScheduledEmail,
  renderInspectorAssignedEmail,
  renderReportReadyEmail,
  renderListingApprovedEmail,
  renderListingRejectedEmail,
} from "@/lib/email/templates";


export default async function AdminEmailsPage() {
  await requireRole("admin");

  const templates: TemplateDefinition[] = [
    {
      id: "booking-confirmation",
      name: "Service Booking Confirmation",
      category: "Customer",
      subject: "Your Booking Confirmation: Full Service & MOT",
      iconName: "Wrench",
      html: renderBookingConfirmationEmail({
        customerName: "Alex Taylor",
        serviceName: "Full Vehicle Service & Mobile Oil Change",
        carDetails: "2021 BMW 3 Series 320d (LD21 XYZ)",
        preferredDate: "24 Aug 2026",
        preferredTime: "10:30 AM",
        address: "74 High Street, Manchester, M4 1HQ",
        bookingId: "sample-booking-id",
      }),
    },
    {
      id: "worker-assigned",
      name: "Service Job Assigned",
      category: "Worker",
      subject: "New Job Assigned: Mobile Service (24 Aug 2026)",
      iconName: "Navigation",
      html: renderWorkerAssignedServiceEmail({
        workerName: "Marcus Vance",
        serviceName: "Full Vehicle Service & Mobile Oil Change",
        vehicle: "2021 BMW 3 Series 320d",
        registration: "LD21 XYZ",
        date: "24 Aug 2026",
        time: "10:30 AM",
        address: "74 High Street, Manchester, M4 1HQ",
        bookingId: "sample-booking-id",
      }),
    },
    {
      id: "inspection-scheduled",
      name: "Vehicle Inspection Scheduled",
      category: "Customer",
      subject: "Inspection Scheduled: 2020 Audi A4 Avant (GJ20 ABC)",
      iconName: "ShieldCheck",
      html: renderInspectionScheduledEmail({
        customerName: "Sarah Jenkins",
        vehicleRegistration: "GJ20 ABC",
        vehicleMakeModel: "2020 Audi A4 Avant 2.0 TDI",
        scheduledDate: "25 Aug 2026 at 14:00",
        address: "12 Park Lane, Leeds, LS1 2TW",
        requestId: "sample-inspection-id",
      }),
    },
    {
      id: "inspector-assigned",
      name: "Inspection Request Assigned",
      category: "Worker",
      subject: "New Inspection Assigned: 2020 Audi A4 (GJ20 ABC)",
      iconName: "ClipboardCheck",
      html: renderInspectorAssignedEmail({
        inspectorName: "Marcus Vance",
        registration: "GJ20 ABC",
        vehicle: "2020 Audi A4 Avant 2.0 TDI",
        sellerName: "David Miller",
        sellerPhone: "07700 900123",
        address: "12 Park Lane, Leeds, LS1 2TW",
        preferredSchedule: "25 Aug 2026 14:00",
        requestId: "sample-inspection-id",
      }),
    },
    {
      id: "report-ready",
      name: "Inspection Report Ready",
      category: "Customer",
      subject: "Your Vehicle Inspection Report is Ready (GJ20 ABC)",
      iconName: "FileCheck2",
      html: renderReportReadyEmail({
        customerName: "Sarah Jenkins",
        vehicleRegistration: "GJ20 ABC",
        vehicleMakeModel: "2020 Audi A4 Avant 2.0 TDI",
        overallResult: "passed_with_advisories",
        summaryPreview:
          "Vehicle is in solid mechanical condition. Engine starts cleanly with no smoke. Minor advisory: Front near-side tyre tread depth is at 2.4mm (replacement advised within 3,000 miles).",
        requestId: "sample-inspection-id",
      }),
    },
    {
      id: "listing-approved",
      name: "Car Listing Approved",
      category: "Seller",
      subject: "Your Listing is Live: 2022 Mercedes-Benz A-Class",
      iconName: "CheckCircle",
      html: renderListingApprovedEmail({
        sellerName: "James Harrison",
        carTitle: "2022 Mercedes-Benz A-Class A200 AMG Line",
        price: "£22,450",
        carId: "sample-car-id",
      }),
    },
    {
      id: "listing-rejected",
      name: "Listing Changes Required",
      category: "Seller",
      subject: "Listing Update Required: 2019 Volkswagen Golf",
      iconName: "AlertOctagon",
      html: renderListingRejectedEmail({
        sellerName: "James Harrison",
        carTitle: "2019 Volkswagen Golf 1.5 TSI Life",
        rejectionReason:
          "The main front exterior photo is blurry and the engine bay photo is missing. Please upload clearer photos and verify the mileage.",
        carId: "sample-car-id",
      }),
    },
  ];

  return (
    <main className="mx-auto max-w-[1440px] p-5 sm:p-8 space-y-6">
      <AdminPageHeader
        eyebrow="Communications & Alerts"
        title="Email Templates"
        description="Inspect and live-test all transactional emails sent across marketplace operations."
      />

      <EmailPreviewClient templates={templates} />
    </main>
  );
}
