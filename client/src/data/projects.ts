export interface Project {
  id:          number;
  name:        string;
  company:     string;
  period:      string;
  description: string;
  techStack:   string[];
  skills:      string;   // one-line keyword strip e.g. "Agentic RAG · Hybrid Search"
  image:       string;
}

export const projects: Project[] = [
  {
    id: 1,
    name: 'HR RAG Application',
    company: 'ITC Infotech',
    period: "Mar'25 - Present",
    description: 'High-performance RAG application for HR knowledge base with 700+ documents.',
    techStack: ['Docling', 'OpenSearch', 'Open WebUI', 'DeepEval', 'LangSmith', 'Langfuse'],
    skills: 'Agentic RAG · Multi-Vector · Hybrid Search · Observability · LLM Eval',
    image: '/images/project-hr-rag.jpg',
  },
  {
    id: 2,
    name: 'ServiceNow Multi-Agent System',
    company: 'ITC Infotech',
    period: "Mar'25 - Present",
    description: 'Multi-agent architecture for end-to-end ServiceNow automation.',
    techStack: ['MCP', 'Multi-Agent Systems', 'LangGraph', 'ServiceNow'],
    skills: 'Agentic Orchestration · MCP · Dynamic Routing · LangGraph · ITSM Automation',
    image: '/images/project-servicenow.jpg',
  },
  {
    id: 3,
    name: 'Retail Lens',
    company: 'Accenture',
    period: "Aug'21 - Mar'25",
    description: 'Visual search tool for retail product discovery using semantic image embeddings.',
    techStack: ['SAM', 'Clip-ViT-B', 'Qdrant', 'Python'],
    skills: 'Visual Search · Semantic Embeddings · Vector DB · SAM · CLIP',
    image: '/images/project-retail-lens.jpg',
  },
  {
    id: 4,
    name: 'GENAI Asthma Prediction Tool',
    company: 'Accenture',
    period: "Aug'21 - Mar'25",
    description: 'GENAI asthma prediction tool with RAG and LLM chat functionality.',
    techStack: ['RAG', 'LLM', 'Streamlit', 'Excel/CSV Integration'],
    skills: 'GenAI · RAG · LLM Chat · Predictive Modelling · Clinical AI',
    image: '/images/project-asthma.jpg',
  },
  {
    id: 5,
    name: 'Fee-Optimizing Model',
    company: 'Accenture',
    period: "Aug'21 - Mar'25",
    description: 'Fee-optimizing model for plasma donations using customer segmentation and pricing strategy.',
    techStack: ['Python', 'Web Scraping', 'Segmentation', 'Profiling'],
    skills: 'Fee Optimization · Customer Segmentation · Pricing Strategy · Profiling · Web Scraping',
    image: '/images/project-fee-optimize.jpg',
  },
  {
    id: 6,
    name: 'Credit Risk Model',
    company: 'Kaleidofin',
    period: "Dec'19 - Aug'21",
    description: 'Credit risk model for scoring new-to-credit and MFI customers using ensemble learning.',
    techStack: ['Bagging', 'Boosting', 'Python', 'Risk Analysis'],
    skills: 'Credit Scoring · Ensemble Learning · Bagging · Boosting · Financial Inclusion',
    image: '/images/project-credit-risk.jpg',
  },
  {
    id: 7,
    name: 'Payment Prediction Model',
    company: 'Kaleidofin',
    period: "Dec'19 - Aug'21",
    description: 'Payment prediction model for call center operations optimization.',
    techStack: ['RandomForest', 'LightGBM', 'GridSearchCV', 'Python'],
    skills: 'Payment Prediction · Call Center Ops · LightGBM · Hyperparameter Tuning · Churn',
    image: '/images/project-payment-predict.jpg',
  },
  {
    id: 8,
    name: 'Two Stage Flight Prediction',
    company: 'Kaleidofin',
    period: "Dec'19 - Aug'21",
    description: 'Two-stage ML engine forecasting on-time performance of US flights using weather data.',
    techStack: ['Python', 'Machine Learning', 'Classification', 'Regression'],
    skills: 'Two-Stage ML · Delay Classification · Duration Regression · Weather Features',
    image: '/images/project-flight-delay.jpg',
  },
];
