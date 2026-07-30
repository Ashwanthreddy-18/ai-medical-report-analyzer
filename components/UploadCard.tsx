"use client";

import { useState, useCallback } from "react";
import { Activity, FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ResultsCard from "./ResultsCard";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

interface AnalysisResult {
  report: {
    originalDocument: string;
    analysis: string;
  };
}

interface UploadCardProps {
  isAnalyzing: boolean;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  analysisMethod: "url" | "upload" | "text";
  setAnalysisMethod: (method: "url" | "upload" | "text") => void;
}

export default function UploadCard({
  isAnalyzing,
  setIsAnalyzing,
  analysisMethod,
  setAnalysisMethod,
}: UploadCardProps) {
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const { toast } = useToast();

  const validateFile = useCallback(
    (selectedFile: File): boolean => {
      if (selectedFile.size === 0) {
        toast({
          title: "Empty file",
          description: "The selected file is empty. Please choose a valid file.",
          variant: "destructive",
        });
        return false;
      }
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: "File too large",
          description: `File size must be under ${MAX_FILE_SIZE_MB} MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(1)} MB.`,
          variant: "destructive",
        });
        return false;
      }
      if (!ACCEPTED_TYPES.has(selectedFile.type)) {
        toast({
          title: "Unsupported file type",
          description:
            "Please upload a PDF, DOCX, JPG, JPEG, or PNG file.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    },
    [validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && validateFile(selectedFile)) {
        setFile(selectedFile);
      }
      // Reset input value so the same file can be re-selected after removal
      e.target.value = "";
    },
    [validateFile]
  );

  const removeFile = useCallback(() => {
    setFile(null);
    setAnalysisResult(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (analysisMethod === "url") {
      if (!fileUrl.trim()) return;
      // URL analysis placeholder — feature not yet implemented on the server
      toast({
        title: "Coming soon",
        description: "URL-based analysis is not yet supported.",
      });
      return;
    }

    if (analysisMethod === "text") {
      if (!pastedText.trim()) return;
    } else if (!file) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const formData = new FormData();

    if (analysisMethod === "text") {
      formData.append("text", pastedText);
    } else {
      formData.append("file", file!);
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ?? `Upload failed with status ${response.status}`
        );
      }

      toast({
        title: "Analysis complete",
        description: "Your medical report has been successfully analyzed.",
      });

      setAnalysisResult(result as AnalysisResult);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Analysis failed",
        description:
          error instanceof Error
            ? error.message
            : "There was a problem processing your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isSubmitDisabled =
    isAnalyzing ||
    (analysisMethod === "upload" ? !file : analysisMethod === "text" ? !pastedText.trim() : !fileUrl.trim());

  return (
    <>
      <Card className="max-w-2xl mx-auto mb-8 bg-white shadow-lg dark:bg-slate-900 dark:border-sky-800">
        <CardHeader>
          <CardTitle className="text-sky-700 dark:text-sky-300">
            Upload Your Medical Report
          </CardTitle>
          <CardDescription>
            Upload your medical report file or provide a URL for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <Tabs
              value={analysisMethod}
              onValueChange={(value) =>
                setAnalysisMethod(value as "url" | "upload" | "text")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-sky-100 dark:bg-sky-950">
                <TabsTrigger
                  value="upload"
                  className="data-[state=active]:bg-white data-[state=active]:text-sky-700 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-sky-300"
                >
                  Upload
                </TabsTrigger>
                <TabsTrigger
                  value="text"
                  className="data-[state=active]:bg-white data-[state=active]:text-sky-700 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-sky-300"
                >
                  Paste Text
                </TabsTrigger>
                <TabsTrigger
                  value="url"
                  className="data-[state=active]:bg-white data-[state=active]:text-sky-700 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-sky-300"
                >
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Click or drag and drop to upload a medical report file"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      document.getElementById("file-upload")?.click();
                    }
                  }}
                  className="border-2 border-dashed border-sky-200 dark:border-sky-800 rounded-lg p-8 text-center cursor-pointer transition-colors hover:bg-sky-50 dark:hover:bg-sky-950/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-sky-400"
                >
                  {file ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FileText
                        className="w-8 h-8 text-sky-600"
                        aria-hidden="true"
                      />
                      <span className="text-sky-700 dark:text-sky-300 font-medium truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        aria-label={`Remove ${file.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                      >
                        <X className="w-4 h-4 text-sky-700 dark:text-sky-300" aria-hidden="true" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload
                        className="w-8 h-8 mx-auto mb-4 text-sky-400"
                        aria-hidden="true"
                      />
                      <p className="text-base text-gray-700 font-medium flex flex-col">
                        Drag and drop files here, or click to select files.
                        <span className="text-gray-700">
                          You can upload a file up to {MAX_FILE_SIZE_MB} MB.
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                          Supported file types: PDF, DOCX, JPEG, PNG.
                        </span>
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    id="file-upload"
                    aria-label="File upload"
                    onChange={handleFileChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="text">
                <div className="space-y-2">
                  <textarea
                    placeholder="Paste your medical report text here..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    rows={8}
                    className="w-full rounded-lg border border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-700 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 resize-y min-h-[120px]"
                    aria-label="Pasted medical report text"
                  />
                  <p className="text-xs text-gray-500">
                    Paste the text content from your medical report for AI analysis.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="url">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter report URL"
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="flex-1 border-sky-200 dark:border-sky-800 focus:ring-sky-500 dark:focus:ring-sky-400 dark:bg-slate-800 dark:text-slate-100"
                    aria-label="Report URL"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <p className="text-sm text-gray-500 mt-2">
              For better analysis, please upload clear and high-quality files.
              Avoid blurry or incomplete documents.
            </p>

            <Button
              type="submit"
              className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white"
              disabled={isSubmitDisabled}
              aria-busy={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                  Analyze Report
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analysisResult && (
        <div className="max-w-2xl mx-auto mb-8">
          <ResultsCard analysisResult={analysisResult} />
        </div>
      )}
    </>
  );
}
