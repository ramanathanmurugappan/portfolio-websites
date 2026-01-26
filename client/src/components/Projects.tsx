/**
 * Projects Component - Featured work showcase with project details
 * Features: Project cards with descriptions and tech stack, slide transitions
 * Content matches resume exactly
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  id: number;
  name: string;
  company: string;
  period: string;
  description: string;
  highlights: string[];
  techStack: string[];
  image: string;
}

const projects: Project[] = [
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
    name: 'Dashboards & Database Automation',
    company: 'Kaleidofin',
    period: "Dec'19 - Aug'21",
    description: 'Customized dashboards with automated workflows using Apache Airflow.',
    highlights: [
      'Designed and deployed customized dashboards for partners and teams, automating workflows with Apache Airflow',
      'Built data pipelines to integrate various data sources, enriching dashboards with granular data',
    ],
    techStack: ['Apache Airflow', 'Data Pipelines', 'Dashboard', 'SQL'],
    image: '/images/project-credit-risk.png',
  },
];

export default function Projects() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 60 : -60,
      opacity: 0,
    }),
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  return (
    <div className="flex flex-col gap-[40px]">
      {/* Section Header */}
      <div className="container flex items-center justify-between">
        <div className="flex flex-col gap-[8px]">
          <span className="text-[11px] tracking-[0.08em] text-black/35 uppercase font-semibold">
            💻 Projects
          </span>
          <h2 className="text-[40px] leading-[116%] tracking-[-0.02em] font-semibold">
            Featured Work
          </h2>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex items-center gap-[12px]">
          <button 
            onClick={prevSlide}
            className="w-[40px] h-[40px] rounded-full bg-[#f7f7f7] flex items-center justify-center hover:bg-[#ebebeb] transition-all duration-200"
            style={{ border: '1px solid rgba(0,0,0,0.04)' }}
          >
            ←
          </button>
          <button 
            onClick={nextSlide}
            className="w-[40px] h-[40px] rounded-full bg-[#f7f7f7] flex items-center justify-center hover:bg-[#ebebeb] transition-all duration-200"
            style={{ border: '1px solid rgba(0,0,0,0.04)' }}
          >
            →
          </button>
          <a 
            href="https://github.com/ramanathanmurugappan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-[24px] py-[14px] rounded-[14px] bg-[#1e6ef4] text-white text-[14px] font-semibold hover:bg-[#1a5ecf] transition-all duration-200 hover:-translate-y-0.5"
          >
            View GitHub
          </a>
        </div>
      </div>

      {/* Project Card */}
      <div className="container">
        <div 
          className="rounded-[32px] bg-[#f7f7f7] overflow-hidden"
          style={{ border: '1px solid rgba(0,0,0,0.04)' }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col md:flex-row"
            >
              {/* Left Side - Project Info */}
              <div className="w-full md:w-[50%] p-[36px] flex flex-col justify-between gap-[24px]">
                {/* Company Badge */}
                <div className="flex items-center gap-[8px]">
                  <div 
                    className="inline-flex px-[14px] py-[8px] rounded-[12px] bg-white text-[12px] font-semibold"
                    style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                  >
                    🏢 {projects[currentIndex].company}
                  </div>
                  <div 
                    className="inline-flex px-[10px] py-[6px] rounded-[10px] bg-white text-[10px] font-semibold text-black/50"
                    style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                  >
                    {projects[currentIndex].period}
                  </div>
                  <span className="text-[12px] text-black/35 font-semibold">
                    {currentIndex + 1} / {projects.length}
                  </span>
                </div>

                {/* Project Info */}
                <div className="flex flex-col gap-[16px]">
                  <h3 className="text-[28px] leading-[116%] tracking-[-0.02em] font-semibold">
                    {projects[currentIndex].name}
                  </h3>
                  <p className="text-[13px] leading-[150%] text-black/50 font-semibold">
                    {projects[currentIndex].description}
                  </p>
                  
                  {/* Highlights */}
                  <ul className="flex flex-col gap-[8px] mt-[8px]">
                    {projects[currentIndex].highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-[8px] text-[12px] text-black/60">
                        <span className="text-[#1e6ef4] mt-[2px]">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-[8px] mt-[8px]">
                    {projects[currentIndex].techStack.map((tech) => (
                      <span 
                        key={tech}
                        className="px-[10px] py-[5px] rounded-[8px] bg-white text-[11px] font-semibold text-black/60"
                        style={{ border: '1px solid rgba(0,0,0,0.04)' }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Project Image */}
              <div className="w-full md:w-[50%] relative min-h-[380px]">
                <img 
                  src={projects[currentIndex].image}
                  alt={projects[currentIndex].name}
                  className="w-full h-full object-cover"
                  style={{ pointerEvents: 'auto' }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slider Dots */}
      <div className="container flex justify-center gap-[8px]">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-[8px] h-[8px] rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-black scale-125' : 'bg-black/15 hover:bg-black/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
