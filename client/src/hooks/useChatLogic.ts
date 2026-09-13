/**
 * useChatLogic — all business logic for the Chatbot widget.
 *
 * Extracted from Chatbot.tsx so the component stays render-only.
 * Handles: LLM (Groq), TTS (Groq Orpheus), STT (Deepgram/MediaRecorder),
 * chat history persistence, typing reveal, dictation, easter egg.
 *
 * Bug fixes vs the original monolithic component:
 *  - isMountedRef guards the typing-reveal interval (prevents stale updates)
 *  - Three cleanup effects consolidated into one with empty deps (all refs, no state)
 *  - useRef<any> replaced with typed refs
 *  - async-in-Promise constructor removed from playAudioBuffer
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import OpenAI from 'openai';
import { PROFILE_CONTEXT, GROQ_MODELS } from '../lib/profileContext';
import { uid, getErrorMessage } from '../lib/chatUtils';
import { detectInjection } from '../lib/groqUtils';
import type { VoiceStatus } from '../components/VoiceMode';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isEasterEgg?: boolean;
}

interface ChatHistory {
  history: { role: string; content: string }[];
  sendMessage: (msg: string) => Promise<{ response: { text: () => string } }>;
  // Streaming variant used only by voice mode: calls onSentence as each complete
  // sentence arrives from the LLM so it can be sent to TTS immediately, instead
  // of waiting for the full reply before speaking any of it. Resolves with the
  // full assembled reply once the stream ends.
  sendMessageStreaming: (msg: string, onSentence: (sentence: string) => void) => Promise<string>;
}

// ── Constants (exported so Chatbot.tsx can use them in JSX) ───────────────────

export const SUGGESTED_QUESTIONS = [
  "What's your tech stack?",
  'Tell me about your projects',
  'Are you open to work?',
] as const;

export const CONFETTI_COLORS = ['#1e6ef4', '#4f46e5', '#f59e0b', '#10b981', '#ef4444'] as const;

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'bot',
  content: "Hi! I'm Ramanathan. Ask me anything about my experience, skills, or projects!",
  timestamp: new Date(),
};

const HIRE_KEYWORDS = ['hire me', 'hire you', 'want to hire', 'looking to hire', 'you hired'];

const EASTER_EGG_RESPONSE =
  "🎉 YES! I'm ready to join your team! Let's make something amazing together. Email me at ramanathanmurugappan29@gmail.com 🚀";

const TYPING_SPEED_MS    = 25;
const CONFETTI_DURATION  = 2000;
const HISTORY_CAP        = 20;
const MAX_INPUT_LENGTH = 500;

// ── Persistence ───────────────────────────────────────────────────────────────

function loadHistory(): Message[] {
  try {
    const saved = localStorage.getItem('chat_history');
    if (!saved) return [WELCOME_MESSAGE];
    const parsed = JSON.parse(saved) as Message[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [WELCOME_MESSAGE];
    return parsed.slice(-HISTORY_CAP).map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return [WELCOME_MESSAGE];
  }
}

// ── TTS helper (module-level, no component state) ─────────────────────────────

// Groq's Orpheus TTS only accepts these voice names, and only "wav" for response_format.
const TTS_VOICE = 'daniel';

async function fetchTTSAudio(text: string): Promise<ArrayBuffer> {
  const res = await fetch('https://api.groq.com/openai/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model:           'canopylabs/orpheus-v1-english',
      input:           text,
      voice:           TTS_VOICE,
      response_format: 'wav',
    }),
  });
  if (!res.ok) {
    const err = new Error(`Groq TTS error: ${res.status}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.arrayBuffer();
}

// ── Whisper hallucination filter ───────────────────────────────────────────────
//
// Whisper (all sizes, Groq's turbo included) is well-documented to "transcribe"
// silence or ambient noise into stock phrases — an artifact of its training data
// being full of captioned YouTube videos. Confirmed live against Groq's endpoint:
// 2 seconds of pure digital silence comes back as the confident transcript
// "Thank you." with no_speech_prob 0. A VAD gate keeps most noise from ever
// reaching Whisper, but this catches whatever slips through.
const WHISPER_HALLUCINATIONS = new Set([
  'thank you', 'thank you.', 'thanks for watching', 'thank you for watching',
  'thank you so much for watching', 'thanks for watching this video',
  'please subscribe', 'subscribe to my channel', 'like and subscribe',
  'please like and subscribe', "don't forget to subscribe",
  'see you next time', 'see you in the next video', 'bye bye', 'goodbye everyone',
  'you',
]);

function isWhisperHallucination(text: string | null | undefined): boolean {
  if (!text) return true;
  const normalized = text.toLowerCase().trim().replace(/[.!?,]+$/, '');
  if (normalized.replace(/[^a-z0-9]/g, '').length <= 1) return true; // e.g. ".", "a" — junk
  return WHISPER_HALLUCINATIONS.has(normalized);
}

// Defense-in-depth for voice mode: the system prompt tells the model to avoid markdown,
// but strip any that slips through anyway before it reaches TTS — otherwise things like
// table pipes or "**bold**" get read out loud as literal punctuation.
function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/\|/g, ' ')                  // table pipes
    .replace(/^[-*_]{3,}$/gm, '')         // horizontal rules / table separator rows
    .replace(/^#{1,6}\s*/gm, '')          // headers
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1') // bold/italic markers
    .replace(/^\s*[-*+]\s+/gm, '')        // bullet list markers
    .replace(/^\s*\d+\.\s+/gm, '')        // numbered list markers
    .replace(/`+/g, '')                   // inline code / code fences
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Hook interface ────────────────────────────────────────────────────────────

interface Options {
  externalIsOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export interface ChatLogic {
  // Panel
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  // Text chat
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  isRevealing: boolean;
  chatMode: 'text' | 'voice';
  setChatMode: (m: 'text' | 'voice') => void;
  // TTS
  speakingMessageId: string | null;
  // Voice (STT + conversation)
  micLevel: number;
  isDictating: boolean;
  voiceStatus: VoiceStatus;
  lastBotResponse: string;
  // Typing reveal
  displayContents: Record<string, string>;
  confettiId: string | null;
  // Quick questions — shown only on the welcome screen
  showQuickQuestions: boolean;
  // DOM ref for scroll-to-bottom
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  // Handlers
  getDisplayText: (msg: Message) => string;
  sendMessage: (text: string) => Promise<void>;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  handleNewChat: () => void;
  handleSpeak: (text: string, messageId: string) => Promise<void>;
  toggleDictation: () => void;
  toggleListening: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useChatLogic({ externalIsOpen, onToggle }: Options = {}): ChatLogic {

  // ── State ─────────────────────────────────────────────────────────────────

  const [messages,         setMessages]         = useState<Message[]>(loadHistory);
  const [input,            setInput]            = useState('');
  const [loading,          setLoading]          = useState(false);
  const [internalIsOpen,   setInternalIsOpen]   = useState(true);
  const [chatMode,         setChatMode]         = useState<'text' | 'voice'>('text');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  // Live mic input level (0-1) while listening — drives a real-time reactive
  // ring around the mic button so voice mode visibly responds to your voice
  // as you speak, instead of a canned animation.
  const [micLevel,         setMicLevel]          = useState(0);
  const [isDictating,      setIsDictating]      = useState(false);
  const [voiceStatus,      setVoiceStatus]      = useState<VoiceStatus>('idle');
  const [lastBotResponse,  setLastBotResponse]  = useState('');
  const [displayContents,  setDisplayContents]  = useState<Record<string, string>>({});
  const [confettiId,       setConfettiId]       = useState<string | null>(null);
  // True from the moment a bot reply starts its char-by-char reveal until it finishes —
  // keeps the input disabled so it never looks like an idle empty box mid-response,
  // and prevents a second send from cutting the reveal off half-typed.
  const [isRevealing,      setIsRevealing]      = useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────

  // SpeechRecognition is not in all TS DOM libs — use a minimal structural type
  type SpeechRecog = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; abort(): void; onstart: (() => void) | null; onend: (() => void) | null; onerror: (() => void) | null; onresult: ((e: any) => void) | null };

  const isMountedRef          = useRef(true);
  const messagesEndRef        = useRef<HTMLDivElement>(null);
  const typingIntervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef              = useRef<HTMLAudioElement | null>(null);
  // Web Audio API context + node used for voice-mode TTS playback (playAudioBuffer) —
  // a fully-decoded AudioBufferSourceNode starts with zero latency, unlike a fresh
  // HTMLAudioElement, which can silently clip the first second or so of audio while
  // it fetches/decodes the blob before real output begins.
  const playbackAudioCtxRef   = useRef<AudioContext | null>(null);
  const activeSourceRef       = useRef<AudioBufferSourceNode | null>(null);
  const dictationRef          = useRef<SpeechRecog | null>(null);
  const recognitionRef        = useRef<SpeechRecog | null>(null);
  const recorderRef           = useRef<{ recorder: MediaRecorder; stream: MediaStream } | null>(null);
  const conversationActiveRef = useRef(false);
  const interruptedRef        = useRef(false);
  // Resolves the in-flight playAudioBuffer() promise, if any, as 'interrupted' — called
  // right before we actually pause so a manual stop is never mistaken for natural completion.
  const interruptPlaybackRef  = useRef<(() => void) | null>(null);
  const openaiRef             = useRef<OpenAI | null>(null);
  const chatRef               = useRef<ChatHistory | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────────

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const setIsOpen = useCallback((value: boolean) => {
    if (onToggle) onToggle(value);
    else setInternalIsOpen(value);
  }, [onToggle]);

  // ── Audio ─────────────────────────────────────────────────────────────────

  const stopAudio = useCallback(() => {
    if (interruptPlaybackRef.current) {
      const fn = interruptPlaybackRef.current;
      interruptPlaybackRef.current = null;
      fn();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  // ── Voice conversation: stop ──────────────────────────────────────────────

  const stopConversation = useCallback(() => {
    conversationActiveRef.current = false;
    interruptedRef.current = true;
    if (recorderRef.current) {
      try {
        recorderRef.current.recorder.stop();
        recorderRef.current.stream.getTracks().forEach(t => t.stop());
      } catch { /* ignore */ }
      recorderRef.current = null;
    }
    stopAudio();
    setMicLevel(0);
    setVoiceStatus('idle');
  }, [stopAudio]);

  // ── Typing reveal ─────────────────────────────────────────────────────────

  const revealMessage = useCallback((id: string, content: string, onDone?: () => void) => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setDisplayContents((prev) => ({ ...prev, [id]: '' }));
    setIsRevealing(true);
    let i = 0;
    typingIntervalRef.current = setInterval(() => {
      // Guard: skip state updates if component already unmounted
      if (!isMountedRef.current) {
        clearInterval(typingIntervalRef.current!);
        return;
      }
      i++;
      setDisplayContents((prev) => ({ ...prev, [id]: content.slice(0, i) }));
      if (i >= content.length) {
        clearInterval(typingIntervalRef.current!);
        typingIntervalRef.current = null;
        setIsRevealing(false);
        onDone?.();
      }
    }, TYPING_SPEED_MS);
  }, []);

  const getDisplayText = useCallback((msg: Message) => {
    if (msg.role !== 'bot') return msg.content;
    return msg.id in displayContents ? displayContents[msg.id] : msg.content;
  }, [displayContents]);

  // ── Quick questions visibility ────────────────────────────────────────────
  // Shown only on the welcome screen, before the first real exchange.

  const showQuickQuestions = messages.length === 1 && !loading;

  // ── Groq client init ──────────────────────────────────────────────────────

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      console.error('VITE_GROQ_API_KEY is not set');
      return;
    }
    openaiRef.current = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1', dangerouslyAllowBrowser: true });
    chatRef.current = {
      history: [],
      sendMessage: async (message) => {
        const wrapped = `<user_input>${message}</user_input>`;
        const msgs = [
          { role: 'system' as const, content: PROFILE_CONTEXT },
          ...chatRef.current!.history,
          { role: 'user'   as const, content: wrapped },
        ];
        let lastError: unknown;
        for (const model of GROQ_MODELS) {
          try {
            const res = await openaiRef.current!.chat.completions.create({ messages: msgs as any, model, temperature: 0.7, max_tokens: 300, top_p: 1, stream: false });
            const reply = res.choices[0]?.message?.content ?? '';
            chatRef.current!.history.push({ role: 'user', content: wrapped }, { role: 'assistant', content: reply });
            return { response: { text: () => reply } };
          } catch (err) { lastError = err; }
        }
        throw lastError;
      },
      sendMessageStreaming: async (message, onSentence) => {
        const wrapped = `<user_input>${message}</user_input>`;
        const msgs = [
          { role: 'system' as const, content: PROFILE_CONTEXT },
          // Voice-only addition — confirmed via a live test that without this, the model
          // will happily reply with markdown tables/headers/bullets, which TTS reads
          // aloud literally (pipes, asterisks, hyphens). Text mode doesn't need this since
          // markdown renders fine in a chat bubble.
          { role: 'system' as const, content: 'You are now speaking out loud in a live voice call, not typing in a chat window. Reply in plain spoken sentences only: no markdown, no tables, no bullet points, no headers, no code blocks, no asterisks. Keep it concise and conversational, the way you would actually talk.' },
          ...chatRef.current!.history,
          { role: 'user'   as const, content: wrapped },
        ];
        // Splits on sentence-ending punctuation followed by whitespace — good enough
        // for spoken replies, which are short, plain sentences (no code blocks/lists).
        const SENTENCE_BOUNDARY = /(?<=[.!?])\s+/;

        let lastError: unknown;
        for (const model of GROQ_MODELS) {
          let fullText = '';
          let buffer   = '';
          try {
            const stream = await openaiRef.current!.chat.completions.create({
              messages: msgs as any, model, temperature: 0.7, max_tokens: 300, top_p: 1, stream: true,
            });
            for await (const chunk of stream as any) {
              // Hanging up mid-reply should actually stop the request, not just stop
              // reading it — breaking a `for await` over an OpenAI SDK stream aborts
              // the underlying fetch.
              if (!conversationActiveRef.current) break;
              const delta = chunk.choices?.[0]?.delta?.content ?? '';
              if (!delta) continue;
              fullText += delta;
              buffer   += delta;
              const parts = buffer.split(SENTENCE_BOUNDARY);
              buffer = parts.pop() ?? ''; // last part may be incomplete — keep accumulating it
              for (const sentence of parts) onSentence(sentence);
            }
            if (buffer.trim()) onSentence(buffer); // flush whatever's left after the stream ends
            chatRef.current!.history.push({ role: 'user', content: wrapped }, { role: 'assistant', content: fullText });
            return fullText;
          } catch (err) {
            lastError = err;
            // A model can fail mid-stream after already emitting (and speaking) part of a
            // reply — rare on Groq, but if it happens don't silently retry with a second
            // voice picking up mid-sentence. Only fall back to the next model when nothing
            // was produced yet.
            if (fullText) throw err;
          }
        }
        throw lastError;
      },
    };
  }, []);

  // ── Persist chat history ──────────────────────────────────────────────────

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(messages.slice(-HISTORY_CAP)));
    }
  }, [messages]);

  // ── Scroll to latest message ──────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayContents]);

  // ── Consolidated cleanup on unmount ───────────────────────────────────────
  // All refs — no state deps — empty array is intentional and correct.

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (activeSourceRef.current) { try { activeSourceRef.current.stop(); } catch { /* already stopped */ } }
      if (playbackAudioCtxRef.current) { playbackAudioCtxRef.current.close().catch(() => {}); }
      if (recognitionRef.current) recognitionRef.current.abort();
      if (recorderRef.current) {
        try {
          recorderRef.current.recorder.stop();
          recorderRef.current.stream.getTracks().forEach(t => t.stop());
        } catch { /* ignore */ }
      }
      conversationActiveRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stop voice/dictation when panel closes ────────────────────────────────

  useEffect(() => {
    if (!isOpen) {
      stopConversation();
      if (dictationRef.current) {
        try { dictationRef.current.stop(); } catch { /* ignore */ }
        setIsDictating(false);
      }
    }
  }, [isOpen, stopConversation]);

  // ── Stop voice when switching to text mode ────────────────────────────────

  useEffect(() => {
    if (chatMode !== 'voice') {
      stopConversation();
    } else {
      if (dictationRef.current) {
        try { dictationRef.current.stop(); } catch { /* ignore */ }
        setIsDictating(false);
      }
    }
  }, [chatMode, stopConversation]);

  // ── TTS: speak a single bot message ──────────────────────────────────────

  const handleSpeak = useCallback(async (text: string, messageId: string) => {
    if (speakingMessageId === messageId) {
      stopAudio();
      setSpeakingMessageId(null);
      return;
    }
    stopAudio();
    setSpeakingMessageId(messageId);
    try {
      const buffer = await fetchTTSAudio(text);
      const url = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
      const audio = new Audio(url);
      audioRef.current = audio;
      const cleanup = () => { URL.revokeObjectURL(url); audioRef.current = null; setSpeakingMessageId(null); };
      audio.onended = cleanup;
      audio.onerror = cleanup;
      await audio.play();
    } catch {
      setSpeakingMessageId(null);
    }
  }, [speakingMessageId, stopAudio]);

  // ── Send a text message ───────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !chatRef.current) return;

    const safe = text.trim().slice(0, MAX_INPUT_LENGTH);

    setMessages((prev) => [...prev, { id: uid(), role: 'user', content: safe, timestamp: new Date() }]);
    setLoading(true);

    // Easter egg: skip LLM on hire keywords
    if (HIRE_KEYWORDS.some((kw) => safe.toLowerCase().includes(kw))) {
      const eggId = uid();
      setMessages((prev) => [...prev, { id: eggId, role: 'bot', content: EASTER_EGG_RESPONSE, timestamp: new Date(), isEasterEgg: true }]);
      setConfettiId(eggId);
      revealMessage(eggId, EASTER_EGG_RESPONSE);
      setTimeout(() => setConfettiId(null), CONFETTI_DURATION);
      setLoading(false);
      return;
    }

    // Prompt injection guard — deflect without calling the LLM
    if (detectInjection(safe)) {
      const botId = uid();
      const reply = "I'm Ramanathan! Happy to answer questions about my experience and work. What would you like to know?";
      setMessages((prev) => [...prev, { id: botId, role: 'bot', content: reply, timestamp: new Date() }]);
      revealMessage(botId, reply);
      setLoading(false);
      return;
    }

    try {
      const result = await chatRef.current.sendMessage(safe);
      const botMsg: Message = { id: uid(), role: 'bot', content: result.response.text(), timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
      revealMessage(botMsg.id, botMsg.content);
    } catch (error) {
      const friendly = getErrorMessage(error);
      const errMsg: Message = { id: uid(), role: 'bot', content: friendly, timestamp: new Date() };
      setMessages((prev) => [...prev, errMsg]);
      revealMessage(errMsg.id, friendly);
    } finally {
      setLoading(false);
    }
  }, [revealMessage]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    await sendMessage(text);
  }, [input, sendMessage]);

  const handleNewChat = useCallback(() => {
    localStorage.removeItem('chat_history');
    if (typingIntervalRef.current) { clearInterval(typingIntervalRef.current); typingIntervalRef.current = null; }
    stopConversation(); // hang up an in-progress voice call so it doesn't keep running against the cleared history
    setSpeakingMessageId(null);
    setLastBotResponse(''); // clear the voice-mode reply box too — a new chat should show no prior answer
    setDisplayContents({});
    setIsRevealing(false);
    setInput('');
    if (chatRef.current) chatRef.current.history = [];
    setMessages([{ ...WELCOME_MESSAGE, id: uid(), timestamp: new Date() }]);
  }, [stopConversation]);

  // ── Dictation (mic in text input) ─────────────────────────────────────────

  const toggleDictation = useCallback(() => {
    if (isDictating && dictationRef.current) {
      dictationRef.current.stop();
      setIsDictating(false);
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    const recognition: SpeechRecog = new SpeechRec();
    recognition.continuous     = false;
    recognition.interimResults = false;
    recognition.lang           = 'en-US';
    dictationRef.current       = recognition;

    recognition.onstart  = () => setIsDictating(true);
    recognition.onerror  = () => setIsDictating(false);
    recognition.onend    = () => setIsDictating(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
      setIsDictating(false);
    };
    try { recognition.start(); } catch { setIsDictating(false); }
  }, [isDictating]);

  // ── Voice conversation: TTS playback ─────────────────────────────────────

  // Plays one already-fetched audio buffer and resolves once it's done (or cut short).
  // Shared by the single-message "speak" button and the voice-mode sentence queue below.
  const playAudioBuffer = useCallback((buffer: ArrayBuffer): Promise<'completed' | 'interrupted'> => {
    stopAudio();
    return new Promise((resolve) => {
      (async () => {
        try {
          if (!playbackAudioCtxRef.current) {
            const Ctx = window.AudioContext || (window as any).webkitAudioContext;
            playbackAudioCtxRef.current = new Ctx();
          }
          const ctx = playbackAudioCtxRef.current;
          if (ctx.state === 'suspended') await ctx.resume();

          // Fully decode before playing — an AudioBufferSourceNode starts instantly with
          // zero latency. A plain `new Audio(blobUrl)` has to fetch+decode progressively
          // before real output begins, which was silently clipping the first second or
          // two of every sentence's speech.
          const audioBuffer = await ctx.decodeAudioData(buffer.slice(0));
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          activeSourceRef.current = source;

          let settled = false;
          const finish = (outcome: 'completed' | 'interrupted') => {
            if (settled) return; // guards against onended firing after an interrupt already resolved us
            settled = true;
            if (activeSourceRef.current === source) activeSourceRef.current = null;
            if (interruptPlaybackRef.current === interrupt) interruptPlaybackRef.current = null;
            resolve(outcome);
          };
          // Called by stopAudio() to end this sentence early — e.g. user hangs up, or the
          // next sentence's playback is starting.
          const interrupt = () => {
            try { source.stop(); } catch { /* already stopped/ended */ }
            finish('interrupted');
          };
          interruptPlaybackRef.current = interrupt;
          source.onended = () => finish('completed');
          source.start(0);
        } catch (err) {
          // Was silently swallowed before — a decode/playback failure looked identical
          // to "nothing to say," which made voice mode go mute with zero clue why.
          console.error('Voice playback failed:', err);
          resolve('completed');
        }
      })();
    });
  }, [stopAudio]);

  // ── Voice conversation: STT recording ────────────────────────────────────

  const listenOnce = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          if (!conversationActiveRef.current) {
            stream.getTracks().forEach(t => t.stop());
            resolve(null);
            return;
          }

          const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
            .find(t => MediaRecorder.isTypeSupported(t)) ?? '';
          const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
          const chunks: Blob[] = [];
          recorderRef.current = { recorder: mediaRecorder, stream };

          const audioContext = new AudioContext();
          const analyser     = audioContext.createAnalyser();
          analyser.fftSize   = 1024;
          audioContext.createMediaStreamSource(stream).connect(analyser);

          const dataArray = new Float32Array(analyser.frequencyBinCount);
          const freqData  = new Float32Array(analyser.frequencyBinCount); // dB per bin
          const binHz     = audioContext.sampleRate / analyser.fftSize;

          // Fans, HVAC, and traffic hiss are steady and broadband/low-frequency; speech
          // concentrates energy in ~300-3400Hz (voice formants) and varies over time.
          // RMS alone can't tell "loud fan" from "speech" — this ratio can.
          const voiceBandRatio = () => {
            analyser.getFloatFrequencyData(freqData);
            let inBand = 0, total = 0;
            for (let i = 0; i < freqData.length; i++) {
              const mag = Math.pow(10, freqData[i] / 20); // dB -> linear amplitude
              total += mag;
              const freq = i * binHz;
              if (freq >= 300 && freq <= 3400) inBand += mag;
            }
            return total > 0 ? inBand / total : 0;
          };

          // Floor threshold for a silent room — never trust anything quieter as speech,
          // no matter how low the calibrated noise floor comes in at.
          const MIN_THRESHOLD       = 0.012;
          // How long to just listen to the room before evaluating speech at all —
          // lets us measure the ambient noise floor (fan, traffic, room hiss) instead
          // of assuming a fixed threshold that's wrong for every environment but one.
          const CALIBRATION_MS      = 350;
          // Energy must stay above threshold this long, continuously, before we treat it
          // as real speech starting — filters clicks, pops, and short noise bursts that
          // a single loud frame would otherwise mistake for the start of a sentence.
          const SPEECH_SUSTAIN_MS   = 220;
          // Minimum share of energy that must sit in the speech-formant band (300-3400Hz)
          // for a loud frame to count as speech at all — fan/HVAC noise is broadband/low
          // and fails this even when it's loud enough to clear the amplitude threshold.
          const VOICE_BAND_MIN_RATIO = 0.32;
          // Shorter pause-to-cutoff than before — the old 1500ms made turn-taking feel laggy.
          const SILENCE_DURATION    = 900;
          // Give up and hang up quietly if nothing ever crosses the speech threshold —
          // previously this fell through to the full 15s cap and then transcribed
          // whatever ambient noise it had recorded, which is exactly what caused Whisper
          // to hallucinate replies ("Thank you.", etc.) to rooms that never had speech in them.
          const NO_SPEECH_TIMEOUT   = 6000;
          const MAX_DURATION        = 15000;

          const startTime = Date.now();
          const noiseSamples: number[] = [];
          let threshold     = MIN_THRESHOLD;
          let calibrated    = false;
          let aboveSince    = 0;
          let speechStarted = false;
          let silenceStart  = 0;

          const stopRecording = () => {
            if (mediaRecorder.state === 'recording') mediaRecorder.stop();
            stream.getTracks().forEach(t => t.stop());
            audioContext.close();
            recorderRef.current = null;
            setMicLevel(0);
          };

          const checkAudio = () => {
            if (!conversationActiveRef.current || mediaRecorder.state !== 'recording') return;
            analyser.getFloatTimeDomainData(dataArray);
            const rms = Math.sqrt(dataArray.reduce((s, v) => s + v * v, 0) / dataArray.length);
            const elapsed = Date.now() - startTime;

            // Calibration window: just sample the room's noise floor, don't judge speech yet.
            if (elapsed < CALIBRATION_MS) {
              noiseSamples.push(rms);
              setMicLevel(Math.min(1, rms / 0.12));
              requestAnimationFrame(checkAudio);
              return;
            }
            // Calibration just finished — set the real, room-adjusted threshold once.
            if (!calibrated) {
              calibrated = true;
              if (noiseSamples.length > 0) {
                const sorted = [...noiseSamples].sort((a, b) => a - b);
                const noiseFloor = sorted[Math.floor(sorted.length / 2)]; // median — robust to one stray click
                threshold = Math.max(MIN_THRESHOLD, noiseFloor * 3 + 0.004);
              }
            }

            setMicLevel(Math.min(1, rms / 0.12));

            // Loud AND speech-shaped — a fan that's merely loud fails the band-ratio check
            // and never starts the sustain timer, so it can't be mistaken for a sentence.
            if (rms > threshold && voiceBandRatio() > VOICE_BAND_MIN_RATIO) {
              if (!aboveSince) aboveSince = Date.now();
              if (!speechStarted && Date.now() - aboveSince > SPEECH_SUSTAIN_MS) speechStarted = true;
              silenceStart = 0;
            } else {
              aboveSince = 0;
              if (speechStarted) {
                if (!silenceStart) silenceStart = Date.now();
                if (Date.now() - silenceStart > SILENCE_DURATION) { stopRecording(); return; }
              } else if (elapsed > NO_SPEECH_TIMEOUT) {
                stopRecording(); return; // nothing ever sounded like speech — bail without calling the API
              }
            }
            if (elapsed > MAX_DURATION) { stopRecording(); return; }
            requestAnimationFrame(checkAudio);
          };

          mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
          mediaRecorder.onstop = async () => {
            // A manual hang-up (stopConversation) also stops the recorder — don't
            // transcribe or flip status in that case, there's no one left listening.
            if (!conversationActiveRef.current) { resolve(null); return; }
            // Flip to "thinking" the instant recording stops — otherwise the UI still
            // reads "Listening…" for the whole transcription round-trip, which is what
            // made voice mode feel stuck/non-live rather than a real conversation.
            // The VAD state machine above never confirmed real, sustained speech —
            // don't waste an API call transcribing pure room noise.
            if (!speechStarted || chunks.length === 0) { resolve(null); return; }
            setVoiceStatus('thinking');
            const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
            try {
              const formData = new FormData();
              formData.append('file', new File([blob], 'audio.webm', { type: mimeType || 'audio/webm' }));
              formData.append('model', 'whisper-large-v3-turbo');
              formData.append('language', 'en');
              const res  = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method:  'POST',
                headers: { Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
                body:    formData,
              });
              const data = await res.json();
              const text = data.text?.trim() ?? null;
              resolve(isWhisperHallucination(text) ? null : text);
            } catch { resolve(null); }
          };

          setVoiceStatus('listening');
          mediaRecorder.start(100);
          requestAnimationFrame(checkAudio);
        })
        .catch((err) => {
          setLastBotResponse(
            err.name === 'NotAllowedError'
              ? 'Microphone access denied. Please allow microphone permission and try again.'
              : 'Could not access microphone. Please check your browser settings.',
          );
          resolve(null);
        });
    });
  }, []);

  // ── Voice conversation: full loop ─────────────────────────────────────────

  // Runs listen -> respond -> speak on repeat until the user taps to stop, the mic
  // picks up nothing (silence timeout), or a hard error occurs — a real back-and-forth
  // conversation rather than a single question-and-answer round.
  const runConversationLoop = useCallback(async () => {
    conversationActiveRef.current = true;

    while (conversationActiveRef.current) {
      const transcript = await listenOnce();
      if (!conversationActiveRef.current) break;
      if (!transcript?.trim() || !chatRef.current) break; // silence / no speech detected — end the call

      const safeTranscript = transcript.trim().slice(0, MAX_INPUT_LENGTH);

      // Prompt injection guard for voice input
      if (detectInjection(safeTranscript)) break;

      setVoiceStatus('thinking');
      setMessages((prev) => [...prev, { id: uid(), role: 'user', content: safeTranscript, timestamp: new Date() }]);

      try {
        // Pipeline the reply instead of waiting for the whole thing: each sentence is
        // sent to TTS the instant the LLM finishes streaming it, so synthesis for
        // sentence 2+ happens in the background while sentence 1 is already playing —
        // audio starts on the first sentence instead of the full reply + full render.
        let ttsRateLimited = false;
        const ttsQueue: Promise<ArrayBuffer | null>[] = [];
        const onSentence = (sentence: string) => {
          const clean = stripMarkdownForSpeech(sentence);
          if (!clean) return;
          ttsQueue.push(fetchTTSAudio(clean).catch((err) => {
            if (err?.status === 429) ttsRateLimited = true;
            return null;
          }));
        };

        const responseText = await chatRef.current.sendMessageStreaming(safeTranscript, onSentence);
        setMessages((prev) => [...prev, { id: uid(), role: 'bot', content: responseText, timestamp: new Date() }]);
        setLastBotResponse(responseText);

        if (conversationActiveRef.current && ttsQueue.length > 0) {
          setVoiceStatus('speaking');
          interruptedRef.current = false;
          let spokeAny = false;
          for (const bufferPromise of ttsQueue) {
            if (!conversationActiveRef.current || interruptedRef.current) break;
            const buffer = await bufferPromise;
            if (!buffer) continue; // that sentence's synthesis failed — skip it, keep going
            spokeAny = true;
            const outcome = await playAudioBuffer(buffer);
            if (outcome === 'interrupted') break;
          }
          // Voice quota's hit for the day — say so as text rather than just going silent,
          // since the visible reply is already there but nothing was actually spoken.
          if (!spokeAny && ttsRateLimited) {
            const notice = " (I've done a lot of talking today, so my voice needs a breather — texting this one instead.)";
            setLastBotResponse((prev) => prev + notice);
          }
        }
      } catch (error) {
        const friendly = getErrorMessage(error);
        setMessages((prev) => [...prev, { id: uid(), role: 'bot', content: friendly, timestamp: new Date() }]);
        setLastBotResponse(friendly);
        break; // don't keep looping after a hard failure
      }
      // Loop back to listenOnce() for the next turn while the call is still active.
    }
    stopConversation();
  }, [listenOnce, playAudioBuffer, stopConversation]);

  const toggleListening = useCallback(() => {
    if (!window.isSecureContext) { setLastBotResponse('Voice mode requires HTTPS or localhost.'); return; }
    if (conversationActiveRef.current) { stopConversation(); return; }
    // Create/resume the playback AudioContext synchronously within this click handler.
    // Browsers only allow an AudioContext to start producing sound if it's resumed during
    // a real user gesture — by the time playAudioBuffer would otherwise get around to it
    // (after STT + LLM + TTS network round-trips), the gesture has long expired and the
    // context stays silently suspended, which is exactly why voice replies went silent.
    if (!playbackAudioCtxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      playbackAudioCtxRef.current = new Ctx();
    }
    if (playbackAudioCtxRef.current.state === 'suspended') {
      playbackAudioCtxRef.current.resume().catch((err) => console.error('AudioContext resume failed:', err));
    }
    runConversationLoop();
  }, [runConversationLoop, stopConversation]);

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    isOpen, setIsOpen,
    messages, input, setInput, loading, isRevealing,
    chatMode, setChatMode,
    speakingMessageId,
    micLevel, isDictating, voiceStatus, lastBotResponse,
    displayContents, confettiId,
    showQuickQuestions,
    messagesEndRef,
    getDisplayText,
    sendMessage, handleSendMessage, handleNewChat,
    handleSpeak, toggleDictation, toggleListening,
  };
}
