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
  category: string; tools: string[]; criteria: Criterion[]; categoryWinner: string;
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
