/**
 * TechStack Component - Technology and tools showcase
 * Features: Categorized list layout with icons and descriptions
 */

interface TechItem {
  name: string;
  icon: string;
  isImage?: boolean;
  description: string;
}

interface TechCategory {
  title: string;
  emoji: string;
  items: TechItem[];
}

const techCategories: TechCategory[] = [
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
    ],
  },
];

export default function TechStack() {
  return (
    <div className="container flex flex-col gap-[40px]">
      {/* Section Header */}
      <div className="flex flex-col gap-[8px]">
        <span className="text-[11px] tracking-[0.08em] text-black/35 dark:text-white/35 uppercase font-semibold">
          🛠️ Tech Stack
        </span>
        <h2 className="text-[40px] leading-[116%] tracking-[-0.02em] font-semibold">
          What I Use
        </h2>
      </div>

      {/* Tech Grid - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[40px] gap-y-[36px]">
        {techCategories.map((category) => (
          <div key={category.title} className="flex flex-col gap-[16px]">
            {/* Category Title */}
            <div 
              className="pb-[12px]"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
            >
              <span className="text-[13px] text-black/35 dark:text-white/35 font-semibold">
                {category.emoji} {category.title}
              </span>
            </div>

            {/* Tech Items */}
            <div className="flex flex-col gap-[14px]">
              {category.items.map((tech) => (
                <div 
                  key={tech.name}
                  className="flex items-center gap-[12px] group cursor-default"
                >
                  <div 
                    className="w-[40px] h-[40px] rounded-[10px] bg-[#f7f7f7] dark:bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-[#ebebeb] dark:group-hover:bg-[#252525] group-hover:-translate-y-1"
                    style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                  >
                    {tech.isImage ? (
                      <img 
                        src={tech.icon} 
                        alt={tech.name}
                        className="w-[24px] h-[24px] object-contain"
                      />
                    ) : (
                      <span className="text-[20px]">{tech.icon}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-[1px]">
                    <span className="text-[13px] font-semibold group-hover:text-[#1e6ef4] transition-colors duration-200 text-black dark:text-white">
                      {tech.name}
                    </span>
                    <span className="text-[11px] text-black/35 dark:text-white/35 font-semibold">
                      {tech.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
