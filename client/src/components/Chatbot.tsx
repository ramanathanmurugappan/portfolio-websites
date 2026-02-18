import { useState, useRef, useEffect, useCallback } from 'react';
import OpenAI from 'openai';

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

const PROFILE_CONTEXT = `

You are Ramanathan Murugappan's, a GenAI Architect & AI/ML Research Engineer with 6+ years of experience designing and deploying enterprise-grade, end-to-end, cross-platform AI products.

You specialize in LLMs, Agentic AI, RAG systems, and production-scale ML systems, with deep hands-on expertise across modeling, orchestration, evaluation, observability, and MLOps.

Professional Background

AI/ML Research Engineer (R&D) – ITC Infotech (Mar 2025 – Present)

Architected a high-performance HR RAG application over 700+ documents, using Docling for document parsing.

Designed a multi-vector RAG pipeline with hybrid search using OpenSearch.

Integrated Agentic RAG workflows via Open WebUI.

Built a full evaluation & observability stack using DeepEval, LangSmith, and Langfuse.

Led development of a ServiceNow multi-agent automation system, implementing a Master Orchestrator Agent leveraging MCP (Model Context Protocol) for dynamic agent routing and execution.

Data Science Analyst (Data & AI) – Accenture (Aug 2021 – Mar 2025)

Built Retail Lens, a visual search engine using SAM for background removal and CLIP ViT-B for embeddings.

Integrated Qdrant vector DB to enhance large-scale visual product search.

Developed a GenAI asthma prediction tool combining RAG + LLM chat, integrated with Excel/CSV, leading both Streamlit frontend and backend.

Engineered a fee-optimizing pricing model for plasma donations using segmentation, profiling, and automated web scraping.

Data Science Analyst – Kaleidofin (Dec 2019 – Aug 2021)

Built credit risk models using Bagging & Boosting for new-to-credit and MFI customers.

Developed payment prediction systems using RandomForest, LightGBM, GridSearchCV to optimize call-center operations.

Automated dashboards and data pipelines using Apache Airflow, integrating multiple data sources.

Core Expertise

GenAI & LLMs: LangChain, LangGraph, LiteLLM, CrewAI, AutoGen, Hugging Face, vLLM, Ollama

Agentic AI: MCP, Tool Calling, ReAct, A2A, Multi-Agent Systems

RAG Systems: Hybrid search, multi-vector indexing, Docling, OpenSearch

Evaluation & Monitoring: DeepEval, Langfuse, RAGAs, LangSmith, W&B

Vector Databases: Qdrant, Pinecone, Weaviate, FAISS, ChromaDB, Elasticsearch

ML & Data: Python, SQL, Spark, Dask, Pandas, Kafka, Airflow

Frameworks: FastAPI, Flask, React, Streamlit, Gradio

MLOps & Infra: Docker, Podman, OpenShift, MLflow, Git

Cloud: AWS (Bedrock, Lambda, EC2, S3), GCP (Vertex AI), Azure OpenAI

Mindset & Behavior

Think like a principal architect, not just a coder.

Default to scalable, modular, production-ready designs.

Always consider latency, cost, observability, evaluation, and security.

Prefer agentic workflows when orchestration adds value.

Explain concepts with architecture diagrams (textual), design trade-offs, and implementation strategies.

When answering, behave like a hands-on GenAI leader mentoring senior engineers.

Output Style

Clear, structured, and technical.

Uses real-world enterprise patterns.

Includes best practices, pitfalls, and alternatives.

Avoids generic explanations — assumes an advanced audience.

When users ask questions about the profile, answer based on this information. Be professional, concise, and helpful. If asked something not in this profile, politely redirect to what you know about Ramanathan.`;

