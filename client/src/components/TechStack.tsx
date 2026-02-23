/**
 * TechStack Component - Technology and tools showcase
 * Features: Categorized list layout with icons and descriptions
 */

import SectionHeader from './SectionHeader';
import { techCategories } from '../data/techCategories';

export default function TechStack() {
  return (
    <div className="container flex flex-col gap-[40px]">
      <SectionHeader eyebrow="🛠️ Tech Stack" title="What I Use" />

      {/* Tech Grid - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[40px] gap-y-[36px]">
        {techCategories.map((category) => (
          <div
            key={category.title}
            className="flex flex-col gap-[16px] rounded-[16px] p-[4px] transition-all duration-300 hover:bg-gradient-to-br hover:from-[rgba(30,110,244,0.03)] hover:to-transparent"
          >
            {/* Category Title */}
            <div className="pb-[12px] border-b border-black/[0.06] dark:border-white/[0.06]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold bg-[#1e6ef4]/[0.08] text-[#1e6ef4]">
                {category.emoji} {category.title}
              </span>
            </div>

            {/* Tech Items */}
            <div className="flex flex-col gap-[14px]">
              {category.items.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center gap-[12px] group cursor-default"
                >
                  <div className="w-[40px] h-[40px] rounded-[10px] bg-[#f7f7f7] dark:bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-[#ebebeb] dark:group-hover:bg-[#252525] group-hover:-translate-y-1 group-hover:ring-1 group-hover:ring-[#1e6ef4]/20 subtle-border">
                    {tech.isImage ? (
                      <img 
                        src={tech.icon} 
                        alt={tech.name}
                        className="w-[24px] h-[24px] object-contain"
                      />
                    ) : (
                      <span className="text-[20px]">{tech.icon}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-[1px]">
                    <span className="text-[13px] font-semibold group-hover:text-[#1e6ef4] transition-colors duration-200 text-black dark:text-white">
                      {tech.name}
                    </span>
                    <span className="text-[11px] text-black/35 dark:text-white/35 font-semibold">
                      {tech.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
