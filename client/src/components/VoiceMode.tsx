/**
 * VoiceMode — voice conversation panel rendered inside Chatbot.
 * Matches the iMessage-style theme (imsg-input grey surfaces) so it needs
 * no theme prop of its own — colors adapt via the .dark class on <html>.
 */

import { Mic, Volume2 } from 'lucide-react';

export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceModeProps {
  voiceStatus:     VoiceStatus;
  lastBotResponse: string;
  onToggle:        () => void;
}

const STATUS_LABELS: Record<VoiceStatus, string> = {
  idle:     'Tap mic to speak',
  listening:'Listening… (speak now)',
  thinking: 'Thinking…',
  speaking: 'Speaking… (tap to stop)',
};

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

export default function VoiceMode({ voiceStatus, lastBotResponse, onToggle }: VoiceModeProps) {
  const isActive = voiceStatus === 'listening' || voiceStatus === 'speaking';

  const buttonClass =
    voiceStatus === 'idle' ? 'imsg-input' : '';

  const buttonStyle: React.CSSProperties =
    voiceStatus === 'listening' ? { background: '#ef4444', color: '#fff', boxShadow: '0 0 28px rgba(239,68,68,0.45)', transform: 'scale(1.08)' } :
    voiceStatus === 'thinking'  ? { background: '#f59e0b', color: '#fff', boxShadow: '0 0 28px rgba(245,158,11,0.40)' } :
    voiceStatus === 'speaking'  ? { background: '#1e6ef4', color: '#fff', boxShadow: '0 0 28px rgba(30,110,244,0.40)' } :
    /* idle */                    { color: '#1e6ef4' };

  const pingColor = voiceStatus === 'listening' ? 'bg-red-400' : 'bg-[#1e6ef4]';

  const statusColorClass =
    voiceStatus === 'listening' ? '' :
    voiceStatus === 'speaking'  ? '' :
    voiceStatus === 'thinking'  ? '' :
    'chat-muted';

  const statusColor =
    voiceStatus === 'listening' ? '#ef4444' :
    voiceStatus === 'speaking'  ? '#1e6ef4' :
    voiceStatus === 'thinking'  ? '#f59e0b' :
    undefined;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">

      {/* Avatar */}
      <div className="w-[52px] h-[52px] rounded-full overflow-hidden">
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
          className={`relative z-10 w-[76px] h-[76px] rounded-full flex items-center justify-center transition-all duration-300 ${buttonClass}`}
          style={buttonStyle}
        >
          {voiceStatus === 'thinking'  && <WaveBars />}
          {voiceStatus === 'speaking'  && <Volume2 size={30} strokeWidth={2} />}
          {/* idle + listening both show mic */}
          {(voiceStatus === 'idle' || voiceStatus === 'listening') && <Mic size={30} strokeWidth={2} />}
        </button>
      </div>

      {/* Status label */}
      <p className={`text-[11px] font-semibold tracking-widest uppercase ${statusColorClass}`} style={statusColor ? { color: statusColor } : undefined}>
        {STATUS_LABELS[voiceStatus]}
      </p>

      {/* Last bot response */}
      {lastBotResponse && (
        <div className="imsg-input w-full rounded-[14px] px-[14px] py-[12px]" style={{ borderLeft: '3px solid #1e6ef4' }}>
          <p className="text-[11px] md:text-[12px] leading-[165%]">
            {lastBotResponse}
          </p>
        </div>
      )}
    </div>
  );
}
