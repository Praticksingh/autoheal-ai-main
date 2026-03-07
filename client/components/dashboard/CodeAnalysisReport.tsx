import { useMemo, useState } from 'react';
import { AlertTriangle, Bug, CheckCircle2, FileCode2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { useAnalysis } from '@/context/useAnalysis';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

const statusStyles: Record<string, string> = {
  detected: 'border-red-500/30 bg-red-500/10 text-red-200',
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
  fixed: 'border-green-500/30 bg-green-500/10 text-green-200',
};

const lineStyles: Record<string, string> = {
  detected: 'border-l-red-500',
  warning: 'border-l-yellow-500',
  fixed: 'border-l-green-500',
};

export default function CodeAnalysisReport() {
  const { state } = useAnalysis();
  const [openContexts, setOpenContexts] = useState<Record<string, boolean>>({});
  const explanations = state.bugExplanations;
  const isLoading = state.analysisStatus === 'running';

  const isEmpty = useMemo(() => explanations.length === 0, [explanations.length]);

  const toggleContext = (key: string) => {
    setOpenContexts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/60 p-6 shadow-xl">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2">
          <Bug className="h-4 w-4 text-red-300" />
        </div>
        <h3 className="text-sm font-semibold text-slate-100">Code Analysis Report</h3>
      </div>

      {isLoading ? (
        <div className="h-[280px] rounded-lg border border-white/15 bg-black/15 p-3 transition-opacity duration-300">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={58} minSize={35}>
              <div className="h-full rounded-md border border-white/10 bg-slate-900/50 p-4">
                <div className="h-full animate-pulse space-y-4">
                  <div className="h-4 w-36 rounded bg-slate-700/70" />
                  <div className="h-3 w-[95%] rounded bg-slate-700/60" />
                  <div className="h-3 w-[82%] rounded bg-slate-700/60" />
                  <div className="h-3 w-[88%] rounded bg-slate-700/60" />
                  <div className="h-3 w-[70%] rounded bg-slate-700/60" />
                  <div className="pt-4">
                    <div className="h-4 w-20 rounded bg-slate-700/70" />
                    <div className="mt-3 h-3 w-[92%] rounded bg-slate-700/60" />
                    <div className="mt-2 h-3 w-[76%] rounded bg-slate-700/60" />
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={42} minSize={30}>
              <div className="h-full rounded-md border border-white/10 bg-[#0d1117] p-4">
                <div className="h-full animate-pulse">
                  <div className="mb-3 h-4 w-28 rounded bg-slate-700/70" />
                  <div className="h-[210px] w-full rounded bg-slate-800/80" />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : isEmpty ? (
        <div className="rounded-lg border border-dashed border-white/10 bg-slate-900/50 p-6 text-sm text-slate-400">
          No explanation report yet. Run an analysis to generate bug explanations.
        </div>
      ) : (
        <div className="space-y-4 transition-opacity duration-300">
          {explanations.map((item, index) => {
            const key = `${item.file}-${item.line}-${index}`;
            const statusClass = statusStyles[item.status] || statusStyles.detected;
            const contextLineClass = lineStyles[item.status] || lineStyles.detected;
            const markdownContent = [
              `### Explanation`,
              item.explanation,
              '',
              `### Impact`,
              item.impact,
              '',
              `### Suggested Fix`,
              item.suggestedFix,
            ].join('\n');
            const fixedCode = item.functionContext || item.suggestedFix || '';

            return (
              <div key={key} className={`rounded-xl border shadow-md p-4 transition-all duration-300 hover:scale-[1.01] ${statusClass}`}>
                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-medium">
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-black/20 px-2 py-1">
                    <Bug className="h-3.5 w-3.5" />
                    Bug Type: {item.bugType}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-black/20 px-2 py-1">
                    <FileCode2 className="h-3.5 w-3.5" />
                    File: {item.file}
                  </span>
                  <span className="rounded-md border border-white/20 bg-black/20 px-2 py-1">Line: {item.line}</span>
                </div>

                <div className="h-[330px] rounded-xl border border-white/15 bg-black/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <ResizablePanelGroup direction="horizontal" className="h-full">
                    <ResizablePanel defaultSize={58} minSize={35}>
                      <div className="h-full overflow-auto rounded-l-xl bg-slate-950/70 p-4">
                        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                          AI Explanation
                        </div>
                        <article className="prose prose-invert prose-sm max-w-none prose-headings:text-slate-100 prose-p:text-slate-300 prose-code:text-indigo-300 prose-pre:bg-slate-900/70 prose-pre:border prose-pre:border-white/10">
                          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{markdownContent}</ReactMarkdown>
                        </article>
                      </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel defaultSize={42} minSize={30}>
                      <div className="h-full overflow-hidden rounded-r-xl bg-[#0d1117] p-3">
                        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                          Monaco Workspace
                        </div>
                        <div className={`rounded-md border-l-2 ${contextLineClass} overflow-hidden`}>
                          <Editor
                            height="272px"
                            theme="vs-dark"
                            language="typescript"
                            value={fixedCode}
                            options={{
                              minimap: { enabled: false },
                              readOnly: true,
                              scrollBeyondLastLine: false,
                              fontSize: 13,
                            }}
                          />
                        </div>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>

                <button
                  type="button"
                  onClick={() => toggleContext(key)}
                  className="mt-3 rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
                >
                  {openContexts[key] ? 'Hide Code Context' : 'View Code Context'}
                </button>

                {openContexts[key] && item.codeContext?.length > 0 && (
                  <div className="mt-3 rounded-lg border border-white/15 bg-slate-950/70 p-3">
                    <pre className="overflow-x-auto text-xs text-slate-200">
                      {item.codeContext.map((line) => (
                        <div
                          key={`${key}-${line.lineNumber}`}
                          className={`border-l-2 px-2 py-1 ${line.isProblemLine ? `${contextLineClass} bg-white/5` : 'border-l-transparent'}`}
                        >
                          <span className="mr-3 text-slate-400">Line {line.lineNumber}:</span>
                          <span>{line.content || ' '}</span>
                        </div>
                      ))}
                    </pre>
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
