import { useState, useRef, useEffect, useCallback } from 'react';
import OpenAI from 'openai';
import { PROFILE_CONTEXT, GROQ_MODELS } from '../lib/profileContext';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export default function Chatbot({ isOpen: externalIsOpen, onToggle }: ChatbotProps = {}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: "Hi! I'm Ramanathan. Ask me anything about my experience, skills, or projects!",
      timestamp: new Date(),
    },
  ]);
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
  
  // Use external state if provided, otherwise use internal state
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
      // Use OpenAI SDK with Groq's base URL
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
                max_tokens: 300,  // Keep short — bot gives 1-2 line answers; 4096 burns TPM fast
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
              continue; // Any error — silently try next model
            }
          }
          throw lastError; // All models exhausted
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
  }, [messages]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSpeak = async (text: string, messageId: string) => {
    // If already speaking this message, stop it
    if (speakingMessageId === messageId) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setSpeakingMessageId(null);
      return;
    }

    // Stop any ongoing audio
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatRef.current) return;

    // Store the input value before clearing it
    const currentInput = input.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Use the stored input value instead of the state variable
      const result = await chatRef.current.sendMessage(currentInput);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: result.response.text(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
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
    } finally {
      setLoading(false);
    }
  };

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

  // Track whether speech was interrupted so we don't reset voiceStatus
  const interruptedRef = useRef(false);

  // Speak text using Fish Audio cloned voice (reusable for voice mode auto-speak)
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
        audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; resolve(interruptedRef.current ? 'interrupted' : 'completed'); };
        audio.onerror = () => { URL.revokeObjectURL(url); audioRef.current = null; resolve(interruptedRef.current ? 'interrupted' : 'completed'); };
        await audio.play();
      } catch {
        resolve('completed');
      }
    });
  }, []);

  // Listen for a single utterance using MediaRecorder + Deepgram (works in all browsers)
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

      // Pick best supported mime type across Chrome/Firefox/Safari
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
        .find(t => MediaRecorder.isTypeSupported(t)) || '';

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      recorderRef.current = { recorder: mediaRecorder, stream };

      // Silence detection via Web Audio API
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      const SILENCE_THRESHOLD = 0.015;
      const SILENCE_DURATION = 1500; // stop after 1.5s of silence post-speech
      const MAX_DURATION = 10000;    // 10s hard cap
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
          const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
          const res = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true', {
            method: 'POST',
            headers: { 'Authorization': `Token ${apiKey}`, 'Content-Type': mimeType || 'audio/webm' },
            body: blob,
          });
          const data = await res.json();
          const transcript = data.results?.channels[0]?.alternatives[0]?.transcript?.trim() || null;
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

  // Continuous voice conversation loop
  const runConversationLoop = useCallback(async () => {
    conversationActiveRef.current = true;

    const SILENCE_TIMEOUT_MS = 120_000; // 2 minutes
    let lastSpeechAt = Date.now();

    while (conversationActiveRef.current) {
      // 1. Listen
      const transcript = await listenOnce();

      if (!conversationActiveRef.current) break;

      if (!transcript || !transcript.trim()) {
        // No speech detected — stop if silent for 120s
        if (Date.now() - lastSpeechAt >= SILENCE_TIMEOUT_MS) {
          setLastBotResponse("Stopped listening — no input for 2 minutes. Tap the mic to start again.");
          stopConversation();
          break;
        }
        continue;
      }

      lastSpeechAt = Date.now(); // reset on each spoken input

      if (!chatRef.current) break;

      // 2. Think
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

        if (!conversationActiveRef.current) break;

        // 3. Speak
        setVoiceStatus('speaking');
        await speakText(responseText);

        if (!conversationActiveRef.current) break;

        // 4. Loop back to listening
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
        // Continue the loop — don't break on errors
      }
    }

    setVoiceStatus('idle');
    setIsListening(false);
  }, [listenOnce, speakText]);

  // Stop the conversation loop
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

  // Toggle voice conversation on/off
  const toggleListening = useCallback(() => {
    // Check secure context
    if (!window.isSecureContext) {
      setLastBotResponse('Voice mode requires HTTPS or localhost.');
      return;
    }

    if (conversationActiveRef.current) {
      // Stop the conversation
      stopConversation();
    } else {
      // Start the conversation loop
      runConversationLoop();
    }
  }, [runConversationLoop, stopConversation]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  // Stop conversation when switching away from voice mode
  useEffect(() => {
    if (chatMode !== 'voice') {
      stopConversation();
    }
  }, [chatMode, stopConversation]);

  const voiceStatusText = {
    idle: 'Tap to start conversation',
    listening: 'Listening...',
    thinking: 'Thinking...',
    speaking: 'Speaking... (tap to stop)',
  };

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 w-[320px] max-w-[calc(100vw-32px)] md:max-w-[calc(100vw-48px)]">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 rounded-[20px] bg-white dark:bg-[#1a1a1a] shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.07)] border border-black/10 dark:border-white/10 overflow-hidden flex flex-col h-[400px] md:h-[500px] max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-140px)]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e6ef4] to-[#1a5ecf] px-4 md:px-6 py-3 md:py-4 text-white flex items-center justify-between">
            <div>
              <h3 className="text-[14px] md:text-[16px] font-semibold">Ramanathan's AI</h3>
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => setChatMode('text')}
                  className={`text-[10px] md:text-[11px] px-2 py-0.5 rounded-full transition-all ${
                    chatMode === 'text'
                      ? 'bg-white/25 text-white font-semibold'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setChatMode('voice')}
                  className={`text-[10px] md:text-[11px] px-2 py-0.5 rounded-full transition-all ${
                    chatMode === 'voice'
                      ? 'bg-white/25 text-white font-semibold'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Voice
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full w-[28px] h-[28px] flex items-center justify-center transition-all flex-shrink-0"
            >
              ×
            </button>
          </div>

          {chatMode === 'text' ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-[#f9f9f9] dark:bg-[#0f0f0f]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-1 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`rounded-[16px] px-3 md:px-4 py-2 text-[12px] md:text-[13px] leading-[150%] ${
                          msg.role === 'user'
                            ? 'bg-[#1e6ef4] text-white rounded-br-[4px]'
                            : 'bg-white dark:bg-[#1a1a1a] text-black/80 dark:text-white/80 border border-black/10 dark:border-white/10 rounded-bl-[4px]'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.role === 'bot' && (
                        <button
                          onClick={() => handleSpeak(msg.content, msg.id)}
                          className={`flex-shrink-0 w-[22px] h-[22px] flex items-center justify-center rounded-full text-[11px] transition-all hover:bg-black/10 dark:hover:bg-white/10 ${
                            speakingMessageId === msg.id ? 'animate-pulse bg-[#1e6ef4]/20' : ''
                          }`}
                          title={speakingMessageId === msg.id ? 'Stop speaking' : 'Read aloud'}
                        >
                          {speakingMessageId === msg.id ? '🔊' : '🔈'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-[16px] rounded-bl-[4px] px-3 md:px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-black/40 dark:bg-white/40 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-black/40 dark:bg-white/40 animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-black/40 dark:bg-white/40 animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="border-t border-black/10 dark:border-white/10 p-2 md:p-3 bg-white dark:bg-[#1a1a1a]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 px-2 md:px-3 py-2 rounded-[12px] border border-black/10 dark:border-white/10 text-[11px] md:text-[12px] placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:border-[#1e6ef4] transition-all bg-white dark:bg-[#0f0f0f] text-black dark:text-white"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={toggleDictation}
                    disabled={loading}
                    className={`w-[34px] h-[34px] rounded-[12px] flex items-center justify-center transition-all flex-shrink-0 ${
                      isDictating
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/20'
                    } disabled:opacity-50`}
                    title={isDictating ? 'Stop listening' : 'Speak to type'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-2 md:px-3 py-2 rounded-[12px] bg-[#1e6ef4] text-white text-[11px] md:text-[12px] font-semibold hover:bg-[#1a5ecf] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Voice Mode UI */
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f9f9f9] dark:bg-[#0f0f0f] p-4">
              {/* Mic Button with pulse ring */}
              <div className="relative mb-6">
                {/* Pulse rings when listening */}
                {voiceStatus === 'listening' && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute -inset-3 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: '2s' }} />
                  </>
                )}
                {/* Pulse rings when speaking */}
                {voiceStatus === 'speaking' && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-[#1e6ef4]/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute -inset-3 rounded-full bg-[#1e6ef4]/10 animate-ping" style={{ animationDuration: '2s' }} />
                  </>
                )}
                <button
                  onClick={toggleListening}
                  className={`relative z-10 w-[80px] h-[80px] rounded-full flex items-center justify-center text-[32px] transition-all duration-300 shadow-lg ${
                    voiceStatus === 'listening'
                      ? 'bg-red-500 text-white scale-110'
                      : voiceStatus === 'thinking'
                      ? 'bg-amber-500 text-white'
                      : voiceStatus === 'speaking'
                      ? 'bg-[#1e6ef4] text-white hover:bg-red-500'
                      : 'bg-[#1e6ef4] text-white hover:bg-[#1a5ecf] hover:scale-105 active:scale-95'
                  }`}
                >
                  {voiceStatus === 'listening' ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  ) : voiceStatus === 'thinking' ? (
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  ) : voiceStatus === 'speaking' ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Status Text */}
              <p className={`text-[13px] md:text-[14px] font-medium mb-4 ${
                voiceStatus === 'listening'
                  ? 'text-red-500'
                  : voiceStatus === 'speaking'
                  ? 'text-[#1e6ef4]'
                  : 'text-black/50 dark:text-white/50'
              }`}>
                {voiceStatusText[voiceStatus]}
              </p>

              {/* Last bot response */}
              {lastBotResponse && (
                <div className="w-full max-h-[140px] overflow-y-auto px-3">
                  <p className="text-[11px] md:text-[12px] text-black/60 dark:text-white/60 text-center leading-[160%]">
                    {lastBotResponse}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toggle Button - Only show if not controlled by Navigation */}
      {!onToggle && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-[56px] h-[56px] rounded-full flex items-center justify-center font-bold text-[24px] shadow-lg hover:scale-110 transition-all duration-200 active:scale-95 ${
            isOpen
              ? 'bg-[#1e6ef4] text-white'
              : 'bg-[#1e6ef4] text-white hover:bg-[#1a5ecf]'
          }`}
        >
          {isOpen ? '↓' : '💬'}
        </button>
      )}
    </div>
  );
}