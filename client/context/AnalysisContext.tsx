import { createContext, useReducer, type ReactNode } from 'react';
import { type AgentFix, type TimelineEvent, type LogEntry } from '../services/mock-data';
import { type BugExplanation } from '../../shared/types/api';

export interface AnalysisContextState {
  currentRepo: string | null;
  analysisStatus: 'idle' | 'running' | 'completed' | 'failed';
  bugResults: AgentFix[];
  bugExplanations: BugExplanation[];
  score: number | null;
  timeline: TimelineEvent[];
  logs: LogEntry[];
  error: string | null;
}

type AnalysisAction =
  | { type: 'SET_CURRENT_REPO'; payload: string }
  | { type: 'SET_ANALYSIS_STATUS'; payload: AnalysisContextState['analysisStatus'] }
  | { type: 'SET_BUG_RESULTS'; payload: AgentFix[] }
  | { type: 'SET_BUG_EXPLANATIONS'; payload: BugExplanation[] }
  | { type: 'SET_SCORE'; payload: number }
  | { type: 'SET_TIMELINE'; payload: TimelineEvent[] }
  | { type: 'SET_LOGS'; payload: LogEntry[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_ANALYSIS' };

const initialState: AnalysisContextState = {
  currentRepo: null,
  analysisStatus: 'idle',
  bugResults: [],
  bugExplanations: [],
  score: null,
  timeline: [],
  logs: [],
  error: null,
};

function analysisReducer(state: AnalysisContextState, action: AnalysisAction): AnalysisContextState {
  switch (action.type) {
    case 'SET_CURRENT_REPO':
      return { ...state, currentRepo: action.payload };
    case 'SET_ANALYSIS_STATUS':
      return { ...state, analysisStatus: action.payload };
    case 'SET_BUG_RESULTS':
      return { ...state, bugResults: action.payload };
    case 'SET_BUG_EXPLANATIONS':
      return { ...state, bugExplanations: action.payload };
    case 'SET_SCORE':
      return { ...state, score: action.payload };
    case 'SET_TIMELINE':
      return { ...state, timeline: action.payload };
    case 'SET_LOGS':
      return { ...state, logs: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_ANALYSIS':
      return initialState;
    default:
      return state;
  }
}

export interface AnalysisContextValue {
  state: AnalysisContextState;
  setCurrentRepo: (repo: string) => void;
  setAnalysisStatus: (status: AnalysisContextState['analysisStatus']) => void;
  setBugResults: (results: AgentFix[]) => void;
  setBugExplanations: (explanations: BugExplanation[]) => void;
  setScore: (score: number) => void;
  setTimeline: (timeline: TimelineEvent[]) => void;
  setLogs: (logs: LogEntry[]) => void;
  setError: (error: string | null) => void;
  resetAnalysis: () => void;
}

export const AnalysisContext = createContext<AnalysisContextValue | null>(null);

interface AnalysisProviderProps {
  children: ReactNode;
}

export function AnalysisProvider({ children }: AnalysisProviderProps) {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  const setCurrentRepo = (repo: string) => {
    dispatch({ type: 'SET_CURRENT_REPO', payload: repo });
  };

  const setAnalysisStatus = (status: AnalysisContextState['analysisStatus']): void => {
    dispatch({ type: 'SET_ANALYSIS_STATUS', payload: status });
  };

  const setBugResults = (results: AgentFix[]) => {
    dispatch({ type: 'SET_BUG_RESULTS', payload: results });
  };

  const setBugExplanations = (explanations: BugExplanation[]) => {
    dispatch({ type: 'SET_BUG_EXPLANATIONS', payload: explanations });
  };

  const setScore = (score: number) => {
    dispatch({ type: 'SET_SCORE', payload: score });
  };

  const setTimeline = (timeline: TimelineEvent[]) => {
    dispatch({ type: 'SET_TIMELINE', payload: timeline });
  };

  const setLogs = (logs: LogEntry[]) => {
    dispatch({ type: 'SET_LOGS', payload: logs });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const resetAnalysis = () => {
    dispatch({ type: 'RESET_ANALYSIS' });
  };

  const value: AnalysisContextValue = {
    state,
    setCurrentRepo,
    setAnalysisStatus,
    setBugResults,
    setBugExplanations,
    setScore,
    setTimeline,
    setLogs,
    setError,
    resetAnalysis,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export { useAnalysis } from './useAnalysis';