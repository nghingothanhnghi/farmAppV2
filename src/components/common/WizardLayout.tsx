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
}

export default function WizardLayout({ steps, currentStep, goNext, goBack }: WizardLayoutProps) {
  const step = steps[currentStep];

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto overflow-hidden">
      {/* Step Header */}
      <div className="sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex-1 text-center py-2 px-1 text-sm font-medium transition ${i === currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
            >
              {s.title}
              <div className={`h-1 mt-1 transition-all ${i <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>
          ))}
        </div>
      </div>
      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {step.component}
      </div>

      {/* Navigation Buttons */}
      {!step.hideNav && (
        <div className="sticky bottom-0 z-10 py-3 px-6 flex justify-between">
          {currentStep > 0 && !step.hideBack && (
            <Button
              label="Back"
              onClick={goBack}
              disabled={currentStep === 0}
              variant="secondary"
              className="min-w-[100px]"
            />
          )}
          {currentStep < steps.length - 1 && !step.hideNext && (
            <Button
              label="Next"
              onClick={goNext}
              disabled={currentStep >= steps.length - 1}
              variant="primary"
              className="min-w-[100px]"
            />
          )}
        </div>
      )}
    </div>
  );
}
