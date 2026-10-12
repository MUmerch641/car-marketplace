export const visitCopy: Record<string, { title: string; copy: string }> = {
  pending: {
    title: "Request received",
    copy: "Shaz will review your visit and confirm the full quote before payment.",
  },
  confirmed: {
    title: "Your visit is confirmed",
    copy: "Pay your confirmed total in advance to get ready for your visit.",
  },
  assigned: {
    title: "Your mechanic is assigned",
    copy: "Your visit details are ready for the Shaz team.",
  },
  on_the_way: {
    title: "Your mechanic is on the way",
    copy: "Please make sure your car is accessible at the agreed location.",
  },
  in_progress: {
    title: "Your service is underway",
    copy: "The Shaz team is taking care of your car.",
  },
  completed: {
    title: "All taken care of",
    copy: "Your visit is complete. Your booking and payment details are kept here.",
  },
  cancelled: {
    title: "Visit cancelled",
    copy: "Check your payment details below or contact Shaz for help with your booking.",
  },
};
export function VisitTimeline({ status }: { status: string }) {
  const index = (
    {
      pending: 0,
      confirmed: 1,
      assigned: 1,
      on_the_way: 2,
      in_progress: 3,
      completed: 4,
    } as Record<string, number>
  )[status];
  if (index === undefined) return null;
  return (
    <ol aria-label="Visit progress" className="grid grid-cols-5 gap-1.5">
      {["Requested", "Confirmed", "On the way", "In progress", "Done"].map(
        (label, i) => (
          <li key={label} aria-current={i === index ? "step" : undefined}>
            <div
              className={`h-1 rounded-full ${i <= index ? "bg-brand" : "bg-[#E4E7E3]"}`}
            />
            <p
              className={`mt-2 text-[10px] font-semibold sm:text-xs ${i === index ? "text-brand-hover" : "text-[#526568]"}`}
            >
              {label}
            </p>
          </li>
        ),
      )}
    </ol>
  );
}
