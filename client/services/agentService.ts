import { apiClient } from './api';
import type {
  AnalyzeRepoRequest,
  AnalyzeRepoResponse,
  BugExplanation,
  HistoryResponse,
} from '../../shared/types/api';

export interface StartRunParams {
  repoUrl: string;
  userName: string;
  leaderName: string;
  mode: "individual" | "team";
  autoApproveEnabled: boolean;
  confidenceThreshold: number;
}

const GITHUB_REPO_URL_REGEX = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/i;

function mapStartRunError(error: unknown): Error {
  if (error && typeof error === 'object' && 'isNetworkError' in error && (error as { isNetworkError?: boolean }).isNetworkError) {
    const detail = error instanceof Error && error.message ? `: ${error.message}` : '';
    return new Error(`Backend connection failed${detail}. Please verify the server is running and accessible.`);
  }

  const rawMessage = error instanceof Error ? error.message : String(error || '');
  const message = rawMessage.toLowerCase();

  if (message.includes('spawn einval') || message.includes('invalid process arguments')) {
    return new Error('Agent failed to execute repository analysis. Please verify the repository URL and server configuration.');
  }

  if (message.includes('repository not accessible') || message.includes('not found')) {
    return new Error('GitHub repository not found or not accessible');
  }

  if (message.includes('private repository') || message.includes('public repository')) {
    return new Error('The agent could not analyze this repository. Please ensure the repository is public and accessible.');
  }

  if (message.includes('clone') || message.includes('could not clone')) {
    return new Error('The agent could not analyze this repository. Please ensure the repository is public and accessible.');
  }

  if (message.includes('test') || message.includes('jest') || message.includes('vitest')) {
    return new Error('Tests could not be executed on target repository');
  }

  if (rawMessage.trim()) {
    return new Error(rawMessage);
  }

  return new Error('An unexpected error occurred during analysis. Please try again.');
}

export interface PipelineRunResponse {
  success: boolean;
  runId: string;
  bugsFound: number;
  fixesApplied: number;
  bugs: {
    bugsFound: number;
    bugsFixed: number;
    failures: string[];
  };
  score: number;
  analysisTime: number;
  timeline: Array<{
    step: string;
    status: 'success' | 'failed' | 'running';
    timestamp: string;
  }>;
  explanations: BugExplanation[];
  tests?: {
    passed: boolean;
    skipped?: boolean;
    reason?: string;
    stdout?: string;
    stderr?: string;
  };
}

export interface CommitFixedFilePayload {
  filePath: string;
  content?: string;
  diff?: string;
}

export interface CommitFixRequest {
  repoUrl: string;
  branchName: string;
  commitMessage: string;
  fixedFiles: CommitFixedFilePayload[];
  aiExplanation?: string;
}

export interface CommitFixResponse {
  success: boolean;
  message: string;
  repository: string;
  branchName: string;
  commitHash: string;
  commitMessage: string;
  committedFiles: string[];
  pullRequestNumber: number;
  pullRequestUrl: string;
}

export class AgentService {
  static async startRun(params: StartRunParams & { runId: string }): Promise<PipelineRunResponse> {
    if (!GITHUB_REPO_URL_REGEX.test(params.repoUrl.trim())) {
      throw new Error('Invalid repository URL. Please use a valid https://github.com/owner/repo URL.');
    }

    const payload: AnalyzeRepoRequest = {
      repoUrl: params.repoUrl.trim(),
      teamName: params.userName.trim(),
      leaderName: params.leaderName.trim(),
      mode: params.mode,
      runId: params.runId,
      userSettings: {
        autoApproveEnabled: params.autoApproveEnabled,
        confidenceThreshold: params.confidenceThreshold,
      },
    };

    try {
      const response = await apiClient.post<AnalyzeRepoResponse, AnalyzeRepoRequest>(
        '/api/analyze-repo',
        payload
      );

      return {
        success: response.success,
        runId: response.runId,
        bugsFound: response.bugsFound,
        fixesApplied: response.fixesApplied,
        bugs: response.bugs,
        explanations: response.explanations || [],
        score: response.score,
        analysisTime: response.analysisTime,
        timeline: response.timeline,
        tests: response.tests,
      };
    } catch (error) {
      console.error('AgentService.startRun failed', error);
      throw mapStartRunError(error);
    }
  }

  static async getHistory(limit: number = 20): Promise<HistoryResponse> {
    try {
      return await apiClient.get<HistoryResponse>(`/api/history?limit=${limit}`);
    } catch (error) {
      console.error('AgentService.getHistory failed', error);
      return {
        count: 0,
        runs: [],
      };
    }
  }

  static async commitFix(payload: CommitFixRequest): Promise<CommitFixResponse> {
    if (!GITHUB_REPO_URL_REGEX.test(payload.repoUrl.trim())) {
      throw new Error('Invalid repository URL. Please use a valid https://github.com/owner/repo URL.');
    }

    if (!Array.isArray(payload.fixedFiles) || payload.fixedFiles.length === 0) {
      throw new Error('No fixed files found to commit.');
    }

    try {
      return await apiClient.post<CommitFixResponse, CommitFixRequest>('/api/github/commit-fix', {
        repoUrl: payload.repoUrl.trim(),
        branchName: payload.branchName,
        commitMessage: payload.commitMessage,
        fixedFiles: payload.fixedFiles,
        aiExplanation: payload.aiExplanation,
      });
    } catch (error) {
      const mapped = mapStartRunError(error);
      throw new Error(mapped.message || 'Failed to commit fix to repository.');
    }
  }

  // Add more methods as needed
}