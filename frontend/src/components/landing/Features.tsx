"use client";
import { motion } from "framer-motion";
import {
  Calculator, TrendingUp, Atom, FlaskConical, BarChart3,
  Layers, Cpu, Globe
} from "lucide-react";

const FEATURES = [
  {
    icon: Calculator,
    title: "Symbolic Mathematics",
    description: "Full algebra, calculus, differential equations, and number theory powered by SymPy — exact symbolic results, not floating-point approximations.",
    tags: ["Solve", "Simplify", "Factor", "Expand"],
    color: "blue",
  },
  {
    icon: TrendingUp,
    title: "Calculus Engine",
    description: "Derivatives, integrals, limits, Taylor series, Fourier series, and Laplace transforms with complete step-by-step working.",
    tags: ["Differentiate", "Integrate", "Limits", "Series"],
    color: "purple",
  },
  {
    icon: Layers,
    title: "Linear Algebra",
    description: "Matrix operations including eigenvalues, eigenvectors, determinants, inverses, row reduction, and null space computation.",
    tags: ["Eigenvalues", "Determinant", "Inverse", "RREF"],
    color: "green",
  },
  {
    icon: BarChart3,
    title: "Statistics & Probability",
    description: "Descriptive statistics, regression analysis, probability distributions, and hypothesis testing with visualizations.",
    tags: ["Mean", "Regression", "Distributions", "Variance"],
    color: "orange",
  },
  {
    icon: Atom,
    title: "Physics & Engineering",
    description: "Built-in physics constants, classical mechanics, electromagnetism, thermodynamics, and unit conversion.",
    tags: ["Mechanics", "E&M", "Thermo", "Units"],
    color: "red",
  },
  {
    icon: FlaskConical,
    title: "Interactive Graphs",
    description: "2D, 3D, polar, and parametric plotting with Plotly. Zoom, pan, hover, and export publication-quality charts.",
    tags: ["2D Plot", "3D Surface", "Polar", "Parametric"],
    color: "indigo",
  },
  {
    icon: Globe,
    title: "Natural Language Input",
    description: "Type in plain English (or Thai). The AI parser extracts the mathematical intent — the engine handles all computation.",
    tags: ["English", "Thai", "Multilingual", "Smart"],
    color: "teal",
  },
  {
    icon: Cpu,
    title: "Step-by-Step Solutions",
    description: "Every computation shows its working — ideal for students learning mathematics or professionals verifying results.",
    tags: ["Explanations", "Education", "Export PDF", "LaTeX"],
    color: "gray",
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; tag: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", tag: "bg-blue-100 text-blue-700" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", tag: "bg-purple-100 text-purple-700" },
  green: { bg: "bg-green-50", text: "text-green-600", tag: "bg-green-100 text-green-700" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", tag: "bg-orange-100 text-orange-700" },
  red: { bg: "bg-red-50", text: "text-red-600", tag: "bg-red-100 text-red-700" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", tag: "bg-indigo-100 text-indigo-700" },
  teal: { bg: "bg-teal-50", text: "text-teal-600", tag: "bg-teal-100 text-teal-700" },
  gray: { bg: "bg-gray-50", text: "text-gray-600", tag: "bg-gray-100 text-gray-700" },
};

function FeatureCard({ feature, index }: { feature: typeof FEATURES[number]; index: number }) {
  const colors = COLOR_MAP[feature.color];
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-200 group"
    >
      <div className={`inline-flex p-2.5 rounded-xl ${colors.bg} mb-4`}>
        <Icon className={`w-5 h-5 ${colors.text}`} />
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 text-base">{feature.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{feature.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {feature.tags.map((tag) => (
          <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.tag}`}>
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to solve it
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            From freshman calculus to graduate-level mathematics. Every domain, every operation, with exact symbolic answers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
