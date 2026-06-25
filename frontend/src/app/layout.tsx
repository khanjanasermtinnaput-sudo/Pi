import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Universal Scientific Calculator — The Future of Scientific Computation",
  description: "Solve mathematics, engineering, physics, and symbolic problems instantly. University-level computation with step-by-step solutions, graphs, and natural language input.",
  keywords: ["scientific calculator", "math solver", "calculus", "algebra", "physics", "sympy", "step by step"],
  openGraph: {
    title: "Universal Scientific Calculator",
    description: "The Future of Scientific Computation",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
