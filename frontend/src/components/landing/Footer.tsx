"use client";
import { useRouter } from "next/navigation";

export function Footer() {
  const router = useRouter();
  return (
    <footer className="border-t border-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="font-bold text-gray-900 text-lg mb-1">Universal Scientific Calculator</div>
          <p className="text-sm text-gray-500">SymPy · NumPy · SciPy · Plotly · FastAPI · Next.js</p>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <button onClick={() => router.push("/calculator")} className="hover:text-gray-900 transition-colors">Calculator</button>
          <a href="/docs" className="hover:text-gray-900 transition-colors">API Docs</a>
          <span className="text-gray-300">·</span>
          <span>Open Source · MIT License</span>
        </div>
      </div>
    </footer>
  );
}
