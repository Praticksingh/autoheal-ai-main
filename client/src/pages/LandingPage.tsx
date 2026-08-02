import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  GitBranch,
  Github,
  Radar,
  Search,
  Sparkles,
  Wrench,
  X,
  Layers,
  Play,
  Download,
  Star,
  MessageSquare,
  Zap,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const problems = [
  {
    title: 'Broken Pipelines',
    description: 'Builds fail unexpectedly and block delivery momentum.',
    icon: AlertTriangle,
    badgeColor: 'bg-[#21262d] text-[#f85149] border border-[#30363d]',
  },
  {
    title: 'Debugging Time Loss',
    description: 'Engineers spend hours tracing flaky failures and regressions.',
    icon: Clock,
    badgeColor: 'bg-[#21262d] text-[#d29922] border border-[#30363d]',
  },
  {
    title: 'Delayed Deployments',
    description: 'Critical releases slip while teams investigate incidents manually.',
    icon: GitBranch,
    badgeColor: 'bg-[#21262d] text-[#58a6ff] border border-[#30363d]',
  },
];

const stats = [
  { value: '23,000+', label: 'Builds Healed', icon: Download, color: 'text-[#3fb950] bg-[#21262d] border border-[#30363d]' },
  { value: '99.4%', label: 'Fix Accuracy', icon: Star, color: 'text-[#e3b341] bg-[#21262d] border border-[#30363d]' },
  { value: '1,200+', label: 'Repos Restored', icon: MessageSquare, color: 'text-[#58a6ff] bg-[#21262d] border border-[#30363d]' },
];

const capabilities = [
  { title: 'Repository Analysis', description: 'Instant AST & structure scan across repo source files.', icon: Search },
  { title: 'Automated Bug Detection', description: 'Detects syntax, import, type, and test assertion errors.', icon: Radar },
  { title: 'AI Code Patch Generator', description: 'Generates non-destructive, zero-regression code fixes.', icon: Wrench },
  { title: 'CI/CD Pipeline Recovery', description: 'Validates patches in sandbox before committing.', icon: CheckCircle2 },
];

const steps = [
  { step: '01', title: 'Connect Repo', description: 'Provide GitHub URL for immediate diagnostic scanning.', icon: Github },
  { step: '02', title: 'Scan Codebase', description: 'AI agents extract function context & AST structures.', icon: Search },
  { step: '03', title: 'Sandbox Tests', description: 'Executes fast non-interactive test suites safely.', icon: Activity },
  { step: '04', title: 'AI Patching', description: 'OpenAI / Gemini model outputs real verified fix diffs.', icon: Bot },
  { step: '05', title: 'Auto-Healing', description: 'Committed fixes restore green CI/CD status.', icon: CheckCircle2 },
];

const agents = [
  'Repository Analysis Agent',
  'Test Runner Agent',
  'Bug Classification Agent',
  'Fix Generation Agent',
  'Git Commit Agent',
  'CI/CD Monitoring Agent',
];

const testimonials = [
  { name: 'Sarah Jenkins', role: 'Staff DevOps Lead', text: 'AutoHeal AI cut our pipeline downtime by 85%. The automated dependency typo detection is pure magic.' },
  { name: 'Alex Rivera', role: 'Principal Architect', text: 'Having Generative AI scan AST function contexts directly inside Monaco editor gives complete confidence.' },
  { name: 'David Chen', role: 'CTO @ FastCloud', text: 'The 3D self-assembling interface and instant zero-touch PR healing changed how our team ships code.' },
];

// GPU 3D Assembly Animation Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 110, scale: 0.82, rotateX: 16, filter: 'blur(10px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.15, duration: 1.0, ease: [0.16, 1, 0.3, 1] },
  }),
};

