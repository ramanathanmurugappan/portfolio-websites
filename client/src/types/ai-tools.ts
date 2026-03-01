// ── AI Tools — shared data-shape types ────────────────────────────────────────
// Used by JDAnalyzer.tsx and TechExplorer.tsx

// ── JD Analyzer ───────────────────────────────────────────────────────────────

export interface JDResult {
  overallScore:      number;
  matchLabel:        'Strong Match' | 'Good Match' | 'Partial Match';
  matchedSkills:     string[];
  gaps:              string[];
  strengths:         string[];
  coverLetterOpener: string;
}

// ── TechExplorer ──────────────────────────────────────────────────────────────

export interface Criterion { criterion: string; values: string[]; winner: number; }
export interface Category {
  category: string; tools: string[]; criteria: Criterion[]; categoryWinner: string; winnerReason?: string;
}
export interface Pair { a: string; b: string; reason: string; }
export interface PipelineLayer { layer: string; tools: string[]; pick: string; }
export interface CompareResult {
  categories:        Category[];
  singletons:        { tool: string; category: string; verdict: string }[];
  competing:         Pair[];
  complementary:     Pair[];
  pipeline:          PipelineLayer[];
  scores:            { tool: string; category: string; metrics: { name: string; score: number }[] }[];
  recommendedStack:  string[];
  recommendedReason: string;
  ramanathanPick:    string;
  ramanathanReason:  string;
}
export interface CompletePipelineLayer {
  layer:  string;
  tool:   string;
  source: 'user' | 'ram';
  why:    string;
}
export interface ProjectRec {
  name:        string;
  tagline:     string;
  description: string;
  useCase:     string;
  toolsUsed:   string[];
  difficulty:  'Beginner' | 'Intermediate' | 'Advanced';
  highlights:  string[];
}

export interface IdeaLayer {
  layer:        string;    // e.g. "API Layer", "Vector Store"
  tool:         string;    // e.g. "FastAPI", "Qdrant Cloud"
  why:          string;    // Production rationale — one sentence
  alternatives: string[];  // 1–2 alternatives worth considering
}

export interface IdeaStackResult {
  summary:          string;    // One-line architecture description
  architecture:     string;    // Pattern name e.g. "RAG Pipeline", "Event-Driven Microservices"
  layers:           IdeaLayer[]; // Ordered production stack layers
  productionNotes:  string[];  // 2–3 key production considerations
}
