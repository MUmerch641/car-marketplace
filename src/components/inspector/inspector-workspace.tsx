"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  User,
  Phone,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  ExternalLink,
  Wrench,
  ShieldCheck,
  ArrowRight,
  X,
  Play,
  FileText,
  Truck,
} from "lucide-react";
import { advanceBookingAction } from "@/app/service-actions";
import { startInspection } from "@/app/verification-actions";

export type NormalizedJob = {
  id: string; // unique assignment or booking ID
  jobType: "service" | "inspection";
  jobTypeLabel: string;
  serviceBookingId?: string;
  verificationRequestId?: string;
  title: string; // e.g. "Full Service & Oil Change" or "Buyer Pre-purchase Inspection"
  carMake: string;
  carModel: string;
  carRegistration: string;
  vehicleDisplay: string; // e.g. "BMW 320i"
  scheduledDate: string; // YYYY-MM-DD or formatted
  scheduledTime: string; // e.g. "09:30"
  scheduledTimeRaw: string;
  addressLine: string;
  city: string;
  postcode: string;
  locationDisplay: string; // e.g. "Manchester M1 4BT"
  fullAddress: string;
  customerName: string;
  customerPhone: string;
  status: string; // "assigned" | "confirmed" | "on_the_way" | "in_progress" | "inspection_scheduled" | "inspection_in_progress" | "report_submitted" | "completed" | "cancelled"
  statusLabel: string;
  notes?: string | null;
  assignedAt: string;
  isToday: boolean;
  isUpcoming: boolean;
  isCompleted: boolean;
};

interface InspectorWorkspaceProps {
  jobs: NormalizedJob[];
  workerName: string;
}

