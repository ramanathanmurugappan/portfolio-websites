import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Loader2 } from 'lucide-react';
import { groqJSON, detectInjection, MAX_JD_INPUT } from '../lib/groqUtils';
import type { JDResult } from '../types/ai-tools';
import { JD_SYSTEM_PROMPT } from '../lib/prompts';

// ── Helpers ────────────────────────────────────────────────────────────────────

const scoreColor = (s: number) =>
  s >= 75 ? '#10b981' : s >= 50 ? '#1e6ef4' : '#f59e0b';

const labelColor: Record<string, string> = {
  'Strong Match': '#10b981',
  'Good Match':   '#1e6ef4',
  'Partial Match':'#f59e0b',
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function JDAnalyzer() {
  const [jd,           setJd]           = useState('');
  const [result,       setResult]       = useState<JDResult | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [copied,       setCopied]       = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!result) return;
    const target = result.overallScore;
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + Math.ceil(target / 30), target);
      setDisplayScore(current);
      if (current >= target) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [result]);

  const analyze = async () => {
    if (!jd.trim()) return;
    const safe = jd.trim().slice(0, MAX_JD_INPUT);
    if (detectInjection(safe)) {
      setError("That doesn't look like a job description. Please paste a genuine job posting.");
      return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await groqJSON<JDResult>(JD_SYSTEM_PROMPT, `<job_description>\n${safe}\n</job_description>`);
      setResult(res);
    } catch {
      setError('Analysis failed. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.coverLetterOpener);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-[20px]">

      {/* ── Input ── */}
      <div className="agent-panel rounded-[24px] p-[24px] md:p-[32px] flex flex-col gap-[16px]">
        <label className="agent-label">Paste Job Description</label>
        <textarea
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder="Paste any job description here — I'll score how well Ramanathan's profile matches the role and generate a tailored cover letter opener."
          rows={7}
          className="agent-surface w-full rounded-[16px] p-[16px] text-[13px] text-black dark:text-white placeholder-black/25 dark:placeholder-white/20 resize-none outline-none font-medium leading-[160%]"
        />
        <button
          onClick={analyze}
          disabled={loading || !jd.trim()}
          className="self-start flex items-center gap-[8px] px-[24px] py-[12px] rounded-[12px] bg-[#1e6ef4] text-white text-[13px] font-semibold hover:bg-[#1a5fd4] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Analyzing…' : 'Analyze Fit →'}
        </button>
      </div>

      {error && <p className="text-[13px] text-red-500 font-semibold px-[4px]">{error}</p>}

      {/* ── Results ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col gap-[14px]"
          >

            {/* Score */}
            <div className="agent-panel rounded-[24px] p-[24px] md:p-[32px] flex items-center gap-[24px]">
              <span
                className="text-[72px] md:text-[88px] font-extrabold leading-none tracking-tight tabular-nums"
                style={{ color: scoreColor(result.overallScore) }}
              >
                {displayScore}
                <span className="text-[32px] text-black/20 dark:text-white/25">%</span>
              </span>
              <div className="flex flex-col gap-[6px]">
                <span
                  className="text-[16px] md:text-[20px] font-semibold"
                  style={{ color: labelColor[result.matchLabel] ?? '#1e6ef4' }}
                >
                  {result.matchLabel}
                </span>
                <span className="text-[12px] text-black/40 dark:text-white/40 font-semibold">
                  Profile match score
                </span>
              </div>
            </div>

            {/* Matched Skills */}
            {result.matchedSkills.length > 0 && (
              <div className="agent-panel rounded-[24px] p-[20px] md:p-[24px] flex flex-col gap-[12px]">
                <span className="agent-label" style={{ color: '#10b981' }}>✓ Matched Skills</span>
                <div className="flex flex-wrap gap-[6px]">
                  {result.matchedSkills.map(s => (
                    <span key={s} className="text-[11px] font-semibold px-[10px] py-[4px] rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gaps */}
            {result.gaps.length > 0 && (
              <div className="agent-panel rounded-[24px] p-[20px] md:p-[24px] flex flex-col gap-[12px]">
                <span className="agent-label">○ Gaps</span>
                <div className="flex flex-wrap gap-[6px]">
                  {result.gaps.map(g => (
                    <span key={g} className="agent-chip text-[11px] font-semibold px-[10px] py-[4px] rounded-full">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            <div className="agent-panel rounded-[24px] p-[20px] md:p-[24px] flex flex-col gap-[12px]">
              <span className="agent-label" style={{ color: '#1e6ef4' }}>★ Key Strengths</span>
              <ul className="flex flex-col gap-[8px]">
                {result.strengths.map(s => (
                  <li key={s} className="flex items-start gap-[8px] text-[13px] text-black/70 dark:text-white/70 font-semibold">
                    <span className="text-[#1e6ef4] flex-shrink-0">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cover Letter Opener */}
            <div className="agent-panel rounded-[24px] p-[20px] md:p-[24px] flex flex-col gap-[12px]">
              <div className="flex items-center justify-between">
                <span className="agent-label">✉ Cover Letter Opener</span>
                <button
                  onClick={copy}
                  className="flex items-center gap-[6px] text-[11px] font-semibold text-black/40 dark:text-white/40 hover:text-[#1e6ef4] transition-colors duration-200"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[13px] text-black/70 dark:text-white/70 font-medium leading-[170%]">
                {result.coverLetterOpener}
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
