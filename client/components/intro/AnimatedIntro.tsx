import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Sparkles, X, Github } from 'lucide-react';

interface AnimatedIntroProps {
  onComplete?: () => void;
}

export const AnimatedIntro: React.FC<AnimatedIntroProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<'init' | 'charge' | 'reveal' | 'fade'>('init');
  const [telemetryText, setTelemetryText] = useState('INITIALIZING GITHUB NEURAL CORE...');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('autoheal_intro_seen');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hasSeenIntro === 'true' || prefersReducedMotion) {
      setIsVisible(false);
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        skipIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const t1 = setTimeout(() => {
      setPhase('charge');
      setTelemetryText('CALIBRATING DEVOPS SELF-HEALING ENGINE...');
    }, 1200);

    const t2 = setTimeout(() => {
      setPhase('reveal');
      setTelemetryText('AUTOHEAL AI ONLINE');
    }, 2400);

    const t3 = setTimeout(() => {
      setPhase('fade');
    }, 3700);

    const t4 = setTimeout(() => {
      finishIntro();
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 80;
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }

    const colors = ['#238636', '#58a6ff', '#3fb950', '#a5d6ff'];
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let pulseRadius = 0;
    let pulseAlpha = 0.8;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(35, 134, 54, ${(1 - dist / 130) * 0.25})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        if (phase === 'charge') {
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          p.vx += dx * 0.00015;
          p.vy += dy * 0.00015;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
      });

      if (phase === 'reveal' || phase === 'fade') {
        pulseRadius += 6;
        pulseAlpha *= 0.96;

        if (pulseAlpha > 0.01) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(35, 134, 54, ${pulseAlpha})`;
          ctx.lineWidth = 2;
          ctx.shadowColor = '#238636';
          ctx.shadowBlur = 20;
          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isVisible, phase]);

  const finishIntro = () => {
    sessionStorage.setItem('autoheal_intro_seen', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const skipIntro = () => {
    finishIntro();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'fade' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0d1117] text-[#f0f6fc] overflow-hidden select-none"
        >
          <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full pointer-events-none" />

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(35,134,54,0.15)_0%,rgba(13,17,23,0.98)_80%)] pointer-events-none" />

          <div className="absolute top-6 right-8 z-50">
            <button
              onClick={skipIntro}
              type="button"
              className="flex items-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-3.5 py-1.5 text-xs font-semibold text-[#c9d1d9] backdrop-blur-md transition-all hover:bg-[#30363d] hover:text-white"
            >
              <span>Skip Intro</span>
              <kbd className="rounded border border-[#30363d] bg-[#161b22] px-1 text-[10px] text-[#8b949e]">ESC</kbd>
              <X className="h-3.5 w-3.5 ml-0.5 text-[#8b949e]" />
            </button>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-[#30363d]"
              />

              <motion.div
                animate={{
                  scale: phase === 'charge' ? [1, 1.25, 1.1] : phase === 'reveal' ? [1.1, 1.4, 1] : 1,
                  borderColor: phase === 'reveal' ? ['#238636', '#58a6ff', '#2ea043'] : '#238636',
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute inset-2 rounded-full border-2 border-[#238636] shadow-[0_0_35px_rgba(35,134,54,0.5)]"
              />

              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                  scale: phase === 'reveal' ? [0.8, 1.15, 1] : phase === 'charge' ? 0.9 : 0.7,
                  opacity: phase === 'init' ? 0.6 : 1,
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#30363d] bg-[#161b22] shadow-2xl text-white"
              >
                <Terminal className="h-10 w-10 text-[#58a6ff]" />
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              {phase === 'reveal' || phase === 'fade' ? (
                <motion.div
                  key="reveal-text"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="space-y-3"
                >
                  <h1 className="text-4xl font-extrabold tracking-wider md:text-5xl font-mono text-[#f0f6fc]">
                    AUTOHEAL <span className="text-[#3fb950]">AI</span>
                  </h1>
                  <p className="flex items-center justify-center gap-2 text-sm font-medium tracking-wide text-[#8b949e] md:text-base">
                    <Sparkles className="h-4 w-4 text-[#3fb950] animate-pulse" />
                    GitHub DevOps Autonomous Healing Engine
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="loading-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <span className="h-2 w-2 rounded-full bg-[#3fb950] animate-ping" />
                    <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#58a6ff]">
                      {telemetryText}
                    </p>
                  </div>
                  <div className="h-1.5 w-48 mx-auto rounded-full bg-[#21262d] overflow-hidden border border-[#30363d]">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: phase === 'charge' ? '70%' : '30%' }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                      className="h-full bg-gradient-to-r from-[#238636] to-[#58a6ff] shadow-[0_0_10px_#238636]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedIntro;
