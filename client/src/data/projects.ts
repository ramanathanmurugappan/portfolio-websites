export interface Project {
  id: number;
  name: string;
  company: string;
  period: string;
  description: string;
  highlights: string[];
  techStack: string[];
  image: string;
}

export const projects: Project[] = [
  {
    id: 1,
    name: 'HR RAG Application',
    company: 'ITC Infotech',
    period: "Mar'25 - Present",
    description: 'High-performance RAG application for HR knowledge base with 700+ documents.',
    highlights: [
      'Architected a high-performance RAG application for the HR knowledge base with 700+ documents using Docling for document parsing',
      'Engineered a multi-vector RAG pipeline with hybrid search (OpenSearch)',
      'Integrated Agentic RAG capabilities via the Open WebUI frontend',
      'Built an eval and observability stack with DeepEval, LangSmith, and Langfuse',
    ],
    techStack: ['Docling', 'OpenSearch', 'Open WebUI', 'DeepEval', 'LangSmith', 'Langfuse'],
    image: '/images/project-hr-rag.png',
  },
  {
    id: 2,
    name: 'ServiceNow Multi-Agent System',
    company: 'ITC Infotech',
    period: "Mar'25 - Present",
    description: 'Multi-agent architecture for end-to-end ServiceNow automation.',
    highlights: [
      'Led development of a multi-agent architecture for end-to-end ServiceNow automation',
      'Implemented a Master Orchestrator Agent that leverages MCP for dynamic agent routing and execution',
    ],
    techStack: ['MCP', 'Multi-Agent Systems', 'LangGraph', 'ServiceNow'],
    image: '/images/project-servicenow.png',
  },
  {
    id: 3,
    name: 'Retail Lens',
    company: 'Accenture',
    period: "Aug'21 - Mar'25",
    description: 'Visual search tool for retail product discovery.',
    highlights: [
      'Engineered a visual search tool using SAM for background removal and Clip-ViT-B for image embeddings',
      'Integrated a Qdrant vector database, significantly improving user experience in visual product searches',
    ],
    techStack: ['SAM', 'Clip-ViT-B', 'Qdrant', 'Python'],
    image: '/images/project-retail-lens.png',
  },
  {
    id: 4,
    name: 'GENAI Asthma Prediction Tool',
    company: 'Accenture',
    period: "Aug'21 - Mar'25",
    description: 'GENAI asthma prediction tool with RAG and LLM chat functionality.',
    highlights: [
      'Developed a GENAI asthma prediction tool with RAG and LLM chat functionality integrated with Excel/CSV',
      'Led front-end (Streamlit) and back-end development, contributing to two project phases and client demos',
    ],
    techStack: ['RAG', 'LLM', 'Streamlit', 'Excel/CSV Integration'],
    image: '/images/project-asthma.png',
  },
  {
    id: 5,
    name: 'Fee-Optimizing Model',
    company: 'Accenture',
    period: "Aug'21 - Mar'25",
    description: 'Fee-optimizing model for plasma donations using customer segmentation.',
    highlights: [
      'Engineered a fee-optimizing model for plasma donations using segmentation and profiling of customer data',
      'Utilized automated web scraping for data collection, enhancing the effectiveness of the pricing strategy',
    ],
    techStack: ['Python', 'Web Scraping', 'Segmentation', 'Profiling'],
    image: '/images/project-fee-optimize.png',
  },
  {
    id: 6,
    name: 'Credit Risk Model',
    company: 'Kaleidofin',
    period: "Dec'19 - Aug'21",
    description: 'Credit risk model for scoring new-to-credit and MFI customers.',
    highlights: [
      'Developed a credit risk model using Bagging and Boosting to score new-to-credit and MFI customers',
      'Conducted monthly risk analyses for continuous improvements in code base performance',
    ],
    techStack: ['Bagging', 'Boosting', 'Python', 'Risk Analysis'],
    image: '/images/project-credit-risk.png',
  },
  {
    id: 7,
    name: 'Payment Prediction Model',
    company: 'Kaleidofin',
    period: "Dec'19 - Aug'21",
    description: 'Payment prediction model for call center operations optimization.',
    highlights: [
      'Built a payment prediction model using RandomForest, LightGBM, and GridSearchCV for hyperparameter tuning',
      'Improved efficiency and optimization of in-house call center operations by accurately predicting customer payments',
    ],
    techStack: ['RandomForest', 'LightGBM', 'GridSearchCV', 'Python'],
    image: '/images/project-payment-predict.png',
  },
  {
    id: 8,
    name: 'Two Stage Flight Prediction',
    company: 'Kaleidofin',
    period: "Dec'19 - Aug'21",
    description: 'Built a two-stage ML engine to forecast on-time performance of US flights using weather data.',
    highlights: [
      'Built a two-stage ML engine to forecast on-time performance of US flights using weather data.',
      'First stage performs binary classification for delay prediction, second stage uses regression to predict delay duration in minutes',
    ],
    techStack: ['Python', 'Machine Learning', 'Classification', 'Regression'],
    image: '/images/project-flight-delay.png',
  },
];
