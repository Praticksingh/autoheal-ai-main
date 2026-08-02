import { useCallback, useEffect, useRef, useState } from 'react';
import { AgentService, type StartRunParams } from '../services/agentService';
import { useAnalysis } from '../context/useAnalysis';
import { analysisSocket, ensureSocketConnection } from '../services/socket';
import { type AgentFix, type TimelineEvent, type LogEntry } from '../services/mock-data';
import { type BugExplanation } from '../../shared/types/api';
import { toast } from '@/components/ui/sonner';

const STAGE_TO_AGENT: Record<string, string> = {
  'Repository validation': 'Repo Analyzer',
  'Repository clone': 'Repo Analyzer',
  'Dependencies installed': 'Build Agent',
  'Test execution': 'Test Runner',
  'Bug analysis': 'Bug Classifier',
  'Fix generation': 'Fix Generator',
  'Score calculation': 'CI/CD Monitor',
  'Pipeline verification': 'CI/CD Monitor',
};

function createTimestamp() {
  return new Date().toLocaleTimeString();
}

function createLogEntry(level: LogEntry['level'], agent: string, message: string): LogEntry {
  return {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: createTimestamp(),
    level,
    agent,
    message,
  };
}

function createTimelineEvent(agent: string, action: string, status: TimelineEvent['status']): TimelineEvent {
  return {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: createTimestamp(),
    agent,
    action,
    status,
  };
}

function mapStatus(status: 'success' | 'failed' | 'running'): TimelineEvent['status'] {
  if (status === 'success') {
    return 'success';
  }
  if (status === 'failed') {
    return 'failed';
  }
  return 'running';
}

function buildDemoTimeline(): TimelineEvent[] {
  return [
    createTimelineEvent('Repo Analyzer', 'Repository Cloned', 'success'),
    createTimelineEvent('Build Agent', 'Dependencies Installed', 'success'),
    createTimelineEvent('Test Runner', 'Tests Executed', 'success'),
    createTimelineEvent('Bug Classifier', 'Bugs Detected', 'success'),
    createTimelineEvent('Fix Generator', 'Fixes Generated', 'success'),
    createTimelineEvent('CI/CD Monitor', 'CI/CD Pipeline Restored', 'success'),
  ];
}

function buildDemoLogs(repoUrl: string): LogEntry[] {
  return [
    createLogEntry('info', 'Repo Analyzer', `Cloning repository ${repoUrl}`),
    createLogEntry('info', 'Build Agent', 'Installing dependencies...'),
    createLogEntry('info', 'Test Runner', 'Running tests...'),
    createLogEntry('warn', 'Bug Classifier', '3 test failures detected'),
    createLogEntry('info', 'Fix Generator', 'Generating code fixes'),
    createLogEntry('info', 'Fix Generator', 'Applying patch to utils/parser.ts'),
    createLogEntry('info', 'CI/CD Monitor', 'Pipeline verification passed'),
  ];
}

function buildDemoFixes(runId: string): AgentFix[] {
  return [
    {
      id: `demo-fix-${runId}-1`,
      fileName: 'utils/parser.ts',
      bugType: 'TYPE',
      lineNumber: 42,
      description: 'Undefined variable in parser execution path',
      status: 'fixed',
      confidence: 0.92,
      diff: '+ const safeInput = input ?? "";',
    },
    {
      id: `demo-fix-${runId}-2`,
      fileName: 'src/api/handler.ts',
      bugType: 'SYNTAX',
      lineNumber: 28,
      description: 'Added missing colon in object literal',
      status: 'fixed',
      confidence: 0.87,
      diff: '+ response: { status: "ok" },',
    },
  ];
}