const cardVariants = {
  hidden: { opacity: 0, y: 45, scale: 0.86, rotateY: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateY: 0,
    transition: { delay: 0.25 + i * 0.08, duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function LandingPage() {
  const [isAssembling, setIsAssembling] = useState(true);

  useEffect(() => {
    document.title = 'AutoHealer AI - GitHub Autonomous DevOps Healing Platform';
    const hasAssembled = sessionStorage.getItem('autoheal_page_assembled');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hasAssembled === 'true' || prefersReducedMotion) {
      setIsAssembling(false);
      return;
    }

    const timer = setTimeout(() => completeAssembly(), 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAssembling) completeAssembly();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAssembling]);

  const completeAssembly = () => {
    sessionStorage.setItem('autoheal_page_assembled', 'true');
    setIsAssembling(false);
  };

  return (
    <div className="relative min-h-screen bg-[#0d1117] text-[#c9d1d9] overflow-x-hidden font-sans [perspective:1200px]">
      {/* Telemetry Progress Bar */}
      <AnimatePresence>
        {isAssembling && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 z-[999] -translate-x-1/2 flex items-center gap-3 rounded-md border border-[#30363d] bg-[#161b22] px-5 py-2.5 shadow-2xl backdrop-blur-xl text-[#f0f6fc]"
          >
            <Layers className="h-4 w-4 text-[#58a6ff] animate-spin" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wide text-[#c9d1d9]">
              assembling GitHub blocks...
            </span>
            <div className="h-1.5 w-24 rounded-full bg-[#21262d] overflow-hidden border border-[#30363d]">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 4.5, ease: 'linear' }}
                className="h-full bg-[#238636] shadow-[0_0_10px_#238636]"
              />
            </div>
            <button
              onClick={completeAssembly}
              type="button"
              className="flex items-center gap-1 rounded-md border border-[#30363d] bg-[#21262d] px-2.5 py-1 text-[11px] font-medium text-[#c9d1d9] hover:bg-[#30363d] hover:text-white transition-colors"
            >
              <span>Skip</span>
              <kbd className="text-[9px] text-[#8b949e]">ESC</kbd>
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Assembly Orchestrator */}
      <motion.div initial={isAssembling ? 'hidden' : 'visible'} animate="visible">
        {/* Navigation Bar - GitHub Dark */}
        <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#161b22]/95 backdrop-blur-xl">
          <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-[#21262d] border border-[#30363d] text-white">
                <Terminal className="h-5 w-5 text-[#58a6ff]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#f0f6fc] font-mono">AutoHealer <span className="text-[#3fb950]">AI</span></span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#c9d1d9]">
              <a href="#about" className="hover:text-[#58a6ff] transition-colors">About</a>
              <a href="#features" className="hover:text-[#58a6ff] transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-[#58a6ff] transition-colors">How It Works</a>
              <a href="#agents" className="hover:text-[#58a6ff] transition-colors">Agents</a>
              <a href="#testimonials" className="hover:text-[#58a6ff] transition-colors">Testimonials</a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('autoheal_intro_seen');
                  sessionStorage.removeItem('autoheal_page_assembled');
                  window.location.reload();
                }}
                className="hidden sm:flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-mono text-[#c9d1d9] hover:bg-[#30363d] hover:text-white transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#58a6ff]" /> Replay Intro
              </button>
              <Link to="/dashboard">
                <Button size="sm" className="rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-semibold h-9 px-5 border border-[rgba(240,246,252,0.1)] shadow-sm">
                  Launch Agent
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* HERO SECTION - GitHub Dark Theme */}
        <motion.section
          custom={0}
          variants={sectionVariants}
          className="relative bg-[#0d1117] pt-16 pb-28 text-[#f0f6fc] overflow-hidden border-b border-[#30363d]"
        >
          {/* GitHub Grid Lines Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#21262d_1px,transparent_1px),linear-gradient(to_bottom,#21262d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Hero Content */}
            <div className="text-left space-y-6">
              <motion.div custom={0} variants={cardVariants} className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#21262d] px-3.5 py-1 text-xs font-mono text-[#58a6ff]">
                <Sparkles className="h-3.5 w-3.5 text-[#3fb950]" />
                GitHub DevOps Autonomous Self-Healing System
              </motion.div>

              <motion.h1 custom={1} variants={cardVariants} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f0f6fc] leading-tight font-sans">
                REVIEW REPO <br />
                <span className="text-[#3fb950]">TO HEAL CI/CD FAILS.</span>
              </motion.h1>

              <motion.p custom={2} variants={cardVariants} className="text-base text-[#8b949e] leading-relaxed max-w-xl">
                AutoHealer AI monitors CI/CD pipelines, detects broken builds, extracts function context using AST, and automatically applies verified fix patches.
              </motion.p>

              <motion.div custom={3} variants={cardVariants} className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/dashboard">
                  <Button size="lg" className="rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-semibold h-12 px-7 text-sm border border-[rgba(240,246,252,0.1)] shadow-sm">
                    Launch Agent
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="rounded-md border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] hover:text-white h-12 px-7 text-sm">
                    <Play className="h-4 w-4 mr-2 fill-white" /> Take An Overview
                  </Button>
                </a>
              </motion.div>
            </div>

            {/* Right Code Diff Mockup Card */}
            <motion.div custom={4} variants={cardVariants} className="relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-md border border-[#30363d] bg-[#161b22] p-6 shadow-2xl font-mono text-xs text-[#c9d1d9]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#30363d]">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#f85149]" />
                    <span className="h-3 w-3 rounded-full bg-[#d29922]" />
                    <span className="h-3 w-3 rounded-full bg-[#3fb950]" />
                  </div>
                  <span className="text-xs text-[#8b949e]">pipeline-healing.ts</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-between">
                    <span>STATUS: 01 BUG DETECTED</span>
                    <span className="text-[#f85149] font-bold">FAIL</span>
                  </div>
                  <div className="p-3 rounded-md bg-[#0d1117] border border-[#30363d] text-[#8b949e]">
                    <p className="text-[#58a6ff]">// Generative AI Explanation</p>
                    <p className="mt-1 text-[#c9d1d9]">Invalid package "expresss" in package.json.</p>
                  </div>
                  <div className="p-3 rounded-md bg-[rgba(46,160,67,0.15)] border border-[#238636] text-[#3fb950] flex items-center justify-between">
                    <span>FIX: "express": "^4.18.2"</span>
                    <span className="font-bold">APPLIED ✓</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* KEY STATS BAR */}
        <motion.section custom={1} variants={sectionVariants} id="about" className="bg-[#0d1117] py-12 border-b border-[#30363d]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg border border-[#30363d] bg-[#161b22] p-6 shadow-md">
              {stats.map(({ value, label, icon: Icon, color }, idx) => (
                <motion.div key={label} custom={idx} variants={cardVariants} className="flex items-center gap-4 p-4 rounded-md bg-[#0d1117] border border-[#30363d]">
                  <div className={`p-3 rounded-md ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#f0f6fc] font-mono">{value}</h3>
                    <p className="text-xs font-semibold text-[#8b949e] mt-0.5">{label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* PROBLEMS SECTION */}
        <motion.section custom={2} variants={sectionVariants} className="bg-[#0d1117] py-16 border-b border-[#30363d]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#f0f6fc] font-sans">The Problem With CI/CD Failures</h2>
              <p className="text-[#8b949e] text-sm">Teams lose velocity when build failures happen during critical release windows.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {problems.map(({ title, description, icon: Icon, badgeColor }, idx) => (
                <motion.div key={title} custom={idx} variants={cardVariants} className="rounded-lg border border-[#30363d] bg-[#161b22] p-6 shadow-md hover:border-[#8b949e] transition-all group">
                  <div className={`mb-4 inline-flex p-3 rounded-md ${badgeColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#f0f6fc] mb-2">{title}</h3>
                  <p className="text-[#8b949e] text-xs leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FEATURES & CAPABILITIES */}
        <motion.section custom={3} variants={sectionVariants} id="features" className="bg-[#0d1117] py-16 border-b border-[#30363d]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#f0f6fc]">AUTOHEAL FEATURES</h2>
              <p className="text-[#8b949e] text-sm">End-to-end multi-agent orchestration for instant code recovery.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {capabilities.map(({ title, description, icon: Icon }, idx) => (
                <motion.div key={title} custom={idx} variants={cardVariants} className="rounded-lg border border-[#30363d] bg-[#161b22] p-6 shadow-md hover:border-[#8b949e] transition-all">
                  <div className="mb-4 inline-flex p-3 rounded-md bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#f0f6fc] mb-2">{title}</h3>
                  <p className="text-[#8b949e] text-xs leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* HOW IT WORKS SECTION */}
        <motion.section custom={4} variants={sectionVariants} id="how-it-works" className="bg-[#0d1117] py-16 border-b border-[#30363d]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#f0f6fc]">How AutoHeal Works</h2>
              <p className="text-[#8b949e] text-sm">5 simple automated steps to achieve zero-touch self-healing.</p>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
              {steps.map(({ step, title, description, icon: Icon }, idx) => (
                <motion.div key={title} custom={idx} variants={cardVariants} className="rounded-lg border border-[#30363d] bg-[#161b22] p-5 text-center shadow-md hover:border-[#8b949e] transition-all">
                  <span className="inline-block text-xs font-mono font-bold text-[#3fb950] mb-2">{step}</span>
                  <div className="mb-3 inline-flex p-2.5 rounded-md bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-bold text-[#f0f6fc] mb-1">{title}</h4>
                  <p className="text-[#8b949e] text-[11px] leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* MULTI-AGENT ARCHITECTURE */}
        <motion.section custom={5} variants={sectionVariants} id="agents" className="bg-[#0d1117] py-16 border-b border-[#30363d]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#f0f6fc]">Multi-Agent Architecture</h2>
              <p className="text-[#8b949e] text-sm">6 specialized autonomous agents working in synchronization.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent, idx) => (
                <motion.div key={agent} custom={idx} variants={cardVariants} className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 flex items-center gap-3 shadow-md hover:border-[#8b949e] transition-all">
                  <div className="p-2.5 rounded-md bg-[#21262d] border border-[#30363d] text-[#3fb950]">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-[#f0f6fc] text-xs">{agent}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* TESTIMONIALS SECTION */}
        <motion.section custom={6} variants={sectionVariants} id="testimonials" className="bg-[#0d1117] py-16 border-b border-[#30363d]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#f0f6fc]">HAPPY CLIENTS SAY</h2>
              <p className="text-[#8b949e] text-sm">Trusted by DevOps engineers and delivery teams worldwide.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map(({ name, role, text }, idx) => (
                <motion.div key={name} custom={idx} variants={cardVariants} className="rounded-lg border border-[#30363d] bg-[#161b22] p-6 shadow-md relative hover:border-[#8b949e] transition-all">
                  <p className="text-[#c9d1d9] text-xs leading-relaxed mb-6 italic">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center font-bold text-[#58a6ff] text-xs">
                      {name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#f0f6fc]">{name}</h4>
                      <p className="text-[11px] text-[#8b949e]">{role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CALL TO ACTION & FOOTER */}
        <motion.section custom={7} variants={sectionVariants} className="relative bg-[#161b22] py-20 border-b border-[#30363d] text-center">
          <div className="max-w-3xl mx-auto px-6 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#f0f6fc] font-sans">Ready to Heal Your CI/CD Pipeline?</h2>
            <p className="text-[#8b949e] text-sm max-w-md mx-auto">Start zero-touch self-healing for your repositories today.</p>
            <Link to="/dashboard">
              <Button size="lg" className="rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-semibold h-12 px-8 text-sm border border-[rgba(240,246,252,0.1)] shadow-sm">
                Launch Agent Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.section>

        <footer className="bg-[#0d1117] py-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-[#58a6ff]" />
              <span className="font-bold text-[#f0f6fc] text-sm font-mono">AutoHealer AI</span>
            </div>
            <p className="text-xs text-[#8b949e]">© 2026 AutoHealer AI. GitHub DevOps Self-Healing System.</p>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}