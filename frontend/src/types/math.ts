export interface Step {
  index: number;
  description: string;
  expression?: string;
  latex?: string;
}

export interface CalculateResponse {
  success: boolean;
  operation: string;
  input: string;
  result?: string;
  result_latex?: string;
  result_numeric?: string;
  steps: Step[];
  graph_data?: Record<string, unknown>;
  error?: string;
  domain?: string;
  parsed?: ParsedOperation;
}

export interface ParsedOperation {
  operation: string;
  expression: string;
  variable: string;
  extra?: Record<string, unknown>;
  source?: string;
}

export interface GraphData {
  data: PlotlyTrace[];
  layout: Record<string, unknown>;
}

export interface PlotlyTrace {
  type: string;
  x?: number[];
  y?: number[];
  z?: number[][];
  mode?: string;
  name?: string;
  line?: Record<string, unknown>;
  marker?: Record<string, unknown>;
  [key: string]: unknown;
}

export type OperationCategory =
  | "algebra"
  | "calculus"
  | "linear-algebra"
  | "statistics"
  | "physics"
  | "graphing"
  | "number-theory"
  | "complex";

export interface ExampleInput {
  label: string;
  input: string;
  category: OperationCategory;
  description: string;
}

export const EXAMPLE_INPUTS: ExampleInput[] = [
  { label: "Quadratic", input: "solve x^2 + 5x + 6 = 0", category: "algebra", description: "Solve a quadratic equation" },
  { label: "Derivative", input: "differentiate sin(x^2) * e^x", category: "calculus", description: "Derivative with chain rule" },
  { label: "Integral", input: "integrate x^2 * sin(x) from 0 to pi", category: "calculus", description: "Definite integral" },
  { label: "Limit", input: "limit of sin(x)/x as x approaches 0", category: "calculus", description: "Classic limit" },
  { label: "Taylor Series", input: "taylor series of e^x about 0 to order 8", category: "calculus", description: "Maclaurin series" },
  { label: "Laplace", input: "laplace transform of t^2 * e^(-3t)", category: "calculus", description: "Laplace transform" },
  { label: "Eigenvalues", input: "eigenvalues of [[2,1],[1,2]]", category: "linear-algebra", description: "2×2 matrix eigenvalues" },
  { label: "Determinant", input: "det [[1,2,3],[4,5,6],[7,8,9]]", category: "linear-algebra", description: "3×3 determinant" },
  { label: "Statistics", input: "mean of 2, 4, 6, 8, 10", category: "statistics", description: "Descriptive statistics" },
  { label: "Factor", input: "factor x^4 - 16", category: "algebra", description: "Polynomial factoring" },
  { label: "Unit Convert", input: "convert 100 km to mi", category: "physics", description: "Unit conversion" },
  { label: "Complex", input: "simplify (2 + 3i)^2", category: "complex", description: "Complex arithmetic" },
];
