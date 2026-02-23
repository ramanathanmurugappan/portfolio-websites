interface SectionHeaderProps {
  eyebrow: string;   // e.g. "🛠️ Tech Stack"
  title: string;     // e.g. "What I Use"
  centered?: boolean;
}

export default function SectionHeader({ eyebrow, title, centered }: SectionHeaderProps) {
  return (
    <div className={`flex flex-col gap-[8px] ${centered ? 'items-center text-center' : ''}`}>
      <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
        {eyebrow}
      </span>
      <h2 className="text-[40px] leading-[116%] tracking-[-0.02em] font-semibold">
        {title}
      </h2>
    </div>
  );
}
