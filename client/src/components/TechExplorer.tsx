/**
 * TechExplorer — Three-phase AI stack tool.
 * Phase 1: Compare tools → grouped tables, user picks per category.
 * Phase 2: LLM builds complete pipeline from user picks + fills gaps.
 * Phase 3: Discover Projects → LLM recommends what to build with the stack.
 */

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Plus, ChevronRight, Sparkles, Lightbulb, RefreshCw } from 'lucide-react';
import { groqJSON, detectInjection } from '../lib/groqUtils';
import type { Criterion, Category, Pair, PipelineLayer, CompareResult, CompletePipelineLayer, ProjectRec } from '../types/ai-tools';
import { COMPARE_PROMPT, buildPipelinePrompt, PROJECTS_PROMPT } from '../lib/prompts';

// ── Normalize compare result ───────────────────────────────────────────────────

function normalize(raw: Partial<CompareResult>): CompareResult {
  return {
    categories:       (raw.categories ?? []).map(c => ({
      ...c, tools: c.tools ?? [],
      criteria: (c.criteria ?? []).map(cr => ({ ...cr, values: cr.values ?? [], winner: cr.winner ?? -1 })),
      categoryWinner: c.categoryWinner ?? '',
    })),
    singletons:       raw.singletons       ?? [],
    competing:        raw.competing        ?? [],
    complementary:    raw.complementary    ?? [],
    pipeline:         (raw.pipeline ?? []).map(l => ({ ...l, tools: l.tools ?? [], pick: l.pick ?? '' })),
    scores:           (raw.scores ?? []).map(s => ({ ...s, metrics: s.metrics ?? [] })),
    recommendedStack:  raw.recommendedStack  ?? [],
    recommendedReason: raw.recommendedReason ?? '',
    ramanathanPick:    raw.ramanathanPick    ?? '',
    ramanathanReason:  raw.ramanathanReason  ?? '',
  };
}

// ── Quick-add suggestions ──────────────────────────────────────────────────────

const SUGGESTIONS = [
  'LangChain', 'LlamaIndex', 'LangGraph', 'CrewAI', 'AutoGen', 'Haystack',
  'GPT-4', 'Claude Sonnet', 'Groq LLaMA', 'Gemini Pro', 'Mistral', 'LLaMA',
  'Pinecone', 'Qdrant', 'Weaviate', 'ChromaDB', 'FAISS', 'OpenSearch',
  'FastAPI', 'Flask', 'Streamlit', 'Gradio', 'React', 'Next.js',
  'vLLM', 'Ollama', 'LiteLLM', 'TGI',
  'DeepEval', 'Langfuse', 'LangSmith', 'Ragas', 'W&B',
  'Docker', 'MLflow', 'Airflow', 'Kafka', 'Redis', 'PostgreSQL',
  'AWS Bedrock', 'Azure OpenAI', 'Vertex AI',
];

// ── Layer colour palette ───────────────────────────────────────────────────────

const LAYER_COLOR_MAP: [string[], string][] = [
  [['vector', 'search', 'retrieval', 'embed'],                  '#10b981'],
  [['agent', 'framework', 'orchestration', 'chain', 'graph'],   '#1e6ef4'],
  [['llm model', 'language model', 'model'],                    '#6366f1'],
  [['gateway', 'proxy', 'serving', 'inference'],                '#f59e0b'],
  [['ui', 'frontend', 'interface', 'app'],                      '#ec4899'],
  [['observability', 'eval', 'monitor', 'trace'],               '#8b5cf6'],
  [['database', 'cache', 'storage', 'db'],                      '#06b6d4'],
  [['workflow', 'pipeline', 'scheduling'],                      '#f97316'],
  [['deploy', 'infra', 'container', 'docker'],                  '#64748b'],
  [['streaming', 'event', 'queue', 'kafka'],                    '#84cc16'],
  [['cloud', 'managed', 'bedrock', 'vertex'],                   '#0ea5e9'],
];

const layerColor = (name: string) => {
  const low = name.toLowerCase();
  for (const [keywords, color] of LAYER_COLOR_MAP) {
    if (keywords.some(kw => low.includes(kw))) return color;
  }
  return '#1e6ef4';
};

const DIFFICULTY_COLOR = { Beginner: '#10b981', Intermediate: '#f59e0b', Advanced: '#ef4444' } as const;

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 20;

// ── Component ──────────────────────────────────────────────────────────────────

