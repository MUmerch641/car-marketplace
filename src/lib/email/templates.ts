import { getBaseUrl } from "./resend";

export function emailLayout(content: string, title?: string): string {
  const baseUrl = getBaseUrl();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "Fengxing Notification"}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background-color: #0b1f33;
      padding: 28px 32px;
      text-align: left;
      border-bottom: 2px solid #d92d20;
    }
    .logo-text {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      text-decoration: none;
    }
    .logo-accent {
      color: #d92d20;
    }
    .content {
      padding: 32px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #0b1f33;
      margin: 0 0 12px 0;
      line-height: 1.3;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 20px 0;
    }
    .details-box {
      background-color: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      padding: 20px;
      margin: 24px 0;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .details-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .details-label {
      color: #64748b;
      font-weight: 500;
    }
    .details-value {
      color: #0b1f33;
      font-weight: 600;
      text-align: right;
    }
    .btn {
      display: inline-block;
      background-color: #d92d20;
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 10px;
      margin-top: 10px;
      text-align: center;
    }
    .btn-dark {
      background-color: #0b1f33;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-green {
      background-color: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .badge-amber {
      background-color: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .badge-red {
      background-color: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }
    .reg-plate {
      display: inline-block;
      background-color: #facc15;
      color: #000000;
      font-family: monospace;
      font-weight: 800;
      font-size: 13px;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #ca8a04;
      margin-bottom: 8px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 13px;
      color: #94a3b8;
    }
    .footer a {
      color: #64748b;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <a href="${baseUrl}" class="logo-text">FENGXING<span class="logo-accent">.</span></a>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p style="margin:0 0 6px 0;">Fengxing — Automotive Marketplace, Mobile Servicing & Vehicle Inspections</p>
      <p style="margin:0;"><a href="${baseUrl}">Visit Marketplace</a> · <a href="${baseUrl}/dashboard">My Account</a> · <a href="${baseUrl}/contact">Support</a></p>
    </div>
  </div>
</body>
</html>`;
}

// 1. Service Booking Confirmation (To Customer)
export function renderBookingConfirmationEmail(params: {
  customerName: string;
  serviceName: string;
  carDetails: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  bookingId: string;
}): string {
  const baseUrl = getBaseUrl();
  const content = `
    <h1>Booking Confirmed! 🔧</h1>
    <p>Hi ${params.customerName || "there"},</p>
    <p>We’ve received your mobile service appointment request. Our operations team is allocating a technician to your area.</p>
    
    <div class="details-box">
      <div class="details-row">
        <span class="details-label">Service</span>
        <span class="details-value">${params.serviceName}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Vehicle</span>
        <span class="details-value">${params.carDetails}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Preferred Date</span>
        <span class="details-value">${params.preferredDate}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Preferred Time</span>
        <span class="details-value">${params.preferredTime}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Location</span>
        <span class="details-value">${params.address}</span>
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${baseUrl}/dashboard/bookings/${params.bookingId}" class="btn">View Booking Details</a>
    </div>
  `;
  return emailLayout(content, "Mobile Service Booking Confirmation");
}

// 2. Service Worker Assignment (To Inspector / Worker)
export function renderWorkerAssignedServiceEmail(params: {
  workerName: string;
  serviceName: string;
  vehicle: string;
  registration?: string;
  date: string;
  time: string;
  address: string;
  bookingId: string;
}): string {
  const baseUrl = getBaseUrl();
  const content = `
    <h1>New Service Job Assigned 📍</h1>
    <p>Hi ${params.workerName},</p>
    <p>You have been assigned a new mobile car care job. Please review the customer location and appointment schedule below:</p>

    <div class="details-box">
      ${params.registration ? `<div style="margin-bottom:8px;"><span class="reg-plate">${params.registration}</span></div>` : ""}
      <div class="details-row">
        <span class="details-label">Service Type</span>
        <span class="details-value">${params.serviceName}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Vehicle</span>
        <span class="details-value">${params.vehicle}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Scheduled Date</span>
        <span class="details-value">${params.date}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Scheduled Time</span>
        <span class="details-value">${params.time}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Service Address</span>
        <span class="details-value">${params.address}</span>
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${baseUrl}/inspector" class="btn btn-dark">Open Field Workspace</a>
    </div>
  `;
  return emailLayout(content, "New Mobile Service Job Assigned");
}

// 3. Inspection Scheduled (To Customer)
export function renderInspectionScheduledEmail(params: {
  customerName: string;
  vehicleRegistration: string;
  vehicleMakeModel: string;
  scheduledDate: string;
  address: string;
  requestId: string;
}): string {
  const baseUrl = getBaseUrl();
  const content = `
    <h1>Vehicle Inspection Scheduled 🚗</h1>
    <p>Hi ${params.customerName || "there"},</p>
    <p>Your vehicle verification visit has been confirmed and scheduled with an official Fengxing inspector.</p>

    <div class="details-box">
      <div style="margin-bottom:8px;"><span class="reg-plate">${params.vehicleRegistration}</span></div>
      <div class="details-row">
        <span class="details-label">Vehicle</span>
        <span class="details-value">${params.vehicleMakeModel}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Appointment Time</span>
        <span class="details-value">${params.scheduledDate}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Inspection Location</span>
        <span class="details-value">${params.address}</span>
      </div>
    </div>

    <p style="font-size:14px; color:#64748b;">Our inspector will verify the vehicle identification, mechanical components, bodywork, and take high-resolution evidence photos.</p>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${baseUrl}/dashboard/verifications/${params.requestId}" class="btn">View Inspection Timeline</a>
    </div>
  `;
  return emailLayout(content, "Vehicle Inspection Scheduled");
}

// 4. Inspection Job Assigned (To Inspector)
export function renderInspectorAssignedEmail(params: {
  inspectorName: string;
  registration: string;
  vehicle: string;
  sellerName: string;
  sellerPhone: string;
  address: string;
  preferredSchedule: string;
  requestId: string;
}): string {
  const baseUrl = getBaseUrl();
  const content = `
    <h1>New Vehicle Inspection Assigned 📋</h1>
    <p>Hi ${params.inspectorName},</p>
    <p>You have been allocated a vehicle inspection request. Details are below:</p>

    <div class="details-box">
      <div style="margin-bottom:8px;"><span class="reg-plate">${params.registration}</span></div>
      <div class="details-row">
        <span class="details-label">Vehicle</span>
        <span class="details-value">${params.vehicle}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Contact Person</span>
        <span class="details-value">${params.sellerName} (${params.sellerPhone})</span>
      </div>
      <div class="details-row">
        <span class="details-label">Location</span>
        <span class="details-value">${params.address}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Requested Time</span>
        <span class="details-value">${params.preferredSchedule}</span>
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${baseUrl}/inspector" class="btn btn-dark">Open Field Workspace</a>
    </div>
  `;
  return emailLayout(content, "New Inspection Request Assigned");
}

// 5. Inspection Report Ready (To Customer)
export function renderReportReadyEmail(params: {
  customerName: string;
  vehicleRegistration: string;
  vehicleMakeModel: string;
  overallResult: string;
  summaryPreview?: string;
  requestId: string;
}): string {
  const baseUrl = getBaseUrl();
  let badgeClass = "badge-amber";
  let badgeLabel = params.overallResult ? params.overallResult.replace(/_/g, " ").toUpperCase() : "COMPLETED";

  if (params.overallResult === "passed") {
    badgeClass = "badge-green";
  } else if (params.overallResult === "attention_required" || params.overallResult === "not_suitable") {
    badgeClass = "badge-red";
  }

  const content = `
    <h1>Your Inspection Report is Ready! 📄</h1>
    <p>Hi ${params.customerName || "there"},</p>
    <p>The comprehensive multi-point vehicle inspection has been completed and verified by our engineering team.</p>

    <div class="details-box">
      <div style="margin-bottom:8px;"><span class="reg-plate">${params.vehicleRegistration}</span></div>
      <div class="details-row">
        <span class="details-label">Vehicle</span>
        <span class="details-value">${params.vehicleMakeModel}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Overall Result</span>
        <span class="details-value"><span class="badge ${badgeClass}">${badgeLabel}</span></span>
      </div>
      ${
        params.summaryPreview
          ? `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
          <span class="details-label" style="display:block; margin-bottom:4px;">Executive Summary</span>
          <p style="margin:0; font-size:13px; color:#334155; font-style: italic;">"${params.summaryPreview}"</p>
        </div>
      `
          : ""
      }
    </div>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${baseUrl}/dashboard/verifications/${params.requestId}/report" class="btn">View Full Inspection Report</a>
    </div>
  `;
  return emailLayout(content, "Your Fengxing Inspection Report is Ready");
}

// 6. Car Listing Approved (To Seller)
export function renderListingApprovedEmail(params: {
  sellerName: string;
  carTitle: string;
  price: string;
  carId: string;
}): string {
  const baseUrl = getBaseUrl();
  const content = `
    <h1>Your Listing is Now Live! 🎉</h1>
    <p>Hi ${params.sellerName || "there"},</p>
    <p>Great news! Your car listing has been reviewed and approved by our moderation team. It is now live and searchable on the Fengxing marketplace.</p>

    <div class="details-box">
      <div class="details-row">
        <span class="details-label">Listing</span>
        <span class="details-value">${params.carTitle}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Asking Price</span>
        <span class="details-value">${params.price}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Status</span>
        <span class="details-value"><span class="badge badge-green">LIVE</span></span>
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${baseUrl}/cars/${params.carId}" class="btn">View Your Live Listing</a>
    </div>
  `;
  return emailLayout(content, "Your Car Listing is Now Live on Fengxing");
}

// 7. Car Listing Rejected / Changes Requested (To Seller)
export function renderListingRejectedEmail(params: {
  sellerName: string;
  carTitle: string;
  rejectionReason: string;
  carId: string;
}): string {
  const baseUrl = getBaseUrl();
  const content = `
    <h1>Action Required: Car Listing Update ⚠️</h1>
    <p>Hi ${params.sellerName || "there"},</p>
    <p>Our moderation team reviewed your vehicle listing and noticed a few details that need your attention before it can go live.</p>

    <div class="details-box">
      <div class="details-row">
        <span class="details-label">Listing</span>
        <span class="details-value">${params.carTitle}</span>
      </div>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
        <span class="details-label" style="display:block; margin-bottom:6px; color:#b91c1c; font-weight:700;">Moderator Feedback:</span>
        <div style="background-color:#fff1f2; border:1px solid #fecdd3; border-radius:8px; padding:12px; color:#881337; font-size:14px;">
          ${params.rejectionReason || "Please review vehicle photos and specifications."}
        </div>
      </div>
    </div>

    <p>You can update your listing details and photos at any time to resubmit it for review.</p>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${baseUrl}/dashboard/cars/${params.carId}/edit" class="btn">Edit & Resubmit Listing</a>
    </div>
  `;
  return emailLayout(content, "Action Required on Your Car Listing");
}
