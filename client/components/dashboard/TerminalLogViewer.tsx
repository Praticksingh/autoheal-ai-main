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
      return 'text-pink-400 font-bold';
    }
    if (level === 'warn') {
      return 'text-amber-300 font-semibold';
    }
    if (level === 'debug') {
      return 'text-fuchsia-300 font-semibold';
    }
    return 'text-white font-semibold';
  };

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-md text-[#f0f6fc] transition-all hover:border-[#8b949e]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mb-3 flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
            <TerminalSquare className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold font-sans text-[#f0f6fc]">Terminal Log Viewer</h3>
        </div>
        <ChevronDown className={`h-4 w-4 text-[#8b949e] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="max-h-72 overflow-y-auto rounded-md border border-[#30363d] bg-[#0d1117] p-4 font-mono text-xs shadow-inner text-[#c9d1d9]">
          {terminalLines.map((line, index) => (
            <div key={`${line.text}-${index}`} className={`mb-1.5 ${lineClass(line.level)}`}>
              {line.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
