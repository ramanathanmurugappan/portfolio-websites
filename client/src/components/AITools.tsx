import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ClipboardList, Network } from 'lucide-react';
import SectionHeader from './SectionHeader';
import JDAnalyzer from './JDAnalyzer';
import TechExplorer from './TechExplorer';

const TABS = [
  {
    id:    'jd' as const,
    icon:  <ClipboardList size={13} />,
    label: 'JD Fit Analyzer',
    desc:  'Paste a job description — get a match score, skill gap analysis, and a tailored cover letter opener.',
    image: '/images/ai-jd-analyzer.png',
    imageAlt: 'JD Fit Analyzer preview',
  },
  {
    id:    'tech' as const,
    icon:  <Network size={13} />,
    label: 'StackCraft',
    desc:  'Add any AI tools or frameworks — compare side-by-side, build a complete pipeline from your picks, and discover projects you can ship.',
    image: '/images/ai-stackcraft.png',
    imageAlt: 'StackCraft preview',
  },
] as const;

type TabId = typeof TABS[number]['id'];

export default function AITools() {
  const [activeTab, setActiveTab] = useState<TabId>('jd');
  const active = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="container flex flex-col gap-[40px]">
      <SectionHeader icon={<Cpu size={14} />} eyebrow="AI" title="AI Agents" />

      {/* Tab switcher row */}
      <div className="relative flex flex-col gap-[14px]">
        <div className="flex gap-[6px] p-[4px] rounded-[14px] agent-panel w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-[6px] px-[18px] py-[10px] rounded-[10px] text-[13px] font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'agent-surface text-black dark:text-white shadow-sm dark:shadow-black/40'
                  : 'text-black/40 dark:text-white/35 hover:text-black/70 dark:hover:text-white/60'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <p className="text-[13px] text-black/40 dark:text-white/35 font-semibold">
          {active.desc}
        </p>

        {/* Mobile: logo inline below description */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activeTab + '-mobile'}
            src={active.image}
            alt={active.imageAlt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden rounded-[16px] object-cover"
            style={{ height: 80, width: 80 }}
          />
        </AnimatePresence>

        {/* Desktop: logo absolutely positioned top-right */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activeTab + '-desktop'}
            src={active.image}
            alt={active.imageAlt}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="hidden md:block"
            style={{ height: 140, width: 'auto', position: 'absolute', top: 0, right: 0 }}
          />
        </AnimatePresence>
      </div>

      {activeTab === 'jd'   && <JDAnalyzer   />}
      {activeTab === 'tech' && <TechExplorer />}
    </div>
  );
}
