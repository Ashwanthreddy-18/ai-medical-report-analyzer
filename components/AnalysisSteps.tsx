import { FileUp, Search, Clipboard, Zap } from "lucide-react";

const steps = [
  { icon: FileUp, label: "Upload" },
  { icon: Search, label: "Analyze" },
  { icon: Clipboard, label: "Results" },
  { icon: Zap, label: "Action" },
] as const;

export default function AnalysisSteps() {
  return (
    <nav aria-label="Analysis process steps">
      <ol className="flex justify-center items-center w-full max-w-2xl">
        {steps.map((step, index) => (
          <li key={step.label} className="flex items-center">
            <div className="flex flex-col items-center mx-4">
              <div className="rounded-full bg-sky-100 p-3 mb-2 dark:bg-sky-900/60">
                <step.icon
                  className="w-6 h-6 text-sky-600 dark:text-sky-400"
                  aria-hidden="true"
                />
              </div>
              <span className="text-sm font-medium text-sky-700 dark:text-sky-300">
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className="h-0.5 w-full bg-sky-200 mx-2 dark:bg-sky-800"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
