import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { SolutionShowcase } from "@/components/landing/SolutionShowcase";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <SolutionShowcase />

      {/* CTA section */}
      <section className="py-24 bg-gray-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">Start solving now</h2>
          <p className="text-gray-400 text-lg mb-8">
            No sign-up required. No limits. Full symbolic computation in your browser.
          </p>
          <a
            href="/calculator"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-gray-100 transition-colors"
          >
            Open Calculator →
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
