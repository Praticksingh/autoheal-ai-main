import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import Editor from '@monaco-editor/react';
import {
  Bug,
  CheckCircle2,
  FileCode2,
  AlertTriangle,
} from 'lucide-react';
import { useAnalysis } from '@/context/AnalysisContext';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const statusStyles: Record<string, string> = {
  detected: 'border-[#30363d] bg-[#161b22] text-[#c9d1d9]',
  analyzing: 'border-[#58a6ff] bg-[#161b22] text-[#f0f6fc]',
  fixing: 'border-[#e3b341] bg-[#161b22] text-[#f0f6fc]',
  fixed: 'border-[#238636] bg-[#161b22] text-[#f0f6fc]',
  failed: 'border-[#f85149] bg-[#161b22] text-[#f0f6fc]',
};

const lineStyles: Record<string, string> = {
  detected: 'border-l-[#f85149]',
  analyzing: 'border-l-[#58a6ff]',
  fixing: 'border-l-[#e3b341]',
  fixed: 'border-l-[#3fb950]',
  failed: 'border-l-[#f85149]',
};

export const CodeAnalysisReport: React.FC = () => {
  const { state } = useAnalysis();
  const [openContexts, setOpenContexts] = useState<Record<string, boolean>>({});

  // Merge bugResults and bugExplanations safely
  const explanations = state.bugExplanations.length > 0 ? state.bugExplanations : state.bugResults;
  const isLoading = state.analysisStatus === 'running';
  const isEmpty = explanations.length === 0;

  const toggleContext = (key: string) => {
    setOpenContexts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-md text-[#f0f6fc] transition-all hover:border-[#8b949e]">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2.5 rounded-md bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
          <Bug className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold font-sans text-[#f0f6fc]">Code Analysis Report</h3>
      </div>

      {isLoading ? (
        <div className="h-[280px] rounded-md border border-[#30363d] bg-[#0d1117] p-3 transition-opacity duration-300">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={58} minSize={35}>
              <div className="h-full rounded-md border border-[#30363d] bg-[#161b22] p-4">
                <div className="h-full animate-pulse space-y-4">
                  <div className="h-4 w-36 rounded bg-[#21262d]" />
                  <div className="h-3 w-[95%] rounded bg-[#21262d]" />
                  <div className="h-3 w-[82%] rounded bg-[#21262d]" />
                  <div className="h-3 w-[88%] rounded bg-[#21262d]" />
                  <div className="h-3 w-[70%] rounded bg-[#21262d]" />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={42} minSize={30}>
              <div className="h-full rounded-md border border-[#30363d] bg-[#0d1117] p-4">
                <div className="h-full animate-pulse">
                  <div className="mb-3 h-4 w-28 rounded bg-[#21262d]" />
                  <div className="h-[210px] w-full rounded bg-[#21262d]" />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ) : isEmpty ? (
        state.analysisStatus === 'completed' ? (
          <div className="rounded-md border border-[#238636] bg-[rgba(46,160,67,0.12)] p-6 text-[#c9d1d9]">
            <div className="mb-2 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#3fb950]" />
              <h4 className="text-base font-bold text-[#f0f6fc]">Clean Bill of Health Certified</h4>
            </div>
            <p className="text-xs text-[#8b949e]">
              All repository files passed syntax parsing, package dependency verification, and structure checks cleanly. No logic or build errors were detected in this repository.
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-[#30363d] bg-[#0d1117] p-6 text-xs text-[#8b949e]">
            No explanation report yet. Run an analysis to generate bug explanations.
          </div>
        )
      ) : (
        <div className="space-y-6 transition-opacity duration-300">
          {explanations.map((item: any, index: number) => {
            const file = item.file || item.fileName || 'package.json';
            const line = item.line ?? item.lineNumber ?? 1;
            const bugType = item.bugType || 'LOGIC';
            const status = item.status || 'detected';
            const key = `${file}-${line}-${index}`;
            const statusClass = statusStyles[status] || statusStyles.detected;
            const contextLineClass = lineStyles[status] || lineStyles.detected;

            const explanationText = item.explanation || item.description || `Issue detected in \`${file}\` at line ${line}.`;
            const impactText = item.impact || `Failure at line ${line} of \`${file}\` interrupts CI build and test execution.`;
            const suggestedFixText = item.suggestedFix || item.diff || item.patchDiff || 'Review code context and correct syntax or dependency configuration.';

            const markdownContent = [
              `### Explanation`,
              explanationText,
              '',
              `### Impact`,
              impactText,
              '',
              `### Suggested Fix`,
              suggestedFixText,
            ].join('\n');

            const codeToDisplay = item.functionContext || item.diff || item.patchDiff || suggestedFixText;

            return (
              <div key={key} className={`rounded-md border shadow-md p-5 transition-all duration-300 ${statusClass}`}>
                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-mono">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1 text-[#f85149] font-bold">
                    <Bug className="h-3.5 w-3.5" />
                    Bug Type: {bugType}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1 text-[#58a6ff]">
                    <FileCode2 className="h-3.5 w-3.5" />
                    File: {file}
                  </span>
                  <span className="rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1 text-[#c9d1d9]">
                    Line: {line}
                  </span>
                </div>

                <div className="h-[340px] rounded-md border border-[#30363d] bg-[#0d1117]">
                  <ResizablePanelGroup direction="horizontal" className="h-full">
                    <ResizablePanel defaultSize={58} minSize={35}>
                      <div className="h-full overflow-auto rounded-l-md bg-[#0d1117] p-4 text-xs font-mono">
                        <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e3b341]">
                          <AlertTriangle className="h-3.5 w-3.5 text-[#e3b341]" />
                          AI Explanation & Diagnostics
                        </div>
                        <article className="prose prose-invert prose-sm max-w-none text-[#c9d1d9] prose-headings:text-[#f0f6fc] prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-1 prose-p:text-[#c9d1d9] prose-code:text-[#58a6ff] prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-[#30363d]">
                          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{markdownContent}</ReactMarkdown>
                        </article>
                      </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel defaultSize={42} minSize={30}>
                      <div className="h-full overflow-hidden rounded-r-md bg-[#0d1117] p-3 flex flex-col">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#8b949e]">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#3fb950]" />
                            Monaco Workspace
                          </span>
                          <span className="text-[10px] font-mono text-[#58a6ff]">{file}</span>
                        </div>
                        <div className={`flex-1 rounded-md border-l-2 ${contextLineClass} overflow-hidden border border-[#30363d]`}>
                          <Editor
                            height="100%"
                            theme="vs-dark"
                            language="typescript"
                            value={codeToDisplay}
                            options={{
                              minimap: { enabled: false },
                              readOnly: true,
                              scrollBeyondLastLine: false,
                              fontSize: 12,
                            }}
                          />
                        </div>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>

                {item.codeContext?.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => toggleContext(key)}
                      className="rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-mono text-[#c9d1d9] hover:bg-[#30363d] hover:text-white transition-colors"
                    >
                      {openContexts[key] ? 'Hide Code Context' : 'View Code Context'}
                    </button>

                    {openContexts[key] && (
                      <div className="mt-3 rounded-md border border-[#30363d] bg-[#0d1117] p-3">
                        <pre className="overflow-x-auto text-xs text-[#c9d1d9] font-mono">
                          {item.codeContext.map((lineItem: any) => (
                            <div
                              key={`${key}-${lineItem.lineNumber}`}
                              className={`border-l-2 px-2 py-1 ${lineItem.isProblemLine ? `${contextLineClass} bg-[#21262d]` : 'border-l-transparent'}`}
                            >
                              <span className="mr-3 inline-block w-8 select-none text-right text-[#8b949e]">
                                {lineItem.lineNumber}
                              </span>
                              <span>{lineItem.code || lineItem.content}</span>
                            </div>
                          ))}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CodeAnalysisReport;
