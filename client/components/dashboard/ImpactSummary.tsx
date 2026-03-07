import { motion } from "framer-motion";
import { Clock, Zap, TrendingUp } from "lucide-react";
import { type AgentRun } from "@/lib/mock-data";
import { getImpactMetrics } from "@/services/ux-helpers";

interface ImpactSummaryProps {
  run: AgentRun;
}

const ImpactSummary = ({ run }: ImpactSummaryProps) => {
  const metrics = getImpactMetrics(run);

  const impactItems = [
    {
      icon: Zap,
      label: "Fixes Applied",
      value: metrics.totalFixesApplied.toString(),
      unit: "issue" + (metrics.totalFixesApplied !== 1 ? "s" : ""),
      color: "from-indigo-500 to-indigo-600",
      iconColor: "text-indigo-400",
    },
    {
      icon: Clock,
      label: "Time Saved",
      value: metrics.timeSaved,
      unit: "of manual debugging",
      color: "from-emerald-500 to-emerald-600",
      iconColor: "text-emerald-400",
    },
    {
      icon: TrendingUp,
      label: "Iterations Avoided",
      value: metrics.iterationsAvoided.toString(),
      unit: "fewer cycle" + (metrics.iterationsAvoided !== 1 ? "s" : ""),
      color: "from-cyan-500 to-cyan-600",
      iconColor: "text-cyan-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 shadow-xl"
    >
      <h3 className="text-lg font-semibold text-slate-100 mb-6">
        Your Impact This Run
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {impactItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="rounded-xl border border-white/5 bg-slate-900/30 p-4 hover:border-white/10 hover:bg-slate-900/50 transition-all duration-300"
            >
              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br ${item.color} bg-opacity-10 mb-3`}
              >
                <Icon className={`h-4.5 w-4.5 ${item.iconColor}`} />
              </div>

              {/* Label */}
              <p className="text-xs font-medium text-slate-400 mb-2">
                {item.label}
              </p>

              {/* Value */}
              <div className="mb-2">
                <p className="text-2xl font-bold text-slate-100">
                  {item.value}
                </p>
              </div>

              {/* Unit */}
              <p className="text-xs text-slate-500">{item.unit}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t border-white/5"
      >
        <p className="text-sm text-slate-300 leading-relaxed">
          You saved approximately <span className="font-semibold text-emerald-400">{metrics.timeSaved}</span> of manual debugging and avoided{" "}
          <span className="font-semibold text-cyan-400">{metrics.iterationsAvoided}</span> CI/CD cycle{metrics.iterationsAvoided !== 1 ? "s" : ""}. That's productive. 🚀
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ImpactSummary;
