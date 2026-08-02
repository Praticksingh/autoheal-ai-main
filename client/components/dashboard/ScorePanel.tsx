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
    <div className="group rounded-xl border border-[#30363d] bg-[#161b22] p-6 h-full flex flex-col transition-all hover:border-[#8b949e] shadow-md text-[#f0f6fc]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#30363d]">
        <div className="p-2.5 rounded-md bg-[#21262d] border border-[#30363d] text-[#e3b341]">
          <Trophy className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold font-sans text-[#f0f6fc]">Score Breakdown</h2>
      </div>

      <div className="flex flex-1 items-center justify-center py-4">
        <div className="relative h-40 w-40">
          <svg className="h-40 w-40 -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} stroke="#21262d" strokeWidth="10" fill="none" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#238636"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-[#f0f6fc] font-mono">{finalScore}</span>
            <span className="text-xs font-mono font-semibold text-[#8b949e] uppercase tracking-wider">/ 100</span>
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
