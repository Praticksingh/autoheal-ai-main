import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Terminal } from 'lucide-react';
import { useAnalysis } from '@/context/useAnalysis';

const FALLBACK_FEED = [
  'Cloning repository...',
  'Running tests...',
  '3 test failures detected',
  'Generating code fixes',
  'Applying patch to utils/parser.ts',
  'Pipeline verification passed',
];

export default function AgentActivityFeed() {
  const { state } = useAnalysis();
  const [typed, setTyped] = useState('');

  const messages = useMemo(() => {
    if (state.logs.length === 0) {
      return FALLBACK_FEED;
    }
    return state.logs.slice(-8).map((log) => log.message);
  }, [state.logs]);

  const activeMessage = messages.at(-1) || 'Awaiting agent activity...';

  useEffect(() => {
    let index = 0;
    setTyped('');

    const timer = setInterval(() => {
      index += 1;
      setTyped(activeMessage.slice(0, index));
      if (index >= activeMessage.length) {
        clearInterval(timer);
      }
    }, 22);

    return () => clearInterval(timer);
  }, [activeMessage]);

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-md text-[#f0f6fc] transition-all hover:border-[#8b949e]">
      <div className="mb-4 flex items-center gap-3 pb-3 border-b border-[#30363d]">
        <div className="p-2 rounded-md bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
          <Activity className="h-4 w-4" />
        </div>
        <h3 className="text-base font-bold font-sans text-[#f0f6fc]">Live Agent Execution Feed</h3>
      </div>

      <div className="mb-4 rounded-md border border-[#30363d] bg-[#0d1117] p-4 font-mono text-xs text-[#c9d1d9] shadow-inner">
        <div className="mb-2 flex items-center gap-2 text-[#58a6ff] font-bold">
          <Terminal className="h-3.5 w-3.5" />
          terminal stream
        </div>
        <div className="min-h-5 text-[#3fb950] font-semibold">
          {'>'} {typed}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="ml-1 inline-block h-3 w-1.5 bg-[#3fb950] align-middle"
          />
        </div>
      </div>

      <div className="space-y-2">
        {messages.slice(-5).reverse().map((message, index) => (
          <motion.div
            key={`${message}-${index}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-md border border-[#30363d] bg-[#21262d] px-3.5 py-2 text-xs font-mono text-[#c9d1d9] shadow-sm"
          >
            {message}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
