"use client";

import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import AnalysisSteps from "./AnalysisSteps";
import UploadCard from "./UploadCard";

export default function MedicalReportAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMethod, setAnalysisMethod] = useState<"url" | "upload" | "text">(
    "upload"
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center mb-8 text-sky-700 dark:text-sky-300">
        <div className="flex items-center gap-4 mb-4">
          <Stethoscope className="w-8 h-8" aria-hidden="true" />
          <h1 className="text-3xl font-bold">Medical Report Analyzer</h1>
          <ThemeToggle />
        </div>
        <AnalysisSteps />
      </div>

      <UploadCard
        isAnalyzing={isAnalyzing}
        setIsAnalyzing={setIsAnalyzing}
        analysisMethod={analysisMethod}
        setAnalysisMethod={setAnalysisMethod}
      />
    </div>
  );
}
