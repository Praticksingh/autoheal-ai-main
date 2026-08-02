import React, { useState } from 'react';
import {
  GitBranch,
  Copy,
  Info,
  Keyboard,
  User,
  Users,
  Play,
  Loader2,
} from 'lucide-react';
import { useAnalysis } from '@/context/AnalysisContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InputPanelProps {
  onStartRun: (data: { repoUrl: string; userName: string; leaderName: string; mode: string }) => void;
  isRunning: boolean;
}

const GITHUB_REPO_URL_REGEX = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/i;

export const InputPanel: React.FC<InputPanelProps> = ({ onStartRun, isRunning }) => {
  const { state } = useAnalysis();
  const [repoUrl, setRepoUrl] = useState('');
  const [userName, setUserName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [mode, setMode] = useState<'individual' | 'team'>('individual');
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(95);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl.trim()) {
      toast.error('Repository URL is required.');
      return;
    }

    if (!userName.trim()) {
      if (mode === 'individual') {
        toast.error('Developer handle / name is required.');
      } else {
        toast.error('Team name is required.');
      }
      return;
    }

    const trimmedRepoUrl = repoUrl.trim();
    if (!GITHUB_REPO_URL_REGEX.test(trimmedRepoUrl)) {
      toast.error('Invalid repository URL. Please use format https://github.com/owner/repository');
      return;
    }

    onStartRun({
      repoUrl: trimmedRepoUrl,
      userName: userName.trim(),
      leaderName: leaderName.trim() || userName.trim(),
      mode,
    });
  };

  const handleCopyRepo = () => {
    if (repoUrl) {
      navigator.clipboard.writeText(repoUrl);
      toast.success('Repository URL copied to clipboard');
    }
  };

  return (
    <TooltipProvider delayDuration={120}>
      <div className="group">
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-md text-[#f0f6fc]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-md bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
              <GitBranch className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-[#f0f6fc] font-sans">Start New Repository Diagnosis</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Repository Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">Target Repository URL</label>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-[#8b949e] hover:text-white transition-colors">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Enter any public GitHub repo URL (e.g. https://github.com/owner/repository)
                    </TooltipContent>
                  </Tooltip>
                  {repoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyRepo}
                      className="h-8 border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] hover:text-white font-mono text-xs rounded-md"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1 text-[#58a6ff]" /> Copy URL
                    </Button>
                  )}
                </div>
              </div>
              <Input
                placeholder="https://github.com/owner/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e] h-11 rounded-md focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all font-mono text-xs shadow-inner"
              />
              
              {/* Quick Repo Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#8b949e]">Quick Test:</span>
                <button
                  type="button"
                  onClick={() => setRepoUrl('https://github.com/priyansh9936905290-ux/intro-to-backend')}
                  className="rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1 text-xs font-mono text-[#58a6ff] hover:bg-[#30363d] hover:text-white transition-colors"
                >
                  intro-to-backend
                </button>
                <button
                  type="button"
                  onClick={() => setRepoUrl('https://github.com/priyansh9936905290-ux/todo')}
                  className="rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1 text-xs font-mono text-[#58a6ff] hover:bg-[#30363d] hover:text-white transition-colors"
                >
                  todo
                </button>
              </div>

              <p className="mt-2.5 flex items-center gap-2 text-xs text-[#8b949e]">
                <Keyboard className="h-3.5 w-3.5 text-[#58a6ff]" />
                Shortcut: Press <kbd className="rounded border border-[#30363d] bg-[#0d1117] px-1.5 py-0.5 text-[10px] font-mono text-[#c9d1d9]">Ctrl + Enter</kbd> to launch analysis
              </p>
            </div>

            {/* Grid Inputs */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-2">
                  {mode === 'individual' ? 'Developer Handle / Name' : 'Team Name / Organization'}
                </label>
                <Input
                  placeholder={mode === 'individual' ? 'e.g. alex-developer' : 'e.g. devops-core-team'}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e] h-10 rounded-md focus:border-[#58a6ff] font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-2">
                  {mode === 'individual' ? 'Reviewer / Team Lead (Optional)' : 'Team Lead / Manager'}
                </label>
                <Input
                  placeholder={mode === 'individual' ? 'e.g. lead-reviewer' : 'e.g. team-lead-name'}
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9] placeholder-[#8b949e] h-10 rounded-md focus:border-[#58a6ff] font-mono text-xs"
                />
              </div>
            </div>

            {/* Zero-Touch Switch */}
            <div className="rounded-md border border-[#30363d] bg-[#0d1117] p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-[#f0f6fc]">Enable Zero-Touch Auto-Healing</p>
                  </div>
                  <p className="mt-1 text-xs text-[#8b949e]">Allow AutoHealer to commit minor fixes automatically when confidence exceeds threshold.</p>
                </div>
                <Switch
                  checked={autoApproveEnabled}
                  onCheckedChange={setAutoApproveEnabled}
                  aria-label="Enable Zero-Touch Auto-Healing"
                />
              </div>

              {autoApproveEnabled && (
                <div className="space-y-3 rounded-md border border-[#30363d] bg-[#161b22] p-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#8b949e]">AI Confidence Threshold</label>
                    <span className="text-xs font-mono font-bold text-[#58a6ff]">{confidenceThreshold}%</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[confidenceThreshold]}
                    onValueChange={(value) => setConfidenceThreshold(value[0] ?? 95)}
                  />
                </div>
              )}
            </div>

            {/* Submit Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#30363d]">
              <div className="flex items-center gap-2 bg-[#0d1117] p-1 rounded-md border border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setMode("individual")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
                    mode === "individual"
                      ? "bg-[#21262d] text-white border border-[#30363d]"
                      : "text-[#8b949e] hover:text-white"
                  }`}
                >
                  <User className="h-3.5 w-3.5 text-[#58a6ff]" /> Individual Mode
                </button>
                <button
                  type="button"
                  onClick={() => setMode("team")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
                    mode === "team"
                      ? "bg-[#21262d] text-white border border-[#30363d]"
                      : "text-[#8b949e] hover:text-white"
                  }`}
                >
                  <Users className="h-3.5 w-3.5 text-[#58a6ff]" /> Team Mode
                </button>
              </div>

              {/* GitHub Green Submit Button */}
              <Button
                type="submit"
                disabled={isRunning}
                className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold gap-2 h-11 px-7 rounded-md border border-[rgba(240,246,252,0.1)] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider font-mono"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing Repository...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" /> Launch Diagnosis
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default InputPanel;
