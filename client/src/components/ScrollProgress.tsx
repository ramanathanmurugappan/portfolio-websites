/**
 * ScrollProgress — thin accent line at top of viewport that fills as user scrolls.
 * Seen on award-winning Awwwards/CSS Design Award portfolios.
 */

import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      setProgress(total > 0 ? (scrollTop / total) * 100 : 0);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-[60] h-[2px] pointer-events-none"
      style={{
        width: `${progress}%`,
        maxWidth: '100%',
        background: 'linear-gradient(90deg, #1e6ef4, #6366f1)',
        transition: 'width 60ms linear',
      }}
    />
  );
}
