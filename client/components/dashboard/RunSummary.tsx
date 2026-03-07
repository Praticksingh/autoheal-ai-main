import { GitBranch, Clock, RotateCcw, CheckCircle2, XCircle, Wrench } from "lucide-react";
import { type AgentRun } from "@/lib/mock-data";

const RunSummary = ({ run }: { run: AgentRun }) => {
  const isPassed = run.status === "passed";

  return (
    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 h-full transition-all duration-300 hover:border-white/20 hover:shadow-2xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30">
            <GitBranch className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Run Summary</h2>
        </div>
        <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-medium text-xs transition-all duration-300 ${
          isPassed 
            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20" 
            : "bg-red-500/15 text-red-300 border border-red-500/20"
        }`}>
          {isPassed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {isPassed ? "Passed" : "Failed"}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6">
        <Stat label="Repository" value={run.repoName} mono />
        <Stat label="Branch" value={run.branch} mono />
        <Stat label="Test Framework" value={run.testFramework} />
        <Stat label="Mode" value={run.mode === "team" ? `Team (${run.leaderName})` : "Individual"} />
        <Stat label="Fixes Applied" value={`${run.totalFixes}`} icon={<Wrench className="h-4 w-4 text-indigo-400" />} />
        <Stat label="Iterations" value={`${run.iterations} / ${run.maxIterations}`} icon={<RotateCcw className="h-4 w-4 text-cyan-400" />} />
        <Stat label="Time Taken" value={run.timeTaken} icon={<Clock className="h-4 w-4 text-slate-400" />} />
        <Stat label="Run ID" value={run.id} mono />
      </div>
    </div>
  );
};

const Stat = ({ label, value, mono, icon }: { label: string; value: string; mono?: boolean; icon?: React.ReactNode }) => (
  <div className="group/stat">
    <div className="text-xs font-medium text-slate-400 mb-2 group-hover/stat:text-slate-300 transition-colors">{label}</div>
    <div className={`text-base flex items-center gap-2 font-semibold text-slate-100 ${mono ? "font-mono text-sm" : ""}`}>
      {icon} {value}
    </div>
  </div>
);

export default RunSummary;
