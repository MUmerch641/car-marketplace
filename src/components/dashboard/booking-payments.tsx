"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { ShazGuide } from "@/components/shaz/guide";
import { createClient } from "@/lib/supabase/client";

type PaymentPhase = "parts" | "labour" | "full";

type PaymentRecord = {
  phase: PaymentPhase;
  amount_minor: number;
  status: string;
  refunded_amount_minor: number;
  paid_at: string | null;
};

type PaymentSummary = {
  bookingStatus: string;
  quote: {
    parts_amount_minor: number;
    labour_amount_minor: number;
    currency: string;
    payment_mode: "full" | "split";
  } | null;
  payments: PaymentRecord[];
};

type PendingPayment = {
  phase: PaymentPhase;
  amountMinor: number;
  clientSecret: string;
};

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey?.startsWith("pk_")
  ? loadStripe(publishableKey)
  : null;

const paymentLabels: Record<string, string> = {
  succeeded: "Paid",
  processing: "Confirming payment…",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
  canceled: "Cancelled — contact Shaz",
  requires_capture: "Awaiting confirmation",
};

function money(amountMinor: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amountMinor / 100);
}

async function invokePaymentFunction<T>(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, string>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(
    "shaz-booking-payment",
    { body },
  );
  if (error) {
    const context = "context" in error ? error.context : null;
    if (context instanceof Response) {
      const payload = (await context.json().catch(() => null)) as {
        message?: unknown;
      } | null;
      if (typeof payload?.message === "string")
        throw new Error(payload.message);
    }
    throw new Error(
      "Payments are unavailable right now. Please try again later.",
    );
  }
  if (!data)
    throw new Error("We could not load payment details. Please try again.");
  return data as T;
}

