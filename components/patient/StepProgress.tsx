/**
 * StepProgress — animated dot indicator for multi-step forms.
 * Completed and current steps use the forest palette; upcoming steps are warm grey.
 */
interface StepProgressProps {
  totalSteps: number;
  currentStep: number;
}

export function StepProgress({ totalSteps, currentStep }: StepProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2.5 w-full py-4" aria-label={`Step ${currentStep} of ${totalSteps}`}>
      <span className="sr-only">
        Step {currentStep} of {totalSteps}
      </span>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div
            key={i}
            aria-hidden="true"
            className={[
              "rounded-full transition-all duration-300 ease-out",
              isCompleted
                ? // Completed steps — deep forest, standard size.
                  "w-2.5 h-2.5 bg-primary"
                : isCurrent
                  ? // Current step — muted forest, slightly larger with soft ring.
                    "w-3.5 h-3.5 bg-primary-muted shadow-[0_0_0_3px_rgba(58,125,102,0.2)]"
                  : // Upcoming steps — warm border color.
                    "w-2.5 h-2.5 bg-[#E5DFD8]",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