export default function TechExplorer() {
  const [options,          setOptions]          = useState<string[]>([]);
  const [inputVal,         setInputVal]         = useState('');
  const [result,           setResult]           = useState<CompareResult | null>(null);
  const [loading,          setLoading]          = useState(false);
  const [pipelineLoading,  setPipelineLoading]  = useState(false);
  const [projLoading,      setProjLoading]      = useState(false);
  const [error,            setError]            = useState<string | null>(null);
  const [selectedTools,    setSelectedTools]    = useState<Record<string, string>>({});
  const [completePipeline, setCompletePipeline] = useState<CompletePipelineLayer[] | null>(null);
  const [pipelineStale,    setPipelineStale]    = useState(false);
  const [projects,         setProjects]         = useState<ProjectRec[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (completePipeline) setPipelineStale(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTools]);

  useEffect(() => {
    if (!result) return;
    const init: Record<string, string> = {};
    result.categories.forEach(cat => { init[cat.category] = cat.categoryWinner || cat.tools[0] || ''; });
    result.singletons.forEach(s => { init[s.category] = s.tool; });
    setSelectedTools(init);
    setCompletePipeline(null);
    setPipelineStale(false);
    setProjects(null);
  }, [result]);

  const addOption = (raw: string) => {
    const trimmed = raw.replace(/,/g, '').trim().slice(0, 50);
    if (!trimmed || options.length >= MAX_OPTIONS) return;
    if (options.some(o => o.toLowerCase() === trimmed.toLowerCase())) return;
    if (detectInjection(trimmed)) { setError('Please enter a valid technology name.'); return; }
    setOptions(prev => [...prev, trimmed]);
    setInputVal('');
    setError(null);
  };
  const removeOption = (idx: number) => {
    setOptions(prev => prev.filter((_, i) => i !== idx));
    setResult(null); setCompletePipeline(null); setPipelineStale(false); setProjects(null);
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (inputVal.trim()) addOption(inputVal); return; }
    if (e.key === 'Backspace' && !inputVal && options.length > 0) removeOption(options.length - 1);
  };

  const runComparison = async () => {
    const finalOptions = inputVal.trim() ? [...options, inputVal.trim().slice(0, 50)] : options;
    if (finalOptions.length < MIN_OPTIONS) return;
    if (inputVal.trim()) addOption(inputVal);
    setLoading(true); setError(null); setResult(null); setCompletePipeline(null);
    setPipelineStale(false); setProjects(null);
    try {
      const raw = await groqJSON<Partial<CompareResult>>(COMPARE_PROMPT, `<tools>\n${finalOptions.join(', ')}\n</tools>`);
      setResult(normalize(raw));
    } catch { setError('Comparison failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const buildPipeline = async () => {
    const picksLines = [
      ...Object.entries(selectedTools).filter(([, t]) => t).map(([cat, t]) => `${cat}: ${t}`),
      ...(result?.singletons ?? []).map(s => `${s.category}: ${s.tool}`),
    ].join('\n');
    if (!picksLines) return;
    setPipelineLoading(true); setError(null); setPipelineStale(false); setProjects(null);
    try {
      const res = await groqJSON<{ pipeline: CompletePipelineLayer[] }>(
        buildPipelinePrompt(picksLines), 'Build the complete pipeline.',
      );
      setCompletePipeline((res.pipeline ?? []).map(l => ({
        layer:  l.layer  ?? 'Layer',
        tool:   l.tool   ?? '—',
        source: (l.source === 'user' ? 'user' : 'ram') as 'user' | 'ram',
        why:    l.why    ?? '',
      })));
    } catch { setError('Pipeline build failed. Please try again.'); }
    finally { setPipelineLoading(false); }
  };

  const discoverProjects = async () => {
    const stack = completePipeline?.map(l => l.tool).join(', ') ?? '';
    if (!stack) return;
    setProjLoading(true); setError(null);
    try {
      const res = await groqJSON<{ projects: ProjectRec[] }>(PROJECTS_PROMPT, `<stack>\n${stack}\n</stack>`);
      setProjects((res.projects ?? []).slice(0, 3));
    } catch { setError('Project recommendations failed. Please try again.'); }
    finally { setProjLoading(false); }
  };

  const unusedSuggestions = SUGGESTIONS.filter(s => !options.some(o => o.toLowerCase() === s.toLowerCase()));

  return (
    <div className="flex flex-col gap-[20px]">

      {/* ════════════ INPUT PANEL ════════════ */}
      <div className="agent-panel rounded-[24px] p-[24px] md:p-[32px] flex flex-col gap-[16px]">
        <div className="flex items-center justify-between">
          <label className="agent-label">Add Tools to Compare</label>
          <span className={`text-[11px] font-bold tabular-nums ${options.length >= MIN_OPTIONS ? 'text-[#10b981]' : 'text-black/25 dark:text-white/25'}`}>
            {options.length}/{MAX_OPTIONS}
          </span>
        </div>

        {options.length > 0 && (
          <div className="flex flex-wrap gap-[6px]">
            {options.map((opt, i) => (
              <span key={opt} className="flex items-center gap-[5px] text-[12px] font-semibold px-[10px] py-[5px] rounded-full bg-[#1e6ef4]/10 text-[#1e6ef4] border border-[#1e6ef4]/25">
                {opt}
                <button onClick={() => removeOption(i)} className="hover:text-red-400 transition-colors leading-none">
                  <X size={10} strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>
        )}

        {options.length < MAX_OPTIONS && (
          <div className="flex gap-[8px]">
            <input
              ref={inputRef} type="text" value={inputVal}
              onChange={e => setInputVal(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Type a tool name and press Enter…"
              className="agent-surface flex-1 rounded-[12px] px-[14px] py-[11px] text-[13px] text-black dark:text-white placeholder-black/25 dark:placeholder-white/20 outline-none font-medium"
            />
            <button
              onClick={() => { if (inputVal.trim()) addOption(inputVal); }} disabled={!inputVal.trim()}
              className="agent-surface flex items-center gap-[5px] px-[14px] rounded-[12px] text-[#1e6ef4] text-[13px] font-semibold hover:border-[#1e6ef4]/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={13} strokeWidth={2.5} /> Add
            </button>
          </div>
        )}

        <div className="flex flex-col gap-[8px]">
          <span className="agent-label">Quick Add</span>
          <div className="flex flex-wrap gap-[5px]">
            {unusedSuggestions.map(s => (
              <button
                key={s} disabled={options.length >= MAX_OPTIONS} onClick={() => addOption(s)}
                className="agent-chip text-[11px] font-semibold px-[9px] py-[3px] rounded-full"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-[12px]">
          <button
            onClick={runComparison} disabled={loading || options.length < MIN_OPTIONS}
            className="flex items-center gap-[8px] px-[24px] py-[12px] rounded-[12px] bg-[#1e6ef4] text-white text-[13px] font-semibold hover:bg-[#1a5fd4] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Analysing…' : options.length >= MIN_OPTIONS ? `Compare ${options.length} Tools →` : 'Compare →'}
          </button>
          {options.length < MIN_OPTIONS && !loading && (
            <span className="text-[12px] text-black/30 dark:text-white/30 font-semibold">Add at least {MIN_OPTIONS} tools</span>
          )}
        </div>
      </div>

      {error && <p className="text-[13px] text-red-500 font-semibold px-[4px]">{error}</p>}

      {/* ════════════ PHASE 1 — COMPARE ════════════ */}
      <AnimatePresence>
        {result && (
          <motion.div key="phase1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }} className="flex flex-col gap-[14px]">

            <p className="agent-label px-[2px]">Step 1 — Compare &amp; Select Your Tools</p>

            {result.categories.map((cat, ci) => (
              <motion.div key={ci} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: ci * 0.06 }}
                className="agent-panel rounded-[20px] p-[18px] md:p-[24px] flex flex-col gap-[14px]">

                <div className="flex flex-col gap-[10px]">
                  <div className="flex items-center gap-[8px]">
                    <span className="text-[12px] font-bold text-black dark:text-white">{cat.category}</span>
                    {(cat.categoryWinner || cat.tools[0]) && (
                      <span className="text-[10px] font-bold px-[7px] py-[2px] rounded-full bg-[#1e6ef4]/10 text-[#1e6ef4] border border-[#1e6ef4]/25">
                        Ram's pick: {cat.categoryWinner || cat.tools[0]}
                      </span>
                    )}
                  </div>
                  {cat.tools.length > 1 && (
                    <div className="flex flex-wrap gap-[6px] items-center">
                      <span className="agent-label">Your pick:</span>
                      {cat.tools.map(t => (
                        <button key={t} onClick={() => setSelectedTools(prev => ({ ...prev, [cat.category]: t }))}
                          className={`text-[12px] font-semibold px-[10px] py-[4px] rounded-full border transition-all duration-150 ${
                            selectedTools[cat.category] === t
                              ? 'bg-[#1e6ef4] text-white border-transparent'
                              : 'agent-chip'
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="agent-thead-row">
                        <th className="pb-[8px] pr-[16px] text-[10px] text-black/30 dark:text-white/30 uppercase font-semibold whitespace-nowrap">Criterion</th>
                        {cat.tools.map(t => (
                          <th key={t} className={`pb-[8px] pr-[14px] text-[12px] font-semibold whitespace-nowrap ${selectedTools[cat.category] === t ? 'text-[#1e6ef4]' : 'text-black/50 dark:text-white/50'}`}>{t}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cat.criteria.map((row, ri) => (
                        <tr key={ri} className="agent-tbody-row">
                          <td className="py-[8px] pr-[16px] text-[11px] font-semibold text-black/40 dark:text-white/40 whitespace-nowrap">{row.criterion}</td>
                          {row.values.map((val, vi) => (
                            <td key={vi} className={`py-[8px] pr-[14px] text-[12px] font-semibold ${row.winner === vi ? 'text-[#10b981]' : row.winner === -1 ? 'text-black/60 dark:text-white/60' : 'text-black/30 dark:text-white/30'}`}>
                              {row.winner === vi && '✓ '}{val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}

            {result.singletons.length > 0 && (
              <div className="agent-panel rounded-[20px] p-[16px] flex flex-col gap-[8px]">
                <span className="agent-label">Unique Tools — auto-included in pipeline</span>
                {result.singletons.map((s, i) => (
                  <div key={i} className="flex items-center gap-[8px]">
                    <span className="text-[12px] font-bold text-[#1e6ef4]">{s.tool}</span>
                    <span className="text-[10px] px-[6px] py-[1px] rounded-full bg-black/[0.05] dark:bg-white/[0.06] text-black/40 dark:text-white/40 border border-black/[0.06] dark:border-white/[0.1]">{s.category}</span>
                    <span className="text-[12px] text-black/45 dark:text-white/45 font-medium">— {s.verdict}</span>
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence>
              {pipelineStale && (
                <motion.p key="stale" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                  className="text-[12px] text-[#f59e0b] font-semibold px-[2px] flex items-center gap-[6px]">
                  <RefreshCw size={12} /> Picks changed — rebuild pipeline to update
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-[12px] pt-[4px]">
              <button onClick={buildPipeline} disabled={pipelineLoading}
                className="flex items-center gap-[8px] px-[28px] py-[13px] rounded-[14px] bg-black dark:bg-white text-white dark:text-black text-[13px] font-semibold hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
                {pipelineLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Building Pipeline…</>
                  : <><Sparkles size={14} /> {completePipeline ? 'Rebuild Pipeline →' : 'Build Complete Pipeline →'}</>
                }
              </button>
              {!pipelineLoading && (
                <span className="text-[12px] text-black/30 dark:text-white/30 font-medium">
                  LLM builds from your picks + fills gaps
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════ PHASE 2 — PIPELINE ════════════ */}
      <AnimatePresence>
        {completePipeline && completePipeline.length > 0 && (
          <motion.div key="phase2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }} className="flex flex-col gap-[14px]">

            <p className="agent-label px-[2px]">Step 2 — Your Complete Pipeline</p>

            <div className="flex items-center gap-[14px] px-[2px]">
              <span className="flex items-center gap-[5px] text-[11px] font-semibold text-[#1e6ef4]">
                <span className="w-[8px] h-[8px] rounded-full bg-[#1e6ef4] inline-block" /> Your selection
              </span>
              <span className="flex items-center gap-[5px] text-[11px] font-semibold text-black/35 dark:text-white/35">
                <span className="w-[8px] h-[8px] rounded-full border-[2px] border-dashed border-black/30 dark:border-white/30 inline-block" /> Ram suggests
              </span>
            </div>

            <div className="agent-panel rounded-[24px] p-[24px] md:p-[32px]">
              {completePipeline.map((layer, li) => {
                const color = layerColor(layer.layer);
                const isLast = li === completePipeline.length - 1;
                const isUser = layer.source === 'user';
                return (
                  <div key={li}>
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: li * 0.07 }} className="flex items-start gap-[18px]">
                      <div className="flex flex-col items-center flex-shrink-0 pt-[5px]">
                        <div
                          className={`w-[10px] h-[10px] rounded-full ${isUser ? '' : 'border-[2px] border-dashed bg-transparent'}`}
                          style={isUser ? { backgroundColor: color, boxShadow: `0 0 0 3px ${color}44` } : { borderColor: color }}
                        />
                        {!isLast && <div className="w-[2px] flex-1 mt-[6px] mb-[-6px] min-h-[40px]" style={{ backgroundColor: color + '35' }} />}
                      </div>
                      <div className={`flex-1 ${isLast ? '' : 'pb-[28px]'}`}>
                        <div className="flex items-center gap-[8px] mb-[2px]">
                          <p className="text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color }}>{layer.layer}</p>
                          {!isUser && (
                            <span className="text-[9px] font-bold px-[5px] py-[1px] rounded-full border"
                              style={{ color, borderColor: color + '60', backgroundColor: color + '22' }}>
                              Ram suggests
                            </span>
                          )}
                        </div>
                        <p className="text-[20px] font-bold text-black dark:text-white leading-tight">{layer.tool}</p>
                        <p className="text-[12px] text-black/40 dark:text-white/40 font-medium mt-[3px] leading-[145%]">{layer.why}</p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            <div className="agent-panel rounded-[20px] p-[18px] flex flex-col gap-[10px]">
              <span className="agent-label" style={{ color: '#1e6ef4' }}>✦ Your Stack</span>
              <div className="flex flex-wrap items-center gap-[5px]">
                {completePipeline.map((l, i) => (
                  <span key={l.tool + i} className="flex items-center gap-[5px]">
                    <span className={`text-[12px] font-semibold ${l.source === 'user' ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40'}`}>{l.tool}</span>
                    {i < completePipeline.length - 1 && <ChevronRight size={11} className="text-black/20 dark:text-white/20" />}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-[12px]">
              <button onClick={discoverProjects} disabled={projLoading}
                className="flex items-center gap-[8px] px-[28px] py-[13px] rounded-[14px] bg-[#6366f1] text-white text-[13px] font-semibold hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
                {projLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Finding Projects…</>
                  : <><Lightbulb size={14} /> What Can I Build? →</>
                }
              </button>
              {!projLoading && <span className="text-[12px] text-black/30 dark:text-white/30 font-medium">AI recommends projects for your stack</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════ PHASE 3 — PROJECT RECOMMENDATIONS ════════════ */}
      <AnimatePresence>
        {projects && projects.length > 0 && (
          <motion.div key="phase3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }} className="flex flex-col gap-[14px]">

            <p className="agent-label px-[2px]">Step 3 — Projects You Can Build</p>

            {projects.map((proj, pi) => {
              const diffColor = DIFFICULTY_COLOR[proj.difficulty] ?? '#1e6ef4';
              return (
                <motion.div key={pi} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: pi * 0.08 }}
                  className="agent-panel rounded-[20px] p-[20px] md:p-[24px] flex flex-col gap-[14px]">

                  <div className="flex items-start justify-between gap-[12px]">
                    <div>
                      <p className="text-[15px] font-bold text-black dark:text-white">{proj.name}</p>
                      <p className="text-[12px] text-black/50 dark:text-white/50 font-medium mt-[2px]">{proj.tagline}</p>
                    </div>
                    <span className="text-[10px] font-bold px-[8px] py-[3px] rounded-full flex-shrink-0"
                      style={{ color: diffColor, backgroundColor: diffColor + '18', border: `1px solid ${diffColor}35` }}>
                      {proj.difficulty}
                    </span>
                  </div>

                  <p className="text-[13px] text-black/65 dark:text-white/65 font-medium leading-[162%]">{proj.description}</p>

                  {proj.highlights?.length > 0 && (
                    <ul className="flex flex-col gap-[5px]">
                      {proj.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-[7px] text-[12px] text-black/55 dark:text-white/55 font-medium">
                          <span className="text-[#6366f1] flex-shrink-0 mt-[1px]">→</span>{h}
                        </li>
                      ))}
                    </ul>
                  )}

                  {proj.toolsUsed?.length > 0 && (
                    <div className="flex flex-wrap gap-[5px]">
                      {proj.toolsUsed.map(t => (
                        <span key={t} className="agent-chip text-[10px] font-semibold px-[8px] py-[2px] rounded-full cursor-default">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