export function InspectorWorkspace({ jobs }: InspectorWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"today" | "jobs" | "map" | "history">("today");
  const [filterChip, setFilterChip] = useState<"all" | "service" | "inspection" | "upcoming" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<NormalizedJob | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  // Date check helpers
  const todayJobs = jobs.filter((j) => j.isToday && !j.isCompleted);
  const historyJobs = jobs.filter((j) => j.isCompleted || j.status === "cancelled");

  // Filtering logic for "Jobs" tab
  const filteredJobs = jobs.filter((j) => {
    // Filter chip check
    if (filterChip === "service" && j.jobType !== "service") return false;
    if (filterChip === "inspection" && j.jobType !== "inspection") return false;
    if (filterChip === "upcoming" && !j.isUpcoming) return false;
    if (filterChip === "completed" && !j.isCompleted) return false;

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        j.carRegistration.toLowerCase().includes(q) ||
        j.vehicleDisplay.toLowerCase().includes(q) ||
        j.locationDisplay.toLowerCase().includes(q) ||
        j.customerName.toLowerCase().includes(q) ||
        j.title.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Action Handler for Service Status Progression
  const handleAdvanceServiceStatus = (jobId: string, bookingId: string, nextStatus: "on_the_way" | "in_progress" | "completed") => {
    setActionError(null);
    const loadingToast = toast.loading("Updating job status...");
    startTransition(async () => {
      const res = await advanceBookingAction(bookingId, nextStatus);
      toast.dismiss(loadingToast);
      if (res?.error) {
        setActionError(res.error);
        toast.error(res.error);
      } else {
        toast.success(`Job status updated to ${formatStatusLabel(nextStatus)}!`);
        if (selectedJob && selectedJob.id === jobId) {
          setSelectedJob({
            ...selectedJob,
            status: nextStatus,
            statusLabel: formatStatusLabel(nextStatus),
            isCompleted: nextStatus === "completed",
          });
        }
      }
    });
  };

  // Action Handler for Starting Inspection
  const handleStartInspection = (jobId: string, requestId: string) => {
    setActionError(null);
    const loadingToast = toast.loading("Starting vehicle inspection...");
    startTransition(async () => {
      await startInspection(requestId);
      toast.dismiss(loadingToast);
      toast.success("Inspection started! Complete checklist & evidence.");
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob({
          ...selectedJob,
          status: "inspection_in_progress",
          statusLabel: "In progress",
        });
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Action Error Alert */}
      {actionError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800 sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-600 hover:text-red-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:rounded-2xl sm:px-6">
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab("today")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all sm:px-4 sm:text-sm ${
              activeTab === "today"
                ? "bg-[#0b1f33] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Clock size={16} />
            <span>Today</span>
            {todayJobs.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  activeTab === "today" ? "bg-[#d92d20] text-white" : "bg-slate-200 text-slate-800"
                }`}
              >
                {todayJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all sm:px-4 sm:text-sm ${
              activeTab === "jobs"
                ? "bg-[#0b1f33] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Calendar size={16} />
            <span>Jobs</span>
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                activeTab === "jobs" ? "bg-[#d92d20] text-white" : "bg-slate-200 text-slate-800"
              }`}
            >
              {jobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all sm:px-4 sm:text-sm ${
              activeTab === "map"
                ? "bg-[#0b1f33] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Navigation size={16} />
            <span>Map</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all sm:px-4 sm:text-sm ${
              activeTab === "history"
                ? "bg-[#0b1f33] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 size={16} />
            <span>History</span>
          </button>
        </nav>

        <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 md:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Field operational status: Ready</span>
        </div>
      </div>

      {/* TAB CONTENT 1: TODAY */}
      {activeTab === "today" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base font-bold text-[#0b1f33] sm:text-lg">Today's Schedule</h2>
              <p className="text-xs text-slate-500">Sorted chronologically by scheduled start time.</p>
            </div>
            <span className="rounded-lg bg-slate-200/70 px-2.5 py-1 text-xs font-bold text-slate-700">
              {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
            </span>
          </div>

          {todayJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[#0b1f33]">No jobs assigned for today</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                You have no active mobile services or vehicle inspections scheduled for today. Check the Jobs tab to review upcoming assignments.
              </p>
              <button
                onClick={() => setActiveTab("jobs")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0b1f33] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800"
              >
                <span>View all jobs</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelectJob={setSelectedJob}
                  onAdvanceService={handleAdvanceServiceStatus}
                  onStartInspection={handleStartInspection}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: JOBS */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          {/* Controls Bar: Filter Chips & Search */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search registration, vehicle, location, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none transition-colors focus:border-[#0b1f33] focus:bg-white sm:text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="mr-1 flex items-center gap-1 text-xs font-bold text-slate-500">
                <Filter size={12} /> Filter:
              </span>
              {[
                { id: "all", label: "All Jobs" },
                { id: "service", label: "Service" },
                { id: "inspection", label: "Inspection" },
                { id: "upcoming", label: "Upcoming" },
                { id: "completed", label: "Completed" },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setFilterChip(chip.id as typeof filterChip)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    filterChip === chip.id
                      ? "bg-[#0b1f33] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtered Jobs List */}
          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-bold text-[#0b1f33]">No jobs found matching your filters</p>
              <p className="mt-1 text-xs text-slate-500">Try selecting a different filter chip or clearing your search term.</p>
              <button
                onClick={() => {
                  setFilterChip("all");
                  setSearchQuery("");
                }}
                className="mt-3 text-xs font-bold text-[#d92d20] hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelectJob={setSelectedJob}
                  onAdvanceService={handleAdvanceServiceStatus}
                  onStartInspection={handleStartInspection}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: MAP */}
      {activeTab === "map" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base font-bold text-[#0b1f33] sm:text-lg">Assigned Job Locations</h2>
              <p className="text-xs text-slate-500">Route Overview for Navigation</p>
            </div>
          </div>

          {jobs.filter((j) => !j.isCompleted).length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <MapPin size={24} className="mx-auto text-slate-400" />
              <p className="mt-2 text-sm font-bold text-[#0b1f33]">No active locations to display</p>
              <p className="text-xs text-slate-500">All assigned jobs are completed or no jobs assigned.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs
                .filter((j) => !j.isCompleted)
                .map((job, idx) => {
                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.fullAddress)}`;
                  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(job.fullAddress)}`;

                  return (
                    <div
                      key={job.id}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0b1f33] text-xs font-bold text-white">
                            {idx + 1}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                            {job.scheduledTime}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                              job.jobType === "service"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-blue-100 text-blue-900"
                            }`}
                          >
                            {job.jobTypeLabel}
                          </span>
                          <h3 className="mt-1 text-sm font-bold text-[#0b1f33]">{job.vehicleDisplay}</h3>
                          <p className="font-mono text-xs font-extrabold text-[#d92d20]">{job.carRegistration}</p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                          <p className="font-semibold text-slate-900">{job.fullAddress}</p>
                          <p className="mt-1 text-[11px] text-slate-500">Contact: {job.customerName}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-[#0b1f33] py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800"
                        >
                          <Navigation size={13} />
                          <span>Google Maps</span>
                          <ExternalLink size={11} className="opacity-70" />
                        </a>
                        <a
                          href={appleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                          title="Open in Apple Maps"
                        >
                          <span>Apple</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base font-bold text-[#0b1f33] sm:text-lg">Completed & Past Jobs</h2>
              <p className="text-xs text-slate-500">History of finished field operations.</p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
              {historyJobs.length} Completed
            </span>
          </div>

          {historyJobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <CheckCircle2 size={24} className="mx-auto text-slate-400" />
              <p className="mt-2 text-sm font-bold text-[#0b1f33]">No completed jobs in history</p>
              <p className="text-xs text-slate-500">Completed services and inspection reports will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelectJob={setSelectedJob}
                  onAdvanceService={handleAdvanceServiceStatus}
                  onStartInspection={handleStartInspection}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* JOB DETAIL SLIDE-OVER MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-3xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                    selectedJob.jobType === "service" ? "bg-amber-100 text-amber-900" : "bg-blue-100 text-blue-900"
                  }`}
                >
                  {selectedJob.jobTypeLabel}
                </span>
                <span className="text-xs font-bold text-slate-500">•</span>
                <StatusBadge status={selectedJob.status} label={selectedJob.statusLabel} />
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Vehicle Title & Reg */}
              <div>
                <h2 className="text-xl font-bold text-[#0b1f33]">{selectedJob.vehicleDisplay}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-md bg-amber-400 px-2 py-0.5 font-mono text-xs font-extrabold text-black">
                    {selectedJob.carRegistration}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{selectedJob.title}</span>
                </div>
              </div>

              {/* Workflow Stepper */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Workflow Status</p>
                <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
                  {selectedJob.jobType === "service" ? (
                    <>
                      <WorkflowStep label="Assigned" active={true} completed={selectedJob.status !== "assigned"} />
                      <WorkflowStep
                        label="On The Way"
                        active={["on_the_way", "in_progress", "completed"].includes(selectedJob.status)}
                        completed={["in_progress", "completed"].includes(selectedJob.status)}
                      />
                      <WorkflowStep
                        label="In Progress"
                        active={["in_progress", "completed"].includes(selectedJob.status)}
                        completed={selectedJob.status === "completed"}
                      />
                      <WorkflowStep label="Completed" active={selectedJob.status === "completed"} completed={selectedJob.status === "completed"} />
                    </>
                  ) : (
                    <>
                      <WorkflowStep label="Assigned" active={true} completed={selectedJob.status !== "assigned" && selectedJob.status !== "inspection_scheduled"} />
                      <WorkflowStep
                        label="In Progress"
                        active={["inspection_in_progress", "report_submitted", "completed"].includes(selectedJob.status)}
                        completed={["report_submitted", "completed"].includes(selectedJob.status)}
                      />
                      <WorkflowStep
                        label="Report Submitted"
                        active={["report_submitted", "completed"].includes(selectedJob.status)}
                        completed={selectedJob.status === "completed"}
                      />
                      <WorkflowStep label="Finalised" active={selectedJob.status === "completed"} completed={selectedJob.status === "completed"} />
                    </>
                  )}
                </div>
              </div>

              {/* Job Info Grid */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                  <span className="flex items-center gap-1 font-bold text-slate-400 uppercase text-[10px]">
                    <Clock size={12} /> Appointment Time
                  </span>
                  <p className="font-bold text-[#0b1f33] text-sm">{selectedJob.scheduledTime}</p>
                  <p className="text-slate-500">{selectedJob.scheduledDate}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                  <span className="flex items-center gap-1 font-bold text-slate-400 uppercase text-[10px]">
                    <User size={12} /> Customer Contact
                  </span>
                  <p className="font-bold text-[#0b1f33] text-sm">{selectedJob.customerName}</p>
                  {selectedJob.customerPhone && (
                    <a href={`tel:${selectedJob.customerPhone}`} className="inline-flex items-center gap-1 text-[#d92d20] hover:underline font-semibold">
                      <Phone size={12} /> {selectedJob.customerPhone}
                    </a>
                  )}
                </div>
              </div>

              {/* Address & Navigation */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs">
                <span className="flex items-center gap-1 font-bold text-slate-400 uppercase text-[10px]">
                  <MapPin size={12} /> Location & Postcode
                </span>
                <p className="font-bold text-[#0b1f33] text-sm">{selectedJob.fullAddress}</p>
                <div className="pt-2 flex gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-[#0b1f33] px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <Navigation size={12} />
                    <span>Navigate (Google Maps)</span>
                  </a>
                </div>
              </div>

              {/* Notes */}
              {selectedJob.notes && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs">
                  <span className="font-bold text-amber-900">Job Notes:</span>
                  <p className="mt-1 text-amber-950 leading-relaxed">{selectedJob.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="border-t border-slate-100 bg-slate-50 p-4 sm:rounded-b-3xl">
              {selectedJob.jobType === "service" && selectedJob.serviceBookingId && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {(selectedJob.status === "assigned" || selectedJob.status === "confirmed") && (
                    <button
                      disabled={isPending}
                      onClick={() => handleAdvanceServiceStatus(selectedJob.id, selectedJob.serviceBookingId!, "on_the_way")}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
                    >
                      <Truck size={14} />
                      <span>Start Journey (On the way)</span>
                    </button>
                  )}

                  {selectedJob.status === "on_the_way" && (
                    <button
                      disabled={isPending}
                      onClick={() => handleAdvanceServiceStatus(selectedJob.id, selectedJob.serviceBookingId!, "in_progress")}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Play size={14} />
                      <span>Arrived / Start Job</span>
                    </button>
                  )}

                  {selectedJob.status === "in_progress" && (
                    <button
                      disabled={isPending}
                      onClick={() => handleAdvanceServiceStatus(selectedJob.id, selectedJob.serviceBookingId!, "completed")}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark Job Completed</span>
                    </button>
                  )}

                  {selectedJob.status === "completed" && (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 size={14} /> Job Completed
                    </span>
                  )}
                </div>
              )}

              {selectedJob.jobType === "inspection" && selectedJob.verificationRequestId && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {(selectedJob.status === "assigned" || selectedJob.status === "inspection_scheduled" || selectedJob.status === "confirmed") && (
                    <button
                      disabled={isPending}
                      onClick={() => handleStartInspection(selectedJob.id, selectedJob.verificationRequestId!)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#d92d20] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      <Play size={14} />
                      <span>Start Inspection</span>
                    </button>
                  )}

                  {selectedJob.status === "inspection_in_progress" && (
                    <Link
                      href={`/inspector/verifications/${selectedJob.verificationRequestId}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0b1f33] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
                    >
                      <FileText size={14} />
                      <span>Continue Inspection / Fill Report</span>
                    </Link>
                  )}

                  {(selectedJob.status === "report_submitted" || selectedJob.status === "completed") && (
                    <Link
                      href={`/inspector/verifications/${selectedJob.verificationRequestId}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
                    >
                      <FileText size={14} />
                      <span>View Inspection Report</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Job Card Component (Compact Field-Service UK UI)
function JobCard({
  job,
  onSelectJob,
  onAdvanceService,
  onStartInspection,
  isPending,
}: {
  job: NormalizedJob;
  onSelectJob: (job: NormalizedJob) => void;
  onAdvanceService: (jobId: string, bookingId: string, nextStatus: "on_the_way" | "in_progress" | "completed") => void;
  onStartInspection: (jobId: string, requestId: string) => void;
  isPending: boolean;
}) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.fullAddress)}`;

  return (
    <div className="group flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center">
      {/* Left Column: Time & Main Details */}
      <div className="flex items-start gap-3 sm:items-center">
        {/* Time Pill */}
        <div className="flex flex-col items-center justify-center rounded-xl bg-[#0b1f33] px-3 py-2 text-white min-w-[64px]">
          <span className="text-xs font-extrabold tracking-tight">{job.scheduledTime}</span>
          <span className="text-[9px] font-semibold text-slate-300 uppercase">{job.isToday ? "Today" : job.scheduledDate.slice(0, 6)}</span>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                job.jobType === "service" ? "bg-amber-100 text-amber-950" : "bg-blue-100 text-blue-950"
              }`}
            >
              {job.jobTypeLabel}
            </span>
            <StatusBadge status={job.status} label={job.statusLabel} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-[#0b1f33] group-hover:text-[#d92d20] transition-colors">{job.vehicleDisplay}</h3>
            {job.carRegistration && (
              <span className="rounded-md bg-amber-300/80 px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-black">
                {job.carRegistration}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <MapPin size={12} className="text-slate-400" />
              {job.locationDisplay}
            </span>
            {job.customerName && (
              <span className="flex items-center gap-1 text-slate-500">
                <User size={12} className="text-slate-400" />
                {job.customerName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 sm:border-t-0 sm:pt-0">
        {/* Quick Action Button based on status */}
        {job.jobType === "service" && job.serviceBookingId && (
          <>
            {(job.status === "assigned" || job.status === "confirmed") && (
              <button
                disabled={isPending}
                onClick={() => onAdvanceService(job.id, job.serviceBookingId!, "on_the_way")}
                className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
              >
                <Truck size={13} />
                <span>Start journey</span>
              </button>
            )}

            {job.status === "on_the_way" && (
              <button
                disabled={isPending}
                onClick={() => onAdvanceService(job.id, job.serviceBookingId!, "in_progress")}
                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <Play size={13} />
                <span>Start job</span>
              </button>
            )}

            {job.status === "in_progress" && (
              <button
                disabled={isPending}
                onClick={() => onAdvanceService(job.id, job.serviceBookingId!, "completed")}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 size={13} />
                <span>Complete</span>
              </button>
            )}
          </>
        )}

        {job.jobType === "inspection" && job.verificationRequestId && (
          <>
            {(job.status === "assigned" || job.status === "inspection_scheduled" || job.status === "confirmed") && (
              <button
                disabled={isPending}
                onClick={() => onStartInspection(job.id, job.verificationRequestId!)}
                className="inline-flex items-center gap-1 rounded-xl bg-[#d92d20] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                <Play size={13} />
                <span>Start inspection</span>
              </button>
            )}

            {job.status === "inspection_in_progress" && (
              <Link
                href={`/inspector/verifications/${job.verificationRequestId}`}
                className="inline-flex items-center gap-1 rounded-xl bg-[#0b1f33] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-800"
              >
                <FileText size={13} />
                <span>Continue</span>
              </Link>
            )}
          </>
        )}

        {/* View Details Button */}
        <button
          onClick={() => onSelectJob(job)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <span>View job</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// Workflow Progress Indicator Component
function WorkflowStep({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
          completed
            ? "bg-emerald-600 text-white"
            : active
            ? "bg-[#0b1f33] text-white"
            : "bg-slate-200 text-slate-400"
        }`}
      >
        {completed ? "✓" : ""}
      </div>
      <span className={`mt-1 ${active ? "text-slate-900 font-bold" : "text-slate-400"}`}>{label}</span>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status, label }: { status: string; label: string }) {
  let colorStyle = "bg-slate-100 text-slate-700 border-slate-200";

  switch (status) {
    case "assigned":
    case "confirmed":
      colorStyle = "bg-blue-50 text-blue-800 border-blue-200";
      break;
    case "on_the_way":
      colorStyle = "bg-amber-50 text-amber-800 border-amber-200";
      break;
    case "in_progress":
    case "inspection_in_progress":
      colorStyle = "bg-purple-50 text-purple-800 border-purple-200";
      break;
    case "report_submitted":
      colorStyle = "bg-teal-50 text-teal-800 border-teal-200";
      break;
    case "completed":
      colorStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
      break;
    case "cancelled":
      colorStyle = "bg-red-50 text-red-800 border-red-200";
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${colorStyle}`}>
      {label}
    </span>
  );
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case "on_the_way":
      return "On the way";
    case "in_progress":
    case "inspection_in_progress":
      return "In progress";
    case "report_submitted":
      return "Report submitted";
    case "completed":
      return "Completed";
    case "inspection_scheduled":
      return "Scheduled";
    default:
      return status.replace(/_/g, " ");
  }
}
