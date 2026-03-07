import { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAnalysis } from '@/context/useAnalysis';
import { API_BASE_URL } from '@/config';

function StatusRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/10 bg-slate-900/50 px-3 py-2">
      <span className="text-xs text-slate-300">{label}</span>
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${active ? 'bg-green-500/15 text-green-300 border border-green-500/30' : 'bg-red-500/15 text-red-300 border border-red-500/30'}`}>
        {active ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
        {active ? 'Active' : 'Offline'}
      </span>
    </div>
  );
}

export default function SystemStatusPanel() {
  const { state } = useAnalysis();
  const [backendConnected, setBackendConnected] = useState(false);
  const [githubReachable, setGithubReachable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const backend = await fetch(`${API_BASE_URL}/api/health`);
        if (!cancelled) {
          setBackendConnected(backend.ok);
        }
      } catch {
        if (!cancelled) {
          setBackendConnected(false);
        }
      }

      try {
        const github = await fetch('https://api.github.com', { method: 'GET' });
        if (!cancelled) {
          setGithubReachable(github.ok);
        }
      } catch {
        if (!cancelled) {
          setGithubReachable(false);
        }
      }
    };

    void check();
    const interval = setInterval(() => {
      void check();
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const sandboxActive = useMemo(() => state.analysisStatus === 'running' || state.analysisStatus === 'completed', [state.analysisStatus]);
  const agentReady = state.analysisStatus !== 'running';

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/55 to-slate-900/70 p-5 shadow-xl backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-2">
          <Activity className="h-4 w-4 text-blue-300" />
        </div>
        <h3 className="text-sm font-semibold text-slate-100">System Status</h3>
      </div>
      <div className="space-y-2">
        <StatusRow label="Backend Connected" active={backendConnected} />
        <StatusRow label="GitHub API Reachable" active={githubReachable} />
        <StatusRow label="Agent Ready" active={agentReady} />
        <StatusRow label="Sandbox Environment Active" active={sandboxActive} />
      </div>
    </div>
  );
}
