/**
 * AboutSection Component - Bento-grid style about cards
 * Features: Multi-card layout with intro, location, experience, and focus areas
 */

export default function AboutSection() {
  return (
    <div className="container">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-[16px]">

        {/* Intro Card - Large Left */}
        <div className="md:col-span-6 rounded-[32px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[40px] flex flex-col justify-between min-h-[420px] card-hover">
          <h2 className="text-[32px] leading-[120%] tracking-[-0.02em] font-semibold max-w-[380px]">
            <span className="text-black dark:text-white">Gen AI Architect 🏗️</span>{' '}
            <span className="text-black/35 dark:text-white/35">building robust, end-to-end, enterprise-grade AI products</span>
          </h2>
          <div className="flex justify-center mt-auto">
            <img
              src="/images/avatar-laptop.png"
              alt="Ramanathan working on laptop"
              className="w-[260px] h-auto object-contain img-transition"
            />
          </div>
        </div>

        {/* Right Column - Stacked Cards */}
        <div className="md:col-span-4 flex flex-col gap-[16px]">
          {/* Location Card */}
          <div className="rounded-[32px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[28px] flex-1 card-hover">
            <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
              📍 Based In
            </span>
            <h3 className="text-[22px] leading-[120%] tracking-[-0.02em] font-semibold mt-[8px] text-black dark:text-white">
              Bengaluru, India
            </h3>
          </div>

          {/* Experience Card */}
          <div className="rounded-[32px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[28px] flex-[2] card-hover">
            <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
              💼 Experience Since
            </span>
            <h3 className="text-[22px] leading-[120%] tracking-[-0.02em] font-semibold mt-[8px] text-black dark:text-white">
              December 2019
            </h3>
            {/* Code Snippet */}
            <div className="mt-[16px] bg-white dark:bg-[#0f0f0f] rounded-[16px] p-[16px] overflow-hidden subtle-border">
              <div className="flex items-center gap-[5px] mb-[12px]">
                <div className="w-[8px] h-[8px] rounded-full bg-[#ff5f57]" />
                <div className="w-[8px] h-[8px] rounded-full bg-[#febc2e]" />
                <div className="w-[8px] h-[8px] rounded-full bg-[#28c840]" />
              </div>
              <pre
                className="text-[10px] leading-[160%] text-black/60 dark:text-white/60 overflow-hidden"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
{`from langchain import Agent
from langgraph import Graph

class GenAIArchitect:
  def __init__(self):
    self.name = "Ramanathan"
    self.role = "AI/ML Lead"`}
              </pre>
            </div>
          </div>
        </div>

        {/* Bottom Row - Two Cards */}
        <div className="md:col-span-5 rounded-[32px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[28px] flex flex-col justify-between min-h-[180px] card-hover">
          <span className="inline-flex px-[12px] py-[6px] rounded-[10px] bg-white dark:bg-[#0f0f0f] text-[11px] tracking-[0.02em] font-semibold w-fit subtle-border">
            🛠️ What I Do
          </span>
          <h3 className="text-[22px] leading-[120%] tracking-[-0.02em] font-semibold max-w-[280px] text-black dark:text-white">
            <span className="text-black dark:text-white">Multi-Agent Systems, RAG Pipelines,</span>{' '}
            <span className="text-black/35 dark:text-white/35">and ML Modeling</span>
          </h3>
        </div>

        <div className="md:col-span-5 rounded-[32px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[28px] flex flex-col justify-between min-h-[180px] card-hover relative overflow-hidden">
          <span className="inline-flex px-[12px] py-[6px] rounded-[10px] bg-white dark:bg-[#0f0f0f] text-[11px] tracking-[0.02em] font-semibold w-fit subtle-border">
            🏢 Currently At
          </span>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[13px] text-black/35 dark:text-white/35 font-semibold">AI/ML Lead Research Engineer</span>
            <h3 className="text-[22px] leading-[120%] tracking-[-0.02em] font-semibold text-black dark:text-white">
              ITC Infotech
            </h3>
          </div>
          <div className="absolute bottom-[-10px] right-[-10px]">
            <img
              src="/images/avatar-thinking.png"
              alt="Ramanathan thinking"
              className="w-[110px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
