import { motion } from "framer-motion";
import {
  GitBranch,
  Play,
  AlertCircle,
  Wrench,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { PROGRESS_STEPS } from "@/services/ux-helpers";

interface ProgressStepperProps {
  currentStep: number; // 0-5
  isRunning?: boolean;
}

const iconMap = {
  GitBranch: GitBranch,
  Play: Play,
  AlertCircle: AlertCircle,
  Wrench: Wrench,
  CheckCircle2: CheckCircle2,
};

const ProgressStepper = ({ currentStep, isRunning = false }: ProgressStepperProps) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 shadow-xl">
      {/* Header */}
      <h3 className="text-lg font-semibold text-slate-100 mb-8">Processing Pipeline</h3>

      {/* Steps Container */}
      <div className="space-y-4">
        {PROGRESS_STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isPending = currentStep < step.id;

          const IconComponent =
            iconMap[step.icon as keyof typeof iconMap] || Circle;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Step Item */}
              <div
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-500/15 border border-indigo-500/30"
                    : isCompleted
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-slate-700/20 border border-white/5"
                }`}
              >
                {/* Icon Circle */}
                <div className="relative flex-shrink-0">
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-indigo-400/20"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      aria-hidden
                    />
                  )}

                  <div
                    className={`relative h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                      isCompleted
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                        : isActive
                          ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
                          : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4
                    className={`font-semibold transition-colors ${
                      isActive || isCompleted
                        ? "text-slate-100"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {step.description}
                  </p>
                </div>

                {/* Status Badge */}
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="flex-shrink-0 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30"
                  >
                    <span className="text-xs font-medium text-emerald-300">
                      Done
                    </span>
                  </motion.div>
                )}

                {isActive && isRunning && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex-shrink-0 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30"
                  >
                    <span className="text-xs font-medium text-indigo-300">
                      Active
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Connector Line (except last step) */}
              {index < PROGRESS_STEPS.length - 1 && (
                <div className="absolute left-5 top-[60px] h-4 w-0.5 bg-gradient-to-b from-white/10 to-transparent" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <motion.div className="mt-8 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">
            Overall Progress
          </span>
          <span className="text-sm font-semibold text-slate-200">
            {currentStep}/5 Steps
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-700/40 overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / 5) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressStepper;
