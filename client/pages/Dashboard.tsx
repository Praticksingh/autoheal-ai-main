import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Terminal, ArrowLeft, RotateCcw, GitCommitHorizontal, Search, ScanSearch, Settings2, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans relative overflow-x-hidden">
      {/* Top Bar matching GitHub Header */}
      <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#161b22]/95 backdrop-blur-xl text-[#f0f6fc]">
        <div className="w-full flex h-16 items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-[#c9d1d9] hover:text-white hover:bg-[#21262d] gap-2 transition-all rounded-md px-3 font-semibold text-xs border border-[#30363d]">
                <ArrowLeft className="h-4 w-4 text-[#8b949e]" />
                Back to Home
              </Button>
            </Link>
            <div className="h-4 w-px bg-[#30363d]" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
                <Terminal className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#f0f6fc] font-mono">AutoHealer <span className="text-[#3fb950]">AI</span></span>
                <span className="hidden sm:inline-block text-xs text-[#8b949e] font-medium">| GitHub DevOps Autonomous Healing</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeRun && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[rgba(46,160,67,0.15)] border border-[#238636]">
                <span className="h-2 w-2 rounded-full bg-[#3fb950] animate-pulse" />
                <span className="text-xs font-semibold text-[#3fb950]">Agent Active</span>
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
                    className="rounded-md border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] hover:text-white font-mono text-xs"
                  >
                    <Search className="h-3.5 w-3.5 mr-1.5 text-[#58a6ff]" />
                    Command Palette
                    <span className="ml-2 rounded border border-[#30363d] bg-[#161b22] px-1.5 py-0.5 text-[10px] text-[#8b949e]">⌘K</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open global command palette</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Dashboard GitHub Dark Banner */}
      <section className="relative bg-[#161b22] pt-10 pb-16 text-[#f0f6fc] overflow-hidden border-b border-[#30363d]">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#21262d] px-3.5 py-1 text-xs font-mono text-[#58a6ff] mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[#3fb950]" />
              GitHub DevOps Autonomous Healing Dashboard
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-sans text-[#f0f6fc] tracking-tight">
              DevOps Healing Dashboard
            </h1>
            <p className="text-[#8b949e] text-sm mt-1 max-w-xl font-normal">
              Run automated AST code diagnostics, trace test failures, and generate AI patches in real-time.
            </p>
          </div>
        </div>
      </section>

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
                className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold h-11 px-7 rounded-md border border-[rgba(240,246,252,0.1)] shadow-sm font-mono text-xs uppercase tracking-wider"
              >
                {isCommitting ? (
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-white/80 animate-pulse" />
                    <span className="h-3 w-24 rounded bg-white/30 animate-pulse" />
                  </div>
                ) : (
                  <>
                    <GitCommitHorizontal className="h-4 w-4 mr-2 text-white" />
                    Commit Verified Fixes to Repository
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
              className="bg-[rgba(248,81,73,0.15)] hover:bg-[rgba(248,81,73,0.25)] text-[#f85149] border border-[rgba(248,81,73,0.4)] rounded-md font-mono text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retry Run
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
              <div className="rounded-md border border-[#30363d] bg-[#161b22] px-4 py-3">
                <div className="h-2 w-40 rounded bg-[#21262d] animate-pulse" />
                <div className="mt-2 h-2 w-64 rounded bg-[#21262d] animate-pulse" />
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
          <div className="rounded-md border border-dashed border-[#30363d] bg-[#161b22] px-5 py-4 text-xs font-mono text-[#8b949e]">
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
