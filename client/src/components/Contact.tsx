/**
 * Contact Component - Contact information and CTA
 * Features: Centered CTA with contact cards
 */

export default function Contact() {
  return (
    <div className="container flex flex-col gap-[40px]">
      {/* Section Header - Centered */}
      <div className="flex flex-col items-center text-center gap-[20px]">
        <span className="text-[11px] tracking-[0.08em] text-black/35 uppercase font-semibold">
          📬 Get In Touch
        </span>
        <h2 className="text-[40px] leading-[116%] tracking-[-0.02em] font-semibold">
          Let's Connect
        </h2>
        <p className="text-[16px] text-black/35 font-semibold max-w-[400px]">
          Open for AI/ML collaborations, research opportunities, and interesting projects
        </p>
        <a 
          href="mailto:ramanathanmurugappan29@gmail.com"
          className="inline-flex items-center justify-center px-[28px] py-[14px] rounded-[14px] bg-[#1e6ef4] text-white text-[14px] font-semibold hover:bg-[#1a5ecf] transition-all duration-200 hover:-translate-y-0.5"
        >
          Start a Conversation 💬
        </a>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
        {/* Email Card */}
        <a 
          href="mailto:ramanathanmurugappan29@gmail.com"
          className="group flex flex-col items-center gap-[6px] p-[28px] rounded-[24px] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-all duration-200 text-center"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          <span className="text-[24px] mb-[4px]">📧</span>
          <span className="text-[11px] tracking-[0.08em] text-black/35 uppercase font-semibold">
            Email
          </span>
          <span className="text-[14px] font-semibold group-hover:text-[#1e6ef4] transition-colors duration-200 break-all">
            ramanathanmurugappan29@gmail.com
          </span>
        </a>

        {/* Phone Card */}
        <a 
          href="tel:+919944466701"
          className="group flex flex-col items-center gap-[6px] p-[28px] rounded-[24px] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-all duration-200 text-center"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          <span className="text-[24px] mb-[4px]">📱</span>
          <span className="text-[11px] tracking-[0.08em] text-black/35 uppercase font-semibold">
            Phone
          </span>
          <span className="text-[14px] font-semibold group-hover:text-[#1e6ef4] transition-colors duration-200">
            +91 99 444 66 701
          </span>
        </a>

        {/* Location Card */}
        <div 
          className="flex flex-col items-center gap-[6px] p-[28px] rounded-[24px] bg-[#f7f7f7] text-center"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          <span className="text-[24px] mb-[4px]">📍</span>
          <span className="text-[11px] tracking-[0.08em] text-black/35 uppercase font-semibold">
            Location
          </span>
          <span className="text-[14px] font-semibold">
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
          className="inline-flex items-center justify-center px-[20px] py-[12px] rounded-[12px] bg-[#f7f7f7] text-[13px] font-semibold hover:bg-[#ebebeb] hover:text-[#1e6ef4] transition-all duration-200"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          LinkedIn
        </a>
        <a 
          href="https://github.com/ramanathanmurugappan"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-[20px] py-[12px] rounded-[12px] bg-[#f7f7f7] text-[13px] font-semibold hover:bg-[#ebebeb] hover:text-[#1e6ef4] transition-all duration-200"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          GitHub
        </a>
        <a 
          href="https://scholar.google.com/citations?user=YsEC2aEAAAAJ"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-[20px] py-[12px] rounded-[12px] bg-[#f7f7f7] text-[13px] font-semibold hover:bg-[#ebebeb] hover:text-[#1e6ef4] transition-all duration-200"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          Scholar
        </a>
        <a 
          href="https://resume-chatbot-9860.onrender.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-[20px] py-[12px] rounded-[12px] bg-[#1e6ef4] text-white text-[13px] font-semibold hover:bg-[#1a5ecf] transition-all duration-200"
        >
          ⚡ Try My Digital Clone
        </a>
      </div>
    </div>
  );
}
