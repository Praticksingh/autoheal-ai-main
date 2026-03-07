export interface AnalyzeRepoRequest {
  repoUrl: string;
  teamName: string;
  leaderName: string;
  mode: 'individual' | 'team';
  runId?: string;
}

export interface BugAnalysisResponse {
  bugsFound: number;
  bugsFixed: number;
  failures: string[];
  summary?: string;
}

export interface AnalyzeRepoResponse {
  success: boolean;
  runId: string;
  bugsFound: number;
  fixesApplied: number;
  bugs: BugAnalysisResponse;
  score: number;
  analysisTime: number;
  timeline: Array<{
    step: string;
    status: 'success' | 'failed' | 'running';
    timestamp: string;
  }>;
  tests?: {
    passed: boolean;
    skipped?: boolean;
    reason?: string;
    stdout?: string;
    stderr?: string;
  };
}

export interface HistoryRun {
  _id?: string;
  repoUrl: string;
  bugsFound: number;
  bugsFixed: number;
  score: number;
  analysisTime: number;
  createdAt: string;
}

export interface HistoryResponse {
  count: number;
  runs: HistoryRun[];
}
