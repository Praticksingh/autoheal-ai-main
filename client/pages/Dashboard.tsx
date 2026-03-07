import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Terminal, ArrowLeft, RotateCcw, GitCommitHorizontal, Search, ScanSearch, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import InputPanel from "@/components/dashboard/InputPanel";
import FixesTable from "@/components/dashboard/FixesTable";
import ScorePanel from "@/components/dashboard/ScorePanel";
import PipelineTimeline from "@/components/dashboard/PipelineTimeline";
import AgentActivityFeed from "@/components/dashboard/AgentActivityFeed";
import SystemStatusPanel from "@/components/dashboard/SystemStatusPanel";
import TerminalLogViewer from "@/components/dashboard/TerminalLogViewer";
import AutomaticFixPanel from "@/components/dashboard/AutomaticFixPanel";
import CodeAnalysisReport from "@/components/dashboard/CodeAnalysisReport";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/sonner";
import { useDashboard } from "@/hooks/useDashboard";

const Dashboard = () => {
  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [recentRepos, setRecentRepos] = useState<string[]>([]);
  const {
    activeRun,
    isRunning,
    currentStep,
    error,
    canRetry,
    canCommit,
    isCommitting,
    handleStartRun,
    retryLastRun,
    commitFixToRepository,
  } = useDashboard();

  useEffect(() => {
    document.title = "AutoHealer AI";
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("autohealer_recent_repos");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setRecentRepos(parsed.filter((repo) => typeof repo === "string").slice(0, 8));
        }
      }
    } catch {
      setRecentRepos([]);
    }
  }, []);

  useEffect(() => {
    if (!activeRun?.repoUrl) {
      return;
    }

    setRecentRepos((prev) => {
      const next = [activeRun.repoUrl, ...prev.filter((repo) => repo !== activeRun.repoUrl)].slice(0, 8);
      localStorage.setItem("autohealer_recent_repos", JSON.stringify(next));
      return next;
    });
  }, [activeRun?.repoUrl]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleConfirmCommit = async () => {
    setIsCommitDialogOpen(false);
    await commitFixToRepository();
  };

  const handleQuickRun = async (repoUrl: string) => {
    setIsCommandPaletteOpen(false);
    await handleStartRun({
      repoUrl,
      userName: "quick-run",
      leaderName: "quick-run",
      mode: "individual",
      autoApproveEnabled: false,
      confidenceThreshold: 95,
    });
  };

  const handleManualScan = () => {
    setIsCommandPaletteOpen(false);
    retryLastRun();
  };

  const toggleCompactView = () => {
    setCompactView((prev) => !prev);
    setIsCommandPaletteOpen(false);
    toast.success(`Layout set to ${!compactView ? "compact" : "comfortable"} view.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Animated background layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_35%)]" />
      </div>

      {/* Top Bar with Glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-slate-950/80">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-100 gap-2 transition-all hover:bg-slate-800/60">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30">
                <Terminal className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-slate-100">AutoHealer AI</span>
                <span className="text-xs text-slate-400">Autonomous DevOps Healing System</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeRun && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-300">Agent Active</span>
              </div>
            )}
            <TooltipProvider delayDuration={120}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCommandPaletteOpen(true)}
                    className="border-white/15 bg-slate-900/50 text-slate-300 hover:bg-slate-800/80 hover:text-slate-100"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Command
                    <span className="ml-2 rounded border border-white/20 px-1.5 py-0.5 text-[10px]">⌘K</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open global command palette</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-[1500px] px-6 py-8 relative z-10 space-y-8">
        {/* Input Panel */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <InputPanel onStartRun={handleStartRun} isRunning={isRunning} />
        </motion.div>

        {activeRun && canCommit && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Button
                type="button"
                onClick={() => setIsCommitDialogOpen(true)}
                disabled={isCommitting}
                className="bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20 transition-colors"
              >
                {isCommitting ? (
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-white/80 animate-pulse" />
                    <span className="h-3 w-24 rounded bg-white/30 animate-pulse" />
                  </div>
                ) : (
                  <>
                    <GitCommitHorizontal className="h-4 w-4 mr-2" />
                    Commit Fix to Repository
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {error && canRetry && (
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={retryLastRun}
              className="bg-red-500/15 hover:bg-red-500/25 text-red-100 border border-red-500/30"
            >
              <RotateCcw className="h-4 w-4 mr-1" /> Retry Run
            </Button>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[2.2fr,1fr]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`space-y-6 ${compactView ? "scale-[0.99]" : ""}`}
          >
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <PipelineTimeline />
              <ScorePanel />
            </div>

            {isRunning && (
              <div className="rounded-xl border border-indigo-500/20 bg-slate-900/80 px-4 py-3">
                <div className="h-2 w-40 rounded bg-indigo-400/30 animate-pulse" />
                <div className="mt-2 h-2 w-64 rounded bg-slate-700/70 animate-pulse" />
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <FixesTable />
              <AutomaticFixPanel />
            </div>

            <CodeAnalysisReport />
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <AgentActivityFeed />
            <SystemStatusPanel />
            <TerminalLogViewer />
          </motion.aside>
        </div>

        {!activeRun && !isRunning && (
          <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/40 px-5 py-4 text-sm text-slate-400 backdrop-blur-sm">
            Run Agent to start live pipeline visualization, bug detection, and automated fix insights.
          </div>
        )}
      </main>

      <CommandDialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
        <CommandInput placeholder="Search repositories or run actions..." />
        <CommandList>
          <CommandEmpty>No matching commands.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={handleManualScan}>
              <ScanSearch className="mr-2 h-4 w-4" />
              Trigger Manual Scan
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={toggleCompactView}>
              <Settings2 className="mr-2 h-4 w-4" />
              Toggle Compact Layout
              <CommandShortcut>UI</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent Repositories">
            {recentRepos.map((repo) => (
              <CommandItem key={repo} onSelect={() => handleQuickRun(repo)}>
                <Terminal className="mr-2 h-4 w-4" />
                {repo}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <AlertDialog open={isCommitDialogOpen} onOpenChange={setIsCommitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Commit fixes to repository?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to push these fixes to the repository?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCommitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isCommitting} onClick={handleConfirmCommit}>
              Confirm Commit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
