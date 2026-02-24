import { CheckCircle2, XCircle, SkipForward, Wrench } from "lucide-react";
import { type AgentFix } from "@/lib/mock-data";

const statusConfig = {
  fixed: { icon: CheckCircle2, label: "Fixed", className: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" },
  skipped: { icon: SkipForward, label: "Skipped", className: "text-amber-400 bg-amber-500/10 border border-amber-500/20" },
  failed: { icon: XCircle, label: "Failed", className: "text-red-400 bg-red-500/10 border border-red-500/20" },
};

const bugTypeColors: Record<string, string> = {
  SYNTAX: "bg-red-500/10 text-red-300 border border-red-500/20",
  IMPORT: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
  TYPE: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  LOGIC: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
  LINT: "bg-slate-700/30 text-slate-300 border border-slate-600/30",
  INDENTATION: "bg-slate-700/30 text-slate-300 border border-slate-600/30",
};

const FixesTable = ({ fixes }: { fixes: AgentFix[] }) => {
  return (
    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-2xl shadow-xl">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 bg-gradient-to-r from-slate-900/60 to-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Wrench className="h-5 w-5 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Applied Fixes ({fixes.length})</h2>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-slate-900/50">
              <th className="text-left px-8 py-4 font-semibold text-xs uppercase tracking-wide text-slate-400">File</th>
              <th className="text-left px-6 py-4 font-semibold text-xs uppercase tracking-wide text-slate-400">Bug Type</th>
              <th className="text-left px-6 py-4 font-semibold text-xs uppercase tracking-wide text-slate-400">Line</th>
              <th className="text-left px-6 py-4 font-semibold text-xs uppercase tracking-wide text-slate-400">Description</th>
              <th className="text-left px-6 py-4 font-semibold text-xs uppercase tracking-wide text-slate-400">Confidence</th>
              <th className="text-left px-6 py-4 font-semibold text-xs uppercase tracking-wide text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {fixes.map((fix, idx) => {
              const statusInfo = statusConfig[fix.status];
              const StatusIcon = statusInfo.icon;
              return (
                <tr
                  key={fix.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                >
                  <td className="px-8 py-4 font-mono text-sm text-slate-300">{fix.fileName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-lg font-medium text-xs ${bugTypeColors[fix.bugType]}`}>
                      {fix.bugType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-400">{fix.lineNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">{fix.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-2 rounded-full bg-slate-700/50 overflow-hidden border border-white/5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            fix.confidence > 0.7
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                              : fix.confidence > 0.5
                                ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                : "bg-gradient-to-r from-red-500 to-red-400"
                          }`}
                          style={{ width: `${fix.confidence * 100}%` }}
                        />
                      </div>
                      <span className="font-semibold text-xs text-slate-300 min-w-[2.5rem]">{(fix.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs ${statusInfo.className}`}>
                      <StatusIcon className="h-4 w-4" /> {statusInfo.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FixesTable;
