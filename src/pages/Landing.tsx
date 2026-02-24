import { motion } from "framer-motion";
import { GitBranch, Shield, Zap, Bot, ArrowRight, Terminal, Activity, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Bot,
    title: "7 Autonomous Agents",
    description: "Multi-agent orchestration for repo analysis, test running, bug classification, fix generation, governance, git management, and CI/CD monitoring.",
  },
  {
    icon: Shield,
    title: "Governance & Safety",
    description: "Patches validated for safety — no file deletions, no network calls, no secret leaks. Every fix is auditable.",
  },
  {
    icon: Zap,
    title: "Anti-Stuck Pipeline",
    description: "60s timeouts, 3 retry limits, 300-line patch caps, and fallback strategies ensure the pipeline never blocks.",
  },
  {
    icon: Activity,
    title: "Real-Time Dashboard",
    description: "Watch agents work live with CI/CD timeline visualization, scoring engine, and structured logs.",
  },
  {
    icon: GitBranch,
    title: "Automatic Git Workflow",
    description: "Commits with [AI-AGENT] prefix, pushes to dedicated branches, and monitors GitHub Actions status.",
  },
  {
    icon: Clock,
    title: "Up to 5 Iterations",
    description: "Automatically retries the full test→fix→commit cycle until all tests pass or max iterations reached.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen gradient-mesh">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Terminal className="h-4 w-4 text-primary" />
            </div>
            <span className="font-mono font-bold text-lg text-foreground">AutoHeal</span>
            <span className="font-mono text-xs text-muted-foreground ml-1">CI/CD</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="font-mono text-sm">
                Launch Agent <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-8">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="font-mono text-xs text-primary">Autonomous DevOps Healing System</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
              <span className="text-foreground">Your CI/CD</span>
              <br />
              <span className="text-primary">Heals Itself</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              AI agents that clone your repo, run tests, classify bugs, generate fixes, 
              and push commits — all autonomously. No more broken builds at 3 AM.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="font-mono text-base px-8 h-12">
                  <Terminal className="mr-2 h-4 w-4" />
                  Start Healing
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="font-mono text-base px-8 h-12 border-border text-muted-foreground hover:text-foreground hover:border-primary/30">
                View Architecture
              </Button>
            </div>
          </motion.div>

          {/* Terminal Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 max-w-3xl mx-auto"
          >
            <div className="rounded-xl border border-border bg-card overflow-hidden glow-border">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-success/60" />
                <span className="font-mono text-xs text-muted-foreground ml-2">autoheal-agent — session</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-2">
                <TerminalLine delay={0.5} prefix="$" text="autoheal run https://github.com/acme/api" />
                <TerminalLine delay={1.0} prefix="→" text="Cloning repository..." dim />
                <TerminalLine delay={1.5} prefix="→" text="Detected: Jest + TypeScript" dim />
                <TerminalLine delay={2.0} prefix="→" text="Running tests in Docker sandbox..." dim />
                <TerminalLine delay={2.5} prefix="✗" text="3 tests failed (IMPORT, TYPE, SYNTAX)" error />
                <TerminalLine delay={3.0} prefix="⚡" text="Agent fixing: src/utils/parser.ts (confidence: 0.94)" accent />
                <TerminalLine delay={3.5} prefix="⚡" text="Agent fixing: src/api/handler.ts (confidence: 0.87)" accent />
                <TerminalLine delay={4.0} prefix="⚡" text="Agent fixing: src/types/index.ts (confidence: 0.91)" accent />
                <TerminalLine delay={4.5} prefix="✓" text="All 3 fixes applied. Pushing to acme_lead_AI_Fix..." success />
                <TerminalLine delay={5.0} prefix="✓" text="CI/CD pipeline passed. Score: 94/100" success />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Production-Grade <span className="text-primary">Agent Architecture</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Seven specialized agents working in concert to diagnose, fix, and verify your codebase autonomously.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-xl border border-border bg-card p-6 card-hover"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to heal your pipeline?</h2>
          <p className="text-muted-foreground mb-8">Start with a single repository. Scale to your entire organization.</p>
          <Link to="/dashboard">
            <Button size="lg" className="font-mono px-8 h-12">
              Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-mono">AutoHeal CI/CD Agent</span>
          </div>
          <span className="font-mono text-xs">v1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

const TerminalLine = ({ delay, prefix, text, dim, error, success, accent }: {
  delay: number;
  prefix: string;
  text: string;
  dim?: boolean;
  error?: boolean;
  success?: boolean;
  accent?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -5 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="flex gap-2"
  >
    <span className={
      error ? "text-destructive" :
      success ? "text-primary" :
      accent ? "text-accent" :
      "text-muted-foreground"
    }>{prefix}</span>
    <span className={
      dim ? "text-muted-foreground" :
      error ? "text-destructive" :
      success ? "text-primary" :
      accent ? "text-accent" :
      "text-foreground"
    }>{text}</span>
  </motion.div>
);

export default Landing;
