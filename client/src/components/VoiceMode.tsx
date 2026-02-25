/**
 * VoiceMode — Voice conversation UI panel for the Chatbot.
 * Renders the mic button, status text, and last bot response.
 */

export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceModeProps {
  voiceStatus: VoiceStatus;
  lastBotResponse: string;
  onToggle: () => void;
}

const STATUS_TEXT: Record<VoiceStatus, string> = {
  idle: 'Tap mic to speak',
  listening: 'Listening... (speak now)',
  thinking: 'Thinking...',
  speaking: 'Speaking... (tap to stop)',
};

const MicIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const SpeakerIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

const WaveBars = ({ color = 'bg-white' }: { color?: string }) => (
  <div className="flex items-end gap-[3px]">
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className={`w-[3px] rounded-full ${color}`}
        style={{ animation: 'wave-bar 1s ease-in-out infinite', animationDelay: `${i * 0.12}s` }}
      />
    ))}
  </div>
);

export default function VoiceMode({ voiceStatus, lastBotResponse, onToggle }: VoiceModeProps) {
  const isActive = voiceStatus === 'listening' || voiceStatus === 'speaking';

  const buttonClass = voiceStatus === 'listening'
    ? 'bg-red-500 text-white scale-110 shadow-[0_0_32px_rgba(239,68,68,0.5)]'
    : voiceStatus === 'thinking'
    ? 'bg-amber-500 text-white shadow-[0_0_32px_rgba(245,158,11,0.4)]'
    : 'bg-gradient-to-br from-[#1e6ef4] to-[#4f46e5] text-white hover:scale-105 active:scale-95 shadow-[0_0_28px_rgba(30,110,244,0.4)]';

  const pingColor = voiceStatus === 'listening' ? 'bg-red-500' : 'bg-[#1e6ef4]';

  const statusColor = voiceStatus === 'listening' ? 'text-red-500'
    : voiceStatus === 'speaking' ? 'text-[#1e6ef4]'
    : voiceStatus === 'thinking' ? 'text-amber-500'
    : 'text-black/35 dark:text-white/35';

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f6f6f7] dark:bg-[#0a0a0a] p-6 gap-5">
      {/* Mic button with pulse rings */}
      <div className="relative">
        {isActive && (
          <>
            <div className={`absolute -inset-6 rounded-full animate-ping opacity-20 ${pingColor}`} style={{ animationDuration: '2s' }} />
            <div className={`absolute -inset-3 rounded-full animate-ping opacity-30 ${pingColor}`} style={{ animationDuration: '1.5s' }} />
          </>
        )}
        <button
          onClick={onToggle}
          className={`relative z-10 w-[80px] h-[80px] rounded-full flex items-center justify-center transition-all duration-300 ${buttonClass}`}
        >
          {voiceStatus === 'listening' && <MicIcon />}
          {voiceStatus === 'thinking' && <WaveBars />}
          {voiceStatus === 'speaking' && <SpeakerIcon />}
          {voiceStatus === 'idle' && <MicIcon />}
        </button>
      </div>

      {/* Status label */}
      <p className={`text-[12px] font-semibold tracking-wide uppercase ${statusColor}`}>
        {STATUS_TEXT[voiceStatus]}
      </p>

      {/* Last bot response */}
      {lastBotResponse && (
        <div className="w-full bg-white dark:bg-[#1c1c1e] rounded-[16px] p-[14px] border-l-2 border-[#1e6ef4] shadow-sm">
          <p className="text-[11px] md:text-[12px] text-black/60 dark:text-white/60 leading-[165%]">
            {lastBotResponse}
          </p>
        </div>
      )}
    </div>
  );
}
