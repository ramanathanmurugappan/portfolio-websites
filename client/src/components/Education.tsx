/**
 * Education Component - Educational background
 * Features: Degree and institution information
 */

import SectionHeader from './SectionHeader';

export default function Education() {
  return (
    <div className="container flex flex-col gap-[40px]">
      <SectionHeader eyebrow="🎓 Education" title="Academic Background" />

      {/* Education Card */}
      <div className="rounded-[32px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[40px] flex flex-col md:flex-row items-center justify-between gap-[24px] card-hover">
        <div className="flex flex-col gap-[8px]">
          <span className="inline-flex px-[12px] py-[6px] rounded-[10px] bg-white dark:bg-[#0f0f0f] text-[11px] tracking-[0.02em] font-semibold w-fit subtle-border">
            🎓 2018 - 2020
          </span>
          <h3 className="text-[28px] leading-[116%] tracking-[-0.02em] font-semibold">
            M.E. Mechatronics
          </h3>
          <p className="text-[14px] text-black/50 dark:text-white/50 font-semibold">
            Anna University (M.I.T Campus), Chennai
          </p>
        </div>

        {/* Research Experience */}
        <div className="rounded-[24px] bg-white dark:bg-[#0f0f0f] p-[24px] flex flex-col gap-[8px] max-w-[400px] card-hover">
          <span className="text-[11px] tracking-[0.08em] text-[#1e6ef4] uppercase font-semibold">
            🔬 Research Experience
          </span>
          <h4 className="text-[16px] font-semibold">
            Solarillion Foundation (SF)
          </h4>
          <p className="text-[12px] text-black/50 dark:text-white/50 font-semibold">
            Research Assistant + Teaching Assistant (Aug'18 - May'20)
          </p>
          <p className="text-[12px] text-black/60 dark:text-white/60">
            Published 2 papers at IEEE and FICC conferences on ML applications
          </p>
        </div>
      </div>
    </div>
  );
}
