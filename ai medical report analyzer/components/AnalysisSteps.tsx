import { FileUp, Search, Clipboard, Zap } from "lucide-react";

const steps = [
  { icon: FileUp, label: "Upload" },
  { icon: Search, label: "Analyze" },
  { icon: Clipboard, label: "Results" },
  { icon: Zap, label: "Action" },
];

export default function AnalysisSteps() {
  return (
    <div className="flex justify-center items-center w-full max-w-2xl">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center">
          <div className="flex flex-col items-center mx-4">
            <div className="rounded-full bg-green-100 p-3 mb-2">
              <step.icon className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-700">
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="h-0.5 w-full bg-green-200 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}
