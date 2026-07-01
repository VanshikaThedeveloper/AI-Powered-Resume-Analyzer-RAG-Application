import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura Resume AI - RAG Resume Analyzer & Interview Guide Generator",
  description: "Analyze your resume against any job description with state-of-the-art RAG technology. Obtain detailed matching/missing skills, ATS scores, actionable improvements, and interview questions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          <div className="relative flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col w-full">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: "border border-border bg-card text-foreground",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
