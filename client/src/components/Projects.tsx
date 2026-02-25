/**
 * Projects Component - Featured work showcase with project details
 * Features: Project cards with descriptions and tech stack, slide transitions
 * Content matches resume exactly
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import MagneticButton from './MagneticButton';
import { projects } from '../data/projects';

export default function Projects() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 60 : -60,
      opacity: 0,
    }),
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="flex flex-col gap-[40px]">
      {/* Section Header */}
      <div className="container flex items-center justify-between">
        <SectionHeader eyebrow="💻 Projects" title="Featured Work" />

        {/* Navigation Arrows */}
        <div className="flex items-center gap-[12px]">
          <button
            onClick={prevSlide}
            className="w-[40px] h-[40px] rounded-full bg-[#f7f7f7] dark:bg-[#1a1a1a] flex items-center justify-center hover:bg-[#ebebeb] dark:hover:bg-[#252525] text-black dark:text-white transition-all duration-200 subtle-border"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="w-[40px] h-[40px] rounded-full bg-[#f7f7f7] dark:bg-[#1a1a1a] flex items-center justify-center hover:bg-[#ebebeb] dark:hover:bg-[#252525] text-black dark:text-white transition-all duration-200 subtle-border"
          >
            →
          </button>
          <MagneticButton>
            <a
              href="https://github.com/ramanathanmurugappan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-[24px] py-[14px] rounded-[14px] bg-[#1e6ef4] text-white text-[14px] font-semibold hover:bg-[#1a5ecf] transition-all duration-200 hover:-translate-y-0.5"
            >
              View GitHub
            </a>
          </MagneticButton>
        </div>
      </div>

      {/* Project Card */}
      <div className="container relative">
        {/* Large Side Arrow — Prev */}
        <button
          onClick={prevSlide}
          aria-label="Previous project"
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] rounded-full bg-white/90 dark:bg-[#111]/90 backdrop-blur-sm shadow-md flex items-center justify-center text-[22px] text-black dark:text-white hover:bg-[#1e6ef4] hover:text-white transition-all duration-200 subtle-border"
        >
          ‹
        </button>

        <div className="rounded-[32px] bg-[#f7f7f7] dark:bg-[#1a1a1a] overflow-hidden card-hover">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col md:flex-row"
            >
              {/* Left Side - Project Info */}
              <div className="w-full md:w-[50%] p-[36px] flex flex-col justify-between gap-[24px]">
                {/* Company Badge */}
                <div className="flex items-center gap-[8px]">
                  <div className="inline-flex px-[14px] py-[8px] rounded-[12px] bg-white dark:bg-[#0f0f0f] text-[12px] font-semibold text-black dark:text-white subtle-border">
                    🏢 {projects[currentIndex].company}
                  </div>
                  <div className="inline-flex px-[10px] py-[6px] rounded-[10px] bg-white dark:bg-[#0f0f0f] text-[10px] font-semibold text-black/50 dark:text-white/50 subtle-border">
                    {projects[currentIndex].period}
                  </div>
                  <span className="text-[12px] text-black/35 dark:text-white/35 font-semibold">
                    {currentIndex + 1} / {projects.length}
                  </span>
                </div>

                {/* Project Info */}
                <div className="flex flex-col gap-[16px]">
                  <h3 className="text-[28px] leading-[116%] tracking-[-0.02em] font-semibold text-black dark:text-white">
                    {projects[currentIndex].name}
                  </h3>
                  <p className="text-[13px] leading-[150%] text-black/50 dark:text-white/50 font-semibold">
                    {projects[currentIndex].description}
                  </p>

                  {/* Highlights */}
                  <ul className="flex flex-col gap-[8px] mt-[8px]">
                    {projects[currentIndex].highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-[8px] text-[12px] text-black/60 dark:text-white/60">
                        <span className="text-[#1e6ef4] mt-[2px]">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-[8px] mt-[8px]">
                    {projects[currentIndex].techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-[10px] py-[5px] rounded-[8px] bg-white dark:bg-[#0f0f0f] text-[11px] font-semibold text-black/60 dark:text-white/60 subtle-border"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Project Image */}
              <div className="w-full md:w-[50%] relative min-h-[380px]">
                <img
                  src={projects[currentIndex].image}
                  alt={projects[currentIndex].name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  style={{ pointerEvents: 'auto' }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Large Side Arrow — Next */}
        <button
          onClick={nextSlide}
          aria-label="Next project"
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] rounded-full bg-white/90 dark:bg-[#111]/90 backdrop-blur-sm shadow-md flex items-center justify-center text-[22px] text-black dark:text-white hover:bg-[#1e6ef4] hover:text-white transition-all duration-200 subtle-border"
        >
          ›
        </button>
      </div>

      {/* Slider Dots — pill-shaped active indicator */}
      <div className="container flex justify-center items-center gap-[6px]">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to project ${index + 1}`}
            className={`slide-dot ${index === currentIndex ? 'slide-dot--active' : 'w-[6px]'}`}
          />
        ))}
      </div>
    </div>
  );
}
