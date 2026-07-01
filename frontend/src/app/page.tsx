"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, CheckCircle, FileText, Cpu, Target, Award, HelpCircle, ChevronDown, Sparkles, MessageSquare, AlertCircle
} from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const features = [
    {
      icon: <Cpu className="h-6 w-6 text-primary" />,
      title: "RAG Semantic Matching",
      description: "Uses Retrieval-Augmented Generation to search and match your resume chunks directly against the target job requirements, capturing contextual meaning instead of just exact words."
    },
    {
      icon: <Target className="h-6 w-6 text-primary" />,
      title: "Precise Skills Gap Analysis",
      description: "Instantly flags missing technical and soft skills required by recruiters, listing exactly what needs to be added to get your application noticed."
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Custom Interview Questions",
      description: "Generates custom-tailored HR, behavioral, and technical interview questions based directly on the identified match gaps and target role."
    },
    {
      icon: <Award className="h-6 w-6 text-primary" />,
      title: "ATS Optimization Scoring",
      description: "Computes a match percentage score that mirrors actual corporate Applicant Tracking Systems (ATS), indicating readiness for hiring reviews."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Your PDF Resume",
      description: "Drag and drop your professional resume. Our system processes it and indexes its content securely into a vector database."
    },
    {
      number: "02",
      title: "Paste Job Description",
      description: "Copy and paste the exact text of the job listing you want to target. This forms the retrieval context."
    },
    {
      number: "03",
      title: "Get AI Analysis Dashboard",
      description: "Receive an optimization score, exact skill gaps, actionable suggestions, and custom interview prep guides within seconds."
    }
  ];

  const benefits = [
    "Increase resume visibility on corporate recruiters' dashboards",
    "Identify exact keyphrases to beat keyword screening algorithms",
    "Tailor resumes for multiple roles in under a minute",
    "Arrive fully prepared with specific questions likely to be asked by hiring managers"
  ];

  const faqs = [
    {
      question: "How does the RAG pipeline analyze my resume?",
      answer: "When you upload your resume, the text is extracted and split into chunks. These chunks are embedded using advanced AI embedding models and stored in a vector space (ChromaDB). When compared against a job description, the system retrieves only the semantically similar sections of your resume to build a prompt context for the LLM, ensuring highly accurate matches and minimizing AI hallucinations."
    },
    {
      question: "Which LLM model does the backend use?",
      answer: "The backend is powered by a high-performance 72-Billion parameter instruction model (Qwen 2.5-72B-Instruct) via Hugging Face, providing state-of-the-art reasoning and technical capabilities to ensure review suggestions are contextual and professional."
    },
    {
      question: "Is my personal data stored or saved?",
      answer: "No, your resumes are temporarily saved in the server's uploads folder strictly to process the vector extraction and model execution. Results are parsed dynamically and returned directly to your browser without database persistence of your personal data."
    },
    {
      question: "What format of resume is supported?",
      answer: "Currently, our system is optimized to accept professional PDF files. This format ensures document structure and characters are processed consistently during vector indexing."
    }
  ];

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="flex-1 w-full bg-background grid-bg relative transition-colors duration-300">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/10 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-2/3 right-1/10 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs sm:text-sm font-medium text-primary mb-6 glow-accent"
        >
          <Sparkles className="h-3.5 w-3.5 animate-spin" />
          <span>Powered by RAG Retrieval & Qwen-72B</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl max-w-3xl leading-tight sm:leading-none"
        >
          Beat the ATS. Match the Job. <br/>
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Get the Interview.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl"
        >
          Optimize your resume for any position. Upload your PDF and paste a job description to obtain an ATS score, identify missing skills, and unlock custom interview guides.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/analyze"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/95 transition-all duration-300 hover:scale-102 hover:shadow-primary/20 dark:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            Analyze Resume Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-8 text-base font-medium text-foreground hover:bg-muted-foreground/10 transition-colors"
          >
            Learn More
          </a>
        </motion.div>
      </section>

      {/* Hero Illustration / Dashboard Preview */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative rounded-2xl border border-border bg-card/60 p-4 shadow-xl backdrop-blur-sm glow-accent overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-4">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 block" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">dashboard_preview.tsx</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2 min-h-64 sm:min-h-80">
            {/* Score Ring Preview */}
            <div className="flex flex-col items-center justify-center border border-border/60 rounded-xl p-6 bg-card/40">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Match Quality</span>
              <div className="relative flex items-center justify-center w-36 h-36">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="60" stroke="currentColor" strokeWidth="10" className="text-border" fill="transparent" />
                  <circle cx="72" cy="72" r="60" stroke="currentColor" strokeWidth="10" className="text-primary" fill="transparent" strokeDasharray="376.8" strokeDashoffset="94.2" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">75%</span>
                  <span className="text-2xs text-muted-foreground uppercase tracking-widest mt-0.5">ATS Score</span>
                </div>
              </div>
            </div>
            {/* Gaps Preview */}
            <div className="md:col-span-2 border border-border/60 rounded-xl p-6 bg-card/40 space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-primary">Identified Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {["Docker", "CI/CD Pipelines", "System Design", "MongoDB", "Kubernetes"].map((s, idx) => (
                    <span key={s} className="px-2.5 py-1 text-xs rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 dark:text-red-400 font-medium">
                      + {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <h4 className="text-sm font-semibold mb-2 text-primary">Actionable Suggestions</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>Expand details on React State Management, specifically Redux Toolkit.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>Incorporate quantitative impact metrics under the senior developer experience section.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/25 border-y border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Engineered for Resume Success
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our analyzer implements advanced Retrieval-Augmented Generation (RAG) to ensure evaluations are targeted, context-aware, and precise.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-grow">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Optimize your resume for any position in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex flex-col p-6 rounded-2xl border border-border bg-card shadow-sm">
                <span className="text-4xl font-extrabold text-primary/15 font-mono mb-4">{step.number}</span>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-card/25 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
                Why use Aura Resume AI?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Traditional keyword-matching engines look for exact letters. Modern recruiting software leverages AI models to identify skills semantically. Our software models this dynamic, giving you a distinct advantage.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative rounded-2xl border border-border bg-card p-8 flex flex-col gap-6 shadow-lg overflow-hidden glow-accent">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">Ready to test your resume?</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Start optimization immediately. Simply upload your resume, enter the target job description, and watch our RAG processor compute real-time scores and missing metrics.
              </p>
              <Link
                href="/analyze"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-medium shadow-md hover:bg-primary/95 transition-all duration-300 hover:scale-102 mt-4"
              >
                Start Free Analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Clear responses to common queries regarding RAG and security.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className="border border-border rounded-xl bg-card overflow-hidden transition-all duration-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex items-center justify-between w-full p-5 text-left font-medium text-foreground hover:bg-muted-foreground/5 transition-colors gap-3"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? "transform rotate-180" : ""}`} />
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 border-t border-border/40">
                    <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
