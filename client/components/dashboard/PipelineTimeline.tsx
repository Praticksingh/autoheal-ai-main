import { useMemo, useState, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Package,
  FlaskConical,
  Bug,
  Wrench,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { useAnalysis } from '@/context/useAnalysis';

type StageStatus = 'pending' | 'running' | 'success' | 'failed';

type StageDefinition = {
  key: string;
  label: string;
  shortLabel: string;
  keywords: string[];
  icon: ComponentType<{ className?: string }>;
};

const STAGES: StageDefinition[] = [
  {
    key: 'clone',
    label: 'Repository Cloned',
    shortLabel: 'Clone',
    keywords: ['clone', 'repository cloned'],
    icon: GitBranch,
  },
  {
    key: 'install',
    label: 'Dependencies Installed',
    shortLabel: 'Install',
    keywords: ['dependenc', 'install'],
    icon: Package,
  },
  {
    key: 'test',
    label: 'Tests Executed',
    shortLabel: 'Test',
    keywords: ['test'],
    icon: FlaskConical,
  },
  {
    key: 'analyze',
    label: 'Bugs Detected',
    shortLabel: 'Analyze',
    keywords: ['bug', 'fail'],
    icon: Bug,
  },
  {
    key: 'fix',
    label: 'Fixes Generated',
    shortLabel: 'Fix',
    keywords: ['fix', 'patch'],
    icon: Wrench,
  },
  {
    key: 'verify',
    label: 'CI/CD Pipeline Restored',
    shortLabel: 'Verify',
    keywords: ['pipeline', 'verify', 'complete', 'restored'],
    icon: CheckCircle2,
  },
];

const STATUS_STYLES: Record<StageStatus, { badge: string; dot: string; icon: string }> = {
  success: {
    badge: 'bg-green-500/15 text-green-300 border border-green-500/30',
    dot: 'bg-green-400',
    icon: 'text-green-300',
  },
  failed: {
    badge: 'bg-red-500/15 text-red-300 border border-red-500/30',
    dot: 'bg-red-400',
    icon: 'text-red-300',
  },
  running: {
    badge: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    dot: 'bg-blue-400',
    icon: 'text-blue-300',
  },
  pending: {
    badge: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',
    dot: 'bg-slate-400',
    icon: 'text-slate-300',
  },
};

function normalize(value: string) {
  return value.toLowerCase();
}

export default function PipelineTimeline() {
  const { state } = useAnalysis();
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const stageData = useMemo(() => {
    return STAGES.map((stage, index) => {
      const stageEvents = state.timeline.filter((event) =>
        stage.keywords.some((keyword) => normalize(`${event.action} ${event.agent}`).includes(keyword))
      );

      const stageLogs = state.logs.filter((log) =>
        stage.keywords.some((keyword) => normalize(`${log.message} ${log.agent}`).includes(keyword))
      );

      let status: StageStatus = 'pending';
      if (stageEvents.some((event) => event.status === 'failed')) {
        status = 'failed';
      } else if (stageEvents.some((event) => event.status === 'running')) {
        status = 'running';
      } else if (stageEvents.some((event) => event.status === 'success')) {
        status = 'success';
      } else if (state.analysisStatus === 'running' && index === 0) {
        status = 'running';
      }

      return {
        ...stage,
        status,
        timestamp: stageEvents.at(-1)?.timestamp || '--:--:--',
        logs: stageLogs,
      };
    });
  }, [state.analysisStatus, state.logs, state.timeline]);

  const completedCount = stageData.filter((stage) => stage.status === 'success').length;
  const progress = Math.round((completedCount / STAGES.length) * 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/55 to-slate-900/70 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Pipeline Execution Flow</h3>
        <span className="rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300">
          {progress}% complete
        </span>
      </div>

      <div className="mb-8">
        <div className="mb-3 grid grid-cols-6 gap-2 text-center text-[11px] uppercase tracking-wide text-slate-400">
          {STAGES.map((stage) => (
            <span key={stage.key}>{stage.shortLabel}</span>
          ))}
        </div>
        <div className="relative h-2 overflow-hidden rounded-full border border-white/10 bg-slate-800/70">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {stageData.map((stage, index) => {
          const Icon = stage.icon;
          const styles = STATUS_STYLES[stage.status];
          const isExpanded = expandedStage === stage.key;

          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-white/10 bg-slate-900/45"
            >
              <button
                type="button"
                onClick={() => setExpandedStage(isExpanded ? null : stage.key)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {stage.status === 'running' && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-blue-400/20"
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    )}
                    <div className={`relative rounded-lg p-2 ${styles.badge}`}>
                      {stage.status === 'running' ? (
                        <Loader2 className={`h-4 w-4 animate-spin ${styles.icon}`} />
                      ) : stage.status === 'failed' ? (
                        <AlertTriangle className={`h-4 w-4 ${styles.icon}`} />
                      ) : (
                        <Icon className={`h-4 w-4 ${styles.icon}`} />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-slate-100">{stage.label}</div>
                    <div className="text-xs text-slate-400">{stage.timestamp}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${styles.badge}`}>
                    <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
                    {stage.status}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-white/10 px-4 py-3">
                  {stage.logs.length === 0 ? (
                    <p className="text-xs text-slate-500">No stage logs yet.</p>
                  ) : (
                    <div className="space-y-2 font-mono text-xs">
                      {stage.logs.map((log) => (
                        <div key={log.id} className="rounded-md bg-slate-950/60 px-3 py-2 text-slate-300">
                          <span className="mr-2 text-slate-500">[{log.timestamp}]</span>
                          {log.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
