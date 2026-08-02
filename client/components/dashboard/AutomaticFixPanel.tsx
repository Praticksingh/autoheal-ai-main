import React from 'react';
import { Wrench, CheckCircle2, AlertTriangle, Sparkles, FileCode2 } from 'lucide-react';
import { useAnalysis } from '@/context/useAnalysis';

export default function AutomaticFixPanel() {
  const { state } = useAnalysis();

  const fixes = state.bugResults.length > 0 ? state.bugResults : state.bugExplanations;
  const isCompleted = state.analysisStatus === 'completed';

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-md text-[#f0f6fc] transition-all hover:border-[#8b949e]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-[#21262d] border border-[#30363d] text-[#3fb950]">
            <Wrench className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold font-sans text-[#f0f6fc]">Automatic Fix Panel</h3>
        </div>
        {fixes.length > 0 && (
          <span className="rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-xs font-mono font-bold text-[#3fb950]">
            {fixes.length} Fix Action{fixes.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {fixes.length === 0 ? (
        isCompleted ? (
          <div className="rounded-md border border-[#238636] bg-[rgba(46,160,67,0.12)] p-6 text-center text-xs text-[#c9d1d9]">
            <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-[#3fb950]" />
            <h4 className="font-bold text-[#f0f6fc]">No Code Patches Required</h4>
            <p className="mt-1 text-[#8b949e]">Codebase is clean, syntax-verified, and build-ready.</p>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-[#30363d] bg-[#0d1117] p-6 text-center text-xs text-[#8b949e]">
            No applied fixes yet. Launch an agent diagnosis to generate AI code fix cards.
          </div>
        )
      ) : (
        <div className="space-y-4">
          {fixes.map((fix: any, idx: number) => {
            const fileName = fix.fileName || fix.file || 'package.json';
            const lineNumber = fix.lineNumber ?? fix.line ?? 1;
            const bugType = fix.bugType || 'LOGIC';
            const status = fix.status || 'detected';
            const isFixed = status === 'fixed';
            const description = fix.description || fix.explanation || fix.suggestedFix || 'AI Patch available for issue';
            const confidence = fix.confidence ? (fix.confidence * 100).toFixed(0) : fix.confidenceScore || 92;
            const diffText = fix.diff || fix.patchDiff || fix.suggestedFix || null;

            return (
              <div
                key={fix.id || `${fileName}-${idx}`}
                className={`rounded-md border p-4 shadow-sm transition-all ${
                  isFixed
                    ? 'border-[#238636] bg-[#0d1117]'
                    : 'border-[#30363d] bg-[#0d1117]'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isFixed ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#238636] bg-[rgba(46,160,67,0.15)] px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#3fb950]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        FIX APPLIED & VERIFIED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#e3b341]/40 bg-[rgba(227,179,65,0.15)] px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#e3b341]">
                        <Sparkles className="h-3.5 w-3.5" />
                        PROPOSED AI FIX PATCH
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#8b949e]">
                    Confidence: <strong className="text-[#58a6ff]">{confidence}%</strong>
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#c9d1d9]">
                    <FileCode2 className="h-3.5 w-3.5 text-[#58a6ff]" />
                    <span className="text-[#8b949e]">File:</span>
                    <span className="font-bold text-[#f0f6fc]">{fileName}:{lineNumber}</span>
                    <span className="ml-auto rounded border border-[#30363d] bg-[#21262d] px-2 py-0.5 text-[10px] text-[#f85149]">
                      {bugType}
                    </span>
                  </div>
                  <p className="text-[#c9d1d9] font-sans text-xs mt-1">
                    {description}
                  </p>
                </div>

                {diffText && (
                  <div className="mt-3 rounded-md border border-[#30363d] bg-[#161b22] p-2.5 font-mono text-[11px] text-[#3fb950] overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{diffText}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
