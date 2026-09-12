/**
 * VoiceMode — voice conversation panel rendered inside Chatbot.
 * Matches the iMessage-style theme (imsg-input grey surfaces) so it needs
 * no theme prop of its own — colors adapt via the .dark class on <html>.
 */

import { Mic, RotateCcw, Volume2 } from 'lucide-react';

export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceModeProps {
  voiceStatus:     VoiceStatus;
  /** 0-1 live mic input level while listening — drives the real-time reactive ring. */
  micLevel:        number;
  lastBotResponse: string;
  onToggle:        () => void;
  /** Omit to hide the control — passed only once there's history worth clearing. */
  onNewChat?:      () => void;
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

export default function VoiceMode({ voiceStatus, micLevel, lastBotResponse, onToggle, onNewChat }: VoiceModeProps) {
  const buttonClass =
    voiceStatus === 'idle' ? 'imsg-input' : '';

  const buttonStyle: React.CSSProperties =
    voiceStatus === 'listening' ? { background: '#ef4444', color: '#fff', boxShadow: '0 0 28px rgba(239,68,68,0.45)', transform: 'scale(1.08)' } :
    voiceStatus === 'thinking'  ? { background: '#f59e0b', color: '#fff', boxShadow: '0 0 28px rgba(245,158,11,0.40)' } :
    voiceStatus === 'speaking'  ? { background: '#1e6ef4', color: '#fff', boxShadow: '0 0 28px rgba(30,110,244,0.40)' } :
    /* idle */                    { color: '#1e6ef4' };

  // Ambient rings around the mic take their color from whatever's happening —
  // calm blue at rest, red while listening, amber while thinking.
  const ringColor =
    voiceStatus === 'listening' ? 'bg-red-400' :
    voiceStatus === 'thinking'  ? 'bg-amber-400' :
    'bg-[#1e6ef4]'; // idle + speaking

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
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 relative">

      {/* New conversation — reachable from voice mode too, not just chat */}
      {onNewChat && (
        <button
          type="button"
          onClick={onNewChat}
          className="agent-chip absolute top-3 right-3 w-[28px] h-[28px] rounded-full flex items-center justify-center"
          title="New conversation"
        >
          <RotateCcw size={12} strokeWidth={2.4} />
        </button>
      )}

      {/* Mic button — always ringed with ambient motion so the panel feels alive,
          not just when something's actively happening */}
      <div className="relative">
        {voiceStatus === 'listening' ? (
          // Driven by the actual mic input level, sampled live — the ring visibly
          // moves with your voice as you talk, rather than looping on its own clock.
          <div
            className={`absolute -inset-4 rounded-full ${ringColor}`}
            style={{
              transform: `scale(${1 + micLevel * 0.6})`,
              opacity: 0.15 + micLevel * 0.35,
              transition: 'transform 60ms linear, opacity 60ms linear',
            }}
          />
        ) : voiceStatus === 'speaking' ? (
          <>
            <div className={`absolute -inset-7 rounded-full animate-ping opacity-15 ${ringColor}`} style={{ animationDuration: '2s' }} />
            <div className={`absolute -inset-4 rounded-full animate-ping opacity-25 ${ringColor}`} style={{ animationDuration: '1.5s' }} />
          </>
        ) : (
          <>
            <div className={`absolute -inset-7 rounded-full voice-breathe ${ringColor}`} />
            <div className={`absolute -inset-4 rounded-full voice-breathe ${ringColor}`} style={{ animationDelay: '0.5s' }} />
          </>
        )}
        <button
          onClick={onToggle}
          className={`relative z-10 w-[84px] h-[84px] rounded-full flex items-center justify-center transition-all duration-300 ${buttonClass}`}
          style={buttonStyle}
        >
          {voiceStatus === 'thinking'  && <WaveBars />}
          {voiceStatus === 'speaking'  && <Volume2 size={32} strokeWidth={2} />}
          {/* idle + listening both show mic */}
          {(voiceStatus === 'idle' || voiceStatus === 'listening') && <Mic size={32} strokeWidth={2} />}
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
