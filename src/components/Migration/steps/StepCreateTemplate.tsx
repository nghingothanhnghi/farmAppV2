// components/Migration/steps/StepRawData.tsx
import TemplateCreator from "../components/TemplateCreator";

export default function StepCreateTemplate({
  goNext,
  goBack,
}: {
  goNext?: () => void;
  goBack?: () => void;
}) {
  return (
    <TemplateCreator
      onTemplateCreated={goNext}
      goBack={goBack}   // 🟢 forward goBack
    />
  );
}
