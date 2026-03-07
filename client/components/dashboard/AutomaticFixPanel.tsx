import { Wrench, CheckCircle2 } from 'lucide-react';
import { useAnalysis } from '@/context/useAnalysis';

export default function AutomaticFixPanel() {
  const { state } = useAnalysis();
  const appliedFixes = state.bugResults.filter((fix) => fix.status === 'fixed');

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/55 to-slate-900/70 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md border border-purple-500/30 bg-purple-500/10 p-2">
          <Wrench className="h-4 w-4 text-purple-300" />
        </div>
        <h3 className="text-sm font-semibold text-slate-100">Automatic Fix Panel</h3>
      </div>

      {appliedFixes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/50 p-6 text-center text-sm text-slate-400">
          No applied fixes yet. Run an agent to generate fix cards.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {appliedFixes.map((fix) => (
            <div key={fix.id} className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-green-300">Fix Applied</span>
                <CheckCircle2 className="h-4 w-4 text-green-300" />
              </div>
              <div className="space-y-1 text-sm text-slate-300">
                <p><span className="text-slate-500">File:</span> {fix.fileName}</p>
                <p><span className="text-slate-500">Bug Type:</span> {fix.bugType}</p>
                <p><span className="text-slate-500">Action:</span> {fix.description}</p>
                <p><span className="text-slate-500">Confidence:</span> {(fix.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
