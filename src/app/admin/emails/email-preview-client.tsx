"use client";

import { useState } from "react";
import {
  Mail,
  Smartphone,
  Monitor,
  Send,
  CheckCircle2,
  AlertCircle,
  Wrench,
  CarFront,
  ShieldCheck,
  User,
  ClipboardCheck,
  Navigation,
  FileCheck2,
  CheckCircle,
  AlertOctagon,
} from "lucide-react";
import { sendTestEmailAction } from "./actions";

export interface TemplateDefinition {
  id: string;
  name: string;
  category: "Customer" | "Worker" | "Seller";
  subject: string;
  iconName: string;
  html: string;
}

export function EmailPreviewClient({
  templates,
}: {
  templates: TemplateDefinition[];
}) {
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id || "");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [testEmail, setTestEmail] = useState<string>("dillnadukhaokisika@gmail.com");
  const [sending, setSending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const currentTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate) return;

    setSending(true);
    setFeedback(null);

    const result = await sendTestEmailAction({
      to: testEmail,
      subject: currentTemplate.subject,
      html: currentTemplate.html,
    });

    setSending(false);
    if (result.error) {
      setFeedback({ type: "error", message: result.error });
    } else {
      setFeedback({ type: "success", message: result.success || "Email sent!" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card & Test Send Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b1f33] text-white">
                <Mail size={16} />
              </span>
              <h2 className="text-xl font-bold text-[#0b1f33]">Transactional Email Studio</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Preview and verify all responsive HTML email templates across Customer, Inspector, and Seller lifecycles.
            </p>
          </div>

          {/* Test Send Form */}
          <form onSubmit={handleSendTest} className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Recipient email address..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition focus:border-[#0b1f33] focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={sending || !testEmail}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#d92d20] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
            >
              <Send size={14} />
              <span>{sending ? "Sending..." : "Send Test"}</span>
            </button>
          </form>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
              feedback.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar Templates + Live Viewport */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left: Template Nav list */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Available Templates</p>
          <div className="space-y-1.5">
            {templates.map((tpl) => {
              const active = tpl.id === selectedId;
              const Icon = 
                tpl.iconName === "Wrench" ? Wrench :
                tpl.iconName === "Navigation" ? Navigation :
                tpl.iconName === "ShieldCheck" ? ShieldCheck :
                tpl.iconName === "ClipboardCheck" ? ClipboardCheck :
                tpl.iconName === "FileCheck2" ? FileCheck2 :
                tpl.iconName === "CheckCircle" ? CheckCircle :
                tpl.iconName === "AlertOctagon" ? AlertOctagon : Mail;
              return (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setSelectedId(tpl.id);
                    setFeedback(null);
                  }}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-[#0b1f33] bg-[#0b1f33] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-xs font-bold">{tpl.name}</p>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                          active
                            ? "bg-white/25 text-white"
                            : tpl.category === "Customer"
                            ? "bg-blue-100 text-blue-800"
                            : tpl.category === "Worker"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {tpl.category}
                      </span>
                    </div>
                    <p
                      className={`mt-0.5 truncate text-[11px] ${
                        active ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {tpl.subject}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Preview Canvas */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-[640px]">
          {/* Viewport Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subject Line</span>
              <p className="truncate text-xs font-bold text-[#0b1f33]">{currentTemplate.subject}</p>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
              <button
                onClick={() => setViewMode("desktop")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  viewMode === "desktop" ? "bg-[#0b1f33] text-white" : "text-slate-600 hover:text-[#0b1f33]"
                }`}
              >
                <Monitor size={13} />
                <span>Desktop (600px)</span>
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  viewMode === "mobile" ? "bg-[#0b1f33] text-white" : "text-slate-600 hover:text-[#0b1f33]"
                }`}
              >
                <Smartphone size={13} />
                <span>Mobile (375px)</span>
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-[#e2e8f0]/40 p-4 sm:p-8 flex justify-center items-start overflow-y-auto">
            <div
              className={`transition-all duration-300 overflow-hidden rounded-2xl shadow-xl border border-slate-300/80 bg-white ${
                viewMode === "mobile" ? "w-[375px] max-w-full" : "w-[620px] max-w-full"
              }`}
            >
              <iframe
                title="Email Preview"
                srcDoc={currentTemplate.html}
                className="w-full h-[620px] border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
