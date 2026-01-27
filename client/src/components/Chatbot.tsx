import { useState, useRef, useEffect } from 'react';
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
  
  // Debug log moved after state declarations
  console.log('Chatbot input:', input, 'loading:', loading);
  
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

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 w-[320px] max-w-[calc(100vw-32px)] md:max-w-[calc(100vw-48px)]">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 rounded-[20px] bg-white dark:bg-[#1a1a1a] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col h-[400px] md:h-[500px] max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-140px)]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e6ef4] to-[#1a5ecf] px-4 md:px-6 py-3 md:py-4 text-white flex items-center justify-between">
            <div>
              <h3 className="text-[14px] md:text-[16px] font-semibold">Ramanathan's AI</h3>
              <p className="text-[10px] md:text-[11px] text-white/70">Ask about my experience</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full w-[28px] h-[28px] flex items-center justify-center transition-all flex-shrink-0"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-[#f9f9f9] dark:bg-[#0f0f0f]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-[16px] px-3 md:px-4 py-2 text-[12px] md:text-[13px] leading-[150%] ${
                    msg.role === 'user'
                      ? 'bg-[#1e6ef4] text-white rounded-br-[4px]'
                      : 'bg-white dark:bg-[#1a1a1a] text-black/80 dark:text-white/80 border border-black/10 dark:border-white/10 rounded-bl-[4px]'
                  }`}
                >
                  {msg.content}
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