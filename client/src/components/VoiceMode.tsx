/**
 * VoiceMode — voice conversation panel rendered inside Chatbot.
 * Receives isDark from parent so it can share the same neumorphic palette
 * without importing useTheme again.
 */

import { nmTheme } from '@/lib/nmTheme';

export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceModeProps {
  voiceStatus:     VoiceStatus;
  lastBotResponse: string;
  onToggle:        () => void;
  isDark?:         boolean;
}

const STATUS_LABELS: Record<VoiceStatus, string> = {
  idle:     'Tap mic to speak',
  listening:'Listening… (speak now)',
  thinking: 'Thinking…',
  speaking: 'Speaking… (tap to stop)',
};

// ── Icon components ───────────────────────────────────────────────────────────

function MicIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8"  y1="23" x2="16" y2="23"/>
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  );
}

function WaveBars() {
  return (
    <div className="flex items-end gap-[3px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: '#f59e0b', animation: 'wave-bar 1s ease-in-out infinite', animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VoiceMode({ voiceStatus, lastBotResponse, onToggle, isDark = false }: VoiceModeProps) {
  const nm      = nmTheme(isDark);
  const isActive = voiceStatus === 'listening' || voiceStatus === 'speaking';

  const buttonStyle: React.CSSProperties =
    voiceStatus === 'listening' ? { background: '#ef4444', color: '#fff', boxShadow: '0 0 28px rgba(239,68,68,0.45)',     transform: 'scale(1.08)' } :
    voiceStatus === 'thinking'  ? { background: '#f59e0b', color: '#fff', boxShadow: '0 0 28px rgba(245,158,11,0.40)' } :
    voiceStatus === 'speaking'  ? { background: 'linear-gradient(135deg,#1e6ef4,#4f46e5)', color: '#fff', boxShadow: '0 0 28px rgba(30,110,244,0.40)' } :
    /* idle */                    { background: nm.bg,     color: '#1e6ef4', boxShadow: nm.raised(8) };

  const pingColor = voiceStatus === 'listening' ? 'bg-red-400' : 'bg-[#1e6ef4]';

  const statusColor =
    voiceStatus === 'listening' ? '#ef4444' :
    voiceStatus === 'speaking'  ? '#1e6ef4' :
    voiceStatus === 'thinking'  ? '#f59e0b' :
    nm.faint;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6" style={{ background: nm.bg }}>

      {/* Avatar */}
      <div className="w-[52px] h-[52px] rounded-[14px] overflow-hidden" style={{ boxShadow: nm.raised(4) }}>
        <img src="/images/avatar-hero.jpg" alt="Ramanathan" className="w-full h-full object-cover object-top" />
      </div>

      {/* Mic button with pulse rings */}
      <div className="relative">
        {isActive && (
          <>
            <div className={`absolute -inset-6 rounded-full animate-ping opacity-15 ${pingColor}`} style={{ animationDuration: '2s' }} />
            <div className={`absolute -inset-3 rounded-full animate-ping opacity-25 ${pingColor}`} style={{ animationDuration: '1.5s' }} />
          </>
        )}
        <button
          onClick={onToggle}
          className="relative z-10 w-[76px] h-[76px] rounded-full flex items-center justify-center transition-all duration-300"
          style={buttonStyle}
        >
          {voiceStatus === 'thinking'  && <WaveBars />}
          {voiceStatus === 'speaking'  && <SpeakerIcon />}
          {/* idle + listening both show mic */}
          {(voiceStatus === 'idle' || voiceStatus === 'listening') && <MicIcon />}
        </button>
      </div>

      {/* Status label */}
      <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: statusColor }}>
        {STATUS_LABELS[voiceStatus]}
      </p>

      {/* Last bot response */}
      {lastBotResponse && (
        <div
          className="w-full rounded-[14px] px-[14px] py-[12px]"
          style={{ background: nm.bg, boxShadow: nm.inset(4), borderLeft: '3px solid #1e6ef4' }}
        >
          <p className="text-[11px] md:text-[12px] leading-[165%]" style={{ color: nm.text }}>
            {lastBotResponse}
          </p>
        </div>
      )}
    </div>
  );
}
