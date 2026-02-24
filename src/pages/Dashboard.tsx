import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Terminal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputPanel from "@/components/dashboard/InputPanel";
import RunSummary from "@/components/dashboard/RunSummary";
import FixesTable from "@/components/dashboard/FixesTable";
import CICDTimeline from "@/components/dashboard/CICDTimeline";
import ScorePanel from "@/components/dashboard/ScorePanel";
import LogsViewer from "@/components/dashboard/LogsViewer";
import ProgressStepper from "@/components/dashboard/ProgressStepper";
import InsightPanel from "@/components/dashboard/InsightPanel";
import ImpactSummary from "@/components/dashboard/ImpactSummary";
import { type AgentRun, mockRun } from "@/lib/mock-data";
import { getConversationalMessage } from "@/lib/ux-helpers";

const Dashboard = () => {
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Simulate step progression
  useEffect(() => {
    if (!isRunning || currentStep >= 5) return;

    const delays = [1000, 1500, 1500, 1200, 1500];
    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, delays[currentStep]);

    return () => clearTimeout(timer);
  }, [isRunning, currentStep]);

  const handleStartRun = (repoUrl: string, userName: string, leaderName: string, mode: "individual" | "team") => {
    setIsRunning(true);
    setCurrentStep(1); // Start from step 1
    // Simulate agent run starting
    setTimeout(() => {
      setActiveRun(mockRun);
      setIsRunning(false);
      setCurrentStep(5); // Complete all steps
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-slate-900">
      {/* Animated background layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5" />
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
                <span className="font-semibold text-base text-slate-100">AutoHeal</span>
                <span className="text-xs text-slate-400 ml-2">Autonomous DevOps</span>
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

      <main className="container mx-auto max-w-7xl px-6 py-8 relative z-10 space-y-8">
        {/* Input Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <InputPanel onStartRun={handleStartRun} isRunning={isRunning} />
        </motion.div>

        {/* Loading State with Progress Stepper */}
        {isRunning && !activeRun && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProgressStepper currentStep={currentStep} isRunning={true} />
          </motion.div>
        )}

        {/* Results Section */}
        {activeRun && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Conversational Result Message */}
            {(() => {
              const message = getConversationalMessage(activeRun);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className={`rounded-2xl border backdrop-blur-xl p-8 shadow-xl ${
                    activeRun.status === "passed"
                      ? "border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 to-slate-900/40"
                      : "border-red-500/30 bg-gradient-to-r from-red-950/40 to-slate-900/40"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`text-4xl font-bold ${
                        activeRun.status === "passed"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {message.emoji}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100 mb-2">
                        {message.title}
                      </h2>
                      <p className="text-slate-300 leading-relaxed">
                        {message.subtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Top Row */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RunSummary run={activeRun} />
              </div>
              <ScorePanel score={activeRun.score} />
            </div>

            {/* Insight and Impact Row */}
            <div className="grid lg:grid-cols-2 gap-8">
              <InsightPanel fixes={activeRun.fixes} />
              <ImpactSummary run={activeRun} />
            </div>

            {/* Fixes Table */}
            <FixesTable fixes={activeRun.fixes} />

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-2 gap-8">
              <CICDTimeline events={activeRun.timeline} />
              <LogsViewer logs={activeRun.logs} />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
