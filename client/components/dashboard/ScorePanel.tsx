import { Trophy, Gauge, Timer, Cpu } from "lucide-react";
import { useAnalysis } from "@/context/useAnalysis";

const ScorePanel = () => {
  const { state } = useAnalysis();
  const finalScore = state.score ?? 0;
  const accuracy = Math.min(100, Math.max(0, finalScore + 3));
  const speed = Math.min(100, Math.max(0, finalScore - 5));
  const efficiency = Math.min(100, Math.max(0, finalScore - 8));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.max(finalScore, 1) / 100) * circumference;

  return (
    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 h-full flex flex-col transition-all duration-300 hover:border-white/20 hover:shadow-2xl shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
          <Trophy className="h-5 w-5 text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-100">Score Breakdown</h2>
      </div>

      <div className="flex flex-1 items-center justify-center py-6">
        <div className="relative h-40 w-40">
          <svg className="h-40 w-40 -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} stroke="rgba(148,163,184,0.25)" strokeWidth="10" fill="none" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="url(#pipeline-score-gradient)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="pipeline-score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-black text-slate-100">{finalScore}</p>
            <p className="text-xs text-slate-400">/ 100</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-4 pt-5 border-t border-white/5">
        <ScoreLine label="Accuracy" value={accuracy} icon={<Gauge className="h-4 w-4 text-blue-300" />} />
        <ScoreLine label="Speed" value={speed} icon={<Timer className="h-4 w-4 text-green-300" />} />
        <ScoreLine label="Efficiency" value={efficiency} icon={<Cpu className="h-4 w-4 text-purple-300" />} />
      </div>
    </div>
  );
};

const ScoreLine = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <div className="flex items-center justify-between group/line">
    <span className="flex items-center gap-2.5 text-sm text-slate-300 group-hover/line:text-slate-100 transition-colors">{icon} {label}</span>
    <span className="font-semibold font-mono text-sm text-slate-200">{value}</span>
  </div>
);

export default ScorePanel;
