"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

const FLOATING_EXPRESSIONS = [
  "∫₀^∞ e^{-x²} dx = √π/2",
  "∇²φ = 4πGρ",
  "e^{iπ} + 1 = 0",
  "F = ma",
  "E = mc²",
  "∂u/∂t = α∇²u",
  "det(A - λI) = 0",
  "lim_{x→0} sin(x)/x = 1",
  "∑_{n=1}^∞ 1/n² = π²/6",
  "Ĥψ = Eψ",
  "∇ × B = μ₀J + μ₀ε₀∂E/∂t",
  "PV = nRT",
];

function MathParticle({ expr, delay, x }: { expr: string; delay: number; x: number }) {
  return (
    <motion.div
      className="absolute text-xs font-mono text-gray-400 select-none whitespace-nowrap pointer-events-none"
      initial={{ y: "110vh", opacity: 0, x: `${x}vw` }}
      animate={{ y: "-10vh", opacity: [0, 0.5, 0.5, 0] }}
      transition={{
        duration: 12 + Math.random() * 6,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {expr}
    </motion.div>
  );
}

const DEMO_SEQUENCE = [
  { text: "solve x² + 5x + 6 = 0", result: "x = −2, x = −3" },
  { text: "differentiate sin(x²)", result: "2x·cos(x²)" },
  { text: "limit of sin(x)/x as x→0", result: "1" },
  { text: "integrate x² from 0 to 1", result: "1/3" },
  { text: "eigenvalues of [[2,1],[1,2]]", result: "λ = 1, λ = 3" },
];

function TypewriterDemo() {
  const [phase, setPhase] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const current = DEMO_SEQUENCE[phase % DEMO_SEQUENCE.length];
    let i = 0;
    setDisplayed("");
    setShowResult(false);

    const typing = setInterval(() => {
      i++;
      setDisplayed(current.text.slice(0, i));
      if (i >= current.text.length) {
        clearInterval(typing);
        setTimeout(() => setShowResult(true), 300);
        setTimeout(() => {
          setPhase(p => p + 1);
        }, 2800);
      }
    }, 45);

    return () => clearInterval(typing);
  }, [phase]);

  const current = DEMO_SEQUENCE[phase % DEMO_SEQUENCE.length];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl max-w-lg w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-2 text-xs text-gray-400 font-mono">universal-calculator</span>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 min-h-[56px] flex items-center border border-gray-100">
        <span className="font-mono text-sm text-gray-800">{displayed}</span>
        <span className="cursor-blink ml-0.5 font-mono text-blue-600">|</span>
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-4"
        >
          <p className="text-xs text-blue-500 font-medium mb-1 uppercase tracking-wide">Result</p>
          <p className="text-lg font-semibold text-blue-900 font-mono">{current.result}</p>
        </motion.div>
      )}
    </div>
  );
}

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating math expressions */}
      <div className="particle-canvas">
        {FLOATING_EXPRESSIONS.map((expr, i) => (
          <MathParticle
            key={i}
            expr={expr}
            delay={i * 1.1}
            x={5 + (i / FLOATING_EXPRESSIONS.length) * 90}
          />
        ))}
      </div>

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-50 opacity-60 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16">
        {/* Left: copy */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">SymPy-powered · Step-by-step solutions</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-gray-900 mb-6">
              The Future of{" "}
              <span className="gradient-text">Scientific</span>
              <br />
              Computation
            </h1>

            <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-xl lg:max-w-none">
              Solve mathematics, engineering, physics, and symbolic problems instantly.
              University-level computation with step-by-step explanations.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button
                onClick={() => router.push("/calculator")}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-gray-800 transition-all duration-150 active:scale-[0.98] shadow-lg shadow-gray-900/10"
              >
                Open Calculator
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-gray-50 transition-all duration-150"
              >
                See Features
              </button>
            </div>

            <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-400">
              <span>∫ Calculus</span>
              <span className="text-gray-200">·</span>
              <span>Σ Algebra</span>
              <span className="text-gray-200">·</span>
              <span>∇ Linear Algebra</span>
              <span className="text-gray-200">·</span>
              <span>⚡ Physics</span>
            </div>
          </motion.div>
        </div>

        {/* Right: live demo */}
        <motion.div
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <TypewriterDemo />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-gray-400 to-transparent"
          animate={{ scaleY: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
