/**
 * Bluren Portfolio Replica - Home Page
 * Design: Neo-Minimalist Personal Branding
 * Features: 3D Memoji avatars, infinite marquee, pastel badges, fixed bottom nav
 */

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import Projects from '@/components/Projects';
import TechStack from '@/components/TechStack';
import Achievements from '@/components/Achievements';
import Education from '@/components/Education';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'works', 'contact'];
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section id="home">
        <Hero />
      </section>

      {/* Main Content Sections */}
      <div className="flex flex-col gap-[160px] pt-[80px] pb-[24px]">
        {/* About Section - Bento Grid */}
        <section id="about">
          <AboutSection />
        </section>

        {/* Projects Section */}
        <section id="works">
          <Projects />
        </section>

        {/* Tech Stack Section */}
        <section>
          <TechStack />
        </section>

        {/* Education Section */}
        <section>
          <Education />
        </section>

        {/* Achievements Section */}
        <section>
          <Achievements />
        </section>

        {/* Contact Section */}
        <section id="contact">
          <Contact />
        </section>
      </div>

      {/* Footer */}
      <Footer />

      {/* Fixed Bottom Navigation */}
      <Navigation activeSection={activeSection} />
    </div>
  );
}
