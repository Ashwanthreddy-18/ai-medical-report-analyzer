"use client";

import React from "react";
import {
  Heart,
  AlertCircle,
  Stethoscope,
  ClipboardList,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface ParameterDetails {
  value: string;
  range: string;
}

type ParameterStatus = "low" | "normal" | "high";

interface ResultsCardProps {
  analysisResult: {
    report?: {
      originalDocument: string;
      analysis: string;
    };
  };
}

function parseParameters(doc: string): Record<string, ParameterDetails> {
  const parameterRegex = /\|([^|]+)\|([^|]+)\|([^|]+)\|/g;
  const parameters: Record<string, ParameterDetails> = {};

  let match: RegExpExecArray | null;
  while ((match = parameterRegex.exec(doc)) !== null) {
    const [, param, value, range] = match;
    const trimmedParam = param?.trim() ?? "";
    if (trimmedParam && trimmedParam !== "Parameter" && trimmedParam !== "---") {
      parameters[trimmedParam] = {
        value: value?.trim() ?? "",
        range: range?.trim() ?? "",
      };
    }
  }

  return parameters;
}

function getParameterStatus(value: string, range: string): ParameterStatus {
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) return "normal";

  const matches = range.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (!matches) return "normal";

  const min = parseFloat(matches[1]);
  const max = parseFloat(matches[2]);

  if (isNaN(min) || isNaN(max)) return "normal";
  if (numericValue < min) return "low";
  if (numericValue > max) return "high";
  return "normal";
}

const STATUS_STYLES: Record<ParameterStatus, string> = {
  low: "bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950 dark:border-sky-700 dark:text-sky-300",
  normal: "bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950 dark:border-sky-700 dark:text-sky-300",
  high: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-700 dark:text-red-300",
};

const markdownComponents: Components = {
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      className="text-lg font-semibold text-sky-700 mt-4 mb-2 flex items-center"
    >
      <Info className="w-5 h-5 mr-2 text-sky-600 shrink-0" aria-hidden="true" />
      {children}
    </h2>
  ),
};

export default function ResultsCard({ analysisResult }: ResultsCardProps) {
  const originalDocument = analysisResult?.report?.originalDocument ?? "";
  const analysis = analysisResult?.report?.analysis ?? "";
  const medicalParameters = parseParameters(originalDocument);
  const parameterEntries = Object.entries(medicalParameters);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <Card className="border-2 border-sky-100 rounded-xl shadow-lg dark:border-sky-800 dark:bg-slate-900">
        <CardHeader className="bg-sky-50 border-b-2 border-sky-100 p-6 dark:bg-sky-950/50 dark:border-sky-800">
          <div className="flex items-center space-x-4">
            <Stethoscope className="w-8 h-8 text-sky-600" aria-hidden="true" />
            <CardTitle className="text-2xl font-bold text-sky-900">
              Medical Report Analysis
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Key Health Indicators */}
          {parameterEntries.length > 0 && (
            <section aria-labelledby="health-indicators-heading">
              <h2
                id="health-indicators-heading"
                className="text-xl font-semibold text-sky-800 mb-6 flex items-center"
              >
                <ClipboardList
                  className="w-6 h-6 mr-3 text-sky-600"
                  aria-hidden="true"
                />
                Key Health Indicators
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {parameterEntries.map(([param, details]) => {
                  const status = getParameterStatus(
                    details.value,
                    details.range
                  );
                  return (
                    <div
                      key={param}
                      className={`${STATUS_STYLES[status]} p-4 rounded-lg border-2 flex justify-between items-center transition-all duration-300 hover:shadow-md`}
                    >
                      <div className="flex items-center space-x-3">
                        {(status === "low" || status === "high") && (
                          <AlertCircle
                            className={`w-5 h-5 ${status === "low" ? "text-sky-600" : "text-red-600"}`}
                            aria-label={`${status === "low" ? "Below" : "Above"} normal range`}
                          />
                        )}
                        <span className="font-medium">{param}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            status === "normal" ? "default" : "destructive"
                          }
                          className="text-sm font-medium"
                        >
                          {details.value}
                        </Badge>
                        <span className="text-xs opacity-70">
                          {details.range}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {parameterEntries.length > 0 && (
            <Separator className="my-6 bg-sky-200 dark:bg-sky-800" />
          )}

          {/* Detailed Analysis */}
          <section aria-labelledby="detailed-analysis-heading">
            <h2
              id="detailed-analysis-heading"
              className="text-xl font-semibold text-sky-800 mb-6 flex items-center"
            >
              <Heart
                className="w-6 h-6 mr-3 text-sky-600"
                aria-hidden="true"
              />
              Detailed Analysis
            </h2>
            {analysis ? (
              <div className="prose prose-sky dark:prose-invert max-w-full text-sky-800 dark:text-sky-300 space-y-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {analysis}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No analysis available. Please try uploading the report again.
              </p>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
