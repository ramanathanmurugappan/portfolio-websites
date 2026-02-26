import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { techCategories } from '../data/techCategories';

const CAT_COLORS = ['#1e6ef4','#a100ff','#00b388','#f59e0b','#ef4444','#0891b2','#10b981'];

const W = 1120, H = 440, NR = 22;

// ── Hooks ────────────────────────────────────────────────────────────────────

function useAnimTime(speed = 0.32) {
  const [t, setT] = useState(0);
  const elapsed = useRef(0);
  const lastTs  = useRef<number | null>(null);
  useEffect(() => {
    let raf: number;
    const tick = (now: number) => {
      if (lastTs.current !== null) elapsed.current += (now - lastTs.current) / 1000 * speed;
      lastTs.current = now;
      setT(elapsed.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);
  return t;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function NodeIcon({ icon, isImage, darkInvert, cx, cy, size }: {
  icon: string; isImage?: boolean; darkInvert?: boolean;
  cx: number; cy: number; size: number;
}) {
  if (!isImage) {
    return (
      <text x={cx} y={cy + size * 0.36} textAnchor="middle"
        fontSize={size * 0.75} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {icon}
      </text>
    );
  }
  return (
    <image href={icon} x={cx - size / 2} y={cy - size / 2}
      width={size} height={size} preserveAspectRatio="xMidYMid meet"
      className={darkInvert ? 'dark:invert' : ''}
      style={{ pointerEvents: 'none' }} />
  );
}

function NodeLabel({ name, x, y, color, dim }: {
  name: string; x: number; y: number; color: string; dim: boolean;
}) {
  const words    = name.split(' ');
  const needWrap = words.length > 1 && name.length > 10;
  const mid      = Math.ceil(words.length / 2);
  return (
    <text x={x} y={y + NR + 11} textAnchor="middle"
      fontSize={7} fontWeight={600} fill={color}
      style={{ pointerEvents: 'none', opacity: dim ? 0.2 : 0.85, transition: 'opacity 0.2s' }}>
      {needWrap ? (
        <>
          <tspan x={x} dy="0">{words.slice(0, mid).join(' ')}</tspan>
          <tspan x={x} dy="9">{words.slice(mid).join(' ')}</tspan>
        </>
      ) : name}
    </text>
  );
}

// ── Mobile grid layout ────────────────────────────────────────────────────────

function MobileTechGrid() {
  return (
    <div className="flex flex-col gap-[12px]">
      {techCategories.map((cat, ci) => {
        const color = CAT_COLORS[ci % CAT_COLORS.length];
        return (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.4, delay: ci * 0.06, ease: 'easeOut' }}
            className="constellation-bg rounded-[16px] p-[16px] flex flex-col gap-[10px]"
          >
            {/* Category header */}
            <div className="flex items-center gap-[8px]">
              <div className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{ color }}>
                {cat.title}
              </span>
            </div>
            {/* Tech pills */}
            <div className="flex flex-wrap gap-[6px]">
              {cat.items.map((tech) => (
                <div key={tech.name}
                  className="flex items-center gap-[6px] px-[10px] py-[6px] rounded-[10px] bg-white dark:bg-[#111]"
                  style={{ border: `1px solid ${color}25` }}>
                  {tech.isImage ? (
                    <img src={tech.icon} alt={tech.name}
                      className={`w-[14px] h-[14px] object-contain flex-shrink-0 ${tech.darkInvert ? 'dark:invert' : ''}`} />
                  ) : (
                    <span className="text-[12px] leading-none">{tech.icon}</span>
                  )}
                  <span className="text-[11px] font-semibold text-black dark:text-white whitespace-nowrap">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Data derivation ──────────────────────────────────────────────────────────

const layers = techCategories.map((cat, ci) => ({
  label: cat.title,
  color: CAT_COLORS[ci % CAT_COLORS.length],
  techs: cat.items,
}));

const layerX = layers.map((_, i) => 75 + i * (W - 130) / (layers.length - 1));

const layerNodes = layers.map((layer, li) => {
  const n      = layer.techs.length;
  const gap    = Math.min(74, (H - 90) / Math.max(n - 1, 1));
  const startY = (H - gap * (n - 1)) / 2;
  return layer.techs.map((tech, ni) => ({
    ...tech, color: layer.color,
    x: layerX[li], y: startY + ni * gap, li,
  }));
});

type Edge = { x1:number; y1:number; x2:number; y2:number; color:string; delay:number; li:number };
const edges: Edge[] = layerNodes.slice(0, -1).flatMap((nodes, li) =>
  nodes.flatMap((a, ai) =>
    layerNodes[li + 1].map((b, bi) => ({
      x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      color: layers[li].color,
      delay: (ai * layerNodes[li + 1].length + bi) / (nodes.length * layerNodes[li + 1].length),
      li,
    }))
  )
);

const shortLabel = (title: string) =>
  title.split(' ').filter(w => w !== '&').slice(0, 2).join(' ').toUpperCase();

// ── Component ────────────────────────────────────────────────────────────────

export default function TechStack() {
  const t = useAnimTime();
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ name: string; desc: string; color: string } | null>(null);

  const isEdgeDim = (li: number) =>
    activeLayer !== null && activeLayer !== li && activeLayer !== li + 1;

  return (
    <div className="flex flex-col gap-[40px]">
      <div className="container">
        <SectionHeader eyebrow="🛠️ Tech Stack" title="What I Use" />
      </div>

      <div className="container">
        {/* Mobile: categorised badge grid */}
        <div className="md:hidden">
          <MobileTechGrid />
        </div>

        {/* Desktop: Signal Flow Pipeline SVG */}
        <div className="hidden md:block">
          <div className="constellation-bg card-hover" style={{ borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
            <svg width="100%" viewBox={`0 0 ${W} ${H + 14}`}
              preserveAspectRatio="xMidYMid meet" style={{ display: 'block', minHeight: 300 }}>

              {/* Connection lines */}
              {edges.map((e, i) => (
                <line key={`el${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                  stroke={e.color} strokeWidth={0.9}
                  strokeOpacity={isEdgeDim(e.li) ? 0.04 : 0.20} />
              ))}

              {/* Traveling signal dots */}
              {edges.map((e, i) => {
                if (isEdgeDim(e.li)) return null;
                const prog = (t * 0.9 + e.delay) % 1;
                return (
                  <circle key={`dot${i}`} r={3.2} fill={e.color} opacity={0.88}
                    cx={e.x1 + (e.x2 - e.x1) * prog}
                    cy={e.y1 + (e.y2 - e.y1) * prog}
                    style={{ filter: `drop-shadow(0 0 5px ${e.color})` }} />
                );
              })}

              {/* Active column glow */}
              {activeLayer !== null && (
                <rect x={layerX[activeLayer] - 52} y={14} width={104} height={H - 28}
                  rx={18} fill={layers[activeLayer].color} opacity={0.06} />
              )}

              {/* Nodes */}
              {layerNodes.map((nodes, li) =>
                nodes.map((node, ni) => {
                  const dim = activeLayer !== null && activeLayer !== li;
                  return (
                    <g key={`n${li}-${ni}`} style={{ cursor: 'pointer' }}
                      onMouseEnter={() => { setActiveLayer(li); setTooltip({ name: node.name, desc: node.description, color: node.color }); }}
                      onMouseLeave={() => { setActiveLayer(null); setTooltip(null); }}>
                      {activeLayer === li && (
                        <circle cx={node.x} cy={node.y} r={NR + 10} fill={node.color} opacity={0.12} />
                      )}
                      <circle cx={node.x} cy={node.y} r={NR}
                        fill="white" className="dark:fill-[#18202e]"
                        stroke={node.color} strokeWidth={activeLayer === li ? 2.8 : 1.6}
                        strokeOpacity={dim ? 0.18 : 1}
                        style={{ filter: activeLayer === li ? `drop-shadow(0 0 10px ${node.color}90)` : 'none',
                                 transition: 'all 0.2s', opacity: dim ? 0.35 : 1 }} />
                      <g opacity={dim ? 0.25 : 1} style={{ transition: 'opacity 0.2s' }}>
                        <NodeIcon {...node} cx={node.x} cy={node.y} size={NR * 1.20} />
                      </g>
                      <NodeLabel name={node.name} x={node.x} y={node.y} color={node.color} dim={dim} />
                    </g>
                  );
                })
              )}

              {/* Layer labels */}
              {layers.map((layer, li) => (
                <g key={`lbl${li}`} style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setActiveLayer(li)}
                  onMouseLeave={() => setActiveLayer(null)}>
                  <line x1={layerX[li] - 36} y1={H - 22} x2={layerX[li] + 36} y2={H - 22}
                    stroke={layer.color} strokeWidth={2}
                    strokeOpacity={activeLayer === li ? 1 : 0.35} />
                  <text x={layerX[li]} y={H - 10} textAnchor="middle"
                    fontSize={7} fontWeight={800} fill={layer.color}
                    style={{ fontFamily: 'monospace', opacity: activeLayer === li ? 1 : 0.45 }}>
                    {shortLabel(layer.label)}
                  </text>
                </g>
              ))}
            </svg>

            <AnimatePresence>
              {tooltip && (
                <motion.div key={tooltip.name}
                  initial={{ opacity: 0, y: -8, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.88 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(8,12,24,0.94)', border: `1px solid ${tooltip.color}80`,
                    borderRadius: 10, padding: '8px 18px', pointerEvents: 'none',
                    boxShadow: `0 4px 20px ${tooltip.color}40`, whiteSpace: 'nowrap', zIndex: 10,
                  }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: tooltip.color }}>{tooltip.name}</p>
                  <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.60)', marginTop: 2 }}>{tooltip.desc}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <p style={{ textAlign: 'center', fontSize: 10, opacity: 0.35, margin: '0 0 14px' }}>
              Signals flow left → right · hover a layer or node
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
