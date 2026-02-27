import { useState, useEffect } from 'react';
import { socialLinks } from '../data/socialLinks';

// ── Sub-components ────────────────────────────────────────────────────────────

function FooterLink({ href, label, external, muted }: {
  href: string; label: string; external?: boolean; muted?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`text-[13px] font-semibold hover:text-[#1e6ef4] transition-colors duration-200 w-fit ${
        muted ? 'text-black/60 dark:text-white/60' : 'footer-link text-black dark:text-white'
      }`}
    >
      {label}
    </a>
  );
}

function FooterColumn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[14px]">
      <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
        {label}
      </span>
      <nav className="flex flex-col gap-[10px]">{children}</nav>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch('https://api.counterapi.dev/v1/ram96com/visits/up', { signal: controller.signal })
      .then(r => r.json())
      .then(data => { if (data?.count) setVisitCount(data.count); })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));
    return () => controller.abort();
  }, []);

  return (
    <footer className="mt-[80px] pb-[100px]">
      <div className="container">
        <div className="rounded-[32px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[24px] md:p-[40px] subtle-border">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-[24px] md:gap-[40px]">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1 flex flex-col gap-[12px]">
              <h3 className="text-[15px] md:text-[16px] font-semibold text-black dark:text-white">
                Hi, I'm Ramanathan 👋
              </h3>
              <p className="text-[13px] text-black/35 dark:text-white/35 font-semibold">
                I build enterprise-grade AI products
              </p>
              <div className="w-[72px] h-[72px] md:w-[100px] md:h-[100px] mt-[8px] md:mt-[12px]">
                <img src="/images/avatar-laptop.jpg" alt="Ramanathan with laptop"
                  loading="lazy" decoding="async"
                  className="w-full h-full object-contain img-transition" />
              </div>
            </div>

            {/* Menu */}
            <FooterColumn label="Menu">
              <FooterLink href="#home"    label="Home"     />
              <FooterLink href="#works"   label="Projects" />
              <FooterLink href="#about"   label="About"    />
              <FooterLink href="#contact" label="Contact"  />
            </FooterColumn>

            {/* Connect */}
            <FooterColumn label="Connect">
              {socialLinks.map(l => (
                <FooterLink key={l.label} href={l.href} label={l.label} external />
              ))}
            </FooterColumn>

            {/* Experience */}
            <FooterColumn label="Experience">
              <FooterLink href="https://www.itcinfotech.com/" label="ITC Infotech" external muted />
              <FooterLink href="https://www.accenture.com/"   label="Accenture"    external muted />
              <FooterLink href="https://kaleidofin.com/"       label="Kaleidofin"   external muted />
            </FooterColumn>

          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-[10px] mt-[24px] md:mt-[40px] pt-[20px] border-t border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-[16px]">
              <span className="text-[11px] text-black/35 dark:text-white/35 font-semibold">
                © {currentYear}, Ramanathan Murugappan
              </span>
              {visitCount !== null && (
                <span className="text-[11px] text-black/25 dark:text-white/25 font-semibold">
                  ✦ {visitCount.toLocaleString()} visits
                </span>
              )}
            </div>
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
