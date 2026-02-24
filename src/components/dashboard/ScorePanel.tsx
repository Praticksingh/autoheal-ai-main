import { Trophy, Zap, TrendingDown } from "lucide-react";
import { type ScoreBreakdown } from "@/lib/mock-data";

const ScorePanel = ({ score }: { score: ScoreBreakdown }) => {
  const getScoreColor = (s: number) => {
    if (s >= 90) return "from-emerald-600 to-emerald-400 text-emerald-100";
    if (s >= 70) return "from-amber-600 to-amber-400 text-amber-100";
    return "from-red-600 to-red-400 text-red-100";
  };

  const getFinalColor = (s: number) => {
    if (s >= 90) return "text-emerald-300";
    if (s >= 70) return "text-amber-300";
    return "text-red-300";
  };

  return (
    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 h-full flex flex-col transition-all duration-300 hover:border-white/20 hover:shadow-2xl shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
          <Trophy className="h-5 w-5 text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-100">Score Breakdown</h2>
      </div>

      {/* Score Circle */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className={`relative`}>
          <div className={`text-7xl font-black font-mono bg-gradient-to-r ${getScoreColor(score.final)} bg-clip-text text-transparent`}>
            {score.final}
          </div>
          <div className="text-sm text-slate-400 font-medium text-center mt-2">out of 100</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3 mt-8 pt-6 border-t border-white/5">
        <ScoreLine label="Base Score" value={score.base} icon={<div className="h-2.5 w-2.5 rounded-full bg-slate-300" />} />
        <ScoreLine label="Speed Bonus" value={score.speedBonus} positive icon={<Zap className="h-4 w-4 text-emerald-400" />} />
        <ScoreLine label="Efficiency Penalty" value={score.efficiencyPenalty} icon={<TrendingDown className="h-4 w-4 text-red-400" />} />
      </div>
    </div>
  );
};

const ScoreLine = ({ label, value, positive, icon }: { label: string; value: number; positive?: boolean; icon: React.ReactNode }) => (
  <div className="flex items-center justify-between group/line">
    <span className="flex items-center gap-2.5 text-sm text-slate-300 group-hover/line:text-slate-100 transition-colors">{icon} {label}</span>
    <span className={`font-semibold font-mono text-sm ${value > 0 ? "text-emerald-300" : value < 0 ? "text-red-300" : "text-slate-300"}`}>
      {value > 0 ? `+${value}` : value}
    </span>
  </div>
);

export default ScorePanel;
