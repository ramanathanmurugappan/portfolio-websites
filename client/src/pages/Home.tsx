/**
 * Home — main portfolio page.
 *
 * Performance strategy:
 *  - Above-fold (Hero, Navigation, ThemeToggle, ScrollProgress) → eager import
 *  - Everything else → React.lazy + Suspense so they're code-split into
 *    separate chunks and only downloaded when the browser is idle /
 *    the user scrolls toward them.
 */

import { useState, useEffect, lazy, Suspense } from 'react';

// ── Above-fold: eager ─────────────────────────────────────────────────────────
import Navigation    from '@/components/Navigation';
import ThemeToggle   from '@/components/ThemeToggle';
import Hero          from '@/components/Hero';
import ScrollProgress from '@/components/ScrollProgress';

// ── Below-fold: lazy (code-split) ────────────────────────────────────────────
const AboutSection = lazy(() => import('@/components/AboutSection'));
const Experience   = lazy(() => import('@/components/Experience'));
const Projects     = lazy(() => import('@/components/Projects'));
const TechStack    = lazy(() => import('@/components/TechStack'));
const Education    = lazy(() => import('@/components/Education'));
const Achievements = lazy(() => import('@/components/Achievements'));
const AITools      = lazy(() => import('@/components/AITools'));
const Contact      = lazy(() => import('@/components/Contact'));
const Footer       = lazy(() => import('@/components/Footer'));
const Chatbot      = lazy(() => import('@/components/Chatbot'));

// ── Skeleton fallback ─────────────────────────────────────────────────────────
// Shown while a lazy chunk is downloading — matches section height so layout
// doesn't shift when the real content arrives.
function SectionSkeleton() {
  return (
    <div className="container">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-32 rounded-full bg-black/[0.06] dark:bg-white/[0.06]" />
        <div className="h-10 w-64 rounded-xl  bg-black/[0.06] dark:bg-white/[0.06]" />
        <div className="h-48 rounded-2xl      bg-black/[0.04] dark:bg-white/[0.04]" />
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');
  const [isChatOpen,    setIsChatOpen]    = useState(true);

  useEffect(() => {
    const sections = ['home', 'works', 'tech-stack', 'contact'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && scrollPosition >= el.offsetTop && scrollPosition < el.offsetTop + el.offsetHeight) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <ScrollProgress />
      <div className="grain-overlay" aria-hidden="true" />
      <ThemeToggle />

      {/* Hero — eager, above-fold */}
      <section id="home">
        <Hero />
      </section>

      {/* Below-fold sections — each wrapped in its own Suspense so one slow
          chunk never blocks others from rendering */}
      <div className="flex flex-col gap-[160px] pt-[80px] pb-[24px]">

        <section id="about">
          <Suspense fallback={<SectionSkeleton />}>
            <AboutSection />
          </Suspense>
        </section>

        <section id="experience">
          <Suspense fallback={<SectionSkeleton />}>
            <Experience />
          </Suspense>
        </section>

        <section id="works">
          <Suspense fallback={<SectionSkeleton />}>
            <Projects />
          </Suspense>
        </section>

        <section id="tech-stack">
          <Suspense fallback={<SectionSkeleton />}>
            <TechStack />
          </Suspense>
        </section>

        <section>
          <Suspense fallback={<SectionSkeleton />}>
            <Education />
          </Suspense>
        </section>

        <section>
          <Suspense fallback={<SectionSkeleton />}>
            <Achievements />
          </Suspense>
        </section>

        <section id="ai-tools">
          <Suspense fallback={<SectionSkeleton />}>
            <AITools />
          </Suspense>
        </section>

        <section id="contact">
          <Suspense fallback={<SectionSkeleton />}>
            <Contact />
          </Suspense>
        </section>
      </div>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      {/* Navigation is eager — it's fixed and always visible */}
      <Navigation activeSection={activeSection} isChatOpen={isChatOpen} onChatToggle={setIsChatOpen} />

      {/* Chatbot — lazy; heavy OpenAI SDK chunk loads after page is interactive */}
      <Suspense fallback={null}>
        <Chatbot isOpen={isChatOpen} onToggle={setIsChatOpen} />
      </Suspense>
    </div>
  );
}
