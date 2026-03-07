import { motion } from "framer-motion";
import { type AgentRun } from "@/services/mock-data";
import { getConversationalMessage } from "@/services/ux-helpers";

interface ConversationalMessageProps {
  run: AgentRun;
}

export function ConversationalMessage({ run }: ConversationalMessageProps) {
  const message = getConversationalMessage(run);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`rounded-2xl border backdrop-blur-xl p-8 shadow-xl ${
        run.status === "passed"
          ? "border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 to-slate-900/40"
          : "border-red-500/30 bg-gradient-to-r from-red-950/40 to-slate-900/40"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`text-4xl font-bold ${
            run.status === "passed" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {message.emoji}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            {message.title}
          </h2>
          <p className="text-slate-300 leading-relaxed">{message.subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}