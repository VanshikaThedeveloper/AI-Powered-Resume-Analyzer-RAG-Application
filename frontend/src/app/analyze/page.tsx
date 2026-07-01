"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { 
  Upload, FileText, CheckCircle, AlertCircle, X, RefreshCw, Briefcase, 
  Code, Copy, Award, ArrowLeft, Check, Sparkles, AlertTriangle, BookOpen, UserCheck, Cpu
} from "lucide-react";
import apiClient from "@/lib/api";
import { AnalysisResponse } from "@/types";

interface FormInputs {
  jobDescription: string;
}

const loadingStages = [
  "Uploading resume to secure parser...",
  "Extracting text structures and formatting metrics...",
  "Segmenting resume content into semantic chunks...",
  "Storing vector embeddings into ChromaDB collection...",
  "Retrieving matching document nodes for context alignment...",
  "Running Qwen-72B LLM comparison analysis...",
  "Evaluating ATS score and missing skill sets...",
  "Generating custom behavioral, HR, and technical interview questions...",
  "Finalizing dashboard statistics..."
];

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "result">("idle");
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"technical" | "behavioral" | "hr">("technical");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      jobDescription: ""
    }
  });

  const jobDescValue = watch("jobDescription");

  // Cycle loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "loading") {
      setLoadingStageIndex(0);
      interval = setInterval(() => {
        setLoadingStageIndex((prev) => (prev < loadingStages.length - 1 ? prev + 1 : prev));
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop events
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  // Handle manual file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Invalid file format. Please upload a PDF file.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size allowed is 10MB.");
      return;
    }
    setFile(selectedFile);
    toast.success("Resume loaded successfully!");
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit Handler
  const onSubmit = async (data: FormInputs) => {
    if (!file) {
      toast.error("Please upload your resume PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", data.jobDescription);

    setStatus("loading");
    setResult(null);

    const sessionId = typeof window !== "undefined" ? sessionStorage.getItem("session_id") : null;
    const headers: Record<string, string> = {
      "Content-Type": "multipart/form-data",
    };
    if (sessionId) {
      headers["X-Session-ID"] = sessionId;
    }

    try {
      const response = await apiClient.post<AnalysisResponse>("/analyze", formData, {
        headers,
      });
      
      if (response.data.session_id) {
        sessionStorage.setItem("session_id", response.data.session_id);
      }

      setResult(response.data);
      setStatus("result");
      toast.success("Resume analyzed successfully!");
    } catch (error: any) {
      setStatus("idle");
      if (error.message && (error.message.includes("session has expired") || error.message.includes("expired"))) {
        sessionStorage.removeItem("session_id");
        toast.error("Your session has expired. Please upload the PDF again.");
      } else {
        toast.error(error.message || "Resume analysis failed. Please try again.");
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const resetAnalysis = () => {
    setResult(null);
    setStatus("idle");
    removeFile();
    reset();
  };

  // Dynamic values for rendering Score Circular progress
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-500 stroke-emerald-500";
    if (score >= 40) return "text-blue-500 stroke-blue-500";
    return "text-red-500 stroke-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    if (score >= 40) return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    return "bg-red-500/10 border-red-500/20 text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return "Excellent Match";
    if (score >= 40) return "Moderate Match";
    return "Needs Optimization";
  };

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-300">
      
      <AnimatePresence mode="wait">
        
        {/* State 1: Input Fields Form */}
        {status === "idle" && (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Header Column */}
            <div className="lg:col-span-12 mb-2">
              <h1 className="text-3xl font-extrabold tracking-tight">Analyze Resume</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Compare your credentials with the criteria of the desired position using advanced vector indices.
              </p>
            </div>

            {/* Left Side: File Drag & Paste Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="border border-border bg-card/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* File Upload Area */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">Upload Resume (PDF)</label>
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 ${
                        dragActive 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50 bg-background/50"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {file ? (
                        <div className="flex flex-col items-center text-center space-y-3" onClick={(e) => e.stopPropagation()}>
                          <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <FileText className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm max-w-xs truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded bg-red-500/5 border border-red-500/10 transition-colors"
                          >
                            <X className="h-3 w-3" />
                            Remove File
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Upload className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              Drag & drop your PDF resume here, or <span className="text-primary font-bold">browse</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Supports PDF format only (Max 10MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Job Description Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="jobDescription" className="block text-sm font-semibold">Job Description</label>
                      <span className="text-xs text-muted-foreground">{jobDescValue ? jobDescValue.length : 0} characters</span>
                    </div>
                    <textarea
                      id="jobDescription"
                      rows={8}
                      {...register("jobDescription", { 
                        required: "Job description is required to compare context.",
                        minLength: { value: 50, message: "Please provide a more descriptive job requirements text (min 50 characters)." }
                      })}
                      placeholder="Paste the target job description here, including necessary skills, requirements, roles and responsibilities..."
                      className="w-full rounded-xl border border-border bg-background p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all leading-relaxed"
                    />
                    {errors.jobDescription && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.jobDescription.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!file || !jobDescValue}
                    className="w-full flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-101"
                  >
                    <Sparkles className="h-4 w-4" />
                    Analyze Resume
                  </button>
                </form>
              </div>
            </div>

            {/* Right Side: Informative Card Guide */}
            <div className="lg:col-span-5 space-y-6">
              <div className="border border-border bg-card/40 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  RAG Pipeline Steps
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</div>
                    <div>
                      <h4 className="text-sm font-semibold">Document Chunking</h4>
                      <p className="text-xs text-muted-foreground mt-1">Your uploaded PDF text is divided into 1,000-character segments with overlap to prevent loss of context.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</div>
                    <div>
                      <h4 className="text-sm font-semibold">Chroma Vector Embeddings</h4>
                      <p className="text-xs text-muted-foreground mt-1">Segments are mapped into vector dimensions and queried through similarity search matching the job description keyphrases.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</div>
                    <div>
                      <h4 className="text-sm font-semibold">Large Language Modeling</h4>
                      <p className="text-xs text-muted-foreground mt-1">Qwen-72B analyzes retrieve-context snippets directly matching criteria and returns verified structured feedback data.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/80 pt-4 flex gap-3 text-xs text-muted-foreground">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-primary" />
                  <span>The backend is strictly read-only for vector lookup and LLM inference. Your upload files are processed temporarily.</span>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* State 2: Shifting Loading Interface */}
        {status === "loading" && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center"
          >
            <div className="relative flex items-center justify-center mb-8">
              {/* Outer rotating border */}
              <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Cpu className="absolute h-8 w-8 text-primary animate-pulse" />
            </div>

            <motion.h3 
              key={loadingStageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-lg font-bold text-foreground h-7"
            >
              {loadingStages[loadingStageIndex]}
            </motion.h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm">
              Please do not refresh the browser. Extracting text from files and building vector spaces can take up to a minute.
            </p>
          </motion.div>
        )}

        {/* State 3: Detailed Score Dashboard Dashboard */}
        {status === "result" && result && (
          <motion.div
            key="result-dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="space-y-8"
          >
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <button 
                  onClick={resetAnalysis}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium mb-2 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to inputs
                </button>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Analysis Dashboard</h1>
              </div>
              
              <button
                onClick={resetAnalysis}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-card border border-border px-5 text-sm font-semibold hover:bg-muted-foreground/10 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Analyze Another Resume
              </button>
            </div>

            {/* Dashboard Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: ATS Score Circle */}
              <div className="lg:col-span-4 border border-border bg-card/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">ATS Match Percentage</span>
                
                <div className="relative flex items-center justify-center w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="96" 
                      cy="96" 
                      r="80" 
                      stroke="currentColor" 
                      strokeWidth="10" 
                      className="text-border" 
                      fill="transparent" 
                    />
                    <motion.circle 
                      cx="96" 
                      cy="96" 
                      r="80" 
                      stroke="currentColor" 
                      strokeWidth="12" 
                      className={getScoreColor(result.match_percentage)} 
                      fill="transparent" 
                      strokeDasharray="502.4"
                      initial={{ strokeDashoffset: 502.4 }}
                      animate={{ strokeDashoffset: 502.4 - (502.4 * result.match_percentage) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-5xl font-black">{result.match_percentage}%</span>
                    <span className="text-2xs text-muted-foreground uppercase tracking-widest mt-1">Match Quality</span>
                  </div>
                </div>

                <div className={`mt-6 px-4 py-1.5 rounded-full text-xs font-bold border ${getScoreBg(result.match_percentage)}`}>
                  {getScoreLabel(result.match_percentage)}
                </div>

                <p className="text-xs text-muted-foreground mt-4 leading-relaxed max-w-xs">
                  This score is computed using semantic index matches across skills, experience requirements, and roles mentioned in your document.
                </p>
              </div>

              {/* Right Column: Skills mapping tabs */}
              <div className="lg:col-span-8 border border-border bg-card/60 rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Skills Profile Alignment
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                  
                  {/* Matching Skills */}
                  <div className="border border-border/50 rounded-xl p-4 bg-background/40">
                    <h4 className="text-sm font-semibold text-emerald-500 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                      Matching Skills ({result.matching_skills.length})
                    </h4>
                    {result.matching_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                        {result.matching_skills.map((skill) => (
                          <span 
                            key={skill} 
                            className="px-2.5 py-1 text-xs rounded-lg border border-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:text-emerald-300 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No matching skills identified.</p>
                    )}
                  </div>

                  {/* Missing Skills */}
                  <div className="border border-border/50 rounded-xl p-4 bg-background/40">
                    <h4 className="text-sm font-semibold text-red-500 dark:text-red-400 mb-3 flex items-center gap-1.5">
                      <AlertCircle className="h-4.5 w-4.5 text-red-500" />
                      Missing Skills ({result.missing_skills.length})
                    </h4>
                    {result.missing_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                        {result.missing_skills.map((skill) => (
                          <span 
                            key={skill} 
                            className="px-2.5 py-1 text-xs rounded-lg border border-red-500/10 bg-red-500/5 text-red-500 dark:text-red-300 font-medium"
                          >
                            + {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-500 dark:text-emerald-400 italic">Excellent! No missing key skills detected.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions Section */}
              <div className="lg:col-span-12 border border-border bg-card/60 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Actionable Resume Suggestions
                </h3>
                
                {result.resume_suggestions.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.resume_suggestions.map((suggestion, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 p-3.5 rounded-xl border border-border/50 bg-background/40 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-sm text-foreground/90 leading-relaxed">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No specific suggestions found; your resume looks highly aligned with the target role.</p>
                )}
              </div>

              {/* Interview Guides Section */}
              <div className="lg:col-span-12 border border-border bg-card/60 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border/50 pb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    AI Interview Preparation Guide
                  </h3>
                  
                  {/* Category Tabs */}
                  <div className="flex rounded-lg bg-background p-1 border border-border">
                    {(["technical", "behavioral", "hr"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 text-xs font-semibold capitalize rounded-md transition-all ${
                          activeTab === tab 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab} Questions
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Contents */}
                <div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {result.interview_questions[activeTab] && result.interview_questions[activeTab].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.interview_questions[activeTab].map((question, index) => (
                            <div 
                              key={index}
                              className="group flex items-start justify-between gap-4 p-4 rounded-xl border border-border/40 bg-background/20 hover:border-primary/20 hover:bg-background/40 transition-all duration-200"
                            >
                              <div className="space-y-1">
                                <span className="text-2xs text-primary font-mono uppercase tracking-widest">Question {index + 1}</span>
                                <p className="text-sm font-medium leading-relaxed">{question}</p>
                              </div>
                              <button
                                onClick={() => handleCopy(question)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-colors shrink-0"
                                title="Copy question"
                              >
                                {copiedText === question ? (
                                  <Check className="h-4 w-4 text-emerald-500 animate-scale" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic p-4 text-center">No questions available for this category.</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
