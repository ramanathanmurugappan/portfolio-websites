import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OpenAI from 'openai';
import { PROFILE_CONTEXT, GROQ_MODELS } from '../lib/profileContext';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isEasterEgg?: boolean;
}

interface ChatbotProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const WELCOME_MESSAGE: Message = {
  id: '1',
  role: 'bot',
  content: "Hi! I'm Ramanathan. Ask me anything about my experience, skills, or projects!",
  timestamp: new Date(),
};

const SUGGESTED_QUESTIONS = [
  "What's your tech stack?",
  'Tell me about your projects',
  'Are you open to work?',
];

const HIRE_KEYWORDS = ['hire me', 'hire you', 'want to hire', 'looking to hire', 'you hired'];

const EASTER_EGG_RESPONSE =
  "🎉 YES! I'm ready to join your team! Let's make something amazing together. Email me at ramanathanmurugappan29@gmail.com 🚀";

const CONFETTI_COLORS = ['#1e6ef4', '#4f46e5', '#f59e0b', '#10b981', '#ef4444'];

function loadHistory(): Message[] {
  try {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(-20).map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
      }
    }
  } catch { /* ignore */ }
  return [WELCOME_MESSAGE];
}

export default function Chatbot({ isOpen: externalIsOpen, onToggle }: ChatbotProps = {}) {
  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'text' | 'voice'>('text');
  const [isListening, setIsListening] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const dictationRef = useRef<any>(null);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [lastBotResponse, setLastBotResponse] = useState('');
  const recognitionRef = useRef<any>(null);
  const recorderRef = useRef<{ recorder: MediaRecorder; stream: MediaStream } | null>(null);
  const conversationActiveRef = useRef(false);

  // Typing reveal state
  const [displayContents, setDisplayContents] = useState<Record<string, string>>({});
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Easter egg confetti state
  const [confettiId, setConfettiId] = useState<string | null>(null);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (value: boolean) => {
    if (onToggle) {
      onToggle(value);
    } else {
      setInternalIsOpen(value);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openaiRef = useRef<OpenAI | null>(null);
  const chatRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Persist chat history (capped at 20 messages)
  useEffect(() => {
    if (messages.length > 0) {
      const toSave = messages.slice(-20);
      localStorage.setItem('chat_history', JSON.stringify(toSave));
    }
  }, [messages]);

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  // Reveal message character by character
  const revealMessage = useCallback((id: string, content: string) => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setDisplayContents((prev) => ({ ...prev, [id]: '' }));
    let i = 0;
    typingIntervalRef.current = setInterval(() => {
      i++;
      setDisplayContents((prev) => ({ ...prev, [id]: content.slice(0, i) }));
      if (i >= content.length) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    }, 25);
  }, []);

  // VoiceRSS TTS — Indian English male voice, returns audio ArrayBuffer
  const elevenLabsTTS = async (text: string): Promise<ArrayBuffer> => {
    const apiKey = import.meta.env.VITE_VOICERSS_API_KEY;
    const params = new URLSearchParams({
      key: apiKey,
      hl: 'en-in',
      v: 'Ajit',
      src: text,
      c: 'MP3',
      f: '44khz_16bit_stereo',
      ssml: 'false',
      b64: 'false',
    });
    const response = await fetch(`https://api.voicerss.org/?${params.toString()}`);
    if (!response.ok) throw new Error(`VoiceRSS TTS error: ${response.status}`);
    return response.arrayBuffer();
  };

  // Initialize OpenAI SDK with Groq base URL
  useEffect(() => {
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('Groq API key not found. Please set VITE_GROQ_API_KEY in .env.local');
      }
      openaiRef.current = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
        dangerouslyAllowBrowser: true,
      });
      chatRef.current = {
        history: [] as { role: string; content: string }[],
        sendMessage: async (message: string) => {
          const allMessages = [
            { role: 'system' as const, content: PROFILE_CONTEXT },
            ...chatRef.current.history,
            { role: 'user' as const, content: message },
          ];

          let lastError: any;
          for (const model of GROQ_MODELS) {
            try {
              const completion = await openaiRef.current!.chat.completions.create({
                messages: allMessages,
                model,
                temperature: 0.7,
                max_tokens: 300,
                top_p: 1,
                stream: false,
              });
              const assistantMessage = completion.choices[0]?.message?.content || '';
              chatRef.current.history.push(
                { role: 'user', content: message },
                { role: 'assistant', content: assistantMessage }
              );
              return { response: { text: () => assistantMessage } };
            } catch (err: any) {
              lastError = err;
              continue;
            }
          }
          throw lastError;
        },
      };
    } catch (error) {
      console.error('Failed to initialize Groq client:', error);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayContents]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSpeak = async (text: string, messageId: string) => {
    if (speakingMessageId === messageId) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setSpeakingMessageId(null);
      return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setSpeakingMessageId(messageId);
    try {
      const buffer = await elevenLabsTTS(text);
      const url = URL.createObjectURL(new Blob([buffer], { type: 'audio/mpeg' }));
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; setSpeakingMessageId(null); };
      audio.onerror = () => { URL.revokeObjectURL(url); audioRef.current = null; setSpeakingMessageId(null); };
      await audio.play();
    } catch {
      setSpeakingMessageId(null);
    }
  };

  // Core send logic, shared between input submit and chip click
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !chatRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    // Easter egg check
    const isHire = HIRE_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));
    if (isHire) {
      const eggId = (Date.now() + 1).toString();
      const eggMessage: Message = {
        id: eggId,
        role: 'bot',
        content: EASTER_EGG_RESPONSE,
        timestamp: new Date(),
        isEasterEgg: true,
      };
      setMessages((prev) => [...prev, eggMessage]);
      setConfettiId(eggId);
      revealMessage(eggId, EASTER_EGG_RESPONSE);
      setTimeout(() => setConfettiId(null), 2000);
      setLoading(false);
      return;
    }

    try {
      const result = await chatRef.current.sendMessage(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: result.response.text(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      revealMessage(botMessage.id, botMessage.content);
    } catch (error: any) {
      const status = error?.status ?? error?.response?.status;
      let friendlyMsg: string;
      if (status === 429 || error?.message?.toLowerCase().includes('rate limit')) {
        friendlyMsg = "I've hit my API rate limit for now. Please try again in a few minutes — or come back tomorrow. Sorry for the inconvenience!";
      } else if (status === 401 || error?.message?.toLowerCase().includes('api key')) {
        friendlyMsg = "There's an API key configuration issue. Please contact me at ramanathanmurugappan29@gmail.com.";
      } else if (error?.message?.toLowerCase().includes('network') || error?.message?.toLowerCase().includes('fetch')) {
        friendlyMsg = "Network error — please check your internet connection and try again.";
      } else {
        friendlyMsg = `Something went wrong: ${error?.message || 'Unknown error'}. Please try again later.`;
      }
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: friendlyMsg,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      revealMessage(errorMessage.id, friendlyMsg);
    } finally {
      setLoading(false);
    }
  }, [revealMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    await sendMessage(text);
  };

  const handleChipClick = (question: string) => {
    sendMessage(question);
  };

  const handleNewChat = useCallback(() => {
    localStorage.removeItem('chat_history');
    setMessages([{ ...WELCOME_MESSAGE, id: Date.now().toString(), timestamp: new Date() }]);
    setDisplayContents({});
    setInput('');
    if (chatRef.current) chatRef.current.history = [];
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setSpeakingMessageId(null);
    if (typingIntervalRef.current) { clearInterval(typingIntervalRef.current); typingIntervalRef.current = null; }
  }, []);

  // Speech-to-text for chat input (mic icon in text mode)
  const toggleDictation = useCallback(() => {
    if (isDictating && dictationRef.current) {
      dictationRef.current.stop();
      setIsDictating(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    dictationRef.current = recognition;

    recognition.onstart = () => setIsDictating(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev ? prev + ' ' + transcript : transcript);
      setIsDictating(false);
    };
    recognition.onerror = () => setIsDictating(false);
    recognition.onend = () => setIsDictating(false);

    try { recognition.start(); } catch { setIsDictating(false); }
  }, [isDictating]);

  const interruptedRef = useRef(false);

  const speakText = useCallback((text: string): Promise<'completed' | 'interrupted'> => {
    return new Promise(async (resolve) => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      interruptedRef.current = false;
      try {
        const buffer = await elevenLabsTTS(text);
        if (interruptedRef.current) { resolve('interrupted'); return; }
        const url = URL.createObjectURL(new Blob([buffer], { type: 'audio/mpeg' }));
        const audio = new Audio(url);
        audioRef.current = audio;
        const cleanup = () => { URL.revokeObjectURL(url); audioRef.current = null; };
        audio.onended = () => { cleanup(); resolve(interruptedRef.current ? 'interrupted' : 'completed'); };
        audio.onerror = () => { cleanup(); resolve('completed'); };
        audio.onpause = () => { if (!audio.ended) { cleanup(); resolve('interrupted'); } };
        await audio.play();
      } catch {
        resolve('completed');
      }
    });
  }, []);

  const listenOnce = useCallback((): Promise<string | null> => {
    return new Promise(async (resolve) => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        setIsListening(false);
        if (err.name === 'NotAllowedError') {
          setLastBotResponse('Microphone access denied. Please allow microphone permission and try again.');
        } else {
          setLastBotResponse('Could not access microphone. Please check your browser settings.');
        }
        resolve(null);
        return;
      }

      if (!conversationActiveRef.current) {
        stream.getTracks().forEach(t => t.stop());
        resolve(null);
        return;
      }

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
        .find(t => MediaRecorder.isTypeSupported(t)) || '';

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      recorderRef.current = { recorder: mediaRecorder, stream };

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      const SILENCE_THRESHOLD = 0.012;
      const SILENCE_DURATION = 1500;
      const MAX_DURATION = 15000;
      const startTime = Date.now();
      let speechStarted = false;
      let silenceStart = 0;

      const stopRecording = () => {
        if (mediaRecorder.state === 'recording') mediaRecorder.stop();
        stream.getTracks().forEach(t => t.stop());
        audioContext.close();
        recorderRef.current = null;
      };

      const checkAudio = () => {
        if (!conversationActiveRef.current || mediaRecorder.state !== 'recording') return;
        analyser.getFloatTimeDomainData(dataArray);
        const rms = Math.sqrt(dataArray.reduce((s, v) => s + v * v, 0) / bufferLength);
        if (rms > SILENCE_THRESHOLD) {
          speechStarted = true;
          silenceStart = 0;
        } else if (speechStarted) {
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
          const apiKey = import.meta.env.VITE_GROQ_API_KEY;
          const formData = new FormData();
          formData.append('file', new File([blob], 'audio.webm', { type: mimeType || 'audio/webm' }));
          formData.append('model', 'whisper-large-v3-turbo');
          formData.append('language', 'en');
          const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}` },
            body: formData,
          });
          const data = await res.json();
          const transcript = data.text?.trim() || null;
          resolve(transcript);
        } catch {
          resolve(null);
        }
      };

      setIsListening(true);
      setVoiceStatus('listening');
      mediaRecorder.start(100);
      requestAnimationFrame(checkAudio);
    });
  }, []);

  const stopConversation = useCallback(() => {
    conversationActiveRef.current = false;
    if (recorderRef.current) {
      try { recorderRef.current.recorder.stop(); recorderRef.current.stream.getTracks().forEach(t => t.stop()); } catch { /* ignore */ }
      recorderRef.current = null;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    interruptedRef.current = true;
    setIsListening(false);
    setVoiceStatus('idle');
  }, []);

  const runConversationLoop = useCallback(async () => {
    conversationActiveRef.current = true;

    const transcript = await listenOnce();
    if (!conversationActiveRef.current) { setVoiceStatus('idle'); setIsListening(false); return; }
    if (!transcript || !transcript.trim()) { stopConversation(); return; }
    if (!chatRef.current) { stopConversation(); return; }

    setVoiceStatus('thinking');
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: transcript.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await chatRef.current.sendMessage(transcript.trim());
      const responseText = result.response.text();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setLastBotResponse(responseText);

      if (!conversationActiveRef.current) { stopConversation(); return; }

      setVoiceStatus('speaking');
      await speakText(responseText);
    } catch (error: any) {
      const status = error?.status ?? error?.response?.status;
      let friendlyMsg: string;
      if (status === 429 || error?.message?.toLowerCase().includes('rate limit')) {
        friendlyMsg = "I've hit my API rate limit for now. Please try again in a few minutes — or come back tomorrow. Sorry for the inconvenience!";
      } else if (status === 401 || error?.message?.toLowerCase().includes('api key')) {
        friendlyMsg = "There's an API key configuration issue. Please contact me at ramanathanmurugappan29@gmail.com.";
      } else if (error?.message?.toLowerCase().includes('network') || error?.message?.toLowerCase().includes('fetch')) {
        friendlyMsg = "Network error — please check your internet connection and try again.";
      } else {
        friendlyMsg = `Something went wrong: ${error?.message || 'Unknown error'}. Please try again later.`;
      }
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: friendlyMsg,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLastBotResponse(friendlyMsg);
    }

    stopConversation();
  }, [listenOnce, speakText, stopConversation]);

  const toggleListening = useCallback(() => {
    if (!window.isSecureContext) {
      setLastBotResponse('Voice mode requires HTTPS or localhost.');
      return;
    }
    if (conversationActiveRef.current) {
      stopConversation();
    } else {
      runConversationLoop();
    }
  }, [runConversationLoop, stopConversation]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      stopConversation();
    };
  }, [stopConversation]);

  useEffect(() => {
    if (!isOpen) {
      stopConversation();
      if (dictationRef.current) {
        try { dictationRef.current.stop(); } catch { /* ignore */ }
        setIsDictating(false);
      }
    }
  }, [isOpen, stopConversation]);

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

  const voiceStatusText = {
    idle: 'Tap mic to speak',
    listening: 'Listening... (speak now)',
    thinking: 'Thinking...',
    speaking: 'Speaking... (tap to stop)',
  };

  // Get display text for a bot message (animated or full)
  const getDisplayText = (msg: Message) => {
    if (msg.role !== 'bot') return msg.content;
    if (msg.id in displayContents) return displayContents[msg.id];
    return msg.content;
  };

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 w-[320px] max-w-[calc(100vw-32px)] md:max-w-[calc(100vw-48px)]">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 rounded-[24px] overflow-hidden flex flex-col h-[460px] md:h-[520px] max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-140px)] bg-white dark:bg-[#111] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.07)]">

          {/* ── Header ── */}
          <div className="relative px-4 py-[10px] flex items-center justify-between bg-gradient-to-r from-[#0c1425] via-[#162040] to-[#0c1425] flex-shrink-0">
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#1e6ef4] to-transparent opacity-50" />
            <div className="flex items-center gap-[10px]">
              <div className="relative flex-shrink-0">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-gradient-to-br from-[#1e6ef4] to-[#4f46e5] flex items-center justify-center text-white text-[13px] font-bold shadow-[0_0_12px_rgba(30,110,244,0.45)]">
                  R
                </div>
                <div className="absolute -bottom-[2px] -right-[2px] w-[9px] h-[9px] rounded-full bg-[#35c759] border-[2px] border-[#0c1425]" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-white leading-none">Ramanathan's AI</h3>
                <p className="text-[10px] text-white/35 mt-[3px]">Always online</p>
              </div>
            </div>
            <div className="flex items-center gap-[6px]">
              <div className="flex items-center bg-white/[0.07] rounded-[8px] p-[2px]">
                <button
                  onClick={() => setChatMode('text')}
                  className={`text-[10px] px-[10px] py-[4px] rounded-[6px] font-semibold transition-all duration-200 ${
                    chatMode === 'text' ? 'bg-[#1e6ef4] text-white' : 'text-white/45 hover:text-white/70'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setChatMode('voice')}
                  className={`text-[10px] px-[10px] py-[4px] rounded-[6px] font-semibold transition-all duration-200 ${
                    chatMode === 'voice' ? 'bg-[#1e6ef4] text-white' : 'text-white/45 hover:text-white/70'
                  }`}
                >
                  Voice
                </button>
              </div>
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-all duration-200 text-[18px] leading-none"
              >
                ×
              </button>
            </div>
          </div>

          {chatMode === 'text' ? (
            <>
              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto chat-messages p-3 space-y-[10px] bg-[#f6f6f7] dark:bg-[#0a0a0a]">

                {/* New conversation pill — shown when history exists */}
                {messages.length > 1 && (
                  <div className="flex justify-center pt-[2px] pb-[4px]">
                    <button
                      onClick={handleNewChat}
                      className="flex items-center gap-[5px] px-[12px] py-[5px] rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1c1c1e] text-[11px] font-semibold text-black/35 dark:text-white/35 hover:text-[#1e6ef4] hover:border-[#1e6ef4]/40 hover:bg-[#1e6ef4]/5 transition-all duration-200 shadow-sm"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                      </svg>
                      New conversation
                    </button>
                  </div>
                )}

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
                        {msg.role === 'bot' && (
                          <div className="w-[20px] h-[20px] rounded-[6px] bg-gradient-to-br from-[#1e6ef4] to-[#4f46e5] flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0 mb-[2px]">
                            R
                          </div>
                        )}
                        <div className="relative">
                          {/* Easter egg confetti burst */}
                          {msg.isEasterEgg && confettiId === msg.id && (
                            <div className="absolute -top-[20px] left-0 flex gap-[6px] pointer-events-none">
                              {CONFETTI_COLORS.map((color, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ y: 0, x: 0, opacity: 1, scale: 0 }}
                                  animate={{ y: -40, x: (i - 2) * 14, opacity: 0, scale: 1.5 }}
                                  transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
                                  style={{ backgroundColor: color }}
                                  className="w-[8px] h-[8px] rounded-full"
                                />
                              ))}
                            </div>
                          )}
                          <div
                            className={`rounded-[14px] px-[12px] py-[8px] text-[12px] md:text-[13px] leading-[155%] ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-br from-[#1e6ef4] to-[#4f46e5] text-white rounded-br-[4px]'
                                : msg.isEasterEgg
                                ? 'bg-gradient-to-br from-[#1e6ef4]/10 to-[#4f46e5]/10 text-black/85 dark:text-white/85 border-l-2 border-[#1e6ef4] rounded-bl-[4px] shadow-sm dark:shadow-none'
                                : 'bg-white dark:bg-[#1c1c1e] text-black/85 dark:text-white/85 border-l-2 border-[#1e6ef4] rounded-bl-[4px] shadow-sm dark:shadow-none'
                            }`}
                          >
                            {getDisplayText(msg)}
                          </div>
                        </div>
                        {msg.role === 'bot' && (
                          <button
                            onClick={() => handleSpeak(msg.content, msg.id)}
                            className={`flex-shrink-0 w-[20px] h-[20px] flex items-center justify-center rounded-full text-[10px] transition-all hover:bg-black/10 dark:hover:bg-white/10 mb-[2px] ${
                              speakingMessageId === msg.id ? 'text-[#1e6ef4] animate-pulse' : 'text-black/25 dark:text-white/25'
                            }`}
                            title={speakingMessageId === msg.id ? 'Stop speaking' : 'Read aloud'}
                          >
                            {speakingMessageId === msg.id ? '🔊' : '🔈'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* ── Wave-bar typing indicator ── */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-end gap-[6px]">
                      <div className="w-[20px] h-[20px] rounded-[6px] bg-gradient-to-br from-[#1e6ef4] to-[#4f46e5] flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                        R
                      </div>
                      <div className="bg-white dark:bg-[#1c1c1e] rounded-[14px] rounded-bl-[4px] border-l-2 border-[#1e6ef4] px-[12px] py-[10px] shadow-sm flex items-end gap-[3px]">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-[3px] rounded-full bg-[#1e6ef4]"
                            style={{ animation: 'wave-bar 1s ease-in-out infinite', animationDelay: `${i * 0.12}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Suggested question chips — shown only before first user message ── */}
              {messages.length === 1 && !loading && (
                <div className="px-3 pt-[6px] pb-[2px] flex flex-wrap gap-[6px] bg-[#f6f6f7] dark:bg-[#0a0a0a] flex-shrink-0">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleChipClick(q)}
                      className="px-[10px] py-[5px] rounded-full border border-[#1e6ef4]/30 text-[11px] font-semibold text-[#1e6ef4] hover:bg-[#1e6ef4]/10 transition-all duration-200 whitespace-nowrap"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Input area ── */}
              <div className="border-t border-black/[0.05] dark:border-white/[0.05] px-3 py-[10px] bg-white dark:bg-[#111] flex-shrink-0">
                <form onSubmit={handleSendMessage}>
                  <div className="relative bg-[#f4f4f5] dark:bg-[#1c1c1e] rounded-[14px] ring-1 ring-black/[0.06] dark:ring-white/[0.05] focus-within:ring-[#1e6ef4]/50 transition-all duration-200">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything..."
                      className="w-full bg-transparent text-[12px] md:text-[13px] placeholder-black/30 dark:placeholder-white/25 focus:outline-none text-black dark:text-white pl-[12px] pr-[74px] py-[9px] rounded-[14px]"
                      disabled={loading}
                    />
                    <div className="absolute right-[8px] top-1/2 -translate-y-1/2 flex items-center gap-[4px]">
                      {/* Mic */}
                      <button
                        type="button"
                        onClick={toggleDictation}
                        disabled={loading}
                        className={`w-[28px] h-[28px] rounded-[8px] flex items-center justify-center transition-all duration-200 ${
                          isDictating
                            ? 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                            : 'text-black/30 dark:text-white/30 hover:text-[#1e6ef4] hover:bg-[#1e6ef4]/10'
                        } disabled:opacity-40`}
                        title={isDictating ? 'Stop listening' : 'Speak to type'}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                          <line x1="12" y1="19" x2="12" y2="23"/>
                          <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                      </button>
                      {/* Send */}
                      <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="w-[28px] h-[28px] rounded-[8px] bg-gradient-to-br from-[#1e6ef4] to-[#4f46e5] text-white flex items-center justify-center transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:opacity-30"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* ── Voice Mode ── */
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f6f6f7] dark:bg-[#0a0a0a] p-6 gap-5">
              <div className="relative">
                {(voiceStatus === 'listening' || voiceStatus === 'speaking') && (
                  <>
                    <div className={`absolute -inset-6 rounded-full animate-ping opacity-20 ${voiceStatus === 'listening' ? 'bg-red-500' : 'bg-[#1e6ef4]'}`} style={{ animationDuration: '2s' }} />
                    <div className={`absolute -inset-3 rounded-full animate-ping opacity-30 ${voiceStatus === 'listening' ? 'bg-red-500' : 'bg-[#1e6ef4]'}`} style={{ animationDuration: '1.5s' }} />
                  </>
                )}
                <button
                  onClick={toggleListening}
                  className={`relative z-10 w-[80px] h-[80px] rounded-full flex items-center justify-center transition-all duration-300 ${
                    voiceStatus === 'listening'
                      ? 'bg-red-500 text-white scale-110 shadow-[0_0_32px_rgba(239,68,68,0.5)]'
                      : voiceStatus === 'thinking'
                      ? 'bg-amber-500 text-white shadow-[0_0_32px_rgba(245,158,11,0.4)]'
                      : 'bg-gradient-to-br from-[#1e6ef4] to-[#4f46e5] text-white hover:scale-105 active:scale-95 shadow-[0_0_28px_rgba(30,110,244,0.4)]'
                  }`}
                >
                  {voiceStatus === 'listening' ? (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  ) : voiceStatus === 'thinking' ? (
                    <div className="flex items-end gap-[3px]">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-[3px] rounded-full bg-white" style={{ animation: 'wave-bar 1s ease-in-out infinite', animationDelay: `${i * 0.12}s` }} />
                      ))}
                    </div>
                  ) : voiceStatus === 'speaking' ? (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  ) : (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>

              <p className={`text-[12px] font-semibold tracking-wide uppercase ${
                voiceStatus === 'listening' ? 'text-red-500'
                : voiceStatus === 'speaking' ? 'text-[#1e6ef4]'
                : voiceStatus === 'thinking' ? 'text-amber-500'
                : 'text-black/35 dark:text-white/35'
              }`}>
                {voiceStatusText[voiceStatus]}
              </p>

              {lastBotResponse && (
                <div className="w-full bg-white dark:bg-[#1c1c1e] rounded-[16px] p-[14px] border-l-2 border-[#1e6ef4] shadow-sm">
                  <p className="text-[11px] md:text-[12px] text-black/60 dark:text-white/60 leading-[165%]">
                    {lastBotResponse}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toggle Button */}
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
