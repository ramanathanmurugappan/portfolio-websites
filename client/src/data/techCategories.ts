export interface TechItem {
  name: string;
  icon: string;
  isImage?: boolean;
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
      { name: 'LangChain', icon: '🔗', description: 'LLM orchestration framework' },
      { name: 'LangGraph', icon: '📊', description: 'Multi-agent workflow graphs' },
      { name: 'CrewAI & AutoGen', icon: '🤖', description: 'Multi-agent systems' },
      { name: 'Hugging Face', icon: '🤗', description: 'Transformers & model hub' },
    ],
  },
  {
    title: 'Agentic AI',
    emoji: '⚡',
    items: [
      { name: 'MCP Protocol', icon: '🔗', description: 'Model Context Protocol' },
      { name: 'RAG Pipelines', icon: '📚', description: 'Retrieval-augmented generation' },
      { name: 'Tool Calling', icon: '🛠️', description: 'Function & API integration' },
      { name: 'ReAct Agents', icon: '💡', description: 'Reasoning + Acting agents' },
    ],
  },
  {
    title: 'Vector Databases',
    emoji: '🎯',
    items: [
      { name: 'Qdrant', icon: '🎯', description: 'High-performance vector search' },
      { name: 'Pinecone', icon: '🌲', description: 'Managed vector database' },
      { name: 'OpenSearch', icon: '🔍', description: 'Hybrid search engine' },
      { name: 'ChromaDB', icon: '🎨', description: 'Embedding database' },
    ],
  },
  {
    title: 'ML & Data',
    emoji: '📈',
    items: [
      { name: 'Python', icon: '/images/tech-logos/python.svg', isImage: true, description: 'Primary programming language' },
      { name: 'PyTorch & TensorFlow', icon: '🧠', description: 'Deep learning frameworks' },
      { name: 'Pandas & Spark', icon: '📊', description: 'Data processing at scale' },
      { name: 'PostgreSQL', icon: '/images/tech-logos/postgresql.svg', isImage: true, description: 'Relational database' },
    ],
  },
  {
    title: 'Cloud & MLOps',
    emoji: '☁️',
    items: [
      { name: 'AWS', icon: '/images/tech-logos/aws.svg', isImage: true, description: 'Lambda, EC2, S3, Bedrock' },
      { name: 'Docker & OpenShift', icon: '/images/tech-logos/docker.svg', isImage: true, description: 'Containerization' },
      { name: 'MLflow', icon: '📦', description: 'ML lifecycle management' },
      { name: 'Apache Airflow', icon: '/images/tech-logos/airflow.svg', isImage: true, description: 'Workflow orchestration' },
    ],
  },
  {
    title: 'Frameworks & Tools',
    emoji: '🛠️',
    items: [
      { name: 'FastAPI', icon: '/images/tech-logos/fastapi.svg', isImage: true, description: 'High-performance APIs' },
      { name: 'React.js', icon: '/images/tech-logos/react.svg', isImage: true, description: 'Frontend development' },
      { name: 'Streamlit & Gradio', icon: '🎛️', description: 'ML app interfaces' },
      { name: 'Git & GitHub', icon: '/images/tech-logos/git.svg', isImage: true, description: 'Version control' },
      { name: 'TypeScript + Vite', icon: '🔷', description: 'Type-safe React frontend' },
    ],
  },
  {
    title: 'Voice AI & Web',
    emoji: '🎙️',
    items: [
      { name: 'Groq API', icon: '⚡', description: 'LLM inference API (ultra-fast)' },
      { name: 'Deepgram', icon: '🎙️', description: 'Cross-browser speech-to-text' },
      { name: 'VoiceRSS', icon: '🔊', description: 'Indian English TTS (Ajit voice)' },
      { name: 'Web Audio API', icon: '🎧', description: 'Silence detection & audio processing' },
    ],
  },
];
