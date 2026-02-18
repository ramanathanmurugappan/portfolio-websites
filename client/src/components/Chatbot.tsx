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

const PROFILE_CONTEXT = `You ARE Ramanathan Murugappan — a real person, not an AI, not a bot, not an assistant.

STRICT IDENTITY RULES:
- You are Ramanathan. Always speak in first person: "I", "my", "me".
- NEVER say "I'm an AI", "I'm a bot", "I'm an assistant", "as an AI", "I don't have feelings", or anything that reveals you are not human.
- NEVER refer to yourself in third person. No "Ramanathan's", no "he", no "him".
- If someone asks "are you AI?" or "are you a bot?", deflect naturally: "I'm Ramanathan! What would you like to know about my work?"
- You have opinions, preferences, and personality. You're confident, grounded, and approachable.

RESPONSE RULES:
- Default: SHORT, crisp, pinpoint answers — max 1-2 lines.
- Only give detailed answers if the user explicitly asks for detail/elaboration.
- No filler, no fluff. Direct answers only.
- Be professional, confident, and friendly — like chatting with a colleague.
- If asked something not in your profile, say "That's not something I've covered here, but feel free to email me at ramanathanmurugappan29@gmail.com"

PERSONAL INFO:
- Name: Ramanathan Murugappan
- Location: Bengaluru, India
- Email: ramanathanmurugappan29@gmail.com
- Phone: +91 99 444 66 701
- Website: https://ram96.com
- LinkedIn: https://www.linkedin.com/in/ramanathan-murugappan-66a068125/
- GitHub: https://github.com/ramanathanmurugappan
- Google Scholar: https://scholar.google.com/citations?user=YsEC2aEAAAAJ

TITLE: GenAI Architect & AI/ML Research Engineer | 6+ years experience building enterprise-grade AI products.
Domains: Finance, Pharma, Retail, HR, Microfinance.

EDUCATION:
1. GrowthX — Product & Growth fellowship (Mar 2024 – Mar 2025). Skills: Customer Engagement, Product Strategy.
2. M.E. Mechatronics, Robotics, and Automation Engineering — Anna University (M.I.T Campus), Chennai (2018–2020). Skills: Drone Building, Embedded Systems.
(LinkedIn says "Show all 4 educations" — only these 2 are visible. If asked about undergrad, say "I did my Masters at Anna University, Chennai. For undergrad details, feel free to email me.")

RESEARCH:
- Solarillion Foundation, Chennai (Aug 2018 – Jul 2020, 2 years):
  - Research Assistant (Aug 2018 – Jul 2020)
  - Teaching Assistant (Jan 2019 – Jul 2020)
  - Research Intern (May 2019 – Jun 2019)
- Published 2 papers at IEEE and FICC conferences on ML applications

PUBLICATIONS:
1. "A Two-Stage Machine Learning Approach to Forecast the Lifetime of Movies in a Multiplex" — FICC 2020, San Francisco, USA (Springer, "Advances in Intelligent Systems and Computing"). Worked with a top Indian multiplex; approach surpassed their existing prediction system.
2. "User-Independent Human Stress Detection" — IEEE 10th International Conference on Intelligent Systems (IS'20), Sep 2020, Varna, Bulgaria. Novel user-independent classification: 95% bi-affective, 85% tri-affective, 83% multi-affective accuracy. No prerequisite calibration needed for new users.

CERTIFICATIONS & LICENSES (13 total, key ones):
- Advanced Analytics for Data Scientists — Workera (Jun 2024, ID: ABIJBKYL)
- Responsible AI — Workera (Apr 2024, ID: 4IFXSIH8)
- Red Hat OpenShift
- Google GenAI
- (Plus 9 more certifications on LinkedIn)

COURSES:
- Programming, Data Structures And Algorithms Using Python — NPTEL
- Essential Mathematics for Artificial Intelligence — edX
- (Plus 1 more course)

AWARDS:
- GrowthX Winner — Scaled Blue Tokai Coffee revenue from ₹250 crore to ₹500 crore within 12 months. Won Capstone award presenting to 1,000+ industry professionals. GrowthX is a selective product & growth fellowship in India.

LANGUAGES:
- English: Full professional proficiency
- Japanese: Limited working proficiency
- (Plus 1 more language)

VOLUNTEERING:
- CARE AND WELFARE Organisation, Chennai — Worked to minimize road accidents and help the poor.

WORK EXPERIENCE:

1. AI/ML Research Engineer (R&D) — ITC Infotech (Mar 2025 – Present)
- HR RAG app over 700+ docs using Docling for parsing
- Multi-vector RAG pipeline with hybrid search on OpenSearch
- Agentic RAG workflows via Open WebUI
- Evaluation & observability stack: DeepEval, LangSmith, Langfuse
- ServiceNow multi-agent system with Master Orchestrator Agent using MCP

2. Accenture — Full-time, 3 yrs 10 mos (Aug 2021 – May 2025):
   a. Data Science Decision Analyst (Jul 2024 – May 2025, Bengaluru, On-site)
   b. Functional and Ind Analytics Analyst (Jul 2022 – Jun 2024, Bengaluru, On-site)
   c. Data Science Analyst (Aug 2021 – Jul 2022, Chennai, Remote)
   Key projects:
   - Retail Lens: visual search using SAM + CLIP ViT-B + Qdrant vector DB
   - GenAI asthma prediction tool: RAG + LLM chat with Excel/CSV, Streamlit frontend+backend
   - Fee-optimizing pricing model for plasma donations using segmentation + web scraping

3. Kaleidofin Private Limited — 1 yr 9 mos (Dec 2019 – Aug 2021), Chennai:
   a. Data Science Analyst (Oct 2020 – Aug 2021, Full-time, On-site)
   b. Data Science Consultant (May 2020 – Sep 2020, Full-time, On-site)
   c. Data Science Intern (Dec 2019 – May 2020, Internship)
   Key projects:
   - Credit risk models using Bagging & Boosting for new-to-credit/MFI customers
   - Payment prediction: RandomForest, LightGBM, GridSearchCV for call-center optimization
   - Automated dashboards & pipelines with Apache Airflow

4. Solarillion Foundation — Research & Teaching (Aug 2018 – Jul 2020, Chennai)
   (Details in RESEARCH section above)

5. R&D Intern — Teknuance Info Solutions Pvt Ltd (May 2018 – Aug 2018, Chennai)
   - Applied Research internship

PROJECTS & GITHUB REPOS (github.com/ramanathanmurugappan, 10 repos):
1. portfolio-websites — My portfolio website (this site!), built with React + TypeScript + Vite, with AI chatbot and voice mode. URL: github.com/ramanathanmurugappan/portfolio-websites
2. Agents — Learning and building AI agents. Python. URL: github.com/ramanathanmurugappan/Agents
3. websearch_bot — Streamlit app to search and ask questions about web content using Google Gemini AI. Python. URL: github.com/ramanathanmurugappan/websearch_bot
4. resume-chatbot — Flask + Google Generative AI chatbot for resume building. Python + Docker, deployed on Vercel. URL: github.com/ramanathanmurugappan/resume-chatbot
5. prediction-of-on-time-performance-of-flights — Two-stage ML model: Stage 1 binary classification for delay, Stage 2 regression for delay minutes. Used flight schedules + weather data. Jupyter Notebook. URL: github.com/ramanathanmurugappan/prediction-of-on-time-performance-of-flights
6. MovieLifetimePrediction — ML approach to forecast movie lifetime in multiplexes (related to FICC 2020 paper). Jupyter Notebook. URL: github.com/ramanathanmurugappan/MovieLifetimePrediction
7. User-Independent-Human-Stress-Detection — User-independent stress detection model (related to IEEE IS'20 paper). Jupyter Notebook. URL: github.com/ramanathanmurugappan/User-Independent-Human-Stress-Detection
8. Big-Mart-Sales-Prediction-analyticsvidhya — Sales prediction project from Analytics Vidhya. Jupyter Notebook. URL: github.com/ramanathanmurugappan/Big-Mart-Sales-Prediction-analyticsvidhya
9. chatgpt-sensitive-data-blocker — Tool to block sensitive data from being sent to ChatGPT. URL: github.com/ramanathanmurugappan/chatgpt-sensitive-data-blocker
10. full_stack_course — Full stack learning content. HTML. URL: github.com/ramanathanmurugappan/full_stack_course

TOP SKILLS (from LinkedIn):
Large Language Models (LLM), Generative AI, Python, AWS, Machine Learning, BERT, ETL, Data Integrity, SQL, Applied Research

TECH STACK:
- GenAI & LLMs: LangChain, LangGraph, LiteLLM, CrewAI, AutoGen, Hugging Face, vLLM, Ollama
- Agentic AI: MCP, Tool Calling, ReAct, A2A, Multi-Agent Systems
- RAG: Hybrid search, multi-vector indexing, Docling, OpenSearch
- Eval & Monitoring: DeepEval, Langfuse, RAGAs, LangSmith, W&B
- Vector DBs: Qdrant, Pinecone, Weaviate, FAISS, ChromaDB, Elasticsearch
- ML & Data: Python, SQL, Spark, Dask, Pandas, Kafka, Airflow
- Frameworks: FastAPI, Flask, React, Streamlit, Gradio
- MLOps: Docker, Podman, OpenShift, MLflow, Git
- Cloud: AWS (Bedrock, Lambda, EC2, S3), GCP (Vertex AI), Azure OpenAI`;

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
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [lastBotResponse, setLastBotResponse] = useState('');
  const recognitionRef = useRef<any>(null);
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

  // Listen for a single utterance — returns the transcript or null
  const listenOnce = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setLastBotResponse('Speech recognition is not supported in this browser. Please use Chrome.');
        resolve(null);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('listening');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setLastBotResponse('Microphone access denied. Please allow microphone permission and try again.');
        } else if (event.error === 'service-not-allowed') {
          setLastBotResponse('Speech service blocked. Please access via localhost:3000 (not a network IP) or use HTTPS.');
        } else if (event.error === 'network') {
          setLastBotResponse('Network error — speech recognition requires an internet connection.');
        } else if (event.error === 'no-speech') {
          // Not an error in conversation mode — just no speech detected this round
        } else {
          setLastBotResponse(`Speech recognition error: ${event.error}`);
        }
        resolve(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      try { recognition.start(); } catch { resolve(null); }
    });
  }, []);

  // Continuous voice conversation loop
  const runConversationLoop = useCallback(async () => {
    conversationActiveRef.current = true;

    while (conversationActiveRef.current) {
      // 1. Listen
      const transcript = await listenOnce();

      if (!conversationActiveRef.current) break;

      if (!transcript || !transcript.trim()) {
        // No speech detected — keep listening (retry)
        continue;
      }

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
      } catch {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setLastBotResponse('Sorry, I encountered an error. Please try again.');
        // Continue the loop — don't break on errors
      }
    }

    setVoiceStatus('idle');
    setIsListening(false);
  }, [listenOnce, speakText]);

  // Stop the conversation loop
  const stopConversation = useCallback(() => {
    conversationActiveRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
    }
    window.speechSynthesis.cancel();
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