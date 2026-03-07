import { useCallback, useEffect, useRef, useState } from 'react';
import { AgentService, type StartRunParams } from '../services/agentService';
import { useAnalysis } from '../context/useAnalysis';
import { analysisSocket, ensureSocketConnection } from '../services/socket';
import { type AgentFix, type TimelineEvent, type LogEntry } from '../services/mock-data';
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
  const { state, setCurrentRepo, setAnalysisStatus, setBugResults, setScore, setTimeline, setLogs, setError } = useAnalysis();
  const [currentStep, setCurrentStep] = useState(0);
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

    setCurrentRepo(params.repoUrl);
    setTimeline(demoTimeline);
    setLogs(demoLogs);
    setBugResults(demoFixes);
    setScore(92);
    setCurrentStep(5);
    setAnalysisStatus('completed');
    setError(null);

    toast.info(`Demo mode activated: ${reason}`);
  }, [setAnalysisStatus, setBugResults, setCurrentRepo, setError, setLogs, setScore, setTimeline]);

  useEffect(() => {
    const handleAnalysisStarted = (payload: { runId: string; repoUrl: string }) => {
      if (payload.runId !== activeRunIdRef.current) {
        return;
      }

      setAnalysisStatus('running');
      setCurrentStep(1);
      appendLog(createLogEntry('info', 'Orchestrator', `Analysis started for ${payload.repoUrl}`));
      appendTimeline(createTimelineEvent('Orchestrator', 'Analysis started', 'running'));
    };

    const handleRepoCloned = (payload: { runId: string; repoUrl: string }) => {
      if (payload.runId !== activeRunIdRef.current) {
        return;
      }

      setCurrentStep(2);
      appendLog(createLogEntry('info', 'Repo Analyzer', `Repository cloned: ${payload.repoUrl}`));
      appendTimeline(createTimelineEvent('Repo Analyzer', 'Repository cloned', 'success'));
    };

    const handleTestsRunning = (payload: { runId: string }) => {
      if (payload.runId !== activeRunIdRef.current) {
        return;
      }

      setCurrentStep(2);
      appendLog(createLogEntry('info', 'Test Runner', 'Tests are running'));
      appendTimeline(createTimelineEvent('Test Runner', 'Running tests', 'running'));
    };

    const handleBugDetected = (payload: { runId: string; bugsFound: number; failures?: string[] }) => {
      if (payload.runId !== activeRunIdRef.current) {
        return;
      }

      setCurrentStep(3);
      appendLog(createLogEntry('warn', 'Bug Classifier', `${payload.bugsFound} potential issue(s) detected`));
      appendTimeline(createTimelineEvent('Bug Classifier', 'Detected test failures', 'success'));
    };

    const handleFixApplied = (payload: { runId: string; bugsFixed: number }) => {
      if (payload.runId !== activeRunIdRef.current) {
        return;
      }

      setCurrentStep(4);
      appendLog(createLogEntry('info', 'Fix Generator', `${payload.bugsFixed} fix(es) applied`));
      appendTimeline(createTimelineEvent('Fix Generator', 'Applied automated fixes', 'success'));
    };

    const handlePipelineComplete = (payload: { runId: string; score: number; bugsFound?: number; bugsFixed?: number }) => {
      if (payload.runId !== activeRunIdRef.current) {
        return;
      }

      setCurrentStep(5);
      setScore(payload.score);
      setAnalysisStatus('completed');
      appendLog(createLogEntry('info', 'CI/CD Monitor', 'Pipeline completed successfully'));
      appendTimeline(createTimelineEvent('CI/CD Monitor', 'Pipeline complete', 'success'));
      toast.success('Agent run completed successfully.');

      if (typeof payload.bugsFound === 'number') {
        const bugCount = payload.bugsFound;
        const fixedCount = payload.bugsFixed ?? 0;
        const nextFixes: AgentFix[] = Array.from({ length: bugCount }).map((_, index) => ({
          id: `fix-${payload.runId}-${index + 1}`,
          fileName: `auto-detected-${index + 1}.ts`,
          bugType: 'LOGIC',
          lineNumber: 1,
          description: `Detected issue ${index + 1}`,
          status: index < fixedCount ? 'fixed' : 'failed',
          confidence: 0.8,
          diff: '',
        }));
        setBugResults(nextFixes);
      }
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
    ensureSocketConnection();

    try {
      const run = await AgentService.startRun({ ...params, runId });

      if (run?.runId && run.runId !== runId) {
        activeRunIdRef.current = run.runId;
      }

      setScore(run.score);

      if (run.tests?.skipped) {
        runDemoMode(params, 'No test suite found in repository. Showing full pipeline demo.');
        return;
      }

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

      const fixCount = Math.max(run.bugsFound, run.fixesApplied);
      const nextFixes: AgentFix[] = Array.from({ length: fixCount }).map((_, index) => ({
        id: `fix-${run.runId}-${index + 1}`,
        fileName: `src/module-${index + 1}.ts`,
        bugType: 'LOGIC',
        lineNumber: 10 + index,
        description: `Detected issue ${index + 1}`,
        status: index < run.fixesApplied ? 'fixed' : 'failed',
        confidence: 0.75,
        diff: '',
      }));
      setBugResults(nextFixes);

      setAnalysisStatus('completed');
    } catch (error) {
      console.error('Failed to start run:', error);
      setAnalysisStatus('failed');

      if (error instanceof Error && error.message.trim()) {
        setError(error.message);
        toast.error(error.message);
      } else {
        const fallbackMessage = 'The agent could not analyze this repository. Please ensure the repository is public and accessible.';
        setError(fallbackMessage);
        toast.error(fallbackMessage);
      }

      runDemoMode(params, 'Backend analysis failed. Displaying simulated pipeline for demo continuity.');
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
    handleStartRun,
    retryLastRun,
  };
}