/* eslint-disable @typescript-eslint/no-unused-vars */
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

interface ParameterDetails {
  value: string;
  range: string;
}

interface ResultsCardProps {
  analysisResult?: {
    report?: {
      originalDocument: string;
      analysis: string;
    };
  };
}

export default function ResultsCard({ analysisResult }: ResultsCardProps) {
  // Parse medical parameters from the document
  const parseParameters = (doc: string): Record<string, ParameterDetails> => {
    const parameterRegex = /\|([^|]+)\|([^|]+)\|([^|]+)\|/g;
    const parameters: Record<string, ParameterDetails> = {};

    let match;
    while ((match = parameterRegex.exec(doc)) !== null) {
      const [, param, value, range] = match;
      if (param.trim() !== "Parameter" && param.trim() !== "---") {
        parameters[param.trim()] = {
          value: value.trim(),
          range: range.trim(),
        };
      }
    }

    return parameters;
  };

  // Determine parameter status
  const getParameterStatus = (value: string, range: string) => {
    const parseRange = (rangeStr: string) => {
      const matches = rangeStr.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
      return matches
        ? { min: parseFloat(matches[1]), max: parseFloat(matches[2]) }
        : null;
    };

    const numericValue = parseFloat(value);
    const rangeObj = parseRange(range);

    if (rangeObj) {
      if (numericValue < rangeObj.min) return "low";
      if (numericValue > rangeObj.max) return "high";
    }

    return "normal";
  };

  const originalDocument = analysisResult?.report?.originalDocument || "";
  const analysis = analysisResult?.report?.analysis || "";
  const medicalParameters = parseParameters(originalDocument);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <Card className="border-2 border-green-100 rounded-xl shadow-lg">
        <CardHeader className="bg-green-50 border-b-2 border-green-100 p-6">
          <div className="flex items-center space-x-4">
            <Stethoscope className="w-8 h-8 text-green-600" />
            <CardTitle className="text-2xl font-bold text-green-900">
              Medical Report Analysis
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Medical Parameters Section */}
          <section>
            <h2 className="text-xl font-semibold text-green-800 mb-6 flex items-center">
              <ClipboardList className="w-6 h-6 mr-3 text-green-600" />
              Key Health Indicators
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(medicalParameters).map(([param, details]) => {
                const status = getParameterStatus(details.value, details.range);
                const statusColors = {
                  low: "bg-blue-50 border-blue-200 text-blue-800",
                  normal: "bg-green-50 border-green-200 text-green-800",
                  high: "bg-red-50 border-red-200 text-red-800",
                };

                return (
                  <div
                    key={param}
                    className={`
                      ${statusColors[status]} 
                      p-4 rounded-lg border-2 flex justify-between items-center
                      transition-all duration-300 hover:shadow-md
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      {status === "low" && (
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                      )}
                      {status === "high" && (
                        <AlertCircle className="w-5 h-5 text-red-600" />
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

          <Separator className="my-6 bg-green-200" />

          {/* Detailed Analysis Section */}
          <section>
            <h2 className="text-xl font-semibold text-green-800 mb-6 flex items-center">
              <Heart className="w-6 h-6 mr-3 text-green-600" />
              Detailed Analysis
            </h2>
            <div className="prose prose-green max-w-full text-green-800 space-y-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ node, ...props }) => (
                    <h2
                      {...props}
                      className="text-lg font-semibold text-green-700 mt-4 mb-2 flex items-center"
                    >
                      <Info className="w-5 h-5 mr-2 text-green-600" />
                      {props.children}
                    </h2>
                  ),
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