export function useDashboard() {
  const { state, setCurrentRepo, setAnalysisStatus, setBugResults, setBugExplanations, setScore, setTimeline, setLogs, setError } = useAnalysis();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCommitting, setIsCommitting] = useState(false);
  const activeRunIdRef = useRef<string | null>(null);
  const lastRunParamsRef = useRef<StartRunParams | null>(null);
  const logsRef = useRef(state.logs);
  const timelineRef = useRef(state.timeline);

  useEffect(() => {
    logsRef.current = state.logs;
  }, [state.logs]);

  useEffect(() => {
    timelineRef.current = state.timeline;
  }, [state.timeline]);

  const appendLog = useCallback((log: LogEntry): void => {
    const nextLogs = [...logsRef.current, log];
    logsRef.current = nextLogs;
    setLogs(nextLogs);
  }, [setLogs]);

  const appendTimeline = useCallback((event: TimelineEvent): void => {
    const nextTimeline = [...timelineRef.current, event];
    timelineRef.current = nextTimeline;
    setTimeline(nextTimeline);
  }, [setTimeline]);

  const runDemoMode = useCallback((params: StartRunParams, reason: string) => {
    const demoRunId = `demo-${Date.now()}`;
    activeRunIdRef.current = demoRunId;
    const demoTimeline = buildDemoTimeline();
    const demoLogs = buildDemoLogs(params.repoUrl);
    const demoFixes = buildDemoFixes(demoRunId);
    const demoExplanations = buildDemoExplanations();

    setCurrentRepo(params.repoUrl);
    setTimeline(demoTimeline);
    setLogs(demoLogs);
    setBugResults(demoFixes);
    setBugExplanations(demoExplanations);
    setScore(92);
    setCurrentStep(5);
    setAnalysisStatus('completed');
    setError(null);

    toast.info(`Demo mode activated: ${reason}`);
  }, [setAnalysisStatus, setBugExplanations, setBugResults, setCurrentRepo, setError, setLogs, setScore, setTimeline]);

  useEffect(() => {
    const updateStep = (step: number) => {
      setCurrentStep((prev) => Math.max(prev, step));
    };

    const handleAnalysisStarted = (payload: { runId: string; repoUrl: string }) => {
      if (payload.runId !== activeRunIdRef.current) {
        return;
      }

      setAnalysisStatus('running');
      updateStep(1);
      appendLog(createLogEntry('info', 'Orchestrator', `Analysis started for ${payload.repoUrl}`));
      appendTimeline(createTimelineEvent('Orchestrator', 'Analysis started', 'running'));
    };

    const handleRepoCloned = (payload: { runId: string; repoUrl: string }) => {
      if (payload.runId !== activeRunIdRef.current) {
        return;
      }

      updateStep(2);
      appendLog(createLogEntry('info', 'Repo Analyzer', `Repository cloned: ${payload.repoUrl}`));
      appendTimeline(createTimelineEvent('Repo Analyzer', 'Repository cloned', 'success'));
    };

    const handleTestsRunning = (payload: { runId: string }) => {
      if (payload.runId !== activeRunIdRef.current) {
        return;
      }

      updateStep(2);
      appendLog(createLogEntry('info', 'Test Runner', 'Tests are running'));
      appendTimeline(createTimelineEvent('Test Runner', 'Running tests', 'running'));
    };

    const handleBugDetected = (payload: { runId: string; bugsFound: number; failures?: string[] }) => {
      if (payload.runId !== activeRunIdRef.current) {
        return;
      }

      updateStep(3);
      appendLog(createLogEntry('warn', 'Bug Classifier', `${payload.bugsFound} potential issue(s) detected`));
      appendTimeline(createTimelineEvent('Bug Classifier', 'Detected test failures', 'success'));
    };

    const handleFixApplied = (payload: { runId: string; bugsFixed: number }) => {
      if (payload.runId !== activeRunIdRef.current) {
        return;
      }

      updateStep(4);
      appendLog(createLogEntry('info', 'Fix Generator', `${payload.bugsFixed} fix(es) applied`));
      appendTimeline(createTimelineEvent('Fix Generator', 'Applied automated fixes', 'success'));
    };

    const handlePipelineComplete = (payload: { runId: string; score: number; bugsFound?: number; bugsFixed?: number }) => {
      if (payload.runId !== activeRunIdRef.current) {
        return;
      }

      updateStep(5);
      setScore(payload.score);
      setAnalysisStatus('completed');
      appendLog(createLogEntry('info', 'CI/CD Monitor', 'Pipeline completed successfully'));
      appendTimeline(createTimelineEvent('CI/CD Monitor', 'Pipeline complete', 'success'));
      toast.success('Agent run completed successfully.');
    };

    analysisSocket.on('analysis_started', handleAnalysisStarted);
    analysisSocket.on('repo_cloned', handleRepoCloned);
    analysisSocket.on('tests_running', handleTestsRunning);
    analysisSocket.on('bug_detected', handleBugDetected);
    analysisSocket.on('fix_applied', handleFixApplied);
    analysisSocket.on('pipeline_complete', handlePipelineComplete);

    return () => {
      analysisSocket.off('analysis_started', handleAnalysisStarted);
      analysisSocket.off('repo_cloned', handleRepoCloned);
      analysisSocket.off('tests_running', handleTestsRunning);
      analysisSocket.off('bug_detected', handleBugDetected);
      analysisSocket.off('fix_applied', handleFixApplied);
      analysisSocket.off('pipeline_complete', handlePipelineComplete);
    };
  }, [appendLog, appendTimeline, setAnalysisStatus, setBugResults, setScore]);

  const handleStartRun = async (params: StartRunParams) => {
    lastRunParamsRef.current = params;
    const runId = `run-${Date.now()}`;

    activeRunIdRef.current = runId;
    setCurrentRepo(params.repoUrl);
    setAnalysisStatus('running');
    setError(null);
    setCurrentStep(1);
    setLogs([]);
    setTimeline([]);
    setBugResults([]);
    setBugExplanations([]);
    ensureSocketConnection();

    try {
      const run = await AgentService.startRun({ ...params, runId });

      if (run?.runId && run.runId !== runId) {
        activeRunIdRef.current = run.runId;
      }

      setScore(run.score);

      const mappedTimeline: TimelineEvent[] = (run.timeline || []).map((item) => createTimelineEvent(
        STAGE_TO_AGENT[item.step] || 'Pipeline Agent',
        item.step,
        mapStatus(item.status)
      ));

      if (mappedTimeline.length > 0) {
        setTimeline(mappedTimeline);
        setCurrentStep(5);
      }

      const mappedLogs: LogEntry[] = [
        createLogEntry('info', 'Repo Analyzer', 'Cloning repository...'),
        createLogEntry('info', 'Build Agent', 'Dependencies installed'),
        createLogEntry('info', 'Test Runner', 'Tests executed'),
        createLogEntry(run.bugsFound > 0 ? 'warn' : 'info', 'Bug Classifier', `${run.bugsFound} issue(s) detected`),
        createLogEntry('info', 'Fix Generator', `${run.fixesApplied} fix(es) generated`),
        createLogEntry('info', 'CI/CD Monitor', 'Pipeline verification passed'),
      ];
      setLogs(mappedLogs);

      const nextFixes: AgentFix[] = (run.explanations && run.explanations.length > 0)
        ? run.explanations.map((exp, index) => ({
            id: `fix-${run.runId}-${index + 1}`,
            fileName: exp.file || `file-${index + 1}.ts`,
            bugType: 'LOGIC',
            lineNumber: exp.line || 1,
            description: exp.explanation,
            status: exp.status === 'fixed' ? 'fixed' : 'failed',
            confidence: (exp as { confidenceScore?: number }).confidenceScore ? (exp as { confidenceScore?: number }).confidenceScore! / 100 : 0.85,
            diff: exp.suggestedFix ? `+ ${exp.suggestedFix}` : '',
          }))
        : Array.from({ length: Math.max(run.bugsFound, run.fixesApplied) }).map((_, index) => ({
            id: `fix-${run.runId}-${index + 1}`,
            fileName: `detected-issue-${index + 1}.ts`,
            bugType: 'LOGIC',
            lineNumber: 1,
            description: `Detected issue in target repository`,
            status: index < run.fixesApplied ? 'fixed' : 'failed',
            confidence: 0.8,
            diff: '',
          }));

      setBugResults(nextFixes);
      setBugExplanations(run.explanations || []);

      setAnalysisStatus('completed');
    } catch (error) {
      console.error('Failed to start run:', error);
      setAnalysisStatus('failed');

      if (error instanceof Error && error.message.trim()) {
        setError(error.message);
        toast.error(error.message);
      }
    }
  };

  const retryLastRun = () => {
    if (state.analysisStatus === 'running') {
      return;
    }

    if (!lastRunParamsRef.current) {
      toast.error('No previous run found to retry.');
      return;
    }

    void handleStartRun(lastRunParamsRef.current);
  };

  const commitFixToRepository = useCallback(async () => {
    if (!state.currentRepo) {
      toast.error('Repository URL is missing for this run.');
      return;
    }

    const fixedFiles = state.bugResults
      .filter((item) => item.status === 'fixed')
      .map((item) => ({
        filePath: item.fileName,
        diff: item.diff,
      }));

    if (fixedFiles.length === 0) {
      toast.error('No fixed files available to commit.');
      return;
    }

    const branchName = `autohealer-fix-${Date.now()}`;
    const commitMessage = 'AutoHealer AI automated CI/CD fix';
    const aiExplanation = state.bugExplanations
      .map((entry) => {
        const header = `${entry.bugType} in ${entry.file}:${entry.line}`;
        const body = `${entry.explanation}\nImpact: ${entry.impact}\nSuggested Fix: ${entry.suggestedFix}`;
        return `### ${header}\n${body}`;
      })
      .join('\n\n') || 'Automated fix generated by AutoHealer AI.';

    const toastId = toast.loading('Committing changes...');
    setIsCommitting(true);

    try {
      const result = await AgentService.commitFix({
        repoUrl: state.currentRepo,
        branchName,
        commitMessage,
        fixedFiles,
        aiExplanation,
      });

      appendLog(createLogEntry('info', 'Git Manager', `Opened PR #${result.pullRequestNumber} from ${result.branchName}`));
      appendTimeline(createTimelineEvent('Git Manager', `Opened pull request from ${result.branchName}`, 'success'));

      toast.success('Pull request opened successfully.', {
        id: toastId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to commit fix to repository.';
      appendLog(createLogEntry('error', 'Git Manager', message));
      appendTimeline(createTimelineEvent('Git Manager', 'Commit to repository failed', 'failed'));

      toast.error(message, {
        id: toastId,
      });
    } finally {
      setIsCommitting(false);
    }
  }, [appendLog, appendTimeline, state.bugExplanations, state.bugResults, state.currentRepo]);

  return {
    activeRun: state.analysisStatus === 'completed' ? {
      id: 'mock-run',
      repoUrl: state.currentRepo || '',
      repoName: state.currentRepo?.split('/').pop() || '',
      branch: 'main',
      userName: 'user',
      leaderName: 'leader',
      mode: 'individual' as const,
      status: 'passed' as const,
      totalFixes: state.bugResults.length,
      iterations: 1,
      maxIterations: 5,
      timeTaken: '2.5s',
      testFramework: 'jest',
      fixes: state.bugResults,
      timeline: state.timeline,
      score: {
        base: 80,
        speedBonus: 10,
        efficiencyPenalty: 0,
        final: state.score || 0,
      },
      logs: state.logs,
    } : null,
    isRunning: state.analysisStatus === 'running',
    currentStep,
    error: state.error,
    canRetry: Boolean(lastRunParamsRef.current) && state.analysisStatus !== 'running',
    canCommit: state.analysisStatus === 'completed' && state.bugResults.some((item) => item.status === 'fixed'),
    isCommitting,
    handleStartRun,
    retryLastRun,
    commitFixToRepository,
  };
}

function buildDemoExplanations(): BugExplanation[] {
  return [
    {
      file: 'utils/parser.ts',
      line: 42,
      bugType: 'Type Error',
      explanation: 'The parser executes with a nullable input and reaches a code path where an undefined value is processed.',
      impact: 'This triggers runtime failures and breaks CI tests for parser behavior validation.',
      suggestedFix: 'Normalize the input before processing and add a null-safe fallback.',
      status: 'detected',
      codeContext: [
        { lineNumber: 40, content: 'function parse(input: string | undefined) {', isProblemLine: false },
        { lineNumber: 41, content: '  const normalized = input.trim();', isProblemLine: true },
        { lineNumber: 42, content: '  return runParser(normalized);', isProblemLine: false },
      ],
    },
    {
      file: 'src/api/handler.ts',
      line: 28,
      bugType: 'Syntax Error',
      explanation: 'A malformed object literal is missing valid structure near the response payload.',
      impact: 'The file fails to compile, which stops the test runner during CI.',
      suggestedFix: 'Correct the object syntax at the indicated line and rerun tests.',
      status: 'warning',
      codeContext: [
        { lineNumber: 26, content: 'return {', isProblemLine: false },
        { lineNumber: 27, content: '  ok true,', isProblemLine: true },
        { lineNumber: 28, content: '  data: payload,', isProblemLine: false },
      ],
    },
  ];
}