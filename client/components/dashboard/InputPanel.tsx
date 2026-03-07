import { useEffect } from "react";
import { GitBranch, User, Users, Play, Loader2, Copy, Info, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type StartRunParams } from "@/services/agentService";
import { useRunForm } from "@/hooks/useRunForm";
import { toast } from "@/components/ui/sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InputPanelProps {
  onStartRun: (params: StartRunParams) => void;
  isRunning: boolean;
}

const InputPanel = ({ onStartRun, isRunning }: InputPanelProps) => {
  const {
    repoUrl,
    setRepoUrl,
    userName,
    setUserName,
    leaderName,
    setLeaderName,
    mode,
    setMode,
    handleSubmit,
    submitForm,
  } = useRunForm(onStartRun);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!isRunning) {
          submitForm();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, submitForm]);

  const handleCopyRepo = async () => {
    if (!repoUrl.trim()) {
      toast.error('Enter a repository URL to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(repoUrl.trim());
      toast.success('Repository URL copied.');
    } catch {
      toast.error('Unable to copy repository URL.');
    }
  };

  return (
    <div className="group">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 transition-all duration-300 hover:border-white/20 hover:shadow-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 group-hover:border-indigo-500/50 transition-colors">
            <GitBranch className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Start New Agent Run</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repository Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">GitHub Repository URL</label>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-500 hover:text-slate-300 transition-colors">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Use a public URL like https://github.com/org/repo
                  </TooltipContent>
                </Tooltip>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRepo}
                  className="h-8 border-white/10 bg-slate-900/40 text-slate-200 hover:bg-slate-800"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </Button>
              </div>
            </div>
            <Input
              placeholder="https://github.com/org/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="bg-slate-900/50 border-white/10 text-slate-100 placeholder:text-slate-500 h-11 rounded-lg focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all duration-300"
            />
            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Keyboard className="h-3.5 w-3.5" />
              Shortcut: Ctrl/Cmd + Enter to run agent
            </p>
          </div>

          {/* Grid Inputs */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">User / Team Name</label>
              <Input
                placeholder="acme-corp"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-slate-900/50 border-white/10 text-slate-100 placeholder:text-slate-500 h-11 rounded-lg focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Leader Name</label>
              <Input
                placeholder="sarah"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="bg-slate-900/50 border-white/10 text-slate-100 placeholder:text-slate-500 h-11 rounded-lg focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-lg bg-slate-900/50 border border-white/10">
              <button
                type="button"
                onClick={() => setMode("individual")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ${
                  mode === "individual"
                    ? "bg-gradient-to-r from-indigo-500/80 to-indigo-600/80 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <User className="h-4 w-4" /> Individual
              </button>
              <button
                type="button"
                onClick={() => setMode("team")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ${
                  mode === "team"
                    ? "bg-gradient-to-r from-indigo-500/80 to-indigo-600/80 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="h-4 w-4" /> Team
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isRunning || !repoUrl || !userName}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold gap-2 h-11 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Run Agent
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputPanel;
