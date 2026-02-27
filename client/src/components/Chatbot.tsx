/**
 * Chatbot — floating AI chat widget.
 *
 * This file is render-only: all business logic lives in useChatLogic.
 * Supports two modes:
 *   text  — suggested chips, typing reveal, easter egg, localStorage history
 *   voice — Deepgram STT → Groq LLM → VoiceRSS TTS
 *
 * Visual theme: neumorphic (light #e8e8ec / dark #1e1e22), blue accent #1e6ef4.
 * Theme adapts automatically via useTheme + nmTheme utility.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { nmTheme } from '@/lib/nmTheme';
import { useChatLogic, SUGGESTED_QUESTIONS, CONFETTI_COLORS } from '@/hooks/useChatLogic';
import VoiceMode from './VoiceMode';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatbotProps {
  isOpen?:   boolean;
  onToggle?: (isOpen: boolean) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Rotating mic SVG icon reused in both dictation button and send area. */
function MicSVG() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8"  y1="23" x2="16" y2="23"/>
    </svg>
  );
}

/** Arrow-up SVG for the send button. */
function SendSVG() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2"  x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

/** Small avatar image used beside each bot message and in the typing indicator. */
function BotAvatar({ shadow }: { shadow: string }) {
  return (
    <div className="w-[26px] h-[26px] rounded-[8px] overflow-hidden flex-shrink-0" style={{ boxShadow: shadow }}>
      <img src="/images/avatar-hero.jpg" alt="Ramanathan" className="w-full h-full object-cover object-top" />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Chatbot({ isOpen: externalIsOpen, onToggle }: ChatbotProps = {}) {
  const { theme } = useTheme();
  const isDark    = theme === 'dark';
  const nm        = nmTheme(isDark);

  const {
    isOpen, setIsOpen,
    messages, input, setInput, loading,
    chatMode, setChatMode,
    speakingMessageId,
    isDictating, voiceStatus, lastBotResponse,
    displayContents, confettiId,
    messagesEndRef,
    getDisplayText, sendMessage, handleSendMessage, handleNewChat,
    handleSpeak, toggleDictation, toggleListening,
  } = useChatLogic({ externalIsOpen, onToggle });

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 w-[320px] max-w-[calc(100vw-32px)] md:max-w-[calc(100vw-48px)]">

      {/* ── Chat window ──────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="mb-3 rounded-[24px] overflow-hidden flex flex-col h-[460px] md:h-[520px] max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-140px)]"
          style={{ background: nm.bg, boxShadow: nm.raised(8) }}
        >
          {/* Header */}
          <Header
            nm={nm}
            chatMode={chatMode}
            onModeChange={setChatMode}
            onClose={() => setIsOpen(false)}
          />

          {chatMode === 'text' ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto chat-messages p-3 space-y-[10px]" style={{ background: nm.bg }}>

                {/* New-conversation pill — shown once there's history */}
                {messages.length > 1 && (
                  <div className="flex justify-center pt-[2px] pb-[4px]">
                    <button
                      onClick={handleNewChat}
                      className="flex items-center gap-[5px] px-[12px] py-[5px] rounded-full text-[11px] font-semibold hover:text-[#1e6ef4] transition-colors duration-200"
                      style={{ background: nm.bg, boxShadow: nm.raised(3), color: nm.text }}
                    >
                      <RefreshIcon />
                      New conversation
                    </button>
                  </div>
                )}

                {/* Message list */}
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-[6px] max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

                        {msg.role === 'bot' && <BotAvatar shadow={`${nm.raised(3)} mb-[2px]`} />}

                        <div className="relative">
                          {/* Confetti burst for easter egg */}
                          {msg.isEasterEgg && confettiId === msg.id && (
                            <div className="absolute -top-[20px] left-0 flex gap-[6px] pointer-events-none">
                              {CONFETTI_COLORS.map((color, i) => (
                                <motion.div
                                  key={i}
                                  className="w-[8px] h-[8px] rounded-full"
                                  style={{ backgroundColor: color }}
                                  initial={{ y: 0, x: 0, opacity: 1, scale: 0 }}
                                  animate={{ y: -40, x: (i - 2) * 14, opacity: 0, scale: 1.5 }}
                                  transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
                                />
                              ))}
                            </div>
                          )}

                          {msg.role === 'bot' ? (
                            <div
                              className="rounded-[14px] rounded-bl-[4px] px-[12px] py-[9px] text-[12px] md:text-[13px] leading-[155%]"
                              style={{
                                background: nm.bg,
                                boxShadow:  msg.isEasterEgg ? nm.inset(2) : nm.raised(4),
                                color:      nm.text,
                              }}
                            >
                              {getDisplayText(msg)}
                            </div>
                          ) : (
                            <div
                              className="rounded-[14px] rounded-br-[4px] px-[12px] py-[9px] text-[12px] md:text-[13px] leading-[155%] text-white"
                              style={{ background: 'linear-gradient(135deg,#1e6ef4,#4f46e5)', boxShadow: '3px 3px 8px rgba(30,110,244,0.35)' }}
                            >
                              {getDisplayText(msg)}
                            </div>
                          )}
                        </div>

                        {/* Speak button for bot messages */}
                        {msg.role === 'bot' && (
                          <button
                            onClick={() => handleSpeak(msg.content, msg.id)}
                            className={`flex-shrink-0 w-[20px] h-[20px] flex items-center justify-center rounded-full text-[10px] transition-all mb-[2px] ${speakingMessageId === msg.id ? 'animate-pulse' : 'opacity-50 hover:opacity-80'}`}
                            style={{ color: speakingMessageId === msg.id ? '#1e6ef4' : nm.muted }}
                            title={speakingMessageId === msg.id ? 'Stop speaking' : 'Read aloud'}
                          >
                            {speakingMessageId === msg.id ? '🔊' : '🔈'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing indicator (three animated dots) */}
                {loading && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-end gap-[6px]">
                      <BotAvatar shadow={nm.raised(3)} />
                      <div className="rounded-[14px] rounded-bl-[4px] px-[14px] py-[12px] flex items-end gap-[4px]" style={{ background: nm.bg, boxShadow: nm.raised(4) }}>
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-[7px] h-[7px] rounded-full" style={{ background: '#1e6ef4', opacity: 0.7, animation: 'wave-bar 1s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested chips — shown only on the welcome screen */}
              {messages.length === 1 && !loading && (
                <div className="px-3 pt-[6px] pb-[2px] flex flex-wrap gap-[6px] flex-shrink-0" style={{ background: nm.bg }}>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="px-[10px] py-[5px] rounded-full text-[11px] font-semibold whitespace-nowrap transition-opacity hover:opacity-80"
                      style={{ background: nm.bg, boxShadow: nm.raised(3), color: '#1e6ef4' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input area */}
              <div
                className="px-3 py-[10px] flex-shrink-0"
                style={{ background: nm.bg, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
              >
                <form onSubmit={handleSendMessage}>
                  <div className="relative rounded-[14px] transition-all duration-200" style={{ background: nm.bg, boxShadow: nm.inset(4) }}>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything..."
                      disabled={loading}
                      className={`w-full bg-transparent text-[12px] md:text-[13px] focus:outline-none pl-[12px] pr-[74px] py-[10px] rounded-[14px] ${isDark ? 'placeholder:text-[#3a3a4a]' : 'placeholder:text-[#b8b8c0]'}`}
                      style={{ color: nm.text, caretColor: '#1e6ef4' }}
                    />
                    <div className="absolute right-[8px] top-1/2 -translate-y-1/2 flex items-center gap-[4px]">
                      {/* Dictation mic */}
                      <button
                        type="button"
                        onClick={toggleDictation}
                        disabled={loading}
                        className={`w-[28px] h-[28px] rounded-[8px] flex items-center justify-center transition-all duration-200 ${isDictating ? 'bg-red-500 text-white' : ''} disabled:opacity-40`}
                        style={isDictating ? { boxShadow: '0 0 8px rgba(239,68,68,0.4)' } : { background: nm.bg, boxShadow: nm.raised(2), color: nm.muted }}
                        title={isDictating ? 'Stop listening' : 'Speak to type'}
                      >
                        <MicSVG />
                      </button>
                      {/* Send */}
                      <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="w-[28px] h-[28px] rounded-[8px] bg-gradient-to-br from-[#1e6ef4] to-[#4f46e5] text-white flex items-center justify-center transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ boxShadow: '2px 2px 6px rgba(30,110,244,0.4)' }}
                      >
                        <SendSVG />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <VoiceMode
              voiceStatus={voiceStatus}
              lastBotResponse={lastBotResponse}
              onToggle={toggleListening}
              isDark={isDark}
            />
          )}
        </div>
      )}

      {/* ── Toggle button (only when not controlled externally) ──────────── */}
      {!onToggle && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#1e6ef4] to-[#4f46e5] text-white flex items-center justify-center text-[22px] shadow-[0_8px_24px_rgba(30,110,244,0.4)] hover:scale-110 transition-all duration-200 active:scale-95"
        >
          {isOpen ? '↓' : '💬'}
        </button>
      )}
    </div>
  );
}

// ── Header sub-component ──────────────────────────────────────────────────────

interface HeaderProps {
  nm: ReturnType<typeof nmTheme>;
  chatMode: 'text' | 'voice';
  onModeChange: (m: 'text' | 'voice') => void;
  onClose: () => void;
}

function Header({ nm, chatMode, onModeChange, onClose }: HeaderProps) {
  return (
    <div
      className="relative px-4 py-[10px] flex items-center justify-between flex-shrink-0 mx-[10px] mt-[10px] rounded-[16px]"
      style={{ background: nm.bg, boxShadow: nm.raised(4) }}
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-[10px]">
        <div className="relative flex-shrink-0">
          <div className="w-[36px] h-[36px] rounded-[10px] overflow-hidden" style={{ boxShadow: nm.raised(3) }}>
            <img src="/images/avatar-hero.jpg" alt="Ramanathan" className="w-full h-full object-cover object-top" />
          </div>
          <div className="absolute -bottom-[2px] -right-[2px] w-[9px] h-[9px] rounded-full bg-[#35c759]" style={{ border: `2px solid ${nm.bg}` }} />
        </div>
        <h3 className="text-[13px] font-semibold leading-none" style={{ color: nm.text }}>Ramanathan's AI</h3>
      </div>

      {/* Mode toggle + close */}
      <div className="flex items-center gap-[6px]">
        <div className="flex items-center rounded-[8px] p-[2px]" style={{ background: nm.bg, boxShadow: nm.inset(2) }}>
          {(['text', 'voice'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className="text-[10px] px-[10px] py-[4px] rounded-[6px] font-semibold transition-all duration-200"
              style={{
                background: chatMode === mode ? 'linear-gradient(135deg,#1e6ef4,#4f46e5)' : 'transparent',
                color:      chatMode === mode ? '#fff' : nm.muted,
                boxShadow:  chatMode === mode ? '2px 2px 5px rgba(30,110,244,0.3)' : 'none',
              }}
            >
              {mode === 'text' ? 'Chat' : 'Voice'}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[18px] leading-none transition-opacity hover:opacity-80"
          style={{ color: nm.faint }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

/** Small refresh/loop icon for the "New conversation" pill. */
function RefreshIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  );
}
