/**
 * useChatLogic — all business logic for the Chatbot widget.
 *
 * Extracted from Chatbot.tsx so the component stays render-only.
 * Handles: LLM (Groq), TTS (VoiceRSS), STT (Deepgram/MediaRecorder),
 * chat history persistence, typing reveal, dictation, easter egg.
 *
 * Bug fixes vs the original monolithic component:
 *  - isMountedRef guards the typing-reveal interval (prevents stale updates)
 *  - Three cleanup effects consolidated into one with empty deps (all refs, no state)
 *  - useRef<any> replaced with typed refs
 *  - async-in-Promise constructor removed from speakText
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import OpenAI from 'openai';
import { PROFILE_CONTEXT, GROQ_MODELS } from '../lib/profileContext';
import { uid, getErrorMessage } from '../lib/chatUtils';
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
const MAX_INPUT_LENGTH   = 500;

const INJECTION_PATTERNS = [
  /ignore\s+(previous|prior|above|all)\s+(instructions?|prompts?|rules?|context)/i,
  /you\s+are\s+now\s+(a|an|the)/i,
  /act\s+as\s+(a|an|the)/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /jailbreak/i,
  /\bDAN\b/,
  /developer\s+mode/i,
  /system\s+override/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /show\s+(me\s+)?(your\s+)?(system\s+)?prompt/i,
  /forget\s+(everything|your\s+instructions?|all\s+previous)/i,
  /disregard\s+(all|previous|your)/i,
  /<\|im_end\|>/,
  /\[SYSTEM\]/,
  /\[INST\]/,
] as const;

function detectInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((p) => (p as RegExp).test(text));
}

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

async function fetchTTSAudio(text: string): Promise<ArrayBuffer> {
  const params = new URLSearchParams({
    key:  import.meta.env.VITE_VOICERSS_API_KEY,
    hl:   'en-in',
    v:    'Ajit',
    src:  text,
    c:    'MP3',
    f:    '44khz_16bit_stereo',
    ssml: 'false',
    b64:  'false',
  });
  const res = await fetch(`https://api.voicerss.org/?${params.toString()}`);
  if (!res.ok) throw new Error(`VoiceRSS TTS error: ${res.status}`);
  return res.arrayBuffer();
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
  chatMode: 'text' | 'voice';
  setChatMode: (m: 'text' | 'voice') => void;
  // TTS
  speakingMessageId: string | null;
  // Voice (STT + conversation)
  isListening: boolean;
  isDictating: boolean;
  voiceStatus: VoiceStatus;
  lastBotResponse: string;
  // Typing reveal
  displayContents: Record<string, string>;
  confettiId: string | null;
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
  const [isListening,      setIsListening]      = useState(false);
  const [isDictating,      setIsDictating]      = useState(false);
  const [voiceStatus,      setVoiceStatus]      = useState<VoiceStatus>('idle');
  const [lastBotResponse,  setLastBotResponse]  = useState('');
  const [displayContents,  setDisplayContents]  = useState<Record<string, string>>({});
  const [confettiId,       setConfettiId]       = useState<string | null>(null);

  // ── Refs ──────────────────────────────────────────────────────────────────

  // SpeechRecognition is not in all TS DOM libs — use a minimal structural type
  type SpeechRecog = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; abort(): void; onstart: (() => void) | null; onend: (() => void) | null; onerror: (() => void) | null; onresult: ((e: any) => void) | null };

  const isMountedRef          = useRef(true);
  const messagesEndRef        = useRef<HTMLDivElement>(null);
  const typingIntervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef              = useRef<HTMLAudioElement | null>(null);
  const dictationRef          = useRef<SpeechRecog | null>(null);
  const recognitionRef        = useRef<SpeechRecog | null>(null);
  const recorderRef           = useRef<{ recorder: MediaRecorder; stream: MediaStream } | null>(null);
  const conversationActiveRef = useRef(false);
  const interruptedRef        = useRef(false);
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
    setIsListening(false);
    setVoiceStatus('idle');
  }, [stopAudio]);

  // ── Typing reveal ─────────────────────────────────────────────────────────

  const revealMessage = useCallback((id: string, content: string) => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setDisplayContents((prev) => ({ ...prev, [id]: '' }));
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
      }
    }, TYPING_SPEED_MS);
  }, []);

  const getDisplayText = useCallback((msg: Message) => {
    if (msg.role !== 'bot') return msg.content;
    return msg.id in displayContents ? displayContents[msg.id] : msg.content;
  }, [displayContents]);

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
      const url = URL.createObjectURL(new Blob([buffer], { type: 'audio/mpeg' }));
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
    stopAudio();
    setSpeakingMessageId(null);
    setDisplayContents({});
    setInput('');
    if (chatRef.current) chatRef.current.history = [];
    setMessages([{ ...WELCOME_MESSAGE, id: uid(), timestamp: new Date() }]);
  }, [stopAudio]);

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

  const speakText = useCallback(async (text: string): Promise<'completed' | 'interrupted'> => {
    stopAudio();
    interruptedRef.current = false;
    try {
      const buffer = await fetchTTSAudio(text);
      if (interruptedRef.current) return 'interrupted';
      // Wrap the event-driven Audio API in a Promise — no async executor needed
      return new Promise((resolve) => {
        const url   = URL.createObjectURL(new Blob([buffer], { type: 'audio/mpeg' }));
        const audio = new Audio(url);
        audioRef.current = audio;
        const cleanup = () => { URL.revokeObjectURL(url); audioRef.current = null; };
        audio.onended = () => { cleanup(); resolve(interruptedRef.current ? 'interrupted' : 'completed'); };
        audio.onerror = () => { cleanup(); resolve('completed'); };
        audio.onpause = () => { if (!audio.ended) { cleanup(); resolve('interrupted'); } };
        audio.play().catch(() => { cleanup(); resolve('completed'); });
      });
    } catch {
      return 'completed';
    }
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
          analyser.fftSize   = 512;
          audioContext.createMediaStreamSource(stream).connect(analyser);

          const dataArray        = new Float32Array(analyser.frequencyBinCount);
          const SILENCE_THRESHOLD = 0.012;
          const SILENCE_DURATION  = 1500;
          const MAX_DURATION      = 15000;
          const startTime = Date.now();
          let speechStarted = false;
          let silenceStart  = 0;

          const stopRecording = () => {
            if (mediaRecorder.state === 'recording') mediaRecorder.stop();
            stream.getTracks().forEach(t => t.stop());
            audioContext.close();
            recorderRef.current = null;
          };

          const checkAudio = () => {
            if (!conversationActiveRef.current || mediaRecorder.state !== 'recording') return;
            analyser.getFloatTimeDomainData(dataArray);
            const rms = Math.sqrt(dataArray.reduce((s, v) => s + v * v, 0) / dataArray.length);
            if (rms > SILENCE_THRESHOLD) { speechStarted = true; silenceStart = 0; }
            else if (speechStarted) {
              if (!silenceStart) silenceStart = Date.now();
              if (Date.now() - silenceStart > SILENCE_DURATION) { stopRecording(); return; }
            }
            if (Date.now() - startTime > MAX_DURATION) { stopRecording(); return; }
            requestAnimationFrame(checkAudio);
          };

          mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
          mediaRecorder.onstop = async () => {
            setIsListening(false);
            if (chunks.length === 0) { resolve(null); return; }
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
              resolve(data.text?.trim() ?? null);
            } catch { resolve(null); }
          };

          setIsListening(true);
          setVoiceStatus('listening');
          mediaRecorder.start(100);
          requestAnimationFrame(checkAudio);
        })
        .catch((err) => {
          setIsListening(false);
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

  const runConversationLoop = useCallback(async () => {
    conversationActiveRef.current = true;

    const transcript = await listenOnce();
    if (!conversationActiveRef.current) { setVoiceStatus('idle'); setIsListening(false); return; }
    if (!transcript?.trim() || !chatRef.current) { stopConversation(); return; }

    const safeTranscript = transcript.trim().slice(0, MAX_INPUT_LENGTH);

    // Prompt injection guard for voice input
    if (detectInjection(safeTranscript)) { stopConversation(); return; }

    setVoiceStatus('thinking');
    setMessages((prev) => [...prev, { id: uid(), role: 'user', content: safeTranscript, timestamp: new Date() }]);

    try {
      const result       = await chatRef.current.sendMessage(safeTranscript);
      const responseText = result.response.text();
      setMessages((prev) => [...prev, { id: uid(), role: 'bot', content: responseText, timestamp: new Date() }]);
      setLastBotResponse(responseText);
      if (conversationActiveRef.current) {
        setVoiceStatus('speaking');
        await speakText(responseText);
      }
    } catch (error) {
      const friendly = getErrorMessage(error);
      setMessages((prev) => [...prev, { id: uid(), role: 'bot', content: friendly, timestamp: new Date() }]);
      setLastBotResponse(friendly);
    }
    stopConversation();
  }, [listenOnce, speakText, stopConversation]);

  const toggleListening = useCallback(() => {
    if (!window.isSecureContext) { setLastBotResponse('Voice mode requires HTTPS or localhost.'); return; }
    if (conversationActiveRef.current) stopConversation();
    else runConversationLoop();
  }, [runConversationLoop, stopConversation]);

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    isOpen, setIsOpen,
    messages, input, setInput, loading,
    chatMode, setChatMode,
    speakingMessageId,
    isListening, isDictating, voiceStatus, lastBotResponse,
    displayContents, confettiId,
    messagesEndRef,
    getDisplayText,
    sendMessage, handleSendMessage, handleNewChat,
    handleSpeak, toggleDictation, toggleListening,
  };
}
