// src/components/common/WizardLayout.tsx
import React from "react";
import Button from "./Button";

interface WizardStep {
  title: string;
  component: React.ReactNode;
  hideNav?: boolean;        // hide all nav buttons
  hideNext?: boolean;       // hide only Next
  hideBack?: boolean;       // hide only Back
}

interface WizardLayoutProps {
  steps: WizardStep[];
  currentStep: number;
  goNext: () => void;
  goBack: () => void;
  navPosition?: "sticky" | "absolute" | "static";
}

export default function WizardLayout({ steps, currentStep, goNext, goBack, navPosition = "sticky" }: WizardLayoutProps) {
  const step = steps[currentStep];

  // Compute nav wrapper class
  const navClass = {
    sticky: "sticky bottom-0 z-10",
    absolute: "absolute bottom-0 left-0 right-0 z-10 border-t border-gray-200 dark:border-gray-700",
    static: "static",
  }[navPosition];

  // Calculate progress as a fraction
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto overflow-hidden">
      {/* Step Header */}
      <div className="sticky top-0 z-10">
        <div className="px-4">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {currentStep + 1}/{steps.length} - {step.title}
          </p>
          <div className="mt-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-0.5 rounded-full bg-green-600 dark:bg-green-300 transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {step.component}
      </div>

      {/* Navigation Buttons */}
      {!step.hideNav && (
        <div className={`${navClass} py-3 px-6 flex justify-between bg-white dark:bg-gray-900`}>
          {currentStep > 0 && !step.hideBack && (
            <Button
              label="Back"
              onClick={goBack}
              disabled={currentStep === 0}
              variant="secondary"
              className="min-w-[100px]"
              rounded="lg"
            />
          )}
          {currentStep < steps.length - 1 && !step.hideNext && (
            <Button
              label="Next"
              onClick={goNext}
              disabled={currentStep >= steps.length - 1}
              variant="primary"
              className="min-w-[100px]"
              rounded="lg"
            />
          )}
        </div>
      )}
    </div>
  );
}
