import { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAnalysis } from '@/context/useAnalysis';
import { API_BASE_URL } from '@/config';

function StatusRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-[#30363d] bg-[#0d1117] px-3.5 py-2">
      <span className="text-xs font-mono font-medium text-[#c9d1d9]">{label}</span>
      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold ${active ? 'bg-[rgba(46,160,67,0.15)] text-[#3fb950] border border-[#238636]' : 'bg-[rgba(248,81,73,0.15)] text-[#f85149] border border-[rgba(248,81,73,0.4)]'}`}>
        {active ? <CheckCircle2 className="h-3 w-3 text-[#3fb950]" /> : <AlertTriangle className="h-3 w-3 text-[#f85149]" />}
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
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-md text-[#f0f6fc] transition-all hover:border-[#8b949e]">
      <div className="mb-4 flex items-center gap-3 pb-3 border-b border-[#30363d]">
        <div className="p-2 rounded-md bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
          <Activity className="h-4 w-4" />
        </div>
        <h3 className="text-base font-bold font-sans text-[#f0f6fc]">System Status</h3>
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
