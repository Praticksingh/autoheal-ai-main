import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Terminal, ArrowLeft, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InputPanel from "@/components/dashboard/InputPanel";
import FixesTable from "@/components/dashboard/FixesTable";
import ScorePanel from "@/components/dashboard/ScorePanel";
import PipelineTimeline from "@/components/dashboard/PipelineTimeline";
import AgentActivityFeed from "@/components/dashboard/AgentActivityFeed";
import SystemStatusPanel from "@/components/dashboard/SystemStatusPanel";
import TerminalLogViewer from "@/components/dashboard/TerminalLogViewer";
import AutomaticFixPanel from "@/components/dashboard/AutomaticFixPanel";
import { useDashboard } from "@/hooks/useDashboard";

const Dashboard = () => {
  const { activeRun, isRunning, currentStep, error, canRetry, handleStartRun, retryLastRun } = useDashboard();

  useEffect(() => {
    document.title = "AutoHealer AI";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-slate-900 to-[#1E293B]">
      {/* Animated background layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
      </div>

      {/* Top Bar with Glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-slate-900/40">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 gap-2 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30">
                <Terminal className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <span className="font-semibold text-base text-slate-100">AutoHealer AI</span>
                <span className="text-xs text-slate-400 ml-2">Autonomous DevOps Healing System</span>
              </div>
            </div>
          </div>
          {activeRun && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">Agent Active</span>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-[1400px] px-6 py-8 relative z-10 space-y-8">
        {/* Input Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <InputPanel onStartRun={handleStartRun} isRunning={isRunning} />
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{error}</span>
                  {canRetry && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={retryLastRun}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-500/30"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" /> Retry Run
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <PipelineTimeline />
              <ScorePanel />
            </div>

            {isRunning && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
                Pipeline execution in progress — stage {Math.min(currentStep, 6)} of 6
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <FixesTable />
              <AutomaticFixPanel />
            </div>
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
          <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/40 px-5 py-4 text-sm text-slate-400">
            Run Agent to start live pipeline visualization, bug detection, and automated fix insights.
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
