import { CheckCircle2, XCircle, Loader2, Clock, Zap } from "lucide-react";
import { useAnalysis } from "@/context/useAnalysis";

const statusStyles = {
  success: { icon: CheckCircle2, dot: "bg-emerald-400 shadow-lg shadow-emerald-400/50", line: "bg-gradient-to-b from-emerald-400/40 to-emerald-400/20" },
  running: { icon: Loader2, dot: "bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-spin", line: "bg-gradient-to-b from-cyan-400/40 to-cyan-400/20" },
  failed: { icon: XCircle, dot: "bg-red-400 shadow-lg shadow-red-400/50", line: "bg-gradient-to-b from-red-400/40 to-red-400/20" },
  pending: { icon: Clock, dot: "bg-slate-500 shadow-lg shadow-slate-500/50", line: "bg-gradient-to-b from-slate-500/40 to-slate-500/20" },
};

const CICDTimeline = () => {
  const { state } = useAnalysis();
  const events = state.timeline;
  return (
    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 transition-all duration-300 hover:border-white/20 hover:shadow-2xl shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
          <Zap className="h-5 w-5 text-cyan-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-100">CI/CD Timeline</h2>
      </div>

      {/* Timeline */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-3 custom-scrollbar">
        {events.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center">
            <p className="text-sm font-medium text-slate-300">No timeline events yet</p>
            <p className="mt-2 text-xs text-slate-500">Run an agent to watch CI/CD stages stream in real time.</p>
          </div>
        )}
        {events.map((event, i) => {
          const style = statusStyles[event.status];
          const IconComponent = style.icon;
          const isLast = i === events.length - 1;
          return (
            <div key={event.id} className="flex gap-4 relative group/event">
              {/* Timeline Dot + Line */}
              <div className="flex flex-col items-center pt-1">
                <div className={`h-3 w-3 rounded-full shrink-0 transition-all duration-300 ${style.dot}`} />
                {!isLast && <div className={`w-0.5 min-h-[48px] ${style.line} transition-all duration-300`} />}
              </div>

              {/* Event Content */}
              <div className="pb-3 pt-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs text-slate-400">{event.timestamp}</span>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 font-semibold text-xs border border-indigo-500/20">
                    {event.agent}
                  </span>
                </div>
                <p className="text-sm text-slate-200 font-medium group-hover/event:text-slate-100 transition-colors">{event.action}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CICDTimeline;
