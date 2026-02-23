/**
 * Footer Component - Site footer with navigation and social links
 * Features: Multi-column layout with avatar, menu, social, and explore links
 */

import { socialLinks } from '../data/socialLinks';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-[80px] pb-[100px]">
      <div className="container">
        <div className="rounded-[32px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[40px] subtle-border">
          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[40px]">
            {/* Brand Column */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="text-[16px] font-semibold">
                Hi, I'm Ramanathan 👋
              </h3>
              <p className="text-[13px] text-black/35 dark:text-white/35 font-semibold">
                I build enterprise-grade AI products
              </p>
              <div className="w-[100px] h-[100px] mt-[12px]">
                <img 
                  src="/images/avatar-laptop.png" 
                  alt="Ramanathan with laptop"
                  className="w-full h-full object-contain img-transition"
                />
              </div>
            </div>

            {/* Menu Column */}
            <div className="flex flex-col gap-[14px]">
              <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
                Menu
              </span>
              <nav className="flex flex-col gap-[10px]">
                <a href="#home" className="text-[13px] font-semibold footer-link text-black dark:text-white hover:text-[#1e6ef4] transition-colors duration-200 w-fit">
                  Home
                </a>
                <a href="#works" className="text-[13px] font-semibold footer-link text-black dark:text-white hover:text-[#1e6ef4] transition-colors duration-200 w-fit">
                  Projects
                </a>
                <a href="#about" className="text-[13px] font-semibold footer-link text-black dark:text-white hover:text-[#1e6ef4] transition-colors duration-200 w-fit">
                  About
                </a>
                <a href="#contact" className="text-[13px] font-semibold footer-link text-black dark:text-white hover:text-[#1e6ef4] transition-colors duration-200 w-fit">
                  Contact
                </a>
              </nav>
            </div>

            {/* Connect Column */}
            <div className="flex flex-col gap-[14px]">
              <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
                Connect
              </span>
              <nav className="flex flex-col gap-[10px]">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-semibold footer-link text-black dark:text-white hover:text-[#1e6ef4] transition-colors duration-200 w-fit"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Experience Column */}
            <div className="flex flex-col gap-[14px]">
              <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
                Experience
              </span>
              <nav className="flex flex-col gap-[10px]">
                <a 
                  href="https://www.itcinfotech.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold text-black/60 dark:text-white/60 hover:text-[#1e6ef4] transition-colors duration-200"
                >
                  ITC Infotech
                </a>
                <a 
                  href="https://www.accenture.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold text-black/60 dark:text-white/60 hover:text-[#1e6ef4] transition-colors duration-200"
                >
                  Accenture
                </a>
                <a 
                  href="https://kaleidofin.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold text-black/60 dark:text-white/60 hover:text-[#1e6ef4] transition-colors duration-200"
                >
                  Kaleidofin
                </a>
              </nav>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-[14px] mt-[40px] pt-[20px] border-t border-black/[0.06] dark:border-white/[0.06]">
            <span className="text-[11px] text-black/35 dark:text-white/35 font-semibold">
              © {currentYear}, Ramanathan Murugappan
            </span>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[11px] text-black/35 dark:text-white/35 font-semibold hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
