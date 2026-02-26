export interface TechItem {
  name: string;
  icon: string;
  isImage?: boolean;
  darkInvert?: boolean; // true for monochromatic black SVGs — inverts to white in dark mode
  description: string;
}

export interface TechCategory {
  title: string;
  emoji: string;
  items: TechItem[];
}

export const techCategories: TechCategory[] = [
  {
    title: 'Gen AI & LLM',
    emoji: '🦜',
    items: [
      { name: 'LangChain',       icon: '/images/tech-logos/langchain.svg',     isImage: true, darkInvert: true, description: 'LLM orchestration framework' },
      { name: 'LangGraph',       icon: '/images/tech-logos/langchain.svg',     isImage: true, darkInvert: true, description: 'Multi-agent workflow graphs' },
      { name: 'CrewAI & AutoGen',icon: '/images/tech-logos/crewai.svg',        isImage: true, darkInvert: true, description: 'Multi-agent systems' },
      { name: 'Hugging Face',    icon: '/images/tech-logos/huggingface.svg',   isImage: true, description: 'Transformers & model hub' },
    ],
  },
  {
    title: 'Agentic AI',
    emoji: '⚡',
    items: [
      { name: 'MCP Protocol',  icon: '/images/tech-logos/anthropic.svg', isImage: true, darkInvert: true, description: 'Model Context Protocol' },
      { name: 'RAG Pipelines', icon: '📚',                                                                  description: 'Retrieval-augmented generation' },
      { name: 'Tool Calling',  icon: '🛠️',                                                                  description: 'Function & API integration' },
      { name: 'ReAct Agents',  icon: '💡',                                                                  description: 'Reasoning + Acting agents' },
    ],
  },
  {
    title: 'Vector Databases',
    emoji: '🎯',
    items: [
      { name: 'Qdrant',    icon: '/images/tech-logos/qdrant.svg',    isImage: true,                   description: 'High-performance vector search' },
      { name: 'Pinecone',  icon: '/images/tech-logos/pinecone.svg',  isImage: true, darkInvert: true, description: 'Managed vector database' },
      { name: 'OpenSearch',icon: '/images/tech-logos/opensearch.svg', isImage: true, darkInvert: true, description: 'Hybrid search engine' },
      { name: 'ChromaDB',  icon: '/images/tech-logos/chromadb.svg',  isImage: true,                   description: 'Embedding database' },
    ],
  },
  {
    title: 'ML & Data',
    emoji: '📈',
    items: [
      { name: 'Python',              icon: '/images/tech-logos/python.svg',     isImage: true, description: 'Primary programming language' },
      { name: 'PyTorch',             icon: '/images/tech-logos/pytorch.svg',    isImage: true, description: 'Deep learning framework' },
      { name: 'TensorFlow',          icon: '/images/tech-logos/tensorflow.svg', isImage: true, description: 'Deep learning framework' },
      { name: 'Pandas & Spark',      icon: '/images/tech-logos/pandas.svg',     isImage: true, darkInvert: true, description: 'Data processing at scale' },
      { name: 'PostgreSQL',          icon: '/images/tech-logos/postgresql.svg', isImage: true, description: 'Relational database' },
    ],
  },
  {
    title: 'Cloud & MLOps',
    emoji: '☁️',
    items: [
      { name: 'AWS',             icon: '/images/tech-logos/aws.svg',      isImage: true, description: 'Lambda, EC2, S3, Bedrock' },
      { name: 'Docker & OpenShift',icon: '/images/tech-logos/docker.svg', isImage: true, description: 'Containerization' },
      { name: 'MLflow',          icon: '/images/tech-logos/mlflow.svg',   isImage: true,                   description: 'ML lifecycle management' },
      { name: 'Apache Airflow',  icon: '/images/tech-logos/airflow.svg',  isImage: true, description: 'Workflow orchestration' },
    ],
  },
  {
    title: 'Frameworks & Tools',
    emoji: '🛠️',
    items: [
      { name: 'FastAPI',          icon: '/images/tech-logos/fastapi.svg',    isImage: true, description: 'High-performance APIs' },
      { name: 'React.js',         icon: '/images/tech-logos/react.svg',      isImage: true, description: 'Frontend development' },
      { name: 'Streamlit',        icon: '/images/tech-logos/streamlit.svg',  isImage: true,                   description: 'ML app interfaces' },
      { name: 'Git & GitHub',     icon: '/images/tech-logos/git.svg',        isImage: true,                   description: 'Version control' },
      { name: 'TypeScript + Vite',icon: '/images/tech-logos/typescript.svg', isImage: true, darkInvert: true, description: 'Type-safe React frontend' },
    ],
  },
  {
    title: 'Voice AI & Web',
    emoji: '🎙️',
    items: [
      { name: 'Groq API',       icon: '⚡',  description: 'LLM inference API (ultra-fast)' },
      { name: 'Deepgram',       icon: '/images/tech-logos/deepgram.svg', isImage: true, darkInvert: true, description: 'Cross-browser speech-to-text' },
      { name: 'VoiceRSS',       icon: '🔊', description: 'Indian English TTS (Ajit voice)' },
      { name: 'Web Audio API',  icon: '🎧', description: 'Silence detection & audio processing' },
    ],
  },
];
