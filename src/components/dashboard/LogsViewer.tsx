import { useState } from "react";
import { type LogEntry } from "@/lib/mock-data";
import { Terminal } from "lucide-react";

const levelStyles = {
  info: "text-cyan-300",
  warn: "text-amber-300",
  error: "text-red-300",
  debug: "text-slate-400",
};

const levelBadge = {
  info: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20",
  warn: "bg-amber-500/15 text-amber-300 border border-amber-500/20",
  error: "bg-red-500/15 text-red-300 border border-red-500/20",
  debug: "bg-slate-700/30 text-slate-400 border border-slate-600/30",
};

const LogsViewer = ({ logs }: { logs: LogEntry[] }) => {
  const [filter, setFilter] = useState<"all" | "info" | "warn" | "error" | "debug">("all");

  const filtered = filter === "all" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-2xl shadow-xl flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 bg-gradient-to-r from-slate-900/60 to-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <Terminal className="h-5 w-5 text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Agent Logs</h2>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-1.5">
          {(["all", "info", "warn", "error", "debug"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs uppercase tracking-wide transition-all duration-300 ${
                filter === level
                  ? "bg-indigo-500/80 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Container */}
      <div className="flex-1 max-h-96 overflow-y-auto bg-slate-950/40 custom-scrollbar">
        <div className="p-6 space-y-2 font-mono text-sm">
          {filtered.length === 0 ? (
            <div className="text-slate-500 text-center py-8">No logs to display</div>
          ) : (
            filtered.map((log) => (
              <div key={log.id} className="flex gap-4 leading-6 group/log hover:bg-white/5 px-3 py-1.5 rounded transition-colors duration-200">
                <span className="text-slate-500 shrink-0 min-w-[4rem]">{log.timestamp}</span>
                <span className={`shrink-0 min-w-[3.5rem] px-2 py-0.5 rounded-md text-center font-semibold text-xs ${levelBadge[log.level]}`}>
                  {log.level.toUpperCase()}
                </span>
                <span className="text-indigo-400 shrink-0">[{log.agent}]</span>
                <span className={`${levelStyles[log.level]} group-hover/log:text-white transition-colors duration-200`}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsViewer;
