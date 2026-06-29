import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
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
  title: "Pi — Professional Scientific Calculator",
  description:
    "A premium web scientific calculator. Solve calculus, linear algebra, statistics, and symbolic math instantly with step-by-step solutions, graphs, and AI parsing.",
  keywords: [
    "scientific calculator",
    "math solver",
    "calculus",
    "algebra",
    "physics",
    "sympy",
    "step by step",
    "desmos",
    "wolfram alpha",
  ],
  openGraph: {
    title: "Pi — Professional Scientific Calculator",
    description: "Premium symbolic math computation with step-by-step solutions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          themes={["light", "dark", "high-contrast"]}
          enableSystem={false}
        >
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
