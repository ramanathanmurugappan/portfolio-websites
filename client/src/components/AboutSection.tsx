/**
 * AboutSection — Trivia Flip Cards
 * 6 cards in a 3-col grid, each flips on click to reveal the answer.
 * Front: avatar photo or logo grid + question. Back: gradient + answer.
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import SectionHeader from './SectionHeader';

// ── Card data ─────────────────────────────────────────────────────────────────

type CardData = {
  question: string;
  answer: string;
  color: string;
  grad: string;
} & (
  | { type: 'image'; src: string }
  | { type: 'logos'; logos: { src: string; invert: boolean }[] }
);

const CARDS: CardData[] = [
  {
    type: 'image', src: '/images/avatar-laptop-card.jpg',
    question: 'What do I build?',
    answer: 'RAG Pipelines, Multi-Agent Systems & production LLM applications at enterprise scale.',
    color: '#1e6ef4',
    grad: 'linear-gradient(135deg, #1e6ef4 0%, #6366f1 100%)',
  },
  {
    type: 'image', src: '/images/avatar-thinking-card.jpg',
    question: 'How long have I been building AI?',
    answer: '6+ years since Dec 2019 — Kaleidofin → Accenture → ITC Infotech.',
    color: '#6366f1',
    grad: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  {
    type: 'image', src: '/images/avatar-hero-card.jpg',
    question: 'Where am I based?',
    answer: 'Bengaluru, India. Available for remote work globally.',
    color: '#059669',
    grad: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
  },
  {
    type: 'logos',
    logos: [
      { src: '/images/tech-logos/langchain.svg',  invert: true  },
      { src: '/images/tech-logos/openai.svg',      invert: true  },
      { src: '/images/tech-logos/crewai.svg',      invert: true  },
      { src: '/images/tech-logos/anthropic.svg',   invert: true  },
      { src: '/images/tech-logos/huggingface.svg', invert: false },
      { src: '/images/tech-logos/pytorch.svg',     invert: false },
    ],
    question: 'Favourite AI framework?',
    answer: 'LangGraph — fine-grained state control for complex multi-agent workflows.',
    color: '#8b5cf6',
    grad: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
  },
  {
    type: 'image', src: '/images/avatar-coding-card.jpg',
    question: 'Research output?',
    answer: '2 published papers on ML-based predictive modelling for financial inclusion at scale.',
    color: '#ea580c',
    grad: 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)',
  },
  {
    type: 'logos',
    logos: [
      { src: '/images/tech-logos/anthropic.svg', invert: true  },
      { src: '/images/tech-logos/aws.svg',        invert: true  },
      { src: '/images/tech-logos/docker.svg',     invert: false },
      { src: '/images/tech-logos/fastapi.svg',    invert: false },
      { src: '/images/tech-logos/mlflow.svg',     invert: false },
      { src: '/images/tech-logos/deepgram.svg',   invert: true  },
    ],
    question: 'Current obsession?',
    answer: 'MCP Protocol — building tool-use agents that interface with any external system.',
    color: '#0891b2',
    grad: 'linear-gradient(135deg, #0891b2 0%, #1e6ef4 100%)',
  },
];

// ── FlipCard ──────────────────────────────────────────────────────────────────

function FlipCard({ card, index }: { card: CardData; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const didPeek = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStart.current || peeking) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    pointerStart.current = null;

    // Swipe: clear horizontal movement (more horiz than vert, at least 40px)
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      setFlipped(f => !f);
      return;
    }
    // Tap: pointer barely moved
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      setFlipped(f => !f);
    }
  };

  // When card enters viewport: wait for entry animation, then briefly tilt open
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !didPeek.current) {
          didPeek.current = true;
          // Stagger: card entry anim (0.45s + index*0.07s) + 300ms buffer
          const delay = 750 + index * 140;
          setTimeout(() => {
            setPeeking(true);                 // tilt open → peek
            setTimeout(() => setPeeking(false), 850); // hold then return
          }, delay);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const rotateY = flipped ? 180 : peeking ? 34 : 0;

  const Visual = () => {
    if (card.type === 'image') {
      return (
        <img
          src={card.src}
          alt={card.question}
          className="w-full h-full object-cover object-top"
          loading="lazy"
          decoding="async"
        />
      );
    }
    // logos grid
    return (
      <div className="w-full h-full grid grid-cols-3 grid-rows-2 gap-[8px] p-[14px]">
        {card.logos.map((l, i) => (
          <div key={i} className="flex items-center justify-center rounded-[10px]"
            style={{ background: `${card.color}12` }}>
            <img src={l.src} alt="" aria-hidden="true"
              className={`w-[26px] h-[26px] object-contain opacity-75 ${l.invert ? 'brightness-0 dark:invert' : ''}`} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
      className="cursor-pointer select-none"
      style={{ perspective: 900 }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <motion.div
        animate={{ rotateY }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', height: 'clamp(200px, 55vw, 220px)' }}
      >
        {/* ── Front face ── */}
        <div
          className="absolute inset-0 rounded-[24px] overflow-hidden flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            background: 'var(--grey)',
            border: `1.5px solid ${card.color}28`,
            boxShadow: `0 4px 20px ${card.color}10`,
          }}
        >
          {/* Coloured top bar */}
          <div className="h-[3px] flex-shrink-0" style={{ background: card.grad }} />

          {/* Illustration / logo area */}
          <div className="flex-1 flex items-center justify-center overflow-hidden"
            style={{ background: `${card.color}06` }}>
            <Visual />
          </div>

          {/* Question row */}
          <div className="flex items-center justify-between gap-[8px] px-[14px] py-[12px] flex-shrink-0
                          border-t border-black/[0.05] dark:border-white/[0.05]">
            <p className="text-[11px] font-bold text-black/70 dark:text-white/70 leading-[135%]">
              {card.question}
            </p>
            <span className="text-[8px] font-bold uppercase tracking-[0.08em] px-[7px] py-[3px] rounded-full flex-shrink-0"
              style={{ background: `${card.color}18`, color: card.color }}>
              Flip
            </span>
          </div>
        </div>

        {/* ── Back face ── */}
        <div
          className="absolute inset-0 rounded-[24px] flex flex-col items-center justify-center p-[20px] text-center gap-[12px]"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: card.grad,
          }}
        >
          <p className="text-[12px] md:text-[13px] font-semibold text-white leading-[160%]">
            {card.answer}
          </p>
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-[10px] py-[4px] rounded-full"
            style={{ background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)' }}>
            Tap to flip back
          </span>
        </div>

      </motion.div>
    </motion.div>
  );
}

// ── AboutSection ──────────────────────────────────────────────────────────────

export default function AboutSection() {
  return (
    <div className="container flex flex-col gap-[32px]">
      <SectionHeader icon={<User size={12} />} eyebrow="About" title="Get to Know Me" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[12px] md:gap-[16px]">
        {CARDS.map((card, i) => (
          <FlipCard key={i} card={card} index={i} />
        ))}
      </div>

      <p className="text-center text-[11px] text-black/25 dark:text-white/25 font-medium">
        Tap any card to flip ↻
      </p>
    </div>
  );
}
