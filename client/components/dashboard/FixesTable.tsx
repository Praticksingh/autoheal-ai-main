import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  FileCode2,
  X,
} from 'lucide-react';
import { useAnalysis } from '@/context/AnalysisContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  detected: { label: 'Detected', icon: AlertTriangle, color: 'text-[#e3b341] bg-[#0d1117] border border-[#30363d]' },
  analyzing: { label: 'Analyzing', icon: Clock, color: 'text-[#58a6ff] bg-[#0d1117] border border-[#30363d]' },
  fixing: { label: 'Fixing...', icon: Wrench, color: 'text-[#e3b341] bg-[#0d1117] border border-[#30363d]' },
  fixed: { label: 'Fixed', icon: CheckCircle2, color: 'text-[#3fb950] bg-[rgba(46,160,67,0.15)] border border-[#238636]' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-[#f85149] bg-[rgba(248,81,73,0.15)] border border-[rgba(248,81,73,0.4)]' },
};

const bugTypeColors: Record<string, string> = {
  Syntax: 'bg-[#21262d] text-[#f85149] border border-[#30363d]',
  Dependency: 'bg-[#21262d] text-[#58a6ff] border border-[#30363d]',
  Type: 'bg-[#21262d] text-[#e3b341] border border-[#30363d]',
  Logic: 'bg-[#21262d] text-[#a5d6ff] border border-[#30363d]',
  Assertion: 'bg-[#21262d] text-[#3fb950] border border-[#30363d]',
  'Syntax Error': 'bg-[#21262d] text-[#f85149] border border-[#30363d]',
  'Import Error': 'bg-[#21262d] text-[#58a6ff] border border-[#30363d]',
  'Type Error': 'bg-[#21262d] text-[#e3b341] border border-[#30363d]',
  'Runtime Error': 'bg-[#21262d] text-[#a5d6ff] border border-[#30363d]',
};

export const FixesTable: React.FC = () => {
  const { state } = useAnalysis();
  const [selectedFix, setSelectedFix] = useState<any>(null);

  const fixes = state.bugResults.length > 0 ? state.bugResults : state.bugExplanations;
  const isRunning = state.analysisStatus === 'running';

  return (
    <div className="group rounded-xl border border-[#30363d] bg-[#161b22] shadow-md overflow-hidden transition-all hover:border-[#8b949e] text-[#f0f6fc]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#30363d] bg-[#21262d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#161b22] border border-[#30363d] text-[#58a6ff]">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans text-[#f0f6fc]">Bug Detection Panel ({fixes.length})</h2>
            </div>
          </div>
          {fixes.length > 0 && (
            <span className="rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-xs font-mono text-[#e3b341]">
              {fixes.length} Issue{fixes.length > 1 ? 's' : ''} Identified
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {fixes.length === 0 && (
          <div className="px-6 py-8 border-t border-[#30363d]">
            {isRunning ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-10 rounded-md bg-[#21262d] animate-pulse" />
                ))}
              </div>
            ) : state.analysisStatus === 'completed' ? (
              <div className="rounded-md border border-[#238636] bg-[rgba(46,160,67,0.12)] p-6 text-center">
                <p className="text-sm font-bold text-[#3fb950]">No Issues Detected</p>
                <p className="mt-1 text-xs text-[#8b949e]">Your repository passed all diagnostic, dependency, and syntax checks cleanly.</p>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-[#30363d] bg-[#0d1117] p-6 text-center">
                <p className="text-xs font-semibold text-[#8b949e]">No issues detected yet</p>
                <p className="mt-1 text-[11px] text-[#8b949e]">Run an analysis to detect issues and generate automated fixes.</p>
              </div>
            )}
          </div>
        )}

        {fixes.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#30363d] bg-[#0d1117] text-xs font-mono text-[#8b949e]">
                <th className="px-6 py-3 font-semibold uppercase">File</th>
                <th className="px-6 py-3 font-semibold uppercase">Bug Type</th>
                <th className="px-6 py-3 font-semibold uppercase">Line</th>
                <th className="px-6 py-3 font-semibold uppercase">Description</th>
                <th className="px-6 py-3 font-semibold uppercase">Confidence</th>
                <th className="px-6 py-3 font-semibold uppercase">Status</th>
                <th className="px-6 py-3 font-semibold uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d] text-xs font-mono">
              {fixes.map((fix: any, index: number) => {
                const fileName = fix.fileName || fix.file || 'package.json';
                const lineNumber = fix.lineNumber ?? fix.line ?? 1;
                const bugType = fix.bugType || 'LOGIC';
                const status = fix.status || 'detected';
                const statusInfo = statusConfig[status] || statusConfig.detected;
                const StatusIcon = statusInfo.icon;
                const description = fix.description || fix.explanation || fix.rawIssue || 'Issue identified during scan';
                const confidencePct = fix.confidence ? Math.round(fix.confidence * 100) : fix.confidenceScore || 92;

                return (
                  <tr key={fix.id || `${fileName}-${index}`} className="hover:bg-[#21262d] transition-colors">
                    <td className="px-6 py-3.5 text-[#f0f6fc] font-bold whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="h-4 w-4 text-[#58a6ff]" />
                        <span>{fileName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-mono text-[10px] ${bugTypeColors[bugType] || 'bg-[#21262d] text-[#c9d1d9] border border-[#30363d]'}`}>
                        {bugType}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#8b949e]">{lineNumber}</td>
                    <td className="px-6 py-3.5 text-[#c9d1d9] max-w-xs truncate" title={description}>{description}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[#0d1117] border border-[#30363d] overflow-hidden">
                          <div
                            className="h-full bg-[#3fb950] rounded-full"
                            style={{ width: `${confidencePct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#8b949e]">{confidencePct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFix(fix)}
                        className="h-7 border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] hover:text-white text-[11px] rounded-md font-mono"
                      >
                        <Code2 className="h-3 w-3 mr-1 text-[#58a6ff]" /> View Patch
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Patch Modal */}
      {selectedFix && (
        <Dialog open={Boolean(selectedFix)} onOpenChange={() => setSelectedFix(null)}>
          <DialogContent className="max-w-2xl bg-[#161b22] border-[#30363d] text-[#f0f6fc]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-mono text-sm">
                <FileCode2 className="h-4 w-4 text-[#58a6ff]" />
                Patch Preview for {selectedFix.fileName || selectedFix.file || 'package.json'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 font-mono text-xs">
              <div className="rounded-md border border-[#30363d] bg-[#0d1117] p-3 text-[#c9d1d9]">
                <p><strong>Bug Type:</strong> {selectedFix.bugType}</p>
                <p><strong>Line Number:</strong> {selectedFix.lineNumber ?? selectedFix.line ?? 1}</p>
                <p className="mt-1"><strong>Description:</strong> {selectedFix.description || selectedFix.explanation || selectedFix.rawIssue}</p>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-bold text-[#8b949e] uppercase tracking-wider">Suggested Code Patch</h4>
                <pre className="rounded-md border border-[#30363d] bg-[#0d1117] p-4 text-[#3fb950] overflow-x-auto whitespace-pre-wrap">
                  {selectedFix.diff || selectedFix.patchDiff || selectedFix.suggestedFix || selectedFix.functionContext || '// Fix patch preview'}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FixesTable;
