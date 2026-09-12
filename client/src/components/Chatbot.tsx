/**
 * Chatbot — floating AI chat widget.
 *
 * This file is render-only: all business logic lives in useChatLogic.
 * Supports two modes:
 *   text  — suggested chips, typing reveal, easter egg, localStorage history
 *   voice — Groq Whisper STT → Groq LLM → Groq Orpheus TTS
 *
 * Visual theme: iMessage-style — white/dark card, rounded bubbles with a
 * tail corner, circular avatars, iOS-style segmented Chat/Voice control,
 * pill-shaped input bar. Flat blue accent (#1e6ef4), Lucide icons only.
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Volume2, Mic, ArrowUp, RotateCcw } from 'lucide-react';
import { useChatLogic, SUGGESTED_QUESTIONS, CONFETTI_COLORS } from '@/hooks/useChatLogic';
import { formatMessageTime } from '@/lib/chatUtils';
import VoiceMode from './VoiceMode';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatbotProps {
  isOpen?:   boolean;
  onToggle?: (isOpen: boolean) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Small circular avatar used beside each bot message and in the typing indicator. */
function BotAvatar() {
  return (
    <div className="w-[19px] h-[19px] rounded-full overflow-hidden flex-shrink-0">
      <img src="/images/avatar-hero.jpg" alt="Ramanathan" className="w-full h-full object-cover object-top" />
    </div>
  );
}

/** Max height (px) the input textarea grows to before it starts scrolling. */
const INPUT_MAX_HEIGHT = 96;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Chatbot({ isOpen: externalIsOpen, onToggle }: ChatbotProps = {}) {
  const {
    isOpen, setIsOpen,
    messages, input, setInput, loading, isRevealing,
    chatMode, setChatMode,
    speakingMessageId,
    isDictating, voiceStatus, lastBotResponse,
    confettiId,
    showQuickQuestions,
    messagesEndRef,
    getDisplayText, sendMessage, handleSendMessage, handleNewChat,
    handleSpeak, toggleDictation, toggleListening,
  } = useChatLogic({ externalIsOpen, onToggle });

  // Disable the composer while waiting on the API AND while the reply is still
  // being revealed — otherwise the input looks idle/empty mid-response.
  const busy = loading || isRevealing;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the input to fit its content, capped at INPUT_MAX_HEIGHT (then it scrolls).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, INPUT_MAX_HEIGHT)}px`;
  }, [input]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 w-[340px] max-w-[calc(100vw-32px)] md:max-w-[calc(100vw-48px)]">

      {/* ── Chat window ──────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="imsg-panel mb-3 rounded-[22px] overflow-hidden flex flex-col h-[440px] md:h-[500px] max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-140px)]">

          {/* Header */}
          <Header
            chatMode={chatMode}
            onModeChange={setChatMode}
            onClose={() => setIsOpen(false)}
          />

          {chatMode === 'text' ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto chat-messages p-[10px] space-y-[8px]">

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

                        {msg.role === 'bot' && <BotAvatar />}

                        <div className={`relative flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
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
                            <div className="imsg-bubble-bot rounded-[16px] rounded-bl-[5px] px-[11px] py-[7px] text-[12.5px] md:text-[13px] leading-[140%]">
                              {getDisplayText(msg)}
                            </div>
                          ) : (
                            <div className="imsg-bubble-user rounded-[16px] rounded-br-[5px] px-[11px] py-[7px] text-[12.5px] md:text-[13px] leading-[140%]">
                              {getDisplayText(msg)}
                            </div>
                          )}

                          <span className="chat-muted text-[10px] mt-[3px] px-[2px]">
                            {formatMessageTime(msg.timestamp)}
                          </span>
                        </div>

                        {/* Speak button for bot messages */}
                        {msg.role === 'bot' && (
                          <button
                            onClick={() => handleSpeak(msg.content, msg.id)}
                            className={`flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center rounded-full transition-all mb-[17px] ${speakingMessageId === msg.id ? 'animate-pulse' : 'chat-muted hover:opacity-80'}`}
                            style={speakingMessageId === msg.id ? { color: '#1e6ef4' } : undefined}
                            title={speakingMessageId === msg.id ? 'Stop speaking' : 'Read aloud'}
                          >
                            <Volume2 size={12} strokeWidth={2.2} />
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
                      <BotAvatar />
                      <div className="imsg-bubble-bot rounded-[16px] rounded-bl-[5px] px-[12px] py-[10px] flex items-end gap-[4px]">
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
              {showQuickQuestions && (
                <div className="px-3 pt-[6px] pb-[2px] flex flex-wrap gap-[6px] flex-shrink-0">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="agent-chip px-[10px] py-[5px] rounded-full text-[11px] font-semibold whitespace-nowrap"
                      style={{ color: '#1e6ef4', borderColor: 'rgba(30,110,244,0.25)' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input area */}
              <div className="chat-divider-top px-[10px] py-[8px] flex-shrink-0 flex items-center gap-[6px]">
                {/* New conversation — always in reach beside the input, once there's history */}
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="agent-chip w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0"
                    title="New conversation"
                  >
                    <RotateCcw size={13} strokeWidth={2.4} />
                  </button>
                )}

                <form onSubmit={handleSendMessage} className="flex-1">
                  <div className="imsg-input relative rounded-[20px]">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      placeholder={busy ? 'Ramanathan is replying…' : 'Text Message'}
                      disabled={busy}
                      className="chat-input w-full bg-transparent text-[12.5px] md:text-[13px] leading-[140%] focus:outline-none pl-[12px] pr-[64px] py-[7px] rounded-[20px] resize-none block disabled:opacity-60"
                      style={{ caretColor: '#1e6ef4', maxHeight: `${INPUT_MAX_HEIGHT}px` }}
                    />
                    <div className="absolute right-[5px] bottom-[5px] flex items-center gap-[4px]">
                      {/* Dictation mic */}
                      <button
                        type="button"
                        onClick={toggleDictation}
                        disabled={busy}
                        className={`w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 ${isDictating ? 'bg-red-500 text-white' : 'chat-muted'}`}
                        style={isDictating ? { boxShadow: '0 0 8px rgba(239,68,68,0.4)' } : undefined}
                        title={isDictating ? 'Stop listening' : 'Speak to type'}
                      >
                        <Mic size={12} strokeWidth={2.4} />
                      </button>
                      {/* Send */}
                      <button
                        type="submit"
                        disabled={busy || !input.trim()}
                        className="chat-fab w-[24px] h-[24px] rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp size={13} strokeWidth={2.6} />
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
            />
          )}
        </div>
      )}

      {/* ── Toggle button (only when not controlled externally) ──────────── */}
      {!onToggle && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="chat-fab w-[52px] h-[52px] rounded-full flex items-center justify-center"
        >
          {isOpen ? <X size={22} strokeWidth={2.4} /> : <MessageCircle size={22} strokeWidth={2.2} />}
        </button>
      )}
    </div>
  );
}

