import { Link } from 'react-router-dom';
import { useEffect } from 'react';
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
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const problems = [
  {
    title: 'Broken pipelines',
    description: 'Builds fail unexpectedly and block delivery momentum.',
    icon: AlertTriangle,
  },
  {
    title: 'Debugging time loss',
    description: 'Engineers spend hours tracing flaky failures and regressions.',
    icon: Clock,
  },
  {
    title: 'Delayed deployments',
    description: 'Critical releases slip while teams investigate incidents manually.',
    icon: GitBranch,
  },
];

const capabilities = [
  { title: 'Repository Analysis', icon: Search },
  { title: 'Automated Bug Detection', icon: Radar },
  { title: 'AI-Generated Code Fixes', icon: Wrench },
  { title: 'CI/CD Pipeline Recovery', icon: CheckCircle2 },
];

const steps = [
  {
    title: 'Step 1',
    description: 'User provides GitHub repository',
    icon: Github,
  },
  {
    title: 'Step 2',
    description: 'Agent clones repository and scans codebase',
    icon: Search,
  },
  {
    title: 'Step 3',
    description: 'Tests run in a sandbox environment',
    icon: Activity,
  },
  {
    title: 'Step 4',
    description: 'AI detects bugs and generates fixes',
    icon: Bot,
  },
  {
    title: 'Step 5',
    description: 'Fixes are committed and CI/CD pipeline passes',
    icon: CheckCircle2,
  },
];

const agents = [
  'Repository Analysis Agent',
  'Test Runner Agent',
  'Bug Classification Agent',
  'Fix Generation Agent',
  'Git Commit Agent',
  'CI/CD Monitoring Agent',
];

const features = [
  'Autonomous debugging',
  'Real-time pipeline monitoring',
  'Automated code patching',
  'Developer insights',
  'Safety validation',
];

export default function LandingPage() {
  useEffect(() => {
    document.title = 'AutoHealer AI';
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center md:py-32">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Autonomous DevOps Healing
          </div>
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl">AutoHealer AI</h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">Autonomous DevOps Healing System</p>
          <p className="mt-6 max-w-3xl text-base text-muted-foreground md:text-lg">
            AutoHeal monitors your CI/CD pipelines, detects failing builds, analyzes the codebase, and automatically applies fixes to restore your pipeline.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="h-12 px-8 text-sm font-semibold">
                Launch Agent
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-semibold">
                View How It Works
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">The Problem With CI/CD Failures</h2>
          <p className="mt-3 text-muted-foreground">
            Teams lose delivery velocity when build failures happen during critical release windows.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {problems.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md">
              <Icon className="mb-4 h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Introducing AutoHealer AI</h2>
            <p className="mt-3 text-muted-foreground">
              AutoHealer AI uses intelligent agents to detect, fix, and validate CI/CD failures automatically.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ title, icon: Icon }) => (
              <div key={title} className="rounded-xl border border-border bg-background p-5 text-center">
                <Icon className="mx-auto mb-3 h-6 w-6 text-primary" />
                <p className="font-medium">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {steps.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-4 text-center">
              <Icon className="mx-auto mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">Multi-Agent Architecture</h2>
            <p className="mt-3 text-muted-foreground">Specialized agents collaborate end-to-end to recover failed pipelines.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <div key={agent} className="rounded-xl border border-border bg-background p-5">
                <p className="font-medium">{agent}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">Features</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((feature) => (
            <div key={feature} className="rounded-xl border border-border bg-card p-5 text-center text-sm font-medium">
              {feature}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold">Live Dashboard Preview</h2>
              <p className="mt-3 text-muted-foreground">Monitor your CI/CD healing process in real time.</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <div className="mb-4 h-3 w-24 rounded-full bg-muted" />
              <div className="space-y-3">
                <div className="h-10 rounded-lg bg-muted" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-24 rounded-lg bg-muted" />
                  <div className="h-24 rounded-lg bg-muted" />
                </div>
                <div className="h-24 rounded-lg bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="text-4xl font-bold tracking-tight">Ready to Heal Your CI/CD Pipeline?</h2>
        <Link to="/dashboard">
          <Button size="lg" className="mt-8 h-12 px-10 text-sm font-semibold">
            Run Agent
          </Button>
        </Link>
      </section>

      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-2">
          <div>
            <p className="text-lg font-semibold">AutoHealer AI</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Autonomous DevOps Healing System for fast, resilient software delivery.
            </p>
          </div>
          <div className="flex items-start justify-start gap-6 text-sm md:justify-end">
            <Link to="/dashboard" className="transition-colors hover:text-primary">
              Dashboard
            </Link>
            <a href="#" className="transition-colors hover:text-primary">
              Documentation
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}