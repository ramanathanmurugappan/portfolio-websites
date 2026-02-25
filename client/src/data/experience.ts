export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  location: string;
  highlights: string[];
}

export const experiences: ExperienceEntry[] = [
  {
    company: 'ITC Infotech',
    role: 'AI/ML Lead Research Engineer (R&D)',
    period: 'Mar 2025 – Present',
    location: 'Bengaluru, India',
    highlights: [
      'Architected a high-performance HR RAG app over 700+ documents using Docling, OpenSearch hybrid search & Agentic RAG via Open WebUI.',
      'Built eval & observability stack with DeepEval, LangSmith, and Langfuse for production-grade LLM monitoring.',
      'Led multi-agent architecture for end-to-end ServiceNow automation using a Master Orchestrator Agent with MCP for dynamic routing.',
    ],
  },
  {
    company: 'Accenture',
    role: 'Data Science Analyst (Data & AI)',
    period: 'Aug 2021 – Mar 2025',
    location: 'Bengaluru, India',
    highlights: [
      'Built Retail Lens — a visual search tool using SAM + Clip-ViT-B embeddings with Qdrant vector DB for image-based product discovery.',
      'Developed a GenAI asthma prediction tool with RAG & LLM chat, integrated with Excel/CSV via Streamlit across two client demos.',
      'Engineered a fee-optimising model for plasma donations using customer segmentation, profiling, and automated web scraping.',
    ],
  },
  {
    company: 'Kaleidofin',
    role: 'Data Science Analyst',
    period: 'Dec 2019 – Aug 2021',
    location: 'Chennai, India',
    highlights: [
      'Built credit risk models using Bagging & Boosting to score new-to-credit and MFI customers with monthly risk analysis cycles.',
      'Developed payment prediction models using RandomForest, LightGBM & GridSearchCV, improving call centre efficiency.',
      'Deployed partner dashboards automating workflows with Apache Airflow and built data pipelines for enriched analytics.',
    ],
  },
];
