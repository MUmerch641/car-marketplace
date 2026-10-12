import { ShazCompanion, type CompanionMood } from "./companion";
export function ShazGuide({
  title,
  children,
  mood = "guide",
  reactionKey,
  className = "",
}: {
  title: string;
  children?: React.ReactNode;
  mood?: CompanionMood;
  reactionKey?: string | number;
  className?: string;
}) {
  return (
    <aside
      className={`flex items-center gap-4 rounded-2xl border border-[#D7E5DD] bg-[#E3F1EB] p-4 text-ink ${className}`}
    >
      <ShazCompanion mood={mood} reactionKey={reactionKey} />
      <div className="min-w-0">
        <p className="text-sm font-bold">{title}</p>
        {children && (
          <div className="mt-1 text-sm leading-6 text-[#526568]">
            {children}
          </div>
        )}
      </div>
    </aside>
  );
}