// ── Header sub-component ──────────────────────────────────────────────────────

interface HeaderProps {
  chatMode: 'text' | 'voice';
  onModeChange: (m: 'text' | 'voice') => void;
  onClose: () => void;
}

function Header({ chatMode, onModeChange, onClose }: HeaderProps) {
  return (
    <div className="imsg-header px-3 py-[8px] flex items-center justify-between gap-[8px] flex-shrink-0">
      {/* Avatar + name + status — single row */}
      <div className="flex items-center gap-[8px] min-w-0">
        <div className="relative w-[30px] h-[30px] flex-shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden">
            <img src="/images/avatar-hero.jpg" alt="Ramanathan" className="w-full h-full object-cover object-top" />
          </div>
          <div className="chat-avatar-ring absolute -bottom-[1px] -right-[1px] w-[8px] h-[8px] rounded-full bg-[#35c759]" />
        </div>
        <div className="leading-tight min-w-0">
          <h3 className="text-[12px] font-semibold leading-none truncate">Ramanathan</h3>
          <p className="chat-muted text-[10px] mt-[2px]">Online</p>
        </div>
      </div>

      {/* Mode toggle + close */}
      <div className="flex items-center gap-[6px] flex-shrink-0">
        <div className="imsg-segment flex items-center rounded-full p-[2px]">
          {(['text', 'voice'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`text-[10px] px-[10px] py-[3px] rounded-full font-semibold transition-all duration-200 ${chatMode === mode ? 'imsg-segment-active' : 'chat-muted'}`}
            >
              {mode === 'text' ? 'Chat' : 'Voice'}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="imsg-close w-[24px] h-[24px] rounded-full flex items-center justify-center flex-shrink-0"
        >
          <X size={12} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}
