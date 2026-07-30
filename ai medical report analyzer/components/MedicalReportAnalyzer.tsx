"use client";

import { useState } from "react";
import { Stethoscope } from "lucide-react";
import AnalysisSteps from "./AnalysisSteps";
import UploadCard from "./UploadCard";
// import ResultsCard from "./ResultsCard";

export default function MedicalReportAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [analysisMethod, setAnalysisMethod] = useState<"url" | "upload">(
    "upload"
  );

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center mb-8 text-green-700">
        <div className="flex items-center mb-4">
          <Stethoscope className="w-8 h-8 mr-2" />
          <h1 className="text-3xl font-bold">Medical Report Analyzer</h1>
        </div>
        <AnalysisSteps />
      </div>

      <UploadCard
        isAnalyzing={isAnalyzing}
        onAnalyze={handleAnalyze}
        analysisMethod={analysisMethod}
        setAnalysisMethod={setAnalysisMethod}
        setIsAnalyzing={setIsAnalyzing}
      />
    </div>
  );
}
