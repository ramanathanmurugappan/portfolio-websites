/**
 * Contact Component - Contact information and CTA
 * Features: Centered CTA with contact cards
 */

export default function Contact() {
  return (
    <div className="container flex flex-col gap-[40px]">
      {/* Section Header - Centered */}
      <div className="flex flex-col items-center text-center gap-[20px]">
        <h2 className="text-[24px] leading-[116%] tracking-[-0.02em] font-semibold">
          📬 Get In Touch
        </h2>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
        {/* Email Card */}
        <a 
          href="mailto:ramanathanmurugappan29@gmail.com"
          className="group flex flex-col items-center gap-[6px] p-[28px] rounded-[24px] bg-[#f7f7f7] dark:bg-[#1a1a1a] hover:bg-[#ebebeb] dark:hover:bg-[#252525] transition-all duration-200 text-center"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          <span className="text-[24px] mb-[4px]">📧</span>
          <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
            Email
          </span>
          <span className="text-[14px] font-semibold group-hover:text-[#1e6ef4] transition-colors duration-200 break-all text-black dark:text-white">
            ramanathanmurugappan29@gmail.com
          </span>
        </a>

        {/* Phone Card */}
        <a 
          href="tel:+919944466701"
          className="group flex flex-col items-center gap-[6px] p-[28px] rounded-[24px] bg-[#f7f7f7] dark:bg-[#1a1a1a] hover:bg-[#ebebeb] dark:hover:bg-[#252525] transition-all duration-200 text-center"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          <span className="text-[24px] mb-[4px]">📱</span>
          <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
            Phone
          </span>
          <span className="text-[14px] font-semibold group-hover:text-[#1e6ef4] transition-colors duration-200 text-black dark:text-white">
            +91 99 444 66 701
          </span>
        </a>

        {/* Location Card */}
        <div 
          className="flex flex-col items-center gap-[6px] p-[28px] rounded-[24px] bg-[#f7f7f7] dark:bg-[#1a1a1a] text-center"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          <span className="text-[24px] mb-[4px]">📍</span>
          <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
            Location
          </span>
          <span className="text-[14px] font-semibold text-black dark:text-white">
            Bengaluru, India
          </span>
        </div>
      </div>

      {/* Social Links */}
      <div className="flex justify-center gap-[12px]">
        <a 
          href="https://www.linkedin.com/in/ramanathan-murugappan-66a068125/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-[20px] py-[12px] rounded-[12px] bg-[#f7f7f7] dark:bg-[#1a1a1a] text-black dark:text-white text-[13px] font-semibold hover:bg-[#ebebeb] dark:hover:bg-[#252525] hover:text-[#1e6ef4] dark:hover:text-[#1e6ef4] transition-all duration-200"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          LinkedIn
        </a>
        <a 
          href="https://github.com/ramanathanmurugappan"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-[20px] py-[12px] rounded-[12px] bg-[#f7f7f7] dark:bg-[#1a1a1a] text-black dark:text-white text-[13px] font-semibold hover:bg-[#ebebeb] dark:hover:bg-[#252525] hover:text-[#1e6ef4] dark:hover:text-[#1e6ef4] transition-all duration-200"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          GitHub
        </a>
        <a 
          href="https://scholar.google.com/citations?user=YsEC2aEAAAAJ"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-[20px] py-[12px] rounded-[12px] bg-[#f7f7f7] dark:bg-[#1a1a1a] text-black dark:text-white text-[13px] font-semibold hover:bg-[#ebebeb] dark:hover:bg-[#252525] hover:text-[#1e6ef4] dark:hover:text-[#1e6ef4] transition-all duration-200"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          Scholar
        </a>

      </div>
    </div>
  );
}
