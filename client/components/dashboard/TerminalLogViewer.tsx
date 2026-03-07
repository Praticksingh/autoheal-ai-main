import { useMemo, useState } from 'react';
import { TerminalSquare, ChevronDown } from 'lucide-react';
import { useAnalysis } from '@/context/useAnalysis';

export default function TerminalLogViewer() {
  const { state } = useAnalysis();
  const [open, setOpen] = useState(true);

  const terminalLines = useMemo(() => {
    if (state.logs.length === 0) {
      return [
        { level: 'info', text: '> git clone https://github.com/example/repo' },
        { level: 'info', text: '> npm install' },
        { level: 'warn', text: '> npm test' },
      ];
    }

    return state.logs.slice(-12).map((log) => ({
      level: log.level,
      text: `> ${log.message}`,
    }));
  }, [state.logs]);

  const lineClass = (level: string) => {
    if (level === 'error') {
      return 'text-red-300';
    }
    if (level === 'warn') {
      return 'text-amber-300';
    }
    if (level === 'debug') {
      return 'text-purple-300';
    }
    return 'text-green-300';
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-xl">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mb-3 flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-4 w-4 text-green-300" />
          <h3 className="text-sm font-semibold text-slate-100">Terminal Log Viewer</h3>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-black/60 p-3 font-mono text-xs">
          {terminalLines.map((line, index) => (
            <div key={`${line.text}-${index}`} className={`mb-1 ${lineClass(line.level)}`}>
              {line.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
