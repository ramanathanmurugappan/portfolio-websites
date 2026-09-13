/**
 * VoiceMode — voice conversation panel rendered inside Chatbot.
 * Matches the iMessage-style theme (imsg-input grey surfaces) so it needs
 * no theme prop of its own — colors adapt via the .dark class on <html>.
 *
 * Laid out like an actual video call (FaceTime/Meet), not a chat card with a
 * small avatar pasted in: the video fills the whole panel edge-to-edge, the
 * bot's reply appears as a caption overlay at the bottom (like live captions
 * in a real call) instead of a separate boxed panel, and the active state
 * (listening/thinking/speaking) shows as a colored ring around the video
 * frame — the same convention video-call apps use to highlight who's talking.
 *
 * The avatar is a real short video (Runway image-to-video from the site's
 * avatar photo) — it loops while the bot is speaking and holds on its first
 * frame otherwise. The clip (public/video/avatar-talk-loop.mp4) is a 2.8s
 * segment cut from a longer 10s render: every frame pair in the original was
 * diffed to find the closest visual match, so this loops smoothly instead of
 * hard-cutting back to frame 0 every 10 seconds.
 */

import { useEffect, useRef } from 'react';
import { Mic, RotateCcw, Volume2 } from 'lucide-react';

export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceModeProps {
  voiceStatus:     VoiceStatus;
  /** 0-1 live mic input level while listening — drives the live ring reaction. */
  micLevel:        number;
  lastBotResponse: string;
  onToggle:        () => void;
  /** Omit to hide the control — passed only once there's history worth clearing. */
  onNewChat?:      () => void;
}

const STATUS_LABELS: Record<VoiceStatus, string> = {
  idle:     'Tap to talk',
  listening:'Listening…',
  thinking: 'Thinking…',
  speaking: 'Speaking…',
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
  const videoRef = useRef<HTMLVideoElement>(null);

  // The video only actually plays while the bot is talking — otherwise it holds
  // on frame 0, same "freeze at rest" behavior validated in the lab prototype.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (voiceStatus === 'speaking') {
      el.currentTime = 0;
      el.play().catch(() => { /* autoplay can be blocked before any user gesture; harmless here */ });
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [voiceStatus]);

  // Ring color around the video tile — same convention Zoom/Meet use to highlight
  // whoever's talking, doubling as the state indicator the mic button used to carry alone.
  const ringColor =
    voiceStatus === 'listening' ? '239,68,68' :
    voiceStatus === 'thinking'  ? '245,158,11' :
    '30,110,244'; // idle + speaking
  const ringOpacity = voiceStatus === 'listening' ? 0.55 + micLevel * 0.4 : voiceStatus === 'idle' ? 0.35 : 0.7;

  const micButtonStyle: React.CSSProperties =
    voiceStatus === 'listening' ? { background: '#ef4444', color: '#fff' } :
    voiceStatus === 'thinking'  ? { background: '#f59e0b', color: '#fff' } :
    /* idle + speaking */         { background: '#1e6ef4', color: '#fff' };

  return (
    <div
      className="flex-1 relative overflow-hidden transition-shadow duration-300"
      style={{ boxShadow: `inset 0 0 0 3px rgba(${ringColor},${ringOpacity})` }}
    >
      {/* Full-bleed video — this IS the panel, not a card floating inside it */}
      <video
        ref={videoRef}
        src="/video/avatar-talk-loop.mp4"
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* New conversation — overlaid, own scrim so it stays legible over any video frame */}
      {onNewChat && (
        <button
          type="button"
          onClick={onNewChat}
          className="absolute top-3 right-3 w-[28px] h-[28px] rounded-full flex items-center justify-center z-10 bg-black/45 text-white backdrop-blur-sm"
          title="New conversation"
        >
          <RotateCcw size={12} strokeWidth={2.4} />
        </button>
      )}

      {/* Bottom caption + control bar — live-caption style, like a real video call */}
      <div className="absolute bottom-0 inset-x-0 flex flex-col items-center gap-[10px] px-4 pt-12 pb-4"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.45) 55%, transparent)' }}
      >
        {lastBotResponse && (
          <p className="text-white text-[11.5px] leading-[150%] text-center overflow-y-auto" style={{ maxHeight: '4.5em' }}>
            {lastBotResponse}
          </p>
        )}
        <p className="text-white/75 text-[10px] font-semibold tracking-widest uppercase">
          {STATUS_LABELS[voiceStatus]}
        </p>
        <button
          onClick={onToggle}
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center transition-colors duration-300"
          style={micButtonStyle}
        >
          {voiceStatus === 'thinking'  && <WaveBars />}
          {voiceStatus === 'speaking'  && <Volume2 size={17} strokeWidth={2.4} />}
          {/* idle + listening both show mic */}
          {(voiceStatus === 'idle' || voiceStatus === 'listening') && <Mic size={17} strokeWidth={2.4} />}
        </button>
      </div>
    </div>
  );
}
