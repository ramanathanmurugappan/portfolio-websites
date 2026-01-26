/**
 * Certifications Component - Professional certifications
 * Features: Certification cards with links
 */

interface Certification {
  name: string;
  issuer: string;
  link: string;
  icon: string;
}

const certifications: Certification[] = [
  {
    name: 'Red Hat Certified Specialist in OpenShift Administration',
    issuer: 'Red Hat',
    link: 'https://www.credly.com/badges/45ce2f1f-f165-4b63-9847-84b3ad080282/linked_in_profile',
    icon: '🎖️',
  },
  {
    name: 'Generative AI for Developers',
    issuer: 'Google',
    link: 'https://www.cloudskillsboost.google/public_profiles/32dcaf29-8b49-4884-8e25-951c744f228d',
    icon: '🤖',
  },
  {
    name: 'Advanced Analytics for Data Scientists',
    issuer: 'Workera',
    link: 'https://www.linkedin.com/in/ramanathan-murugappan-66a068125/details/certifications/',
    icon: '📊',
  },
  {
    name: 'Responsible AI',
    issuer: 'Workera',
    link: 'https://www.linkedin.com/in/ramanathan-murugappan-66a068125/details/certifications/',
    icon: '🛡️',
  },
];

export default function Certifications() {
  return (
    <div className="container flex flex-col gap-[40px]">
      {/* Section Header */}
      <div className="flex flex-col gap-[8px]">
        <span className="text-[11px] tracking-[0.08em] text-black/35 uppercase font-semibold">
          🏅 Certifications
        </span>
        <h2 className="text-[40px] leading-[116%] tracking-[-0.02em] font-semibold">
          Professional Credentials
        </h2>
      </div>

      {/* Certifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
        {certifications.map((cert, index) => (
          <a 
            key={index}
            href={cert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-[24px] bg-[#f7f7f7] p-[28px] flex items-start gap-[16px] card-hover"
            style={{ border: '1px solid rgba(0,0,0,0.04)' }}
          >
            <div 
              className="w-[48px] h-[48px] rounded-[12px] bg-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
              style={{ border: '1px solid rgba(0,0,0,0.04)' }}
            >
              <span className="text-[24px]">{cert.icon}</span>
            </div>
            <div className="flex flex-col gap-[4px]">
              <h3 className="text-[14px] font-semibold group-hover:text-[#1e6ef4] transition-colors duration-200">
                {cert.name}
              </h3>
              <span className="text-[12px] text-black/35 font-semibold">
                {cert.issuer}
              </span>
              <span className="text-[11px] text-[#1e6ef4] font-semibold mt-[4px]">
                View Credential →
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
