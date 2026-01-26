/**
 * Footer Component - Site footer with navigation and social links
 * Features: Multi-column layout with avatar, menu, social, and explore links
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-[80px] pb-[100px]">
      <div className="container">
        <div 
          className="rounded-[32px] bg-[#f7f7f7] p-[40px]"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[40px]">
            {/* Brand Column */}
            <div className="flex flex-col gap-[12px]">
              <h3 className="text-[16px] font-semibold">
                Hi, I'm Ramanathan 👋
              </h3>
              <p className="text-[13px] text-black/35 font-semibold">
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
              <span className="text-[11px] tracking-[0.08em] text-black/35 uppercase font-semibold">
                Menu
              </span>
              <nav className="flex flex-col gap-[10px]">
                <a href="#home" className="text-[13px] font-semibold footer-link hover:text-[#1e6ef4] transition-colors duration-200 w-fit">
                  Home
                </a>
                <a href="#works" className="text-[13px] font-semibold footer-link hover:text-[#1e6ef4] transition-colors duration-200 w-fit">
                  Projects
                </a>
                <a href="#about" className="text-[13px] font-semibold footer-link hover:text-[#1e6ef4] transition-colors duration-200 w-fit">
                  About
                </a>
                <a href="#contact" className="text-[13px] font-semibold footer-link hover:text-[#1e6ef4] transition-colors duration-200 w-fit">
                  Contact
                </a>
              </nav>
            </div>

            {/* Connect Column */}
            <div className="flex flex-col gap-[14px]">
              <span className="text-[11px] tracking-[0.08em] text-black/35 uppercase font-semibold">
                Connect
              </span>
              <nav className="flex flex-col gap-[10px]">
                <a 
                  href="https://www.linkedin.com/in/ramanathan-murugappan-66a068125/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold footer-link hover:text-[#1e6ef4] transition-colors duration-200 w-fit"
                >
                  LinkedIn
                </a>
                <a 
                  href="https://github.com/ramanathanmurugappan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold footer-link hover:text-[#1e6ef4] transition-colors duration-200 w-fit"
                >
                  GitHub
                </a>
                <a 
                  href="https://scholar.google.com/citations?user=YsEC2aEAAAAJ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold footer-link hover:text-[#1e6ef4] transition-colors duration-200 w-fit"
                >
                  Google Scholar
                </a>
                <a 
                  href="https://resume-chatbot-9860.onrender.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold footer-link hover:text-[#1e6ef4] transition-colors duration-200 w-fit"
                >
                  ⚡ Digital Clone
                </a>
              </nav>
            </div>

            {/* Experience Column */}
            <div className="flex flex-col gap-[14px]">
              <span className="text-[11px] tracking-[0.08em] text-black/35 uppercase font-semibold">
                Experience
              </span>
              <nav className="flex flex-col gap-[10px]">
                <a 
                  href="https://www.itcinfotech.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold text-black/60 hover:text-[#1e6ef4] transition-colors duration-200"
                >
                  ITC Infotech
                </a>
                <a 
                  href="https://www.accenture.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold text-black/60 hover:text-[#1e6ef4] transition-colors duration-200"
                >
                  Accenture
                </a>
                <a 
                  href="https://kaleidofin.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold text-black/60 hover:text-[#1e6ef4] transition-colors duration-200"
                >
                  Kaleidofin
                </a>
              </nav>
            </div>
          </div>

          {/* Footer Bottom */}
          <div 
            className="flex flex-col md:flex-row items-center justify-between gap-[14px] mt-[40px] pt-[20px]"
            style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
          >
            <span className="text-[11px] text-black/35 font-semibold">
              © {currentYear}, Ramanathan Murugappan
            </span>
            <span className="text-[11px] text-black/35 font-semibold italic">
              "I trained an AI on myself. It's almost as good as the real thing."
            </span>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[11px] text-black/35 font-semibold hover:text-black transition-colors duration-200"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
