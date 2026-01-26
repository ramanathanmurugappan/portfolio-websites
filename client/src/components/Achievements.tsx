/**
 * Achievements Component - Stats and accomplishments showcase
 * Features: Stacked cards with avatar characters and achievements
 */

interface Achievement {
  title: string;
  description: string;
  memojiPosition: 'left' | 'right';
  memojiImage: string;
  highlight?: string;
  link?: string;
}

const achievements: Achievement[] = [
  { 
    title: '2 Publications 📚', 
    description: 'IEEE & FICC Conference Papers', 
    memojiPosition: 'left',
    memojiImage: '/images/avatar-hero.png',
    highlight: 'Research'
  },
  { 
    title: 'GrowthX Winner 🏆', 
    description: 'Scaled Blue Tokai revenue from ₹250 crore to ₹500 crore within 12 months. Won Capstone presenting to 1,000+ industry professionals.', 
    memojiPosition: 'right',
    memojiImage: '/images/avatar-thinking.png',
    highlight: 'Strategy',
    link: 'https://www.linkedin.com/posts/ramanathan-murugappan-66a068125_our-journey-to-doubling-blue-tokais-revenue-activity-7222875771843796992-vy4b'
  },
  { 
    title: '4 Certifications 🎓', 
    description: 'Red Hat OpenShift, Google GenAI, Workera Analytics & Responsible AI', 
    memojiPosition: 'left',
    memojiImage: '/images/avatar-coding.png',
    highlight: 'Certified'
  },
];

const publications = [
  {
    title: 'A Two-Stage Machine Learning Approach to Forecast the Lifetime of Movies in a Multiplex',
    venue: 'FICC 2020, San Francisco, USA',
    link: 'https://link.springer.com/chapter/10.1007%2F978-3-030-39442-4_36',
  },
  {
    title: 'User-Independent Human Stress Detection',
    venue: 'IEEE Intelligent Systems IS\'20, Varna, Bulgaria',
    link: 'https://ieeexplore.ieee.org/abstract/document/9199928',
  },
];

export default function Achievements() {
  return (
    <div className="container flex flex-col gap-[40px]">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center gap-[8px]">
        <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
          🏅 Achievements
        </span>
        <h2 className="text-[40px] leading-[116%] tracking-[-0.02em] font-semibold">
          Highlights & Publications
        </h2>
      </div>

      {/* Achievement Cards */}
      <div className="flex flex-col gap-[14px]">
        {achievements.map((achievement) => (
          <div 
            key={achievement.title}
            className="rounded-[32px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[40px] flex items-center justify-between min-h-[160px] relative overflow-hidden achievement-card"
            style={{ border: '1px solid rgba(0,0,0,0.04)' }}
          >
            {/* Avatar on Left */}
            {achievement.memojiPosition === 'left' && (
              <div className="w-[140px] h-[140px] flex-shrink-0 -ml-[10px] rounded-[20px] overflow-hidden" style={{ backgroundColor: '#E8E0F0' }}>
                <img 
                  src={achievement.memojiImage} 
                  alt="Ramanathan"
                  className="w-full h-full object-contain img-transition"
                />
              </div>
            )}

            {/* Stats */}
            <div className={`flex flex-col gap-[6px] flex-1 ${
              achievement.memojiPosition === 'left' ? 'text-right pr-[40px]' : 'text-left pl-[40px]'
            }`}>
              {achievement.highlight && (
                <span 
                  className="inline-flex px-[10px] py-[4px] rounded-[8px] bg-white dark:bg-[#0f0f0f] text-[10px] tracking-[0.02em] font-semibold w-fit mb-[4px]"
                  style={{ 
                    border: '1px solid rgba(0,0,0,0.04)',
                    marginLeft: achievement.memojiPosition === 'left' ? 'auto' : '0'
                  }}
                >
                  {achievement.highlight}
                </span>
              )}
              <span className="text-[36px] leading-[100%] tracking-[-0.03em] font-semibold text-black dark:text-white">
                {achievement.title}
              </span>
              <span className="text-[13px] text-black/50 dark:text-white/50 font-semibold max-w-[400px]" style={{
                marginLeft: achievement.memojiPosition === 'left' ? 'auto' : '0'
              }}>
                {achievement.description}
              </span>
              {achievement.link && (
                <a 
                  href={achievement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#1e6ef4] font-semibold mt-[4px] hover:underline"
                  style={{
                    marginLeft: achievement.memojiPosition === 'left' ? 'auto' : '0'
                  }}
                >
                  View LinkedIn Post →
                </a>
              )}
            </div>

            {/* Avatar on Right */}
            {achievement.memojiPosition === 'right' && (
              <div className="w-[140px] h-[140px] flex-shrink-0 -mr-[10px] rounded-[20px] overflow-hidden" style={{ backgroundColor: '#E8E0F0' }}>
                <img 
                  src={achievement.memojiImage} 
                  alt="Ramanathan"
                  className="w-full h-full object-contain img-transition"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Publications Section */}
      <div className="flex flex-col gap-[20px] mt-[20px]">
        <h3 className="text-[24px] leading-[116%] tracking-[-0.02em] font-semibold text-center">
          📄 Research Publications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
          {publications.map((pub, index) => (
            <a 
              key={index}
              href={pub.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[24px] bg-[#f7f7f7] dark:bg-[#1a1a1a] p-[28px] flex flex-col gap-[12px] card-hover group"
              style={{ border: '1px solid rgba(0,0,0,0.04)' }}
            >
              <span className="text-[11px] tracking-[0.08em] text-[#1e6ef4] uppercase font-semibold">
                📄 Published Paper
              </span>
              <h4 className="text-[14px] leading-[140%] font-semibold group-hover:text-[#1e6ef4] transition-colors duration-200 text-black dark:text-white">
                {pub.title}
              </h4>
              <span className="text-[12px] text-black/35 dark:text-white/35 font-semibold">
                {pub.venue}
              </span>
              <span className="text-[11px] text-[#1e6ef4] font-semibold mt-auto">
                Read Paper →
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
