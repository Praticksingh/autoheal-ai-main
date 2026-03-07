import { motion } from "framer-motion";
import { Brain, Lightbulb } from "lucide-react";
import { getMostCommonBugType } from "@/services/ux-helpers";
import { useAnalysis } from "@/context/useAnalysis";

const InsightPanel = () => {
  const { state } = useAnalysis();
  const fixes = state.bugResults;
  const insight = getMostCommonBugType(fixes);

  if (!insight) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <Brain className="h-5 w-5 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">
            Development Insights
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">
            Run your first analysis to get personalized insights about your code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 shadow-xl hover:border-white/20 hover:shadow-2xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
          <Brain className="h-5 w-5 text-cyan-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-100">
          Development Insights
        </h3>
      </div>

      {/* Main Insight */}
      <div className="mb-6">
        <p className="text-sm text-slate-400 mb-3">Most common issue type:</p>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {insight.type}
          </span>
          <span className="text-lg text-slate-400 font-medium">
            ({insight.count} occurrence{insight.count !== 1 ? "s" : ""})
          </span>
        </div>
      </div>

      {/* Suggestion */}
      <div className="rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-100 leading-relaxed">
            {insight.suggestion}
          </p>
        </div>
      </div>

      {/* Context */}
      <p className="text-xs text-slate-500 mt-6">
        Based on {insight.count} {insight.type} issue{insight.count !== 1 ? "s" : ""} found in this run.
      </p>
    </motion.div>
  );
};

export default InsightPanel;