export default function BookingPayments({ bookingId }: { bookingId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState<PaymentPhase | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(
    null,
  );
  const [checking, setChecking] = useState<PaymentPhase | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const refreshLock = useRef(false);

  const refresh = useCallback(() => {
    if (refreshLock.current) return Promise.resolve();
    refreshLock.current = true;
    return invokePaymentFunction<PaymentSummary>(supabase, {
      action: "status",
      bookingId,
    })
      .then((next) => {
        setSummary(next);
        setLoadFailed(false);
        if (
          checking &&
          next.payments.some(
            (payment) => payment.phase === checking && payment.paid_at,
          )
        ) {
          setChecking(null);
          setMessage("Payment confirmed. Thank you.");
        }
      })
      .catch(() => setLoadFailed(true))
      .finally(() => {
        setLoading(false);
        refreshLock.current = false;
      });
  }, [bookingId, checking, supabase]);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(
      () => void refresh(),
      checking ? 5000 : 30000,
    );
    return () => window.clearInterval(interval);
  }, [checking, refresh]);

  useEffect(() => {
    if (!checking) return;
    const timeout = window.setTimeout(() => {
      setChecking(null);
      setMessage(
        "Your payment is still being confirmed. Refresh this page before trying again.",
      );
    }, 60000);
    return () => window.clearTimeout(timeout);
  }, [checking]);

  async function startPayment(phase: PaymentPhase) {
    if (busy || checking || pendingPayment) return;
    setBusy(phase);
    setMessage(null);
    try {
      const result = await invokePaymentFunction<{
        clientSecret: string | null;
        status: string;
      }>(supabase, {
        action: "pay",
        bookingId,
        phase,
      });
      if (!result.clientSecret) {
        setMessage(
          "This payment is no longer due. Refreshing your booking details now.",
        );
        await refresh();
        return;
      }
      const amountMinor =
        phase === "full"
          ? (summary?.quote?.parts_amount_minor ?? 0) +
            (summary?.quote?.labour_amount_minor ?? 0)
          : phase === "parts"
            ? (summary?.quote?.parts_amount_minor ?? 0)
            : (summary?.quote?.labour_amount_minor ?? 0);
      setPendingPayment({
        phase,
        amountMinor,
        clientSecret: result.clientSecret,
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start the payment. Please try again.",
      );
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  function paymentSubmitted(phase: PaymentPhase) {
    setPendingPayment(null);
    setChecking(phase);
    setMessage("Payment submitted. Confirming with Stripe…");
    void refresh();
  }

  const quote = summary?.quote;
  const full = quote?.payment_mode !== "split";
  const fullPayment = summary?.payments.find((p) => p.phase === "full");
  return (
    <section
      className="mt-7 rounded-3xl border border-[#E4E7E3] bg-white p-5 shadow-sm sm:p-7"
      aria-labelledby="booking-payment-title"
    >
      <h2
        id="booking-payment-title"
        className="text-xl font-bold text-[#082A30]"
      >
        {full ? "Your quote & payment" : "Your previous split-payment quote"}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {full
          ? fullPayment?.status === "refunded"
            ? "Your payment has been refunded."
            : fullPayment?.status === "partially_refunded"
              ? "Your payment has been partly refunded."
              : fullPayment?.paid_at
                ? "Paid in full. No further service payment is due."
                : "Pay the full confirmed amount before your visit."
          : "This booking keeps its original parts-first payment arrangement."}
      </p>

      {loading && !summary ? (
        <p className="mt-5 text-sm text-slate-500">Loading payment details…</p>
      ) : null}
      {loadFailed ? (
        <div
          className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
          role="status"
        >
          <p>Payment details are temporarily unavailable.</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-2 font-bold underline underline-offset-2"
          >
            Refresh payment details
          </button>
        </div>
      ) : null}
      {summary && !quote ? (
        <p className="mt-5 rounded-xl bg-[#F7F4EF] p-4 text-sm leading-6 text-slate-600">
          {["cancelled", "completed"].includes(summary.bookingStatus)
            ? "No online payment quote is available for this booking."
            : "Shaz will confirm your full quote here before payment is due."}
        </p>
      ) : null}

      {summary && quote ? (
        <div className="mt-6 rounded-xl border border-[#E4E7E3] p-4 sm:p-5">
          <p className="text-lg font-bold text-[#082A30]">
            Confirmed total{" "}
            {money(quote.parts_amount_minor + quote.labour_amount_minor)}
          </p>
          <div className="mt-4 divide-y divide-[#E4E7E3] border-y border-[#E4E7E3]">
            {full ? (
              <div className="space-y-2 py-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Parts</span>
                  <span>{money(quote.parts_amount_minor)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service</span>
                  <span>{money(quote.labour_amount_minor)}</span>
                </div>
              </div>
            ) : null}
            {(full
              ? ["full" as const]
              : ["parts" as const, "labour" as const]
            ).map((phase) => {
              const amount =
                phase === "full"
                  ? quote.parts_amount_minor + quote.labour_amount_minor
                  : phase === "parts"
                    ? quote.parts_amount_minor
                    : quote.labour_amount_minor;
              const payment = summary.payments.find(
                (item) => item.phase === phase,
              );
              const partsPayment = summary.payments.find(
                (item) => item.phase === "parts",
              );
              const partsPaid =
                !!partsPayment?.paid_at && partsPayment.status !== "refunded";
              const due =
                phase === "full" || phase === "parts"
                  ? [
                      "confirmed",
                      "assigned",
                      "on_the_way",
                      "in_progress",
                      "completed",
                    ].includes(summary.bookingStatus)
                  : summary.bookingStatus === "completed" &&
                    (quote.parts_amount_minor === 0 || partsPaid);
              const retryable =
                !payment ||
                [
                  "requires_payment_method",
                  "requires_confirmation",
                  "requires_action",
                  "creating",
                ].includes(payment.status);
              const paid = !!payment?.paid_at;
              const caption =
                amount === 0
                  ? "No charge"
                  : (paymentLabels[payment?.status ?? ""] ??
                    (summary.bookingStatus === "cancelled"
                      ? "Booking cancelled"
                      : paid
                        ? "Paid"
                        : due
                          ? "Ready to pay"
                          : phase === "full" || phase === "parts"
                            ? "Awaiting booking confirmation"
                            : summary.bookingStatus === "completed"
                              ? "Parts payment must be settled first"
                              : "Due after service completion"));
              const activePayment =
                pendingPayment?.phase === phase ? pendingPayment : null;

              return (
                <div key={phase} className="py-4 first:pt-4 last:pb-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-[#082A30]">
                      {phase === "full"
                        ? "Full advance payment"
                        : phase === "parts"
                          ? "1 · Parts"
                          : "2 · Service"}
                    </h3>
                    <span className="font-semibold tabular-nums text-[#082A30]">
                      {money(amount)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{caption}</p>
                  {payment?.refunded_amount_minor ? (
                    <p className="mt-1 text-sm text-slate-500">
                      {money(payment.refunded_amount_minor)} refunded
                    </p>
                  ) : null}

                  {amount > 0 &&
                  due &&
                  retryable &&
                  !paid &&
                  !checking &&
                  !activePayment ? (
                    <button
                      type="button"
                      disabled={busy !== null || !stripePromise || loadFailed}
                      onClick={() => void startPayment(phase)}
                      className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-hover px-5 py-3 text-sm font-bold text-white transition hover:bg-[#AC302A] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busy === phase
                        ? "Opening secure payment…"
                        : `Pay ${phase === "full" ? "full amount" : phase === "parts" ? "for parts" : "for service"} · ${money(amount)}`}
                    </button>
                  ) : null}

                  {activePayment && stripePromise ? (
                    <div className="mt-4 rounded-xl bg-[#F7F4EF] p-4 sm:p-5">
                      <Elements
                        key={activePayment.clientSecret}
                        stripe={stripePromise}
                        options={{
                          clientSecret: activePayment.clientSecret,
                          appearance: {
                            theme: "stripe",
                            variables: {
                              colorPrimary: "#C73830",
                              colorText: "#082A30",
                              colorBackground: "#FFFFFF",
                              borderRadius: "14px",
                            },
                          },
                        }}
                      >
                        <PaymentConfirmationForm
                          bookingId={bookingId}
                          amountMinor={activePayment.amountMinor}
                          onSubmitted={() => paymentSubmitted(phase)}
                          onCancel={() => setPendingPayment(null)}
                        />
                      </Elements>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Card payments are securely processed by Stripe.
          </p>
        </div>
      ) : null}

      {!stripePromise ? (
        <p className="mt-4 text-sm text-slate-500">
          Online card payments are unavailable right now. Please contact Shaz
          for help.
        </p>
      ) : null}
      {fullPayment?.status === "succeeded" && (
        <ShazGuide className="mt-5" title="Paid in full" mood="success">
          Your full payment is confirmed. No further service payment is due for
          this quote.
        </ShazGuide>
      )}
      {message ? (
        <p className="mt-4 text-sm leading-6 text-[#082A30]" aria-live="polite">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function PaymentConfirmationForm({
  bookingId,
  amountMinor,
  onSubmitted,
  onCancel,
}: {
  bookingId: string;
  amountMinor: number;
  onSubmitted: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements || submitting) return;
    setSubmitting(true);
    setErrorMessage(null);

    const { error: validationError } = await elements.submit();
    if (validationError) {
      setErrorMessage(
        validationError.message ?? "Check your payment details and try again.",
      );
      setSubmitting(false);
      return;
    }

    const returnUrl = `${window.location.origin}/dashboard/bookings/${encodeURIComponent(bookingId)}?payment=returned`;
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(
        error.message ??
          "We could not complete this payment. Please try again.",
      );
      setSubmitting(false);
      return;
    }

    if (
      paymentIntent?.status === "succeeded" ||
      paymentIntent?.status === "processing"
    ) {
      onSubmitted();
      return;
    }

    setErrorMessage(
      "Stripe has not confirmed this payment yet. Please refresh your booking before trying again.",
    );
    setSubmitting(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement options={{ layout: "accordion" }} />
      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!stripe || !elements || submitting}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-hover px-5 py-3 text-sm font-bold text-white transition hover:bg-[#AC302A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Processing…" : `Pay securely · ${money(amountMinor)}`}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onCancel}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#B8C5BE] px-5 py-3 text-sm font-semibold text-[#344054] disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
