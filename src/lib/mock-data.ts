export interface AgentFix {
  id: string;
  fileName: string;
  bugType: "SYNTAX" | "IMPORT" | "TYPE" | "LOGIC" | "LINT" | "INDENTATION";
  lineNumber: number;
  description: string;
  status: "fixed" | "skipped" | "failed";
  confidence: number;
  diff: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  status: "success" | "running" | "failed" | "pending";
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  agent: string;
  message: string;
}

export interface ScoreBreakdown {
  base: number;
  speedBonus: number;
  efficiencyPenalty: number;
  final: number;
}

export interface AgentRun {
  id: string;
  repoUrl: string;
  repoName: string;
  branch: string;
  userName: string;
  leaderName: string;
  mode: "individual" | "team";
  status: "passed" | "failed" | "running";
  totalFixes: number;
  iterations: number;
  maxIterations: number;
  timeTaken: string;
  testFramework: string;
  fixes: AgentFix[];
  timeline: TimelineEvent[];
  logs: LogEntry[];
  score: ScoreBreakdown;
}

export const mockRun: AgentRun = {
  id: "run_a1b2c3",
  repoUrl: "https://github.com/acme-corp/payment-api",
  repoName: "acme-corp/payment-api",
  branch: "acme_sarah_AI_Fix",
  userName: "acme-corp",
  leaderName: "sarah",
  mode: "team",
  status: "passed",
  totalFixes: 4,
  iterations: 2,
  maxIterations: 5,
  timeTaken: "3m 42s",
  testFramework: "Jest + TypeScript",
  fixes: [
    {
      id: "fix_1",
      fileName: "src/utils/parser.ts",
      bugType: "IMPORT",
      lineNumber: 3,
      description: "Missing import for `parseJSON` utility from shared module.",
      status: "fixed",
      confidence: 0.94,
      diff: "+ import { parseJSON } from '@shared/utils';",
    },
    {
      id: "fix_2",
      fileName: "src/api/handler.ts",
      bugType: "TYPE",
      lineNumber: 47,
      description: "Type mismatch: `string` passed where `number` expected in `processPayment`.",
      status: "fixed",
      confidence: 0.87,
      diff: "- processPayment(amount)\n+ processPayment(Number(amount))",
    },
    {
      id: "fix_3",
      fileName: "src/types/index.ts",
      bugType: "SYNTAX",
      lineNumber: 12,
      description: "Missing semicolon at end of interface declaration.",
      status: "fixed",
      confidence: 0.98,
      diff: "- export interface PaymentResponse {\n+ export interface PaymentResponse {;",
    },
    {
      id: "fix_4",
      fileName: "src/middleware/auth.ts",
      bugType: "LOGIC",
      lineNumber: 28,
      description: "Token validation logic inverted — always returns unauthorized.",
      status: "skipped",
      confidence: 0.42,
      diff: "",
    },
  ],
  timeline: [
    { id: "t1", timestamp: "00:00", agent: "Repo Analyzer", action: "Cloned repository", status: "success" },
    { id: "t2", timestamp: "00:08", agent: "Repo Analyzer", action: "Detected Jest + TypeScript", status: "success" },
    { id: "t3", timestamp: "00:15", agent: "Test Runner", action: "Running tests in Docker sandbox", status: "success" },
    { id: "t4", timestamp: "00:42", agent: "Test Runner", action: "4 tests failed, 23 passed", status: "failed" },
    { id: "t5", timestamp: "00:45", agent: "Bug Classifier", action: "Classified: 1 IMPORT, 1 TYPE, 1 SYNTAX, 1 LOGIC", status: "success" },
    { id: "t6", timestamp: "01:02", agent: "Fix Generator", action: "Generated 3 patches (1 skipped)", status: "success" },
    { id: "t7", timestamp: "01:10", agent: "Governance", action: "All patches validated safe", status: "success" },
    { id: "t8", timestamp: "01:15", agent: "Git Manager", action: "Committed [AI-AGENT] fixes", status: "success" },
    { id: "t9", timestamp: "01:20", agent: "Git Manager", action: "Pushed to acme_sarah_AI_Fix", status: "success" },
    { id: "t10", timestamp: "02:30", agent: "CI/CD Monitor", action: "GitHub Actions — iteration 1 failed", status: "failed" },
    { id: "t11", timestamp: "02:35", agent: "Test Runner", action: "Re-running tests (iteration 2)", status: "success" },
    { id: "t12", timestamp: "03:42", agent: "CI/CD Monitor", action: "All tests passed ✓", status: "success" },
  ],
  logs: [
    { id: "l1", timestamp: "00:00:01", level: "info", agent: "Orchestrator", message: "Starting AutoHeal agent pipeline" },
    { id: "l2", timestamp: "00:00:02", level: "info", agent: "Repo Analyzer", message: "Cloning https://github.com/acme-corp/payment-api" },
    { id: "l3", timestamp: "00:00:08", level: "info", agent: "Repo Analyzer", message: "Detected test framework: Jest with TypeScript config" },
    { id: "l4", timestamp: "00:00:15", level: "info", agent: "Test Runner", message: "Spinning up Docker sandbox container" },
    { id: "l5", timestamp: "00:00:42", level: "error", agent: "Test Runner", message: "4 of 27 tests failed" },
    { id: "l6", timestamp: "00:00:45", level: "info", agent: "Bug Classifier", message: "Classifying 4 failures..." },
    { id: "l7", timestamp: "00:00:46", level: "debug", agent: "Bug Classifier", message: "src/utils/parser.ts:3 → IMPORT (missing module import)" },
    { id: "l8", timestamp: "00:00:46", level: "debug", agent: "Bug Classifier", message: "src/api/handler.ts:47 → TYPE (string→number mismatch)" },
    { id: "l9", timestamp: "00:00:47", level: "debug", agent: "Bug Classifier", message: "src/types/index.ts:12 → SYNTAX (missing semicolon)" },
    { id: "l10", timestamp: "00:00:47", level: "warn", agent: "Bug Classifier", message: "src/middleware/auth.ts:28 → LOGIC (low confidence, may skip)" },
    { id: "l11", timestamp: "00:01:02", level: "info", agent: "Fix Generator", message: "Generated 3 patches, skipped 1 (confidence < 0.5)" },
    { id: "l12", timestamp: "00:01:10", level: "info", agent: "Governance", message: "Patch validation passed: no deletions, no network calls, no secrets" },
    { id: "l13", timestamp: "00:01:15", level: "info", agent: "Git Manager", message: "Committed: [AI-AGENT] Fix IMPORT, TYPE, SYNTAX errors" },
    { id: "l14", timestamp: "00:01:20", level: "info", agent: "Git Manager", message: "Pushed to branch: acme_sarah_AI_Fix" },
    { id: "l15", timestamp: "00:02:30", level: "warn", agent: "CI/CD Monitor", message: "Iteration 1: 1 test still failing" },
    { id: "l16", timestamp: "00:03:42", level: "info", agent: "CI/CD Monitor", message: "Iteration 2: All 27 tests passed ✓" },
  ],
  score: {
    base: 100,
    speedBonus: 8,
    efficiencyPenalty: -14,
    final: 94,
  },
};
