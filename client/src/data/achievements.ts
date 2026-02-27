export interface Achievement {
  title: string;
  description: string;
  memojiPosition: 'left' | 'right';
  memojiImage: string;
  highlight?: string;
  link?: string;
}

export interface Publication {
  title: string;
  venue: string;
  link: string;
}

export const achievements: Achievement[] = [
  {
    title: '2 Publications 📚',
    description: 'IEEE & FICC Conference Papers',
    memojiPosition: 'left',
    memojiImage: '/images/avatar-hero.jpg',
    highlight: 'Research',
  },
  {
    title: 'GrowthX Winner 🏆',
    description: 'Scaled Blue Tokai revenue from ₹250 crore to ₹500 crore within 12 months. Won Capstone presenting to 1,000+ industry professionals.',
    memojiPosition: 'right',
    memojiImage: '/images/avatar-thinking.jpg',
    highlight: 'Strategy',
    link: 'https://www.linkedin.com/posts/ramanathan-murugappan-66a068125_our-journey-to-doubling-blue-tokais-revenue-activity-7222875771843796992-vy4b',
  },
  {
    title: '4 Certifications 🎓',
    description: 'Red Hat OpenShift, Google GenAI, Workera Analytics & Responsible AI',
    memojiPosition: 'left',
    memojiImage: '/images/avatar-coding.jpg',
    highlight: 'Certified',
  },
];

export const publications: Publication[] = [
  {
    title: 'A Two-Stage Machine Learning Approach to Forecast the Lifetime of Movies in a Multiplex',
    venue: 'FICC 2020, San Francisco, USA',
    link: 'https://link.springer.com/chapter/10.1007%2F978-3-030-39442-4_36',
  },
  {
    title: 'User-Independent Human Stress Detection',
    venue: "IEEE Intelligent Systems IS'20, Varna, Bulgaria",
    link: 'https://ieeexplore.ieee.org/abstract/document/9199928',
  },
];