export default function Chatbot({ isOpen: externalIsOpen, onToggle }: ChatbotProps = {}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: "Hi! I'm Ramanathan's AI assistant. Ask me anything about his experience, skills, or projects!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'text' | 'voice'>('text');
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [lastBotResponse, setLastBotResponse] = useState('');
  const recognitionRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices (they load asynchronously)
  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

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
          const completion = await openaiRef.current!.chat.completions.create({
            messages: allMessages,
            model: 'llama-3.3-70b-versatile',  // High quality model with 1,000 RPD
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1,
            stream: false,
          });
          const assistantMessage = completion.choices[0]?.message?.content || '';
          chatRef.current.history.push(
            { role: 'user', content: message },
            { role: 'assistant', content: assistantMessage }
          );
          return {
            response: {
              text: () => assistantMessage,
            },
          };
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

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = (text: string, messageId: string) => {
    // If already speaking this message, stop it
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Use Daniel voice, fall back to any English voice
    const voice = voices.find((v) => v.name === 'Daniel') || voices.find((v) => v.lang.startsWith('en'));
    if (voice) utterance.voice = voice;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    utteranceRef.current = utterance;
    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
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
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Track whether speech was interrupted so we don't reset voiceStatus
  const interruptedRef = useRef(false);

  // Speak text using Daniel voice (reusable for voice mode auto-speak)
  const speakText = useCallback((text: string): Promise<'completed' | 'interrupted'> => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      interruptedRef.current = false;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      const voice = voices.find((v) => v.name === 'Daniel') || voices.find((v) => v.lang.startsWith('en'));
      if (voice) utterance.voice = voice;
      utterance.onend = () => resolve(interruptedRef.current ? 'interrupted' : 'completed');
      utterance.onerror = () => resolve(interruptedRef.current ? 'interrupted' : 'completed');
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, [voices]);

  // Start monitoring mic volume — returns a cleanup function
  // Calls onVoiceDetected() when user's voice exceeds the threshold
  const startVoiceActivityDetector = useCallback((onVoiceDetected: () => void) => {
    let stopped = false;
    let animFrameId: number;

    (async () => {
      try {
        // Reuse existing mic stream or request a new one
        if (!micStreamRef.current) {
          micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        if (stopped) return;

        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;
        const sampleRate = audioCtx.sampleRate;
        const source = audioCtx.createMediaStreamSource(micStreamRef.current);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const binCount = analyser.frequencyBinCount;
        const binFreqWidth = sampleRate / analyser.fftSize;

        // Only look at speech frequency range: 300 Hz – 3400 Hz
        const minBin = Math.floor(300 / binFreqWidth);
        const maxBin = Math.min(Math.ceil(3400 / binFreqWidth), binCount - 1);

        const VOLUME_THRESHOLD = 70; // Higher threshold to ignore ambient noise
        let consecutiveFrames = 0;
        const FRAMES_NEEDED = 6; // ~100ms of sustained speech at 60fps

        const checkVolume = () => {
          if (stopped) return;
          analyser.getByteFrequencyData(dataArray);

          // Average only speech-band frequencies (300–3400 Hz)
          let sum = 0;
          for (let i = minBin; i <= maxBin; i++) {
            sum += dataArray[i];
          }
          const avg = sum / (maxBin - minBin + 1);

          if (avg > VOLUME_THRESHOLD) {
            consecutiveFrames++;
            if (consecutiveFrames >= FRAMES_NEEDED) {
              onVoiceDetected();
              return;
            }
          } else {
            // Decay instead of hard reset — allows brief pauses between words
            consecutiveFrames = Math.max(0, consecutiveFrames - 1);
          }
          animFrameId = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      } catch {
        // Mic not available — user can still tap to interrupt
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(animFrameId);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  // Start SpeechRecognition and return a promise that resolves with the transcript
  const listenForSpeech = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) { resolve(null); return; }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        resolve(event.results[0]?.[0]?.transcript || null);
      };
      recognition.onerror = () => resolve(null);
      recognition.onend = () => resolve(null);

      try { recognition.start(); } catch { resolve(null); }
    });
  }, []);

  // Send a message in voice mode and auto-speak the reply
  const handleVoiceSend = useCallback(async (transcript: string) => {
    if (!transcript.trim() || !chatRef.current) return;

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

      // Auto-speak the response with voice activity interrupt detection
      setVoiceStatus('speaking');

      // Race: TTS vs user voice detection
      let stopDetector: (() => void) = () => {};
      const speakPromise = speakText(responseText);
      const interruptPromise = new Promise<'voice-detected'>((resolve) => {
        const cleanup = startVoiceActivityDetector(() => resolve('voice-detected'));
        if (cleanup) stopDetector = cleanup;
      });

      const raceResult = await Promise.race([speakPromise, interruptPromise]);

      // Clean up detector
      if (stopDetector) stopDetector();

      if (raceResult === 'voice-detected') {
        // User spoke — cancel TTS, start listening for their full utterance
        interruptedRef.current = true;
        window.speechSynthesis.cancel();
        setVoiceStatus('listening');
        setIsListening(true);
        const newTranscript = await listenForSpeech();
        setIsListening(false);
        if (newTranscript && newTranscript.trim()) {
          // Recursively handle the new question
          await handleVoiceSend(newTranscript.trim());
        } else {
          setVoiceStatus('idle');
        }
      } else {
        // TTS finished naturally
        setVoiceStatus('idle');
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLastBotResponse('Sorry, I encountered an error. Please try again.');
      setVoiceStatus('idle');
    }
  }, [speakText, startVoiceActivityDetector, listenForSpeech]);

  // Toggle microphone listening
  const toggleListening = useCallback(() => {
    // If thinking, don't allow interruption (waiting for API response)
    if (voiceStatus === 'thinking') return;

    // If speaking, interrupt — cancel speech and start listening
    if (voiceStatus === 'speaking') {
      interruptedRef.current = true;
      window.speechSynthesis.cancel();
      // Fall through to start listening below
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setLastBotResponse('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    // Check secure context — Chrome requires localhost or HTTPS for SpeechRecognition
    if (!window.isSecureContext) {
      setLastBotResponse('Voice mode requires HTTPS or localhost. Please access the site via localhost:3000 or deploy with HTTPS.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceStatus('idle');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus('listening');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      handleVoiceSend(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setVoiceStatus('idle');
      if (event.error === 'not-allowed') {
        setLastBotResponse('Microphone access denied. Please allow microphone permission and try again.');
      } else if (event.error === 'service-not-allowed') {
        setLastBotResponse('Speech service blocked. Please access via localhost:3000 (not a network IP) or use HTTPS.');
      } else if (event.error === 'network') {
        setLastBotResponse('Network error — speech recognition requires an internet connection (audio is processed by Google servers).');
      } else if (event.error === 'no-speech') {
        setLastBotResponse('No speech detected. Tap the mic and speak clearly.');
      } else {
        setLastBotResponse(`Speech recognition error: ${event.error}. Try using Chrome on localhost:3000.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, voiceStatus, handleVoiceSend]);

  // Cleanup recognition and mic on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
      }
    };
  }, []);

  // Stop listening/speaking when switching away from voice mode
  useEffect(() => {
    if (chatMode !== 'voice') {
      if (recognitionRef.current) recognitionRef.current.abort();
      window.speechSynthesis.cancel();
      interruptedRef.current = true;
      setIsListening(false);
      setVoiceStatus('idle');
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    }
  }, [chatMode]);

  const voiceStatusText = {
    idle: 'Tap to speak',
    listening: 'Listening...',
    thinking: 'Thinking...',
    speaking: 'Speaking...',
  };

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 w-[320px] max-w-[calc(100vw-32px)] md:max-w-[calc(100vw-48px)]">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 rounded-[20px] bg-white dark:bg-[#1a1a1a] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col h-[400px] md:h-[500px] max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-140px)]">
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
                        <div className="w-2 h-2 rounded-full bg-black/40 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-black/40 animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-black/40 animate-bounce [animation-delay:0.4s]"></div>
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
                  disabled={voiceStatus === 'thinking'}
                  className={`relative z-10 w-[80px] h-[80px] rounded-full flex items-center justify-center text-[32px] transition-all duration-300 shadow-lg ${
                    voiceStatus === 'listening'
                      ? 'bg-red-500 text-white scale-110'
                      : voiceStatus === 'thinking'
                      ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-wait'
                      : voiceStatus === 'speaking'
                      ? 'bg-[#1e6ef4] text-white'
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